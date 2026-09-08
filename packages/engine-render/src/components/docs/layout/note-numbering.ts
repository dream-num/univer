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

import type { DocumentNoteType, IDocumentData, IFootnoteProperties, ISectionBreak } from '@univerjs/core';
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

export interface INoteLayoutProperties extends Omit<IFootnoteProperties, 'position'> {
    position?: 'pageBottom' | 'beneathText' | 'docEnd' | 'sectEnd';
}

export interface INoteReferenceLayout {
    noteId: string;
    type: DocumentNoteType;
    referenceIndex: number;
    sectionId: string;
    label: string;
    number?: number;
    properties: INoteLayoutProperties;
}

export function formatNoteNumber(number: number, format = 'decimal'): string {
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
/** Cell section sentinels cannot own document-level note numbering or placement. */
export function getNoteSections(snapshot: Pick<IDocumentData, 'body'>): ISectionBreak[] {
    const sections = snapshot.body?.sectionBreaks ?? [];
    const tables = [...snapshot.body?.tables ?? []].sort((a, b) => a.startIndex - b.startIndex);
    let tableIndex = 0;
    let tableEnd = -1;
    return sections.filter((section) => {
        while (tableIndex < tables.length && tables[tableIndex].startIndex <= section.startIndex) {
            tableEnd = Math.max(tableEnd, tables[tableIndex++].endIndex);
        }
        return section.startIndex > tableEnd;
    });
}

export function resolveNoteReferences(
    snapshot: Pick<IDocumentData, 'body' | 'notes' | 'noteSettings'>,
    referencePages: ReadonlyMap<string, number> = new Map()
): Map<number, INoteReferenceLayout> {
    const references = snapshot.body?.customRanges?.filter((range) => (range.rangeType === CustomRangeType.FOOTNOTE || range.rangeType === CustomRangeType.ENDNOTE)) ?? [];
    const sections = getNoteSections(snapshot);
    const result = new Map<number, INoteReferenceLayout>();
    let sectionIndex = 0;
    const counters = new Map<DocumentNoteType, { sectionId: string; page?: number; nextNumber: number }>();
    for (const reference of references) {
        const noteId = reference.properties?.noteId;
        if (typeof noteId !== 'string' || !snapshot.notes?.[noteId]) {
            continue;
        }
        while (sectionIndex < sections.length - 1 && sections[sectionIndex].startIndex < reference.startIndex) {
            sectionIndex++;
        }
        const section = sections[sectionIndex];
        const note = snapshot.notes[noteId];
        const type = note.type;
        const properties: INoteLayoutProperties = { ...snapshot.noteSettings?.[type], ...section?.noteProperties?.[type] };
        const sectionId = section?.sectionId ?? '';
        const page = referencePages.get(noteId);
        const previous = counters.get(type);
        let nextNumber = previous?.nextNumber;
        if (nextNumber == null || (properties.restart === 'eachSect' && previous?.sectionId !== sectionId) ||
            (properties.restart === 'eachPage' && page != null && previous?.page !== page)) {
            nextNumber = properties.startNumber ?? 1;
        }
        const number = note.customMark == null ? nextNumber : undefined;
        const label = note.customMark ?? formatNoteNumber(nextNumber, properties.numberFormat ?? (type === 'endnote' ? 'lowerRoman' : 'decimal'));
        result.set(reference.startIndex, { noteId, type, referenceIndex: reference.startIndex, sectionId, properties, number, label });
        if (number != null) {
            nextNumber++;
        }
        counters.set(type, { sectionId, page, nextNumber });
    }
    return result;
}
