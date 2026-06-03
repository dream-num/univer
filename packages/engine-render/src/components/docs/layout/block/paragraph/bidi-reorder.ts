/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDocumentSkeletonDivide, IDocumentSkeletonGlyph, IDocumentSkeletonLine } from '../../../../../basics/i-document-skeleton-cached';
import { TextDirection } from '@univerjs/core';
// `bidi-js` ships without bundled `.d.ts` typings, so we declare a minimal
// surface inline. This keeps every consumer of `engine-render` (which still
// imports the source path through `package.json#main`) typecheck-clean
// without forcing a workspace-wide `@types/bidi-js` install.

// @ts-ignore -- no types shipped with bidi-js
import bidiFactory from 'bidi-js';

// Lazily create the bidi runtime once per process. `bidiFactory()` returns a
// self-contained object with `getEmbeddingLevels`, `getReorderedIndices`,
// `getReorderSegments`, `getMirroredCharactersMap`, etc.
let _bidi: ReturnType<typeof bidiFactory> | null = null;
function getBidi() {
    if (_bidi == null) {
        _bidi = bidiFactory();
    }
    return _bidi;
}

/**
 * Re-layout every glyph in the divide by walking them in **visual order**
 * (as resolved by UAX#9 L2) and assigning cumulative `left` values, while
 * keeping the underlying `glyphGroup` array in **logical order**.
 *
 * Why this is the right shape:
 *  - **W3C / UAX#9 L1+L2 fidelity.** Once `bidi-js` resolves embedding
 *    levels, the spec says "reorder the line by applying the reverse
 *    operation, from the highest level down to level 0+1". The net result
 *    is a single visual permutation of the line. Re-flowing positions for
 *    `every` glyph in that permutation (not just the ones inside a reorder
 *    segment) is the only way to keep neighbours visually adjacent across
 *    LTR↔RTL boundaries — otherwise the trailing/middle whitespace, the
 *    paragraph break, and any other "neutral" glyph that bidi didn't put
 *    into a segment keeps its original LTR cursor position and looks like
 *    a hole in the middle of the line.
 *  - **Logical array order stays put.** Renderers walk `glyphGroup` and
 *    use each `glyph.left` to position — they don't depend on array order.
 *    Caret / selection / hit-test code (`_findNodeByIndex` in
 *    `DocumentSkeleton`) walks `glyphGroup` in array order and
 *    accumulates `glyph.count` to map a *logical* char offset → glyph.
 *    Physically reversing the array would break that mapping for any RTL
 *    run, so the caret would snap to the wrong end and inserts would
 *    appear on the wrong side.
 *
 * @param glyphGroup The glyphs in logical order (mutated in place).
 * @param visualOrder Array of glyph indices in visual (left-to-right)
 *                    order. Every glyph in `[0, glyphGroup.length)` must
 *                    appear exactly once.
 */
function relayoutGlyphsByVisualOrder(
    glyphGroup: IDocumentSkeletonGlyph[],
    visualOrder: number[]
): void {
    if (visualOrder.length === 0) return;

    // Use the original divide-relative cursor (smallest `left`) as the
    // anchor so we don't drift the divide's outer rect. `glyph.left` is
    // already in divide-local coordinates; the smallest of them is the
    // divide's left edge for this run of glyphs.
    let cursor = Infinity;
    for (let i = 0; i < glyphGroup.length; i++) {
        if (glyphGroup[i].left < cursor) cursor = glyphGroup[i].left;
    }
    if (!Number.isFinite(cursor)) cursor = 0;

    for (const gi of visualOrder) {
        const glyph = glyphGroup[gi];
        if (!glyph) continue;
        glyph.left = cursor;
        cursor += glyph.width;
    }
}

/**
 * Build the text content of a divide by concatenating each glyph's raw/content
 * string. The mapping is index-to-glyph: `glyphIndexAt[i]` gives the glyph
 * index in `divide.glyphGroup` that contributes the character at string offset
 * `i`. This is needed because bidi-js operates on UTF-16 code units while we
 * operate on glyphs.
 */
function buildDivideText(divide: IDocumentSkeletonDivide): {
    text: string;
    glyphIndexAt: number[];
} {
    let text = '';
    const glyphIndexAt: number[] = [];
    for (let i = 0; i < divide.glyphGroup.length; i++) {
        const glyph = divide.glyphGroup[i];
        const piece = glyph.content || glyph.raw || '';
        for (let c = 0; c < piece.length; c++) {
            text += piece[c];
            glyphIndexAt.push(i);
        }
    }
    return { text, glyphIndexAt };
}

