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

import type { IMutationInfo, IRange } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { getRepeatRange, mergeSetRangeValues, spilitLargeSetRangeValuesMutations } from '../utils';

describe('test getRepeatRange', () => {
    it('repeat row 2 times', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 1, endColumn: 1 };
        const targetRange: IRange = { startRow: 6, endRow: 9, startColumn: 1, endColumn: 1 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 1, endColumn: 1 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            },
            {
                startRange: { startRow: 8, endRow: 8, startColumn: 1, endColumn: 1 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            },
        ]);
    });

    it('repeat col 2 times', () => {
        const originRange: IRange = { startRow: 1, endRow: 1, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 1, endRow: 1, startColumn: 6, endColumn: 9 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 1, endRow: 1, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 1, endRow: 1, startColumn: 8, endColumn: 8 },
                repeatRelativeRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
            },
        ]);
    });

    it('repeat col 2 times and repeat row 2 times', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 6, endRow: 9, startColumn: 6, endColumn: 9 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 8, endColumn: 8 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 8, endRow: 8, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 8, endRow: 8, startColumn: 8, endColumn: 8 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
    });

    it('the target row mod origin row is not 0', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 6, endRow: 10, startColumn: 6, endColumn: 9 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 8, endColumn: 8 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
        const result2 = getRepeatRange(originRange, targetRange, true);
        expect(result2).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
    });

    it('the target col mod origin col is not 0', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 6, endRow: 9, startColumn: 6, endColumn: 10 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 8, endRow: 8, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
        const result2 = getRepeatRange(originRange, targetRange, true);
        expect(result2).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
    });

    it('the target range is cell', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
    });
});

describe('test "mergeSetRangeValues"', () => {
    it('empty array, will do nothing', () => {
        const mutations: IMutationInfo[] = [];
        expect(mergeSetRangeValues(mutations)).toStrictEqual([]);
    });

    it('no setRangeValues mutations, will no nothing', () => {
        const mutations: IMutationInfo[] = [{ id: 'whatever', params: {} }];
        expect(mergeSetRangeValues(mutations)).toStrictEqual([{ id: 'whatever', params: {} }]);
    });

    it('setRangeValues mutations are not applied in same worksheet, will do nothing', () => {
        const mutations: IMutationInfo[] = [
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '3', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: 'whatever', params: {} },
        ];
        expect(mergeSetRangeValues(mutations)).toStrictEqual([
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '3', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: 'whatever', params: {} },
        ]);
    });
    it('part of setRangeValues mutations are applied in same worksheet, will merge these part', () => {
        const mutations: IMutationInfo[] = [
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 3: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '3', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: 'whatever', params: {} },
        ];
        expect(mergeSetRangeValues(mutations as IMutationInfo[])).toStrictEqual([
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' }, 3: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '3', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: 'whatever', params: {} },
        ]);
    });

    it('If some setRangeValues appear discontinuously, they will be merged separately.', () => {
        const mutations: IMutationInfo[] = [
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { f: 'formula' } } } } },
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 3: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 4: { v: 'value' } } } } },
        ];
        expect(mergeSetRangeValues(mutations as IMutationInfo[])).toStrictEqual([
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value', f: 'formula' } } } } },
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' }, 3: { v: 'value' }, 4: { v: 'value' } } } } },
        ]);
    });
});

