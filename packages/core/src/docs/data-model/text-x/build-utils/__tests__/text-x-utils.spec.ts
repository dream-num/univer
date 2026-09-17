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
import { CustomRangeType } from '../../../../../types/interfaces/i-document-data';
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
