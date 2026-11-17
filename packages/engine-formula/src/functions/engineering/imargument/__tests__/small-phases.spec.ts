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
import { Complex } from '../../../../basics/complex';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { Complex as ComplexFunction } from '../../complex';
import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Imargument } from '../index';

describe('IMARGUMENT small phases', () => {
    const fn = new Imargument(FUNCTION_NAMES_ENGINEERING.IMARGUMENT);

    function calculate(input: string) {
        return fn.calculate(StringValueObject.create(input)).getValue() as number;
    }

    it('retains small signed phases along the positive real axis', () => {
        for (const imaginary of [1e-10, 1e-12, 1e-100, 1e-300]) {
            for (const sign of [1, -1]) {
                const input = `1${sign > 0 ? '+' : '-'}${imaginary}i`;
                // atan(y) = y + O(y^3), below one double ULP for these y.
                const expected = sign * imaginary;
                expect(calculate(input)).toBe(expected);
                expect(new Complex(input).Argument()).toBe(expected);
            }
        }
    });

    it.each([
        '1+5e-324i',
        '1-5e-324i',
        '1+2.2250738585072e-308i',
        '1-2.2250738585072e-308i',
        '1e300+1e-20i',
        '1e300-1e-20i',
    ])('flushes the subnormal worksheet phase of %s to positive zero', (input) => {
        expect(Object.is(calculate(input), 0)).toBe(true);
    });

    it('flushes subnormal results returned by IMARGUMENT after COMPLEX', () => {
        const complex = new ComplexFunction(FUNCTION_NAMES_ENGINEERING.COMPLEX);
        for (const sign of [1, -1]) {
            const input = complex.calculate(NumberValueObject.create(1e300), NumberValueObject.create(sign * 1e-20));
            expect(Object.is(fn.calculate(input).getValue(), 0)).toBe(true);
        }
    });

    it('retains signed normal worksheet phases immediately above the subnormal boundary', () => {
        for (const sign of [1, -1]) {
            const input = `1${sign > 0 ? '+' : '-'}2.225073858507202e-308i`;
            const result = calculate(input);
            expect(Math.abs(result)).toBeGreaterThanOrEqual(2 ** -1022);
            expect(result).toBe(sign * 2.225073858507202e-308);
        }
    });

    it('keeps subnormal precision inside the complex helper', () => {
        expect(new Complex('1+5e-324i').Argument()).toBe(Number.MIN_VALUE);
        expect(new Complex('1-5e-324i').Argument()).toBe(-Number.MIN_VALUE);
    });

    it('flushes a subnormal phase from a single-cell array', () => {
        expect(Object.is(fn.calculate(ArrayValueObject.createByArray([['1e300-1e-20i']])).getValue(), 0)).toBe(true);
    });

    it('retains the distance from the negative real axis', () => {
        // Independent 100-digit atan2 references rounded to double.
        expect(Math.abs(calculate('-1+1e-12i') - 3.141592653588793)).toBeLessThan(1e-15);
        expect(Math.abs(calculate('-1-1e-12i') + 3.141592653588793)).toBeLessThan(1e-15);
    });

    it('preserves quadrants, scale and the imaginary suffix', () => {
        const fixtures: [string, number][] = [
            ['1e-300+1e-300i', 0.7853981633974483],
            ['-1e300+1e300i', 2.356194490192345],
            ['-1e300-1e300j', -2.356194490192345],
            ['1e300-1e300j', -0.7853981633974483],
            ['1+1e-12j', 1e-12],
        ];
        for (const [input, expected] of fixtures) {
            expect(Math.abs(calculate(input) / expected - 1)).toBeLessThan(1e-15);
        }
        expect(fn.calculate(ArrayValueObject.createByArray([['1+1e-12i']])).getValue()).toBe(1e-12);
    });

    it('preserves coordinate axes and signed-zero conventions', () => {
        for (const input of ['-1', '-1+0i', '-1-0i']) expect(calculate(input)).toBe(Math.PI);
        for (const input of ['1', '1+0i', '1-0i']) expect(Object.is(calculate(input), 0)).toBe(true);
        expect(calculate('i')).toBe(1.570796326794897);
        expect(calculate('-i')).toBe(-1.570796326794897);
    });

    it('preserves zero, invalid-input and existing-error behavior', () => {
        expect(calculate('0')).toBe(ErrorType.DIV_BY_ZERO);
        expect(calculate('-0-0i')).toBe(ErrorType.DIV_BY_ZERO);
        expect(new Complex('0').Argument()).toBeNaN();
        expect(calculate('not a complex number')).toBe(ErrorType.NUM);
        expect(fn.calculate(ErrorValueObject.create(ErrorType.REF)).getValue()).toBe(ErrorType.REF);
    });
});
