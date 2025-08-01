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
import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Bin2oct } from '../index';

describe('Test bin2oct function', () => {
    const testFunction = new Bin2oct(FUNCTION_NAMES_ENGINEERING.BIN2OCT);

    describe('Bin2oct', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(1001);
            const places = NumberValueObject.create(3);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toBe('011');
        });

        it('Number length is 10', () => {
            const number = NumberValueObject.create(1100100000);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe('7777777440');
        });

        it('Places test', () => {
            const number = NumberValueObject.create(11111011);
            const places = NumberValueObject.create(1);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toBe(ErrorType.NUM);

            const places2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(number, places2);
            expect(result2.getValue()).toBe(ErrorType.NUM);

            const places3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(number, places3);
            expect(result3.getValue()).toBe(ErrorType.VALUE);

            const places4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(number, places4);
            expect(result4.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('-0.5');
            const places = NumberValueObject.create(3);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const places = NumberValueObject.create(3);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const places = NumberValueObject.create(3);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is null', () => {
            const number = NullValueObject.create();
            const places = NumberValueObject.create(3);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toBe(ErrorType.NA);
        });

        it('Value is blank cell', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const places = NumberValueObject.create(3);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toBe('000');
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const places = NumberValueObject.create(3);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toBe(ErrorType.NAME);
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
            const places = NumberValueObject.create(3);
            const result = testFunction.calculate(number, places);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
