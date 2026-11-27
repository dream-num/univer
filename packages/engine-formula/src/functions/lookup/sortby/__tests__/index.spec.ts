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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { Columns } from '../../columns';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Index } from '../../index';
import { Sortby } from '../index';

describe('Test sortby function', () => {
    let injector: Injector;
    let testFunction: Sortby;

    beforeEach(() => {
        injector = new Injector([
            [Sortby, { useFactory: () => injector.createInstance(Sortby, FUNCTION_NAMES_LOOKUP.SORTBY) }],
        ]);
        testFunction = injector.get(Sortby);
    });

    afterEach(() => injector.dispose());

    it.each([
        { keys: [true, false, true, false], order: 1, expected: [2, 4, 1, 3] },
        { keys: [true, false, true, false], order: -1, expected: [1, 3, 2, 4] },
        { keys: [2, 10, '15'], order: 1, expected: [1, 2, 3] },
        { keys: [2, 10, '15'], order: -1, expected: [3, 2, 1] },
        { keys: ['#N/A', '#VALUE!', '#DIV/0!', '#NUM!', '#N/A', '#VALUE!'], order: 1, expected: [3, 2, 6, 4, 1, 5] },
        { keys: ['#N/A', '#VALUE!', '#DIV/0!', '#NUM!', '#N/A', '#VALUE!'], order: -1, expected: [1, 5, 4, 2, 6, 3] },
    ])('matches Excel type ranks and stable ties for $keys in order $order', ({ keys, order, expected }) => {
        const column = (values: Array<string | number | boolean>) => ArrayValueObject.create({
            calculateValueList: transformToValueObject(values.map((value) => [value]), true),
            rowCount: values.length,
            columnCount: 1,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });
        const array = column(keys.map((_, index) => index + 1));
        const by = column(keys);
        expect(getObjectValue(testFunction.calculate(array, by, NumberValueObject.create(order))))
            .toEqual(expected.map((value) => [value]));
    });

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
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE],
            ]);
        });
    });

    describe('Ties', () => {
        it('keeps rows with equal TRUE/FALSE keys in their original order', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1], [2], [3], [4], [5]]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[false], [true], [false], [false], [false]]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const descending = testFunction.calculate(array, byArray, NumberValueObject.create(-1));
            expect(getObjectValue(descending)).toStrictEqual([[2], [1], [3], [4], [5]]);
            const ascending = testFunction.calculate(array, byArray, NumberValueObject.create(1));
            expect(getObjectValue(ascending)).toStrictEqual([[1], [3], [4], [5], [2]]);
        });

        it('keeps rows with blank keys in their original order, after the other rows', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1], [2], [3], [4], [5]]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const byArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[null], [10], [null], [null], [20]]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const descending = testFunction.calculate(array, byArray, NumberValueObject.create(-1));
            expect(getObjectValue(descending)).toStrictEqual([[5], [2], [1], [3], [4]]);
            const ascending = testFunction.calculate(array, byArray, NumberValueObject.create(1));
            expect(getObjectValue(ascending)).toStrictEqual([[2], [5], [1], [3], [4]]);
        });

        it('uses the second sort key when both first keys are blank', () => {
            const [array, firstKey, secondKey] = [
                [[1], [2], [3], [4], [5]],
                [[null], [10], [null], [null], [20]],
                [[9], [4], [1], [3], [5]],
            ].map((values) => ArrayValueObject.create({
                calculateValueList: transformToValueObject(values),
                rowCount: values.length,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            }));
            const ascending = NumberValueObject.create(1);

            const result = testFunction.calculate(array, firstKey, ascending, secondKey, ascending);

            expect(getObjectValue(result)).toStrictEqual([[2], [5], [3], [4], [1]]);
        });
    });
});

function array(values: (number | string | boolean | null)[][]): ArrayValueObject {
    return ArrayValueObject.create({
        calculateValueList: transformToValueObject(values),
        rowCount: values.length,
        columnCount: values[0].length,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });
}

describe('SORTBY result dimensions', () => {
    const sortby = new Sortby(FUNCTION_NAMES_LOOKUP.SORTBY);
    const columns = new Columns(FUNCTION_NAMES_LOOKUP.COLUMNS);
    const index = new Index(FUNCTION_NAMES_LOOKUP.INDEX);

    it.each([1, -1])('keeps the input width when a shorter row sorts first with order %s', (order) => {
        const source = array([[2, 20], [1]]);
        const keys = array(order === 1 ? [[2], [1]] : [[1], [2]]);
        const result = sortby.calculate(source, keys, NumberValueObject.create(order)) as ArrayValueObject;

        expect(getObjectValue(columns.calculate(result))).toBe(2);
        expect(getObjectValue(index.calculate(result, NumberValueObject.create(2), NumberValueObject.create(2)))).toBe(20);
        expect(result.getArrayValue().map((row) => row.length)).toEqual([2, 2]);
        expect(getObjectValue(source)).toEqual([[2, 20], [1]]);
    });

    it('keeps later rows within the input width', () => {
        const source = array([[2, 20], [1, 10, 100]]);
        const result = sortby.calculate(source, array([[2], [1]])) as ArrayValueObject;

        expect(getObjectValue(result)).toEqual([[1, 10], [2, 20]]);
        expect(getObjectValue(columns.calculate(result))).toBe(2);
        expect(getObjectValue(source)).toEqual([[2, 20], [1, 10, 100]]);
    });
});

