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

// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
    decimalFromNumber,
    decimalPartsToNumber,
    decimalPartsToPlainString,
    roundDecimal,
    roundScientificDecimal,
    shiftDecimal,
} from '../decimal';

describe('spreadsheet decimal rounding', () => {
    it('rejects non-finite numbers', () => {
        expect(() => decimalFromNumber(Number.NaN)).toThrow(RangeError);
        expect(() => decimalFromNumber(Number.POSITIVE_INFINITY)).toThrow(RangeError);
        expect(() => decimalFromNumber(Number.NEGATIVE_INFINITY)).toThrow(RangeError);
    });

    it('canonicalizes to 15 significant digits', () => {
        expect(decimalFromNumber(10.155)).toEqual({
            negative: false,
            digits: '10155',
            exponent: 1,
        });
        expect(decimalFromNumber(450000000000000.44)).toEqual({
            negative: false,
            digits: '45',
            exponent: 14,
        });
        expect(decimalFromNumber(1.234567890123456)).toEqual({
            negative: false,
            digits: '123456789012346',
            exponent: 0,
        });
    });

    it('preserves signed zero while canonicalizing and shifting', () => {
        expect(decimalFromNumber(0)).toEqual({
            negative: false,
            digits: '0',
            exponent: 0,
        });
        expect(shiftDecimal(decimalFromNumber(-0), 12)).toEqual({
            negative: true,
            digits: '0',
            exponent: 0,
        });
    });

    it('rounds magnitude half-up for either sign', () => {
        expect(roundDecimal(decimalFromNumber(1.005), 2)).toEqual({
            negative: false,
            integer: '1',
            fraction: '01',
            zero: false,
        });
        expect(roundDecimal(decimalFromNumber(-1.005), 2)).toEqual({
            negative: true,
            integer: '1',
            fraction: '01',
            zero: false,
        });
    });

    it('distinguishes values immediately below and above a half tie', () => {
        expect(decimalPartsToNumber(roundDecimal(decimalFromNumber(1.00499999999999), 2))).toBe(1);
        expect(decimalPartsToNumber(roundDecimal(decimalFromNumber(1.00500000000001), 2))).toBe(1.01);
    });

    it('rounds negative places and carries across the integer boundary', () => {
        expect(decimalPartsToNumber(roundDecimal(decimalFromNumber(50), -2))).toBe(100);
        expect(decimalPartsToNumber(roundDecimal(decimalFromNumber(9.995), 2))).toBe(10);
        expect(decimalPartsToNumber(roundDecimal(decimalFromNumber(999.5), 0))).toBe(1000);
    });

    it('scales by shifting the decimal exponent', () => {
        const percent = shiftDecimal(decimalFromNumber(0.10155), 2.9);

        expect(percent).toEqual({
            negative: false,
            digits: '10155',
            exponent: 1,
        });
        expect(roundDecimal(percent, 2)).toMatchObject({
            integer: '10',
            fraction: '16',
        });
    });

    it('normalizes rounded zero to positive number and plain string output', () => {
        const rounded = roundDecimal(decimalFromNumber(-0.004), 2);

        expect(rounded).toEqual({
            negative: true,
            integer: '0',
            fraction: '',
            zero: true,
        });
        expect(Object.is(decimalPartsToNumber(rounded), -0)).toBe(false);
        expect(decimalPartsToPlainString(rounded)).toBe('0');
        expect(decimalPartsToPlainString(roundDecimal(decimalFromNumber(-1.005), 2))).toBe('-1.01');
    });

    it('normalizes scientific carry', () => {
        expect(roundScientificDecimal(decimalFromNumber(9.995), 1, true, 2)).toEqual({
            exponent: 1,
            rounded: {
                negative: false,
                integer: '1',
                fraction: '',
                zero: false,
            },
        });
    });

    it('keeps scientific zero at exponent zero', () => {
        expect(roundScientificDecimal(decimalFromNumber(-0), 3, false, 4)).toEqual({
            exponent: 0,
            rounded: {
                negative: true,
                integer: '0',
                fraction: '',
                zero: true,
            },
        });
    });

    it('groups engineering notation by the requested integer digits', () => {
        expect(roundScientificDecimal(decimalFromNumber(12345), 3, true, 2)).toEqual({
            exponent: 3,
            rounded: {
                negative: false,
                integer: '12',
                fraction: '35',
                zero: false,
            },
        });
    });

    it('shifts scientific notation without an integer pattern', () => {
        expect(roundScientificDecimal(decimalFromNumber(12.34), 1, false, 2)).toEqual({
            exponent: 2,
            rounded: {
                negative: false,
                integer: '0',
                fraction: '12',
                zero: false,
            },
        });
    });
});
