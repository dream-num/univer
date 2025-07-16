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

import type { IColumnData, IScopeColumnDataInfo } from '../typedef';
import { describe, expect, it } from 'vitest';
import { ScopeColumnManger, transColumnDataToScopeColumnDataInfo } from '../scope-column-manager';

describe('ScopeColumnManger - addOrUpdateScopeDataByCol', () => {
    it('should add a new scope when the column does not exist', () => {
        const manager = new ScopeColumnManger([]);
        const colData: IColumnData = { w: 100, hd: 0 };

        manager.addOrUpdateScopeDataByCol(5, colData);

        expect(manager.data).toEqual([
            { s: 5, e: 5, d: colData },
        ]);
    });

    it('should update an existing scope when the column exists', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 5, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);
        const colData: IColumnData = { w: 100, hd: 0 };

        manager.addOrUpdateScopeDataByCol(5, colData);

        expect(manager.data).toEqual([
            { s: 5, e: 5, d: colData },
        ]);
    });

    it('should split the scope when the column is part of a range', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);
        const colData: IColumnData = { w: 100, hd: 0 };

        manager.addOrUpdateScopeDataByCol(7, colData);

        expect(manager.data).toEqual([
            { s: 5, e: 6, d: { w: 80, hd: 1 } },
            { s: 7, e: 7, d: colData },
            { s: 8, e: 10, d: { w: 80, hd: 1 } },
        ]);
    });

    it('should merge scopes when adjacent scopes have the same data', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 5, d: { w: 80, hd: 1 } },
            { s: 6, e: 6, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);
        const colData: IColumnData = { w: 80, hd: 1 };

        manager.addOrUpdateScopeDataByCol(7, colData);

        expect(manager.data).toEqual([
            { s: 5, e: 7, d: colData },
        ]);
    });

    it('should handle ignoreMerge flag correctly', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 5, d: { w: 80, hd: 1 } },
            { s: 6, e: 6, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);
        const colData: IColumnData = { w: 80, hd: 1 };

        manager.addOrUpdateScopeDataByCol(7, colData, true);

        expect(manager.data).toEqual([
            { s: 5, e: 5, d: { w: 80, hd: 1 } },
            { s: 6, e: 6, d: { w: 80, hd: 1 } },
            { s: 7, e: 7, d: colData },
        ]);
    });

    it('should update the start of a range when the column matches the start', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);
        const colData: IColumnData = { w: 100, hd: 0 };

        manager.addOrUpdateScopeDataByCol(5, colData);

        expect(manager.data).toEqual([
            { s: 5, e: 5, d: colData },
            { s: 6, e: 10, d: { w: 80, hd: 1 } },
        ]);
    });

    it('should update the end of a range when the column matches the end', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);
        const colData: IColumnData = { w: 100, hd: 0 };

        manager.addOrUpdateScopeDataByCol(10, colData);

        expect(manager.data).toEqual([
            { s: 5, e: 9, d: { w: 80, hd: 1 } },
            { s: 10, e: 10, d: colData },
        ]);
    });
});

describe('ScopeColumnManger - deleteScopeDataByCol', () => {
    it('should delete a single column scope', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 5, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        const result = manager.deleteScopeDataByCol(5);

        expect(manager.data).toEqual([]);
        expect(result).toEqual([0, -1]);
    });

    it('should adjust the start of a range when the column matches the start', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        const result = manager.deleteScopeDataByCol(5);

        expect(manager.data).toEqual([
            { s: 6, e: 10, d: { w: 80, hd: 1 } },
        ]);
        expect(result).toEqual([0, 0]);
    });

    it('should adjust the end of a range when the column matches the end', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        const result = manager.deleteScopeDataByCol(10);

        expect(manager.data).toEqual([
            { s: 5, e: 9, d: { w: 80, hd: 1 } },
        ]);
        expect(result).toEqual([0, 0]);
    });

    it('should split a range when the column is in the middle', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        const result = manager.deleteScopeDataByCol(7);

        expect(manager.data).toEqual([
            { s: 5, e: 6, d: { w: 80, hd: 1 } },
            { s: 8, e: 10, d: { w: 80, hd: 1 } },
        ]);
        expect(result).toEqual([0, 1]);
    });

    it('should handle non-existing column gracefully', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        const result = manager.deleteScopeDataByCol(15);

        expect(manager.data).toEqual(initialData);
        expect(result).toEqual([-1, -1]);
    });

    it('should handle multiple ranges correctly', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
            { s: 12, e: 15, d: { w: 100, hd: 0 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        const result = manager.deleteScopeDataByCol(12);

        expect(manager.data).toEqual([
            { s: 5, e: 10, d: { w: 80, hd: 1 } },
            { s: 13, e: 15, d: { w: 100, hd: 0 } },
        ]);
        expect(result).toEqual([1, 1]);
    });

    it('should handle an empty data set gracefully', () => {
        const manager = new ScopeColumnManger([]);

        const result = manager.deleteScopeDataByCol(5);

        expect(manager.data).toEqual([]);
        expect(result).toEqual([-1, -1]);
    });
});

