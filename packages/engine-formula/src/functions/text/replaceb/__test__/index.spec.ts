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
import { Replaceb } from '../index';

describe('Test replaceb function', () => {
    const testFunction = new Replaceb(FUNCTION_NAMES_TEXT.REPLACEB);

    describe('Replaceb', () => {
        it('Value is normal', () => {
            const oldText = StringValueObject.create('Univer');
            const startNum = NumberValueObject.create(1);
            const numBytes = NumberValueObject.create(0);
            const newText = StringValueObject.create('Hello ');
            const result = testFunction.calculate(oldText, startNum, numBytes, newText);
            expect(getObjectValue(result)).toStrictEqual('Hello Univer');
        });

        it('StartNum value test', () => {
            const oldText = StringValueObject.create('Univer');
            const startNum = NullValueObject.create();
            const numBytes = NumberValueObject.create(3);
            const newText = StringValueObject.create('~');
            const result = testFunction.calculate(oldText, startNum, numBytes, newText);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const startNum2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(oldText, startNum2, numBytes, newText);
            expect(getObjectValue(result2)).toStrictEqual('~ver');

            const startNum3 = NumberValueObject.create(7);
            const result3 = testFunction.calculate(oldText, startNum3, numBytes, newText);
            expect(getObjectValue(result3)).toStrictEqual('Univer~');

            const startNum4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(oldText, startNum4, numBytes, newText);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);

            const startNum5 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(oldText, startNum5, numBytes, newText);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.NAME);
        });

        it('NumBytes value test', () => {
            const oldText = StringValueObject.create('Univer');
            const startNum = NumberValueObject.create(1);
            const numBytes = NumberValueObject.create(-2);
            const newText = StringValueObject.create('~');
            const result = testFunction.calculate(oldText, startNum, numBytes, newText);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const numBytes2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(oldText, startNum, numBytes2, newText);
            expect(getObjectValue(result2)).toStrictEqual('~Univer');

            const numBytes3 = NumberValueObject.create(6);
            const result3 = testFunction.calculate(oldText, startNum, numBytes3, newText);
            expect(getObjectValue(result3)).toStrictEqual('~');

            const numBytes4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(oldText, startNum, numBytes4, newText);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const numBytes5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(oldText, startNum, numBytes5, newText);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);
        });

        it('NewText value test', () => {
            const oldText = StringValueObject.create('Univer');
            const startNum = NumberValueObject.create(1);
            const numBytes = NumberValueObject.create(2);
            const newText = NullValueObject.create();
            const result = testFunction.calculate(oldText, startNum, numBytes, newText);
            expect(getObjectValue(result)).toStrictEqual('iver');

            const newText2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(oldText, startNum, numBytes, newText2);
            expect(getObjectValue(result2)).toStrictEqual('TRUEiver');

            const newText3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(oldText, startNum, numBytes, newText3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is array', () => {
            const oldText = ArrayValueObject.create({
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
            const startNum = NumberValueObject.create(1);
            const numBytes = NumberValueObject.create(2);
            const newText = StringValueObject.create('~');
            const result = testFunction.calculate(oldText, startNum, numBytes, newText);
            expect(getObjectValue(result)).toStrictEqual([
                ['~', '~', '~文测试', '~UE', '~LSE', '~'],
                ['~', '~12-2-2', '~34', '~way street', '~', ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const oldText = StringValueObject.create(',。、；:{}');
            const startNum = NumberValueObject.create(1);
            const numBytes = NumberValueObject.create(4);
            const newText = StringValueObject.create('~');
            const result = testFunction.calculate(oldText, startNum, numBytes, newText);
            expect(getObjectValue(result)).toStrictEqual('~；:{}');

            const oldText2 = StringValueObject.create('Hello中文o😊Wo😊rld');
            const numBytes2 = ArrayValueObject.create('{3,5,7,10,15}');
            const result2 = testFunction.calculate(oldText2, startNum, numBytes2, newText);
            expect(getObjectValue(result2)).toStrictEqual([
                ['~lo中文o😊Wo😊rld', '~中文o😊Wo😊rld', '~文o😊Wo😊rld', '~😊Wo😊rld', '~o😊rld'],
            ]);

            const oldText3 = NumberValueObject.create(0.01, '0%');
            const numChars3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(oldText3, startNum, numChars3, newText);
            expect(getObjectValue(result3)).toStrictEqual('~%');
        });
    });
});
