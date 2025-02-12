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
import { BESSEL } from '../engineering';

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
