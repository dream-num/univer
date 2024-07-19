/**
 * Copyright 2023-present DreamNum Inc.
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

import { describe, expect, it, vi } from 'vitest';

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Randarray } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test randarray function', () => {
    const testFunction = new Randarray(FUNCTION_NAMES_MATH.RANDARRAY);

    describe('Randarray', () => {
        const mockRandom = vi.spyOn(Math, 'random');
        mockRandom.mockReturnValue(0.5);

        it('function is normal', () => {
            const result = testFunction.calculate();
            expect(result.getValue()).toBe(0.5);
        });

        it('rows is number', () => {
            const rows = NumberValueObject.create(3);
            const result = testFunction.calculate(rows);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [0.5],
                [0.5],
                [0.5],
            ]);
        });

        it('rows is number, columns is number', () => {
            const rows = NumberValueObject.create(3);
            const columns = NumberValueObject.create(3);
            const result = testFunction.calculate(rows, columns);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [0.5, 0.5, 0.5],
                [0.5, 0.5, 0.5],
                [0.5, 0.5, 0.5],
            ]);
        });

        it('rows or columns is 0/-2/false/blank cell', () => {
            const rows = NumberValueObject.create(0);
            const result = testFunction.calculate(rows);
            expect(result.getValue()).toBe(ErrorType.CALC);

            const rows2 = NumberValueObject.create(-2);
            const result2 = testFunction.calculate(rows2);
            expect(result2.getValue()).toBe(ErrorType.VALUE);

            const rows3 = BooleanValueObject.create(false);
            const result3 = testFunction.calculate(rows3);
            expect(result3.getValue()).toBe(ErrorType.CALC);

            const rows4 = NullValueObject.create();
            const result4 = testFunction.calculate(rows4);
            expect(result4.getValue()).toBe(ErrorType.CALC);
        });

        it('Value is array', () => {
            const rows = NumberValueObject.create(6);
            const columns = NumberValueObject.create(6);
            const min = ArrayValueObject.createByArray([
                [1],
                [2],
            ]);
            const max = ArrayValueObject.createByArray([
                [1, 2],
                [2, 3],
            ]);
            const result = testFunction.calculate(rows, columns, min, max);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1, 1.5],
                [2, 2.5],
            ]);
        });

        it('min > max', () => {
            const rows = NumberValueObject.create(3);
            const columns = NumberValueObject.create(3);
            const min = NumberValueObject.create(3);
            const max = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, min, max);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('wholeNumber', () => {
            const rows = NumberValueObject.create(6);
            const columns = NumberValueObject.create(6);
            const min = ArrayValueObject.createByArray([
                [1],
                [2],
            ]);
            const max = ArrayValueObject.createByArray([
                [1, 2.5],
                [2, 3],
            ]);
            const wholeNumber = ArrayValueObject.createByArray([
                [null, 1],
                [null, null],
            ]);
            const result = testFunction.calculate(rows, columns, min, max, wholeNumber);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1, ErrorType.VALUE],
                [2, 2.5],
            ]);
        });
    });
});
