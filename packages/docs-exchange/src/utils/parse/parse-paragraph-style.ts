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

import type { ParsedParagraphStyle } from './types';
import type { XmlNode } from './xml';
import { dxaToPx, ptToPx } from '../units';
import { findChild, nodeAttrs, nodeChildren, nodeName } from './xml';

const ALIGN_MAP: Record<string, number> = {
    start: 1,
    left: 1,
    center: 2,
    end: 3,
    right: 3,
    both: 5,
    justify: 5,
    distribute: 6,
};

/**
 * Tab-stop alignment: w:val on <w:tab> → Univer TabStopAlignment.
 * START=1, CENTER=2, END=3, UNSPECIFIED=0. The "clear" value is handled
 * separately (it removes a tab inherited from pStyle).
 *
 * TODO(unsupported): w:val="decimal" / "bar" / "num" — Univer's enum has no
 * matches; we map them to START so the position is at least preserved.
 */
const TAB_ALIGN_MAP: Record<string, number> = {
    start: 1,
    left: 1,
    center: 2,
    end: 3,
    right: 3,
    decimal: 1,
    bar: 1,
    num: 1,
};

const HEADING_MAP: Record<string, number> = {
    Title: 2,
    Subtitle: 3,
    Heading1: 4,
    Heading2: 5,
    Heading3: 6,
    Heading4: 7,
    Heading5: 8,
};

const BORDER_DASH_MAP: Record<string, number> = {
    single: 1,
    dotted: 2,
    dashed: 3,
};

// Fallback color for `<w:bottom>` / `<w:top>` etc. when w:color is missing
// or set to "auto". The renderer requires a concrete `color.rgb` and would
// crash on `border.color.rgb` otherwise. Black is the closest match to how
// Word resolves "automatic" on a white page.
const DEFAULT_BORDER_COLOR_RGB = '#000000';

function parseBorder(b: Record<string, unknown>): NonNullable<ParsedParagraphStyle['borderBottom']> {
    const a = nodeAttrs(b);
    const out: NonNullable<ParsedParagraphStyle['borderBottom']> = {};
  // ECMA-376: w:color="auto" means "use theme/automatic color". The renderer
  // doesn't resolve theme colors and crashes on `border.color.rgb` when color
  // is unset, so we always emit a concrete color: an explicit hex when given,
  // otherwise DEFAULT_BORDER_COLOR_RGB. Black matches how Word resolves
  // "automatic" on a white page.
    const colorAttr = a['@_w:color'] as string | undefined;
    if (colorAttr && colorAttr !== 'auto') out.color = { rgb: `#${colorAttr.toUpperCase()}` };
    else out.color = { rgb: DEFAULT_BORDER_COLOR_RGB };
    const sz = Number(a['@_w:sz']);
    if (!Number.isNaN(sz)) out.width = Math.max(1, Math.round(sz / 6));
    const valAttr = a['@_w:val'] as string | undefined;
    out.dashStyle = (valAttr && BORDER_DASH_MAP[valAttr]) || 1;
    const space = Number(a['@_w:space']);
    if (!Number.isNaN(space)) out.padding = space;
    return out;
}

/**
 * Convert OOXML w:spacing attrs to Univer's lineSpacing/spacingRule pair.
 *
 *   w:lineRule=auto    → multiplier (w:line / 240). 240 = single, 360 = 1.5x, 480 = 2x.
 *   w:lineRule=atLeast → CSS px (w:line / 15), spacingRule = AT_LEAST (1).
 *   w:lineRule=exact   → CSS px (w:line / 15), spacingRule = EXACT (2).
 *   default lineRule when omitted is "auto" per ECMA-376.
 *
 * Univer's spaceAbove/spaceBelow and EXACT/AT_LEAST lineSpacing are in CSS px
 * at 96 DPI, not pt. dxa → px is `dxa / 20 / 0.75 = dxa / 15`.
 *
 * w:beforeLines / w:afterLines are in 1/100 of a line. Without a known
 * line height we approximate 1 line ≈ 16px (Word's default 12pt body line).
 * dxa values (w:before/w:after) win when both are present.
 */