describe.each([false, true])('SORTBY column orientation: %s', (byColumns) => {
    const func = new Sortby(FUNCTION_NAMES_LOOKUP.SORTBY);
    const orient = (values: number[][]) => byColumns ? values[0].map((_, col) => values.map((row) => row[col])) : values;
    const keys = (values: (number | string | boolean | null)[]) => array(byColumns ? [values] : values.map((value) => [value]));

    it.each([
        { order: 1, expectedHash: 'df1731afceca7644' },
        { order: -1, expectedHash: '27a2a27465b356b4' },
    ])('retains Excel Jamo block ordering with order $order', ({ order, expectedHash }) => {
        // Independent Excel COM hashes from sort-jamo-large-excel-com.json (length 257, seed 0).
        const characters = ['\u1161', '\u1162', '\uD7A2'];
        const values = Array.from({ length: 257 }, (_, index) => characters[(((index + 1) * 17) % 31) % 3]);
        const source = array(orient(values.map((_, index) => [index, index + 1000])));
        const result = func.calculate(source, keys(values), NumberValueObject.create(order)) as ArrayValueObject;
        const positions = Array.from({ length: values.length }, (_, index) => Number(result.get(byColumns ? 0 : index, byColumns ? index : 0)?.getValue()));
        let hash = 14695981039346656037n;
        for (const position of positions) {
            for (const byte of [position >>> 8, position & 255]) {
                hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1099511628211n);
            }
        }
        expect(hash.toString(16).padStart(16, '0')).toBe(expectedHash);
    });

    it.each([
        { order: 1, indices: [3, 1, 0, 2, 4] },
        { order: -1, indices: [0, 2, 4, 3, 1] },
    ])('preserves secondary keys, ties and source arrays with order $order', ({ order, indices }) => {
        const rows = Array.from({ length: 5 }, (_, row) => [row * 100, row * 100 + 1, row * 100 + 2]);
        const source = array(orient(rows));
        const primary = keys([2, 1, 2, 1, 2]);
        const secondary = keys([3, 2, 1, 3, 1]);
        const originalPrimary = getObjectValue(primary);
        const originalSecondary = getObjectValue(secondary);

        const result = func.calculate(source, primary, NumberValueObject.create(order), secondary, NumberValueObject.create(-1)) as ArrayValueObject;

        expect(getObjectValue(result)).toEqual(orient(indices.map((index) => rows[index])));
        expect(getObjectValue(source)).toEqual(orient(rows));
        expect(getObjectValue(primary)).toEqual(originalPrimary);
        expect(getObjectValue(secondary)).toEqual(originalSecondary);
        result.set(0, 0, NumberValueObject.create(-1));
        expect(getObjectValue(source)).toEqual(orient(rows));
    });

    it.each([
        { order: 1, indices: [3, 2, 5, 1, 4, 0] },
        { order: -1, indices: [4, 1, 5, 2, 3, 0] },
    ])('retains mixed-type key ordering with order $order', ({ order, indices }) => {
        const rows = Array.from({ length: 6 }, (_, row) => [row, row + 10]);
        const source = array(orient(rows));
        const byArray = keys([null, true, 'z', 2, ErrorType.NA, false]);

        const result = func.calculate(source, byArray, NumberValueObject.create(order));

        expect(getObjectValue(result)).toEqual(orient(indices.map((index) => rows[index])));
        expect(getObjectValue(source)).toEqual(orient(rows));
    });
});

it('retains lifted sort-order validation after the first valid result', () => {
    const func = new Sortby(FUNCTION_NAMES_LOOKUP.SORTBY);
    const source = array([[20], [10], [30]]);
    const result = func.calculate(source, array([[2], [1], [3]]), array([[1, -1, 0, ErrorType.NA]])) as ArrayValueObject;

    expect(result.get(0, 1)?.isNull()).toBe(true);
    expect(getObjectValue(result)).toEqual([[10, 0, ErrorType.VALUE, ErrorType.NA]]);
    expect(getObjectValue(source)).toEqual([[20], [10], [30]]);
});
