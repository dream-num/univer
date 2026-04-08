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

import type { IAccessor, IRange } from '@univerjs/core';
import { cellToRange, IUniverInstanceService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    createUniqueKey,
    discreteRangeToRange,
    findFirstNonEmptyCell,
    generateNullCell,
    generateNullCellStyle,
    generateNullCellValue,
    getActiveWorksheet,
    getVisibleRanges,
    groupByKey,
    rangeToDiscreteRange,
} from '../utils';

function createAccessor(getter: (token: unknown) => unknown): IAccessor {
    return {
        get: (token: unknown) => getter(token) as never,
        has: () => true,
    } as unknown as IAccessor;
}

describe('Test utils', () => {
    it('Test generateNullCell', () => {
        const range: IRange[] = [cellToRange(0, 0), cellToRange(1, 1)];
        const result = generateNullCell(range);
        expect(result).toEqual({
            0: {
                0: null,
            },
            1: {
                1: null,
            },
        });
    });

    it('Test generateNullCellValue', () => {
        const range: IRange[] = [cellToRange(0, 0), cellToRange(1, 1)];
        const result = generateNullCellValue(range);
        expect(result).toEqual({
            0: {
                0: {
                    v: null,
                    p: null,
                    f: null,
                    si: null,
                    custom: null,
                },
            },
            1: {
                1: { v: null, p: null, f: null, si: null, custom: null },
            },
        });
    });

    it('Test generateNullCellStyle', () => {
        const range: IRange[] = [cellToRange(0, 0), cellToRange(1, 1)];
        const result = generateNullCellStyle(range);
        expect(result).toEqual({
            0: {
                0: {
                    s: null,
                },
            },
            1: {
                1: {
                    s: null,
                },
            },
        });
    });

    it('Test groupByKey', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const grouped = groupByKey(
            [
                { key: 'fallback', v: 1 },
                { key: 'a', v: 2 },
                { key: '', v: 3 },
                { key: 42, v: 4 } as unknown as { key: string; v: number },
            ],
            'key',
            'fallback'
        );

        expect(grouped.a).toEqual([{ key: 'a', v: 2 }]);
        expect(grouped.fallback).toEqual([
            { key: 'fallback', v: 1 },
            { key: '', v: 3 },
        ]);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('Test createUniqueKey', () => {
        const getKey = createUniqueKey(2);
        expect(getKey()).toBe(2);
        expect(getKey()).toBe(3);
    });

    it('Test findFirstNonEmptyCell', () => {
        const worksheet = {
            getCell: (row: number, col: number) => {
                if (row === 1 && col === 0) {
                    return { p: { body: {} } };
                }
                return null;
            },
        };
        const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 };

        expect(findFirstNonEmptyCell(range, worksheet as never)).toEqual({
            startRow: 1,
            endRow: 1,
            startColumn: 0,
            endColumn: 0,
        });
    });

    it('Test getActiveWorksheet', () => {
        const worksheet = { id: 'sheet-1' };
        const workbook = {
            getActiveSheet: () => worksheet,
        };
        const instanceService = {
            getCurrentUnitForType: () => workbook,
        };

        const [currentWorkbook, currentWorksheet] = getActiveWorksheet(instanceService as never);
        expect(currentWorkbook).toBe(workbook);
        expect(currentWorksheet).toBe(worksheet);
    });

    it('Test discreteRangeToRange', () => {
        expect(
            discreteRangeToRange({
                rows: [2, 4, 5],
                cols: [3, 6],
            })
        ).toEqual({
            startRow: 2,
            endRow: 5,
            startColumn: 3,
            endColumn: 6,
        });
    });

    it('Test rangeToDiscreteRange', () => {
        const worksheet = {
            getRowFiltered: (row: number) => row === 1,
        };
        const workbook = {
            getSheetBySheetId: () => worksheet,
            getActiveSheet: () => worksheet,
        };
        const instanceService = {
            getUnit: () => workbook,
            getCurrentUnitForType: () => workbook,
        };
        const accessor = createAccessor((token) => {
            if (token === IUniverInstanceService) {
                return instanceService;
            }
            return null;
        });

        expect(
            rangeToDiscreteRange(
                { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
                accessor,
                'unit-1',
                'sheet-1'
            )
        ).toEqual({
            rows: [0, 2],
            cols: [0, 1],
        });
    });

    it('Test rangeToDiscreteRange returns null without worksheet', () => {
        const instanceService = {
            getUnit: () => null,
            getCurrentUnitForType: () => null,
        };
        const accessor = createAccessor((token) => {
            if (token === IUniverInstanceService) {
                return instanceService;
            }
            return null;
        });

        expect(
            rangeToDiscreteRange(
                { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                accessor
            )
        ).toBeNull();
    });

    it('Test getVisibleRanges', () => {
        const worksheet = {
            getRowFiltered: (row: number) => row === 1 || row === 4,
            getSheetId: () => 'sheet-1',
        };
        const workbook = {
            getSheetBySheetId: () => worksheet,
            getActiveSheet: () => worksheet,
            getUnitId: () => 'unit-1',
        };
        const instanceService = {
            getCurrentUnitOfType: () => workbook,
            getUnit: () => workbook,
        };
        const accessor = createAccessor((token) => {
            if (token === IUniverInstanceService) {
                return instanceService;
            }
            return null;
        });

        const ranges = [
            { startRow: 0, endRow: 3, startColumn: 0, endColumn: 0 },
            { startRow: 4, endRow: 6, startColumn: 0, endColumn: 0 },
            { startRow: 0, endRow: 1, startColumn: 1, endColumn: 1 },
        ];
        expect(getVisibleRanges(ranges, accessor, 'unit-1', 'sheet-1')).toEqual([
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            { startRow: 2, endRow: 3, startColumn: 0, endColumn: 0 },
            { startRow: 5, endRow: 6, startColumn: 0, endColumn: 0 },
            { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 },
        ]);
    });

    it('Test getVisibleRanges fallback without target', () => {
        const accessor = createAccessor((token) => {
            if (token === IUniverInstanceService) {
                return {
                    getCurrentUnitOfType: () => null,
                };
            }
            return null;
        });
        const ranges = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }];
        expect(getVisibleRanges(ranges, accessor)).toEqual(ranges);
    });
});
