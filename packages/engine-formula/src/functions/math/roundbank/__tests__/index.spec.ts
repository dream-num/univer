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
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Roundbank } from '../index';

describe('Test roundbank function', () => {
    const testFunction = new Roundbank(FUNCTION_NAMES_MATH.ROUNDBANK);

    describe('Roundbank', () => {
        it('Value is normal', () => {
            const number = NumberValueObject.create(2.344);
            const numDigits = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numDigits);
            expect(getObjectValue(result)).toBe(2.34);

            const number2 = NumberValueObject.create(2.346);
            const result2 = testFunction.calculate(number2, numDigits);
            expect(getObjectValue(result2)).toBe(2.35);

            const number3 = NumberValueObject.create(2.345);
            const result3 = testFunction.calculate(number3, numDigits);
            expect(getObjectValue(result3)).toBe(2.34);

            const number4 = NumberValueObject.create(2.3451);
            const result4 = testFunction.calculate(number4, numDigits);
            expect(getObjectValue(result4)).toBe(2.35);
        });

        it('Number value is negtive', () => {
            const number = NumberValueObject.create(-2.344);
            const numDigits = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numDigits);
            expect(getObjectValue(result)).toBe(-2.34);

            const number2 = NumberValueObject.create(-2.346);
            const result2 = testFunction.calculate(number2, numDigits);
            expect(getObjectValue(result2)).toBe(-2.35);

            const number3 = NumberValueObject.create(-2.345);
            const result3 = testFunction.calculate(number3, numDigits);
            expect(getObjectValue(result3)).toBe(-2.34);

            const number4 = NumberValueObject.create(-2.3451);
            const result4 = testFunction.calculate(number4, numDigits);
            expect(getObjectValue(result4)).toBe(-2.35);
        });

        it('NumDigits value is negtive', () => {
            const number = NumberValueObject.create(2.344);
            const numDigits = NumberValueObject.create(-2);
            const result = testFunction.calculate(number, numDigits);
            expect(getObjectValue(result)).toBe(0);

            const number2 = NumberValueObject.create(-222.346);
            const result2 = testFunction.calculate(number2, numDigits);
            expect(getObjectValue(result2)).toBe(-200);

            const number3 = NumberValueObject.create(22.345);
            const numDigits2 = NumberValueObject.create(-1);
            const result3 = testFunction.calculate(number3, numDigits2);
            expect(getObjectValue(result3)).toBe(20);

            const number4 = NumberValueObject.create(-222.3451);
            const result4 = testFunction.calculate(number4, numDigits2);
            expect(getObjectValue(result4)).toBe(-220);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const numDigits = NumberValueObject.create(1);
            const result = testFunction.calculate(number, numDigits);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = NumberValueObject.create(2.15);
            const numDigits = BooleanValueObject.create(true);
            const result = testFunction.calculate(number, numDigits);
            expect(getObjectValue(result)).toBe(2.2);
        });

        it('Value is blank cell', () => {
            const number = NumberValueObject.create(2.15);
            const numDigits = NullValueObject.create();
            const result = testFunction.calculate(number, numDigits);
            expect(getObjectValue(result)).toBe(2);
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const numDigits = NumberValueObject.create(1);
            const result = testFunction.calculate(number, numDigits);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const number2 = NumberValueObject.create(2.15);
            const numDigits2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(number2, numDigits2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
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
            expect(getObjectValue(result)).toStrictEqual([
                [2.2, 2.1, -1.58, 22, 630, 0, -0, ErrorType.NA, ErrorType.NA],
            ]);
        });

        it('More test', () => {
            const number = NumberValueObject.create(2.344);
            const numDigits = NumberValueObject.create(2000);
            const result = testFunction.calculate(number, numDigits);
            expect(getObjectValue(result)).toBe(2.344);

            const numDigits2 = NumberValueObject.create(-2000);
            const result2 = testFunction.calculate(number, numDigits2);
            expect(getObjectValue(result2)).toBe(0);
        });
    });
});
