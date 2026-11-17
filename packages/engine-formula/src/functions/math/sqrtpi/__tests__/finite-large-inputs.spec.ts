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
import { Sqrtpi } from '../index';

describe('SQRTPI finite large inputs', () => {
    const fn = new Sqrtpi(FUNCTION_NAMES_MATH.SQRTPI);

    it('returns finite square roots when multiplication by pi overflows', () => {
        // Independent 100-digit sqrt(x*pi) references at the exact binary inputs.
        const fixtures: [number, number][] = [
            [1e+308, 1.7724538509055162e+154],
            [1.7976931348623157e+308, 2.376472079762827e+154],
            [8.98846567431158e+307, 1.680419522900793e+154],
            [5.722292193863772e+307, 1.340787496881465e+154],
        ];
        for (const [value, expected] of fixtures) {
            const result = getObjectValue(fn.calculate(NumberValueObject.create(value))) as number;
            expect(Number.isFinite(result)).toBe(true);
            expect(Math.abs(result / expected - 1)).toBeLessThan(1e-15);
        }
    });

    it('uses the finite result for scalar strings and single-cell arrays', () => {
        const expected = 1.7724538509055162e154;
        for (const input of [StringValueObject.create('1e308'), ArrayValueObject.createByArray([[1e308]])]) {
            const result = getObjectValue(fn.calculate(input)) as number;
            expect(Number.isFinite(result)).toBe(true);
            expect(Math.abs(result / expected - 1)).toBeLessThan(1e-15);
        }
    });

    it('preserves the direct calculation for finite products', () => {
        for (const value of [0, -0, Number.MIN_VALUE, 1e-308, 1e-100, 1, 2, 100, Number.MAX_VALUE / Math.PI / 2]) {
            const result = getObjectValue(fn.calculate(NumberValueObject.create(value)));
            expect(Object.is(result, Math.sqrt(value * Math.PI))).toBe(true);
        }
    });

    it('preserves non-finite inputs, negative values and errors', () => {
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Infinity)))).toBe(Infinity);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(NaN)))).toBeNaN();
        expect(getObjectValue(fn.calculate(NumberValueObject.create(-Number.MAX_VALUE)))).toBe(ErrorType.NUM);
        expect(getObjectValue(fn.calculate(ErrorValueObject.create(ErrorType.REF)))).toBe(ErrorType.REF);
    });
});
