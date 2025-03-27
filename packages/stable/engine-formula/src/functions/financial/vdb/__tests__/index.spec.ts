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
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Vdb } from '../index';

describe('Test vdb function', () => {
    const testFunction = new Vdb(FUNCTION_NAMES_FINANCIAL.VDB);

    describe('Vdb', () => {
        it('Value is normal', () => {
            const cost = NumberValueObject.create(24000);
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(3840);
        });

        it('Cost is normal string', () => {
            const cost = StringValueObject.create('test');
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Cost < 0 || salvage < 0 || cost < salvage', () => {
            const cost = NumberValueObject.create(-24000);
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const salvage2 = NumberValueObject.create(-3000);
            const result2 = testFunction.calculate(cost, salvage2, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result2.getValue()).toStrictEqual(ErrorType.NUM);

            const cost3 = NumberValueObject.create(2400);
            const salvage3 = NumberValueObject.create(3000);
            const result3 = testFunction.calculate(cost3, salvage3, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result3.getValue()).toStrictEqual(0);

            const startPeriod4 = NumberValueObject.create(0.1);
            const result4 = testFunction.calculate(cost3, salvage3, life, startPeriod4, endPeriod, factor, noSwitch);
            expect(result4.getValue()).toStrictEqual(-600);
        });

        it('Life === 0 && startPeriod === 0 && endPeriod === 0', () => {
            const cost = NumberValueObject.create(24000);
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(0);
            const startPeriod = NumberValueObject.create(0);
            const endPeriod = NumberValueObject.create(0);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(ErrorType.DIV_BY_ZERO);
        });

        it('StartPeriod > endPeriod > life || StartPeriod > life / 2', () => {
            const cost = NumberValueObject.create(24000);
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(22);
            const endPeriod = NumberValueObject.create(12);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const startPeriod2 = NumberValueObject.create(6.1);
            const endPeriod2 = NumberValueObject.create(6.2);
            const result2 = testFunction.calculate(cost, salvage, life, startPeriod2, endPeriod2, factor, noSwitch);
            expect(result2.getValue()).toStrictEqual(123.31253760000065);
        });

        it('NoSwitch test', () => {
            const cost = NumberValueObject.create(24000);
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(1);
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(3839.9999999999964);
        });

        it('Value is null', () => {
            const cost = NumberValueObject.create(24000);
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const factor = NullValueObject.create();
            const noSwitch = NullValueObject.create();
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(3840);
        });

        it('value is array', () => {
            const cost = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [24000, 'test', true, false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [3840, ErrorType.VALUE, 0, 0, ErrorType.NAME, 0],
            ]);
        });
    });
});
