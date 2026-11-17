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
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Xnpv } from '../index';

describe('Test xnpv function', () => {
    const testFunction = new Xnpv(FUNCTION_NAMES_FINANCIAL.XNPV);

    describe('Xnpv', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(getObjectValue(result, true)).toBe(1994.51004065326);
        });

        it('Value is normal, but no positive and negative number', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(getObjectValue(result, true)).toBe(21994.5100406533);
        });

        it('Value is normal, but values.length !== dates.length', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859}');
            const result = testFunction.calculate(rate, values, dates);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const rate2 = NumberValueObject.create(0.1);
            const values2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(rate2, values2, dates);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const dates2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(rate2, values, dates2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const rate2 = NumberValueObject.create(0.1);
            const values2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(rate2, values2, dates);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const values3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(rate2, values3, dates);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);

            const dates2 = BooleanValueObject.create(true);
            const result4 = testFunction.calculate(rate2, values, dates2);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);

            const dates3 = NumberValueObject.create(1);
            const result5 = testFunction.calculate(rate2, values, dates3);
            expect(getObjectValue(result5)).toBe(ErrorType.NUM);

            const dates4 = NumberValueObject.create(-1);
            const result6 = testFunction.calculate(rate2, values, dates4);
            expect(getObjectValue(result6)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is null', () => {
            const rate = NullValueObject.create();
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(getObjectValue(result)).toBe(ErrorType.NA);
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
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

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
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

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
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);

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
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);

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
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);

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
            expect(getObjectValue(result6)).toBe(ErrorType.VALUE);

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
            expect(getObjectValue(result7)).toBe(ErrorType.NAME);

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
            expect(getObjectValue(result8)).toBe(ErrorType.NUM);

            const values5 = ArrayValueObject.create('{-10000}');
            const dates6 = ArrayValueObject.create('{39448}');
            const result9 = testFunction.calculate(rate2, values5, dates6);
            expect(getObjectValue(result9)).toBe(-10000);
        });
    });
});

describe('XNPV starting date', () => {
    const calculate = (values: ArrayValueObject, dates: ArrayValueObject) => new Xnpv(FUNCTION_NAMES_FINANCIAL.XNPV).calculate(NumberValueObject.create(0.1), values, dates);
    describe.each([false, true])('column vector: %s', (column) => {
        const array = (values: (number | string)[]) => ArrayValueObject.create({
            calculateValueList: transformToValueObject(column ? values.map((value) => [value]) : [values]),
            rowCount: column ? values.length : 1,
            columnCount: column ? 1 : values.length,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });

        it.each([
            { dates: [1000, 1365, 999], values: [-100, 121, -10] },
            { dates: [1000, 999, 1365], values: [-100, -10, 121] },
            { dates: [1000.9, 1365.1, 999.99], values: [-100, 121, -10] },
            { dates: [1, 366, 0], values: [-100, 121, -10] },
        ])('rejects a cash flow before the first date: $dates', ({ dates, values }) => {
            expect(calculate(array(values), array(dates)).getValue()).toBe(ErrorType.NUM);
        });

        it.each([
            // Dates after the first payment need not be sorted.
            { dates: [1000, 1730, 1365], values: [-100, 121, 0] },
            { dates: [1000, 1000, 1365], values: [-100, -10, 121] },
            // Truncation makes the first two serials the same payment date.
            { dates: [1000.9, 1000.1, 1365.8], values: [-100, -10, 121] },
        ])('retains valid schedules and date truncation: $dates', ({ dates, values }) => {
            expect(calculate(array(values), array(dates)).getValue()).toBeCloseTo(0, 10);
        });

        it('preserves value and date conversion errors before the schedule check', () => {
            expect(calculate(array([ErrorType.REF, 121, -10]), array([1000, 1365, 999])).getValue()).toBe(ErrorType.REF);
            expect(calculate(array([-100, 121, -10]), array([1000, 'not a date', 999])).getValue()).toBe(ErrorType.VALUE);
        });
    });
});
