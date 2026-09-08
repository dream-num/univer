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

import type { IDocumentData, IFootnoteProperties } from '@univerjs/core';
import { CustomRangeType, ListGlyphType } from '@univerjs/core';
import { getBulletOrderedSymbol } from './block/paragraph/bullet-ruler';

const NUMBER_FORMATS: Record<string, ListGlyphType> = {
    decimal: ListGlyphType.DECIMAL,
    decimalZero: ListGlyphType.DECIMAL_ZERO,
    upperLetter: ListGlyphType.UPPER_LETTER,
    lowerLetter: ListGlyphType.LOWER_LETTER,
    upperRoman: ListGlyphType.UPPER_ROMAN,
    lowerRoman: ListGlyphType.LOWER_ROMAN,
    chineseCounting: ListGlyphType.CHINESE_COUNTING,
};

export interface IFootnoteReferenceLayout {
    footnoteId: string;
    referenceIndex: number;
    sectionId: string;
    label: string;
    number?: number;
    properties: IFootnoteProperties;
}

export function formatFootnoteNumber(number: number, format = 'decimal'): string {
    if (format === 'none') {
        return '';
    }
    if (format === 'chicago') {
        const symbols = ['*', '†', '‡', '§', '‖', '¶'];
        const index = Math.max(0, number - 1);
        return symbols[index % symbols.length].repeat(Math.floor(index / symbols.length) + 1);
    }
    if (format === 'decimalEnclosedCircle') {
        if (number === 0) {
            return '⓪';
        }
        if (number >= 1 && number <= 20) {
            return String.fromCodePoint(0x2460 + number - 1);
        }
        if (number >= 21 && number <= 35) {
            return String.fromCodePoint(0x3251 + number - 21);
        }
        if (number >= 36 && number <= 50) {
            return String.fromCodePoint(0x32B1 + number - 36);
        }
    }
    if (format === 'ideographEnclosedCircle' && number >= 1 && number <= 10) {
        return String.fromCodePoint(0x3220 + number - 1);
    }
    if (format === 'ideographTraditional' || format === 'ideographZodiac') {
        const alphabet = format === 'ideographTraditional' ? '甲乙丙丁戊己庚辛壬癸' : '子丑寅卯辰巳午未申酉戌亥';
        if (number >= 1 && number <= alphabet.length) {
            return alphabet[number - 1];
        }
    }
    if (format === 'chineseLegalSimplified') {
        const standard = getBulletOrderedSymbol(0, number, ListGlyphType.CHINESE_COUNTING);
        const digits = '零一二三四五六七八九十百千';
        const legal = '零壹贰叁肆伍陆柒捌玖拾佰仟';
        const result = standard.replace(/[零一二三四五六七八九十百千]/g, (digit) => legal[digits.indexOf(digit)]);
        return result.startsWith('拾') ? `壹${result}` : result;
    }
    if (format === 'decimalFullWidth' || format === 'decimalFullWidth2') {
        return String(number).replace(/\d/g, (digit) => String.fromCharCode(0xFF10 + Number(digit)));
    }
    if (format === 'ideographDigital' || format === 'taiwaneseDigital') {
        return String(number).replace(/\d/g, (digit) => '〇一二三四五六七八九'[Number(digit)]);
    }
    return getBulletOrderedSymbol(0, number, NUMBER_FORMATS[format] ?? ListGlyphType.DECIMAL);
}

/** Page keys are physical page indices, independent of the printed page-number format. */
export function resolveFootnoteReferences(
    snapshot: Pick<IDocumentData, 'body' | 'footnotes' | 'footnoteSettings'>,
    referencePages: ReadonlyMap<string, number> = new Map()
): Map<number, IFootnoteReferenceLayout> {
    const references = snapshot.body?.customRanges?.filter((range) => range.rangeType === CustomRangeType.FOOTNOTE) ?? [];
    const sections = snapshot.body?.sectionBreaks ?? [];
    const result = new Map<number, IFootnoteReferenceLayout>();
    let sectionIndex = 0;
    let previousSectionId: string | undefined;
    let previousPage: number | undefined;
    let nextNumber: number | undefined;
    for (const reference of references) {
        const footnoteId = reference.properties?.footnoteId;
        if (typeof footnoteId !== 'string' || !snapshot.footnotes?.[footnoteId]) {
            continue;
        }
        while (sectionIndex < sections.length - 1 && sections[sectionIndex].startIndex < reference.startIndex) {
            sectionIndex++;
        }
        const section = sections[sectionIndex];
        const mergedProperties = { ...snapshot.footnoteSettings, ...section?.footnoteProperties };
        const properties: IFootnoteProperties = {
            position: mergedProperties.position,
            numberFormat: mergedProperties.numberFormat,
            startNumber: mergedProperties.startNumber,
            restart: mergedProperties.restart,
            columnCount: mergedProperties.columnCount,
        };
        const sectionId = section?.sectionId ?? '';
        const page = referencePages.get(footnoteId);
        const note = snapshot.footnotes[footnoteId];
        if (nextNumber == null || (properties.restart === 'eachSect' && previousSectionId !== sectionId) ||
            (properties.restart === 'eachPage' && page != null && previousPage !== page)) {
            nextNumber = properties.startNumber ?? 1;
        }
        const number = note.customMark == null ? nextNumber : undefined;
        const label = note.customMark ?? formatFootnoteNumber(nextNumber, properties.numberFormat);
        result.set(reference.startIndex, { footnoteId, referenceIndex: reference.startIndex, sectionId, properties, number, label });
        if (number != null) {
            nextNumber++;
        }
        previousSectionId = sectionId;
        previousPage = page;
    }
    return result;
}
