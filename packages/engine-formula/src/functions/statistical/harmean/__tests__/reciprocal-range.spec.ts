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
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Harmean } from '../index';

describe('HARMEAN reciprocal range', () => {
    const fn = new Harmean(FUNCTION_NAMES_STATISTICAL.HARMEAN);

    function calculate(values: number[]) {
        return getObjectValue(fn.calculate(ArrayValueObject.createByArray([values]))) as number;
    }

    it('retains identical tiny positive values when reciprocals overflow', () => {
        for (const value of [Number.MIN_VALUE, 1e-309, 1e-308]) {
            expect(getObjectValue(fn.calculate(NumberValueObject.create(value)))).toBe(value);
            expect(calculate([value, value])).toBe(value);
        }
        expect(calculate(new Array(1000).fill(1e-306))).toBe(1e-306);
    });

    it('retains finite upper endpoints when inversion overflows', () => {
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Number.MAX_VALUE)))).toBe(Number.MAX_VALUE);
        expect(calculate([Number.MAX_VALUE, Number.MAX_VALUE])).toBe(Number.MAX_VALUE);
    });

    it('handles the full positive range independently of input order', () => {
        for (const values of [
            [Number.MIN_VALUE, Number.MAX_VALUE],
            [Number.MAX_VALUE, Number.MIN_VALUE],
        ]) {
            expect(calculate(values)).toBe(2 * Number.MIN_VALUE);
        }
        expect(calculate([Number.MIN_VALUE, 2 * Number.MIN_VALUE])).toBe(Number.MIN_VALUE);
        expect(calculate([2 * Number.MIN_VALUE, Number.MIN_VALUE])).toBe(Number.MIN_VALUE);
        expect(calculate([Number.MIN_VALUE, 2 * Number.MIN_VALUE, 4 * Number.MIN_VALUE])).toBe(2 * Number.MIN_VALUE);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Number.MIN_VALUE), NumberValueObject.create(Infinity)))).toBe(2 * Number.MIN_VALUE);
    });

    it('rescales reciprocal sums across changing minima and argument groups', () => {
        const scale = 2 ** -1020;
        const values = Array.from({ length: 1536 }, (_, index) => scale * 2 ** (index % 3));
        // H(s, 2s, 4s) = 3 / ((1 + 1/2 + 1/4) / s) = 12s/7.
        const expected = 12 * scale / 7;
        for (const data of [values, [...values].reverse()]) {
            expect(Math.abs(calculate(data) / expected - 1)).toBeLessThan(1e-14);
            const result = fn.calculate(
                ArrayValueObject.createByArray([data.slice(0, 500)]),
                ArrayValueObject.createByArray([data.slice(500, 1000)]),
                ArrayValueObject.createByArray([data.slice(1000)])
            );
            expect(Math.abs((getObjectValue(result) as number) / expected - 1)).toBeLessThan(1e-14);
        }
    });

    it('retains ordinary results and non-finite input behavior', () => {
        expect(calculate([1, 2])).toBe(4 / 3);
        expect(calculate([1, 2, 4])).toBe(12 / 7);
        expect(calculate([3])).toBe(3);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(1), NumberValueObject.create(Infinity)))).toBe(2);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Number.MAX_VALUE), NumberValueObject.create(Infinity)))).toBe(Infinity);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Infinity), NumberValueObject.create(Infinity)))).toBe(Infinity);
        expect(calculate([1, Infinity])).toBe(ErrorType.NUM);
    });

    it('retains nonpositive, invalid and later-error precedence', () => {
        expect(calculate([Number.MIN_VALUE, 0])).toBe(ErrorType.NUM);
        expect(calculate([Number.MIN_VALUE, -1])).toBe(ErrorType.NUM);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Number.MIN_VALUE), NumberValueObject.create(0), ErrorValueObject.create(ErrorType.REF)))).toBe(ErrorType.REF);
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray([[Number.MIN_VALUE, 0, ErrorType.NAME]])))).toBe(ErrorType.NAME);
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray([[null, true, 'text']])))).toBe(ErrorType.NA);
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray([[NaN]])))).toBe(ErrorType.NUM);
    });
});
