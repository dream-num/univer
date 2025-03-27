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
import { Rept } from '../index';

describe('Test rept function', () => {
    const testFunction = new Rept(FUNCTION_NAMES_TEXT.REPT);

    describe('Rept', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('*-');
            const numberTimes = NumberValueObject.create(3);
            const result = testFunction.calculate(text, numberTimes);
            expect(getObjectValue(result)).toBe('*-*-*-');
        });

        it('Value is number', () => {
            const text = NumberValueObject.create(1);
            const numberTimes = NumberValueObject.create(3);
            const result = testFunction.calculate(text, numberTimes);
            expect(getObjectValue(result)).toBe('111');
        });

        it('Value is boolean', () => {
            const text = BooleanValueObject.create(true);
            const numberTimes = BooleanValueObject.create(true);
            const result = testFunction.calculate(text, numberTimes);
            expect(getObjectValue(result)).toBe('TRUE');

            const numberTimes2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(text, numberTimes2);
            expect(getObjectValue(result2)).toBe('');
        });

        it('Value is blank cell', () => {
            const text = StringValueObject.create('abc');
            const numberTimes = NullValueObject.create();
            const result = testFunction.calculate(text, numberTimes);
            expect(getObjectValue(result)).toBe('');
        });

        it('Value is error', () => {
            const text = StringValueObject.create('abc');
            const numberTimes = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(text, numberTimes);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const text2 = ErrorValueObject.create(ErrorType.NAME);
            const numberTimes2 = NumberValueObject.create(3);
            const result2 = testFunction.calculate(text2, numberTimes2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, true, false, null, 'test', ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numberTimes = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [2],
                    [true],
                    [false],
                    [null],
                    ['test'],
                    [-1],
                ]),
                rowCount: 6,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text, numberTimes);
            expect(getObjectValue(result)).toStrictEqual([
                ['11', 'TRUETRUE', 'FALSEFALSE', '', 'testtest', ErrorType.NAME],
                ['1', 'TRUE', 'FALSE', '', 'test', ErrorType.NAME],
                ['', '', '', '', '', ErrorType.NAME],
                ['', '', '', '', '', ErrorType.NAME],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME],
            ]);
        });
    });
});
