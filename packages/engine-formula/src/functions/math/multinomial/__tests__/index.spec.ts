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
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Multinomial } from '../index';

describe('Test multinomial function', () => {
    const testFunction = new Multinomial(FUNCTION_NAMES_MATH.MULTINOMIAL);

    describe('Multinomial', () => {
        it('Value is normal number', () => {
            const number1 = NumberValueObject.create(5);
            const number2 = NumberValueObject.create(2);
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(21);
        });

        it('Value is big number', () => {
            const number1 = NumberValueObject.create(1000000);
            const number2 = NumberValueObject.create(3222);
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number negative', () => {
            const number1 = NumberValueObject.create(-8);
            const number2 = NumberValueObject.create(8);
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const number1 = StringValueObject.create('1.5');
            const number2 = NumberValueObject.create(8);
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(9);
        });

        it('Value is normal string', () => {
            const number1 = StringValueObject.create('test');
            const number2 = NumberValueObject.create(8);
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number1 = BooleanValueObject.create(true);
            const number2 = NumberValueObject.create(8);
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const number1 = NullValueObject.create();
            const number2 = NumberValueObject.create(8);
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(1);
        });

        it('Value is error', () => {
            const number1 = ErrorValueObject.create(ErrorType.NAME);
            const number2 = NumberValueObject.create(8);
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [10, 20, 40, 60],
                    [80, 1, 2, 3],
                ]),
                rowCount: 2,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(number2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NUM);
        });
    });
});
