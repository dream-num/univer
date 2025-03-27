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
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Rounddown } from '../index';

describe('Test rounddown function', () => {
    const testFunction = new Rounddown(FUNCTION_NAMES_MATH.ROUNDDOWN);

    describe('Rounddown', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(2.15);
            const numDigits = NumberValueObject.create(1);
            const result = testFunction.calculate(number, numDigits);
            expect(result.getValue()).toBe(2.1);
        });

        it('Value is normal number 2', () => {
            const number = NumberValueObject.create(2.149);
            const numDigits = NumberValueObject.create(1);
            const result = testFunction.calculate(number, numDigits);
            expect(result.getValue()).toBe(2.1);
        });

        it('Value is number valid', () => {
            const number = NumberValueObject.create(-1.475);
            const numDigits = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numDigits);
            expect(result.getValue()).toBe(-1.47);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('21.5');
            const numDigits = StringValueObject.create('-1');
            const result = testFunction.calculate(number, numDigits);
            expect(result.getValue()).toBe(20);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const numDigits = NumberValueObject.create(1);
            const result = testFunction.calculate(number, numDigits);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = NumberValueObject.create(2.15);
            const numDigits = BooleanValueObject.create(true);
            const result = testFunction.calculate(number, numDigits);
            expect(result.getValue()).toBe(2.1);
        });

        it('Value is blank cell', () => {
            const number = NumberValueObject.create(2.15);
            const numDigits = NullValueObject.create();
            const result = testFunction.calculate(number, numDigits);
            expect(result.getValue()).toBe(2);
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const numDigits = NumberValueObject.create(1);
            const result = testFunction.calculate(number, numDigits);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array and array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2.15, 2.149, -1.575, '21.5', 626.3, 1.98, '-50.55'],
                ]),
                rowCount: 1,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numDigits = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, true, 2, false, -1, -2.5, -3, null, ' '],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number, numDigits);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [2.1, 2.1, -1.57, 21, 620, 0, -0, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});
