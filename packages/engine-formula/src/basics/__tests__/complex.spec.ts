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

import { DateSystem, excelDateSerial } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { Complex } from '../complex';

/**
 * `2-3` is the text to number conversion of February 3 of the current year,
 * just like Excel, so the expected serial cannot be a constant.
 */
function februaryThirdSerial(dateSystem: DateSystem = DateSystem.Date1900): number {
    return excelDateSerial(new Date(Date.UTC(new Date().getUTCFullYear(), 1, 3)), dateSystem);
}

describe('Test complex', () => {
    it('Parses a real part written with an exponent', () => {
        const complex = new Complex('1e-7-i');

        expect(complex.isError()).toBe(false);
        expect(complex.getRealNum()).toBe(1e-7);
        expect(complex.getINum()).toBe(-1);
    });

    it('Parses exponents with an explicit sign in both parts', () => {
        const complex = new Complex('-1E+3-2e-3j');

        expect(complex.isError()).toBe(false);
        expect(complex.getRealNum()).toBe(-1000);
        expect(complex.getINum()).toBe(-0.002);
        expect(complex.getSuffix()).toBe('j');
    });

    it('Reads back what getComplex writes for a tiny real part', () => {
        const complex = Complex.createByComplexStr(1e-7, -1, 'i');

        expect(complex.isError()).toBe(false);
        expect(complex.getRealNum()).toBe(1e-7);
        expect(complex.getINum()).toBe(-1);
    });

    it('Keeps the sign after the first one inside the imaginary part', () => {
        const complex = new Complex('1+2-3i');

        expect(complex.isError()).toBe(false);
        expect(complex.getRealNum()).toBe(1);
        expect(complex.getINum()).toBe(februaryThirdSerial());

        const negated = new Complex('1-2-3i');

        expect(negated.isError()).toBe(false);
        expect(negated.getRealNum()).toBe(1);
        expect(negated.getINum()).toBe(-februaryThirdSerial());
    });

    it('Rejects a sign inside the imaginary part that is not a number', () => {
        expect(new Complex('1-2+3i').isError()).toBe(true);
        expect(new Complex('1+2+3i').isError()).toBe(true);
    });

    it('Reads a date part with the workbook date system', () => {
        const complex = new Complex('1+2-3i', DateSystem.Date1904);

        expect(complex.isError()).toBe(false);
        expect(complex.getRealNum()).toBe(1);
        expect(complex.getINum()).toBe(februaryThirdSerial(DateSystem.Date1904));
    });

    it('Reads the parts with the text to number conversion of a cell', () => {
        const percent = new Complex('1+50%i');

        expect(percent.isError()).toBe(false);
        expect(percent.getRealNum()).toBe(1);
        expect(percent.getINum()).toBe(0.5);

        const spaced = new Complex(' 1+2i ');

        expect(spaced.isError()).toBe(false);
        expect(spaced.getRealNum()).toBe(1);
        expect(spaced.getINum()).toBe(2);

        const currency = new Complex('1+$2i');

        expect(currency.isError()).toBe(false);
        expect(currency.getRealNum()).toBe(1);
        expect(currency.getINum()).toBe(2);

        const grouped = new Complex('1+1,234i');

        expect(grouped.isError()).toBe(false);
        expect(grouped.getRealNum()).toBe(1);
        expect(grouped.getINum()).toBe(1234);
    });

    it('Rejects a part that is not a finite number', () => {
        expect(new Complex('1+0x10i').isError()).toBe(true);
        expect(new Complex('1+Infinity i').isError()).toBe(true);
    });

    it('Writes tiny numbers in plain decimal notation', () => {
        expect(Complex.getComplex(1e-7, -1, 'i')).toBe('0.0000001-i');
        expect(Complex.getComplex(1e-7, 1, 'i')).toBe('0.0000001+i');
    });

    it('Rounds to 15 significant digits', () => {
        expect(Complex.getComplex(2 / 3, 1, 'i')).toBe('0.666666666666667+i');
        expect(Complex.getComplex(0.1 + 0.2, 1, 'i')).toBe('0.3+i');
    });

    it('Omits the coefficient of a unit imaginary part', () => {
        expect(Complex.getComplex(0, 1, 'i')).toBe('i');
        expect(Complex.getComplex(0, -1, 'i')).toBe('-i');
        expect(Complex.getComplex(1, -1, 'i')).toBe('1-i');
        expect(Complex.getComplex(1, 1, 'i')).toBe('1+i');
    });

    it('Keeps plain notation while it fits in 21 characters', () => {
        expect(Complex.getComplex(1e-19, 1, 'i')).toBe('0.0000000000000000001+i');
        expect(Complex.getComplex(1e20, 1, 'i')).toBe('100000000000000000000+i');
        expect(Complex.getComplex(0.0000123456789012345, 1, 'i')).toBe('0.0000123456789012345+i');
    });

    it('Falls back to scientific notation past that width', () => {
        expect(Complex.getComplex(1e-20, 1, 'i')).toBe('1E-20+i');
        expect(Complex.getComplex(1.5e-19, 1, 'i')).toBe('1.5E-19+i');
        expect(Complex.getComplex(0.00000123456789012345, 1, 'i')).toBe('1.23456789012345E-06+i');
        expect(Complex.getComplex(1e21, 1, 'i')).toBe('1E+21+i');
    });
});
