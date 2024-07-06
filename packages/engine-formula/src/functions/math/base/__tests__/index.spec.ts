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

import { describe, expect, it } from 'vitest';

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Base } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test base function', () => {
    const testFunction = new Base(FUNCTION_NAMES_MATH.BASE);

    describe('Base', () => {
        it('All value is normal', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(2);
            const minLength = NumberValueObject.create(10);
            const result = testFunction.calculate(number, radix, minLength) as BaseValueObject;
            expect(result.getValue()).toBe('0000001111');
        });

        it('number value is 2**53', () => {
            const number = NumberValueObject.create(2 ** 53);
            const radix = NumberValueObject.create(2);
            const result = testFunction.calculate(number, radix) as BaseValueObject;
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('radix value is 1.5', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(1.5);
            const result = testFunction.calculate(number, radix) as BaseValueObject;
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('radix value is 37', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(37);
            const result = testFunction.calculate(number, radix) as BaseValueObject;
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('minLength value is number negative', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(2);
            const minLength = NumberValueObject.create(-2);
            const result = testFunction.calculate(number, radix, minLength) as BaseValueObject;
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('value is number string', () => {
            const number = StringValueObject.create('15');
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength) as BaseValueObject;
            expect(result.getValue()).toBe('0001111');
        });

        it('value is normal string', () => {
            const number = StringValueObject.create('test');
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength) as BaseValueObject;
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength) as BaseValueObject;
            expect(result.getValue()).toBe('0000001');
        });

        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength) as BaseValueObject;
            expect(result.getValue()).toBe('0000000');
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength) as BaseValueObject;
            expect(result.getValue()).toBe(ErrorType.NAME);
        });
    });
});
