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
import { Sort } from '../index';
import { BooleanValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';

describe('Test sort function', () => {
    const testFunction = new Sort(FUNCTION_NAMES_LOOKUP.SORT);

    describe('Sort', () => {
        it('Value is normal', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Year', null],
                    [2, 1],
                    [null, 3],
                    [11, 4],
                    [true, 5],
                    ['abc', 67],
                    ['test', 8],
                    [ErrorType.NAME, 11],
                    [false, 2],
                    [2, 222],
                ]),
                rowCount: 10,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortIndex = NumberValueObject.create(1);
            const sortOrder = NumberValueObject.create(1);
            const byCol = BooleanValueObject.create(false);
            const resultObject = testFunction.calculate(array, sortIndex, sortOrder, byCol);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [2, 1],
                [2, 222],
                [11, 4],
                ['abc', 67],
                ['test', 8],
                ['Year', 0],
                [false, 2],
                [true, 5],
                [ErrorType.NAME, 11],
                [0, 3],
            ]);
        });

        it('SortIndex value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Year', null],
                    [2, 1],
                    [null, 3],
                    [11, 4],
                    [true, 5],
                    ['abc', 67],
                    ['test', 8],
                    [ErrorType.NAME, 11],
                    [false, 2],
                    [2, 222],
                ]),
                rowCount: 10,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortIndex = NumberValueObject.create(2);
            const resultObject = testFunction.calculate(array, sortIndex);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [2, 1],
                [false, 2],
                [0, 3],
                [11, 4],
                [true, 5],
                ['test', 8],
                [ErrorType.NAME, 11],
                ['abc', 67],
                [2, 222],
                ['Year', 0],
            ]);

            const sortIndex2 = NumberValueObject.create(0);
            const resultObject2 = testFunction.calculate(array, sortIndex2);
            expect(getObjectValue(resultObject2)).toStrictEqual(ErrorType.VALUE);

            const sortIndex3 = NumberValueObject.create(3);
            const resultObject3 = testFunction.calculate(array, sortIndex3);
            expect(getObjectValue(resultObject3)).toStrictEqual(ErrorType.VALUE);
        });

        it('SortOrder value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Year', null],
                    [2, 1],
                    [null, 3],
                    [11, 4],
                    [true, 5],
                    ['abc', 67],
                    ['test', 8],
                    [ErrorType.NAME, 11],
                    [false, 2],
                    [2, 222],
                ]),
                rowCount: 10,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortIndex = NumberValueObject.create(1);
            const sortOrder = NumberValueObject.create(-1);
            const resultObject = testFunction.calculate(array, sortIndex, sortOrder);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [ErrorType.NAME, 11],
                [true, 5],
                [false, 2],
                ['Year', 0],
                ['test', 8],
                ['abc', 67],
                [11, 4],
                [2, 1],
                [2, 222],
                [0, 3],
            ]);

            const sortOrder2 = NumberValueObject.create(0);
            const resultObject2 = testFunction.calculate(array, sortIndex, sortOrder2);
            expect(getObjectValue(resultObject2)).toStrictEqual(ErrorType.VALUE);
        });

        it('ByCol value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Year', null],
                    [2, 1],
                    [null, 3],
                    [11, 4],
                    [true, 5],
                    ['abc', 67],
                    ['test', 8],
                    [ErrorType.NAME, 11],
                    [false, 2],
                    [2, 222],
                ]),
                rowCount: 10,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortIndex = NumberValueObject.create(2);
            const sortOrder = NumberValueObject.create(1);
            const byCol = BooleanValueObject.create(true);
            const resultObject = testFunction.calculate(array, sortIndex, sortOrder, byCol);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [0, 'Year'],
                [1, 2],
                [3, 0],
                [4, 11],
                [5, true],
                [67, 'abc'],
                [8, 'test'],
                [11, ErrorType.NAME],
                [2, false],
                [222, 2],
            ]);

            const byCol2 = ArrayValueObject.create('{"test",1;0,#NAME?}');
            const resultObject2 = testFunction.calculate(array, sortIndex, sortOrder, byCol2);
            expect(getObjectValue(resultObject2)).toStrictEqual([
                [ErrorType.VALUE, 0],
                [2, ErrorType.NAME],
            ]);
        });
    });
});
