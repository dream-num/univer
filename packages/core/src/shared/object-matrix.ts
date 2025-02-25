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

import type { IRange } from '../sheets/typedef';
import type { Nullable } from './types';
import { Tools } from './tools';

/**
 * Object Matrix Primitive Type
 */
export interface IObjectMatrixPrimitiveType<T> {
    [key: number]: IObjectArrayPrimitiveType<T>;
}

export interface IObjectArrayPrimitiveType<T> {
    [key: number]: T;
}

export function getArrayLength<T>(o: IObjectArrayPrimitiveType<T> | IObjectMatrixPrimitiveType<T>) {
    let maxIndex = 0;
    const keys = Object.keys(o);
    for (const key of keys) {
        const rowIndex = Number(key);
        maxIndex = Math.max(maxIndex, rowIndex);
    }
    return maxIndex + 1;
}

export function insertMatrixArray<T>(
    index: number,
    value: T,
    o: IObjectArrayPrimitiveType<T> | IObjectMatrixPrimitiveType<T>
) {
    const length = getArrayLength(o);
    const array = o;

    // move all items after index in backward order
    for (let i = length - 1; i >= index; i--) {
        array[i + 1] = array[i];
    }

    array[index] = value;
}

export function spliceArray<T>(
    start: number,
    count: number,
    o: IObjectArrayPrimitiveType<T> | IObjectMatrixPrimitiveType<T>
) {
    const length = Object.keys(o).reduce((max, key) => Math.max(max, Number.parseInt(key)), 0) + 1;

    // Delete elements within the specified range
    for (let i = start; i < length; i++) {
        if (i < start + count) {
            // If within deletion range, delete directly
            delete o[i];
        } else {
            // If not within deletion range, move forward count positions
            if (o[i] !== undefined) {
                o[i - count] = o[i];
                delete o[i];
            }
        }
    }
}

export function concatMatrixArray<T>(source: IObjectArrayPrimitiveType<T>, target: IObjectArrayPrimitiveType<T>) {
    const srcArray = source;
    const srcKeys = Object.keys(srcArray) as unknown as number[];
    const srcLength = srcKeys.length;

    const targetArray = target;
    const targetKeys = Object.keys(targetArray) as unknown as number[];
    const targetLength = targetKeys.length;

    const containerArray: IObjectArrayPrimitiveType<T> = {};
    let master = 0;

    for (let i = 0; i < srcLength; i++, master++) {
        const key = srcKeys[i];
        containerArray[master] = srcArray[key];
    }
    for (let i = 0; i < targetLength; i++, master++) {
        const key = targetKeys[i];
        containerArray[master] = targetArray[key];
    }

    return containerArray;
}

export function sliceMatrixArray<T>(
    start: number,
    end: number,
    matrixArray: IObjectArrayPrimitiveType<T>
): IObjectArrayPrimitiveType<T> {
    const array = matrixArray;
    const length = getArrayLength(matrixArray);
    if (length > 0) {
        const fragment: IObjectArrayPrimitiveType<T> = {};
        let effective = 0;
        for (let i = start; i <= end; i++) {
            const item = array[i];
            if (item) {
                fragment[effective] = array[i] as T;
                effective++;
            }
        }
        return fragment;
    }
    return {};
}

export function moveMatrixArray<T>(
    fromIndex: number,
    count: number,
    toIndex: number,
    o: IObjectArrayPrimitiveType<T> | IObjectMatrixPrimitiveType<T>
) {
    const moveBackward = fromIndex > toIndex;
    if (!moveBackward && fromIndex + count > toIndex) {
        throw new Error('Invalid move operation');
    }

    if (moveBackward) {
        _moveBackward(fromIndex, count, toIndex, o);
    } else {
        _moveForward(fromIndex, count, toIndex, o);
    }
}

function _moveBackward<T>(
    fromIndex: number,
    count: number,
    toIndex: number,
    o: IObjectArrayPrimitiveType<T> | IObjectMatrixPrimitiveType<T>
): void {
    const array = o;

    // cache item should be removed
    const toMove: Array<T | IObjectArrayPrimitiveType<T>> = [];
    for (let i = fromIndex; i < fromIndex + count; i++) {
        toMove.push(array[i]);
    }

    // move all items after toIndex in backward order
    for (let i = fromIndex - 1; i >= toIndex; i--) {
        const item = array[i];
        array[i + count] = item;

        // Prevent undefined, otherwise the forValue loop will report an error
        if (item === undefined) {
            delete array[i + count];
        }
    }

    // insert cached items to toIndex
    toMove.forEach((item, index) => {
        array[toIndex + index] = item;

        if (item === undefined) {
            delete array[toIndex + index];
        }
    });
}

