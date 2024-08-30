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

import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Oddlyield } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test oddlyield function', () => {
    const testFunction = new Oddlyield(FUNCTION_NAMES_FINANCIAL.ODDLYIELD);

    describe('Oddlyield', () => {
        it('Value is normal', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(0.10707208890680205);
        });

        it('Value is normal, but correct order is maturity > settlement > lastInterest, otherwise return #NUM!', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2018-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Rate < 0', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(-0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Pr < 0', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(-84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Frequency value test', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(3);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const frequency2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency2, basis);
            expect(result2.getValue()).toStrictEqual(0.10707509323707057);

            const frequency3 = NumberValueObject.create(4);
            const result3 = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency3, basis);
            expect(result3.getValue()).toStrictEqual(0.1070807374548397);
        });

        it('Basis value test', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(5);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const basis2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis2);
            expect(result2.getValue()).toStrictEqual(0.10708735030923248);

            const basis3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis3);
            expect(result3.getValue()).toStrictEqual(0.10705322702188155);

            const basis4 = NumberValueObject.create(3);
            const result4 = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis4);
            expect(result4.getValue()).toStrictEqual(0.10707674261155795);

            const basis5 = NumberValueObject.create(4);
            const result5 = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis5);
            expect(result5.getValue()).toStrictEqual(0.10708735030923248);

            const basis6 = NullValueObject.create();
            const result6 = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis6);
            expect(result6.getValue()).toStrictEqual(0.10708735030923248);
        });

        it('Value is error', () => {
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const settlement = StringValueObject.create('2008-11-11');
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = BooleanValueObject.create(true);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const settlement = StringValueObject.create('test');
            const maturity = StringValueObject.create('2021-3-1');
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const settlement2 = StringValueObject.create('2008-11-11');
            const maturity2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(settlement2, maturity2, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const lastInterest2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(settlement2, maturity, lastInterest2, rate, pr, redemption, frequency, basis);
            expect(result3.getValue()).toStrictEqual(ErrorType.VALUE);

            const rate2 = StringValueObject.create('test');
            const result4 = testFunction.calculate(settlement2, maturity, lastInterest, rate2, pr, redemption, frequency, basis);
            expect(result4.getValue()).toStrictEqual(ErrorType.VALUE);
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
            const lastInterest = StringValueObject.create('2008-10-15');
            const rate = NumberValueObject.create(0.0785);
            const pr = NumberValueObject.create(84.5);
            const redemption = NumberValueObject.create(100);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
