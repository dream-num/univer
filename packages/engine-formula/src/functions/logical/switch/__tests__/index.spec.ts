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

import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { Switch } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test SWITCH function', () => {
    const textFunction = new Switch(FUNCTION_NAMES_LOGICAL.SWITCH);

    describe('Switch', () => {
        it('matching case', () => {
            const expression = NumberValueObject.create(1);
            const case1 = NumberValueObject.create(1);
            const result1 = StringValueObject.create('one');
            const defaultValue = StringValueObject.create('default');
            const result = textFunction.calculate(expression, case1, result1, defaultValue);
            expect(result.getValue()).toBe('one');
        });

        it('default case', () => {
            const expression = NumberValueObject.create(2);
            const case1 = NumberValueObject.create(1);
            const result1 = StringValueObject.create('one');
            const defaultValue = StringValueObject.create('default');
            const result = textFunction.calculate(expression, case1, result1, defaultValue);
            expect(result.getValue()).toBe('default');
        });

        it('no match without default', () => {
            const expression = NumberValueObject.create(2);
            const case1 = NumberValueObject.create(1);
            const result1 = StringValueObject.create('one');
            const result = textFunction.calculate(expression, case1, result1);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getValue()).toBe(ErrorType.NA);
        });

        it('multiple cases', () => {
            const expression = NumberValueObject.create(2);
            const case1 = NumberValueObject.create(1);
            const result1 = StringValueObject.create('one');
            const case2 = NumberValueObject.create(2);
            const result2 = StringValueObject.create('two');
            const defaultValue = StringValueObject.create('default');
            const result = textFunction.calculate(expression, case1, result1, case2, result2, defaultValue);
            expect(result.getValue()).toBe('two');
        });

        it('error in expression', () => {
            const expression = ErrorValueObject.create(ErrorType.VALUE);
            const case1 = NumberValueObject.create(1);
            const result1 = StringValueObject.create('one');
            const defaultValue = StringValueObject.create('default');
            const result = textFunction.calculate(expression, case1, result1, defaultValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('error in case value', () => {
            const expression = NumberValueObject.create(1);
            const case1 = ErrorValueObject.create(ErrorType.VALUE);
            const result1 = StringValueObject.create('one');
            const defaultValue = StringValueObject.create('default');
            const result = textFunction.calculate(expression, case1, result1, defaultValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
    });
});
