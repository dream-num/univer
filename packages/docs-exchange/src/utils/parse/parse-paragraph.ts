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

import type { DrawingInfo } from './parse-drawing';
import type { StylesIndex } from './parse-styles';
import type { ThemeFonts } from './parse-theme';
import type { ParsedBullet, ParsedParagraph, ParsedParagraphStyle } from './types';
import { parsePPr, pPrStyleRef } from './parse-paragraph-style';
import { parseRunsFromPNode } from './parse-run';
import { findChild, nodeAttrs } from './xml';

function parseBullet(pNode: Record<string, unknown>): ParsedBullet | undefined {
    const pPr = findChild(pNode, 'w:pPr');
    if (!pPr) return undefined;
    const numPr = findChild(pPr, 'w:numPr');
    if (!numPr) return undefined;
    const numId = findChild(numPr, 'w:numId');
    const ilvl = findChild(numPr, 'w:ilvl');
    const numIdVal = numId ? nodeAttrs(numId)['@_w:val'] : undefined;
    if (!numIdVal) return undefined;
  // numId="0" in DOCX means "no list" (explicitly suppress inherited list)
    if (numIdVal === '0') return undefined;
    const ilvlVal = ilvl ? Number(nodeAttrs(ilvl)['@_w:val'] ?? '0') : 0;
    return { numId: numIdVal, ilvl: Number.isNaN(ilvlVal) ? 0 : ilvlVal };
}

function mergePPr(
    parent: ParsedParagraphStyle | undefined,
    child: ParsedParagraphStyle | undefined
): ParsedParagraphStyle | undefined {
    if (!parent) return child;
    if (!child) return parent;
  // Tab stops merge per-position rather than wholesale (ECMA-376 §17.3.1.38):
  // child's `tabStopsClear` removes inherited positions, child's `tabStops`
  // adds/overrides at its own positions. We dedupe by exact px offset.
    const merged: ParsedParagraphStyle = { ...parent, ...child };
    if (parent.tabStops || child.tabStops || child.tabStopsClear) {
        const cleared = new Set(child.tabStopsClear ?? []);
        const byOffset = new Map<number, { offset: number; alignment: number }>();
        for (const stop of parent.tabStops ?? []) {
            if (!cleared.has(stop.offset)) byOffset.set(stop.offset, stop);
        }
        for (const stop of child.tabStops ?? []) {
            byOffset.set(stop.offset, stop); // child wins at same position
        }
        const finalStops = [...byOffset.values()].sort((a, b) => a.offset - b.offset);
        if (finalStops.length > 0) merged.tabStops = finalStops;
        else delete merged.tabStops;
        delete merged.tabStopsClear;
    }
    return merged;
}

export function parseParagraph(
    pNode: Record<string, unknown>,
    drawingsOut?: Map<string, DrawingInfo>,
    styles?: StylesIndex,
    themeFonts?: ThemeFonts
): ParsedParagraph {
    const pPr = findChild(pNode, 'w:pPr');

  // Resolve paragraph-style chain: docDefaults pPr → pStyle pPr → inline pPr.
    const styleRef = pPrStyleRef(pPr);
    const resolved = styles?.resolvePStyle(styleRef);
    const inline = parsePPr(pPr);
    let style = mergePPr(styles?.docDefaults.pPr, resolved?.pPr);
    style = mergePPr(style, inline);

  // Paragraph's named-style rPr/rFonts seed every run (so default font flows in).
    const pStyleRpr = resolved?.rPr;
    const pStyleRFonts = resolved?.rFonts;

    const out: ParsedParagraph = {
        runs: parseRunsFromPNode(pNode, drawingsOut, styles, pStyleRpr, themeFonts, pStyleRFonts),
    };
    if (style) out.style = style;
    const bullet = parseBullet(pNode);
    if (bullet) out.bullet = bullet;
    return out;
}
