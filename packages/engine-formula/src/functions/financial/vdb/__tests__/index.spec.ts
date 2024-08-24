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
import { Vdb } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

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

        it('Cost < 0 || salvage < 0', () => {
            const cost = NumberValueObject.create(-24000);
            let salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(1);
            const endPeriod = NumberValueObject.create(2);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(0);
            let result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            salvage = NumberValueObject.create(-3000);
            result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
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

        it('StartPeriod > endPeriod > life', () => {
            const cost = NumberValueObject.create(24000);
            const salvage = NumberValueObject.create(3000);
            const life = NumberValueObject.create(10);
            const startPeriod = NumberValueObject.create(22);
            const endPeriod = NumberValueObject.create(12);
            const factor = NumberValueObject.create(2);
            const noSwitch = NumberValueObject.create(0);
            const result = testFunction.calculate(cost, salvage, life, startPeriod, endPeriod, factor, noSwitch);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
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
