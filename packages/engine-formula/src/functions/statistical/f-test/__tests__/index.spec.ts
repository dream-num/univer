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
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NullValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { FTest } from '../index';

describe('Test fTest function', () => {
    const testFunction = new FTest(FUNCTION_NAMES_STATISTICAL.F_TEST);

    describe('FTest', () => {
        it('Value is normal', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [58, 35],
                    [11, 25],
                    [10, 23],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35, 47.65],
                    [17.56, 18.44],
                    [16.09, 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(0.7283721822078002);
        });

        it('Value length is equal to 1', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [58],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Value length is not equal', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [58, 35],
                    [11, 25],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35, 47.65],
                    [17.56, 18.44],
                    [16.09, 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(0.5601137808756675);
        });

        it('Value is error', () => {
            const array1 = ErrorValueObject.create(ErrorType.NAME);
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35, 47.65],
                    [17.56, 18.44],
                    [16.09, 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const array3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [58, 35],
                    [11, 25],
                    [10, 23],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array4 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(array3, array4);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const array5 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME, 35],
                    [11, 25],
                    [10, 23],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array6 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35, 47.65],
                    [17.56, 18.44],
                    [16.09, 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(array5, array6);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const array7 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [58, 35],
                    [11, 25],
                    [10, 23],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array8 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME, 47.65],
                    [17.56, 18.44],
                    [16.09, 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(array7, array8);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is null', () => {
            const array1 = NullValueObject.create();
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35, 47.65],
                    [17.56, 18.44],
                    [16.09, 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const array3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [58, 35],
                    [11, 25],
                    [10, 23],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array4 = NullValueObject.create();
            const result2 = testFunction.calculate(array3, array4);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);
        });

        it('Value is can not calculate', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [58, null],
                    [false, 'test'],
                    [null, true],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [false, 47.65],
                    [null, 18.44],
                    ['test', 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Calculate result > 1', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [6, 7, 9, 15, 21],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [20, 28, 31, 38, 40],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(0.6483178467861754);
        });

        it('Array2Variance === 0', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [1],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [1],
                    [1],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });
    });
});
