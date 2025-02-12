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

import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Bitxor } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test bitxor function', () => {
    const testFunction = new Bitxor(FUNCTION_NAMES_ENGINEERING.BITXOR);

    describe('Bitxor', () => {
        it('Value is normal number', () => {
            const number1 = NumberValueObject.create(5);
            const number2 = NumberValueObject.create(3);
            const result = testFunction.calculate(number1, number2);
            expect(result.getValue()).toBe(6);
        });

        it('Value is number string', () => {
            const number1 = StringValueObject.create('1');
            const number2 = NumberValueObject.create(3);
            const result = testFunction.calculate(number1, number2);
            expect(result.getValue()).toBe(2);
        });

        it('Value is normal string', () => {
            const number1 = StringValueObject.create('test');
            const number2 = NumberValueObject.create(3);
            const result = testFunction.calculate(number1, number2);
            expect(result.getValue()).toBe(ErrorType.VALUE);

            const number3 = NumberValueObject.create(5);
            const number4 = StringValueObject.create('test');
            const result2 = testFunction.calculate(number3, number4);
            expect(result2.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number1 = BooleanValueObject.create(true);
            const number2 = NumberValueObject.create(3);
            const result = testFunction.calculate(number1, number2);
            expect(result.getValue()).toBe(2);
        });

        it('Value is blank cell', () => {
            const number1 = NullValueObject.create();
            const number2 = NumberValueObject.create(3);
            const result = testFunction.calculate(number1, number2);
            expect(result.getValue()).toBe(3);
        });

        it('Value is error', () => {
            const number1 = ErrorValueObject.create(ErrorType.NAME);
            const number2 = NumberValueObject.create(3);
            const result = testFunction.calculate(number1, number2);
            expect(result.getValue()).toBe(ErrorType.NAME);

            const number3 = NumberValueObject.create(5);
            const number4 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(number3, number4);
            expect(result2.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const number2 = NumberValueObject.create(3);
            const result = testFunction.calculate(number1, number2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [2, ErrorType.VALUE, ErrorType.NUM, 2, 3, 3],
                [3, 103, ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });
    });
});
