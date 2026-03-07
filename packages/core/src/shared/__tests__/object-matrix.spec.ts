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
import {
    concatMatrixArray,
    getArrayLength,
    insertMatrixArray,
    mapObjectMatrix,
    moveMatrixArray,
    ObjectMatrix,
    sliceMatrixArray,
    spliceArray,
} from '../object-matrix';

describe('test ObjectMatrix', () => {
    const getPrimitiveObj = () => ({
        1: { 1: '123', 2: '222', 3: '333' },
        2: { 1: '111', 2: '121', 3: '313' },
    });

    const getHasNullPrimitiveObj = () => ({
        1: '111',
        2: null,
        3: '333',
    });

    it('test deleteValue', () => {
        const matrix = new ObjectMatrix(getPrimitiveObj());
        matrix.realDeleteValue(1, 1);
        expect(matrix.getValue(1, 1)).toBe(undefined);
        expect(matrix.getSizeOf()).toBe(2);
        matrix.realDeleteValue(1, 2);
        matrix.realDeleteValue(1, 3);
        expect(matrix.getValue(1, 2)).toBe(undefined);
        expect(matrix.getValue(1, 3)).toBe(undefined);
        expect(matrix.getRow(1)).toBe(undefined);
        expect(matrix.getSizeOf()).toBe(1);
    });

    it('test forValue', () => {
        const matrix = new ObjectMatrix(getPrimitiveObj());
        matrix.realDeleteValue(1, 1);
        matrix.realDeleteValue(1, 2);
        matrix.realDeleteValue(1, 3);

        const rowList: number[] = [];
        const colList: number[] = [];
        matrix.forValue((row, col, _value) => {
            rowList.push(row);
            colList.push(col);
        });

        expect(rowList).toEqual([2, 2, 2]);
        expect(colList).toEqual([1, 2, 3]);
    });

    it('test moveMatrixArray', () => {
        const primitiveObject = getPrimitiveObj();
        moveMatrixArray(0, 1, 2, primitiveObject);
        expect(primitiveObject).toStrictEqual({
            0: { 1: '123', 2: '222', 3: '333' },
            2: { 1: '111', 2: '121', 3: '313' },
        });
    });
    it('test moveMatrixArray2', () => {
        const primitiveObject = getPrimitiveObj();
        moveMatrixArray(2, 1, 0, primitiveObject);
        expect(primitiveObject).toStrictEqual({
            0: { 1: '111', 2: '121', 3: '313' },
            2: { 1: '123', 2: '222', 3: '333' },
        });
    });

    it('test moveMatrixArray, with null move backward in it', () => {
        const primitiveObject = getHasNullPrimitiveObj();
        moveMatrixArray(2, 1, 0, primitiveObject);
        expect(primitiveObject).toStrictEqual({
            0: null,
            2: '111',
            3: '333',
        });
    });

    it('test moveMatrixArray, with null move forward in it', () => {
        const primitiveObject = getHasNullPrimitiveObj();
        moveMatrixArray(2, 1, 4, primitiveObject);
        expect(primitiveObject).toStrictEqual({
            1: '111',
            2: '333',
            3: null,
        });
    });
    it('test spliceMatrix row', () => {
        const matrix = new ObjectMatrix(getPrimitiveObj());
        spliceArray(1, 1, matrix.getMatrix());
        expect(matrix.getMatrix()).toStrictEqual({
            1: { 1: '111', 2: '121', 3: '313' },
        });
    });

    it('test spliceMatrix col', () => {
        const matrix = new ObjectMatrix(getPrimitiveObj());
        matrix.forEach((row, value) => {
            spliceArray(1, 1, value);
        });
        expect(matrix.getMatrix()).toStrictEqual({
            1: { 1: '222', 2: '333' },
            2: { 1: '121', 2: '313' },
        });
    });

    it('test getDataRange', () => {
        const matrix = new ObjectMatrix({});

        matrix.setValue(3, 3, '444');
        matrix.setValue(2000, 2000, '555');
        const range = matrix.getDataRange();

        const range1 = matrix.getStartEndScope();

        // the getDataRange and getStartEndScope should be the same
        expect(range.startRow).toBe(3);
        expect(range.startColumn).toBe(3);
        expect(range.endRow).toBe(2000);
        expect(range.endColumn).toBe(2000);

        expect(range1.startRow).toBe(3);
        expect(range1.startColumn).toBe(3);
        expect(range1.endRow).toBe(2000);
        expect(range1.endColumn).toBe(2000);
    });

    it('test getDataRange compare with getStartEndScope', () => {
        const matrix = new ObjectMatrix({});

        for (let i = 0; i < 100; i++) {
            const row = Math.floor(Math.random() * 10000);
            const col = Math.floor(Math.random() * 10000);
            matrix.setValue(row, col, '444');
        }

        const range = matrix.getDataRange();
        const range1 = matrix.getStartEndScope();

        expect(range.startRow).toBe(range1.startRow);
        expect(range.startColumn).toBe(range1.startColumn);
        expect(range.endRow).toBe(range1.endRow);
        expect(range.endColumn).toBe(range1.endColumn);
    });
    it('test getDataRange bigger', () => {
        const matrix = new ObjectMatrix({});

        for (let i = 0; i < 100; i++) {
            matrix.setValue(i, i, '444');
        }
        matrix.setValue(3, 3, '444');
        matrix.setValue(2000, 2000, '555');

        // console.time('getDataRange');
        const range = matrix.getDataRange();
        // console.timeEnd('getDataRange');

        // console.time('getStartEndScope');
        const range1 = matrix.getStartEndScope();
        // console.timeEnd('getStartEndScope');

        //compare the time
        // 100：
        // getDataRange: 0.763ms
        // getStartEndScope: 0.43ms
        // 1000：
        // getDataRange: 14.686ms
        // getStartEndScope: 8.129ms
        // 10000：
        // getDataRange: 38.232ms
        // getStartEndScope: 21.041ms
        // 100000：
        // getDataRange: 46.832ms
        // getStartEndScope: 23.482ms

        // the getDataRange and getStartEndScope should be the same
        expect(range.startRow).toBe(range1.startRow);
        expect(range.startColumn).toBe(range1.startColumn);
        expect(range.endRow).toBe(range1.endRow);
        expect(range.endColumn).toBe(range1.endColumn);
    });

    it('test getDiscreteRanges', () => {
        const matrix = new ObjectMatrix({
            0: {
                0: {},
                1: { v: 2 },
            },
        });

        const range = matrix.getDiscreteRanges();

        expect(range).toStrictEqual([{
            endColumn: 1,
            endRow: 0,
            startColumn: 0,
            startRow: 0,
        }]);
    });

    it('should map and measure sparse object matrices', () => {
        expect(getArrayLength({ 2: 'a', 5: 'b' })).toBe(6);
        expect(mapObjectMatrix({ 1: { 2: 3 }, 4: { 5: 6 } }, (row, col, value) => row + col + value)).toEqual({
            1: { 2: 6 },
            4: { 5: 15 },
        });
    });

    it('should insert, concat and slice matrix arrays', () => {
        const array = { 0: 'a', 2: 'c' };
        insertMatrixArray(1, 'b', array);
        expect(array).toEqual({ 0: 'a', 1: 'b', 3: 'c' });

        expect(concatMatrixArray({ 0: 'a', 3: 'b' }, { 1: 'c' })).toEqual({
            0: 'a',
            1: 'b',
            2: 'c',
        });
        expect(sliceMatrixArray(1, 3, { 0: 'a', 1: 'b', 3: 'd' })).toEqual({
            0: 'b',
            1: 'd',
        });
    });

    it('should expose fragment, slice and array conversions', () => {
        const matrix = new ObjectMatrix({
            1: { 2: { value: 1 }, 3: { value: 2 } },
            2: { 2: { value: 3 } },
        });

        expect(matrix.getFragment(1, 2, 2, 3).getMatrix()).toEqual({
            0: { 0: { value: 1 }, 1: { value: 2 } },
            1: { 0: { value: 3 }, 1: undefined },
        });

        const slice = matrix.getSlice(1, 2, 2, 3);
        expect(slice.getMatrix()).toEqual({
            1: { 2: { value: 1 }, 3: { value: 2 } },
            2: { 2: { value: 3 } },
        });
        expect(slice.getValue(1, 2)).not.toBe(matrix.getValue(1, 2));

        const expectedArray = new Array(3);
        expectedArray[1] = new Array(4);
        expectedArray[1][2] = { value: 1 };
        expectedArray[1][3] = { value: 2 };
        expectedArray[2] = new Array(3);
        expectedArray[2][2] = { value: 3 };

        expect(matrix.toArray()).toEqual(expectedArray);
        expect(matrix.toFullArray()).toEqual([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, { value: 1 }, { value: 2 }],
            [undefined, undefined, { value: 3 }, undefined],
        ]);
        expect(matrix.toNativeArray()).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });
});
