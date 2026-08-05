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

import type { Nullable } from '@univerjs/core';
import type { BaseValueObject } from '../../value-object/base-value-object';
import { describe, expect, it, vi } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { createNewArray } from '../../utils/array-object';
import { ErrorValueObject } from '../../value-object/base-value-object';
import { NumberValueObject } from '../../value-object/primitive-object';
import { BaseReferenceObject } from '../base-reference-object';
import { MultiAreaArrayMode, MultiAreaReferenceObject } from '../multi-area-reference-object';

interface ITestReferenceConfig {
    rowCount?: number;
    columnCount?: number;
    exceed?: boolean;
    unitId?: string;
    sheetId?: string;
    range?: { startRow: number; startColumn: number; endRow: number; endColumn: number };
    rangeData?: { startRow: number; startColumn: number; endRow: number; endColumn: number };
    iteratorValue?: number;
}

class TestReferenceObject extends BaseReferenceObject {
    override readonly dispose = vi.fn(() => super.dispose());
    override readonly setRefOffset = vi.fn((x = 0, y = 0) => super.setRefOffset(x, y));

    constructor(private readonly _config: ITestReferenceConfig = {}) {
        super('test-reference');
    }

    override getRowCount(): number {
        return this._config.rowCount ?? 1;
    }

    override getColumnCount(): number {
        return this._config.columnCount ?? 1;
    }

    override isExceedRange(): boolean {
        return this._config.exceed ?? false;
    }

    override getUnitId(): string {
        return this._config.unitId ?? 'unit-1';
    }

    override getSheetId(): string {
        return this._config.sheetId ?? 'sheet-1';
    }

    override getActiveSheetRowCount(): number {
        return 100;
    }

    override getActiveSheetColumnCount(): number {
        return 26;
    }

    override iterator(
        callback: (value: Nullable<BaseValueObject>, row: number, column: number) => Nullable<boolean>
    ): void {
        callback(NumberValueObject.create(this._config.iteratorValue ?? 1), 0, 0);
    }

    override getFirstCell(): BaseValueObject {
        return NumberValueObject.create(this._config.iteratorValue ?? 1);
    }

    override getRangePosition() {
        return this._config.range ?? { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 };
    }

    override getRangeData() {
        return this._config.rangeData ?? this.getRangePosition();
    }

    override toArrayValueObject() {
        const rowCount = this.getRowCount();
        const columnCount = this.getColumnCount();
        return createNewArray(
            Array.from(
                { length: rowCount },
                () => Array.from(
                    { length: columnCount },
                    () => NumberValueObject.create(this._config.iteratorValue ?? 1)
                )
            ),
            rowCount,
            columnCount
        );
    }
}

function createAreaStub(config?: ITestReferenceConfig): TestReferenceObject {
    return new TestReferenceObject(config);
}

function createErrorAreaStub(): ErrorValueObject {
    return ErrorValueObject.create(ErrorType.REF);
}

describe('MultiAreaReferenceObject', () => {
    it('should manage areas and multi-area flags', () => {
        const areaA = createAreaStub({ rowCount: 2, columnCount: 3 });
        const areaB = createAreaStub({ rowCount: 4, columnCount: 5 });
        const multi = new MultiAreaReferenceObject('token', [[areaA]]);

        multi.addArea(areaB);
        multi.addArea([areaA, areaB]);

        expect(multi.isMultiArea()).toBe(true);
        expect(multi.isRange()).toBe(false);
        expect(multi.isCell()).toBe(false);
        expect(multi.isRow()).toBe(false);
        expect(multi.isColumn()).toBe(false);
        expect(multi.getAreas().length).toBe(3);
        expect(multi.getRowCount()).toBe(3);
        expect(multi.getColumnCount()).toBe(2);
    });

    it('should ignore error areas in count, range and sheet inference', () => {
        const area = createAreaStub({
            unitId: 'unit-A',
            sheetId: 'sheet-A',
            range: { startRow: 2, startColumn: 3, endRow: 4, endColumn: 5 },
        });
        const errorArea = createErrorAreaStub();
        const multi = new MultiAreaReferenceObject('token', [[errorArea, area]]);

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
        const multi = new MultiAreaReferenceObject('token', [[area1, area2]]);

        multi.setRefOffset(2, 3);
        expect(area1.setRefOffset).toHaveBeenCalledWith(2, 3);
        expect(area2.setRefOffset).toHaveBeenCalledWith(2, 3);

        const values: number[] = [];
        multi.iterator((v) => {
            const value = v?.getValue();
            if (typeof value === 'number') {
                values.push(value);
            }
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
        const multi = new MultiAreaReferenceObject('token', [[area1, area2]]);

        const array = multi.toArrayValueObject();
        expect(array.getRowCount()).toBe(1);
        expect(array.getColumnCount()).toBe(2);
        expect(array.get(0, 0)?.getValue()).toBe(9);
        expect(array.get(0, 1)?.getValue()).toBe(5);

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

    it('should stack every value and preserve every sheet range in stack mode', () => {
        const area1 = createAreaStub({
            rowCount: 2,
            columnCount: 2,
            unitId: 'u1',
            sheetId: 'jan',
            iteratorValue: 1,
        });
        const area2 = createAreaStub({
            rowCount: 1,
            columnCount: 2,
            unitId: 'u1',
            sheetId: 'feb',
            iteratorValue: 2,
        });
        const multi = new MultiAreaReferenceObject(
            'Jan:Feb!A1:B2',
            [[area1], [area2]],
            MultiAreaArrayMode.STACK_AREAS
        );

        const array = multi.toArrayValueObject();
        expect(multi.getRowCount()).toBe(3);
        expect(multi.getColumnCount()).toBe(2);
        expect(array.getArrayValue().map((row) => row.map((value) => value?.getValue()))).toEqual([
            [1, 1],
            [1, 1],
            [2, 2],
        ]);
        expect(multi.toUnitRanges().map(({ sheetId }) => sheetId)).toEqual(['jan', 'feb']);
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
        const multi = new MultiAreaReferenceObject('token', [[invalidArea]]);

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
        const multi = new MultiAreaReferenceObject('token', [[area1, area2]]);

        multi.dispose();
        expect(area1.dispose).toHaveBeenCalledTimes(1);
        expect(area2.dispose).toHaveBeenCalledTimes(1);
        expect(multi.getAreas()).toEqual([]);
    });
});
