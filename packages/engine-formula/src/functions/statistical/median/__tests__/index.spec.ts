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
import { getMedianResult } from '../../../../basics/statistical';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Median } from '../index';

describe('Test median function', () => {
    const testFunction = new Median(FUNCTION_NAMES_STATISTICAL.MEDIAN);

    describe('Median', () => {
        it('Value is normal', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(5);
        });

        it('Value is single cell = null/boolean/string/error/negtive number', () => {
            const number = NumberValueObject.create(3);
            const number2 = NullValueObject.create();
            const number3 = BooleanValueObject.create(true);
            const number4 = StringValueObject.create('test');
            const number5 = ErrorValueObject.create(ErrorType.NAME);
            const number6 = NumberValueObject.create(-3);
            const result = testFunction.calculate(number, number2, number3, number4);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const result2 = testFunction.calculate(number, number2, number3, number5);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const result3 = testFunction.calculate(number, number2, number3, number6);
            expect(getObjectValue(result3)).toStrictEqual(1);

            const result4 = testFunction.calculate(BooleanValueObject.create(false));
            expect(getObjectValue(result4)).toStrictEqual(0);
        });

        it('Value is not has number', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, false, null, 'test', null, null],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NUM);
        });

        it('More test', () => {
            const number = ArrayValueObject.create({
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
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const number2 = NumberValueObject.create(1);
            const number3 = NumberValueObject.create(2);
            const number4 = StringValueObject.create('3');
            const result2 = testFunction.calculate(number2, number3, number4);
            expect(getObjectValue(result2)).toStrictEqual(2);

            const number5 = StringValueObject.create('test');
            const result3 = testFunction.calculate(number2, number3, number5);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);
        });
    });
});

describe('Finite median midpoints', () => {
    const median = new Median(FUNCTION_NAMES_STATISTICAL.MEDIAN);

    it('keeps finite medians when the two middle values overflow their sum', () => {
        const fixtures: [number[], number][] = [
            [[Number.MAX_VALUE, Number.MAX_VALUE], Number.MAX_VALUE],
            [[-Number.MAX_VALUE, -Number.MAX_VALUE], -Number.MAX_VALUE],
            [[2 ** 1023, 1.5 * 2 ** 1023], 1.25 * 2 ** 1023],
            [[-(2 ** 1023), -1.5 * 2 ** 1023], -1.25 * 2 ** 1023],
            [[0, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], Number.MAX_VALUE],
        ];
        for (const [values, expected] of fixtures) {
            expect(getObjectValue(median.calculate(...values.map((value) => NumberValueObject.create(value))))).toBe(expected);
            expect(getObjectValue(median.calculate(ArrayValueObject.createByArray([values])))).toBe(expected);
        }
    });

    it('retains subnormal midpoints, cancellation and ordinary medians', () => {
        const fixtures: [number[], number][] = [
            [[Number.MIN_VALUE, Number.MIN_VALUE], Number.MIN_VALUE],
            [[-Number.MIN_VALUE, -Number.MIN_VALUE], -Number.MIN_VALUE],
            [[Number.MIN_VALUE, 2 * Number.MIN_VALUE], 2 * Number.MIN_VALUE],
            [[-Number.MAX_VALUE, Number.MAX_VALUE], 0],
            [[1, 2, 9, 10], 5.5],
            [[3, Number.MAX_VALUE, 1], 3],
            [[Number.MAX_VALUE], Number.MAX_VALUE],
        ];
        for (const [values, expected] of fixtures) {
            expect(getObjectValue(median.calculate(ArrayValueObject.createByArray([values])))).toBe(expected);
        }
    });

    it('retains non-finite helper results and formula error propagation', () => {
        for (const [values, expected] of [
            [[Infinity, Infinity], Infinity],
            [[-Infinity, -Infinity], -Infinity],
            [[-Infinity, Infinity], NaN],
            [[NaN, 1], NaN],
        ] as const) {
            expect(getObjectValue(getMedianResult([...values]))).toBe(expected);
        }
        expect(getObjectValue(median.calculate(NumberValueObject.create(Number.MAX_VALUE), ErrorValueObject.create(ErrorType.REF)))).toBe(ErrorType.REF);
        expect(getObjectValue(median.calculate(ArrayValueObject.createByArray([[null, true, 'text']])))).toBe(ErrorType.NUM);
    });
});
