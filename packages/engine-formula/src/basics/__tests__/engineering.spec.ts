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
import { Complex } from '../complex';
import { BESSEL, erf, erfc } from '../engineering';

describe('Test ref regex', () => {
    it('BESSEL.besselj test', () => {
        expect(BESSEL.besselj(3, 0)).toStrictEqual(-0.2600519577199309);
        expect(BESSEL.besselj(9, 0)).toStrictEqual(-0.09033361101567323);
        expect(BESSEL.besselj(9, 1)).toStrictEqual(0.2453117865662281);
        expect(BESSEL.besselj(0, 1)).toStrictEqual(0);
        expect(BESSEL.besselj(0, 2)).toStrictEqual(0);
        expect(BESSEL.besselj(-1, 1)).toStrictEqual(-0.4400505856771301);
        expect(BESSEL.besselj(3, 2)).toStrictEqual(0.4860912632349548);
        expect(BESSEL.besselj(2, 3)).toStrictEqual(0.12894324997562717);
        expect(BESSEL.besselj(2, 300)).toStrictEqual(Number.NaN);
    });

    it('BESSEL.bessely test', () => {
        expect(BESSEL.bessely(3, 0)).toStrictEqual(0.3768500150996341);
        expect(BESSEL.bessely(9, 0)).toStrictEqual(0.24993669828517454);
        expect(BESSEL.bessely(9, 1)).toStrictEqual(0.10431457495919716);
    });

    it('BESSEL.besseli test', () => {
        expect(BESSEL.besseli(4, 4)).toStrictEqual(1.4162757349797126);
        expect(BESSEL.besseli(4, 0)).toStrictEqual(11.301922170199603);
        expect(BESSEL.besseli(4, 1)).toStrictEqual(9.759465157394443);
        expect(BESSEL.besseli(1, 0)).toStrictEqual(1.2660658480342601);
        expect(BESSEL.besseli(0, 1)).toStrictEqual(0);
        expect(BESSEL.besseli(0, 2)).toStrictEqual(0);
        expect(BESSEL.besseli(2, 300)).toStrictEqual(Number.NaN);
    });

    it('BESSEL.besselk test', () => {
        expect(BESSEL.besselk(3, 3)).toStrictEqual(0.12217037599313321);
        expect(BESSEL.besselk(3, 0)).toStrictEqual(0.03473950439930018);
        expect(BESSEL.besselk(1, 0)).toStrictEqual(0.421024421083418);
    });

    it('Complex test createByComplexStr', () => {
        const complex = Complex.createByComplexStr(0, 1, 'i');
        const realNum = complex.getRealNum();
        const iNum = complex.getINum();
        const suffix = complex.getSuffix();
        const result = Complex.getComplex(realNum, iNum, suffix);
        expect(result).toStrictEqual('i');
    });

    it('Complex test isError', () => {
        let complex = new Complex('1+1');
        expect(complex.isError()).toStrictEqual(true);

        complex = new Complex('1+ti');
        expect(complex.isError()).toStrictEqual(true);

        complex = new Complex('1-ti');
        expect(complex.isError()).toStrictEqual(true);

        complex = new Complex('1+ttt');
        expect(complex.isError()).toStrictEqual(true);

        complex = new Complex('ti');
        expect(complex.isError()).toStrictEqual(true);

        complex = new Complex('+ti');
        expect(complex.isError()).toStrictEqual(true);

        complex = new Complex('12i');
        expect(complex.isError()).toStrictEqual(false);

        complex = new Complex('1-i');
        expect(complex.isError()).toStrictEqual(false);
    });
});

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
