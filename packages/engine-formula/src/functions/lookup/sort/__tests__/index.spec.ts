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

import { Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Sort } from '../index';

describe('Test sort function', () => {
    let injector: Injector;
    let testFunction: Sort;

    beforeEach(() => {
        injector = new Injector([
            [Sort, { useFactory: () => injector.createInstance(Sort, FUNCTION_NAMES_LOOKUP.SORT) }],
        ]);
        testFunction = injector.get(Sort);
    });

    afterEach(() => injector.dispose());

    describe('Sort', () => {
        it.each([
            { index: 1, axis: '{FALSE,FALSE,FALSE}', expected: [[1, ErrorType.VALUE, ErrorType.VALUE]] },
            { index: 2, axis: '{FALSE,FALSE,FALSE}', expected: [[1, 0, ErrorType.VALUE]] },
            { index: 3, axis: '{FALSE,FALSE,FALSE}', expected: [[3, ErrorType.VALUE, ErrorType.VALUE]] },
            { index: 2, axis: '{#N/A,FALSE,FALSE}', expected: [[ErrorType.NA, 1, 0]] },
            { index: 1, axis: '{"1","0",FALSE}', expected: [[ErrorType.VALUE, ErrorType.VALUE, 1]] },
            { index: 1, axis: '{"TRUE","FALSE",FALSE}', expected: [[4, ErrorType.VALUE, ErrorType.VALUE]] },
        ])('retains local conversion state for index $index and axis $axis', ({ index, axis, expected }) => {
            const array = ArrayValueObject.create('{4,7,9;1,2,8;3,5,6}');
            const indices = ArrayValueObject.create(`{${index}}`);
            const calculate = () => testFunction.calculate(array, indices, NumberValueObject.create(1), ArrayValueObject.create(axis));
            expect(getObjectValue(calculate())).toStrictEqual(expected);
            expect(getObjectValue(calculate())).toStrictEqual(expected);
            expect(getObjectValue(array)).toStrictEqual([[4, 7, 9], [1, 2, 8], [3, 5, 6]]);
            expect(getObjectValue(indices)).toStrictEqual([[index]]);
        });

        it.each([
            { axis: '{TRUE}', expected: 4 },
            { axis: '{FALSE}', expected: 1 },
        ])('lifts a one-cell axis array $axis without spilling the entire sorted input', ({ axis, expected }) => {
            const result = testFunction.calculate(
                ArrayValueObject.create('{4,7,9;1,2,8;3,5,6}'),
                NumberValueObject.create(1),
                NumberValueObject.create(1),
                ArrayValueObject.create(axis)
            );
            expect(result.isArray()).toBe(true);
            expect(getObjectValue(result)).toStrictEqual([[expected]]);
        });

        it.each([
            { sortOrder: 1, expected: [[1, 'a'], [2, 'b'], [3, 'c'], [3, 'c'], [5, 'e']] },
            { sortOrder: -1, expected: [[5, 'e'], [3, 'c'], [3, 'c'], [2, 'b'], [1, 'a']] },
        ])('preserves the input rows when sorting with order $sortOrder', ({ sortOrder, expected }) => {
            const inputValues = [[3, 'c'], [1, 'a'], [2, 'b'], [3, 'c'], [5, 'e']];
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject(inputValues),
                rowCount: inputValues.length,
                columnCount: inputValues[0].length,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const result = testFunction.calculate(array, NumberValueObject.create(1), NumberValueObject.create(sortOrder));

            expect(getObjectValue(result)).toStrictEqual(expected);
            expect(getObjectValue(array)).toStrictEqual(inputValues);
        });

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
                [0, ErrorType.NAME],
            ]);
        });

        it('SortIndex is NullValueObject', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['T-16-7-4', 'T-16-6-2'],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const sortIndex = NullValueObject.create();
            const sortOrder = NumberValueObject.create(1);
            const byCol = BooleanValueObject.create(true);
            const resultObject = testFunction.calculate(array, sortIndex, sortOrder, byCol);
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['T-16-6-2', 'T-16-7-4'],
            ]);

            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, 1, 2],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const resultObject2 = testFunction.calculate(
                array2,
                NullValueObject.create(),
                NullValueObject.create(),
                BooleanValueObject.create(true)
            );
            expect(getObjectValue(resultObject2)).toStrictEqual([
                [1, 2, 3],
            ]);
        });
    });

    describe('Ties', () => {
        it('keeps rows with equal TRUE/FALSE values in their original order', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([['a', false], ['b', true], ['c', false], ['d', false]]),
                rowCount: 4,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const descending = testFunction.calculate(array, NumberValueObject.create(2), NumberValueObject.create(-1));
            expect(getObjectValue(descending)).toStrictEqual([['b', true], ['a', false], ['c', false], ['d', false]]);
            const ascending = testFunction.calculate(array, NumberValueObject.create(2), NumberValueObject.create(1));
            expect(getObjectValue(ascending)).toStrictEqual([['a', false], ['c', false], ['d', false], ['b', true]]);
        });

        it('keeps rows with blank values in their original order, after the other rows', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([['a', null], ['b', 1], ['c', null], ['d', null], ['e', 2]]),
                rowCount: 5,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const descending = testFunction.calculate(array, NumberValueObject.create(2), NumberValueObject.create(-1));
            expect(getObjectValue(descending)).toStrictEqual([['e', 2], ['b', 1], ['a', 0], ['c', 0], ['d', 0]]);
            const ascending = testFunction.calculate(array, NumberValueObject.create(2), NumberValueObject.create(1));
            expect(getObjectValue(ascending)).toStrictEqual([['b', 1], ['e', 2], ['a', 0], ['c', 0], ['d', 0]]);
        });
    });
});
