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

import { FUNCTION_NAMES_DATE } from '../../function-names';
import { DateFunction } from '../index';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test date function', () => {
    const testFunction = new DateFunction(FUNCTION_NAMES_DATE.DATE);

    describe('Date', () => {
        it('All value is normal', () => {
            const year = NumberValueObject.create(2024);
            const month = NumberValueObject.create(1);
            const day = NumberValueObject.create(1);
            const result = testFunction.calculate(year, month, day);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[45292]]);
        });
        it('Edge case, 1900.1.1', () => {
            const year = NumberValueObject.create(1900);
            const month = NumberValueObject.create(1);
            const day = NumberValueObject.create(1);
            const result = testFunction.calculate(year, month, day);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[1]]);
        });
        it('Edge case, 1900.1.0', () => {
            const year = NumberValueObject.create(1900);
            const month = NumberValueObject.create(1);
            const day = NumberValueObject.create(0);
            const result = testFunction.calculate(year, month, day);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0]]);
        });
        it('Edge case, 1900.1.-1', () => {
            const year = NumberValueObject.create(1900);
            const month = NumberValueObject.create(1);
            const day = NumberValueObject.create(-1);
            const result = testFunction.calculate(year, month, day);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.NUM]]);
        });

        it('Year is single cell, month is one column, day is one row', () => {
            const year = NumberValueObject.create(2024);
            const month = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1], [2]]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const day = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[3, 4, 5]]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(year, month, day);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[45294, 45295, 45296], [45325, 45326, 45327]]);
        });

        it('Year is array with multiple format values', () => {
            const year = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null, 18],
                    [0, '100', '2.34', 'test', -3, 1900, 108],
                ]),
                rowCount: 2,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const month = NumberValueObject.create(1);
            const day = NumberValueObject.create(1);
            const result = testFunction.calculate(year, month, day);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[367, '#VALUE!', 367, 367, 1, 1, 6576], [1, 36526, 732, '#VALUE!', '#NUM!', 1, 39448]]);
        });

        it('Month is array with multiple format values', () => {
            const year = NumberValueObject.create(2024);
            const month = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, 14],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const day = NumberValueObject.create(1);
            const result = testFunction.calculate(year, month, day);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[45292, '#VALUE!', 45292, 45292, 45261, 45261], [45261, 48305, 45323, '#VALUE!', 45170, 45689]]);
        });

        it('Day is array with multiple format values', () => {
            const year = NumberValueObject.create(2024);
            const month = NumberValueObject.create(1);
            const day = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, 32],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(year, month, day);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[45292, '#VALUE!', 45292, 45292, 45291, 45291], [45291, 45391, 45293, '#VALUE!', 45288, 45323]]);
        });
    });
});