/**
 * Apply Unicode bidirectional reordering to every divide in `line`, mutating
 * the glyph order and their `left` offsets so the divide renders correctly
 * when the renderer simply walks `glyphGroup` left-to-right.
 *
 * - For LTR paragraphs we still run bidi: an embedded Hebrew/Arabic run inside
 *   English text must visually reverse, even though the paragraph baseline is
 *   LTR. (Bidi-js auto-detects per paragraph when no explicit direction is
 *   passed.)
 * - For RTL paragraphs we pass `'rtl'` so an all-LTR run still resolves at
 *   level 1 and gets reversed correctly.
 */
export function applyBidiReorderToLine(
    line: IDocumentSkeletonLine,
    direction?: TextDirection
): void {
    if (line.divides.length === 0) return;

    const explicitDir =
        direction === TextDirection.RIGHT_TO_LEFT
            ? 'rtl'
            : direction === TextDirection.LEFT_TO_RIGHT
                ? 'ltr'
                : undefined;

    const bidi = getBidi();

    for (const divide of line.divides) {
        if (divide.glyphGroup.length === 0) {
            continue;
        }

        const { text, glyphIndexAt } = buildDivideText(divide);

        // Default every glyph's bidi level to the line's baseline so callers
        // (caret / selection) don't see stale `undefined` for glyphs that
        // weren't part of any reorder segment. `explicitDir==='rtl' ⇒ 1`,
        // everything else defaults to 0 (LTR).
        const baselineLevel = explicitDir === 'rtl' ? 1 : 0;
        for (const glyph of divide.glyphGroup) {
            glyph.bidiLevel = baselineLevel;
        }

        if (text.length < 2) {
            continue;
        }

        // Fast path: pure LTR ASCII/CJK runs never need reordering. We still
        // assign the baseline level above so caret code can rely on it.
        if (explicitDir !== 'rtl' && !hasBidiCandidate(text)) {
            continue;
        }

        const embeddingLevels = bidi.getEmbeddingLevels(text, explicitDir);

        // Stamp the resolved bidi level onto each glyph. We take the level
        // of the *first* code unit that maps to this glyph; mixed-direction
        // single glyphs are rare (the renderer keeps a glyph per code point
        // for bidi-relevant scripts), and the first code unit is what
        // bidi-js uses for its own segment boundaries anyway.
        const levels = embeddingLevels.levels;
        const seenForLevel = new Set<number>();
        for (let i = 0; i < glyphIndexAt.length; i++) {
            const gi = glyphIndexAt[i];
            if (seenForLevel.has(gi)) continue;
            seenForLevel.add(gi);
            const glyph = divide.glyphGroup[gi];
            if (glyph) glyph.bidiLevel = levels[i];
        }

        // Ask bidi-js for the full L2 visual permutation (character-level).
        // It returns an array of *character indices* in visual left-to-right
        // order. We then translate to glyph indices, dedup (multi-codepoint
        // glyphs map several chars to one glyph), and re-flow every glyph
        // — see `relayoutGlyphsByVisualOrder` for why "every" matters.
        const visualCharOrder = bidi.getReorderedIndices(text, embeddingLevels);
        const visualGlyphOrder: number[] = [];
        const seenGlyph = new Set<number>();
        for (let i = 0; i < visualCharOrder.length; i++) {
            const ci = visualCharOrder[i];
            if (ci < 0 || ci >= glyphIndexAt.length) continue;
            const gi = glyphIndexAt[ci];
            if (gi == null || seenGlyph.has(gi)) continue;
            seenGlyph.add(gi);
            visualGlyphOrder.push(gi);
        }

        // Defensive: if some glyphs weren't covered by `glyphIndexAt`
        // (shouldn't happen but be robust to future content shapes),
        // append them in logical order so they aren't dropped.
        if (visualGlyphOrder.length < divide.glyphGroup.length) {
            for (let i = 0; i < divide.glyphGroup.length; i++) {
                if (!seenGlyph.has(i)) {
                    seenGlyph.add(i);
                    visualGlyphOrder.push(i);
                }
            }
        }

        relayoutGlyphsByVisualOrder(divide.glyphGroup, visualGlyphOrder);
    }
}

// Cheap heuristic: any character above U+0590 might be a bidi-relevant
// character (Hebrew starts at U+0590, Arabic at U+0600, etc.). Avoids running
// the bidi algorithm on the common case of pure Latin/CJK text.
function hasBidiCandidate(text: string): boolean {
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code >= 0x0590 && code <= 0x08FF) return true; // Hebrew/Arabic/Syriac
        if (code >= 0xFB1D && code <= 0xFDFF) return true; // Hebrew/Arabic presentation forms A
        if (code >= 0xFE70 && code <= 0xFEFF) return true; // Arabic presentation forms B
    }
    return false;
}
