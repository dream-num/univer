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
import { ErrorType } from '../../basics/error-type';
import { calculateCombin } from '../../basics/math';
import { ArrayValueObject } from '../../engine/value-object/array-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { Combin } from '../math/combin';
import { Combina } from '../math/combina';
import { FUNCTION_NAMES_MATH } from '../math/function-names';
import { BinomDist } from '../statistical/binom-dist';
import { BinomDistRange } from '../statistical/binom-dist-range';
import { BinomInv } from '../statistical/binom-inv';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { getObjectValue } from '../util';

function exactCombination(n: number, k: number): bigint {
    let result = 1n;
    const integerN = BigInt(n);
    for (let i = 1; i <= Math.min(k, n - k); i++) {
        result = result * (integerN - BigInt(i) + 1n) / BigInt(i);
    }
    return result;
}

function expectRelative(actual: unknown, expected: number) {
    expect(typeof actual).toBe('number');
    expect(Number.isFinite(actual)).toBe(true);
    expect(Math.abs((actual as number) / expected - 1)).toBeLessThan(1e-14);
}

describe('Finite combination counts', () => {
    const combin = new Combin(FUNCTION_NAMES_MATH.COMBIN);
    const combina = new Combina(FUNCTION_NAMES_MATH.COMBINA);
    const binomDist = new BinomDist(FUNCTION_NAMES_STATISTICAL.BINOM_DIST);
    const binomDistRange = new BinomDistRange(FUNCTION_NAMES_STATISTICAL.BINOM_DIST_RANGE);
    const binomInv = new BinomInv(FUNCTION_NAMES_STATISTICAL.BINOM_INV);
    const number = NumberValueObject.create;

    it('avoids overflowing an intermediate numerator for finite combinations', () => {
        for (let n = 1021; n <= 1029; n++) {
            for (const k of [Math.floor(n / 2) - 3, Math.floor(n / 2), Math.ceil(n / 2) + 3]) {
                const expected = Number(exactCombination(n, k));
                expect(Number.isFinite(expected)).toBe(true);
                expectRelative(calculateCombin(n, k), expected);
                expectRelative(calculateCombin(n, n - k), expected);
            }
        }
        expectRelative(calculateCombin(1.8e154, 2), Number(exactCombination(1.8e154, 2)));
    });

    it('evaluates COMBIN and COMBINA with scalar, string and array arguments', () => {
        const expected = Number(exactCombination(1024, 512));
        expectRelative(getObjectValue(combin.calculate(number(1024), number(512))), expected);
        expectRelative(getObjectValue(combin.calculate(StringValueObject.create('1024.9'), number(512.9))), expected);
        expectRelative(getObjectValue(combina.calculate(number(513), number(512))), expected);
        const array = getObjectValue(combin.calculate(ArrayValueObject.createByArray([[1024, 1029]]), number(512))) as number[][];
        expect(array.map((row) => row.length)).toEqual([2]);
        expectRelative(array[0][0], expected);
        expectRelative(array[0][1], Number(exactCombination(1029, 512)));
    });

    it('restores binomial probabilities and quantiles using finite coefficients', () => {
        const trials = 1024;
        const midpoint = trials / 2;
        const pmf = Number(exactCombination(trials, midpoint)) * 2 ** -trials;
        expectRelative(getObjectValue(binomDist.calculate(number(midpoint), number(trials), number(0.5), BooleanValueObject.create(false))), pmf);
        // Symmetry of a fair even binomial: P(X <= n/2) = (1 + P(X = n/2)) / 2.
        expectRelative(getObjectValue(binomDist.calculate(number(midpoint), number(trials), number(0.5), BooleanValueObject.create(true))), (1 + pmf) / 2);
        expectRelative(getObjectValue(binomDistRange.calculate(number(trials), number(0.5), number(midpoint), number(midpoint))), pmf);
        expect(getObjectValue(binomInv.calculate(number(trials), number(0.5), number(0.5)))).toBe(midpoint);
    });

    it('preserves exact small counts, domain errors and genuine overflow', () => {
        for (let n = 0; n <= 30; n++) {
            for (let k = 0; k <= n; k++) expect(calculateCombin(n, k)).toBe(Number(exactCombination(n, k)));
        }
        expect(calculateCombin(1030, 515)).toBe(Infinity);
        expect(getObjectValue(combin.calculate(number(1030), number(515)))).toBe(ErrorType.NUM);
        expect(getObjectValue(combin.calculate(number(2), number(3)))).toBe(ErrorType.NUM);
        expect(getObjectValue(combin.calculate(number(-1), number(0)))).toBe(ErrorType.NUM);
    });
});
