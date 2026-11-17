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

import { describe, expect, it, vi } from 'vitest';
import * as statistical from '../../../../basics/statistical';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { BinomInv } from '../index';

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

    it('bounds CDF evaluations for a central quantile', () => {
        const spy = vi.spyOn(statistical, 'binomialCDF');
        try {
            expect(calculate(1000, 0.5, 0.5)).toBe(500);
            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls.length).toBeLessThan(32);
        } finally {
            spy.mockRestore();
        }
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

    it('retains the existing result when the CDF becomes NaN', () => {
        expect(statistical.binomialCDF(512, 1100, 0.99)).toBeNaN();
        expect(calculate(1100, 0.99, 0.5)).toBe(1100);
    }, 15000);

    it('retains existing non-finite argument results', () => {
        expect(calculate(NaN, 0.5, 0.5)).toBe(0);
        expect(calculate(12, NaN, 0.5)).toBe(12);
        expect(calculate(12, 0.5, NaN)).toBe(13);
    });
});
