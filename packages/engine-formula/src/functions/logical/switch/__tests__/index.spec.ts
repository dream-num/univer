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

import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { Switch } from '../index';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test switch function', () => {
    const textFunction = new Switch(FUNCTION_NAMES_LOGICAL.SWITCH);

    describe('Switch', () => {
        it('Single condition true', () => {
            const expression = NumberValueObject.create(1);
            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const result = textFunction.calculate(expression, switchValue1, resultValue1);
            expect(result.getValue()).toBe('One');
        });

        it('Single condition false with default', () => {
            const expression = NumberValueObject.create(2);
            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const defaultValue = StringValueObject.create('Default');
            const result = textFunction.calculate(expression, switchValue1, resultValue1, defaultValue);
            expect(result.getValue()).toBe('Default');
        });

        it('Multiple conditions with matching value', () => {
            const expression = NumberValueObject.create(2);
            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const switchValue2 = NumberValueObject.create(2);
            const resultValue2 = StringValueObject.create('Two');
            const result = textFunction.calculate(expression, switchValue1, resultValue1, switchValue2, resultValue2);
            expect(result.getValue()).toBe('Two');
        });

        it('Multiple conditions without matching value, with default', () => {
            const expression = NumberValueObject.create(3);
            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const switchValue2 = NumberValueObject.create(2);
            const resultValue2 = StringValueObject.create('Two');
            const defaultValue = StringValueObject.create('Default');
            const result = textFunction.calculate(expression, switchValue1, resultValue1, switchValue2, resultValue2, defaultValue);
            expect(result.getValue()).toBe('Default');
        });

        it('Condition is array', () => {
            const expression = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const switchValue2 = NumberValueObject.create(2);
            const resultValue2 = StringValueObject.create('Two');
            const defaultValue = StringValueObject.create('Default');
            const result = textFunction.calculate(expression, switchValue1, resultValue1, switchValue2, resultValue2, defaultValue);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['One'],
                ['Two'],
                ['Default'],
            ]);
        });

        it('Handles null values correctly', () => {
            const expression = NullValueObject.create();
            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const defaultValue = StringValueObject.create('Default');
            const result = textFunction.calculate(expression, switchValue1, resultValue1, defaultValue);
            expect(result.getValue()).toBe('Default');
        });

        it('Handles error values in expression', () => {
            const expression = ErrorValueObject.create(ErrorType.VALUE);
            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const defaultValue = StringValueObject.create('Default');
            const result = textFunction.calculate(expression, switchValue1, resultValue1, defaultValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Handles error values in switch values', () => {
            const expression = NumberValueObject.create(1);
            const switchValue1 = ErrorValueObject.create(ErrorType.VALUE);
            const resultValue1 = StringValueObject.create('One');
            const defaultValue = StringValueObject.create('Default');
            const result = textFunction.calculate(expression, switchValue1, resultValue1, defaultValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Handles arrays of different sizes', () => {
            const expression = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [3, 4],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const switchValue2 = NumberValueObject.create(2);
            const resultValue2 = StringValueObject.create('Two');
            const defaultValue = StringValueObject.create('Default');

            const result = textFunction.calculate(expression, switchValue1, resultValue1, switchValue2, resultValue2, defaultValue);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['One', 'Two'],
                ['Default', 'Default'],
            ]);
        });

        it('Handles arrays with null and error values', () => {
            const expression = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null],
                    [ErrorType.VALUE, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const switchValue1 = NumberValueObject.create(1);
            const resultValue1 = StringValueObject.create('One');
            const switchValue2 = NumberValueObject.create(2);
            const resultValue2 = StringValueObject.create('Two');
            const defaultValue = StringValueObject.create('Default');

            const result = textFunction.calculate(expression, switchValue1, resultValue1, switchValue2, resultValue2, defaultValue);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['One', 'Default'],
                [ErrorType.VALUE, 'Two'],
            ]);
        });
    });
});
