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
import { calculateCombin, calculateFactorial } from '../math';

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

describe('Test math', () => {
    it('Factorial test', () => {
        expect(calculateFactorial(0)).toBe(1);
        expect(calculateFactorial(1)).toBe(1);
        expect(calculateFactorial(1.9)).toBe(1);
        expect(calculateFactorial(5)).toBe(120);
        expect(calculateFactorial(-1)).toBe(Number.NaN);
        expect(calculateFactorial(171)).toBe(Infinity);
    });

    it('Combin test', () => {
        expect(calculateCombin(8, 2)).toBe(28);
        expect(calculateCombin(1000000, 2000)).toBe(Infinity);
    });

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

    it('preserves exact small counts and genuine overflow', () => {
        for (let n = 0; n <= 30; n++) {
            for (let k = 0; k <= n; k++) expect(calculateCombin(n, k)).toBe(Number(exactCombination(n, k)));
        }
        expect(calculateCombin(1030, 515)).toBe(Infinity);
    });
});
