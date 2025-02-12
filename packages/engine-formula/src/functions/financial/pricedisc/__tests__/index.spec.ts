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

import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Pricedisc } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test pricedisc function', () => {
    const testFunction = new Pricedisc(FUNCTION_NAMES_FINANCIAL.PRICEDISC);

    describe('Pricedisc', () => {
        it('Value is normal', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const discount = NumberValueObject.create(0.0625);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(23.125244427062967);
        });

        it('Settlement >= maturity', () => {
            const settlement = StringValueObject.create('2028-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const discount = NumberValueObject.create(0.0625);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Discount <= 0', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const discount = NumberValueObject.create(-0.0625);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Redemption <= 0', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const discount = NumberValueObject.create(0.0625);
            const redemption = NumberValueObject.create(-100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Basis value test', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const discount = NumberValueObject.create(0.0625);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(5);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const basis2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(settlement, maturity, discount, redemption, basis2);
            expect(result2.getValue()).toStrictEqual(23.09027777777777);

            const basis3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(settlement, maturity, discount, redemption, basis3);
            expect(result3.getValue()).toStrictEqual(21.99652777777777);

            const basis4 = NumberValueObject.create(3);
            const result4 = testFunction.calculate(settlement, maturity, discount, redemption, basis4);
            expect(result4.getValue()).toStrictEqual(23.06506849315069);

            const basis5 = NumberValueObject.create(4);
            const result5 = testFunction.calculate(settlement, maturity, discount, redemption, basis5);
            expect(result5.getValue()).toStrictEqual(23.09027777777777);

            const basis6 = NullValueObject.create();
            const result6 = testFunction.calculate(settlement, maturity, discount, redemption, basis6);
            expect(result6.getValue()).toStrictEqual(23.09027777777777);
        });

        it('Value is error', () => {
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const maturity = StringValueObject.create('2021-3-1');
            const discount = NumberValueObject.create(0.0625);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const discount = NumberValueObject.create(0.0625);
            const redemption = NumberValueObject.create(100);
            const basis = BooleanValueObject.create(true);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const settlement = StringValueObject.create('test');
            const maturity = StringValueObject.create('2021-3-1');
            const discount = NumberValueObject.create(0.0625);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const settlement2 = StringValueObject.create('2008-11-11');
            const maturity2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(settlement2, maturity2, discount, redemption, basis);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const discount2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(settlement2, maturity, discount2, redemption, basis);
            expect(result3.getValue()).toStrictEqual(ErrorType.VALUE);
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
            const discount = NumberValueObject.create(0.0625);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, discount, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
