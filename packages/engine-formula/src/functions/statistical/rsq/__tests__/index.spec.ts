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
import { NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_MATH } from '../../../math/function-names';
import { Sqrt } from '../../../math/sqrt';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Rsq } from '../index';

describe('Test rsq function', () => {
    const testFunction = new Rsq(FUNCTION_NAMES_STATISTICAL.RSQ);

    describe('Rsq', () => {
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
            expect(getObjectValue(result, true)).toBe(0.698116124936);
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
            expect(getObjectValue(result)).toBe(ErrorType.NA);
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
                    [11, 'test'],
                    [10, true],
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

    describe('normalization', () => {
        describe.each([
            [1e150, 1e150],
            [1e-150, 1e-150],
            [1e100, 1e100],
            [1e-100, 1e-100],
            [1e150, 1e-150],
            [1, 1],
        ])('with scales %s and %s', (scaleX, scaleY) => {
            it.each([
                { values: [-3, -1, 1, 3], correlation: 1 },
                { values: [3, 1, -1, -3], correlation: -1 },
                // The centered dot product is 16 and both squared norms are 20.
                { values: [-3, 1, -1, 3], correlation: 0.8 },
            ])('preserves correlation $correlation', ({ values, correlation }) => {
                const x = ArrayValueObject.createByArray([[-3, -1, 1, 3].map((value) => value * scaleX)]);
                const y = ArrayValueObject.createByArray([values.map((value) => value * scaleY)]);
                const result = testFunction.calculate(x, y).getValue();

                expect(typeof result).toBe('number');
                expect(result).toBeCloseTo(correlation ** 2, 13);
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThanOrEqual(1);
            });
        });

        it.each([1e150, 1e-150, 1])('retains the zero-variance error at scale %s', (scale) => {
            const x = ArrayValueObject.createByArray([[scale, scale, scale, scale]]);
            const y = ArrayValueObject.createByArray([[-3, -1, 1, 3].map((value) => value * scale)]);
            expect(testFunction.calculate(x, y).getValue()).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('preserves the ordinary finite calculation', () => {
            const x = ArrayValueObject.createByArray([[-3, -1, 1, 3]]);
            const y = ArrayValueObject.createByArray([[-3, 1, -1, 3]]);
            expect(testFunction.calculate(x, y).getValue()).toBe(0.8 ** 2);
        });

        it.each([
            { values: [1, -1, 1, -1, 1, -1], sign: 1 },
            { values: [1, -1, 1, -1, 1, -1], sign: -1 },
            { values: [0, 0, 0, 2], sign: 1 },
            { values: [0, 0, 0, 2], sign: -1 },
            { values: [0, 0, 0, 2e-100], sign: 1 },
            { values: [0, 0, 0, 2e-100], sign: -1 },
        ])('keeps exact perfect correlations usable by SQRT: $values, sign $sign', ({ values, sign }) => {
            const x = ArrayValueObject.createByArray(values.map((value) => [value]));
            const y = ArrayValueObject.createByArray(values.map((value) => [sign * value]));
            const result = testFunction.calculate(x, y);
            const downstream = new Sqrt(FUNCTION_NAMES_MATH.SQRT);
            expect([result.getValue(), downstream.calculate(NumberValueObject.create(1).minus(result)).getValue()]).toEqual([1, 0]);
        });
    });
});