function _moveForward<T>(
    fromIndex: number,
    count: number,
    toIndex: number,
    o: IObjectArrayPrimitiveType<T> | IObjectMatrixPrimitiveType<T>
): void {
    const array = o;

    // cache item should be removed
    const toMove: Array<T | IObjectArrayPrimitiveType<T>> = [];
    for (let i = fromIndex; i < fromIndex + count; i++) {
        toMove.push(array[i]);
    }

    // move all items after toIndex in forward order
    for (let i = fromIndex + count; i < toIndex; i++) {
        const item = array[i];
        array[i - count] = item;

        // Prevent undefined, otherwise the forValue loop will report an error
        if (item === undefined) {
            delete array[i - count];
        }
    }

    // insert cached items to toIndex
    toMove.forEach((item, index) => {
        array[toIndex + index - count] = item;

        if (item === undefined) {
            delete array[toIndex + index - count];
        }
    });
}

// TODO: this is not a good name

/**
 * A two-dimensional array represented by a two-level deep object and provides an array-like API
 *
 * @beta
 */
export class ObjectMatrix<T> {
    private _matrix!: IObjectMatrixPrimitiveType<T>;

    constructor(matrix: IObjectMatrixPrimitiveType<T> = {}) {
        this._setOriginValue(matrix);
    }

    static MakeObjectMatrixSize<T>(size: number): ObjectMatrix<T> {
        return new ObjectMatrix({
            [size - 1]: {},
        });
    }

    getMatrix() {
        return this._matrix;
    }

    forEach(callback: (row: number, objectArray: IObjectArrayPrimitiveType<T>) => Nullable<boolean>): ObjectMatrix<T> {
        const matrix = this._matrix;
        const matrixRow = Object.keys(matrix);
        for (const row of matrixRow) {
            const rowNumber = Number(row);
            const columns = matrix[rowNumber];
            const result = callback(rowNumber, columns);
            if (result === false) {
                return this;
            }
        }

        return this;
    }

    forRow(callback: (row: number, cols: number[]) => Nullable<boolean>): ObjectMatrix<T> {
        const matrix = this._matrix;
        const matrixRow = Object.keys(matrix);
        for (const row of matrixRow) {
            const rowNumber = Number(row);
            const columns = matrix[rowNumber];
            const result = callback(
                rowNumber,
                Object.keys(columns).map((col) => {
                    return Number(col);
                })
            );
            if (result === false) {
                return this;
            }
        }
        return this;
    }

    /**
     * Iterate the object matrix with row priority, which means it scan the whole range row by row.
     */
    forValue(callback: (row: number, col: number, value: T) => Nullable<boolean>): ObjectMatrix<T> {
        const matrix = this._matrix;

        for (const row in matrix) {
            const rowNumber = Number(row);
            const columns = matrix[rowNumber];

            if (!columns) continue;

            for (const column in columns) {
                const colNumber = Number(column);
                const value = columns[colNumber];

                const result = callback(rowNumber, colNumber, value);
                if (result === false) {
                    return this;
                }
            }
        }

        return this;
    }

    swapRow(src: number, target: number): void {
        const srcRow = this._matrix[src];
        const targetRow = this._matrix[target];

        this._matrix[src] = targetRow;

        this._matrix[target] = srcRow;
    }

    getRow(rowIndex: number): Nullable<IObjectArrayPrimitiveType<T>> {
        return this._matrix[rowIndex];
    }

    getRowOrCreate(rowIndex: number): IObjectArrayPrimitiveType<T> {
        let row = this.getRow(rowIndex);
        if (row == null) {
            row = {};
            this._matrix[rowIndex] = row;
        }

        return row;
    }

    reset() {
        this._setOriginValue({});
    }

    hasValue() {
        const matrix = this._matrix;
        const matrixRow = Object.keys(matrix);
        if (matrixRow.length === 0) {
            return false;
        }
        for (const row of matrixRow) {
            const rowNumber = Number(row);
            const columns = matrix[rowNumber];
            const columnKeys = Object.keys(columns);
            if (columnKeys.length > 0) {
                return true;
            }
        }

        return false;
    }

    getValue(row: number, column: number): Nullable<T> {
        return this._matrix?.[row]?.[column];
    }

    setValue(row: number, column: number, value: T): void {
        const objectArray = this.getRowOrCreate(row);
        objectArray[column] = value;
    }

