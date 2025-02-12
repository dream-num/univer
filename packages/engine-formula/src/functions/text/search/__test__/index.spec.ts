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
import { Search } from '../index';

describe('Test search function', () => {
    const testFunction = new Search(FUNCTION_NAMES_TEXT.SEARCH);

    describe('Search', () => {
        it('Value is normal', () => {
            const findText = StringValueObject.create('univer');
            const withinText = StringValueObject.create('Hello Univer');
            const startNum = NumberValueObject.create(1);
            const result = testFunction.calculate(findText, withinText, startNum);
            expect(getObjectValue(result)).toStrictEqual(7);
        });

        it('FindText value test', () => {
            const findText = NullValueObject.create();
            const withinText = StringValueObject.create('Hello Univer');
            const startNum = NumberValueObject.create(1);
            const result = testFunction.calculate(findText, withinText, startNum);
            expect(getObjectValue(result)).toStrictEqual(1);

            const findText2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(findText2, withinText, startNum);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const findText3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(findText3, withinText, startNum);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const findText4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(findText4, withinText, startNum);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);
        });

        it('WithinText value test', () => {
            const findText = StringValueObject.create('Univer');
            const withinText = NullValueObject.create();
            const startNum = NumberValueObject.create(1);
            const result = testFunction.calculate(findText, withinText, startNum);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const withinText2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(findText, withinText2, startNum);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const withinText3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(findText, withinText3, startNum);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const withinText4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(findText, withinText4, startNum);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);
        });

        it('StartNum value test', () => {
            const findText = StringValueObject.create('univer');
            const withinText = StringValueObject.create('Hello Univer');
            const startNum = NullValueObject.create();
            const result = testFunction.calculate(findText, withinText, startNum);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const startNum2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(findText, withinText, startNum2);
            expect(getObjectValue(result2)).toStrictEqual(7);

            const startNum3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(findText, withinText, startNum3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const startNum4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(findText, withinText, startNum4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const startNum5 = NumberValueObject.create(13);
            const result5 = testFunction.calculate(findText, withinText, startNum5);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const findText = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', '中文测试', true, false, null],
                    [0, 'm', '2.34', 'M', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const withinText = StringValueObject.create('Miriam McGovern');
            const startNum = NumberValueObject.create(2);
            const result = testFunction.calculate(findText, withinText, startNum);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.VALUE, 7, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, 2],
                [ErrorType.VALUE, 6, ErrorType.VALUE, 6, ErrorType.VALUE, ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const findText = StringValueObject.create('O');
            const withinText = StringValueObject.create('Hello中文o😊Wo😊rld');
            const startNum = ArrayValueObject.create('{1,6,9,13}');
            const result = testFunction.calculate(findText, withinText, startNum);
            expect(getObjectValue(result)).toStrictEqual([
                [5, 8, 12, ErrorType.VALUE],
            ]);

            const findText2 = StringValueObject.create('2');
            const withinText2 = StringValueObject.create('2012-2-2');
            const startNum2 = ArrayValueObject.create('{1,2,5,7}');
            const result2 = testFunction.calculate(findText2, withinText2, startNum2);
            expect(getObjectValue(result2)).toStrictEqual([
                [1, 4, 6, 8],
            ]);
        });
    });
});
