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
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Rightb } from '../index';

describe('Test rightb function', () => {
    const testFunction = new Rightb(FUNCTION_NAMES_TEXT.RIGHTB);

    describe('Rightb', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('Univer');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual('r');
        });

        it('NumBytes value test', () => {
            const text = StringValueObject.create('Univer');
            const numBytes = NumberValueObject.create(-2);
            const result = testFunction.calculate(text, numBytes);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const numBytes2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(text, numBytes2);
            expect(getObjectValue(result2)).toStrictEqual('');

            const numBytes3 = NumberValueObject.create(6);
            const result3 = testFunction.calculate(text, numBytes3);
            expect(getObjectValue(result3)).toStrictEqual('Univer');

            const numBytes4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(text, numBytes4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const numBytes5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(text, numBytes5);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', '中文测试', true, false, null],
                    [0, '2012-2-2', '2.34', '2-way street', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numBytes = NumberValueObject.create(2);
            const result = testFunction.calculate(text, numBytes);
            expect(getObjectValue(result)).toStrictEqual([
                ['1', ' ', '试', 'UE', 'SE', ''],
                ['0', '-2', '34', 'et', '-3', ErrorType.NAME],
            ]);

            const numBytes2 = NumberValueObject.create(3);
            const result2 = testFunction.calculate(text, numBytes2);
            expect(getObjectValue(result2)).toStrictEqual([
                ['1', ' ', '测试', 'RUE', 'LSE', ''],
                ['0', '2-2', '.34', 'eet', '-3', ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const text = StringValueObject.create(',。、；:{}');
            const numBytes = NumberValueObject.create(4);
            const result = testFunction.calculate(text, numBytes);
            expect(getObjectValue(result)).toStrictEqual('；:{}');

            const text2 = StringValueObject.create('Hello中文o😊Wo😊rld');
            const numBytes2 = ArrayValueObject.create('{3,6,7,8,15}');
            const result2 = testFunction.calculate(text2, numBytes2);
            expect(getObjectValue(result2)).toStrictEqual([
                ['rld', '😊rld', '😊rld', 'o😊rld', '文o😊Wo😊rld'],
            ]);

            const text3 = NumberValueObject.create(0.01, '0%');
            const numBytes3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(text3, numBytes3);
            expect(getObjectValue(result3)).toStrictEqual('1%');
        });
    });
});
