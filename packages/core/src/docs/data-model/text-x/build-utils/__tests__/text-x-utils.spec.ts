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

import type { IDocumentBody } from '../../../../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import { CustomRangeType, DocumentFlavor } from '../../../../../types/interfaces/i-document-data';
import { TextX } from '../../text-x';
import { deleteSelectionTextX } from '../text-x-utils';

describe('deleteSelectionTextX structural expansion', () => {
    it.each([0, 3])('preserves an unrelated blank bookmark when deleting character %i', (startOffset) => {
        const body: IDocumentBody = {
            dataStream: 'A\r\rB\r\n',
            paragraphs: [1, 2, 4].map((startIndex) => ({ startIndex, paragraphId: `p-${startIndex}` })),
            sectionBreaks: [{ startIndex: 5, sectionId: 'body' }],
            customRanges: [{ startIndex: 2, endIndex: 2, rangeId: 'blank-bookmark', rangeType: CustomRangeType.BOOKMARK }],
        };
        const expected = body.dataStream.slice(0, startOffset) + body.dataStream.slice(startOffset + 1);
        const actions = deleteSelectionTextX([{ startOffset, endOffset: startOffset + 1, collapsed: false }], body);
        TextX.apply(body, actions);
        expect(body.dataStream).toBe(expected);
        expect(body.paragraphs?.map((paragraph) => paragraph.paragraphId)).toEqual(['p-1', 'p-2', 'p-4']);
        expect(body.customRanges?.map((range) => range.rangeId)).toEqual(['blank-bookmark']);
    });

    it('still deletes an explicitly selected blank bookmark paragraph', () => {
        const body: IDocumentBody = {
            dataStream: 'A\r\rB\r\n',
            paragraphs: [1, 2, 4].map((startIndex) => ({ startIndex, paragraphId: `p-${startIndex}` })),
            sectionBreaks: [{ startIndex: 5, sectionId: 'body' }],
            customRanges: [{ startIndex: 2, endIndex: 2, rangeId: 'blank-bookmark', rangeType: CustomRangeType.BOOKMARK }],
        };
        TextX.apply(body, deleteSelectionTextX([{ startOffset: 2, endOffset: 3, collapsed: false }], body));
        expect(body.dataStream).toBe('A\rB\r\n');
        expect(body.customRanges).toHaveLength(0);
    });
});

describe('empty paragraph formatting', () => {
    function createListBody(): IDocumentBody {
        return {
            dataStream: 'R\rGB\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'red' },
                { startIndex: 4, paragraphId: 'green', bullet: { listId: 'list', listType: 'BULLET_LIST', nestingLevel: 0 } },
            ],
            textRuns: [
                { st: 0, ed: 2, ts: { cl: { rgb: '#ff0000' } } },
                { st: 2, ed: 3, ts: { cl: { rgb: '#008000' }, fs: 20 } },
                { st: 3, ed: 4, ts: { cl: { rgb: '#0000ff' }, fs: 16 } },
                { st: 4, ed: 5, ts: { cl: { rgb: '#ff0000' }, bl: 1 } },
            ],
        };
    }

    it.each([false, true])('keeps the first character format on the surviving modern paragraph mark (list: %s)', (isList) => {
        const body = createListBody();
        if (!isList) {
            delete body.paragraphs![1].bullet;
        }
        TextX.apply(body, deleteSelectionTextX([{ startOffset: 2, endOffset: 4, collapsed: false }], body, 0, null, false, DocumentFlavor.MODERN));
        expect(body.dataStream).toBe('R\r\r\n');
        expect(body.textRuns?.find((run) => run.st <= 2 && run.ed > 2)?.ts).toEqual({ cl: { rgb: '#008000' }, fs: 20 });
        expect(body.textRuns?.every((run) => run.ed > run.st)).toBe(true);
        expect(body.paragraphs?.[1].bullet).toEqual(isList ? { listId: 'list', listType: 'BULLET_LIST', nestingLevel: 0 } : undefined);
    });

    it.each(['traditional', 'partial deletion', 'replacement'])('preserves the existing mark for %s', (scenario) => {
        const body = createListBody();
        const endOffset = scenario === 'partial deletion' ? 3 : 4;
        const insertBody = scenario === 'replacement' ? { dataStream: 'X' } : null;
        TextX.apply(body, deleteSelectionTextX(
            [{ startOffset: 2, endOffset, collapsed: false }],
            body,
            0,
            insertBody,
            false,
            scenario === 'traditional' ? DocumentFlavor.TRADITIONAL : DocumentFlavor.MODERN
        ));
        const mark = body.paragraphs![1].startIndex;
        expect(body.textRuns?.find((run) => run.st <= mark && run.ed > mark)?.ts).toEqual({ cl: { rgb: '#ff0000' }, bl: 1 });
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('restores paragraph identity when undoing deletion in %s', (flavor) => {
        const body = createListBody();
        const before = JSON.parse(JSON.stringify(body));
        const actions = TextX.makeInvertible(deleteSelectionTextX([{ startOffset: 2, endOffset: 4, collapsed: false }], body, 0, null, true, flavor), body);
        TextX.apply(body, actions);
        TextX.apply(body, TextX.invert(actions));
        expect(body).toMatchObject(before);
    });

    it('preserves explicit marker and paragraph-mark styles', () => {
        const body = createListBody();
        body.paragraphs![1].bullet!.textStyle = { cl: { rgb: '#0000ff' } };
        body.paragraphs![1].paragraphStyle = { paragraphMarkTextStyle: { cl: { rgb: '#800080' } } };
        TextX.apply(body, deleteSelectionTextX([{ startOffset: 2, endOffset: 4, collapsed: false }], body, 0, null, true, DocumentFlavor.MODERN));
        expect(body.paragraphs![1].bullet?.textStyle).toEqual({ cl: { rgb: '#0000ff' } });
        expect(body.paragraphs![1].paragraphStyle?.paragraphMarkTextStyle).toEqual({ cl: { rgb: '#800080' } });
        expect(body.textRuns?.find((run) => run.st <= 2 && run.ed > 2)?.ts).toEqual({ cl: { rgb: '#ff0000' }, bl: 1 });
    });
});
