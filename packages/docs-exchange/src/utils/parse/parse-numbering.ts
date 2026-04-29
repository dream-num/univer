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

import type { ParsedNumberingDef, ParsedNumberingLevel } from './types';
import { parsePPr } from './parse-paragraph-style';
import { findChild, findChildren, nodeAttrs, nodeName, xmlParser } from './xml';

// TODO(unsupported): w:lvlJc (level text alignment), w:pPr inherit override per level,
//   w:isLgl (legal numbering format), w:lvlRestart (restart on higher level change)

const CHECKBOX_GLYPHS = new Set(['☐', '☑', '☒', '□', '■']);
const CHECKBOX_FONTS = new Set(['wingdings', 'symbol']);

interface RawLevel extends ParsedNumberingLevel {
    fontFamily?: string;
}

function parseLevels(absNum: Record<string, unknown>): RawLevel[] {
    const out: RawLevel[] = [];
    for (const lvl of findChildren(absNum, 'w:lvl')) {
        const ilvl = Number(nodeAttrs(lvl)['@_w:ilvl'] ?? '0');
        const fmtNode = findChild(lvl, 'w:numFmt');
        const textNode = findChild(lvl, 'w:lvlText');
        const startNode = findChild(lvl, 'w:start');
        const rPr = findChild(lvl, 'w:rPr');
        const rFonts = rPr ? findChild(rPr, 'w:rFonts') : undefined;
        const fontFamily = rFonts ? (nodeAttrs(rFonts)['@_w:ascii'] ?? '').toLowerCase() : undefined;
        const lvlPPr = findChild(lvl, 'w:pPr');
        const lvlStyle = parsePPr(lvlPPr);
        const raw: RawLevel = {
            ilvl: Number.isNaN(ilvl) ? 0 : ilvl,
            format: fmtNode ? (nodeAttrs(fmtNode)['@_w:val'] ?? 'decimal') : 'decimal',
            text: textNode ? (nodeAttrs(textNode)['@_w:val'] ?? '') : '',
            start: startNode ? Number(nodeAttrs(startNode)['@_w:val'] ?? '1') : 1,
            fontFamily,
        };
        if (lvlStyle?.indentStart) raw.indentStart = lvlStyle.indentStart;
        if (lvlStyle?.hanging) raw.hanging = lvlStyle.hanging;
        if (lvlStyle?.indentFirstLine) raw.indentFirstLine = lvlStyle.indentFirstLine;
        out.push(raw);
    }
    return out;
}

function deriveListType(levels: RawLevel[]): {
    listType: 'ORDER_LIST' | 'BULLET_LIST' | 'CHECK_LIST';
    isCheckbox: boolean;
} {
    const lvl0 = levels[0];
    if (lvl0 && lvl0.format === 'bullet') {
        const isCheckbox =
            CHECKBOX_GLYPHS.has(lvl0.text) || (lvl0.fontFamily ? CHECKBOX_FONTS.has(lvl0.fontFamily) : false);
        if (isCheckbox) return { listType: 'CHECK_LIST', isCheckbox: true };
        return { listType: 'BULLET_LIST', isCheckbox: false };
    }
    return { listType: 'ORDER_LIST', isCheckbox: false };
}

export function parseNumbering(numberingXml: string | undefined): Map<string, ParsedNumberingDef> {
    const result = new Map<string, ParsedNumberingDef>();
    if (!numberingXml) return result;

    let parsed: Array<Record<string, unknown>>;
    try {
        parsed = xmlParser.parse(numberingXml) as Array<Record<string, unknown>>;
    } catch {
        return result;
    }

    const root = parsed.find((n) => nodeName(n) === 'w:numbering');
    if (!root) return result;

    const abstractMap = new Map<string, RawLevel[]>();
    for (const absNum of findChildren(root, 'w:abstractNum')) {
        const id = nodeAttrs(absNum)['@_w:abstractNumId'] ?? '';
        abstractMap.set(id, parseLevels(absNum));
    }

    for (const num of findChildren(root, 'w:num')) {
        const numId = nodeAttrs(num)['@_w:numId'] ?? '';
        const absRef = findChild(num, 'w:abstractNumId');
        const absId = absRef ? (nodeAttrs(absRef)['@_w:val'] ?? '') : '';
        const rawLevels = abstractMap.get(absId) ?? [];
        const { listType, isCheckbox } = deriveListType(rawLevels);
        const levels: ParsedNumberingLevel[] = rawLevels.map(({ ilvl, format, text, start, indentStart, hanging, indentFirstLine }) => {
            const lvl: ParsedNumberingLevel = { ilvl, format, text, start };
            if (indentStart) lvl.indentStart = indentStart;
            if (hanging) lvl.hanging = hanging;
            if (indentFirstLine) lvl.indentFirstLine = indentFirstLine;
            return lvl;
        });
        result.set(numId, { numId, abstractNumId: absId, levels, isCheckbox, listType });
    }

    return result;
}
