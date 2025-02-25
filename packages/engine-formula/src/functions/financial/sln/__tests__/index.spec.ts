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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Sln } from '../index';

describe('Test sln function', () => {
    const testFunction = new Sln(FUNCTION_NAMES_FINANCIAL.SLN);

    describe('Sln', () => {
        it('Value is normal', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = NumberValueObject.create(75000);
            const life = NumberValueObject.create(10);
            const result = testFunction.calculate(cost, salvage, life);
            expect(result.getValue()).toStrictEqual(22500);
        });

        it('Value is normal string', () => {
            const cost = StringValueObject.create('test');
            const salvage = NumberValueObject.create(75000);
            const life = NumberValueObject.create(10);
            const result = testFunction.calculate(cost, salvage, life);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = NumberValueObject.create(75000);
            const life = BooleanValueObject.create(true);
            const result = testFunction.calculate(cost, salvage, life);
            expect(result.getValue()).toStrictEqual(225000);
        });

        it('Value is null', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = NumberValueObject.create(75000);
            const life = NullValueObject.create();
            const result = testFunction.calculate(cost, salvage, life);
            expect(result.getValue()).toStrictEqual(ErrorType.DIV_BY_ZERO);
        });

        it('Value is error', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = ErrorValueObject.create(ErrorType.NAME);
            const life = NumberValueObject.create(10);
            const result = testFunction.calculate(cost, salvage, life);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const salvage2 = NumberValueObject.create(75000);
            const life2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(cost, salvage2, life2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('value is array', () => {
            const cost = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['test', 0.06, false],
                    [true, null, ErrorType.NAME],
                    [-22, '1.23', 100],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const salvage = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, -200, false, null],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const life = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [10],
                    [false],
                    [null],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(cost, salvage, life);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, 200.06, 0, ErrorType.NA],
                [0, 20, ErrorType.NAME, ErrorType.NA],
                [ErrorType.DIV_BY_ZERO, ErrorType.DIV_BY_ZERO, ErrorType.DIV_BY_ZERO, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});
