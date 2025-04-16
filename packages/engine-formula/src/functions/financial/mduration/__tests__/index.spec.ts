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
import { Mduration } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test mduration function', () => {
    const testFunction = new Mduration(FUNCTION_NAMES_FINANCIAL.MDURATION);

    describe('Mduration', () => {
        it('Value is normal', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(0.09);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(10.448942853198018);
        });

        it('Value is normal, settlement >= maturity', () => {
            const settlement = StringValueObject.create('2048-1-1');
            const maturity = StringValueObject.create('2018-7-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(0.09);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Coupon < 0', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(-0.1);
            const yld = NumberValueObject.create(0.09);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Yld < 0', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(-0.09);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Frequency value test', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(0.09);
            const frequency = NumberValueObject.create(3);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const frequency2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(settlement, maturity, coupon, yld, frequency2, basis);
            expect(result2.getValue()).toStrictEqual(9.979704155912495);

            const frequency3 = NumberValueObject.create(4);
            const result3 = testFunction.calculate(settlement, maturity, coupon, yld, frequency3, basis);
            expect(result3.getValue()).toStrictEqual(10.473000850230266);
        });

        it('Basis value test', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(0.09);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(5);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const basis2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis2);
            expect(result2.getValue()).toStrictEqual(10.448942853198018);

            const basis3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis3);
            expect(result3.getValue()).toStrictEqual(10.448942853198018);

            const basis4 = NumberValueObject.create(3);
            const result4 = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis4);
            expect(result4.getValue()).toStrictEqual(10.448942853198018);

            const basis5 = NumberValueObject.create(4);
            const result5 = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis5);
            expect(result5.getValue()).toStrictEqual(10.448942853198018);

            const basis6 = NullValueObject.create();
            const result6 = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis6);
            expect(result6.getValue()).toStrictEqual(10.448942853198018);
        });

        it('Value is error', () => {
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(0.09);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(0.09);
            const frequency = BooleanValueObject.create(true);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const settlement = StringValueObject.create('test');
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(0.09);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const settlement2 = StringValueObject.create('2018-7-1');
            const maturity2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(settlement2, maturity2, coupon, yld, frequency, basis);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const coupon2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(settlement2, maturity, coupon2, yld, frequency, basis);
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
            const maturity = StringValueObject.create('2048-1-1');
            const coupon = NumberValueObject.create(0.08);
            const yld = NumberValueObject.create(0.09);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, coupon, yld, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
