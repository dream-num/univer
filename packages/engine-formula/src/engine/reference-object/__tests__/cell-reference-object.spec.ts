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

import { CellValueType, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { CellReferenceObject } from '../cell-reference-object';

describe('CellReferenceObject', () => {
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

    it('should treat string enum number cell types as numeric cells', () => {
        const reference = new CellReferenceObject('A1');

        const valueObject = reference.getCellValueObject({ v: '43497', t: String(CellValueType.NUMBER) as never });

        expect(valueObject.isNumber()).toBe(true);
        expect(valueObject.getValue()).toBe(43497);
    });
});
