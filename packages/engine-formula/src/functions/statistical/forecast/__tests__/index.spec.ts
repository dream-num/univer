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
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Forecast } from '../index';

describe('Test forecast function', () => {
    const testFunction = new Forecast(FUNCTION_NAMES_STATISTICAL.FORECAST);

    describe('Forecast', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(30);
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
            const result = testFunction.calculate(x, knownYs, knownXs);
            expect(getObjectValue(result)).toBe(29.952035314302105);
        });

        it('X value is array', () => {
            const x = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
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
            const result = testFunction.calculate(x, knownYs, knownXs);
            expect(getObjectValue(result)).toStrictEqual([
                [1.4156939427151058, ErrorType.VALUE, 1.6420166501449338, 1.4156939427151058, 0.43168217128107145, 0.43168217128107145],
                [0.43168217128107145, 98.83285931468451, 2.734269716436712, ErrorType.VALUE, -2.5203531430210315, ErrorType.NAME],
            ]);
        });

        it('Value length is equal to 1', () => {
            const x = NumberValueObject.create(30);
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
            const result = testFunction.calculate(x, knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Value length is not equal', () => {
            const x = NumberValueObject.create(30);
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
            const result = testFunction.calculate(x, knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.NA);
        });

        it('Value is error', () => {
            const x = NumberValueObject.create(30);
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
            const result = testFunction.calculate(x, knownYs, knownXs);
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
            const result2 = testFunction.calculate(x, knownYs2, knownXs2);
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
            const result3 = testFunction.calculate(x, knownYs3, knownXs3);
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
            const result4 = testFunction.calculate(x, knownYs4, knownXs4);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is null', () => {
            const x = NumberValueObject.create(30);
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
            const result = testFunction.calculate(x, knownYs, knownXs);
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
            const result2 = testFunction.calculate(x, knownYs2, knownXs2);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);
        });

        it('Value is can not calculate', () => {
            const x = NumberValueObject.create(30);
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
            const result = testFunction.calculate(x, knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Array2Variance === 0', () => {
            const x = NumberValueObject.create(30);
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
            const result = testFunction.calculate(x, knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });
    });
});
