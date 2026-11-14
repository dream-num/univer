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

import { describe, expect, it } from 'vitest';
import type { IDocumentBody, ISdtCustomRange } from '../../../../../types/interfaces';
import { UpdateDocsAttributeType } from '../../../../../shared';
import { CustomRangeType } from '../../../../../types/interfaces';
import { updateAttribute } from '../update-apply';

describe('retained SDT metadata boundaries', () => {
    it('restores child-before-parent order when a retained parent shrinks onto its child', () => {
        const child: ISdtCustomRange = {
            rangeId: 'child',
            rangeType: CustomRangeType.SDT,
            startIndex: 0,
            endIndex: 0,
            properties: { kind: 'repeatingSectionItem', placement: 'block' },
        };
        const parent: ISdtCustomRange = {
            ...child,
            rangeId: 'parent',
            endIndex: 4,
            properties: { kind: 'repeatingSection', placement: 'block' },
        };
        const body: IDocumentBody = { dataStream: 'A\rA\rB\r\n', customRanges: [child, parent] };
        updateAttribute(body, {
            dataStream: '',
            customRanges: [child, { ...parent, endIndex: 0 }],
        }, 2, 0, UpdateDocsAttributeType.REPLACE);
        expect(body.customRanges?.map((range) => range.rangeId)).toEqual(['child', 'parent']);
        expect(body.customRanges?.map((range) => range.endIndex)).toEqual([0, 0]);
    });

    it.each([
        { name: 'keeps both clipped edges', offset: 2, length: 3, start: 0, end: 2, expectedStart: 0, expectedEnd: 8 },
        { name: 'restores an explicit end before the retain edge', offset: 0, length: 5, start: 0, end: 2, expectedStart: 0, expectedEnd: 2 },
        { name: 'restores an explicit start after the retain edge', offset: 2, length: 7, start: 2, end: 6, expectedStart: 4, expectedEnd: 8 },
    ])('$name', ({ offset, length, start, end, expectedStart, expectedEnd }) => {
        const range: ISdtCustomRange = {
            rangeId: 'sdt',
            rangeType: CustomRangeType.SDT,
            startIndex: 0,
            endIndex: 8,
            properties: { kind: 'repeatingSection', placement: 'block', alias: 'before' },
        };
        const body: IDocumentBody = { dataStream: '123456789\r\n', customRanges: [range] };
        updateAttribute(body, {
            dataStream: '',
            customRanges: [{ ...range, startIndex: start, endIndex: end, properties: { ...range.properties, alias: 'after' } }],
        }, length, offset, UpdateDocsAttributeType.REPLACE);

        expect(body.customRanges).toHaveLength(1);
        expect(body.customRanges![0]).toMatchObject({
            rangeId: 'sdt',
            startIndex: expectedStart,
            endIndex: expectedEnd,
            properties: { alias: 'after' },
        });
    });
});

describe('retained heading collapse metadata', () => {
    it.each([true, false])('preserves the fold flag through paragraph formatting (%s)', (headingCollapsed) => {
        const body: IDocumentBody = { dataStream: 'A\rB\r\n', paragraphs: [
            { paragraphId: 'a', startIndex: 1, headingCollapsed, styleId: 'heading-style' },
            { paragraphId: 'b', startIndex: 3 },
        ] };
        updateAttribute(body, {
            dataStream: '',
            paragraphs: [{ paragraphId: 'a', startIndex: 0, paragraphStyle: { outlineLevel: 0 } }],
        }, 1, 1, UpdateDocsAttributeType.COVER);
        expect(body.paragraphs?.[0].headingCollapsed).toBe(headingCollapsed);
        expect(body.paragraphs?.[0].styleId).toBe('heading-style');
        expect(body.paragraphs?.[0].paragraphStyle?.outlineLevel).toBe(0);
        expect(body.paragraphs?.[1].headingCollapsed).toBeUndefined();
    });
});

describe('retained text inside a hyperlink', () => {
    const linkedBody = (): IDocumentBody => ({
        dataStream: 'abcdef\rghij\r\n',
        paragraphs: [{ startIndex: 6, paragraphId: 'p1' }, { startIndex: 11, paragraphId: 'p2' }],
        customRanges: [{ rangeId: 'link', rangeType: CustomRangeType.HYPERLINK, startIndex: 3, endIndex: 8, properties: { url: 'https://example.test' } }],
    });

    it.each<{ name: string; updateBody: IDocumentBody; length: number; offset: number }>([
        { name: 'a text style', updateBody: { dataStream: '', textRuns: [{ st: 0, ed: 2, ts: { bl: 1 } }] }, length: 2, offset: 4 },
        { name: 'a paragraph style', updateBody: { dataStream: '', paragraphs: [{ startIndex: 0, paragraphId: 'p1', paragraphStyle: { indentStart: { v: 10 } } }] }, length: 1, offset: 6 },
    ])('keeps the link whole after $name', ({ updateBody, length, offset }) => {
        const body = linkedBody();
        updateAttribute(body, updateBody, length, offset, UpdateDocsAttributeType.COVER);
        expect(body.customRanges?.map(({ rangeId, startIndex, endIndex }) => [rangeId, startIndex, endIndex])).toEqual([['link', 3, 8]]);
    });
});
