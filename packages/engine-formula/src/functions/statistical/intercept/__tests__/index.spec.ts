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
import { Intercept } from '../index';

describe('Test intercept function', () => {
    const testFunction = new Intercept(FUNCTION_NAMES_STATISTICAL.INTERCEPT);

    describe('Intercept', () => {
        it('Value is normal', () => {
            const knownYs = ArrayValueObject.create({
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
            const knownXs = ArrayValueObject.create({
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
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(0.43168217128107145);
        });

        it('Value length is equal to 1', () => {
            const knownYs = ArrayValueObject.create({
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
            const knownXs = ArrayValueObject.create({
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
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Value length is not equal', () => {
            const knownYs = ArrayValueObject.create({
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
            const knownXs = ArrayValueObject.create({
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
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.NA);
        });

        it('Value is error', () => {
            const knownYs = ErrorValueObject.create(ErrorType.NAME);
            const knownXs = ArrayValueObject.create({
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
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const knownYs2 = ArrayValueObject.create({
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
            const knownXs2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(knownYs2, knownXs2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const knownYs3 = ArrayValueObject.create({
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
            const knownXs3 = ArrayValueObject.create({
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
            const result3 = testFunction.calculate(knownYs3, knownXs3);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const knownYs4 = ArrayValueObject.create({
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
            const knownXs4 = ArrayValueObject.create({
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
            const result4 = testFunction.calculate(knownYs4, knownXs4);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is null', () => {
            const knownYs = NullValueObject.create();
            const knownXs = ArrayValueObject.create({
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
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const knownYs2 = ArrayValueObject.create({
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
            const knownXs2 = NullValueObject.create();
            const result2 = testFunction.calculate(knownYs2, knownXs2);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);
        });

        it('Value is can not calculate', () => {
            const knownYs = ArrayValueObject.create({
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
            const knownXs = ArrayValueObject.create({
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
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Array2Variance === 0', () => {
            const knownYs = ArrayValueObject.create({
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
            const knownXs = ArrayValueObject.create({
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
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });
    });
});
