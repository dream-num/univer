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
import { Lower } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test lower function', () => {
    const textFunction = new Lower(FUNCTION_NAMES_TEXT.LOWER);

    describe('Lower', () => {
        it('Value is normal', () => {
            const value = StringValueObject.create('Apt. 2B');
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBe('apt. 2b');
        });

        it('Value is number', () => {
            const value = NumberValueObject.create(1);
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBe('1');
        });

        it('Value is boolean', () => {
            const value = BooleanValueObject.create(true);
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBe('true');
        });

        it('Value is array', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null, 'Univer表格シート繁體한국인'],
                    [0, '100', '2.34', 'TEST', -3, ErrorType.VALUE, null],
                ]),
                rowCount: 2,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(text);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['1', ' ', '1.23', 'true', 'false', '', 'univer表格シート繁體한국인'],
                ['0', '100', '2.34', 'test', '-3', '#VALUE!', ''],
            ]);
        });
    });
});
