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
import { Cumprinc } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test cumprinc function', () => {
    const testFunction = new Cumprinc(FUNCTION_NAMES_FINANCIAL.CUMPRINC);

    describe('Cumprinc', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.09 / 12);
            const nper = NumberValueObject.create(30 * 12);
            const pv = NumberValueObject.create(125000);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type);
            expect(result.getValue()).toStrictEqual(-137.06862939581106);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type2);
            expect(result2.getValue()).toStrictEqual(-1066.5693592017974);
        });

        it('Rate <= 0 or nper <= 0 or pv <= 0', () => {
            const rate = NumberValueObject.create(0);
            const nper = NumberValueObject.create(30 * 12);
            const pv = NumberValueObject.create(125000);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const rate2 = NumberValueObject.create(0.09 / 12);
            const nper2 = NumberValueObject.create(0);
            const pv2 = NumberValueObject.create(125000);
            const result2 = testFunction.calculate(rate2, nper2, pv2, startPeriod, endPeriod, type);
            expect(result2.getValue()).toStrictEqual(ErrorType.NUM);

            const rate3 = NumberValueObject.create(0.09 / 12);
            const nper3 = NumberValueObject.create(30 * 12);
            const pv3 = NumberValueObject.create(0);
            const result3 = testFunction.calculate(rate3, nper3, pv3, startPeriod, endPeriod, type);
            expect(result3.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('StartPeriod < 1 or endPeriod < 1 or startPeriod > endPeriod', () => {
            const rate = NumberValueObject.create(0.09 / 12);
            const nper = NumberValueObject.create(30 * 12);
            const pv = NumberValueObject.create(125000);
            const startPeriod = NumberValueObject.create(0);
            const endPeriod = NumberValueObject.create(2);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const startPeriod2 = NumberValueObject.create(1);
            const endPeriod2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(rate, nper, pv, startPeriod2, endPeriod2, type);
            expect(result2.getValue()).toStrictEqual(ErrorType.NUM);

            const startPeriod3 = NumberValueObject.create(3);
            const endPeriod3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(rate, nper, pv, startPeriod3, endPeriod3, type);
            expect(result3.getValue()).toStrictEqual(ErrorType.NUM);

            const startPeriod4 = NumberValueObject.create(1.1);
            const endPeriod4 = NumberValueObject.create(1.1);
            const result4 = testFunction.calculate(rate, nper, pv, startPeriod4, endPeriod4, type);
            expect(result4.getValue()).toStrictEqual(0);
        });

        it('Type value is not 0 or 1', () => {
            const rate = NumberValueObject.create(0.09 / 12);
            const nper = NumberValueObject.create(30 * 12);
            const pv = NumberValueObject.create(125000);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const type = NumberValueObject.create(0.1);
            const result = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const type2 = NumberValueObject.create(1.1);
            const result2 = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const nper = NumberValueObject.create(30 * 12);
            const pv = NumberValueObject.create(125000);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = NumberValueObject.create(0.09 / 12);
            const nper = NumberValueObject.create(30 * 12);
            const pv = NumberValueObject.create(125000);
            const startPeriod = BooleanValueObject.create(true);
            const endPeriod = NumberValueObject.create(2);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const nper = NumberValueObject.create(30 * 12);
            const pv = NumberValueObject.create(125000);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const rate = ArrayValueObject.create({
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
            const nper = NumberValueObject.create(30 * 12);
            const pv = NumberValueObject.create(125000);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, startPeriod, endPeriod, type);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
