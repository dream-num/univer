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
import { Disc } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test disc function', () => {
    const testFunction = new Disc(FUNCTION_NAMES_FINANCIAL.DISC);

    describe('Disc', () => {
        it('Value is normal', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const pr = NumberValueObject.create(97.975);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, pr, redemption, basis);
            expect(result.getValue()).toStrictEqual(0.0006863841691213469);
        });

        it('Value is normal, settlement >= maturity', () => {
            const settlement = StringValueObject.create('2048-1-1');
            const maturity = StringValueObject.create('2018-7-1');
            const pr = NumberValueObject.create(97.975);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, pr, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Basis value test', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const pr = NumberValueObject.create(97.975);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(5);
            const result = testFunction.calculate(settlement, maturity, pr, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const basis2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(settlement, maturity, pr, redemption, basis2);
            expect(result2.getValue()).toStrictEqual(0.0006864406779661036);

            const basis3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(settlement, maturity, pr, redemption, basis3);
            expect(result3.getValue()).toStrictEqual(0.0006765033407572402);

            const basis4 = NumberValueObject.create(3);
            const result4 = testFunction.calculate(settlement, maturity, pr, redemption, basis4);
            expect(result4.getValue()).toStrictEqual(0.0006858992204899796);

            const basis5 = NumberValueObject.create(4);
            const result5 = testFunction.calculate(settlement, maturity, pr, redemption, basis5);
            expect(result5.getValue()).toStrictEqual(0.0006864406779661036);
        });

        it('Value is error', () => {
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const maturity = StringValueObject.create('2048-1-1');
            const pr = NumberValueObject.create(97.975);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, pr, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const settlement = StringValueObject.create('2018-7-1');
            const maturity = StringValueObject.create('2048-1-1');
            const pr = BooleanValueObject.create(true);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, pr, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const settlement = StringValueObject.create('test');
            const maturity = StringValueObject.create('2048-1-1');
            const pr = NumberValueObject.create(97.975);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, pr, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const settlement2 = StringValueObject.create('2018-7-1');
            const maturity2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(settlement2, maturity2, pr, redemption, basis);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const basis2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(settlement2, maturity, pr, redemption, basis2);
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
            const pr = NumberValueObject.create(97.975);
            const redemption = NumberValueObject.create(100);
            const basis = NumberValueObject.create(1);
            const result = testFunction.calculate(settlement, maturity, pr, redemption, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
