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

import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Sortby } from '../index';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test sortby function', () => {
    const testFunction = new Sortby(FUNCTION_NAMES_LOOKUP.SORTBY);

    describe('Sortby', () => {
        it('Value is normal', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 'Year', null],
                    [13, 2, 1],
                    [15, null, 3],
                    [17, 11, 4],
                    [19, true, 5],
                    [21, 'abc', 67],
                    [23, 'test', 8],
                    [25, ErrorType.NAME, 11],
                    [27, false, 2],
                    [29, 2, 222],
                ]),
                rowCount: 10,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byArray1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11],
                    [2],
                    [3],
                    [4],
                    [7],
                    [4],
                    [7],
                    [4],
                    [9],
                    [10],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder1 = NumberValueObject.create(1);
            const resultObject = testFunction.calculate(array, byArray1, sortOrder1);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [13, 2, 1],
                [15, 0, 3],
                [17, 11, 4],
                [21, 'abc', 67],
                [25, ErrorType.NAME, 11],
                [19, true, 5],
                [23, 'test', 8],
                [27, false, 2],
                [29, 2, 222],
                [11, 'Year', 0],
            ]);
        });

        it('byArray value rows or columns different lengths', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 'Year', null],
                    [13, 2, 1],
                    [15, null, 3],
                    [17, 11, 4],
                    [19, true, 5],
                    [21, 'abc', 67],
                    [23, 'test', 8],
                    [25, ErrorType.NAME, 11],
                    [27, false, 2],
                    [29, 2, 222],
                ]),
                rowCount: 10,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byArray1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11],
                    [2],
                    [3],
                    [4],
                    [7],
                    [4],
                    [7],
                    [4],
                    [9],
                    [10],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder1 = NumberValueObject.create(1);
            const byArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11],
                    [2],
                    [3],
                    [4],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder2 = NumberValueObject.create(1);
            const resultObject = testFunction.calculate(array, byArray1, sortOrder1, byArray2, sortOrder2);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.VALUE);

            const byArray3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const resultObject2 = testFunction.calculate(array, byArray1, sortOrder1, byArray3, sortOrder2);
            expect(getObjectValue(resultObject2)).toStrictEqual(ErrorType.VALUE);
        });

        it('array is error', async () => {
            const array = ErrorValueObject.create(ErrorType.NAME);
            const byArray1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11],
                    [2],
                    [3],
                    [4],
                    [7],
                    [4],
                    [7],
                    [4],
                    [9],
                    [10],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder1 = NumberValueObject.create(1);
            const resultObject = testFunction.calculate(array, byArray1, sortOrder1);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.NAME);
        });

        it('byArray and sortOrder must be paired', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 'Year', null],
                    [13, 2, 1],
                    [15, null, 3],
                    [17, 11, 4],
                    [19, true, 5],
                    [21, 'abc', 67],
                    [23, 'test', 8],
                    [25, ErrorType.NAME, 11],
                    [27, false, 2],
                    [29, 2, 222],
                ]),
                rowCount: 10,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byArray1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11],
                    [2],
                    [3],
                    [4],
                    [7],
                    [4],
                    [7],
                    [4],
                    [9],
                    [10],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder1 = NumberValueObject.create(1);
            const resultObject = testFunction.calculate(array, byArray1, sortOrder1, byArray1);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.VALUE);
        });

        it('byArray1 value has same value and byArray2 value same location can sort', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 'Year', null],
                    [13, 2, 1],
                    [15, null, 3],
                    [17, 11, 4],
                    [19, true, 5],
                    [21, 'abc', 67],
                    [23, 'test', 8],
                    [25, ErrorType.NAME, 11],
                    [27, false, 2],
                    [29, 2, 222],
                ]),
                rowCount: 10,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byArray1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11],
                    [2],
                    [3],
                    [4],
                    [7],
                    [4],
                    [7],
                    [4],
                    [9],
                    [10],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder1 = NumberValueObject.create(-1);
            const byArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2],
                    [1],
                    [1],
                    [1],
                    [2],
                    [111],
                    [3],
                    [2],
                    [1],
                    [4],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder2 = NumberValueObject.create(-1);
            const resultObject = testFunction.calculate(array, byArray1, sortOrder1, byArray2, sortOrder2);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [11, 'Year', 0],
                [29, 2, 222],
                [27, false, 2],
                [23, 'test', 8],
                [19, true, 5],
                [21, 'abc', 67],
                [25, ErrorType.NAME, 11],
                [17, 11, 4],
                [15, 0, 3],
                [13, 2, 1],
            ]);
        });

        it('sortOrder value is array', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 'Year', null],
                    [13, 2, 1],
                    [15, null, 3],
                    [17, 11, 4],
                    [19, true, 5],
                    [21, 'abc', 67],
                    [23, 'test', 8],
                    [25, ErrorType.NAME, 11],
                    [27, false, 2],
                    [29, 2, 222],
                ]),
                rowCount: 10,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byArray1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11],
                    [2],
                    [3],
                    [4],
                    [7],
                    [4],
                    [7],
                    [4],
                    [9],
                    [10],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder1 = NumberValueObject.create(-1);
            const byArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2],
                    [1],
                    [1],
                    [1],
                    [2],
                    [111],
                    [3],
                    [2],
                    [1],
                    [4],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortOrder2 = ArrayValueObject.create('{0,0,-1;-1,0,0}');
            const resultObject = testFunction.calculate(array, byArray1, sortOrder1, byArray2, sortOrder2);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [ErrorType.VALUE, ErrorType.VALUE, 11],
                [11, ErrorType.VALUE, ErrorType.VALUE],
            ]);
        });
    });
});
