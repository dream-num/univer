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
        const visibleFunc = (row: number) => row % 2 !== 0;
        const zebraCache = new ZebraCrossingCache();

        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getIsToggled(1)).toBe(false);
        expect(zebraCache.getIsToggled(2)).toBe(false);
        expect(zebraCache.getIsToggled(3)).toBe(true);
        expect(zebraCache.getIsToggled(4)).toBe(false);
    });

    it('should handle ranges with no visible rows', () => {
        const visibleFunc = () => false; // No rows are visible
        const zebraCache = new ZebraCrossingCache();

        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getIsToggled(1)).toBe(false); // No toggle
        expect(zebraCache.getIsToggled(10)).toBe(false); // No toggle
    });

    it('should handle ranges with all visible rows', () => {
        const visibleFunc = () => true; // All rows are visible
        const zebraCache = new ZebraCrossingCache();

        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getIsToggled(1)).toBe(false);
        expect(zebraCache.getIsToggled(2)).toBe(false);
        expect(zebraCache.getIsToggled(10)).toBe(false);
    });

    it('should handle mixed visibility with one hidden row', () => {
        const visibleFunc = (row: number) => row !== 5; // Row 5 is hidden
        const zebraCache = new ZebraCrossingCache();

        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getIsToggled(1)).toBe(false);
        expect(zebraCache.getIsToggled(5)).toBe(false);
        expect(zebraCache.getIsToggled(6)).toBe(false);
    });

    it('should handle mixed visibility with two hidden rows', () => {
        const visibleFunc = (row: number) => row !== 5 && row !== 7; // Rows 5 and 7 are hidden
        const zebraCache = new ZebraCrossingCache();

        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getIsToggled(1)).toBe(false);
        expect(zebraCache.getIsToggled(5)).toBe(false);
        expect(zebraCache.getIsToggled(6)).toBe(false);
        expect(zebraCache.getIsToggled(7)).toBe(false);
        expect(zebraCache.getIsToggled(8)).toBe(true);
    });

    it('should handle mixed visibility with three hidden rows', () => {
        const visibleFunc = (row: number) => row !== 4 && row !== 5 && row !== 7; // Rows 4, 5, and 7 are hidden
        const zebraCache = new ZebraCrossingCache();

        zebraCache.refresh({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 1 }, visibleFunc);

        expect(zebraCache.getIsToggled(1)).toBe(false);
        expect(zebraCache.getIsToggled(4)).toBe(false);
        expect(zebraCache.getIsToggled(5)).toBe(false);
        expect(zebraCache.getIsToggled(6)).toBe(false);
        expect(zebraCache.getIsToggled(7)).toBe(true);
        expect(zebraCache.getIsToggled(8)).toBe(true);
    });
});
