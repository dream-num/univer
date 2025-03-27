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
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Substitute } from '../index';

describe('Test substitute function', () => {
    const testFunction = new Substitute(FUNCTION_NAMES_TEXT.SUBSTITUTE);

    describe('Substitute', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('Hello Univer');
            const oldText = StringValueObject.create('Hello');
            const newText = StringValueObject.create('Hi');
            const result = testFunction.calculate(text, oldText, newText);
            expect(getObjectValue(result)).toStrictEqual('Hi Univer');
        });

        it('OldText value test', () => {
            const text = StringValueObject.create('Hello Univer');
            const oldText = NullValueObject.create();
            const newText = StringValueObject.create('Hi');
            const result = testFunction.calculate(text, oldText, newText);
            expect(getObjectValue(result)).toStrictEqual('Hello Univer');

            const oldText2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(text, oldText2, newText);
            expect(getObjectValue(result2)).toStrictEqual('Hello Univer');

            const oldText3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(text, oldText3, newText);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NAME);
        });

        it('NewText value test', () => {
            const text = StringValueObject.create('Hello Univer');
            const oldText = StringValueObject.create('Hello');
            const newText = NullValueObject.create();
            const result = testFunction.calculate(text, oldText, newText);
            expect(getObjectValue(result)).toStrictEqual(' Univer');

            const newText2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(text, oldText, newText2);
            expect(getObjectValue(result2)).toStrictEqual('TRUE Univer');

            const newText3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(text, oldText, newText3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NAME);
        });

        it('InstanceNum value test', () => {
            const text = StringValueObject.create('Hello Univer');
            const oldText = StringValueObject.create('Hello');
            const newText = StringValueObject.create('Hi');
            const instanceNum = NullValueObject.create();
            const result = testFunction.calculate(text, oldText, newText, instanceNum);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const instanceNum2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(text, oldText, newText, instanceNum2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const instanceNum3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(text, oldText, newText, instanceNum3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const instanceNum4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(text, oldText, newText, instanceNum4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const instanceNum5 = NumberValueObject.create(2.5);
            const result5 = testFunction.calculate(text, oldText, newText, instanceNum5);
            expect(getObjectValue(result5)).toStrictEqual('Hello Univer');

            const instanceNum6 = NumberValueObject.create(-1);
            const result6 = testFunction.calculate(text, oldText, newText, instanceNum6);
            expect(getObjectValue(result6)).toStrictEqual(ErrorType.VALUE);

            const instanceNum7 = NumberValueObject.create(1);
            const result7 = testFunction.calculate(text, oldText, newText, instanceNum7);
            expect(getObjectValue(result7)).toStrictEqual('Hi Univer');
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', '中文测试', true, false, null],
                    [0, '100', '2.34', ' 1 11 111', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const oldText = StringValueObject.create(' ');
            const newText = BooleanValueObject.create(true);
            const result = testFunction.calculate(text, oldText, newText);
            expect(getObjectValue(result)).toStrictEqual([
                ['1', 'TRUE', '中文测试', 'TRUE', 'FALSE', ''],
                ['0', '100', '2.34', 'TRUE1TRUE11TRUE111', '-3', ErrorType.NAME],
            ]);
        });
    });
});
