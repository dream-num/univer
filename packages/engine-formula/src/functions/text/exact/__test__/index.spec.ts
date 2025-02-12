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
import { Exact } from '../index';

describe('Test exact function', () => {
    const testFunction = new Exact(FUNCTION_NAMES_TEXT.EXACT);

    describe('Exact', () => {
        it('Value is normal', () => {
            const text1 = StringValueObject.create('univer');
            const text2 = StringValueObject.create('univer');
            const result = testFunction.calculate(text1, text2);
            expect(getObjectValue(result)).toStrictEqual(true);
        });

        it('Value is normal string, but different case', () => {
            const text1 = StringValueObject.create('univer');
            const text2 = StringValueObject.create('Univer');
            const result = testFunction.calculate(text1, text2);
            expect(getObjectValue(result)).toStrictEqual(false);

            const text3 = StringValueObject.create('u niver');
            const result2 = testFunction.calculate(text1, text3);
            expect(getObjectValue(result2)).toStrictEqual(false);
        });

        it('Value is number and number string', () => {
            const text1 = NumberValueObject.create(123);
            const text2 = StringValueObject.create('123');
            const result = testFunction.calculate(text1, text2);
            expect(getObjectValue(result)).toStrictEqual(true);
        });

        it('Value is boolean', () => {
            const text1 = BooleanValueObject.create(true);
            const text2 = BooleanValueObject.create(false);
            const result = testFunction.calculate(text1, text2);
            expect(getObjectValue(result)).toStrictEqual(false);

            const text3 = StringValueObject.create('true');
            const result2 = testFunction.calculate(text1, text3);
            expect(getObjectValue(result2)).toStrictEqual(false);

            const text4 = StringValueObject.create('TRUE');
            const result3 = testFunction.calculate(text1, text4);
            expect(getObjectValue(result3)).toStrictEqual(true);
        });

        it('Value is error', () => {
            const text1 = ErrorValueObject.create(ErrorType.NAME);
            const text2 = StringValueObject.create('univer');
            const result = testFunction.calculate(text1, text2);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const text3 = StringValueObject.create('univer');
            const text4 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(text3, text4);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is array', () => {
            const text1 = ArrayValueObject.create({
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
            const text2 = NullValueObject.create();
            const result = testFunction.calculate(text1, text2);
            expect(getObjectValue(result)).toStrictEqual([
                [false, false, false, false, false, true],
                [false, false, false, false, false, ErrorType.NAME],
            ]);
        });
    });
});
