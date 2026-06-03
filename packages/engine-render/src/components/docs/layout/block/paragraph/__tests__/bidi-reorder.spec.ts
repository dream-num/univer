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

import type { IDocumentSkeletonDivide, IDocumentSkeletonGlyph, IDocumentSkeletonLine } from '../../../../../../basics/i-document-skeleton-cached';
import { TextDirection } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import { applyBidiReorderToLine } from '../bidi-reorder';

function glyph(content: string, width = 10): IDocumentSkeletonGlyph {
    return {
        content,
        raw: content,
        width,
        left: 0,
        xOffset: 0,
        count: 1,
    } as unknown as IDocumentSkeletonGlyph;
}

function makeLine(contents: string[], width = 10): IDocumentSkeletonLine {
    const glyphs = contents.map((c) => glyph(c, width));
    let cursor = 0;
    for (const g of glyphs) {
        g.left = cursor;
        cursor += g.width;
    }
    const divide: IDocumentSkeletonDivide = {
        glyphGroup: glyphs,
        width: 1000,
        left: 0,
        paddingLeft: 0,
        isFull: false,
        st: 0,
        ed: glyphs.length - 1,
        glyphGroupWidth: cursor,
    } as unknown as IDocumentSkeletonDivide;
    return {
        divides: [divide],
    } as unknown as IDocumentSkeletonLine;
}

