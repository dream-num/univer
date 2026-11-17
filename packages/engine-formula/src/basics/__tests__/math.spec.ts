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
import { calculateCombin, calculateFactorial, calculateGcd, calculateLcm } from '../math';

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

    it('Gcd retains zero handling and integer truncation', () => {
        expect(calculateGcd(0, 0)).toBe(0);
        expect(calculateGcd(0, 12)).toBe(12);
        expect(calculateGcd(12, 0)).toBe(12);
        expect(calculateGcd(18.9, 24.8)).toBe(6);
    });

    it('Lcm retains zero and ordinary integer results', () => {
        expect(calculateLcm(0, 0)).toBe(0);
        expect(calculateLcm(0, 12)).toBe(0);
        expect(calculateLcm(12, 0)).toBe(0);
        expect(calculateLcm(18, 24)).toBe(72);
    });

    it('Lcm keeps safe integer results exact when the unreduced product is large', () => {
        const pairs = [
            [1999999874, 24999998425],
            [2999999811, 50999996787],
            [4503599627370495, 9007199254740990],
            [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
        ];
        const gcd = (a: bigint, b: bigint): bigint => b === 0n ? a : gcd(b, a % b);

        for (const [a, b] of pairs) {
            const exact = BigInt(a) / gcd(BigInt(a), BigInt(b)) * BigInt(b);
            expect(exact <= BigInt(Number.MAX_SAFE_INTEGER)).toBe(true);
            expect(calculateLcm(a, b)).toBe(Number(exact));
            expect(calculateLcm(b, a)).toBe(Number(exact));
        }
    });
});
