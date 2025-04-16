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
import { Tbillyield } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test tbillyield function', () => {
    const testFunction = new Tbillyield(FUNCTION_NAMES_FINANCIAL.TBILLYIELD);

    describe('Tbillyield', () => {
        it('Value is normal', () => {
            const settlement = StringValueObject.create('2008-3-31');
            const maturity = StringValueObject.create('2008-6-1');
            const pr = NumberValueObject.create(98.45);
            const result = testFunction.calculate(settlement, maturity, pr);
            expect(result.getValue()).toStrictEqual(0.09141696292534264);
        });

        it('Settlement >= maturity', () => {
            const settlement = StringValueObject.create('2018-3-31');
            const maturity = StringValueObject.create('2008-6-1');
            const pr = NumberValueObject.create(98.45);
            const result = testFunction.calculate(settlement, maturity, pr);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Maturity is more than one year after settlement', () => {
            const settlement = StringValueObject.create('2008-3-31');
            const maturity = StringValueObject.create('2018-6-1');
            const pr = NumberValueObject.create(98.45);
            const result = testFunction.calculate(settlement, maturity, pr);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('pr <= 0', () => {
            const settlement = StringValueObject.create('2008-3-31');
            const maturity = StringValueObject.create('2008-6-1');
            const pr = NumberValueObject.create(-98.45);
            const result = testFunction.calculate(settlement, maturity, pr);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const maturity = StringValueObject.create('2008-6-1');
            const pr = NumberValueObject.create(98.45);
            const result = testFunction.calculate(settlement, maturity, pr);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const settlement = StringValueObject.create('2008-3-31');
            const maturity = StringValueObject.create('2008-6-1');
            const pr = BooleanValueObject.create(true);
            const result = testFunction.calculate(settlement, maturity, pr);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const settlement = StringValueObject.create('test');
            const maturity = StringValueObject.create('2008-6-1');
            const pr = NumberValueObject.create(98.45);
            const result = testFunction.calculate(settlement, maturity, pr);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const settlement2 = StringValueObject.create('2008-3-31');
            const maturity2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(settlement2, maturity2, pr);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const pr2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(settlement2, maturity, pr2);
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
            const maturity = StringValueObject.create('2008-6-1');
            const pr = NumberValueObject.create(98.45);
            const result = testFunction.calculate(settlement, maturity, pr);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