describe('ScopeColumnManger - setScopeDataRange', () => {
    /**
     * splitInfo: [------]
     * targetInfo:         [------]
     */
    it('should add a new range when there is no overlap', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 7, d: { w: 100, hd: 0 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(8, 10, { w: 120, hd: 0 });

        expect(manager.data).toEqual([
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 7, d: { w: 100, hd: 0 } },
            { s: 8, e: 10, d: { w: 120, hd: 0 } },
        ]);
    });

    it('should add a new range when empty', () => {
        const initialData: IScopeColumnDataInfo[] = [

        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(8, 10, { w: 120, hd: 0 });

        expect(manager.data).toEqual([
            { s: 8, e: 10, d: { w: 120, hd: 0 } },
        ]);
    });

    it('should add a new range when there is no overlap before', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 3, e: 4, d: { w: 80, hd: 1 } },
            { s: 6, e: 7, d: { w: 100, hd: 0 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(1, 2, { w: 120, hd: 0 });

        expect(manager.data).toEqual([
            { s: 1, e: 2, d: { w: 120, hd: 0 } },
            { s: 3, e: 4, d: { w: 80, hd: 1 } },
            { s: 6, e: 7, d: { w: 100, hd: 0 } },
        ]);
    });

    it('should merge with adjacent ranges', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 7, d: { w: 100, hd: 0 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(4, 5, { w: 100, hd: 0 });

        expect(manager.data).toEqual([
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 4, e: 7, d: { w: 100, hd: 0 } },
        ]);
    });

    it('should split overlapping ranges', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 1, e: 5, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(3, 4, { w: 100 });

        expect(manager.data).toEqual([
            { s: 1, e: 2, d: { w: 80, hd: 1 } },
            { s: 3, e: 4, d: { w: 100, hd: 1 } },
            { s: 5, e: 5, d: { w: 80, hd: 1 } },
        ]);
    });

    it('should split overlapping ranges with big', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 3, e: 5, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(2, 6, { w: 100 });

        expect(manager.data).toEqual([
            { s: 2, e: 2, d: { w: 100 } },
            { s: 3, e: 5, d: { w: 100, hd: 1 } },
            { s: 6, e: 6, d: { w: 100 } },
        ]);
    });

    it('should replace a range completely when it is fully contained', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 1, e: 5, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(1, 5, { w: 100, hd: 0 });

        expect(manager.data).toEqual([
            { s: 1, e: 5, d: { w: 100, hd: 0 } },
        ]);
    });

    it('should handle multiple overlapping ranges', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 7, d: { w: 100, hd: 0 } },
            { s: 9, e: 11, d: { w: 120, hd: 0 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(4, 10, { w: 140, hd: 0 });

        expect(manager.data).toEqual([
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 4, e: 10, d: { w: 140, hd: 0 } },
            { s: 11, e: 11, d: { w: 120, hd: 0 } },
        ]);
    });

    it('should handle adjacent ranges with the same data', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 4, e: 6, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(7, 8, { w: 80, hd: 1 });

        expect(manager.data).toEqual([
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 4, e: 6, d: { w: 80, hd: 1 } },
            { s: 7, e: 8, d: { w: 80, hd: 1 } },
        ]);
    });
    it('should handle adjacent ranges with the same data2', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 6, d: { w: 80, hd: 1 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(6, 8, { w: 80, hd: 1 });

        expect(manager.data).toEqual([
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 8, d: { w: 80, hd: 1 } },
        ]);
    });

    it('should handle non-overlapping ranges gracefully', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 7, d: { w: 100, hd: 0 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(10, 12, { w: 120, hd: 0 });

        expect(manager.data).toEqual([
            { s: 1, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 7, d: { w: 100, hd: 0 } },
            { s: 10, e: 12, d: { w: 120, hd: 0 } },
        ]);
    });

    it('should handle non-overlapping ranges gracefully bigger merge', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 2, e: 3, d: { w: 80 } },
            { s: 5, e: 7, d: { w: 100 } },
        ];
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(1, 12, { w: 120 });

        expect(manager.data).toEqual([
            { s: 1, e: 12, d: { w: 120 } },
        ]);
    });

    it('should handle non-overlapping ranges gracefully bigger unmerge', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 2, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 7, d: { w: 100, hd: 0 } },
        ];
        // hd: 0 means hd false, the undefined means hd false, so it will merge
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(1, 12, { w: 120 });

        expect(manager.data).toEqual([
            { s: 1, e: 1, d: { w: 120 } },
            { s: 2, e: 3, d: { w: 120, hd: 1 } },
            { s: 4, e: 4, d: { w: 120 } },
            { s: 5, e: 7, d: { w: 120, hd: 0 } },
            { s: 8, e: 12, d: { w: 120 } },
        ]);
    });

    it('should handle non-overlapping ranges gracefully undefined', () => {
        const initialData: IScopeColumnDataInfo[] = [
            { s: 2, e: 3, d: { w: 80, hd: 1 } },
            { s: 5, e: 7, d: { w: 100, hd: 0 } },
        ];
        // hd: 0 means hd false, the undefined means hd false, so it will merge
        const manager = new ScopeColumnManger(initialData);

        manager.setScopeDataRange(1, 12, { w: undefined });

        expect(manager.data).toEqual([
            { s: 2, e: 3, d: { hd: 1 } },
            { s: 5, e: 7, d: { hd: 0 } },
        ]);
    });

    it('should handle an empty data set gracefully', () => {
        const manager = new ScopeColumnManger([]);

        manager.setScopeDataRange(1, 5, { w: 80, hd: 1 });

        expect(manager.data).toEqual([
            { s: 1, e: 5, d: { w: 80, hd: 1 } },
        ]);
    });
});

