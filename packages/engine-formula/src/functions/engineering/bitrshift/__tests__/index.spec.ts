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
import { Bitrshift } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test bitrshift function', () => {
    const testFunction = new Bitrshift(FUNCTION_NAMES_ENGINEERING.BITRSHIFT);

    describe('Bitrshift', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(13);
            const shiftAmount = NumberValueObject.create(2);
            const result = testFunction.calculate(number, shiftAmount);
            expect(result.getValue()).toBe(3);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('1');
            const shiftAmount = NumberValueObject.create(2);
            const result = testFunction.calculate(number, shiftAmount);
            expect(result.getValue()).toBe(0);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const shiftAmount = NumberValueObject.create(2);
            const result = testFunction.calculate(number, shiftAmount);
            expect(result.getValue()).toBe(ErrorType.VALUE);

            const number2 = NumberValueObject.create(13);
            const shiftAmount2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(number2, shiftAmount2);
            expect(result2.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const shiftAmount = NumberValueObject.create(2);
            const result = testFunction.calculate(number, shiftAmount);
            expect(result.getValue()).toBe(0);
        });

        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const shiftAmount = NumberValueObject.create(2);
            const result = testFunction.calculate(number, shiftAmount);
            expect(result.getValue()).toBe(0);
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const shiftAmount = NumberValueObject.create(2);
            const result = testFunction.calculate(number, shiftAmount);
            expect(result.getValue()).toBe(ErrorType.NAME);

            const number2 = NumberValueObject.create(13);
            const shiftAmount2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(number2, shiftAmount2);
            expect(result2.getValue()).toBe(ErrorType.NAME);
        });

        it('Result > 281474976710655', () => {
            const number = NumberValueObject.create(2);
            const shiftAmount = NumberValueObject.create(-52);
            const result = testFunction.calculate(number, shiftAmount);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
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
            const shiftAmount = NumberValueObject.create(2);
            const result = testFunction.calculate(number, shiftAmount);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [0, ErrorType.VALUE, ErrorType.NUM, 0, 0, 0],
                [0, 25, ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });
    });
});