function parseSpacingInto(spacing: XmlNode, out: ParsedParagraphStyle): void {
    const a = nodeAttrs(spacing);
    if (a['@_w:before'] !== undefined) {
        const before = Number(a['@_w:before']);
        if (!Number.isNaN(before)) out.spaceAbove = { v: dxaToPx(before) };
    } else if (a['@_w:beforeLines'] !== undefined) {
        const beforeLines = Number(a['@_w:beforeLines']);
        if (!Number.isNaN(beforeLines)) out.spaceAbove = { v: (beforeLines / 100) * 16 };
    }
    if (a['@_w:after'] !== undefined) {
        const after = Number(a['@_w:after']);
        if (!Number.isNaN(after)) out.spaceBelow = { v: dxaToPx(after) };
    } else if (a['@_w:afterLines'] !== undefined) {
        const afterLines = Number(a['@_w:afterLines']);
        if (!Number.isNaN(afterLines)) out.spaceBelow = { v: (afterLines / 100) * 16 };
    }
    const line = Number(a['@_w:line']);
    if (!Number.isNaN(line)) {
        const rule = (a['@_w:lineRule'] as string | undefined) ?? 'auto';
        if (rule === 'auto') {
            out.lineSpacing = line / 240;
            out.spacingRule = 0; // AUTO
        } else if (rule === 'atLeast') {
            out.lineSpacing = dxaToPx(line);
            out.spacingRule = 1; // AT_LEAST
        } else if (rule === 'exact') {
            out.lineSpacing = dxaToPx(line);
            out.spacingRule = 2; // EXACT
        }
    }
}

/**
 * w:ind attrs. dxa variants (w:left/w:right/w:start/w:end/w:firstLine/w:hanging) are in 20ths of a point.
 * The *Chars suffix variants are in 1/100 of a character; we approximate using 10.5pt
 * (Word's "小四" / common body size) per character when there's no font-size context.
 *
 * Char-suffixed attrs WIN over dxa per ECMA-376 §17.3.1.12 — Word writes both for
 * round-tripping but consumers should honor the chars value.
 *
 * w:firstLine / w:hanging zero handling:
 *   - Explicit w:firstLineChars="0" / w:hangingChars="0" is a user-meaningful "clear inherited"
 *     signal (typical pattern: a "List Paragraph" pStyle inherits firstLine="420", and each list
 *     paragraph writes firstLineChars="0" to neutralize it). Forward {v:0} so the inheritance
 *     gets overridden downstream.
 *   - Tiny dxa values without a chars override (w:hanging="1" → 0.05pt) are Word's
 *     round-tripping artifacts — they have no user meaning. Drop them so they don't
 *     accidentally override numbering / parent styles.
 *
 * Hanging-indent semantics translation (Word → Univer):
 *   In OOXML, w:left is the position of subsequent (non-first) lines and w:hanging is how
 *   far the first line is pulled LEFT of that position (the bullet/number sits in that
 *   hung area). Univer's IIndentStart inverts this: indentStart is the first-line position
 *   and engine-render adds `hanging` BACK for subsequent lines. So when both w:left and
 *   w:hanging are present we emit indentStart = left − hanging, hanging = w:hanging.
 *   Without w:hanging, w:left maps directly to indentStart.
 */
const CHAR_TO_PT = 10.5;
const DXA_ARTIFACT_EPSILON_PT = 0.5;

function parseIndentInto(ind: XmlNode, out: ParsedParagraphStyle): void {
    const a = nodeAttrs(ind);
  // Univer's INumberUnit.v on indent fields is CSS px (see ../../UNITS.md).
  // - dxa attrs: px = dxa / 15
  // - *Chars attrs: chars × CHAR_TO_PT × 96/72 = chars × CHAR_TO_PT / 0.75 px
    const pickPx = (charsAttr: string | undefined, dxaAttr: string | undefined): number | undefined => {
        if (charsAttr !== undefined) {
            const n = Number(charsAttr);
            if (!Number.isNaN(n)) return ptToPx((n / 100) * CHAR_TO_PT);
        }
        if (dxaAttr !== undefined) {
            const n = Number(dxaAttr);
            if (!Number.isNaN(n)) return dxaToPx(n);
        }
        return undefined;
    };
  // Artifact threshold: w:hanging="1" → 0.05pt = 0.067px (round-tripping noise).
    const dropArtifact = (charsAttr: string | undefined, valuePx: number): boolean =>
        charsAttr === undefined && Math.abs(valuePx) < ptToPx(DXA_ARTIFACT_EPSILON_PT);

    const startPx = pickPx(
        (a['@_w:leftChars'] as string | undefined) ?? (a['@_w:startChars'] as string | undefined),
        (a['@_w:left'] as string | undefined) ?? (a['@_w:start'] as string | undefined)
    );

    const endPx = pickPx(
        (a['@_w:rightChars'] as string | undefined) ?? (a['@_w:endChars'] as string | undefined),
        (a['@_w:right'] as string | undefined) ?? (a['@_w:end'] as string | undefined)
    );
    if (endPx !== undefined) out.indentEnd = { v: endPx };

    const firstLineChars = a['@_w:firstLineChars'] as string | undefined;
    const firstLinePx = pickPx(firstLineChars, a['@_w:firstLine'] as string | undefined);
    if (firstLinePx !== undefined && !dropArtifact(firstLineChars, firstLinePx)) {
        out.indentFirstLine = { v: firstLinePx };
    }

    const hangingChars = a['@_w:hangingChars'] as string | undefined;
    const hangingPxRaw = pickPx(hangingChars, a['@_w:hanging'] as string | undefined);
    const hangingPx =
        hangingPxRaw !== undefined && !dropArtifact(hangingChars, hangingPxRaw) ? hangingPxRaw : undefined;
    if (hangingPx !== undefined) out.hanging = { v: hangingPx };

    if (startPx !== undefined) {
        out.indentStart = { v: hangingPx !== undefined ? startPx - hangingPx : startPx };
    }
}

