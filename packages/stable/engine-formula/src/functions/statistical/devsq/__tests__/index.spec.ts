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
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Devsq } from '../index';

describe('Test devsq function', () => {
    const testFunction = new Devsq(FUNCTION_NAMES_STATISTICAL.DEVSQ);

    describe('Devsq', () => {
        it('Value is normal', () => {
            const number1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [58, 35],
                    [11, 25],
                    [10, 23],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35, 47.65],
                    [17.56, 18.44],
                    [16.09, 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(2736.3684000000003);
        });

        it('Value is error', () => {
            const number1 = ErrorValueObject.create(ErrorType.NAME);
            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35, 47.65],
                    [17.56, 18.44],
                    [16.09, 16.91],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number1, number2);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const number3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME, 35],
                    [11, 25],
                    [10, 23],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(number2, number3);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is null or normal string or boolean', () => {
            const number1 = NullValueObject.create();
            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [45.35, 'test'],
                    [true, 18.44],
                    [16.09, false],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const number3 = NumberValueObject.create(1);
            const result = testFunction.calculate(number1, number2, number3);
            expect(getObjectValue(result)).toBe(1021.1506000000002);
        });

        it('Value is can not calculate', () => {
            const number1 = NullValueObject.create();
            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, null],
                    [null, null],
                    [null, null],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(number1, number2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });
    });
});
