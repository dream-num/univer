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

import type { ICellData, IObjectMatrixPrimitiveType, Nullable } from '@univerjs/core';
import { CellValueType, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import type { IRuntimeUnitDataType } from '../../../../basics/common';
import { ErrorType } from '../../../../basics/error-type';
import { CellReferenceObject } from '../../../../engine/reference-object/cell-reference-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import {
    BooleanValueObject,
    NullValueObject,
    NumberValueObject,
    StringValueObject,
} from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_INFORMATION } from '../../function-names';
import { Isblank } from '../index';

describe('Test isblank function', () => {
    const testFunction = new Isblank(FUNCTION_NAMES_INFORMATION.ISBLANK);

    function createReference(cells: IObjectMatrixPrimitiveType<ICellData>, token = 'A1') {
        const reference = new CellReferenceObject(token);
        reference.setDefaultUnitId('unit-1');
        reference.setDefaultSheetId('sheet-1');
        reference.setUnitData({
            'unit-1': {
                'sheet-1': {
                    rowCount: 10,
                    columnCount: 10,
                    rowData: {},
                    columnData: {},
                    cellData: new ObjectMatrix(cells),
                },
            },
        });
        return reference;
    }

    describe('referenced cells', () => {
        const cases: Array<{ name: string; cell: Nullable<ICellData>; expected: boolean }> = [
            { name: 'missing cell', cell: null, expected: true },
            { name: 'style only', cell: { s: { bl: 1 } }, expected: true },
            { name: 'null value', cell: { v: null }, expected: true },
            { name: 'empty string', cell: { v: '' }, expected: true },
            { name: 'typed empty string', cell: { v: '', t: CellValueType.STRING }, expected: true },
            { name: 'forced empty string', cell: { v: '', t: CellValueType.FORCE_STRING }, expected: true },
            { name: 'styled empty string', cell: { v: '', t: CellValueType.STRING, s: { bl: 1 } }, expected: true },
            { name: 'whitespace', cell: { v: ' ', t: CellValueType.STRING }, expected: false },
            { name: 'zero', cell: { v: 0, t: CellValueType.NUMBER }, expected: false },
            { name: 'false', cell: { v: 0, t: CellValueType.BOOLEAN }, expected: false },
            { name: 'text', cell: { v: 'text' }, expected: false },
            { name: 'formula without a cached value', cell: { f: '=1' }, expected: false },
            { name: 'formula with a null cache', cell: { f: '=1', v: null }, expected: false },
            { name: 'formula returning empty text', cell: { f: '=""', v: '', t: CellValueType.STRING }, expected: false },
            { name: 'shared formula without a cached value', cell: { si: 'shared' }, expected: false },
            { name: 'shared formula returning empty text', cell: { si: 'shared', v: '', t: CellValueType.STRING }, expected: false },
            {
                name: 'image with no text',
                cell: {
                    v: '',
                    t: CellValueType.STRING,
                    p: { id: 'image', body: { dataStream: '\r\n' }, documentStyle: {}, drawingsOrder: ['image'] },
                },
                expected: false,
            },
        ];

        it.each(cases)('classifies $name independently of the stored value type', ({ cell, expected }) => {
            const reference = createReference(cell ? { 0: { 0: cell } } : {});
            expect(testFunction.calculate(reference).getValue()).toBe(expected);
        });

        const formulaSources: Array<{
            name: string;
            configure: (reference: CellReferenceObject, data: IRuntimeUnitDataType) => void;
        }> = [
            { name: 'runtime formula', configure: (reference, data) => reference.setRuntimeData(data) },
            { name: 'runtime array formula', configure: (reference, data) => reference.setRuntimeArrayFormulaCellData(data) },
            { name: 'cached array formula', configure: (reference, data) => reference.setArrayFormulaCellData(data) },
            { name: 'runtime feature', configure: (reference, data) => reference.setRuntimeFeatureCellData({ feature: data }) },
        ];

        it.each(formulaSources)('keeps $name results nonblank without formula fields', ({ configure }) => {
            for (const cell of [{ v: '', t: CellValueType.STRING }, { v: null }]) {
                const reference = createReference({});
                configure(reference, {
                    'unit-1': {
                        'sheet-1': new ObjectMatrix({ 0: { 0: cell } }),
                    },
                });
                expect(testFunction.calculate(reference).getValue()).toBe(false);
            }
        });

        it('uses original formula metadata when its runtime result is null', () => {
            const reference = createReference({ 0: { 0: { f: '=""' } } });
            reference.setRuntimeData({
                'unit-1': { 'sheet-1': new ObjectMatrix({ 0: { 0: { v: null } } }) },
            });
            expect(testFunction.calculate(reference).getValue()).toBe(false);
        });

        it('keeps an ordinary empty cell blank when a blocked array copies it into runtime data', () => {
            const reference = createReference({ 0: { 0: { v: '', t: CellValueType.STRING, s: { bl: 1 } } } });
            reference.setRuntimeData({
                'unit-1': { 'sheet-1': new ObjectMatrix({ 0: { 0: { v: '', t: CellValueType.STRING } } }) },
            });
            reference.setArrayFormulaCellData({
                'unit-1': { 'sheet-1': new ObjectMatrix({ 0: { 0: { v: '', t: CellValueType.STRING } } }) },
            });
            expect(testFunction.calculate(reference).getValue()).toBe(true);
        });

        it('does not treat invalidated array results as occupied cells', () => {
            const reference = createReference({}, 'B1');
            reference.setArrayFormulaCellData({
                'unit-1': { 'sheet-1': new ObjectMatrix({ 0: { 1: { v: '', t: CellValueType.STRING } } }) },
            });
            reference.setArrayFormulaRange({
                'unit-1': { 'sheet-1': { 0: { 0: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 } } } },
            });
            reference.setRuntimeArrayFormulaRange({
                'unit-1': { 'sheet-1': { 0: { 0: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } } } },
            });
            expect(testFunction.calculate(reference).getValue()).toBe(true);
        });

        it('preserves range shape and applies row and column offsets', () => {
            const reference = createReference({
                2: { 3: { v: '', t: CellValueType.STRING }, 4: { f: '=""', v: '' } },
                3: { 3: { v: ' ' }, 4: { s: { bl: 1 } } },
            }, 'D3:E4');
            const result = testFunction.calculate(reference) as ArrayValueObject;
            expect(transformToValue(result.getArrayValue())).toEqual([[true, false], [false, true]]);
        });
    });

    describe('Isblank', () => {
        it('value null', () => {
            const value = NullValueObject.create();
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(true);
        });

        it('value error', () => {
            const value = ErrorValueObject.create(ErrorType.NA);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value boolean', () => {
            const value = BooleanValueObject.create(true);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value string', () => {
            const value = StringValueObject.create('a1');
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('literal empty string', () => {
            expect(testFunction.calculate(StringValueObject.create('')).getValue()).toBe(false);
        });

        it('value number 1', () => {
            const value = NumberValueObject.create(1);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value number 0', () => {
            const value = NumberValueObject.create(0);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a1'],
                    [null],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(value);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [false],
                [true],
            ]);
        });
    });
});