describe('test "spilitLargeSetRangeValuesMutations"', () => {
    it('should not split if mutation is not SetRangeValuesMutation', () => {
        const mutation: IMutationInfo = {
            id: 'other.mutation',
            params: { cellValue: {} },
        };
        const result = spilitLargeSetRangeValuesMutations(mutation as any);
        expect(result).toStrictEqual([mutation]);
    });

    it('should not split if cellValue is empty', () => {
        const mutation: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: { unitId: '1', subUnitId: '1', cellValue: undefined },
        };
        const result = spilitLargeSetRangeValuesMutations(mutation as any);
        expect(result).toStrictEqual([mutation]);
    });

    it('should not split if cell count is below threshold', () => {
        const cellValue: any = {};
        // Create 100 cells (10x10)
        for (let row = 0; row < 10; row++) {
            cellValue[row] = {};
            for (let col = 0; col < 10; col++) {
                cellValue[row][col] = { v: `cell_${row}_${col}` };
            }
        }

        const mutation: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: { unitId: '1', subUnitId: '1', cellValue },
        };

        const result = spilitLargeSetRangeValuesMutations(mutation as any, { threshold: 6000 });
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual(mutation);
    });

    it('should split large mutation into chunks based on maxCellsPerChunk', () => {
        const cellValue: any = {};
        // Create 150 cells (50 rows x 3 cols)
        for (let row = 0; row < 50; row++) {
            cellValue[row] = {};
            for (let col = 0; col < 3; col++) {
                cellValue[row][col] = { v: `cell_${row}_${col}` };
            }
        }

        const mutation: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: { unitId: '1', subUnitId: '1', cellValue },
        };

        // With 3 cols and maxCellsPerChunk=30, each chunk should have 10 rows (30/3=10)
        // So 50 rows should be split into 5 chunks
        const result = spilitLargeSetRangeValuesMutations(mutation as any, {
            threshold: 100,
            maxCellsPerChunk: 30,
        });

        expect(result).toHaveLength(5);
        result.forEach((chunk) => {
            expect(chunk.id).toBe(SetRangeValuesMutation.id);
            expect(chunk.params.unitId).toBe('1');
            expect(chunk.params.subUnitId).toBe('1');
        });
    });

    it('should preserve cell data correctly when splitting', () => {
        const cellValue: any = {};
        // Create 20 cells (10 rows x 2 cols)
        for (let row = 0; row < 10; row++) {
            cellValue[row] = {};
            for (let col = 0; col < 2; col++) {
                cellValue[row][col] = { v: `cell_${row}_${col}` };
            }
        }

        const mutation: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: { unitId: '1', subUnitId: '1', cellValue },
        };

        // With 2 cols and maxCellsPerChunk=6, each chunk should have 3 rows (6/2=3)
        const result = spilitLargeSetRangeValuesMutations(mutation as any, {
            threshold: 10,
            maxCellsPerChunk: 6,
        });

        expect(result).toHaveLength(4); // 10 rows / 3 rows per chunk = 4 chunks

        // Verify first chunk has rows 0-2
        const firstChunk = result[0].params.cellValue;
        expect(firstChunk![0][0].v).toBe('cell_0_0');
        expect(firstChunk![2][1].v).toBe('cell_2_1');

        // Verify last chunk has rows 9
        const lastChunk = result[3].params.cellValue;
        expect(lastChunk![9][0].v).toBe('cell_9_0');
        expect(lastChunk![9][1].v).toBe('cell_9_1');
    });

    it('should handle sparse matrices correctly', () => {
        const cellValue: any = {
            0: { 0: { v: 'cell_0_0' } },
            5: { 5: { v: 'cell_5_5' } },
            10: { 10: { v: 'cell_10_10' } },
        };

        const mutation: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: { unitId: '1', subUnitId: '1', cellValue },
        };

        const result = spilitLargeSetRangeValuesMutations(mutation as any, {
            threshold: 2,
            maxCellsPerChunk: 1,
        });

        // Should be split into chunks
        expect(result.length).toBeGreaterThan(1);

        // Verify all cells are preserved
        const allCells: any = {};
        result.forEach((chunk) => {
            const chunkCellValue = chunk.params.cellValue!;
            Object.keys(chunkCellValue).forEach((row) => {
                if (!allCells[row]) allCells[row] = {};
                Object.keys(chunkCellValue[Number(row)]).forEach((col) => {
                    allCells[row][col] = chunkCellValue[Number(row)][Number(col)];
                });
            });
        });

        expect(allCells[0][0].v).toBe('cell_0_0');
        expect(allCells[5][5].v).toBe('cell_5_5');
        expect(allCells[10][10].v).toBe('cell_10_10');
    });

    it('should handle custom options correctly', () => {
        const cellValue: any = {};
        // Create 100 cells (100 rows x 1 col)
        for (let row = 0; row < 100; row++) {
            cellValue[row] = { 0: { v: `cell_${row}_0` } };
        }

        const mutation: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: { unitId: '1', subUnitId: '1', cellValue },
        };

        // With 1 col and maxCellsPerChunk=25, each chunk should have 25 rows
        const result = spilitLargeSetRangeValuesMutations(mutation as any, {
            threshold: 50,
            maxCellsPerChunk: 25,
        });

        expect(result).toHaveLength(4); // 100 rows / 25 rows per chunk = 4 chunks
    });
});
