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
import { calculateMdeterm } from '../../../../basics/math';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Mdeterm } from '../index';

function exactDeterminant3(matrix: number[][]): bigint {
    const [[a, b, c], [d, e, f], [g, h, i]] = matrix.map((row) => row.map((value) => BigInt(value)));
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

describe('Determinants with small nonzero pivots', () => {
    const fn = new Mdeterm(FUNCTION_NAMES_MATH.MDETERM);

    it('retains a unit determinant with differently scaled diagonal entries', () => {
        const matrix = [[2 ** -50, 0, 0], [0, 2 ** 25, 0], [0, 0, 2 ** 25]];
        expect(calculateMdeterm(matrix)).toBe(1);
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray(matrix)))).toBe(1);
    });

    it('retains small determinants and row-swap signs', () => {
        for (const exponent of [-40, -80, -500]) {
            const scale = 2 ** exponent;
            const diagonal = [[scale, 0, 0], [0, 1, 0], [0, 0, 1]];
            expect(calculateMdeterm(diagonal)).toBe(scale);
            expect(calculateMdeterm([diagonal[1], diagonal[0], diagonal[2]])).toBe(-scale);
        }
        for (const size of [3, 4, 6]) {
            const matrix = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => row === column ? 2 ** -40 : 0));
            expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray(matrix)))).toBe(2 ** (-40 * size));
        }
    });

    it('scales general matrices according to an exact integer determinant oracle', () => {
        let seed = 172026;
        const next = () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed % 19 - 9;
        };
        let checked = 0;
        while (checked < 30) {
            const original = Array.from({ length: 3 }, () => Array.from({ length: 3 }, next));
            const determinant = exactDeterminant3(original);
            if (determinant === 0n) continue;
            const scale = 2 ** (-44 - checked);
            const matrix = original.map((row, index) => row.map((value) => index === 0 ? value * scale : value));
            const expected = Number(determinant) * scale;
            const result = getObjectValue(fn.calculate(ArrayValueObject.createByArray(matrix))) as number;
            expect(Math.abs(result / expected - 1)).toBeLessThan(1e-12);
            checked++;
        }
    });

    it('retains exact-zero singular matrices', () => {
        const scale = 2 ** -50;
        const matrices = [
            [[scale, 0, 0], [0, 0, 0], [0, 0, 1]],
            [[scale, 2 * scale, 3 * scale], [scale, 2 * scale, 3 * scale], [4, 5, 6]],
            [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        ];
        for (const matrix of matrices) {
            expect(calculateMdeterm(matrix)).toBe(0);
            expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray(matrix)))).toBe(0);
        }
    });

    it('returns positive zero for subnormal worksheet results', () => {
        const matrices = [
            [[1e-103, 0, 0], [0, 1e-103, 0], [0, 0, 1e-103]],
            [[2 ** -511, 0], [0, 2 ** -512]],
            [[Number.MIN_VALUE]],
        ];
        for (const matrix of matrices) {
            for (const sign of [-1, 1]) {
                const signed = matrix.map((row, index) => row.map((value) => index === 0 ? sign * value : value));
                const rawResult = calculateMdeterm(signed);
                expect(Math.abs(rawResult)).toBeGreaterThan(0);
                expect(Math.abs(rawResult)).toBeLessThan(2 ** -1022);
                expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray(signed)))).toBe(0);
            }
        }
    });

    it('preserves normal results at the worksheet underflow boundary', () => {
        const scale = 2 ** -511;
        const spacing = 2 ** -563;
        for (const offset of [-1, 0, 1]) {
            const matrix = [[scale, 0, 0], [0, scale + offset * spacing, 0], [0, 0, 1]];
            const expected = 2 ** -1022 + offset * Number.MIN_VALUE;
            for (const sign of [-1, 1]) {
                const signed = matrix.map((row, index) => row.map((value) => index === 0 ? sign * value : value));
                expect(calculateMdeterm(signed)).toBe(sign * expected);
                const result = getObjectValue(fn.calculate(ArrayValueObject.createByArray(signed)));
                expect(result).toBe(offset < 0 ? 0 : sign * expected);
            }
        }
    });

    it('keeps subnormal intermediate products when the final result is normal', () => {
        const matrix = [[2 ** -511, 0, 0], [0, 2 ** -512, 0], [0, 0, 2]];
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray(matrix)))).toBe(2 ** -1022);
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray([matrix[1], matrix[0], matrix[2]])))).toBe(-(2 ** -1022));
    });

    it('preserves scalar signed zeros', () => {
        for (const value of [0, -0]) {
            expect(getObjectValue(fn.calculate(NumberValueObject.create(value)))).toBe(value);
        }
    });
});
