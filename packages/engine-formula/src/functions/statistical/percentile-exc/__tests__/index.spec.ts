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
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { PercentileExc } from '../index';

describe('Test percentileExc function', () => {
    const testFunction = new PercentileExc(FUNCTION_NAMES_STATISTICAL.PERCENTILE_EXC);

    describe('PercentileExc', () => {
        it('Value is normal', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result)).toBe(3.3);
        });

        it('Value is number string', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['\'1', '\'2', '\'3', '\'4', '\'5', '\'6', '\'7', '\'8', '\'9', '\'10'],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Array value test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null, true, false, 'test', 6, 7, 8, 9, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, true, false, 'test'],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array2, k);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('K value test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.1);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result)).toBe(1.1);

            const k2 = NumberValueObject.create(0.9);
            const result2 = testFunction.calculate(array, k2);
            expect(getObjectValue(result2)).toBe(9.9);

            const k3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(array, k3);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);

            const k4 = NullValueObject.create();
            const result4 = testFunction.calculate(array, k4);
            expect(getObjectValue(result4)).toBe(ErrorType.NUM);

            const k5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(array, k5);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);

            const k6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(array, k6);
            expect(getObjectValue(result6)).toBe(ErrorType.NAME);

            const k7 = ArrayValueObject.create('{0.09,0.5,3}');
            const result7 = testFunction.calculate(array, k7);
            expect(getObjectValue(result7)).toStrictEqual([
                [ErrorType.NUM, 5.5, ErrorType.NUM],
            ]);

            const k8 = ArrayValueObject.create('{0.123}');
            const result8 = testFunction.calculate(array, k8);
            expect(getObjectValue(result8)).toBe(1.353);
        });

        it('More test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4, 5, 6, 7, 8, 9],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result)).toBe(3);
        });
    });
});
