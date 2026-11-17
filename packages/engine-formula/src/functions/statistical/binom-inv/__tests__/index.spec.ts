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
import * as statistical from '../../../../basics/statistical';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_COMPATIBILITY } from '../../../compatibility/function-names';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { BinomInv } from '../index';

describe('Test binomInv function', () => {
    const testFunction = new BinomInv(FUNCTION_NAMES_STATISTICAL.BINOM_INV);

    describe('BinomInv', () => {
        it('Value is normal', () => {
            const trials = NumberValueObject.create(6);
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(4);
        });

        it('Trials value test', () => {
            const trials = NumberValueObject.create(-6);
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('ProbabilityS value test', () => {
            const trials = NumberValueObject.create(6);
            const probabilityS = NumberValueObject.create(-0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const probabilityS2 = NumberValueObject.create(1.5);
            const result2 = testFunction.calculate(trials, probabilityS2, alpha);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const trials = StringValueObject.create('test');
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const trials = BooleanValueObject.create(true);
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(1);
        });

        it('Value is null', () => {
            const trials = NullValueObject.create();
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is error', () => {
            const trials = ErrorValueObject.create(ErrorType.NAME);
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const trials2 = NumberValueObject.create(6);
            const probabilityS2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(trials2, probabilityS2, alpha);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const alpha2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(trials2, probabilityS, alpha2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const trials = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toStrictEqual([
                [1, ErrorType.VALUE, 1, 1, 0, 0],
                [0, 53, 1, ErrorType.VALUE, ErrorType.NUM, 0],
            ]);
        });
    });
});

describe('BINOM.INV quantile search', () => {
    const fn = new BinomInv(FUNCTION_NAMES_STATISTICAL.BINOM_INV);
    const number = NumberValueObject.create;

    function calculate(trials: number, probability: number, alpha: number) {
        return getObjectValue(fn.calculate(number(trials), number(probability), number(alpha))) as number;
    }

    function expectFirstQuantile(result: number, trials: number, probability: number, alpha: number) {
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(trials);
        expect(statistical.binomialCDF(result, trials, probability)).toBeGreaterThanOrEqual(alpha);
        if (result > 0) expect(statistical.binomialCDF(result - 1, trials, probability)).toBeLessThan(alpha);
    }

    it('returns the first integer whose CDF reaches alpha across the domain', () => {
        for (const trials of [0, 1, 2, 7, 31, 80]) {
            for (const probability of [0.1, 0.5, 0.9]) {
                for (const alpha of [1e-12, 0.01, 0.37, 0.95, 1 - 1e-12]) {
                    expectFirstQuantile(calculate(trials, probability, alpha), trials, probability, alpha);
                }
            }
        }
    });

    it('returns central and upper quantiles', () => {
        expect(calculate(1000, 0.5, 0.5)).toBe(500);
        expect(calculate(1000, 0.95, 0.95)).toBe(961);
    });

    it('keeps small quantiles efficient in a large trial range', () => {
        expect(calculate(10000, 0.001, 0.5)).toBe(10);
        expect(calculate(1000, 0.001, 0.1)).toBe(0);
    });

    it('broadcasts probability columns over trial rows', () => {
        const result = getObjectValue(fn.calculate(
            ArrayValueObject.createByArray([[100], [200]]),
            ArrayValueObject.createByArray([[0.1, 0.9]]),
            number(0.37)
        )) as number[][];
        expect(result.map((row) => row.length)).toEqual([2, 2]);
        for (let row = 0; row < 2; row++) {
            for (let column = 0; column < 2; column++) {
                expectFirstQuantile(result[row][column], [100, 200][row], [0.1, 0.9][column], 0.37);
            }
        }
    });

    // First crossings from exact rational binomial PMFs at the binary inputs,
    // independently checked with 120-digit mpmath regularized-beta values.
    it.each([
        [1100, 0.99, 0.1, 1085],
        [1100, 0.99, 0.5, 1089],
        [1100, 0.99, 0.9, 1093],
        [1100, 0.5, 0.01, 511],
        [1100, 0.5, 0.5, 550],
        [1100, 0.5, 0.99, 589],
        [1029, 0.5, 0.5, 514],
        [1500, 0.75, 0.5, 1125],
        [1500, 0.25, 0.9, 397],
        [2000, 0.01, 0.5, 20],
        [2000, 0.99, 0.5, 1980],
        [1500, 0.5, 0.5, 750],
        [1500, 0.99, 0.5, 1485],
    ])('finds the finite quantile for BINOM.INV(%s, %s, %s)', (trials, probability, alpha, expected) => {
        expect(calculate(trials, probability, alpha)).toBe(expected);
    });

    // For an odd fair binomial, symmetry gives F((n - 1) / 2) = 1/2 exactly.
    it.each([1101, 1000001])('keeps the first crossing at the exact fair median for %s trials', (trials) => {
        const lowerMedian = (trials - 1) / 2;
        expect(calculate(trials, 0.5, 0.5)).toBe(lowerMedian);
        expect(calculate(trials, 0.5, 0.5 - Number.EPSILON / 4)).toBe(lowerMedian);
        expect(calculate(trials, 0.5, 0.5 + Number.EPSILON / 2)).toBe(lowerMedian + 1);
    });

    // Independent 100-digit PMF recurrences bound the omitted tail below 1e-90.
    it.each([
        [1000001, 0.49, 0.1, 489360],
        [1000001, 0.49, 0.499, 489999],
        [1000001, 0.49, 0.5, 490000],
        [1000001, 0.49, 0.501, 490002],
        [1000001, 0.49, 0.9, 490641],
        [1000001, 0.51, 0.1, 509360],
        [1000001, 0.51, 0.499, 509999],
        [1000001, 0.51, 0.5, 510001],
        [1000001, 0.51, 0.501, 510002],
        [1000001, 0.51, 0.9, 510641],
        [1000001, 0.5, 0.1, 499360],
        [1000001, 0.5, 0.499, 499999],
        [1000001, 0.5, 0.501, 500002],
        [1000001, 0.5, 0.9, 500641],
    ])('converges around the large-trial median for BINOM.INV(%s, %s, %s)', (trials, probability, alpha, expected) => {
        expect(calculate(trials, probability, alpha)).toBe(expected);
    });

    it('broadcasts the overflow-range quantiles across trial and probability arrays', () => {
        const result = getObjectValue(fn.calculate(
            ArrayValueObject.createByArray([[1100], [1500]]),
            ArrayValueObject.createByArray([[0.5, 0.99]]),
            number(0.5)
        ));
        expect(result).toEqual([[550, 1089], [750, 1485]]);
    });

    it.each([
        [1100, 0.001, 1 - Number.EPSILON, 18],
        [1100, 0.001, 1 - Number.EPSILON / 2, 18],
        [1100, 0.01, 1 - Number.EPSILON, 47],
        [1100, 0.01, 1 - Number.EPSILON / 2, 47],
        [2000, 0.001, 1 - Number.EPSILON, 22],
        [2000, 0.001, 1 - Number.EPSILON / 2, 22],
        [2000, 0.01, 1 - Number.EPSILON, 66],
        [2000, 0.01, 1 - Number.EPSILON / 2, 66],
    ])('keeps the first upper-tail crossing for BINOM.INV(%s, %s, %s)', (trials, probability, alpha, expected) => {
        expect(calculate(trials, probability, alpha)).toBe(expected);
    });

    it('retains trial truncation and scalar text conversion in the overflow range', () => {
        const result = getObjectValue(fn.calculate(
            StringValueObject.create('1100.9'),
            StringValueObject.create('0.99'),
            StringValueObject.create('0.5')
        ));
        expect(result).toBe(1089);
    });

    it('evaluates the CRITBINOM compatibility alias in the overflow range', () => {
        const alias = new BinomInv(FUNCTION_NAMES_COMPATIBILITY.CRITBINOM);
        const result = getObjectValue(alias.calculate(
            number(1100),
            number(0.99),
            ArrayValueObject.createByArray([[0.1, 0.5, 0.9]])
        ));
        expect(result).toEqual([[1085, 1089, 1093]]);
    });

    it('keeps the upper endpoint and existing unsupported-range zero result', () => {
        expect(calculate(1100, 0.99, 1 - Number.EPSILON)).toBe(1100);
        expect(calculate(Number.MAX_SAFE_INTEGER + 1, 1e-18, 0.5)).toBe(0);
    });

    it('reports an error instead of accepting an unreliable large-parameter tail', () => {
        expect(calculate(1000000000000001, 0.5, 0.499)).toBe(ErrorType.NUM);
    });

    it('retains existing non-finite argument results', () => {
        expect(calculate(NaN, 0.5, 0.5)).toBe(0);
        expect(calculate(12, NaN, 0.5)).toBe(12);
        expect(calculate(12, 0.5, NaN)).toBe(13);
    });
});
