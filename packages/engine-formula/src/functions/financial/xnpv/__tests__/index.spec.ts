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

import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Xnpv } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test xnpv function', () => {
    const testFunction = new Xnpv(FUNCTION_NAMES_FINANCIAL.XNPV);

    describe('Xnpv', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(1994.5100406532624);
        });

        it('Value is normal, but no positive and negative number', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(21994.510040653262);
        });

        it('Value is normal, but values.length !== dates.length', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const rate2 = NumberValueObject.create(0.1);
            const values2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(rate2, values2, dates);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);

            const dates2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(rate2, values, dates2);
            expect(result3.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const rate2 = NumberValueObject.create(0.1);
            const values2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(rate2, values2, dates);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const values3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(rate2, values3, dates);
            expect(result3.getValue()).toStrictEqual(ErrorType.NA);

            const dates2 = BooleanValueObject.create(true);
            const result4 = testFunction.calculate(rate2, values, dates2);
            expect(result4.getValue()).toStrictEqual(ErrorType.VALUE);

            const dates3 = NumberValueObject.create(1);
            const result5 = testFunction.calculate(rate2, values, dates3);
            expect(result5.getValue()).toStrictEqual(ErrorType.NA);

            const dates4 = NumberValueObject.create(-1);
            const result6 = testFunction.calculate(rate2, values, dates4);
            expect(result6.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is null', () => {
            const rate = NullValueObject.create();
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.NA);
        });

        it('Value is array', () => {
            const rate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const rate2 = NumberValueObject.create(0.1);
            const values2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(rate2, values2, dates);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const values3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', true, 'test', false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(rate2, values3, dates);
            expect(result3.getValue()).toStrictEqual(ErrorType.VALUE);

            const values4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', ErrorType.NAME, true, 'test', false, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(rate2, values4, dates);
            expect(result4.getValue()).toStrictEqual(ErrorType.NAME);

            const dates2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result5 = testFunction.calculate(rate2, values, dates2);
            expect(result5.getValue()).toStrictEqual(ErrorType.VALUE);

            const dates3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', true, 'test', false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result6 = testFunction.calculate(rate2, values, dates3);
            expect(result6.getValue()).toStrictEqual(ErrorType.VALUE);

            const dates4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', ErrorType.NAME, true, 'test', false, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result7 = testFunction.calculate(rate2, values, dates4);
            expect(result7.getValue()).toStrictEqual(ErrorType.NAME);

            const dates5 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-2, ErrorType.NAME, true, 'test', false, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result8 = testFunction.calculate(rate2, values, dates5);
            expect(result8.getValue()).toStrictEqual(ErrorType.NUM);

            const values5 = ArrayValueObject.create('{-10000}');
            const dates6 = ArrayValueObject.create('{39448}');
            const result9 = testFunction.calculate(rate2, values5, dates6);
            expect(result9.getValue()).toStrictEqual(ErrorType.NA);
        });
    });
});
