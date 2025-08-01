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
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Amorlinc } from '../index';

describe('Test amorlinc function', () => {
    const testFunction = new Amorlinc(FUNCTION_NAMES_FINANCIAL.AMORLINC);

    describe('Amorlinc', () => {
        it('Value is normal', () => {
            const cost = NumberValueObject.create(2400);
            const datePurchased = StringValueObject.create('2008/8/19');
            const firstPeriod = StringValueObject.create('2008/12/31');
            const salvage = NumberValueObject.create(300);
            const period = NumberValueObject.create(1);
            const rate = NumberValueObject.create(0.15);
            const basis = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(360);
        });

        it('Value is normal, life < 0', () => {
            const cost = NumberValueObject.create(2400);
            const datePurchased = StringValueObject.create('2008/8/19');
            const firstPeriod = StringValueObject.create('2009/12/31');
            const salvage = NumberValueObject.create(2100);
            const period = NumberValueObject.create(1);
            const rate = NumberValueObject.create(0.6);
            const basis = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Cost is normal string', () => {
            const cost = StringValueObject.create('test');
            const datePurchased = StringValueObject.create('2008/8/19');
            const firstPeriod = StringValueObject.create('2008/12/31');
            const salvage = NumberValueObject.create(300);
            const period = NumberValueObject.create(1);
            const rate = NumberValueObject.create(0.15);
            const basis = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const cost2 = NumberValueObject.create(2400);
            const datePurchased2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(cost2, datePurchased2, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const firstPeriod2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(cost2, datePurchased, firstPeriod2, salvage, period, rate, basis);
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);
        });

        it('Cost <= 0 or salvage < 0 or cost < salvage', () => {
            const cost = NumberValueObject.create(0);
            const datePurchased = StringValueObject.create('2008/8/19');
            const firstPeriod = StringValueObject.create('2008/12/31');
            const salvage = NumberValueObject.create(300);
            const period = NumberValueObject.create(1);
            const rate = NumberValueObject.create(0.15);
            const basis = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const cost2 = NumberValueObject.create(2400);
            const salvage2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(cost2, datePurchased, firstPeriod, salvage2, period, rate, basis);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const cost3 = NumberValueObject.create(100);
            const salvage3 = NumberValueObject.create(200);
            const result3 = testFunction.calculate(cost3, datePurchased, firstPeriod, salvage3, period, rate, basis);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);
        });

        it('DatePurchased > firstPeriod', () => {
            const cost = NumberValueObject.create(2400);
            const datePurchased = StringValueObject.create('2008/12/31');
            const firstPeriod = StringValueObject.create('2008/8/19');
            const salvage = NumberValueObject.create(300);
            const period = NumberValueObject.create(1);
            const rate = NumberValueObject.create(0.15);
            const basis = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Period < 0 or period = 0 or period is last or period > maxPeriod', () => {
            const cost = NumberValueObject.create(2400);
            const datePurchased = StringValueObject.create('2008/8/19');
            const firstPeriod = StringValueObject.create('2008/12/31');
            const salvage = NumberValueObject.create(300);
            const period = NumberValueObject.create(-1);
            const rate = NumberValueObject.create(0.15);
            const basis = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const period2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period2, rate, basis);
            expect(getObjectValue(result2)).toBe(132);

            const period3 = NumberValueObject.create(6);
            const result3 = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period3, rate, basis);
            expect(getObjectValue(result3, true)).toBe(168);

            const period4 = NumberValueObject.create(7);
            const result4 = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period4, rate, basis);
            expect(getObjectValue(result4)).toBe(0);
        });

        it('Rate <= 0', () => {
            const cost = NumberValueObject.create(2400);
            const datePurchased = StringValueObject.create('2008/8/19');
            const firstPeriod = StringValueObject.create('2008/12/31');
            const salvage = NumberValueObject.create(300);
            const period = NumberValueObject.create(1);
            const rate = NumberValueObject.create(0);
            const basis = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Basis value is 0|1|3|4', () => {
            const cost = NumberValueObject.create(2400);
            const datePurchased = StringValueObject.create('2008/8/19');
            const firstPeriod = StringValueObject.create('2008/12/31');
            const salvage = NumberValueObject.create(300);
            const period = NumberValueObject.create(0);
            const rate = NumberValueObject.create(0.15);
            const basis = NumberValueObject.create(2);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const basis2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis2);
            expect(getObjectValue(result2)).toBe(132);

            const basis3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis3);
            expect(getObjectValue(result3, true)).toBe(131.803278688525);

            const basis4 = NumberValueObject.create(3);
            const result4 = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis4);
            expect(getObjectValue(result4, true)).toBe(132.164383561644);

            const basis5 = NumberValueObject.create(4);
            const result5 = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis5);
            expect(getObjectValue(result5)).toBe(131);
        });

        it('value is array', () => {
            const cost = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2012-3-29', 'test', true, false, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const datePurchased = StringValueObject.create('2008/8/19');
            const firstPeriod = StringValueObject.create('2008/12/31');
            const salvage = NumberValueObject.create(300);
            const period = NumberValueObject.create(1);
            const rate = NumberValueObject.create(0.15);
            const basis = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
    });
});
