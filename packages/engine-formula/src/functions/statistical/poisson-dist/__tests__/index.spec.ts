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
import { FUNCTION_NAMES_COMPATIBILITY } from '../../../compatibility/function-names';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { PoissonDist } from '../index';

describe('Test poissonDist function', () => {
    const testFunction = new PoissonDist(FUNCTION_NAMES_STATISTICAL.POISSON_DIST);

    describe('PoissonDist', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(2);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(0.124652019483);
        });

        it('X and mean value test', () => {
            const x = NumberValueObject.create(-2);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const x2 = NumberValueObject.create(2);
            const mean2 = NumberValueObject.create(-5);
            const result2 = testFunction.calculate(x2, mean2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Cumulative value test', () => {
            const x = NumberValueObject.create(2);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(0.0842243374886);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(0.0404276819945);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(0.00673794699909);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(2);
            const mean2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, mean2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(x2, mean, cumulative2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
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
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toStrictEqual([
                [0.0404276819945, ErrorType.VALUE, 0.0404276819945, 0.0404276819945, 0.00673794699909, 0.00673794699909],
                [0.00673794699909, 1, 0.124652019483, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const x = NumberValueObject.create(17.16017);
            const mean = NumberValueObject.create(0.1);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(2.54391172294e-32);

            const mean2 = NumberValueObject.create(2);
            const result2 = testFunction.calculate(x, mean2, cumulative);
            expect(getObjectValue(result2, true)).toBe(4.98715018952e-11);

            const x2 = NumberValueObject.create(0.25);
            const mean3 = NumberValueObject.create(0);
            const result3 = testFunction.calculate(x2, mean3, cumulative);
            expect(getObjectValue(result3)).toBe(1);

            const x3 = NumberValueObject.create(139.7316);
            const mean4 = NumberValueObject.create(161);
            const result4 = testFunction.calculate(x3, mean4, cumulative);
            expect(getObjectValue(result4, true)).toBe(0.00698880992304);
        });
    });
});

function expectProbability(actual: number, expected: number) {
    expect(Number.isFinite(actual)).toBe(true);
    expect(actual).toBeGreaterThanOrEqual(0);
    expect(actual).toBeLessThanOrEqual(1);
    // Compare relative error even near the worksheet lower bound.
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
    // Generic log-gamma references evaluated with 420-digit mpmath arithmetic
    // at the exact binary64 inputs, then rounded once to double.
    it.each([
        [1000000.0, 1000000.0, 0.00039894224715624404],
        [1000000000000.0, 1000000000000.0, 3.9894228040139945e-07],
        [1e+16, 1e+16, 3.989422804014327e-09],
        [9999999900000000.0, 1e+16, 2.4197072532571242e-09],
        [1.00000001e+16, 1e+16, 2.419707237125743e-09],
        [9999999000000000.0, 1e+16, 7.6945861871147395e-31],
        [1.0000001e+16, 1e+16, 7.694611066316966e-31],
        [9999999999999998.0, 1e+16, 3.989422804014327e-09],
        [1.0000000000000002e+16, 1e+16, 3.989422804014326e-09],
        [1e+20, 1e+20, 3.989422804014327e-11],
        [1e+100, 1e+100, 3.989422804014327e-51],
        [1e+308, 1e+308, 3.989422804014327e-155],
        [1.7976931348623157e+308, 1.7976931348623157e+308, 2.9754474593158995e-155],
        [200.0, 175.0, 0.005119019266949079],
        [200.0, 174.99999999999997, 0.005119019266949058],
        [200.0, 175.00000000000003, 0.0051190192669491],
        [200.0, 225.0, 0.006658195670228905],
        [200.0, 224.99999999999997, 0.006658195670228926],
        [200.0, 225.00000000000003, 0.006658195670228883],
        [500.0, 437.5, 0.00025048649243170995],
        [500.0, 437.49999999999994, 0.0002504864924317079],
        [500.0, 437.50000000000006, 0.00025048649243171196],
        [15.0, 750.0, 1.9433808205531872e-295],
        [16.0, 750.0, 9.109597596343065e-294],
        [17.0, 750.0, 4.018940116033706e-292],
        [15.0, 15.0, 0.10243586666453419],
        [16.0, 16.0, 0.09921753162215582],
    ])('matches an independent mass reference for x=%s and mean=%s', (x, mean, expected) => {
        for (const fn of functions) {
            const result = getObjectValue(fn.calculate(NumberValueObject.create(x), NumberValueObject.create(mean), density)) as number;
            expect(Number.isFinite(result)).toBe(true);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(1);
            expect(Math.abs(result / expected - 1)).toBeLessThan(5e-13);
        }
    });

    it('broadcasts large counts close to their mean without clipping the mass', () => {
        const counts = ArrayValueObject.createByArray([[1e16 - 1e8, 1e16, 1e16 + 1e8]]);
        const mean = NumberValueObject.create(1e16);
        const expected = [2.4197072532571242e-09, 3.989422804014327e-09, 2.419707237125743e-09];
        for (const fn of functions) {
            const result = getObjectValue(fn.calculate(counts, mean, density)) as number[][];
            expect(result.map((row) => row.length)).toEqual([3]);
            for (let column = 0; column < 3; column++) {
                expect(Math.abs(result[0][column] / expected[column] - 1)).toBeLessThan(5e-13);
            }
        }
    });

    it.each([
        [8.0, 745.0, 6.642638841772923e-306],
        [16.0, 745.0, 1.2147635505580122e-291],
        [100.0, 745.0, 4.968606488726526e-195],
    ])('avoids amplification of a rounded subnormal exponential for x=%s and mean=%s', (x, mean, expected) => {
        for (const fn of functions) {
            const result = getObjectValue(fn.calculate(NumberValueObject.create(x), NumberValueObject.create(mean), density)) as number;
            expect(Math.abs(result / expected - 1)).toBeLessThan(5e-13);
        }
    });
});
