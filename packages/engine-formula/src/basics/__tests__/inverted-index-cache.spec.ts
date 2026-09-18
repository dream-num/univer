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
import { InvertedIndexCache } from '../inverted-index-cache';

describe('InvertedIndexCache', () => {
    it('moves updated rows between normalized value buckets and resets them on clear', () => {
        const cache = new InvertedIndexCache();
        const rows: [number, number][] = [[0, 3]];
        cache.set('unit', 'sheet', 0, 'OLD', 0);
        cache.set('unit', 'sheet', 0, 'old', 1);
        cache.setContinueBuildingCache('unit', 'sheet', 0, 0, 3);
        cache.set('unit', 'sheet', 0, 0, 0, true);
        cache.set('unit', 'sheet', 0, null, 0, true);
        cache.set('unit', 'sheet', 0, 'NEW', 0, true);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'old', rows)?.matchingRows).toEqual([1]);
        expect(cache.getCellPositions('unit', 'sheet', 0, 0, rows)?.matchingRows).toEqual([]);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'new', rows)?.matchingRows).toEqual([0]);
        cache.set('unit', 'other', 0, 'old', 0, true);
        expect(cache.getCellPositions('unit', 'other', 0, 'old', rows)?.matchingRows).toEqual([0]);
        cache.clear();
        cache.set('unit', 'sheet', 0, 'fresh', 0, true);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'new', rows)?.matchingRows).toEqual([]);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'fresh', rows)?.matchingRows).toEqual([0]);
    });
    it('keeps empty string lookups distinct from numeric zero lookups', () => {
        const cache = new InvertedIndexCache();
        const unitId = 'unit';
        const sheetId = 'sheet';
        const column = 0;
        const rows: [number, number][] = [[0, 2]];

        cache.setContinueBuildingCache(unitId, sheetId, column, 0, 2);
        cache.set(unitId, sheetId, column, 0, 0, true);
        cache.set(unitId, sheetId, column, '', 1, true);
        cache.set(unitId, sheetId, column, null, 2, true);

        expect(cache.getCellPositions(unitId, sheetId, column, 0, rows)?.matchingRows).toEqual([0, 1, 2]);
        expect(cache.getCellPositions(unitId, sheetId, column, '', rows)?.matchingRows).toEqual([1, 2]);
    });
});
