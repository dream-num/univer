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
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Acoth } from '../index';

describe('ACOTH numerical range', () => {
    const fn = new Acoth(FUNCTION_NAMES_MATH.ACOTH);

    function calculate(value: number) {
        return getObjectValue(fn.calculate(NumberValueObject.create(value))) as number;
    }

    // Independently evaluated with 400-digit arithmetic at the exact binary inputs.
    it('retains small signed results for large finite inputs', () => {
        const fixtures: [number, number][] = [
            [100000000, 1e-8],
            [10000000000000000, 1e-16],
            [1e+100, 1e-100],
        ];
        for (const [value, expected] of fixtures) {
            for (const sign of [1, -1]) {
                const result = calculate(sign * value);
                expect(Math.abs(result / (sign * expected) - 1)).toBeLessThan(1e-15);
                expect(Math.sign(result)).toBe(sign);
            }
        }
    });

    it.each([8e307, 1e307 * 10, Number.MAX_VALUE, 4.494232837155791e307])(
        'flushes both signs of subnormal ACOTH(%s) to positive zero',
        (value) => {
            expect(calculate(value)).toBe(0);
            expect(calculate(-value)).toBe(0);
        }
    );

    it.each([
        [4.4942328371557893e307, 2.225073858507202e-308],
        [2 ** 1022, 2 ** -1022],
        [2 ** 1021, 2 ** -1021],
    ])('keeps normal results at the underflow boundary for %s', (value, expected) => {
        expect(calculate(value)).toBe(expected);
        expect(calculate(-value)).toBe(-expected);
    });

    it.each(['8e307', '-8e307', '1e308', '-1e308'])(
        'applies the worksheet underflow boundary to scalar text %s',
        (value) => {
            expect(getObjectValue(fn.calculate(StringValueObject.create(value)))).toBe(0);
        }
    );

    it('applies underflow independently to mixed array entries', () => {
        const result = getObjectValue(fn.calculate(ArrayValueObject.createByArray([
            [8e307, 2 ** 1022, 1e16],
            [-8e307, -(2 ** 1022), -1e16],
        ]))) as number[][];
        expect(result.map((row) => row.slice(0, 2))).toEqual([[0, 2 ** -1022], [0, -(2 ** -1022)]]);
        expect(Math.abs(result[0][2] / 1e-16 - 1)).toBeLessThan(1e-15);
        expect(Math.abs(result[1][2] / -1e-16 - 1)).toBeLessThan(1e-15);
    });

    it('retains accuracy close to both domain boundaries', () => {
        const fixtures: [number, number][] = [
            [1.0000000000000002, 18.36840028483855],
            [1.0000000009313226, 10.743781298911983],
            [1.0000009536743164, 7.278045634297948],
            [1.5, 0.8047189562170501],
            [2, 0.5493061443340549],
        ];
        for (const [value, expected] of fixtures) {
            for (const sign of [1, -1]) {
                expect(Math.abs(calculate(sign * value) / (sign * expected) - 1)).toBeLessThan(1e-15);
            }
        }
    });

    it('evaluates arrays and converted scalar strings', () => {
        const scalar = getObjectValue(fn.calculate(StringValueObject.create('1e16'))) as number;
        expect(Math.abs(scalar / 1e-16 - 1)).toBeLessThan(1e-15);
        const result = getObjectValue(fn.calculate(ArrayValueObject.createByArray([[1e16, -1e16], [1e100, -1e100]]))) as number[][];
        const expected = [[1e-16, -1e-16], [1e-100, -1e-100]];
        expect(result.map((row) => row.length)).toEqual([2, 2]);
        for (let row = 0; row < 2; row++) {
            for (let column = 0; column < 2; column++) {
                expect(Math.abs(result[row][column] / expected[row][column] - 1)).toBeLessThan(1e-15);
            }
        }
    });

    it('retains domain, non-finite and error behavior', () => {
        for (const value of [-1, 1, 0, -0, 0.5, -0.5]) expect(calculate(value)).toBe(ErrorType.NUM);
        for (const value of [Infinity, -Infinity, NaN]) expect(calculate(value)).toBe(ErrorType.VALUE);
        expect(getObjectValue(fn.calculate(ErrorValueObject.create(ErrorType.REF)))).toBe(ErrorType.REF);
    });
});
