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
import { DataStreamTreeTokenType } from '../../../types';
import {
    containsInteriorInsertionOffset,
    containsStreamIndex,
    getBlockRangeInterval,
    getColumnGroupRangeInterval,
    getCustomBlockInterval,
    getCustomRangeInterval,
    getTableCellTokenInterval,
    getTableRangeInterval,
    getTableRowTokenInterval,
    intersectsOperationalIntervals,
    shiftExclusiveRangeOnDelete,
    shiftExclusiveRangeOnInsert,
    shiftInclusiveRangeOnDelete,
    shiftInclusiveRangeOnInsert,
} from '../range-interval';

describe('document operational intervals', () => {
    it('normalizes persisted range conventions to half-open intervals', () => {
        expect(getTableRangeInterval({ startIndex: 2, endIndex: 8 })).toEqual({ startOffset: 2, endOffset: 8 });
        expect(getBlockRangeInterval({ startIndex: 2, endIndex: 8 })).toEqual({ startOffset: 2, endOffset: 9 });
        expect(getColumnGroupRangeInterval({ startIndex: 2, endIndex: 8 })).toEqual({ startOffset: 2, endOffset: 9 });
        expect(getCustomRangeInterval({ startIndex: 2, endIndex: 8 })).toEqual({ startOffset: 2, endOffset: 9 });
        expect(getCustomBlockInterval({ startIndex: 2 })).toEqual({ startOffset: 2, endOffset: 3 });
    });

    it('keeps stream indexes and boundary insertion points distinct', () => {
        const interval = { startOffset: 2, endOffset: 8 };

        expect(containsStreamIndex(interval, 2)).toBe(true);
        expect(containsStreamIndex(interval, 7)).toBe(true);
        expect(containsStreamIndex(interval, 8)).toBe(false);
        expect(containsInteriorInsertionOffset(interval, 2)).toBe(false);
        expect(containsInteriorInsertionOffset(interval, 3)).toBe(true);
        expect(containsInteriorInsertionOffset(interval, 8)).toBe(false);
    });

    it('uses half-open overlap semantics for adjacent structures', () => {
        expect(intersectsOperationalIntervals(
            { startOffset: 0, endOffset: 4 },
            { startOffset: 4, endOffset: 8 }
        )).toBe(false);
        expect(intersectsOperationalIntervals(
            { startOffset: 0, endOffset: 5 },
            { startOffset: 4, endOffset: 8 }
        )).toBe(true);
    });

    it('applies insertion affinity according to persisted range semantics', () => {
        const inclusive = { startIndex: 2, endIndex: 5, id: 'inclusive' };
        const exclusive = { startIndex: 2, endIndex: 6, id: 'exclusive' };

        expect(shiftInclusiveRangeOnInsert(inclusive, 5, 2)).toEqual({ ...inclusive, endIndex: 7 });
        expect(shiftInclusiveRangeOnInsert(inclusive, 6, 2)).toBe(inclusive);
        expect(shiftExclusiveRangeOnInsert(exclusive, 5, 2)).toEqual({ ...exclusive, endIndex: 8 });
        expect(shiftExclusiveRangeOnInsert(exclusive, 6, 2)).toBe(exclusive);
    });

    it('removes or shrinks ranges using their persisted end convention', () => {
        const inclusive = { startIndex: 2, endIndex: 5, id: 'inclusive' };
        const exclusive = { startIndex: 2, endIndex: 6, id: 'exclusive' };

        expect(shiftInclusiveRangeOnDelete(inclusive, 5, 1)).toEqual({ ...inclusive, endIndex: 4 });
        expect(shiftExclusiveRangeOnDelete(exclusive, 5, 1)).toEqual({ ...exclusive, endIndex: 5 });
        expect(shiftInclusiveRangeOnDelete(inclusive, 2, 4)).toBeNull();
        expect(shiftExclusiveRangeOnDelete(exclusive, 2, 4)).toBeNull();
        expect(shiftInclusiveRangeOnDelete(inclusive, 3, 2)).toEqual({ ...inclusive, endIndex: 3 });
        expect(shiftExclusiveRangeOnDelete(exclusive, 3, 2)).toEqual({ ...exclusive, endIndex: 4 });
    });

    it('derives row and cell intervals from paired stream tokens', () => {
        const T = DataStreamTreeTokenType;
        const dataStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}A${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;

        expect(getTableRowTokenInterval(dataStream, 1)).toEqual({ startOffset: 1, endOffset: 8 });
        expect(getTableCellTokenInterval(dataStream, 2)).toEqual({ startOffset: 2, endOffset: 7 });
        expect(getTableCellTokenInterval(dataStream, 3)).toBeNull();
        expect(getTableRowTokenInterval(`${T.TABLE_ROW_START}A`, 0)).toBeNull();
    });
});
