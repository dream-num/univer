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
import { NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { AverageWeighted } from '../index';

describe('Test averageWeighted function', () => {
    const testFunction = new AverageWeighted(FUNCTION_NAMES_STATISTICAL.AVERAGE_WEIGHTED);

    describe('AverageWeighted', () => {
        it('Value is normal', () => {
            const value1 = NumberValueObject.create(1);
            const weight1 = NumberValueObject.create(3);
            const value2 = NumberValueObject.create(2);
            const weight2 = NumberValueObject.create(4);
            const result = testFunction.calculate(value1, weight1, value2, weight2);
            expect(getObjectValue(result)).toBe(1.5714285714285714);
        });

        it('Value is not paired', () => {
            const value1 = NumberValueObject.create(1);
            const weight1 = NumberValueObject.create(3);
            const value2 = NumberValueObject.create(2);
            const result = testFunction.calculate(value1, weight1, value2);
            expect(getObjectValue(result)).toBe(ErrorType.NA);
        });

        it('Weight is negative', () => {
            const value1 = NumberValueObject.create(1);
            const weight1 = NumberValueObject.create(3);
            const value2 = NumberValueObject.create(2);
            const weight2 = NumberValueObject.create(-4);
            const result = testFunction.calculate(value1, weight1, value2, weight2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is error', () => {
            const value1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2.34, true, false, null],
                    [0, '100', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const weight1 = NumberValueObject.create(3);
            const result = testFunction.calculate(value1, weight1);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const value2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4, 5],
                    [6, 7, 8, 9, 10],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const weight2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2.34, true, false, null],
                    [0, '100', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(value2, weight2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
        });

        it('Value and weight is different length', () => {
            const value1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const weight1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(value1, weight1);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('More test', () => {
            const value1 = ArrayValueObject.create('{2,4}');
            const weight1 = ArrayValueObject.create('{1,3}');
            const value2 = NullValueObject.create();
            const weight2 = NullValueObject.create();
            const result = testFunction.calculate(value1, weight1, value2, weight2);
            expect(getObjectValue(result)).toBe(3.5);

            const value3 = NumberValueObject.create(90);
            const weight3 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(value3, weight3);
            expect(getObjectValue(result2)).toBe(ErrorType.DIV_BY_ZERO);

            const result3 = testFunction.calculate(value2, weight2);
            expect(getObjectValue(result3)).toBe(ErrorType.DIV_BY_ZERO);
        });
    });
});
