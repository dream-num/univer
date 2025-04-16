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

import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Edate } from '../index';

describe('Test edate function', () => {
    const testFunction = new Edate(FUNCTION_NAMES_DATE.EDATE);

    describe('Edate', () => {
        it('All value is normal', () => {
            const startDate = NumberValueObject.create(43831);
            const months = NumberValueObject.create(1);
            const result = testFunction.calculate(startDate, months);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[43862]]);
        });

        it('Start date is array', () => {
            const startDate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[43832], [43833]]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const months = NumberValueObject.create(1);
            const result = testFunction.calculate(startDate, months);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[43863], [43864]]);
        });

        it('Start date is array with multiple format values', () => {
            const startDate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, 1900],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const months = NumberValueObject.create(1);
            const result = testFunction.calculate(startDate, months);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[32, '#VALUE!', 32, '#VALUE!', '#VALUE!', 31], [31, 130, 33, '#VALUE!', '#NUM!', 1931]]);
        });

        it('Months is array', () => {
            const startDate = NumberValueObject.create(43831);
            const months = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1], [2]]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(startDate, months);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[43862], [43891]]);
        });

        it('Months is array with multiple format values', () => {
            const startDate = NumberValueObject.create(43831);
            const months = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1, ' ', 1.23, true, false, null], [0, '100', '2.34', 'test', -3, 1900]]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(startDate, months);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[43862, '#VALUE!', 43862, '#VALUE!', '#VALUE!', 43831], [43831, 46874, 43891, '#VALUE!', 43739, 101660]]);
        });
    });
});
