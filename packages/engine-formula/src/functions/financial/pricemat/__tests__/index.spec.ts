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
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Pricemat } from '../index';

describe('Test pricemat function', () => {
    const testFunction = new Pricemat(FUNCTION_NAMES_FINANCIAL.PRICEMAT);

    describe('Pricemat', () => {
        it('Value is normal', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const yld = NumberValueObject.create(0.0625);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result, true)).toBe(110.862780081706);
        });

        it('Value is normal, but correct order is maturity > settlement > issue, otherwise return #NUM!', () => {
            const settlement = StringValueObject.create('2018-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2028-10-15');
            const rate = NumberValueObject.create(0.0785);
            const yld = NumberValueObject.create(0.0625);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Rate < 0', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(-0.0785);
            const yld = NumberValueObject.create(0.0625);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Yld < 0', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const yld = NumberValueObject.create(-0.0625);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Basis value test', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const yld = NumberValueObject.create(0.0625);
            const basis = NumberValueObject.create(5);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const basis2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(settlement, maturity, issue, rate, yld, basis2);
            expect(getObjectValue(result2, true)).toBe(110.882869098244);

            const basis3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(settlement, maturity, issue, rate, yld, basis3);
            expect(getObjectValue(result3, true)).toBe(110.96026004584);

            const basis4 = NumberValueObject.create(3);
            const result4 = testFunction.calculate(settlement, maturity, issue, rate, yld, basis4);
            expect(getObjectValue(result4, true)).toBe(110.878910539315);

            const basis5 = NumberValueObject.create(4);
            const result5 = testFunction.calculate(settlement, maturity, issue, rate, yld, basis5);
            expect(getObjectValue(result5, true)).toBe(110.882869098244);

            const basis6 = NullValueObject.create();
            const result6 = testFunction.calculate(settlement, maturity, issue, rate, yld, basis6);
            expect(getObjectValue(result6, true)).toBe(110.882869098244);
        });

        it('Value is error', () => {
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const yld = NumberValueObject.create(0.0625);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const yld = NumberValueObject.create(0.0625);
            const basis = BooleanValueObject.create(true);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const settlement = StringValueObject.create('test');
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const yld = NumberValueObject.create(0.0625);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const settlement2 = StringValueObject.create('2008-11-11');
            const maturity2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(settlement2, maturity2, issue, rate, yld, basis);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const issue2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(settlement2, maturity, issue2, rate, yld, basis);
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);

            const rate2 = StringValueObject.create('test');
            const result4 = testFunction.calculate(settlement2, maturity, issue, rate2, yld, basis);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const settlement = ArrayValueObject.create({
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
            const maturity = StringValueObject.create('2021-3-1');
            const issue = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const yld = NumberValueObject.create(0.0625);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, issue, rate, yld, basis);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
    });
});
