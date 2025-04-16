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
import { QuartileExc } from '../index';

describe('Test quartileExc function', () => {
    const testFunction = new QuartileExc(FUNCTION_NAMES_STATISTICAL.QUARTILE_EXC);

    describe('QuartileExc', () => {
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
            const quart = NumberValueObject.create(1);
            const result = testFunction.calculate(array, quart);
            expect(getObjectValue(result)).toStrictEqual(2.75);
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
            const quart = NumberValueObject.create(1);
            const result = testFunction.calculate(array, quart);
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
            const result2 = testFunction.calculate(array2, quart);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NUM);
        });

        it('Quart value test', () => {
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
            const quart = NumberValueObject.create(0.1);
            const result = testFunction.calculate(array, quart);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NUM);

            const quart2 = NumberValueObject.create(4.1);
            const result2 = testFunction.calculate(array, quart2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NUM);

            const quart3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(array, quart3);
            expect(getObjectValue(result3)).toStrictEqual(2.75);

            const quart4 = NullValueObject.create();
            const result4 = testFunction.calculate(array, quart4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NUM);

            const quart5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(array, quart5);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);

            const quart6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(array, quart6);
            expect(getObjectValue(result6)).toStrictEqual(ErrorType.NAME);

            const quart7 = ArrayValueObject.create('{0.09,-5,3}');
            const result7 = testFunction.calculate(array, quart7);
            expect(getObjectValue(result7)).toStrictEqual([
                [ErrorType.NUM, ErrorType.NUM, 8.25],
            ]);

            const quart8 = ArrayValueObject.create('{2}');
            const result8 = testFunction.calculate(array, quart8);
            expect(getObjectValue(result8)).toStrictEqual(5.5);
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
            const quart = NumberValueObject.create(2);
            const result = testFunction.calculate(array, quart);
            expect(getObjectValue(result)).toStrictEqual(5);

            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const quart2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(array2, quart2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NUM);
        });
    });
});
