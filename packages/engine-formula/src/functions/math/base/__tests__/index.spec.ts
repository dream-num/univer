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

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Base } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test base function', () => {
    const testFunction = new Base(FUNCTION_NAMES_MATH.BASE);

    describe('Base', () => {
        it('All value is normal', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(2);
            const minLength = NumberValueObject.create(10);
            const result = testFunction.calculate(number, radix, minLength);
            expect(result.getValue()).toBe('0000001111');
        });

        it('number value is 2**53', () => {
            const number = NumberValueObject.create(2 ** 53);
            const radix = NumberValueObject.create(2);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('radix value is 1.5', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(1.5);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('radix value is 37', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(37);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('minLength value is number negative', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(2);
            const minLength = NumberValueObject.create(-2);
            const result = testFunction.calculate(number, radix, minLength);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('value is number string', () => {
            const number = StringValueObject.create('15');
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength);
            expect(result.getValue()).toBe('0001111');
        });

        it('value is normal string', () => {
            const number = StringValueObject.create('test');
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength);
            expect(result.getValue()).toBe('0000001');
        });

        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength);
            expect(result.getValue()).toBe('0000000');
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const radix = NumberValueObject.create(2);
            const minLength = StringValueObject.create('7');
            const result = testFunction.calculate(number, radix, minLength);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const radix = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0],
                    ['100'],
                    ['2.34'],
                    ['test'],
                    [-3],
                ]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 8,
                column: 8,
            });
            const minLength = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-3, 0, 5],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 11,
                column: 11,
            });
            const result = testFunction.calculate(number, radix, minLength);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NAME],
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NAME],
                [ErrorType.NUM, ErrorType.VALUE, '00001', ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NAME],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME],
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NAME],
            ]);
        });
    });
});
