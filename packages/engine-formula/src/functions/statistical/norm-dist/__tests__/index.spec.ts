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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { NormDist } from '../index';

describe('Test normDist function', () => {
    const testFunction = new NormDist(FUNCTION_NAMES_STATISTICAL.NORM_DIST);

    describe('NormDist', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toBe(0.989324657288);
        });

        it('StandardDev value test', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(0);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Cumulative value test', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toBe(0.00705370772379);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toBe(0.105649773667);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toBe(0.0668072012689);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(15.2069);
            const mean2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, mean2, standardDev, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const standardDev2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(x2, mean, standardDev2, cumulative);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(x2, mean, standardDev, cumulative2);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
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
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toStrictEqual([
                [0.105649773667, ErrorType.VALUE, 0.116532625373, 0.105649773667, 0.0668072012689, 0.0668072012689],
                [0.0668072012689, 1, 0.180095815063, ErrorType.VALUE, 0.012224472655, ErrorType.NAME],
            ]);
        });
    });

    describe('CDF scale normalization and PDF compatibility', () => {
        const number = (value: number) => NumberValueObject.create(value);
        // Independent references from Python math.erfc and math.exp.
        const standardValues = [
            { z: -1, cdf: 0.15865525393145707, pdf: 0.24197072451914337 },
            { z: 0, cdf: 0.5, pdf: 0.3989422804014327 },
            { z: 1, cdf: 0.8413447460685429, pdf: 0.24197072451914337 },
        ];

        describe.each([1e-200, 1e200, 1])('with standard deviation %s', (scale) => {
            it.each(standardValues)('evaluates the CDF at z=$z', ({ z, cdf }) => {
                const result = testFunction.calculate(number(z * scale), number(0), number(scale), number(1));
                expect(result.getValue()).toBeCloseTo(cdf, 13);
            });
        });

        it.each(standardValues)('retains the ordinary PDF at z=$z', ({ z, pdf }) => {
            const result = testFunction.calculate(number(z), number(0), number(1), number(0));
            expect(result.getValue()).toBeCloseTo(pdf, 13);
        });

        it.each([0, -1])('retains the invalid-scale error for %s', (scale) => {
            expect(testFunction.calculate(number(1), number(0), number(scale), number(1)).getValue()).toBe(ErrorType.NUM);
        });

        it.each([
            { x: -1e308, mean: 1e308, cdf: 0.02275013194817922 },
            { x: 1e308, mean: -1e308, cdf: 0.9772498680518208 },
        ])('standardizes opposite-sign finite locations in the CDF at x=$x', ({ x, mean, cdf }) => {
            const result = testFunction.calculate(number(x), number(mean), number(1e308), number(1));
            expect(result.getValue()).toBeCloseTo(cdf, 13);
        });

        it.each([-1, 1])('retains the existing nonfinite PDF for overflowing differences (sign=%s)', (sign) => {
            const result = testFunction.calculate(number(sign * 1e308), number(-sign * 1e308), number(1e308), number(0));
            expect(result.getValue()).toBeNaN();
        });

        it('evaluates array-valued scales and cumulative flags independently', () => {
            const result = testFunction.calculate(
                ArrayValueObject.createByArray([[-1e-200, 1e200, 0]]),
                number(0),
                ArrayValueObject.createByArray([[1e-200, 1e200, 1]]),
                ArrayValueObject.createByArray([[1, 1, 0]])
            );
            const values = getObjectValue(result) as number[][];
            expect(values[0][0]).toBeCloseTo(standardValues[0].cdf, 13);
            expect(values[0][1]).toBeCloseTo(standardValues[2].cdf, 13);
            expect(values[0][2]).toBeCloseTo(standardValues[1].pdf, 13);
        });
    });
});
