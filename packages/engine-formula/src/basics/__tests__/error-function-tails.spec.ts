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
import { erf, erfc } from '../engineering';

describe('Complementary error-function tails', () => {
    it('retains representable positive tails', () => {
        // References evaluated with 120-digit mpmath arithmetic.
        const cases = [
            [5, 1.537459794428035e-12],
            [6, 2.1519736712498913e-17],
            [10, 2.088487583762545e-45],
            [20, 5.395865611607901e-176],
            [26, 5.663192408856143e-296],
        ];
        for (const [x, expected] of cases) {
            expect(Math.abs(erfc(x) / expected - 1)).toBeLessThan(1e-12);
        }
    });

    it('retains a subnormal complementary tail', () => {
        const actual = erfc(27);
        expect(actual).toBeGreaterThan(0);
        expect(Math.abs(actual - 5.23705e-319)).toBeLessThanOrEqual(2 * Number.MIN_VALUE);
    });

    it('retains zero, symmetry and limiting values', () => {
        expect(erfc(0)).toBe(1);
        expect(erfc(-0)).toBe(1);
        expect(erfc(Infinity)).toBe(0);
        expect(erfc(-Infinity)).toBe(2);
        expect(erfc(Number.NaN)).toBeNaN();
        expect(erf(0)).toBe(0);
        expect(erf(-0)).toBe(0);
        expect(erf(Infinity)).toBe(1);
        expect(erf(-Infinity)).toBe(-1);
        expect(erf(Number.NaN)).toBeNaN();
        for (const x of [0.125, 0.5, 1, 2, 5]) {
            expect(erf(-x)).toBe(-erf(x));
            expect(erfc(-x)).toBeCloseTo(2 - erfc(x), 15);
        }
    });
});
