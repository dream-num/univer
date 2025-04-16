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
import { Decimal } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test decimal function', () => {
    const testFunction = new Decimal(FUNCTION_NAMES_MATH.DECIMAL);

    describe('Decimal', () => {
        it('All value is normal', () => {
            const number = StringValueObject.create('abc');
            const radix = NumberValueObject.create(16);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(2748);
        });

        it('number value is 2**53', () => {
            const number = NumberValueObject.create(2 ** 53);
            const radix = NumberValueObject.create(2);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('radix value is 15.5', () => {
            const number = StringValueObject.create('abc');
            const radix = NumberValueObject.create(15.5);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(2427);
        });

        it('radix value is 37', () => {
            const number = NumberValueObject.create(15);
            const radix = NumberValueObject.create(37);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('value is normal string', () => {
            const number = StringValueObject.create('test');
            const radix = NumberValueObject.create(2);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const radix = NumberValueObject.create(2);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const radix = NumberValueObject.create(2);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(0);
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const radix = NumberValueObject.create(2);
            const result = testFunction.calculate(number, radix);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['9fb', ' ', 23, 'abc', false, null, ErrorType.NAME],
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
                    [true],
                    ['16'],
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
            const result = testFunction.calculate(number, radix);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NAME],
                [2555, 0, 35, 2748, ErrorType.NUM, 0, ErrorType.NAME],
                [ErrorType.NUM, 0, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, 0, ErrorType.NAME],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NAME],
            ]);
        });
    });
});
