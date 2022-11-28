import { IRangeData } from '../Interfaces/IRangeData';
import { ObjectArray, PredicateFunction } from './ObjectArray';
import { Tools } from './Tools';
import { Nullable } from './Types';

/**
 * Object Matrix Primitive Type
 */
export type ObjectMatrixPrimitiveType<T> = {
    [key: number]: { [key: number]: T };
};

/**
 * Object Matrix Type
 */
type ObjectMatrixType<T> =
    | ObjectMatrix<T>
    | ObjectArray<ObjectArray<T>>
    | ObjectMatrixPrimitiveType<T>;

/**
 * A two-dimensional array represented by a two-level deep object and provides an array-like API

 @beta
 */
export class ObjectMatrix<T> {
    private _matrix: ObjectArray<ObjectArray<T>>;

    constructor(objectArray: ObjectMatrixType<T> = {}) {
        if (Tools.isAssignableFrom(objectArray, ObjectMatrix)) {
            this._matrix = objectArray._matrix;
            return;
        }
        if (Tools.isAssignableFrom(objectArray, ObjectArray)) {
            this._matrix = objectArray;
            return;
        }
        if (Tools.isPlainObject(objectArray)) {
            this._matrix = new ObjectArray<ObjectArray<T>>(objectArray);
        }
    }

    getMatrix() {
        return this._matrix;
    }

    forEach(callback: PredicateFunction<ObjectArray<T>>): ObjectMatrix<T> {
        const array = this._matrix;
        const keys = array.getKeys();
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const key = +keys[i];
            const value = this.getRow(key) as ObjectArray<T>;
            const result = callback(key, value);
            if (result === false) {
                return this;
            }
        }
        return this;
    }

    forValue(
        callback: (row: number, col: number, value: T) => Nullable<boolean>
    ): ObjectMatrix<T> {
        const rowArray = this._matrix;
        const rowKeys = rowArray.getKeys();
        const rowLength = rowKeys.length;
        for (let i = 0; i < rowLength; i++) {
            const rowNumber = +rowKeys[i];
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
        const srcRow = this._matrix.get(src);
        const targetRow = this._matrix.get(target);
        this._matrix.set(target, srcRow as ObjectArray<T>);
        this._matrix.set(src, targetRow as ObjectArray<T>);
    }

    getRow(rowIndex: number): Nullable<ObjectArray<T>> {
        const { _matrix } = this;
        let element = _matrix.get(rowIndex);
        if (Tools.isAssignableFrom(element, ObjectArray)) {
            return element;
        }
        if (Tools.isPlainObject(element)) {
            element = new ObjectArray<T>(element);
            _matrix.set(rowIndex, element);
            return element;
        }
    }

    getRowOrCreate(rowIndex: number): ObjectArray<T> {
        const objectArray = this.getRow(rowIndex);
        if (objectArray) {
            return objectArray;
        }
        const createArray = new ObjectArray<T>();
        this._matrix.set(rowIndex, createArray);
        return createArray;
    }

    reset() {
        this._matrix = new ObjectArray<ObjectArray<T>>({});
    }

    hasValue() {
        const matrix = this._matrix;
        for (const row of matrix) {
            if (!row.isEmpty()) {
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

    deleteValue(row: number, column: number): void {
        const objectArray = this.getRow(row);
        if (objectArray) {
            objectArray.delete(column);
        }
    }

    spliceRows(start: number, count: number): ObjectMatrix<T> {
        const splice = this._matrix.splice(start, count);
        return new ObjectMatrix(splice);
    }

    pushRow(row: ObjectArray<T>): void {
        this._matrix.push(row);
    }

    insertRow(rowIndex: number, row: ObjectArray<T>): void {
        this._matrix.insert(rowIndex, row);
    }

    insertRows(rowIndex: number, matrix: ObjectMatrix<T>) {
        this._matrix.inserts(rowIndex, matrix._matrix);
    }

    spliceColumns(start: number, count: number): ObjectMatrix<T> {
        const columnData = new ObjectMatrix<T>();
        this._matrix.forEach((index, value) => {
            for (let i = start; i < start + count; i++) {
                columnData.setValue(index, i - start, this.getValue(index, i));
            }
            this._matrix.get(index)?.splice(start, count);
        });

        return columnData;
    }

    // insertColumn(columnIndex: number, columnData: T) {
    //     this._matrix.forEach((index, value) => {
    //         value.insert(columnIndex, columnData[index]);
    //     });
    // }

    insertColumns(columnIndex: number, columnData: ObjectMatrix<T>) {
        const count = columnData.getRow(0)!.getLength();
        this.forEach((index, value) => {
            for (let i = columnIndex; i < columnIndex + count; i++) {
                const data = columnData.getRow(index)?.get(i - columnIndex);
                value.insert(i, columnData.getRow(index)?.get(i - columnIndex) as T);
            }
        });
    }

    getFragments(
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number
    ): ObjectMatrix<T> {
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
        return this._matrix.getSizeOf();
    }

    getLength(): number {
        return this._matrix.getLength();
    }

    getRange(): IRangeData {
        const startRow = 0;
        const startColumn = 0;
        const endRow = this.getSizeOf();
        let endColumn = 0;
        const length = this.getLength();
        for (let i = 0; i < length; i++) {
            const row = this.getRow(i);
            if (row) {
                const sizeof = row.getSizeOf();
                if (row.getSizeOf() > endColumn) {
                    endColumn = sizeof - 1;
                }
            }
        }
        return {
            startRow,
            startColumn,
            endRow,
            endColumn,
        };
    }

    toArray(): T[][] {
        return this._matrix.toArray().map((item) => item.toArray());
    }

    toJSON(): ObjectMatrixPrimitiveType<T> {
        const { _matrix } = this;
        return _matrix.toJSON() as unknown as ObjectMatrixPrimitiveType<T>;
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
                objectMatrix.setValue(
                    rowIndex - startRow,
                    columnIndex - startColumn,
                    value
                );
            });
        });

        return objectMatrix.getData();
    }

    getDataRange(): IRangeData {
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
}
