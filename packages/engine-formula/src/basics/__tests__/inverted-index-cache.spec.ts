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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { InvertedIndexCache } from '../inverted-index-cache';

describe('InvertedIndexCache', () => {
    afterEach(() => {
        vi.restoreAllMocks();
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

    it('force-updates a row without scanning every distinct column value', () => {
        const cache = new InvertedIndexCache();
        const rows = 500;

        for (let row = 0; row < rows; row++) {
            cache.set('unit', 'sheet', 0, row, row);
        }

        const setHas = vi.spyOn(Set.prototype, 'has');
        cache.set('unit', 'sheet', 0, 'updated', rows - 1, true);

        expect(setHas.mock.calls.length).toBeLessThan(5);
        expect(cache.getCellPositions('unit', 'sheet', 0, rows - 1, [[0, rows - 1]])?.matchingRows).toEqual([]);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'UPDATED', [[0, rows - 1]])?.matchingRows).toEqual([rows - 1]);
    });
});
