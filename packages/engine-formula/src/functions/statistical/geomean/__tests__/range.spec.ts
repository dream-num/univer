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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Geomean } from '../index';

describe('Geometric means outside the product range', () => {
    const fn = new Geomean(FUNCTION_NAMES_STATISTICAL.GEOMEAN);

    function expectRelative(actual: number, expected: number) {
        expect(Number.isFinite(actual)).toBe(true);
        expect(Math.abs(actual / expected - 1)).toBeLessThan(1e-12);
    }

    it('retains means of repeated large and small values', () => {
        for (const value of [1e200, 1e-200, Number.MAX_VALUE, Number.MIN_VALUE]) {
            const number = NumberValueObject.create(value);
            const result = getObjectValue(fn.calculate(number, number)) as number;
            expectRelative(result, value);
        }
    });

    it('retains the mean of large arrays with moderate values', () => {
        for (const value of [1.1, 0.9, Number.MAX_VALUE]) {
            const array = ArrayValueObject.createByArray([new Array(10000).fill(value)]);
            expectRelative(getObjectValue(fn.calculate(array)) as number, value);
        }
    });

    it('recovers mixed scales regardless of input order or argument grouping', () => {
        const cases = [
            [1e200, 1e200, 1e-200, 1e-200],
            [1e-200, 1e-200, 1e200, 1e200],
            [1e200, 1e-200, 1e200, 1e-200],
        ];
        for (const values of cases) {
            const array = ArrayValueObject.createByArray([values]);
            expectRelative(getObjectValue(fn.calculate(array)) as number, 1);
            const args = values.map((value) => NumberValueObject.create(value));
            expectRelative(getObjectValue(fn.calculate(...args)) as number, 1);
        }
        const many = [...new Array(10000).fill(1e200), ...new Array(10000).fill(1e-200)];
        expectRelative(getObjectValue(fn.calculate(ArrayValueObject.createByArray([many]))) as number, 1);
    });

    it('preserves scalar coercion, ignored cells and error precedence', () => {
        const array = ArrayValueObject.createByArray([[1e200, null, true, 'ignored', 1e200]]);
        expectRelative(getObjectValue(fn.calculate(array)) as number, 1e200);
        const text = StringValueObject.create('1e200');
        expectRelative(getObjectValue(fn.calculate(text, text)) as number, 1e200);
        const large = NumberValueObject.create(1e200);
        for (const invalid of [0, -1]) {
            const number = NumberValueObject.create(invalid);
            expect(getObjectValue(fn.calculate(large, large, number))).toBe(ErrorType.NUM);
            expect(getObjectValue(fn.calculate(large, large, number, ErrorValueObject.create(ErrorType.NAME)))).toBe(ErrorType.NAME);
        }
    });

    it('recovers from subnormal intermediate products before they return to the normal range', () => {
        // Independent 100-digit reference for the binary floating-point inputs.
        const values = [1e-200, 1e-120, 1e300];
        const expected = 2.1544346900318838e-7;
        for (const inputs of [values, [...values].reverse()]) {
            expectRelative(getObjectValue(fn.calculate(ArrayValueObject.createByArray([inputs]))) as number, expected);
        }
        expectRelative(getObjectValue(fn.calculate(NumberValueObject.create(Number.MAX_VALUE), NumberValueObject.create(1))) as number, 1.3407807929942596e154);
    });

    it('preserves existing finite products and infinity behavior', () => {
        expect(getObjectValue(fn.calculate(NumberValueObject.create(3)))).toBe(3);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(4), NumberValueObject.create(9)))).toBe(6);
        const infinity = NumberValueObject.create(Infinity);
        for (const numbers of [[infinity, NumberValueObject.create(3)], [NumberValueObject.create(3), infinity], [infinity, infinity]]) {
            expect(getObjectValue(fn.calculate(...numbers))).toBe(Infinity);
        }
        for (const invalid of [0, -1]) {
            expect(getObjectValue(fn.calculate(infinity, NumberValueObject.create(invalid)))).toBe(ErrorType.NUM);
            expect(getObjectValue(fn.calculate(infinity, NumberValueObject.create(invalid), ErrorValueObject.create(ErrorType.REF)))).toBe(ErrorType.REF);
        }
    });
});
