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
import { DEFAULT_EMPTY_CELL_KEY, InvertedIndexCache } from '../inverted-index-cache';

describe('InvertedIndexCache', () => {
    it('replaces every supported value kind without leaving a row in its previous bucket', () => {
        const values = [undefined, null, '', 0, -0, '0', 12, '12', '012', 'OLD', 'old', true, false, '#REF!', '#VALUE!'];
        const keys = [DEFAULT_EMPTY_CELL_KEY, DEFAULT_EMPTY_CELL_KEY, DEFAULT_EMPTY_CELL_KEY, 0, 0, 0, 12, 12, '012', 'old', 'old', true, false, '#ref!', '#value!'];
        for (const initial of values) {
            for (let index = 0; index < values.length; index++) {
                const cache = new InvertedIndexCache();
                cache.set('unit', 'sheet', 0, initial, 4);
                cache.set('unit', 'sheet', 0, initial, 7);
                cache.setContinueBuildingCache('unit', 'sheet', 0, 4, 7);
                cache.set('unit', 'sheet', 0, values[index], 4, true);
                const buckets = cache.getCellValuePositions('unit', 'sheet', 0)!;
                expect([...buckets].filter(([, rows]) => rows.has(4)).map(([key]) => key)).toEqual([keys[index]]);
                expect([...buckets.values()].filter((rows) => rows.has(7))).toHaveLength(1);
            }
        }
    });

    it('keeps forced writes correct while coverage expands and ignores ordinary writes to covered rows', () => {
        const cache = new InvertedIndexCache();
        cache.set('unit', 'sheet', 0, 'old', 2, true);
        cache.set('unit', 'sheet', 0, 'old', 2);
        cache.setContinueBuildingCache('unit', 'sheet', 0, 0, 3);
        cache.set('unit', 'sheet', 0, 'ignored', 2);
        cache.set('unit', 'sheet', 0, 'next', 2, true);
        cache.set('unit', 'sheet', 0, 'tail', 4);
        cache.setContinueBuildingCache('unit', 'sheet', 0, 2, 5);
        expect(cache.canUseCache('unit', 'sheet', 0, 0, 7)).toEqual({ rowsInCache: [[0, 5]], rowsNotInCache: [[6, 7]] });
        expect(cache.getCellPositions('unit', 'sheet', 0, 'old', [[0, 7]])?.matchingRows).toEqual([]);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'ignored', [[0, 7]])?.matchingRows).toEqual([]);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'next', [[0, 7]])?.matchingRows).toEqual([2]);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'tail', [[0, 3]])?.matchingRows).toEqual([]);
        expect(cache.getCellPositions('unit', 'sheet', 0, 'tail', [[4, 7]])?.matchingRows).toEqual([4]);
    });

    it('isolates row updates by workbook, sheet and column across cache rebuilds', () => {
        const cache = new InvertedIndexCache();
        const scopes: [string, string, number][] = [['a', 'a', 0], ['b', 'a', 0], ['a', 'b', 0], ['a', 'a', 1]];
        for (let cycle = 0; cycle < 3; cycle++) {
            for (const [unit, sheet, column] of scopes) {
                cache.set(unit, sheet, column, 'old', 0);
                cache.setContinueBuildingCache(unit, sheet, column, 0, 0);
            }
            for (let index = 0; index < scopes.length; index++) {
                const [unit, sheet, column] = scopes[index];
                cache.set(unit, sheet, column, 'new', 0, true);
                for (let other = 0; other < scopes.length; other++) {
                    const [otherUnit, otherSheet, otherColumn] = scopes[other];
                    const expected = other <= index ? 'new' : 'old';
                    expect(cache.getCellPositions(otherUnit, otherSheet, otherColumn, expected, [[0, 0]])?.matchingRows).toEqual([0]);
                }
            }
            cache.clear();
            expect(cache.getCellValuePositions('a', 'a', 0)).toBeUndefined();
            expect(cache.canUseCache('a', 'a', 0, 0, 0).rowsInCache).toEqual([]);
        }
    });

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
