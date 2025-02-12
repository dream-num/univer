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
import { Coupnum } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test coupnum function', () => {
    const testFunction = new Coupnum(FUNCTION_NAMES_FINANCIAL.COUPNUM);

    describe('Coupnum', () => {
        it('Value is normal', () => {
            const settlement = StringValueObject.create('2011-1-25');
            const maturity = StringValueObject.create('2011-11-15');
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, frequency, basis);
            expect(result.getValue()).toStrictEqual(2);
        });

        it('Value is normal, settlement and maturity test', () => {
            const settlement = StringValueObject.create('2012-1-25');
            const maturity = StringValueObject.create('2011-11-15');
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const settlement2 = NumberValueObject.create(1);
            const maturity2 = StringValueObject.create('2011-11-15');
            const frequency2 = NumberValueObject.create(2);
            const basis2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(settlement2, maturity2, frequency2, basis2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Frequency value test', () => {
            const settlement = StringValueObject.create('2011-1-25');
            const maturity = StringValueObject.create('2011-11-15');
            const frequency = NumberValueObject.create(3);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const frequency2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(settlement, maturity, frequency2, basis);
            expect(result2.getValue()).toStrictEqual(1);

            const frequency3 = NumberValueObject.create(4);
            const result3 = testFunction.calculate(settlement, maturity, frequency3, basis);
            expect(result3.getValue()).toStrictEqual(4);
        });

        it('Basis value test', () => {
            const settlement = StringValueObject.create('2011-1-25');
            const maturity = StringValueObject.create('2011-11-15');
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(5);
            const result = testFunction.calculate(settlement, maturity, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const basis2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(settlement, maturity, frequency, basis2);
            expect(result2.getValue()).toStrictEqual(2);

            const basis3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(settlement, maturity, frequency, basis3);
            expect(result3.getValue()).toStrictEqual(2);

            const basis4 = NumberValueObject.create(3);
            const result4 = testFunction.calculate(settlement, maturity, frequency, basis4);
            expect(result4.getValue()).toStrictEqual(2);

            const basis5 = NumberValueObject.create(4);
            const result5 = testFunction.calculate(settlement, maturity, frequency, basis5);
            expect(result5.getValue()).toStrictEqual(2);
        });

        it('Value is error', () => {
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const maturity = StringValueObject.create('2011-11-15');
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const settlement = StringValueObject.create('2011-1-25');
            const maturity = StringValueObject.create('2011-11-15');
            const frequency = BooleanValueObject.create(true);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const settlement = StringValueObject.create('test');
            const maturity = StringValueObject.create('2011-11-15');
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const settlement2 = StringValueObject.create('2011-1-25');
            const maturity2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(settlement2, maturity2, frequency, basis);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const frequency2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(settlement2, maturity, frequency2, basis);
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
            const maturity = StringValueObject.create('2011-11-15');
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, frequency, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