    /**
     * ！！
     * Please +1 ‘！’, who fell into this pit.
     * @deprecated use `realDelete` or `splice`
     */
    deleteValue(row: number, column: number): void {
        delete this._matrix?.[row]?.[column];
    }

    realDeleteValue(row: number, column: number): void {
        delete this._matrix?.[row]?.[column];

        if (this.getRow(row)) {
            const objectArray = this.getRow(row);
            if (objectArray == null) {
                return;
            }
            const keys = Object.keys(objectArray);
            if (keys.length === 0) {
                delete this._matrix?.[row];
            }
        }
    }

    setRow(rowNumber: number, row: IObjectArrayPrimitiveType<T>): void {
        this._matrix[rowNumber] = row;
    }

    moveRows(start: number, count: number, target: number): void {
        moveMatrixArray(start, count, target, this._matrix);
    }

    moveColumns(start: number, count: number, target: number): void {
        // loop all rows and move column one by one, because our matrix is row-first
        this.forEach((row, value) => {
            moveMatrixArray(start, count, target, value);
        });
    }

    insertRows(start: number, count: number): void {
        for (let r = start; r < start + count; r++) {
            const initial: IObjectArrayPrimitiveType<T> = {};
            insertMatrixArray(r, initial, this._matrix);
        }
    }

    insertColumns(start: number, count: number): void {
        for (let c = start; c < start + count; c++) {
            this.forEach((row, data) => {
                if (data) {
                    insertMatrixArray(c, undefined, data);
                }
            });
        }
    }

    removeRows(start: number, count: number): void {
        spliceArray(start, count, this._matrix);
    }

    removeColumns(start: number, count: number): void {
        this.forEach((row, value) => {
            if (value) {
                spliceArray(start, count, value);
            }
        });
    }

    /**
     * Return a fragment of the original data matrix. Note that the returned matrix's row matrix would start from
     * 0 not `startRow`. Neither does its column matrix. If you want to get the original matrix, use `getSlice`.
     *
     * @param startRow
     * @param endRow
     * @param startColumn
     * @param endColumn
     * @returns
     */
    getFragment(startRow: number, endRow: number, startColumn: number, endColumn: number): ObjectMatrix<T> {
        const objectMatrix = new ObjectMatrix<T>();
        let insertRow = 0;
        for (let r = startRow; r <= endRow; r++) {
            const row: IObjectArrayPrimitiveType<T> = {};
            let insertColumn = 0;
            for (let c = startColumn; c <= endColumn; c++) {
                const value = this.getValue(r, c) as T;
                row[insertColumn] = value;
                insertColumn++;
            }
            objectMatrix.setRow(insertRow, row);
            insertRow++;
        }
        return objectMatrix;
    }

