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

import type { ICustomRange } from '@univerjs/core';
import { BooleanNumber, CustomRangeType } from '@univerjs/core';
import { expect, it } from 'vitest';
import type { IDocumentSkeletonGlyph } from '../../../../basics/i-document-skeleton-cached';
import { resolveHeaderFooterFieldGlyph } from '../header-footer-field';

it('resolves numeric fields without changing cached glyphs and preserves pending values', () => {
    const glyph = { content: '1' } as IDocumentSkeletonGlyph;
    const pageRange: ICustomRange = { rangeId: 'page', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 2, properties: { fieldType: 'PAGE' } };
    const pageCountRange = { ...pageRange, properties: { fieldType: 'NUMPAGES' } };
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [pageRange], 15, 16).content).toBe('15');
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [pageCountRange], 15, 16).content).toBe('16');
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [pageCountRange], 15, undefined)).toBe(glyph);
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [{ ...pageRange, properties: { fieldType: 'PAGE', locked: BooleanNumber.TRUE } }], 15, 16).content).toBe('15');
    expect(glyph.content).toBe('1');
});

it.each<[string, number, string]>([
    ['lowerRoman', 6, 'vi'],
    ['upperRoman', 16, 'XVI'],
    ['lowerLetter', 28, 'bb'],
    ['upperLetter', 28, 'BB'],
    ['decimalZero', 6, '06'],
])('uses section page format %s (%d)', (format, number, expected) => {
    const glyph = { content: 'cached' } as IDocumentSkeletonGlyph;
    const range: ICustomRange = { rangeId: 'page', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 7, properties: { fieldType: 'PAGE' } };
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 6, [range], number, 2, format).content).toBe(expected);
    expect(glyph.content).toBe('cached');
});

it.each<[string, string]>([
    ['PAGE \\*ARABIC', '6'],
    ['PAGE \\*ROMAN', 'VI'],
    ['PAGE \\*roman', 'vi'],
    ['PAGE \\*roman \\*ARABIC', '6'],
    ['PAGE \\*ARABIC \\*roman', 'vi'],
    ['PAGE \\*"roman"', 'vi'],
    ['PAGE \\*roman \\*Upper', 'VI'],
    ['PAGE \\*ROMAN \\*Lower', 'vi'],
    ['NUMPAGES \\*roman', 'ii'],
])('matches Word explicit page format %s', (instruction, expected) => {
    const glyph = { content: 'cached' } as IDocumentSkeletonGlyph;
    const range: ICustomRange = { rangeId: 'field', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 7, properties: { fieldType: instruction.split(' ')[0], instruction } };
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 6, [range], 6, 2, 'upperLetter').content).toBe(expected);
    expect(resolveHeaderFooterFieldGlyph(glyph, 2, 2, [range], 6, 2, 'upperLetter').content).toBe('');
});

it('keeps locked numeric page fields live and preserves other locked fields', () => {
    const glyph = { content: 'LOCKED' } as IDocumentSkeletonGlyph;
    for (const [fieldType, expected] of [['PAGE', 'vi'], ['NUMPAGES', '2'], ['REF', 'LOCKED']]) {
        const range: ICustomRange = { rangeId: 'field', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 7, properties: { fieldType, locked: BooleanNumber.TRUE } };
        expect(resolveHeaderFooterFieldGlyph(glyph, 1, 6, [range], 6, 2, 'lowerRoman').content).toBe(expected);
    }
});
