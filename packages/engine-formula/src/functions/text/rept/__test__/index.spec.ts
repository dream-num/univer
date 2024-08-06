/**
 * Copyright 2023-present DreamNum Inc.
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

import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Rept } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test rept function', () => {
    const testFunction = new Rept(FUNCTION_NAMES_TEXT.REPT);

    describe('Rept', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('*-');
            const numberTimes = NumberValueObject.create(3);
            const result = testFunction.calculate(text, numberTimes);
            expect(result.getValue()).toBe('*-*-*-');
        });

        it('Value is number', () => {
            const text = NumberValueObject.create(1);
            const numberTimes = NumberValueObject.create(3);
            const result = testFunction.calculate(text, numberTimes);
            expect(result.getValue()).toBe('111');
        });

        it('Value is boolean', () => {
            const text = BooleanValueObject.create(true);
            const numberTimes = BooleanValueObject.create(true);
            const result = testFunction.calculate(text, numberTimes);
            expect(result.getValue()).toBe('TRUE');

            const numberTimes2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(text, numberTimes2);
            expect(result2.getValue()).toBe('');
        });

        it('Value is blank cell', () => {
            const text = StringValueObject.create('abc');
            const numberTimes = NullValueObject.create();
            const result = testFunction.calculate(text, numberTimes);
            expect(result.getValue()).toBe('');
        });

        it('Value is array', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, true, false, null, 'test'],
                ]),
                rowCount: 1,
                columnCount: 5,
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
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['11', 'TRUETRUE', 'FALSEFALSE', '', 'testtest'],
                ['1', 'TRUE', 'FALSE', '', 'test'],
                ['', '', '', '', ''],
                ['', '', '', '', ''],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE],
            ]);
        });
    });
});
