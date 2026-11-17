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
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_COMPATIBILITY } from '../../../compatibility/function-names';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { PoissonDist } from '../index';

function expectProbability(actual: number, expected: number) {
    expect(Number.isFinite(actual)).toBe(true);
    expect(actual).toBeGreaterThanOrEqual(0);
    expect(actual).toBeLessThanOrEqual(1);
    // The fallback uses the existing gammaln approximation.
    expect(Math.abs(actual / expected - 1)).toBeLessThan(1e-9);
}

describe('Poisson probabilities with large parameters', () => {
    // Independent references evaluated with 100-digit mpmath arithmetic.
    const density = BooleanValueObject.create(false);
    const cumulative = BooleanValueObject.create(true);
    const functions = [
        new PoissonDist(FUNCTION_NAMES_STATISTICAL.POISSON_DIST),
        new PoissonDist(FUNCTION_NAMES_COMPATIBILITY.POISSON),
    ];

    it('returns finite mass when powers or factorials overflow', () => {
        const cases = [
            [170, 0.030582481093915214],
            [171, 0.03049301492850299],
            [200, 0.028197727685920822],
            [500, 0.01783826786951178],
            [1000, 0.012614611348721499],
            [10000, 0.003989389558962826],
        ];
        for (const fn of functions) {
            for (const [x, expected] of cases) {
                const value = NumberValueObject.create(x);
                expectProbability(getObjectValue(fn.calculate(value, value, density)) as number, expected);
            }
        }
    });

    it('recovers representable mass when exp(-mean) underflows', () => {
        for (const fn of functions) {
            const result = fn.calculate(NumberValueObject.create(100), NumberValueObject.create(1000), density);
            expectProbability(getObjectValue(result) as number, 5.438942180826245e-293);
        }
    });

    it('retains cumulative probabilities below, near and above the mean', () => {
        const cases = [
            [100, 200, 3.723641215201676e-15],
            [200, 200, 0.5187943096786845],
            [1000, 200, 1],
            [100, 1000, 6.042524933789374e-293],
            [900, 1000, 0.0006977673277963068],
            [1000, 1000, 0.508409367168506],
            [2000, 1000, 1],
            [10000, 10000, 0.5026595812190077],
        ];
        for (const fn of functions) {
            for (const [x, mean, expected] of cases) {
                const result = fn.calculate(NumberValueObject.create(x), NumberValueObject.create(mean), cumulative);
                expectProbability(getObjectValue(result) as number, expected);
            }
        }
    });

    it('supports array broadcasting and truncates fractional counts', () => {
        const x = ArrayValueObject.createByArray([[170.9, 200.75, 1000, 100]]);
        const mean = ArrayValueObject.createByArray([[170, 200, 1000, 1000]]);
        const modes = ArrayValueObject.createByArray([[false], [true]]);
        const expected = [
            [0.030582481093915214, 0.028197727685920822, 0.012614611348721499, 5.438942180826245e-293],
            [0.520382993447183, 0.5187943096786845, 0.508409367168506, 6.042524933789374e-293],
        ];
        for (const fn of functions) {
            const result = getObjectValue(fn.calculate(x, mean, modes)) as number[][];
            expect(result.map((row) => row.length)).toEqual([4, 4]);
            for (let row = 0; row < 2; row++) {
                for (let column = 0; column < 4; column++) expectProbability(result[row][column], expected[row][column]);
            }
        }
    });

    it('preserves zero counts, zero means and genuinely underflowed mass', () => {
        const cases = [
            [0, 0, 1, 1],
            [500, 0, 0, 1],
            [0, 1000, 0, 0],
            [1000, 100, 0, 1],
        ];
        for (const fn of functions) {
            for (const [x, mean, expectedMass, expectedCumulative] of cases) {
                const count = NumberValueObject.create(x);
                const rate = NumberValueObject.create(mean);
                expect(getObjectValue(fn.calculate(count, rate, density))).toBe(expectedMass);
                expect(getObjectValue(fn.calculate(count, rate, cumulative))).toBeCloseTo(expectedCumulative, 12);
            }
        }
    });

    it.each([
        [10, 760],
        [1, 746],
        [0, 709],
        [0, 708.3964185322642],
    ])('flushes subnormal worksheet results for x=%s and mean=%s to positive zero', (x, mean) => {
        for (const fn of functions) {
            for (const mode of [density, cumulative]) {
                const result = fn.calculate(NumberValueObject.create(x), NumberValueObject.create(mean), mode);
                expect(Object.is(getObjectValue(result), 0)).toBe(true);
            }
        }
    });

    it.each([
        [1, 2 ** -1022, 2 ** -1022],
        [1, 2 ** -1021, 2 ** -1021],
        [0, 708.396418532264, 2.2250738585075156e-308],
    ])('retains normal worksheet mass for x=%s and mean=%s', (x, mean, expected) => {
        for (const fn of functions) {
            const result = getObjectValue(fn.calculate(NumberValueObject.create(x), NumberValueObject.create(mean), density)) as number;
            expect(result).toBeGreaterThanOrEqual(2 ** -1022);
            expectProbability(result, expected);
        }
    });

    it('sums subnormal masses before applying the worksheet range to a cumulative result', () => {
        // Each mass through x=10 is below the normal range, but their sum is normal.
        // Independent 100-digit mpmath references.
        const count = NumberValueObject.create(10);
        const mean = NumberValueObject.create(759.6252709727578);
        for (const fn of functions) {
            expect(Object.is(getObjectValue(fn.calculate(count, mean, density)), 0)).toBe(true);
            expectProbability(getObjectValue(fn.calculate(count, mean, cumulative)) as number, 2.243442742954619e-308);
        }
    });

    it('applies the worksheet range independently to broadcast results', () => {
        const counts = ArrayValueObject.createByArray([[10, 1, 0, 1]]);
        const means = ArrayValueObject.createByArray([[760, 746, 708.396418532264, 2 ** -1022]]);
        const modes = ArrayValueObject.createByArray([[false], [true]]);
        for (const fn of functions) {
            const result = getObjectValue(fn.calculate(counts, means, modes)) as number[][];
            expect(result.map((row) => row.length)).toEqual([4, 4]);
            for (const row of result) {
                expect(Object.is(row[0], 0)).toBe(true);
                expect(Object.is(row[1], 0)).toBe(true);
                expectProbability(row[2], 2.2250738585075156e-308);
            }
            expect(result[0][3]).toBe(2 ** -1022);
            expect(result[1][3]).toBe(1);
        }
    });
});
