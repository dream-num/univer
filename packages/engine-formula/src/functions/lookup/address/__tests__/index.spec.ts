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

import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import {
    BooleanValueObject,
    NumberValueObject,
    StringValueObject,
} from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Address } from '../index';

describe('Test address', () => {
    const testFunction = new Address(FUNCTION_NAMES_LOOKUP.ADDRESS);
    const calculate = (row: number, column: number, abs?: number, a1?: boolean, sheet?: string) => {
        const rowNumber = NumberValueObject.create(row);
        const columnNumber = NumberValueObject.create(column);
        const absNumber = abs !== undefined ? NumberValueObject.create(abs) : undefined;
        const a1Value = a1 !== undefined ? BooleanValueObject.create(a1) : undefined;
        const sheetText = sheet !== undefined ? StringValueObject.create(sheet) : undefined;
        const result = testFunction.calculate(rowNumber, columnNumber, absNumber, a1Value, sheetText);
        return (getObjectValue(result) as string[][])[0][0];
    };

    describe('Correct situations', () => {
        it('Absolute reference', async () => {
            expect(calculate(2, 3)).toBe('$C$2');
        });

        it('Absolute row; relative column', async () => {
            expect(calculate(2, 3, 2)).toBe('C$2');
        });

        it('Relative row; absolute column', async () => {
            expect(calculate(2, 3, 3)).toBe('$C2');
        });

        it('Relative reference', async () => {
            expect(calculate(2, 3, 4)).toBe('C2');
        });

        it('Absolute row; relative column in R1C1 reference style', async () => {
            expect(calculate(2, 3, 2, false)).toBe('R2C[3]');
        });

        it('Absolute reference to another workbook and worksheet', async () => {
            expect(calculate(2, 3, 1, false, '[Book1]Sheet1')).toBe("'[Book1]Sheet1'!R2C3");
        });

        it('Absolute reference to sheet name with single quote', async () => {
            expect(calculate(1, 1, 1, true, "Sheet'1")).toBe("'Sheet''1'!$A$1");
        });

        it('Absolute reference to another worksheet', async () => {
            expect(calculate(2, 3, 1, false, 'EXCEL SHEET')).toBe("'EXCEL SHEET'!R2C3");
        });
        it('Abs less than 1', async () => {
            expect(calculate(2, 3, 0, false, 'EXCEL SHEET')).toBe(ErrorType.VALUE);
        });
        it('Abs greater than 4', async () => {
            expect(calculate(2, 3, 5, false, 'EXCEL SHEET')).toBe(ErrorType.VALUE);
        });

        it('Array parameter', async () => {
            const rowNumber = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const columnNumber = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [4, 5, 6],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const absNumber = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2],
                    [3],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const a1Value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, false],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sheetText = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Sheet1'],
                    ['Sheet4'],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(rowNumber, columnNumber, absNumber, a1Value, sheetText);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['Sheet1!D$1', 'Sheet1!R1C[5]', '#N/A'], ['Sheet4!$D2', 'Sheet4!R[2]C5', '#N/A'], ['#N/A', '#N/A', '#N/A']]);
        });
    });

    describe('Fault situations', () => {
        it('Value error', async () => {
            const error = ErrorValueObject.create(ErrorType.VALUE);
            const errorValue = testFunction.calculate(error, error);
            expect(errorValue.isError()).toBeTruthy();
        });
    });
});
