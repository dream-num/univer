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
import { FUNCTION_NAMES_INFORMATION } from '../../function-names';

import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { Isodd } from '../isodd';

describe('Test isodd function', () => {
    const testFunction = new Isodd(FUNCTION_NAMES_INFORMATION.ISODD);

    it('should work with different kind of number values', () => {
        expect(testFunction.calculate(NumberValueObject.create(-1)).getValue()).toBeTruthy();
        expect(testFunction.calculate(NumberValueObject.create(2.5)).getValue()).toBeFalsy();
        expect(testFunction.calculate(NumberValueObject.create(5)).getValue()).toBeTruthy();
        expect(testFunction.calculate(NumberValueObject.create(0)).getValue()).toBeFalsy();
    });

    it('should convert value first if is it not a number value', () => {
        expect(testFunction.calculate(StringValueObject.create('123')).getValue()).toBeTruthy();
        expect(testFunction.calculate(StringValueObject.create('122')).getValue()).toBeFalsy();
    });

    it('should throw error when value is not convertable to number', () => {
        expect(testFunction.calculate(StringValueObject.create('not')).getValue()).toBe(ErrorType.VALUE);
        expect(testFunction.calculate(BooleanValueObject.create(true)).getValue()).toBe(ErrorType.VALUE);
        expect(testFunction.calculate(BooleanValueObject.create(false)).getValue()).toBe(ErrorType.VALUE);
    });

    it('should throw error for array values', () => {
        expect(testFunction.calculate(ArrayValueObject.create('A1:C1')).getValue()).toBe(ErrorType.VALUE);
    });
});
