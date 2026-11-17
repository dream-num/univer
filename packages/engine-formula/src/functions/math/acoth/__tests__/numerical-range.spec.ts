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
            [1.7976931348623157e+308, 5.562684646268003e-309],
        ];
        for (const [value, expected] of fixtures) {
            for (const sign of [1, -1]) {
                const result = calculate(sign * value);
                expect(Math.abs(result / (sign * expected) - 1)).toBeLessThan(1e-15);
                expect(Math.sign(result)).toBe(sign);
            }
        }
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
