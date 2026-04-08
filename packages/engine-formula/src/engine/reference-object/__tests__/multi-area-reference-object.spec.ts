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

import { describe, expect, it, vi } from 'vitest';
import { NumberValueObject } from '../../value-object/primitive-object';
import { MultiAreaReferenceObject } from '../multi-area-reference-object';

function createAreaStub(config?: {
    rowCount?: number;
    columnCount?: number;
    exceed?: boolean;
    unitId?: string;
    sheetId?: string;
    range?: { startRow: number; startColumn: number; endRow: number; endColumn: number };
    rangeData?: { startRow: number; startColumn: number; endRow: number; endColumn: number };
    iteratorValue?: number;
}) {
    const rowCount = config?.rowCount ?? 1;
    const columnCount = config?.columnCount ?? 1;
    const range = config?.range ?? { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 };
    const rangeData = config?.rangeData ?? range;
    const iteratorValue = config?.iteratorValue ?? 1;

    return {
        dispose: vi.fn(),
        isError: () => false,
        getRowCount: () => rowCount,
        getColumnCount: () => columnCount,
        isExceedRange: () => !!config?.exceed,
        setRefOffset: vi.fn(),
        getUnitId: () => config?.unitId ?? 'unit-1',
        getSheetId: () => config?.sheetId ?? 'sheet-1',
        getActiveSheetRowCount: () => 100,
        getActiveSheetColumnCount: () => 26,
        iterator: (callback: (v: any, row: number, col: number) => any) => callback(NumberValueObject.create(iteratorValue), 0, 0),
        getFirstCell: () => NumberValueObject.create(iteratorValue),
        getRangePosition: () => range,
        getRangeData: () => rangeData,
    };
}

function createErrorAreaStub() {
    return {
        dispose: vi.fn(),
        isError: () => true,
    };
}

describe('MultiAreaReferenceObject', () => {
    it('should manage areas and multi-area flags', () => {
        const areaA = createAreaStub({ rowCount: 2, columnCount: 3 });
        const areaB = createAreaStub({ rowCount: 4, columnCount: 5 });
        const multi = new MultiAreaReferenceObject('token', [[areaA as never]]);

        multi.addArea(areaB as never);
        multi.addArea([areaA as never, areaB as never]);

        expect(multi.isMultiArea()).toBe(true);
        expect(multi.isRange()).toBe(false);
        expect(multi.isCell()).toBe(false);
        expect(multi.isRow()).toBe(false);
        expect(multi.isColumn()).toBe(false);
        expect(multi.getAreas().length).toBe(3);
        expect(multi.getRowCount()).toBe(2 + 4 + 2 + 4);
        expect(multi.getColumnCount()).toBe(3 + 5 + 3 + 5);
    });

    it('should ignore error areas in count, range and sheet inference', () => {
        const area = createAreaStub({
            unitId: 'unit-A',
            sheetId: 'sheet-A',
            range: { startRow: 2, startColumn: 3, endRow: 4, endColumn: 5 },
        });
        const errorArea = createErrorAreaStub();
        const multi = new MultiAreaReferenceObject('token', [[errorArea as never, area as never]]);

        expect(multi.getUnitId()).toBe('unit-A');
        expect(multi.getSheetId()).toBe('sheet-A');
        expect(multi.getActiveSheetRowCount()).toBe(100);
        expect(multi.getActiveSheetColumnCount()).toBe(26);
        expect(multi.isExceedRange()).toBe(false);
        expect(multi.getRangePosition()).toEqual({ startRow: 2, startColumn: 3, endRow: 4, endColumn: 5 });
    });

    it('should propagate offset and iterate in row-major order with stop signal', () => {
        const area1 = createAreaStub({ iteratorValue: 1 });
        const area2 = createAreaStub({ iteratorValue: 2 });
        const multi = new MultiAreaReferenceObject('token', [[area1 as never, area2 as never]]);

        multi.setRefOffset(2, 3);
        expect(area1.setRefOffset).toHaveBeenCalledWith(2, 3);
        expect(area2.setRefOffset).toHaveBeenCalledWith(2, 3);

        const values: number[] = [];
        multi.iterator((v) => {
            values.push(v?.getValue() as number);
            return values.length < 1;
        });
        expect(values).toEqual([1]);
    });

    it('should convert multi-area to array object and unit range', () => {
        const area1 = createAreaStub({
            range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 },
            rangeData: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 },
            unitId: 'u1',
            sheetId: 's1',
            iteratorValue: 9,
        });
        const area2 = createAreaStub({
            range: { startRow: 5, startColumn: 6, endRow: 7, endColumn: 8 },
            rangeData: { startRow: 5, startColumn: 6, endRow: 7, endColumn: 8 },
            unitId: 'u1',
            sheetId: 's1',
            iteratorValue: 5,
        });
        const multi = new MultiAreaReferenceObject('token', [[area1 as never, area2 as never]]);

        const array = multi.toArrayValueObject();
        expect(array.getRowCount()).toBe(1);
        expect(array.getColumnCount()).toBe(2);
        // Current implementation always normalizes to NullValueObject after first-cell extraction.
        expect(array.get(0, 0)?.isNull()).toBe(true);
        expect(array.get(0, 1)?.isNull()).toBe(true);

        expect(multi.getRangePosition()).toEqual({
            startRow: 0,
            startColumn: 0,
            endRow: 7,
            endColumn: 8,
        });
        expect(multi.getRangeData()).toEqual({
            startRow: 0,
            startColumn: 0,
            endRow: 7,
            endColumn: 8,
        });
        expect(multi.toUnitRange()).toEqual({
            unitId: 'u1',
            sheetId: 's1',
            range: {
                startRow: 0,
                startColumn: 0,
                endRow: 7,
                endColumn: 8,
            },
        });
        expect(multi.getFirstCell().getValue()).toBe(9);
    });

    it('should fallback to parent behavior when all areas are invalid', () => {
        const invalidArea = createAreaStub({
            range: {
                startRow: Number.POSITIVE_INFINITY,
                startColumn: Number.POSITIVE_INFINITY,
                endRow: Number.NEGATIVE_INFINITY,
                endColumn: Number.NEGATIVE_INFINITY,
            },
            rangeData: {
                startRow: Number.POSITIVE_INFINITY,
                startColumn: Number.POSITIVE_INFINITY,
                endRow: Number.NEGATIVE_INFINITY,
                endColumn: Number.NEGATIVE_INFINITY,
            },
        });
        const multi = new MultiAreaReferenceObject('token', [[invalidArea as never]]);

        expect(multi.getRangePosition()).toEqual({
            startRow: -1,
            startColumn: -1,
            endRow: -1,
            endColumn: -1,
        });
        expect(multi.getRangeData()).toEqual({
            startRow: -1,
            startColumn: -1,
            endRow: -1,
            endColumn: -1,
        });
    });

    it('should dispose all areas', () => {
        const area1 = createAreaStub();
        const area2 = createAreaStub();
        const multi = new MultiAreaReferenceObject('token', [[area1 as never, area2 as never]]);

        multi.dispose();
        expect(area1.dispose).toHaveBeenCalledTimes(1);
        expect(area2.dispose).toHaveBeenCalledTimes(1);
        expect(multi.getAreas()).toEqual([]);
    });
});
