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
import { PercentrankExc } from '../index';

describe('Test percentrankExc function', () => {
    const testFunction = new PercentrankExc(FUNCTION_NAMES_STATISTICAL.PERCENTRANK_EXC);

    describe('PercentrankExc', () => {
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
            const x = NumberValueObject.create(3.3);
            const significance = NullValueObject.create();
            const result = testFunction.calculate(array, x, significance);
            expect(getObjectValue(result)).toStrictEqual(0.3);
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
            const x = NumberValueObject.create(3.3);
            const result = testFunction.calculate(array, x);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

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
            const result2 = testFunction.calculate(array2, x);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NA);

            const array3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(array3, x);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NA);

            const x2 = NumberValueObject.create(-1);
            const result4 = testFunction.calculate(array3, x2);
            expect(getObjectValue(result4)).toStrictEqual(1);
        });

        it('X value test', () => {
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
            const x = NumberValueObject.create(0.1);
            const result = testFunction.calculate(array, x);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NA);

            const x2 = NumberValueObject.create(11);
            const result2 = testFunction.calculate(array, x2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NA);

            const x3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(array, x3);
            expect(getObjectValue(result3)).toStrictEqual(0.09);

            const x4 = NullValueObject.create();
            const result4 = testFunction.calculate(array, x4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NA);

            const x5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(array, x5);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);

            const x6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(array, x6);
            expect(getObjectValue(result6)).toStrictEqual(ErrorType.NAME);

            const x7 = ArrayValueObject.create('{2,5.5,13}');
            const result7 = testFunction.calculate(array, x7);
            expect(getObjectValue(result7)).toStrictEqual([
                [0.181, 0.5, ErrorType.NA],
            ]);

            const k8 = ArrayValueObject.create('{5.123}');
            const result8 = testFunction.calculate(array, k8);
            expect(getObjectValue(result8)).toStrictEqual(0.465);
        });

        it('Significance value test', () => {
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
            const x = NumberValueObject.create(5.123);
            const significance = NumberValueObject.create(10);
            const result = testFunction.calculate(array, x, significance);
            expect(getObjectValue(result)).toStrictEqual(0.4657272727);

            const significance2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(array, x, significance2);
            expect(getObjectValue(result2)).toStrictEqual(0.4);

            const significance3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(array, x, significance3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NUM);

            const significance4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(array, x, significance4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);

            const significance5 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(array, x, significance5);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.NAME);

            const significance6 = ArrayValueObject.create('{2,5.5,13}');
            const result6 = testFunction.calculate(array, x, significance6);
            expect(getObjectValue(result6)).toStrictEqual([
                [0.46, 0.46572, 0.4657272727272],
            ]);
        });

        it('More test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, 'test'],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const x = StringValueObject.create('test');
            const significance = NullValueObject.create();
            const result = testFunction.calculate(array, x, significance);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });
    });
});
