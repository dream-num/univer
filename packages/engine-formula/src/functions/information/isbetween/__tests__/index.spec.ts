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

import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_INFORMATION } from '../../function-names';
import { Isbetween } from '../index';

describe('Test isbetween function', () => {
    const testFunction = new Isbetween(FUNCTION_NAMES_INFORMATION.ISBETWEEN);

    describe('Isbetween', () => {
        it('Value is normal', () => {
            const valueToCompare = NumberValueObject.create(7.9);
            const lowerValue = NumberValueObject.create(1.2);
            const upperValue = NumberValueObject.create(12.45);
            const result = testFunction.calculate(valueToCompare, lowerValue, upperValue);
            expect(result.getValue()).toBe(true);
        });

        it('LowerValue > upperValue', () => {
            const valueToCompare = NumberValueObject.create(7.9);
            const lowerValue = NumberValueObject.create(1.2);
            const upperValue = NumberValueObject.create(-12.45);
            const result = testFunction.calculate(valueToCompare, lowerValue, upperValue);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const valueToCompare = StringValueObject.create('7.9');
            const lowerValue = NumberValueObject.create(1.2);
            const upperValue = NumberValueObject.create(12.45);
            const result = testFunction.calculate(valueToCompare, lowerValue, upperValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const valueToCompare = StringValueObject.create('test');
            const lowerValue = NumberValueObject.create(1.2);
            const upperValue = NumberValueObject.create(12.45);
            const result = testFunction.calculate(valueToCompare, lowerValue, upperValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const valueToCompare = NullValueObject.create();
            const lowerValue = NumberValueObject.create(1.2);
            const upperValue = NumberValueObject.create(12.45);
            const result = testFunction.calculate(valueToCompare, lowerValue, upperValue);
            expect(result.getValue()).toBe(false);
        });

        it('Value is boolean', () => {
            const valueToCompare = BooleanValueObject.create(true);
            const lowerValue = NumberValueObject.create(1.2);
            const upperValue = NumberValueObject.create(12.45);
            const result = testFunction.calculate(valueToCompare, lowerValue, upperValue);
            expect(result.getValue()).toBe(false);
        });

        it('Value is error', () => {
            const valueToCompare = ErrorValueObject.create(ErrorType.NAME);
            const lowerValue = NumberValueObject.create(1.2);
            const upperValue = NumberValueObject.create(12.45);
            const result = testFunction.calculate(valueToCompare, lowerValue, upperValue);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const valueToCompare = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const lowerValue = NumberValueObject.create(1.2);
            const upperValue = NumberValueObject.create(12.45);
            const result = testFunction.calculate(valueToCompare, lowerValue, upperValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
    });
});