/** Parse an inline or named-style w:pPr node into ParsedParagraphStyle. */
/**
 * Parse a <w:tabs> block. Each <w:tab> entry has w:val + w:pos (dxa).
 * - w:val="clear" → record the position in tabStopsClear; the merge step
 *   removes it from inherited pStyle tabs.
 * - other values → emit a tabStop with px-converted offset and alignment.
 *
 * Inline tabs do NOT replace pStyle tabs wholesale; both apply, with `clear`
 * entries pruning inherited positions (ECMA-376 §17.3.1.38). The actual
 * per-position merge happens in parse-paragraph.mergePPr — here we just collect.
 */
function parseTabsInto(tabs: XmlNode, out: ParsedParagraphStyle): void {
    const stops: NonNullable<ParsedParagraphStyle['tabStops']> = [];
    const cleared: number[] = [];
    for (const t of nodeChildren(tabs)) {
        if (nodeName(t) !== 'w:tab') continue;
        const a = nodeAttrs(t);
        const pos = Number(a['@_w:pos']);
        if (Number.isNaN(pos)) continue;
        const offset = dxaToPx(pos);
        const val = a['@_w:val'] as string | undefined;
        if (val === 'clear') {
            cleared.push(offset);
            continue;
        }
        const alignment = (val && TAB_ALIGN_MAP[val]) || 1;
        stops.push({ offset, alignment });
    }
    if (stops.length > 0) out.tabStops = stops;
    if (cleared.length > 0) out.tabStopsClear = cleared;
}

export function parsePPr(pPr: XmlNode | undefined): ParsedParagraphStyle | undefined {
    if (!pPr) return undefined;
    const out: ParsedParagraphStyle = {};

    for (const child of nodeChildren(pPr)) {
        const name = nodeName(child);
        if (name === 'w:jc') {
            const v = nodeAttrs(child)['@_w:val'] as string | undefined;
            if (v && v in ALIGN_MAP) out.horizontalAlign = ALIGN_MAP[v];
        } else if (name === 'w:pStyle') {
            const v = nodeAttrs(child)['@_w:val'] as string | undefined;
            if (v && v in HEADING_MAP) out.namedStyleType = HEADING_MAP[v];
        } else if (name === 'w:spacing') {
            parseSpacingInto(child, out);
        } else if (name === 'w:ind') {
            parseIndentInto(child, out);
        } else if (name === 'w:pBdr') {
            for (const b of nodeChildren(child)) {
                const bn = nodeName(b);
                if (bn === 'w:bottom') out.borderBottom = parseBorder(b);
                else if (bn === 'w:top') out.borderTop = parseBorder(b);
            }
        } else if (name === 'w:tabs') {
            parseTabsInto(child, out);
        }
    }

    return Object.keys(out).length > 0 ? out : undefined;
}

/** Read the w:pStyle styleId reference from a w:pPr (used for inheritance lookup). */
export function pPrStyleRef(pPr: XmlNode | undefined): string | undefined {
    if (!pPr) return undefined;
    for (const child of nodeChildren(pPr)) {
        if (nodeName(child) === 'w:pStyle') {
            return nodeAttrs(child)['@_w:val'] as string | undefined;
        }
    }
    return undefined;
}

/** Backwards-compatible: extract w:pPr from a w:p node and parse it. */
export function parseParagraphStyle(pNode: Record<string, unknown>): ParsedParagraphStyle | undefined {
    const pPr = findChild(pNode, 'w:pPr');
    return parsePPr(pPr);
}