describe('applyBidiReorderToLine', () => {
    it('leaves pure-LTR text untouched', () => {
        const line = makeLine(['h', 'e', 'l', 'l', 'o']);
        applyBidiReorderToLine(line, TextDirection.LEFT_TO_RIGHT);
        expect(line.divides[0].glyphGroup.map((g) => g.content).join('')).toBe('hello');
        expect(line.divides[0].glyphGroup.map((g) => g.left)).toEqual([0, 10, 20, 30, 40]);
    });

    it('places RTL glyphs visually reversed while preserving logical array order', () => {
        // Logical order in the array must stay ש ל ו ם so that the caret /
        // hit-test code (which walks the array logically and accumulates
        // `glyph.count`) keeps working. Visual order is encoded purely in
        // each glyph's `left` value.
        const line = makeLine(['ש', 'ל', 'ו', 'ם']);
        applyBidiReorderToLine(line, TextDirection.RIGHT_TO_LEFT);

        // Array order: unchanged (logical).
        expect(line.divides[0].glyphGroup.map((g) => g.content).join('')).toBe('שלום');

        // Visual positions: logical-first glyph (ש) sits at the right edge,
        // logical-last glyph (ם) sits at the left edge. So when the renderer
        // walks the array and uses each `glyph.left`, the on-screen sequence
        // (sorted by `left`) reads ם ו ל ש.
        const glyphs = line.divides[0].glyphGroup;
        expect(glyphs[0].left).toBe(30); // ש → right
        expect(glyphs[1].left).toBe(20);
        expect(glyphs[2].left).toBe(10);
        expect(glyphs[3].left).toBe(0); // ם → left

        // Sorting by `left` yields visual reading order.
        const visual = [...glyphs].sort((a, b) => a.left - b.left).map((g) => g.content).join('');
        expect(visual).toBe('םולש');
    });

    it('reverses only the embedded Hebrew run inside an LTR baseline', () => {
        // Logical: H i   ש ל ו ם   !  → bidi should reverse only the Hebrew.
        const line = makeLine(['H', 'i', ' ', 'ש', 'ל', 'ו', 'ם', ' ', '!']);
        applyBidiReorderToLine(line);

        // Logical array order preserved.
        const arrayOrder = line.divides[0].glyphGroup.map((g) => g.content).join('');
        expect(arrayOrder).toBe('Hi שלום !');

        // Visual reading order (sorted by left) reverses the Hebrew run.
        const visual = [...line.divides[0].glyphGroup]
            .sort((a, b) => a.left - b.left)
            .map((g) => g.content)
            .join('');
        expect(visual).toBe('Hi םולש !');
    });

    it('handles a line with a single glyph as a no-op', () => {
        const line = makeLine(['א']);
        applyBidiReorderToLine(line, TextDirection.RIGHT_TO_LEFT);
        expect(line.divides[0].glyphGroup.length).toBe(1);
        expect(line.divides[0].glyphGroup[0].content).toBe('א');
        expect(line.divides[0].glyphGroup[0].left).toBe(0);
    });

    it('stamps per-glyph bidi level so caret code can detect direction at script boundaries', () => {
        // "Hello كتاب" on an LTR baseline. The Latin glyphs should resolve
        // to level 0 (LTR), the Arabic glyphs to level 1 (RTL). Spaces
        // between them are neutrals that inherit from the surrounding run.
        const line = makeLine(['H', 'e', 'l', 'l', 'o', ' ', 'ك', 'ت', 'ا', 'ب']);
        applyBidiReorderToLine(line);

        const glyphs = line.divides[0].glyphGroup;
        // Latin run → even levels.
        expect((glyphs[0].bidiLevel ?? 0) % 2).toBe(0);
        expect((glyphs[4].bidiLevel ?? 0) % 2).toBe(0);
        // Arabic run → odd levels.
        expect((glyphs[6].bidiLevel ?? 0) % 2).toBe(1);
        expect((glyphs[9].bidiLevel ?? 0) % 2).toBe(1);
    });

    it('stamps baseline level on every glyph when no bidi candidates are present', () => {
        const line = makeLine(['a', 'b', 'c']);
        applyBidiReorderToLine(line, TextDirection.LEFT_TO_RIGHT);
        for (const g of line.divides[0].glyphGroup) {
            expect(g.bidiLevel).toBe(0);
        }
    });

    it('keeps total glyph extent invariant after reordering', () => {
        const line = makeLine(['ש', 'ל', 'ו', 'ם'], 12);
        const totalWidth = line.divides[0].glyphGroup.reduce((s, g) => s + g.width, 0);
        applyBidiReorderToLine(line, TextDirection.RIGHT_TO_LEFT);
        // The visual span [min left, max left + width] still covers the
        // original extent.
        const lefts = line.divides[0].glyphGroup.map((g) => g.left);
        const maxRight = Math.max(...line.divides[0].glyphGroup.map((g) => g.left + g.width));
        expect(Math.min(...lefts)).toBe(0);
        expect(maxRight).toBe(totalWidth);
    });

    it('places every glyph visually adjacent in mixed runs (no holes)', () => {
        // Regression: previously only the glyphs inside a `getReorderSegments`
        // range were re-flowed. Neutrals/whitespace/`\r` outside any segment
        // kept their original LTR-cursor `left`, leaving a hole in the middle
        // of the line. After switching to the L2 visual permutation
        // (`getReorderedIndices`) every glyph must end up with a `left` that
        // exactly equals its left neighbour's `left + width`.
        const contents = ['H', 'e', 'l', 'l', 'o', ' ', 'ك', 'ت', 'ا', 'ب', ' ', 'H', 'i', '\r'];
        const line = makeLine(contents);
        applyBidiReorderToLine(line);

        const sorted = [...line.divides[0].glyphGroup].sort((a, b) => a.left - b.left);
        for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].left).toBe(sorted[i - 1].left + sorted[i - 1].width);
        }
        // First glyph (visually leftmost) starts at the divide's left edge.
        expect(sorted[0].left).toBe(0);
    });

    it('produces a visual order that matches the W3C UAX#9 sample (Hebrew embedded in English)', () => {
        // "car means CAR." with CAR being Hebrew (here using actual Hebrew
        // letters so bidi-js does the work). The W3C bidi sample says the
        // visual reading order is "car means RAC." — i.e. the Hebrew run
        // reverses while the English text stays put.
        const contents = ['c', 'a', 'r', ' ', 'm', 'e', 'a', 'n', 's', ' ', 'ק', 'ר', 'מ', '.'];
        const line = makeLine(contents);
        applyBidiReorderToLine(line);

        const visual = [...line.divides[0].glyphGroup]
            .sort((a, b) => a.left - b.left)
            .map((g) => g.content)
            .join('');
        // Hebrew chars reverse, the trailing "." (neutral after RTL) flows
        // back onto the LTR baseline at the visual end.
        expect(visual).toBe('car means מרק.');
    });
});
