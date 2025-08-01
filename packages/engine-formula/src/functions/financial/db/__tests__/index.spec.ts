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
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Db } from '../index';

describe('Test db function', () => {
    const testFunction = new Db(FUNCTION_NAMES_FINANCIAL.DB);

    describe('Db', () => {
        it('Value is normal', () => {
            const cost = NumberValueObject.create(10000000);
            const salvage = NumberValueObject.create(1000000);
            const life = NumberValueObject.create(6);
            const period = NumberValueObject.create(1);
            const month = NumberValueObject.create(7);
            const result = testFunction.calculate(cost, salvage, life, period, month);
            expect(getObjectValue(result, true)).toBe(1860833.33333333);
        });

        it('Cost is normal string', () => {
            const cost = StringValueObject.create('test');
            const salvage = NumberValueObject.create(1000000);
            const life = NumberValueObject.create(6);
            const period = NumberValueObject.create(1);
            const month = NullValueObject.create();
            const result = testFunction.calculate(cost, salvage, life, period, month);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Cost <= 0 or salvage < 0 or cost < salvage', () => {
            const cost = NumberValueObject.create(0);
            const salvage = NumberValueObject.create(1000000);
            const life = NumberValueObject.create(6);
            const period = NumberValueObject.create(1);
            const month = NumberValueObject.create(7);
            const result = testFunction.calculate(cost, salvage, life, period, month);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const cost2 = NumberValueObject.create(2400);
            const salvage2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(cost2, salvage2, life, period, month);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const cost3 = NumberValueObject.create(10000);
            const salvage3 = NumberValueObject.create(1000000);
            const result3 = testFunction.calculate(cost3, salvage3, life, period, month);
            expect(getObjectValue(result3, true)).toBe(-6731.66666666667);
        });

        it('Period <= 0 or period is last or period > life', () => {
            const cost = NumberValueObject.create(10000000);
            const salvage = NumberValueObject.create(1000000);
            const life = NumberValueObject.create(6);
            const period = NumberValueObject.create(0);
            const month = NumberValueObject.create(7);
            const result = testFunction.calculate(cost, salvage, life, period, month);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const period2 = NumberValueObject.create(6);
            const result2 = testFunction.calculate(cost, salvage, life, period2, month);
            expect(getObjectValue(result2, true)).toBe(558417.567360284);

            const period3 = NumberValueObject.create(7);
            const result3 = testFunction.calculate(cost, salvage, life, period3, month);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);

            const period4 = NumberValueObject.create(0.1);
            const result4 = testFunction.calculate(cost, salvage, life, period4, month);
            expect(getObjectValue(result4, true)).toBe(1860833.33333333);

            const period5 = NumberValueObject.create(2);
            const result5 = testFunction.calculate(cost, salvage, life, period5, month);
            expect(getObjectValue(result5, true)).toBe(2596394.16666667);
        });

        it('value is array', () => {
            const cost = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1000000, 'test', true, false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const salvage = NumberValueObject.create(10000);
            const life = NumberValueObject.create(6);
            const period = NumberValueObject.create(1);
            const month = NumberValueObject.create(7);
            const result = testFunction.calculate(cost, salvage, life, period, month);
            expect(getObjectValue(result, true)).toStrictEqual([
                [312666.666666667, ErrorType.VALUE, -2.1245, ErrorType.NUM, ErrorType.NAME, ErrorType.NUM],
            ]);
        });
    });
});
