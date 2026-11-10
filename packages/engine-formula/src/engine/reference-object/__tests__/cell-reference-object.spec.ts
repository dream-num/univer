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

import type { ICellData } from '@univerjs/core';
import { CellValueType, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { CellReferenceObject } from '../cell-reference-object';
import { RangeReferenceObject } from '../range-reference-object';

describe('CellReferenceObject', () => {
    it('distinguishes forced error-looking text from a calculated error', () => {
        const reference = new CellReferenceObject('A1');
        const text = reference.getCellValueObject({ v: '#REF!', t: CellValueType.FORCE_STRING });
        const error = reference.getCellValueObject({ v: '#REF!', t: CellValueType.STRING });
        expect(text.isString()).toBe(true);
        expect(error.isError()).toBe(true);
    });

    it('should allow blank cells inside the Excel grid even when they are outside snapshot row data', () => {
        const reference = new CellReferenceObject('Sheet2!A151');

        reference.setForcedSheetIdDirect('sheet-2');

        expect(reference.isExceedRange()).toBe(false);
    });

    it('should still reject cells outside the Excel grid', () => {
        const reference = new CellReferenceObject('Sheet2!A1048577');

        reference.setForcedSheetIdDirect('sheet-2');

        expect(reference.isExceedRange()).toBe(true);
    });

    it('should still reject unresolved forced sheet names', () => {
        const reference = new CellReferenceObject('Sheet2!A151');

        expect(reference.isExceedRange()).toBe(true);
    });

    it('should preserve typed empty strings while iterating references', () => {
        const reference = new CellReferenceObject('A1:B1');
        reference.setDefaultUnitId('unit-1');
        reference.setDefaultSheetId('sheet-1');
        reference.setUnitData({
            'unit-1': {
                'sheet-1': {
                    rowCount: 1,
                    columnCount: 2,
                    rowData: {},
                    columnData: {},
                    cellData: new ObjectMatrix({
                        0: {
                            0: { v: '', t: CellValueType.STRING },
                            1: { v: '' },
                        },
                    }),
                },
            },
        });

        const values: unknown[] = [];
        reference.iterator((valueObject) => {
            values.push(valueObject?.getValue() ?? null);
        });

        expect(values).toEqual(['', null]);
    });

    it('should return null value objects for missing cells inside the grid', () => {
        const reference = new CellReferenceObject('A1');
        reference.setDefaultUnitId('unit-1');
        reference.setDefaultSheetId('sheet-1');
        reference.setUnitData({
            'unit-1': {
                'sheet-1': {
                    rowCount: 1,
                    columnCount: 1,
                    rowData: {},
                    columnData: {},
                    cellData: new ObjectMatrix({}),
                },
            },
        });

        expect(reference.getCellByPosition().isNull()).toBe(true);
        expect(reference.getCellByPosition().getValue()).toBe(0);
    });

    it('should apply shared-formula offsets when reading the referenced cell', () => {
        const reference = new CellReferenceObject('A1');
        reference.setDefaultUnitId('unit-1');
        reference.setDefaultSheetId('sheet-1');
        reference.setUnitData({
            'unit-1': {
                'sheet-1': {
                    rowCount: 2,
                    columnCount: 1,
                    rowData: {},
                    columnData: {},
                    cellData: new ObjectMatrix({
                        0: { 0: { v: 1, t: CellValueType.NUMBER } },
                        1: { 0: { v: 2, t: CellValueType.NUMBER } },
                    }),
                },
            },
        });
        reference.setRefOffset(0, 1);

        expect(reference.getCellByPosition().getValue()).toBe(2);
        expect(reference.getCellByPosition(0, 0).getValue()).toBe(1);
    });

    it('should not apply a shared-formula offset twice when unioning a materialized reference', () => {
        const sharedReference = new CellReferenceObject('$B$2');
        const materializedReference = new CellReferenceObject('B3');
        sharedReference.setRefOffset(0, 1);

        const union = sharedReference.unionBy(materializedReference);

        if (!(union instanceof RangeReferenceObject)) {
            throw new TypeError('Expected a range reference');
        }

        expect(union.getRangePosition()).toEqual(expect.objectContaining({
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
        }));
    });

    it('should apply matching shared-formula offsets once when unioning references', () => {
        const startReference = new CellReferenceObject('A1');
        const endReference = new CellReferenceObject('B1');
        startReference.setRefOffset(0, 1);
        endReference.setRefOffset(0, 1);

        const union = startReference.unionBy(endReference);

        if (!(union instanceof RangeReferenceObject)) {
            throw new TypeError('Expected a range reference');
        }

        expect(union.getRangePosition()).toEqual(expect.objectContaining({
            startRow: 1,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        }));
    });

    it('should treat string enum number cell types as numeric cells', () => {
        const reference = new CellReferenceObject('A1');

        const valueObject = reference.getCellValueObject({ v: '43497', t: String(CellValueType.NUMBER) as never });

        expect(valueObject.isNumber()).toBe(true);
        expect(valueObject.getValue()).toBe(43497);
    });

    it.each([{ v: 20 }, { v: 0 }, { v: false }, { v: '' }])('invalidates a removed spill after its anchor becomes $v while preserving unrelated caches', (value) => {
        const reference = new CellReferenceObject('A1');
        reference.setDefaultUnitId('unit-1');
        reference.setDefaultSheetId('sheet-1');
        reference.setArrayFormulaRange({ 'unit-1': { 'sheet-1': { 0: {
            0: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
            3: { startRow: 0, endRow: 2, startColumn: 3, endColumn: 3 },
        } } } });
        reference.setArrayFormulaCellData({ 'unit-1': { 'sheet-1': new ObjectMatrix({
            0: { 0: { v: 1 }, 3: { v: 4 } },
            1: { 0: { v: 2 }, 3: { v: 5 } },
            2: { 0: { v: 3 }, 3: { v: 6 } },
        }) } });
        const runtime = new ObjectMatrix<ICellData>({ 0: { 0: value } });
        reference.setRuntimeData({ 'unit-1': { 'sheet-1': runtime } });
        const range = reference.unionBy(new CellReferenceObject('A3'));
        if (!(range instanceof RangeReferenceObject)) {
            throw new TypeError('Expected a range reference');
        }
        expect(range.getCellData(0, 0)).toEqual(value);
        expect(range.getCellData(1, 0)).toBeNull();
        expect(range.getCellData(2, 0)).toBeNull();
        expect(reference.getCellData(1, 3)).toEqual({ v: 5 });
        runtime.setValue(0, 0, { ...value, f: '=SEQUENCE(3)' });
        expect(range.getCellData(1, 0)).toEqual({ v: 2 });
    });
});
