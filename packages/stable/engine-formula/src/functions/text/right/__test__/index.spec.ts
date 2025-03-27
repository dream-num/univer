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
import { Right } from '../index';

describe('Test right function', () => {
    const testFunction = new Right(FUNCTION_NAMES_TEXT.RIGHT);

    describe('Right', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('Univer');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual('r');
        });

        it('NumChars value test', () => {
            const text = StringValueObject.create('Univer');
            const numChars = NumberValueObject.create(-2);
            const result = testFunction.calculate(text, numChars);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const numChars2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(text, numChars2);
            expect(getObjectValue(result2)).toStrictEqual('');

            const numChars3 = NumberValueObject.create(6);
            const result3 = testFunction.calculate(text, numChars3);
            expect(getObjectValue(result3)).toStrictEqual('Univer');

            const numChars4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(text, numChars4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const numChars5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(text, numChars5);
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
            const numChars = NumberValueObject.create(2);
            const result = testFunction.calculate(text, numChars);
            expect(getObjectValue(result)).toStrictEqual([
                ['1', ' ', '测试', 'UE', 'SE', ''],
                ['0', '-2', '34', 'et', '-3', ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const text = StringValueObject.create(',。、；:{}');
            const numChars = NumberValueObject.create(4);
            const result = testFunction.calculate(text, numChars);
            expect(getObjectValue(result)).toStrictEqual('；:{}');

            const text2 = StringValueObject.create('Hello中文o😊Wo😊rld');
            const numChars2 = ArrayValueObject.create('{3,5,7,9,15}');
            const result2 = testFunction.calculate(text2, numChars2);
            expect(getObjectValue(result2)).toStrictEqual([
                ['rld', '😊rld', 'Wo😊rld', '😊Wo😊rld', 'llo中文o😊Wo😊rld'],
            ]);

            const text3 = NumberValueObject.create(0.01, '0%');
            const numChars3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(text3, numChars3);
            expect(getObjectValue(result3)).toStrictEqual('1%');
        });
    });
});
