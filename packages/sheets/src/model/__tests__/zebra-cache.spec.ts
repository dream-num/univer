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
import { ZebraCrossingCache } from '../zebra-crossing-cache';

describe('ZebraCrossingCache', () => {
    it('should correctly refresh and calculate toggle ranges for odd rows visible', () => {
        const visibleFunc = (row: number) => row !== 3 && row !== 10 && row !== 16; // Rows 3, 10, and 16 are hidden
        const zebraCache = new ZebraCrossingCache();

        zebraCache.refresh({ startRow: 1, endRow: 31, startColumn: 1, endColumn: 1 }, visibleFunc);

        const toggleRanges = zebraCache.getToggleRanges();
        expect(toggleRanges).toEqual([
            [4, 9],
            [17, 31],
        ]);

        expect(zebraCache.getIsToggled(1)).toBe(false);
        expect(zebraCache.getIsToggled(8)).toBe(true);
        expect(zebraCache.getIsToggled(11)).toBe(false);
    });

    it('should return no toggle ranges when all rows are visible', () => {
        const zebraCache = new ZebraCrossingCache();
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, () => true);

        expect(zebraCache.getToggleRanges()).toEqual([]);
        expect(zebraCache.getIsToggled(5)).toBe(false);
    });

    it('should return no toggle ranges when all rows are hidden', () => {
        const zebraCache = new ZebraCrossingCache();
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, () => false);

        expect(zebraCache.getToggleRanges()).toEqual([]);
    });

    it('should toggle after one hidden row in middle', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 5; // Only row 5 hidden
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([[6, 10]]);
        expect(zebraCache.getIsToggled(6)).toBe(true);
        expect(zebraCache.getIsToggled(4)).toBe(false);
    });

    it('should not toggle with even number of hidden rows', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 3 && row !== 6;
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([[4, 5]]);
        expect(zebraCache.getIsToggled(4)).toBe(true);
        expect(zebraCache.getIsToggled(7)).toBe(false);
    });

    it('should handle hidden rows at start correctly', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 1;
        zebraCache.refresh({ startRow: 1, endRow: 5, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([[2, 5]]);
        expect(zebraCache.getIsToggled(2)).toBe(true);
    });

    it('should handle hidden rows at end correctly', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 5;
        zebraCache.refresh({ startRow: 1, endRow: 5, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([]); // Edge case, should not happen logically
        expect(zebraCache.getIsToggled(4)).toBe(false);
    });

    it('should toggle multiple ranges correctly with alternating hidden rows', () => {
        const hidden = new Set([3, 5, 8, 10]);
        const visibleFunc = (row: number) => !hidden.has(row);

        const zebraCache = new ZebraCrossingCache();
        zebraCache.refresh({ startRow: 1, endRow: 12, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([
            [4, 4],
            [9, 9],
        ]);

        expect(zebraCache.getIsToggled(4)).toBe(true);
        expect(zebraCache.getIsToggled(6)).toBe(false);
        expect(zebraCache.getIsToggled(9)).toBe(true);
        expect(zebraCache.getIsToggled(11)).toBe(false);
    });

    it('should toggle on boundary correctly', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 10; // Hide last row
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([]);
        expect(zebraCache.getIsToggled(9)).toBe(false);
    });

    it('should not toggle with even number of hidden rows start', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 1 && row !== 3;
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([[2, 2]]);
        expect(zebraCache.getIsToggled(2)).toBe(true);
        expect(zebraCache.getIsToggled(7)).toBe(false);
    });

    it('should not toggle with even number of hidden rows start2', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 1 && row !== 3 && row !== 4;
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([[2, 2], [5, 10]]);
        expect(zebraCache.getIsToggled(2)).toBe(true);
        expect(zebraCache.getIsToggled(7)).toBe(true);
    });

    it('should not toggle with even number of start double Hide rows', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 1 && row !== 2 && row !== 4;
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([[5, 10]]);
        expect(zebraCache.getIsToggled(2)).toBe(false);
        expect(zebraCache.getIsToggled(7)).toBe(true);
    });

    it('should not toggle with even number of start 3 Hide rows', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 1 && row !== 2 && row !== 3 && row !== 5;
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([[4, 4]]);
        expect(zebraCache.getIsToggled(4)).toBe(true);
        expect(zebraCache.getIsToggled(7)).toBe(false);
    });

    it('should not toggle with even number of only start 3 Hide rows', () => {
        const zebraCache = new ZebraCrossingCache();
        const visibleFunc = (row: number) => row !== 2 && row !== 3 && row !== 4;
        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getToggleRanges()).toEqual([[5, 10]]);
        expect(zebraCache.getIsToggled(4)).toBe(false);
        expect(zebraCache.getIsToggled(7)).toBe(true);
    });
});