    /**
     * Return a slice of the original data matrix. Note that the returned matrix's row matrix would start from
     * `startRow` not 0, and the same does its column index. You may be looking for `getFragment` if you want
     * both of the indexes start from 0.
     *
     * @param startRow
     * @param endRow
     * @param startColumn
     * @param endColumn
     * @returns
     */
    getSlice(startRow: number, endRow: number, startColumn: number, endColumn: number): ObjectMatrix<T> {
        const objectMatrix = new ObjectMatrix<T>();
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const value = this.getValue(r, c);
                if (value) {
                    objectMatrix.setValue(r, c, Tools.deepClone(value));
                }
            }
        }
        return objectMatrix;
    }

    getSizeOf(): number {
        const keys = Object.keys(this._matrix);
        return keys.length;
    }

    getLength(): number {
        return getArrayLength(this._matrix);
    }

    getRange(): IRange {
        const startRow = 0;
        const startColumn = 0;
        const endRow = this.getLength() - 1;
        let endColumn = 0;
        const length = this.getLength();
        // OPTIMIZE: It may be possible to reduce the number of cycles
        for (let i = 0; i < length; i++) {
            const row = this.getRow(i);
            if (row) {
                const columnLength = getArrayLength(row) - 1;
                endColumn = columnLength > endColumn ? columnLength : endColumn;
            }
        }
        return {
            startRow,
            startColumn,
            endRow,
            endColumn,
        };
    }

    toNativeArray(): T[] {
        const native = new Array<T>();
        this.forValue((row: number, col: number, value: T) => {
            native.push(value);
        });
        return native;
    }

    toArray(): T[][] {
        const array: T[][] = [];
        this.forRow((row, cols) => {
            if (array[row] == null) {
                array[row] = [];
            }

            cols.forEach((column) => {
                array[row][column] = this.getValue(row, column)!;
            });
        });
        return array;
    }

    toFullArray(): T[][] {
        const range = this.getRange();
        const { endColumn, endRow } = range;
        const array: T[][] = [];
        for (let i = 0; i <= endRow; i++) {
            const subArr = new Array(endColumn + 1).fill(undefined);
            array.push(subArr);
        }

        this.forValue((row, col, value) => {
            array[row][col] = value;
        });

        return array;
    }

    /**
     * @deprecated Use getMatrix as a substitute.
     */
    toJSON(): IObjectMatrixPrimitiveType<T> {
        return this._matrix;
    }

    clone(): IObjectMatrixPrimitiveType<T> {
        const json = JSON.stringify(this._matrix);
        return JSON.parse(json);
    }

    /**
     * @deprecated Use clone as a substitute.
     */
    getData(): IObjectMatrixPrimitiveType<T> {
        const json = JSON.stringify(this._matrix);
        return JSON.parse(json);
    }

    getArrayData(): IObjectMatrixPrimitiveType<T> {
        let startRow = 0;
        let startColumn = 0;

        let initRow = false;
        let initColumn = false;
        const objectMatrix = new ObjectMatrix<T>();
        this.forEach((rowIndex, rowObject) => {
            if (!initRow) {
                initRow = true;
                startRow = rowIndex;
            }
            Object.keys(rowObject).forEach((column) => {
                const columnIndex = Number(column);
                if (!initColumn) {
                    initColumn = true;
                    startColumn = columnIndex;
                } else if (columnIndex < startColumn) {
                    startColumn = columnIndex;
                }
                const value = this.getValue(rowIndex, columnIndex) as T;
                objectMatrix.setValue(rowIndex - startRow, columnIndex - startColumn, value);
            });
        });

        return objectMatrix.getData();
    }

    /**
     * the function can only be used in all the row and column are positive integer
     * @description the positive integer in V8 Object is stored in a fast memory space and it is sorted  when we get the keys
     * @returns {IRange} the start and end scope of the matrix
     */
    getStartEndScope(): IRange {
        let startRow = Infinity;
        let endRow = -Infinity;
        let startColumn = Infinity;
        let endColumn = -Infinity;

        const rows = Object.keys(this._matrix);
        if (rows.length > 0) {
            startRow = +rows[0];
            endRow = +rows[rows.length - 1];
        }

        for (const row of rows) {
            const columns = Object.keys(this._matrix[row as unknown as number]);
            if (columns.length > 0) {
                startColumn = Math.min(startColumn, +columns[0]);
                endColumn = Math.max(endColumn, +columns[columns.length - 1]);
            }
        }

        return { startRow, endRow, startColumn, endColumn };
    }

    getDataRange(): IRange {
        let startRow = 0;
        let startColumn = 0;
        let endColumn = 0;
        let endRow = -1;

        let initRow = false;
        let initColumn = false;

        this.forEach((rowIndex, row) => {
            if (!initRow) {
                initRow = true;
                startRow = rowIndex;
            }

            if (row == null) {
                return;
            }

            const rowSize = getArrayLength(row) - 1;
            if (rowSize > endColumn) {
                endColumn = rowSize;
            }

            Object.keys(row).forEach((column) => {
                const columnIndex = Number(column);
                if (!initColumn) {
                    initColumn = true;
                    startColumn = columnIndex;
                } else if (columnIndex < startColumn) {
                    startColumn = columnIndex;
                }
            });

            // max rowIndex is the endRow
            if (rowIndex > endRow) {
                endRow = rowIndex;
            }
        });

        return {
            startRow,
            startColumn,
            endRow,
            endColumn,
        };
    }

    getDiscreteRanges() {
        const ranges: IRange[] = [];

        // Traverse row by row
        this.forEach((r, row) => {
            // Traverse column by column
            Object.keys(row).forEach((col) => {
                const c = Number(col);
                let merged = false;
                // Check if it can be merged with any of the existing ranges
                for (const range of ranges) {
                    if (
                        r >= range.startRow &&
                        r <= range.endRow + 1 &&
                        c >= range.startColumn &&
                        c <= range.endColumn + 1
                    ) {
                        // Extend the range
                        range.endRow = Math.max(r, range.endRow);
                        range.endColumn = Math.max(c, range.endColumn);
                        merged = true;
                        break;
                    }
                }

                // If not merged, then create a new range
                if (!merged) {
                    ranges.push({
                        startRow: r,
                        endRow: r,
                        startColumn: c,
                        endColumn: c,
                    });
                }
            });
        });

        return ranges;
    }

    private _setOriginValue(matrix: IObjectMatrixPrimitiveType<T> = {}) {
        this._matrix = matrix;
    }
}
