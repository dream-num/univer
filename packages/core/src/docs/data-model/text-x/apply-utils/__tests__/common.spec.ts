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

import type { IDocumentBody, ISdtCustomRange } from '../../../../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import { CustomRangeType } from '../../../../../types/interfaces/i-document-data';
import { deleteCustomRanges, insertCustomRanges, mergeContinuousRanges } from '../common';

describe('overlapping bookmark identity', () => {
    it('merges each bookmark independently of interleaved overlapping ranges', () => {
        const ranges = [0, 4].flatMap((startIndex) => ['a', 'b'].map((rangeId) => ({
            rangeId,
            startIndex,
            endIndex: startIndex + 3,
            rangeType: CustomRangeType.BOOKMARK,
            properties: { bookmarkId: rangeId },
        })));
        expect(mergeContinuousRanges(ranges)).toEqual(['a', 'b'].map((rangeId) => ({
            rangeId,
            startIndex: 0,
            endIndex: 7,
            rangeType: CustomRangeType.BOOKMARK,
            properties: { bookmarkId: rangeId },
        })));
    });

    it('keeps an enclosing bookmark intact when inserting and deleting text inside it', () => {
        const bookmark = { rangeId: 'bookmark', startIndex: 0, endIndex: 7, rangeType: CustomRangeType.BOOKMARK, properties: { bookmarkId: 'target' } };
        const body: IDocumentBody = { dataStream: 'abcdefgh', customRanges: [{ ...bookmark }] };
        insertCustomRanges(body, { dataStream: 'XY' }, 2, 4);
        expect(body.customRanges).toEqual([{ ...bookmark, endIndex: 9 }]);
        deleteCustomRanges(body, 2, 4);
        expect(body.customRanges).toEqual([bookmark]);
    });
});

function sdt(rangeId: string, startIndex: number, endIndex: number): ISdtCustomRange {
    return { rangeId, startIndex, endIndex, rangeType: CustomRangeType.SDT, properties: { kind: 'richText', placement: 'block' } };
}

describe('SDT nesting through text changes', () => {
    it('retains child-before-parent order when deletion gives a child the same bounds as its parent', () => {
        const body: IDocumentBody = { dataStream: 'A\rB\r\n', customRanges: [
            sdt('first', 0, 0),
            sdt('parent', 0, 2),
            sdt('last', 2, 2),
        ] };
        deleteCustomRanges(body, 2, 0);
        expect(body.customRanges?.map((range) => range.rangeId)).toEqual(['last', 'parent']);
        expect(body.customRanges?.map(({ startIndex, endIndex }) => [startIndex, endIndex])).toEqual([[0, 0], [0, 0]]);
    });

    it('restores the source nesting order when an inserted child precedes a retained parent fragment', () => {
        const body: IDocumentBody = { dataStream: 'B\r\n', customRanges: [sdt('last', 0, 0), sdt('parent', 0, 0)] };
        insertCustomRanges(body, { dataStream: 'A\r', customRanges: [sdt('first', 0, 0), sdt('parent', 0, 1)] }, 2, 0);
        expect(body.customRanges?.map((range) => range.rangeId)).toEqual(['first', 'parent', 'last']);
        expect(body.customRanges?.find((range) => range.rangeId === 'parent')).toMatchObject({ startIndex: 0, endIndex: 2 });
    });
});
