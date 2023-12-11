/**
 * Copyright 2023 DreamNum Inc.
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

import type { IRange } from '../types/interfaces/i-range';
import type { ObjectArrayPrimitiveType, PredicateFunction } from './object-array';
import { ObjectArray } from './object-array';
import type { Nullable } from './types';

/**
 * Object Matrix Primitive Type
 */
export interface ObjectMatrixPrimitiveType<T> {
    [key: number]: { [key: number]: T };
}

// TODO: this is not a good name

/**
 * A two-dimensional array represented by a two-level deep object and provides an array-like API
 *
 * @beta
 */
export class ObjectMatrix<T> {
    private _option!: ObjectArray<ObjectArrayPrimitiveType<T>>;

    private _matrix!: ObjectMatrixPrimitiveType<T>;

    constructor(matrix: ObjectMatrixPrimitiveType<T> = {}) {
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

    forEach(callback: PredicateFunction<ObjectArray<T>>): ObjectMatrix<T> {
        const keys = this._option.getKeys();
        for (let i = 0; i < keys.length; i++) {
            const key = +keys[i];
            const value = this.getRow(key) as ObjectArray<T>;
            const result = callback(key, value);
            if (result === false) {
                return this;
            }
        }
        return this;
    }

    forRow(callback: (row: number, cols: number[]) => Nullable<boolean>): void {
        const keys = this._option.getKeys();
        for (let i = 0; i < keys.length; i++) {
            const key = +keys[i];
            const value = this.getRow(key) as ObjectArray<T>;
            const result = callback(
                key,
                value.getKeys().map((item) => +item)
            );
            if (result === false) {
                return;
            }
        }
    }

    forValue(callback: (row: number, col: number, value: T) => Nullable<boolean>): ObjectMatrix<T> {
        const keys = this._option.getKeys();
        for (let i = 0; i < keys.length; i++) {
            const rowNumber = +keys[i];
            const colArray = this.getRow(rowNumber) as ObjectArray<T>;
            const colKeys = colArray.getKeys();
            const colLength = colKeys.length;
            for (let j = 0; j < colLength; j++) {
                const colNumber = +colKeys[j];
                const value = colArray.get(colNumber) as T;
                const result = callback(rowNumber, colNumber, value);
                if (result === false) {
                    return this;
                }
            }
        }
        return this;
    }

    swapRow(src: number, target: number): void {
        const srcRow = this._option.get(src);
        const targetRow = this._option.get(target);
        this._option.set(target, srcRow as ObjectArrayPrimitiveType<T>);
        this._option.set(src, targetRow as ObjectArrayPrimitiveType<T>);
    }

    getRow(rowIndex: number): Nullable<ObjectArray<T>> {
        const element = this._option.get(rowIndex);
        if (element) {
            return new ObjectArray(element);
        }
    }

    getRowOrCreate(rowIndex: number): ObjectArray<T> {
        const row = this.getRow(rowIndex);
        if (row == null) {
            const row = {};
            this._option.set(rowIndex, row as ObjectArrayPrimitiveType<T>);
            return new ObjectArray(row);
        }
        return row;
    }

    reset() {
        this._setOriginValue({});
    }

    hasValue() {
        const matrix = this._option;
        for (const row of matrix) {
            if (!new ObjectArray(row).isEmpty()) {
                return true;
            }
        }
        return false;
    }

    getValue(row: number, column: number): Nullable<T> {
        const objectArray = this.getRow(row);
        if (objectArray) {
            return objectArray.get(column);
        }
        return null;
    }

    setValue(row: number, column: number, value: Nullable<T>): void {
        const objectArray = this.getRowOrCreate(row);
        objectArray.set(column, value as T);
    }

    /**
     * ！！
     * Please +1 ‘！’, who fell into this pit.
     * @deprecated use `realDelete` or `splice`
     */
    deleteValue(row: number, column: number): void {
        const objectArray = this.getRow(row);
        if (objectArray) {
            objectArray.delete(column);
        }
    }

    realDeleteValue(row: number, column: number): void {
        const objectArray = this.getRow(row);
        if (objectArray) {
            objectArray.realDelete(column);
            const size = objectArray.getSizeOf();
            if (!size) {
                this._option.realDelete(row);
            }
        }
    }

    spliceRows(start: number, count: number): ObjectMatrix<T> {
        const splice = this._option.splice(start, count);
        return new ObjectMatrix(splice.toJSON() as ObjectMatrixPrimitiveType<T>);
    }

    sliceRows(start: number, count: number): ObjectMatrix<T> {
        const slice = this._option.slice(start, count);
        return new ObjectMatrix(slice.toJSON() as ObjectMatrixPrimitiveType<T>);
    }

    pushRow(row: ObjectArray<T>): void {
        this._option.push(row.toJSON() as ObjectArrayPrimitiveType<T>);
    }

    moveRows(start: number, count: number, target: number): void {
        this._option.move(start, count, target);
    }

    moveColumns(start: number, count: number, target: number): void {
        // loop all rows and move column one by one, because our matrix is row-first
        this._option.forEach((row, value) => {
            const array = new ObjectArray(value);
            array.move(start, count, target);
        });
    }

    insertRow(rowIndex: number, row: ObjectArray<T>): void {
        this._option.insert(rowIndex, row.toJSON() as ObjectArrayPrimitiveType<T>);
    }

    insertRowCount(rowIndex: number, rowCount: number): void {
        this._option.inserts(rowIndex, new ObjectArray(rowCount));
    }

    insertRows(rowIndex: number, matrix: ObjectMatrix<T>) {
        this._option.inserts(rowIndex, matrix._option);
        console.dir(this._option);
    }

    spliceColumns(start: number, count: number): ObjectMatrix<T> {
        const columnData = new ObjectMatrix<T>();
        this._option.forEach((index, value) => {
            for (let i = start; i < start + count; i++) {
                columnData.setValue(index, i - start, this.getValue(index, i));
            }
            const row = this._option.get(index);
            if (row) {
                new ObjectArray(row).splice(start, count);
            }
        });
        return columnData;
    }

    sliceColumns(start: number, count: number): ObjectMatrix<T> {
        const columnData = new ObjectMatrix<T>();
        this._option.forEach((index, value) => {
            for (let i = start; i < start + count; i++) {
                columnData.setValue(index, i - start, this.getValue(index, i));
            }
        });
        return columnData;
    }

    insertColumns(columnIndex: number, columnData: ObjectMatrix<T>) {
        let count = 0;
        columnData.forEach((key) => {
            const data = columnData.getRow(key);
            if (data) {
                count = data.getLength();
                return false;
            }
        });
        this.forEach((index, value) => {
            for (let i = columnIndex; i < columnIndex + count; i++) {
                const data = columnData.getRow(index)?.get(i - columnIndex);
                value.insert(i, columnData.getRow(index)?.get(i - columnIndex) as T);
            }
        });
    }

    insertColumnCount(columnIndex: number, columnCount: number) {
        this.forEach((index, value) => {
            value.inserts(columnIndex, new ObjectArray<T>(columnCount));
        });
    }

    getFragments(startRow: number, endRow: number, startColumn: number, endColumn: number): ObjectMatrix<T> {
        const objectMatrix = new ObjectMatrix<T>();
        for (let r = startRow; r <= endRow; r++) {
            const row = new ObjectArray<T>();
            for (let c = startColumn; c <= endColumn; c++) {
                const value = this.getValue(r, c) as T;
                row.push(value);
            }
            objectMatrix.pushRow(row);
        }
        return objectMatrix;
    }

    getSizeOf(): number {
        return this._option.getSizeOf();
    }

    getLength(): number {
        return this._option.getLength();
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
                const columnLength = row.getLength() - 1;
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
        return this._option.toArray().map((item) => new ObjectArray(item).toArray()) as T[][];
    }

    toJSON(): ObjectMatrixPrimitiveType<T> {
        return this._matrix;
    }

    getData(): ObjectMatrixPrimitiveType<T> {
        const json = JSON.stringify(this);
        return JSON.parse(json);
    }

    getArrayData(): ObjectMatrixPrimitiveType<T> {
        let startRow = 0;
        let startColumn = 0;

        let initRow = false;
        let initColumn = false;
        const objectMatrix = new ObjectMatrix<T>();
        this.forEach((rowIndex, row) => {
            if (!initRow) {
                initRow = true;
                startRow = rowIndex;
            }
            row.forEach((columnIndex, column) => {
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

    getDataRange(): IRange {
        let startRow = 0;
        let startColumn = 0;
        let endColumn = 0;

        let initRow = false;
        let initColumn = false;

        this.forEach((rowIndex, row) => {
            if (!initRow) {
                initRow = true;
                startRow = rowIndex;
            }

            const rowSize = row.getLength() - 1;
            if (rowSize > endColumn) {
                endColumn = rowSize;
            }
            row.forEach((columnIndex, column) => {
                if (!initColumn) {
                    initColumn = true;
                    startColumn = columnIndex;
                } else if (columnIndex < startColumn) {
                    startColumn = columnIndex;
                }
            });
        });
        const endRow = startRow + this.getSizeOf() - 1;

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
            row.forEach((c, cell) => {
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

    merge(newObject: ObjectMatrix<T>) {
        this.forValue((row, column) => {
            const cellValue = newObject.getValue(row, column);
            if (cellValue != null) {
                this.setValue(row, column, cellValue);
            }
        });
    }

    private _setOriginValue(matrix: ObjectMatrixPrimitiveType<T> = {}) {
        this._matrix = matrix;
        this._option = new ObjectArray<ObjectArrayPrimitiveType<T>>(matrix);
    }
}
