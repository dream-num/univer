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
import { Replace } from '../index';

describe('Test replace function', () => {
    const testFunction = new Replace(FUNCTION_NAMES_TEXT.REPLACE);

    describe('Replace', () => {
        it('Value is normal', () => {
            const oldText = StringValueObject.create('Univer');
            const startNum = NumberValueObject.create(1);
            const numChars = NumberValueObject.create(0);
            const newText = StringValueObject.create('Hello ');
            const result = testFunction.calculate(oldText, startNum, numChars, newText);
            expect(getObjectValue(result)).toStrictEqual('Hello Univer');
        });

        it('StartNum value test', () => {
            const oldText = StringValueObject.create('Univer');
            const startNum = NullValueObject.create();
            const numChars = NumberValueObject.create(3);
            const newText = StringValueObject.create('~');
            const result = testFunction.calculate(oldText, startNum, numChars, newText);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const startNum2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(oldText, startNum2, numChars, newText);
            expect(getObjectValue(result2)).toStrictEqual('~ver');

            const startNum3 = NumberValueObject.create(7);
            const result3 = testFunction.calculate(oldText, startNum3, numChars, newText);
            expect(getObjectValue(result3)).toStrictEqual('Univer~');

            const startNum4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(oldText, startNum4, numChars, newText);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);

            const startNum5 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(oldText, startNum5, numChars, newText);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.NAME);
        });

        it('NumChars value test', () => {
            const oldText = StringValueObject.create('Univer');
            const startNum = NumberValueObject.create(1);
            const numChars = NumberValueObject.create(-2);
            const newText = StringValueObject.create('~');
            const result = testFunction.calculate(oldText, startNum, numChars, newText);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const numChars2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(oldText, startNum, numChars2, newText);
            expect(getObjectValue(result2)).toStrictEqual('~Univer');

            const numChars3 = NumberValueObject.create(6);
            const result3 = testFunction.calculate(oldText, startNum, numChars3, newText);
            expect(getObjectValue(result3)).toStrictEqual('~');

            const numChars4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(oldText, startNum, numChars4, newText);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const numChars5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(oldText, startNum, numChars5, newText);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);
        });

        it('NewText value test', () => {
            const oldText = StringValueObject.create('Univer');
            const startNum = NumberValueObject.create(1);
            const numChars = NumberValueObject.create(2);
            const newText = NullValueObject.create();
            const result = testFunction.calculate(oldText, startNum, numChars, newText);
            expect(getObjectValue(result)).toStrictEqual('iver');

            const newText2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(oldText, startNum, numChars, newText2);
            expect(getObjectValue(result2)).toStrictEqual('TRUEiver');

            const newText3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(oldText, startNum, numChars, newText3);
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
            const numChars = NumberValueObject.create(2);
            const newText = StringValueObject.create('~');
            const result = testFunction.calculate(oldText, startNum, numChars, newText);
            expect(getObjectValue(result)).toStrictEqual([
                ['~', '~', '~测试', '~UE', '~LSE', '~'],
                ['~', '~12-2-2', '~34', '~way street', '~', ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const oldText = StringValueObject.create(',。、；:{}');
            const startNum = NumberValueObject.create(1);
            const numChars = NumberValueObject.create(4);
            const newText = StringValueObject.create('~');
            const result = testFunction.calculate(oldText, startNum, numChars, newText);
            expect(getObjectValue(result)).toStrictEqual('~:{}');

            const oldText2 = StringValueObject.create('Hello中文o😊Wo😊rld');
            const numChars2 = ArrayValueObject.create('{3,5,7,10,15}');
            const result2 = testFunction.calculate(oldText2, startNum, numChars2, newText);
            expect(getObjectValue(result2)).toStrictEqual([
                ['~lo中文o😊Wo😊rld', '~中文o😊Wo😊rld', '~o😊Wo😊rld', '~Wo😊rld', '~ld'],
            ]);

            const oldText3 = NumberValueObject.create(0.01, '0%');
            const numChars3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(oldText3, startNum, numChars3, newText);
            expect(getObjectValue(result3)).toStrictEqual('~%');
        });
    });
});
