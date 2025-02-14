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
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Numberstring } from '../index';

describe('Test numberstring function', () => {
    const testFunction = new Numberstring(FUNCTION_NAMES_TEXT.NUMBERSTRING);

    describe('numberstring', () => {
        it('Value is normal', () => {
            const number = NumberValueObject.create(123);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe('一百二十三');
        });

        it('Type value test', () => {
            const number = NumberValueObject.create(123);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe('一百二十三');

            const type2 = NumberValueObject.create(2);
            const result2 = testFunction.calculate(number, type2);
            expect(getObjectValue(result2)).toBe('壹佰贰拾叁');

            const type3 = NumberValueObject.create(3);
            const result3 = testFunction.calculate(number, type3);
            expect(getObjectValue(result3)).toBe('一二三');

            const type4 = NumberValueObject.create(4);
            const result4 = testFunction.calculate(number, type4);
            expect(getObjectValue(result4)).toBe(ErrorType.NUM);
        });

        it('Value is string', () => {
            const number = StringValueObject.create('a123');
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const number2 = NumberValueObject.create(123);
            const type2 = StringValueObject.create('a1');
            const result2 = testFunction.calculate(number2, type2);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe('〇');
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const number2 = NumberValueObject.create(123);
            const type2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(number2, type2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [123456.7, true],
                    [false, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const type = ArrayValueObject.create({
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
            const result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toStrictEqual([
                ['一十二万三千四百五十七', '一'],
                ['零', ErrorType.NAME],
                [ErrorType.NA, ErrorType.NA],
            ]);
        });

        it('More test', () => {
            let number = NumberValueObject.create(102300000000003);
            let type = NumberValueObject.create(1);
            let result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe('一百〇二兆三千亿〇三');

            number = NumberValueObject.create(10230000000000000);
            result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe('一〇二三〇兆');

            number = NumberValueObject.create(10230);
            result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe('一万〇二百三十');

            number = NumberValueObject.create(102300);
            type = NumberValueObject.create(2);
            result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe('壹拾万贰仟叁佰');

            number = NumberValueObject.create(10000000);
            type = NumberValueObject.create(2);
            result = testFunction.calculate(number, type);
            expect(getObjectValue(result)).toBe('壹仟万');
        });
    });
});