// transColumnDataToScopeColumnDataInfo test
describe('transColumnDataToScopeColumnDataInfo', () => {
    it('should convert single column data to scope column data info', () => {
        const colDatas = {
            0: { w: 100, hd: 0, s: 'A' },
        };

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([
            { s: 0, e: 0, d: { w: 100, hd: 0, s: 'A' } },
        ]);
    });

    it('should convert multiple columns with no merge', () => {
        const colDatas = {
            0: { w: 100, hd: 0, s: 'A' },
            1: { w: 200, hd: 0, s: 'B' },
            2: { w: 300, hd: 0, s: 'C' },
        };

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([
            { s: 0, e: 0, d: { w: 100, hd: 0, s: 'A' } },
            { s: 1, e: 1, d: { w: 200, hd: 0, s: 'B' } },
            { s: 2, e: 2, d: { w: 300, hd: 0, s: 'C' } },
        ]);
    });

    it('should merge adjacent columns with the same data', () => {
        const colDatas = {
            0: { w: 100, hd: 0, s: 'A' },
            1: { w: 100, hd: 0, s: 'A' },
            2: { w: 300, hd: 0, s: 'C' },
            3: { w: 400, hd: 0, s: 'B' },
            4: { w: 400, hd: 0, s: 'B' },
        };

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([
            { s: 0, e: 1, d: { w: 100, hd: 0, s: 'A' } },
            { s: 2, e: 2, d: { w: 300, hd: 0, s: 'C' } },
            { s: 3, e: 4, d: { w: 400, hd: 0, s: 'B' } },
        ]);
    });

    it('should handle columns with undefined values gracefully', () => {
        const colDatas = {
            0: { w: 100, hd: 0 },
            1: { w: undefined, hd: 0 },
            2: { w: 300, hd: undefined },
        };

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([
            { s: 0, e: 0, d: { w: 100, hd: 0 } },
            { s: 1, e: 1, d: { hd: 0 } },
            { s: 2, e: 2, d: { w: 300 } },
        ]);
    });

    it('should handle empty input gracefully', () => {
        const colDatas = {};

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([]);
    });

    it('should merge columns with custom data', () => {
        const colDatas = {
            0: { w: 100, hd: 0, custom: { color: 'red' } },
            1: { w: 100, hd: 0, custom: { color: 'red' } },
            2: { w: 300, hd: 0, custom: { color: 'blue' } },
        };

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([
            { s: 0, e: 1, d: { w: 100, hd: 0, custom: { color: 'red' } } },
            { s: 2, e: 2, d: { w: 300, hd: 0, custom: { color: 'blue' } } },
        ]);
    });

    it('should not merge columns with different custom data', () => {
        const colDatas = {
            0: { w: 100, hd: 0, custom: { color: 'red' } },
            1: { w: 100, hd: 0, custom: { color: 'blue' } },
        };

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([
            { s: 0, e: 0, d: { w: 100, hd: 0, custom: { color: 'red' } } },
            { s: 1, e: 1, d: { w: 100, hd: 0, custom: { color: 'blue' } } },
        ]);
    });

    it('should handle columns with mixed data types', () => {
        const colDatas = {
            0: { w: 100, hd: 0, s: 'A' },
            1: { w: 100, hd: 0, s: 'A' },
            2: { w: 300, hd: 1, s: 'B' },
            3: { w: 400, hd: 0, s: 'C' },
        };

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([
            { s: 0, e: 1, d: { w: 100, hd: 0, s: 'A' } },
            { s: 2, e: 2, d: { w: 300, hd: 1, s: 'B' } },
            { s: 3, e: 3, d: { w: 400, hd: 0, s: 'C' } },
        ]);
    });

    it('should merge adjacent columns with the same data test', () => {
        const colDatas = {
            1: { w: 100, hd: 0, s: 'A' },
            3: { w: 100, hd: 0, s: 'A' },
            4: { w: 300, hd: 0, s: 'C' },
            5: { w: 300, hd: 0, s: 'C' },
            7: { w: 300, hd: 0, s: 'C' },
            8: { w: 300, hd: 0, s: 'C' },
        };

        const result = transColumnDataToScopeColumnDataInfo(colDatas);

        expect(result).toEqual([
            { s: 1, e: 1, d: { w: 100, hd: 0, s: 'A' } },
            { s: 3, e: 3, d: { w: 100, hd: 0, s: 'A' } },
            { s: 4, e: 5, d: { w: 300, hd: 0, s: 'C' } },
            { s: 7, e: 8, d: { w: 300, hd: 0, s: 'C' } },
        ]);
    });
});
