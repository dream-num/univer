/**
 * Copyright 2023-present DreamNum Inc.
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

import { isRealNum, type Nullable } from '@univerjs/core';

import { BooleanValue } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { CELL_INVERTED_INDEX_CACHE } from '../../basics/inverted-index-cache';
import { $ARRAY_VALUE_REGEX } from '../../basics/regex';
import { compareToken } from '../../basics/token';
import { getCompare } from '../utils/compare';
import type { callbackMapFnType, callbackProductFnType, IArrayValueObject } from './base-value-object';
import { BaseValueObject, ErrorValueObject } from './base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from './primitive-object';

enum BatchOperatorType {
    MINUS,
    PLUS,
    MULTIPLY,
    DIVIDED,
    COMPARE,
    CONCATENATE_FRONT,
    CONCATENATE_BACK,
    PRODUCT,
    LIKE,
    POW,
    ROUND,
    FLOOR,
    CEIL,
    ATAN2,
}

enum ArrayCalculateType {
    PRODUCT,
    ROW,
    COLUMN,
    SINGLE,
}

export function fromObjectToString(array: IArrayValueObject) {
    return '';
}

export function transformToValueObject(array: Array<Array<number | string | boolean>> = []) {
    const arrayValueList: BaseValueObject[][] = [];

    for (let r = 0; r < array.length; r++) {
        const row = array[r];

        if (arrayValueList[r] == null) {
            arrayValueList[r] = [];
        }

        for (let c = 0; c < row.length; c++) {
            const cell = row[c];

            arrayValueList[r][c] = ValueObjectFactory.create(cell);
        }
    }

    return arrayValueList;
}

export function transformToValue(array: BaseValueObject[][] = []) {
    const arrayValueList: Array<Array<string | number | boolean>> = [];

    for (let r = 0; r < array.length; r++) {
        const row = array[r];

        if (arrayValueList[r] == null) {
            arrayValueList[r] = [];
        }

        for (let c = 0; c < row.length; c++) {
            const cell = row[c];

            if (cell.isError()) {
                arrayValueList[r][c] = (cell as ErrorValueObject).getErrorType();
            } else {
                arrayValueList[r][c] = (cell as BaseValueObject).getValue();
            }
        }
    }

    return arrayValueList;
}

export class ArrayValueObject extends BaseValueObject {
    private _value: BaseValueObject[][] = [];

    private _rowCount: number = -1;

    private _columnCount: number = -1;

    private _unitId: string = '';

    private _sheetId: string = '';

    private _currentRow: number = -1;

    private _currentColumn: number = -1;

    constructor(rawValue: string | IArrayValueObject) {
        if (typeof rawValue === 'string') {
            super(rawValue as string);
        } else {
            const rawString = fromObjectToString(rawValue as IArrayValueObject);
            super(rawString);
        }

        this._value = this._formatValue(rawValue);
    }

    override dispose(): void {
        this._value.forEach((cells) => {
            cells.forEach((cell) => {
                cell.dispose();
            });
        });

        this._value = [];
    }

    getRowCount() {
        return this._rowCount;
    }

    setRowCount(rowCount: number) {
        this._rowCount = rowCount;
    }

    getColumnCount() {
        return this._columnCount;
    }

    setColumnCount(columnCount: number) {
        this._columnCount = columnCount;
    }

    setCurrent(row: number, column: number) {
        this._currentRow = row;
        this._currentColumn = column;
    }

    setUnitId(unitId: string) {
        this._unitId = unitId;
    }

    getUnitId() {
        return this._unitId;
    }

    setSheetId(sheetId: string) {
        this._sheetId = sheetId;
    }

    getSheetId() {
        return this._sheetId;
    }

    getCurrentRow() {
        return this._currentRow;
    }

    getCurrentColumn() {
        return this._currentColumn;
    }

    override getArrayValue() {
        return this._value;
    }

    override setArrayValue(value: BaseValueObject[][]) {
        this._value = value;
    }

    override isArray() {
        return true;
    }

    get(row: number, column: number) {
        return this._value[row][column];
    }

    set(row: number, column: number, value: BaseValueObject) {
        if (row >= this._rowCount || column >= this._columnCount) {
            throw new Error('Exceeding array bounds.');
        }
        this._value[row][column] = value;
    }

    getRangePosition() {
        const startRow = 0;
        const rowCount = this.getRowCount();
        const startColumn = 0;
        const columnCount = this.getColumnCount();

        return {
            startRow,
            endRow: rowCount - 1,
            startColumn,
            endColumn: columnCount - 1,
        };
    }

    iterator(
        callback: (valueObject: Nullable<BaseValueObject>, rowIndex: number, columnIndex: number) => Nullable<boolean>
    ) {
        const { startRow, endRow, startColumn, endColumn } = this.getRangePosition();

        const valueList = this.getArrayValue();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                if (callback(valueList[r][c], r, c) === false) {
                    return;
                }
            }
        }
    }

    getFirstCell() {
        const { startRow, startColumn } = this.getRangePosition();
        const valueList = this.getArrayValue();
        return valueList[startRow][startColumn];
    }

    /**
     * Referring to matrix calculations,
     * extract the matching values from a true/false matrix based on parameters and store them in a two-dimensional array.
     * implement x[x<10]
     * https://numpy.org/doc/stable/user/basics.indexing.html
     * @param takeArray
     */
    pick(takeArray: ArrayValueObject) {
        const takeArrayRowCount = takeArray.getRowCount();
        const takeArrayColumnCount = takeArray.getColumnCount();

        if (takeArrayRowCount !== this._rowCount || takeArrayRowCount !== this._rowCount) {
            return this._createNewArray([[new NumberValueObject(0)]], 1, 1);
        }

        const newValue: BaseValueObject[][] = [];

        newValue[0] = [];

        for (let r = 0; r < takeArrayRowCount; r++) {
            for (let c = 0; c < takeArrayColumnCount; c++) {
                const takeCell = takeArray.get(r, c);
                const value = this.get(r, c);
                if (takeCell.isError()) {
                    continue;
                }

                if ((takeCell as BaseValueObject).getValue() === true) {
                    newValue[0].push(value);
                }
            }
        }

        return this._createNewArray(newValue, 1, newValue[0].length);
    }

    /**
     * Flatten a 2D array.
     * https://numpy.org/doc/stable/reference/generated/numpy.chararray.flatten.html#numpy.chararray.flatten
     */
    flatten() {
        const newValue: BaseValueObject[][] = [];
        newValue[0] = [];
        for (let r = 0; r < this._rowCount; r++) {
            for (let c = 0; c < this._rowCount; c++) {
                const value = this.get(r, c);

                newValue[0].push(value);
            }
        }
        return this._createNewArray(newValue, 1, newValue[0].length);
    }

    /**
     * I'm looking to perform slicing operations on 2D arrays, similar to the functionality provided by NumPy.
     * https://numpy.org/doc/stable/user/basics.indexing.html
     * @rowParam start:stop:step
     * @columnParam start:stop:step
     * @param takeArray
     */
    slice(rowParam: Nullable<Array<Nullable<number>>>, columnParam: Nullable<Array<Nullable<number>>>) {
        let rowStart = 0;
        let rowStop = this._rowCount - 1;
        let rowStep = 1;

        let columnStart = 0;
        let columnStop = this._columnCount - 1;
        let columnStep = 1;

        if (rowParam != null) {
            rowStart = rowParam[0] || 0;
            rowStop = rowParam[1] || this._rowCount - 1;
            rowStep = rowParam[2] || 1;
        }

        if (columnParam != null) {
            columnStart = columnParam[0] || 0;
            columnStop = columnParam[1] || this._columnCount - 1;
            columnStep = columnParam[2] || 1;
        }

        const result: BaseValueObject[][] = [];

        const array = this._value;

        let result_row_index = 0;
        let result_column_index = 0;
        for (let r = rowStart; r <= rowStop; r += rowStep) {
            result_column_index = 0;
            if (result[result_row_index] == null) {
                result[result_row_index] = [];
            }
            for (let c = columnStart; c <= columnStop; c += columnStep) {
                result[result_row_index][result_column_index] = array[r][c];
                result_column_index++;
            }
            result_row_index++;
        }

        return this._createNewArray(result, result.length, result[0].length);
    }

    sum() {
        let accumulatorAll: BaseValueObject = new NumberValueObject(0);
        this.iterator((valueObject) => {
            if (valueObject == null) {
                return true; // continue
            }

            if (valueObject.isError()) {
                accumulatorAll = valueObject;
                return false; // break
            }
            accumulatorAll = (accumulatorAll as NumberValueObject).plus(
                valueObject as BaseValueObject
            ) as BaseValueObject;
        });

        return accumulatorAll;
    }

    max() {
        let accumulatorAll: BaseValueObject = new NumberValueObject(-Infinity);
        this.iterator((valueObject) => {
            if (valueObject == null) {
                return true; // continue
            }

            if (valueObject.isError()) {
                accumulatorAll = valueObject;
                return false; // break
            }

            if ((valueObject as BaseValueObject).isString() || (valueObject as BaseValueObject).isNull()) {
                return true; // continue
            }

            const result = (accumulatorAll as BaseValueObject).isLessThan(
                valueObject as BaseValueObject
            ) as BooleanValueObject;

            if (result.getValue()) {
                accumulatorAll = valueObject as NumberValueObject;
            }
        });

        return accumulatorAll;
    }

    min() {
        let accumulatorAll: BaseValueObject = new NumberValueObject(Infinity);

        this.iterator((valueObject) => {
            if (valueObject == null) {
                return true; // continue
            }

            if (valueObject.isError()) {
                accumulatorAll = valueObject;
                return false; // break
            }

            if ((valueObject as BaseValueObject).isString() || (valueObject as BaseValueObject).isNull()) {
                return true; // continue
            }

            const result = (accumulatorAll as BaseValueObject).isGreaterThan(
                valueObject as BaseValueObject
            ) as BooleanValueObject;

            if (result.getValue()) {
                accumulatorAll = valueObject as NumberValueObject;
            }
        });

        return accumulatorAll;
    }

    count() {
        let accumulatorAll: BaseValueObject = new NumberValueObject(0);
        this.iterator((valueObject) => {
            if (valueObject == null) {
                return true; // continue
            }

            if (
                valueObject.isError() ||
                (valueObject as BaseValueObject).isString() ||
                (valueObject as BaseValueObject).isNull()
            ) {
                return true; // continue
            }
            accumulatorAll = accumulatorAll.plusBy(1) as BaseValueObject;
        });

        return accumulatorAll;
    }

    countA() {
        let accumulatorAll: BaseValueObject = new NumberValueObject(0);
        this.iterator((valueObject) => {
            if (valueObject == null) {
                return true; // continue
            }

            if ((valueObject as BaseValueObject).isNull()) {
                return true; // continue
            }

            accumulatorAll = accumulatorAll.plusBy(1) as BaseValueObject;
        });

        return accumulatorAll;
    }

    countBlank() {
        let accumulatorAll: BaseValueObject = new NumberValueObject(0);
        this.iterator((valueObject) => {
            if (valueObject != null) {
                return true; // continue
            }

            accumulatorAll = accumulatorAll.plusBy(1) as BaseValueObject;
        });

        return accumulatorAll;
    }

    sortByRow(index: number) {
        // new Intl.Collator('zh', { numeric: true }).compare;
        const result: BaseValueObject[][] = this._transposeArray(this._value);

        result.sort(this._sort(index));

        this._value = this._transposeArray(result);
    }

    sortByColumn(index: number) {
        this._value.sort(this._sort(index));
    }

    transpose() {
        const transposeArray = this._transposeArray(this._value);

        const rowCount = this._rowCount;
        const columnCount = this._columnCount;

        return this._createNewArray(transposeArray, columnCount, rowCount);
    }

    override getNegative(): BaseValueObject {
        const arrayValueObject = new ArrayValueObject('{0}');
        return arrayValueObject.minus(this);
    }

    override getReciprocal(): BaseValueObject {
        const arrayValueObject = new ArrayValueObject('{1}');

        return arrayValueObject.divided(this);

        // return new NumberValueObject(1).divided(this);
    }

    override plus(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.PLUS);
    }

    override minus(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.MINUS);
    }

    override multiply(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.MULTIPLY);
    }

    override divided(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.DIVIDED);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.COMPARE, operator);
    }

    override wildcard(valueObject: BaseValueObject, operator: compareToken): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.LIKE, operator);
    }

    override concatenateFront(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.CONCATENATE_FRONT);
    }

    override concatenateBack(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.CONCATENATE_BACK);
    }

    override product(valueObject: BaseValueObject, callbackFn: callbackProductFnType): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.PRODUCT, callbackFn);
    }

    override map(callbackFn: callbackMapFnType): BaseValueObject {
        const rowCount = this._rowCount;
        const columnCount = this._columnCount;

        const result: BaseValueObject[][] = [];

        for (let r = 0; r < rowCount; r++) {
            const rowList: BaseValueObject[] = [];
            for (let c = 0; c < columnCount; c++) {
                const currentValue = this._value?.[r]?.[c];

                if (currentValue) {
                    if (currentValue.isError()) {
                        rowList[c] = currentValue as ErrorValueObject;
                    } else {
                        rowList[c] = callbackFn(currentValue, r, c);
                    }
                } else {
                    rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                }
            }
            result.push(rowList);
        }

        return this._createNewArray(result, rowCount, columnCount);
    }

    override pow(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.POW);
    }

    /**
     *
     * @param valueObject In the case of an inverse, it is certainly not an array.
     * @returns
     */
    override powInverse(valueObject: BaseValueObject): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (valueObject as BaseValueObject).pow(currentValue as BaseValueObject);
        });
    }

    override sqrt(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).sqrt();
        });
    }

    override cbrt(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).cbrt();
        });
    }

    override cos(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).cos();
        });
    }

    override acos(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).acos();
        });
    }

    override acosh(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).acosh();
        });
    }

    override sin(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).sin();
        });
    }

    override asin(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).asin();
        });
    }

    override asinh(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).asinh();
        });
    }

    override tan(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).tan();
        });
    }

    override tanh(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).tanh();
        });
    }

    override atan(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).atan();
        });
    }

    override atanh(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).atanh();
        });
    }

    override atan2(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.ATAN2);
    }

    override atan2Inverse(valueObject: BaseValueObject): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (valueObject as BaseValueObject).atan2(currentValue as BaseValueObject);
        });
    }

    override mean(): BaseValueObject {
        const sum = this.sum();

        const count = this.count();

        return sum.divided(count);
    }

    override median(): BaseValueObject {
        const allValue = this.flatten();

        const count = allValue.getColumnCount();

        if (count <= 1) {
            return allValue.get(0, 0);
        }

        allValue.sortByRow(0);

        if (count % 2 === 0) {
            const medianRight = allValue.get(0, count / 2);
            const medianLeft = allValue.get(0, count / 2 - 1);

            return medianRight.plus(medianLeft).divided(new NumberValueObject(2, true));
        }

        return allValue.get(0, (count - 1) / 2);
    }

    override log(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).log();
        });
    }

    override log10(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).log10();
        });
    }

    override exp(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).exp();
        });
    }

    override abs(): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (currentValue as BaseValueObject).abs();
        });
    }

    override round(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.ROUND);
    }

    override roundInverse(valueObject: BaseValueObject): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (valueObject as BaseValueObject).round(currentValue as BaseValueObject);
        });
    }

    override floor(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.FLOOR);
    }

    override floorInverse(valueObject: BaseValueObject): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (valueObject as BaseValueObject).floor(currentValue as BaseValueObject);
        });
    }

    override ceil(valueObject: BaseValueObject): BaseValueObject {
        return this._batchOperator(valueObject, BatchOperatorType.CEIL);
    }

    override ceilInverse(valueObject: BaseValueObject): BaseValueObject {
        return this.map((currentValue) => {
            if (currentValue.isError()) {
                return currentValue;
            }
            return (valueObject as BaseValueObject).ceil(currentValue as BaseValueObject);
        });
    }

    toValue() {
        return transformToValue(this._value);
    }

    private _sort(index: number) {
        const compare = getCompare();
        return (a: BaseValueObject[], b: BaseValueObject[]) => {
            const columnA = a[index];
            const columnB = b[index];
            if (columnA.isError() && columnA.isError()) {
                return 0;
            }
            if (columnA.isError()) {
                return 1;
            }
            if (columnB.isError()) {
                return -1;
            }
            return compare(
                (columnA as BaseValueObject).getValue() as string,
                (columnB as BaseValueObject).getValue() as string
            );
        };
    }

    private _transposeArray(array: BaseValueObject[][]) {
        // 创建一个新的二维数组作为转置后的矩阵
        const rows = array.length;
        const cols = array[0].length;
        const transposedArray: BaseValueObject[][] = [];

        // 遍历原二维数组的列
        for (let col = 0; col < cols; col++) {
            // 创建新的行
            transposedArray[col] = [] as BaseValueObject[];

            // 遍历原二维数组的行
            for (let row = 0; row < rows; row++) {
                // 将元素赋值到新的行
                transposedArray[col][row] = array[row][col];
            }
        }

        return transposedArray;
    }

    private _batchOperator(
        valueObject: BaseValueObject,
        batchOperatorType: BatchOperatorType,
        operator?: compareToken | callbackProductFnType
    ): BaseValueObject {
        const valueList: BaseValueObject[] = [];

        let rowCount = this._rowCount;
        let columnCount = this._columnCount;

        if (valueObject.isArray()) {
            const valueRowCount = (valueObject as ArrayValueObject).getRowCount();
            const valueColumnCount = (valueObject as ArrayValueObject).getColumnCount();

            rowCount = Math.max(valueRowCount, rowCount);
            columnCount = Math.max(valueColumnCount, columnCount);
            /**
             * For computational scenarios where the array contains a single value,
             * adopting calculations between the array and the value can effectively utilize an inverted index.
             */
            if (valueRowCount === 1 && valueColumnCount === 1) {
                const v = (valueObject as ArrayValueObject).getFirstCell() as BaseValueObject;
                for (let c = 0; c < columnCount; c++) {
                    valueList.push(v);
                }
            } else if (valueRowCount === 1 && this._columnCount > 1) {
                const list = (valueObject as ArrayValueObject).getArrayValue();
                for (let c = 0; c < columnCount; c++) {
                    valueList.push(list[0][c] as BaseValueObject);
                }
            } else {
                return this._batchOperatorArray(valueObject, batchOperatorType, operator);
            }
        } else {
            for (let c = 0; c < columnCount; c++) {
                valueList.push(valueObject);
            }
        }

        const result: BaseValueObject[][] = [];

        for (let c = 0; c < columnCount; c++) {
            const value = valueList[c];
            this._batchOperatorValue(value, c, result, batchOperatorType, operator);
        }

        return this._createNewArray(result, rowCount, columnCount);
    }

    private _batchOperatorValue(
        valueObject: BaseValueObject,
        column: number,
        result: BaseValueObject[][],
        batchOperatorType: BatchOperatorType,
        operator?: compareToken | callbackProductFnType
    ) {
        const rowCount = this._rowCount;

        let canUseCache = false;

        const unitId = this.getUnitId();
        const sheetId = this.getSheetId();
        const startRow = this.getCurrentRow();
        const startColumn = this.getCurrentColumn();
        /**
         * If comparison operations are conducted for a single numerical value,
         * then retrieve the judgment from the inverted index. This enhances performance.
         */
        if (batchOperatorType === BatchOperatorType.COMPARE) {
            canUseCache = CELL_INVERTED_INDEX_CACHE.canUseCache(
                unitId,
                sheetId,
                column + startColumn,
                startRow,
                startRow + rowCount - 1
            );

            if (canUseCache === true) {
                if (operator === compareToken.EQUALS) {
                    const rowPositions = CELL_INVERTED_INDEX_CACHE.getCellPositions(
                        unitId,
                        sheetId,
                        column + startColumn,
                        valueObject.getValue()
                    );

                    if (rowPositions != null) {
                        for (let r = 0; r < rowCount; r++) {
                            if (result[r] == null) {
                                result[r] = [];
                            }
                            if (rowPositions.includes(r + startRow)) {
                                result[r][column] = new BooleanValueObject(true);
                            } else {
                                result[r][column] = new BooleanValueObject(false);
                            }
                        }
                    }
                } else {
                    const rowValuePositions = CELL_INVERTED_INDEX_CACHE.getCellValuePositions(
                        unitId,
                        sheetId,
                        column + startColumn
                    );

                    if (rowValuePositions != null) {
                        rowValuePositions.forEach((rowPositions, rowValue) => {
                            let currentValue: Nullable<BaseValueObject>;
                            if (typeof rowValue === 'string') {
                                currentValue = new StringValueObject(rowValue);
                            } else if (typeof rowValue === 'number') {
                                currentValue = new NumberValueObject(rowValue);
                            } else if (typeof rowValue === 'boolean') {
                                currentValue = new BooleanValueObject(rowValue);
                            }

                            if (currentValue == null) {
                                return true;
                            }

                            const matchResult = (currentValue as BaseValueObject).compare(
                                valueObject,
                                operator as compareToken
                            );
                            if (matchResult) {
                                for (let r = 0; r < rowCount; r++) {
                                    if (result[r] == null) {
                                        result[r] = [];
                                    }
                                    if (rowPositions.includes(r + startRow)) {
                                        result[r][column] = new BooleanValueObject(true);
                                    } else {
                                        result[r][column] = new BooleanValueObject(false);
                                    }
                                }
                            }
                        });
                    }
                }

                return;
            }
        }

        CELL_INVERTED_INDEX_CACHE.setContinueBuildingCache(
            unitId,
            sheetId,
            column + startColumn,
            startRow,
            startRow + rowCount - 1
        );

        for (let r = 0; r < rowCount; r++) {
            const currentValue = this._value?.[r]?.[column];
            if (result[r] == null) {
                result[r] = [];
            }
            if (currentValue && valueObject) {
                if (currentValue.isError()) {
                    result[r][column] = currentValue as ErrorValueObject;
                } else if (valueObject.isError()) {
                    result[r][column] = ErrorValueObject.create(ErrorType.VALUE);
                } else {
                    switch (batchOperatorType) {
                        case BatchOperatorType.PLUS:
                            result[r][column] = (currentValue as BaseValueObject).plus(valueObject);
                            break;
                        case BatchOperatorType.MINUS:
                            result[r][column] = (currentValue as BaseValueObject).minus(valueObject);
                            break;
                        case BatchOperatorType.MULTIPLY:
                            result[r][column] = (currentValue as BaseValueObject).multiply(valueObject);
                            break;
                        case BatchOperatorType.DIVIDED:
                            result[r][column] = (currentValue as BaseValueObject).divided(valueObject);
                            break;
                        case BatchOperatorType.COMPARE:
                            if (!operator) {
                                result[r][column] = ErrorValueObject.create(ErrorType.VALUE);
                            } else {
                                result[r][column] = (currentValue as BaseValueObject).compare(
                                    valueObject,
                                    operator as compareToken
                                );
                            }
                            break;
                        case BatchOperatorType.CONCATENATE_FRONT:
                            result[r][column] = (currentValue as BaseValueObject).concatenateFront(valueObject);
                            break;
                        case BatchOperatorType.CONCATENATE_BACK:
                            result[r][column] = (currentValue as BaseValueObject).concatenateBack(valueObject);
                            break;
                        case BatchOperatorType.PRODUCT:
                            if (!operator) {
                                result[r][column] = ErrorValueObject.create(ErrorType.VALUE);
                            } else {
                                result[r][column] = (currentValue as BaseValueObject).product(
                                    valueObject,
                                    operator as callbackProductFnType
                                );
                            }
                            break;
                        case BatchOperatorType.LIKE:
                            if (!operator) {
                                result[r][column] = ErrorValueObject.create(ErrorType.VALUE);
                            } else {
                                result[r][column] = (currentValue as BaseValueObject).wildcard(
                                    valueObject as StringValueObject,
                                    operator as compareToken
                                );
                            }
                            break;
                        case BatchOperatorType.POW:
                            result[r][column] = (currentValue as BaseValueObject).pow(valueObject);
                            break;
                        case BatchOperatorType.ROUND:
                            result[r][column] = (currentValue as BaseValueObject).round(valueObject);
                            break;
                        case BatchOperatorType.FLOOR:
                            result[r][column] = (currentValue as BaseValueObject).floor(valueObject);
                            break;
                        case BatchOperatorType.ATAN2:
                            result[r][column] = (currentValue as BaseValueObject).atan2(valueObject);
                            break;
                        case BatchOperatorType.CEIL:
                            result[r][column] = (currentValue as BaseValueObject).ceil(valueObject);
                            break;
                    }
                }
            } else {
                result[r][column] = ErrorValueObject.create(ErrorType.NA);
            }

            /**
             * Inverted indexing enhances matching performance.
             */
            if (currentValue == null) {
                continue;
            }
            if (currentValue.isError()) {
                CELL_INVERTED_INDEX_CACHE.set(
                    unitId,
                    sheetId,
                    column + startColumn,
                    (currentValue as ErrorValueObject).getErrorType(),
                    r + startRow
                );
            } else {
                CELL_INVERTED_INDEX_CACHE.set(
                    unitId,
                    sheetId,
                    column + startColumn,
                    (currentValue as BaseValueObject).getValue(),
                    r + startRow
                );
            }
        }
    }

    private _batchOperatorArray(
        valueObject: BaseValueObject,
        batchOperatorType: BatchOperatorType,
        operator?: compareToken | callbackProductFnType
    ) {
        let rowCount = (valueObject as ArrayValueObject).getRowCount();
        let columnCount = (valueObject as ArrayValueObject).getColumnCount();

        if (rowCount < this._rowCount) {
            rowCount = this._rowCount;
        }

        if (columnCount < this._columnCount) {
            columnCount = this._columnCount;
        }

        const result: BaseValueObject[][] = [];

        const valueObjectList = (valueObject as ArrayValueObject).getArrayValue();

        const currentCalculateType = this._checkArrayCalculateType(this as ArrayValueObject);

        const opCalculateType = this._checkArrayCalculateType(valueObject as ArrayValueObject);

        for (let r = 0; r < rowCount; r++) {
            const rowList: BaseValueObject[] = [];
            for (let c = 0; c < columnCount; c++) {
                let currentValue: Nullable<BaseValueObject>;
                if (currentCalculateType === ArrayCalculateType.SINGLE) {
                    currentValue = this._value?.[0]?.[0];
                } else if (currentCalculateType === ArrayCalculateType.ROW) {
                    currentValue = this._value?.[0]?.[c];
                } else if (currentCalculateType === ArrayCalculateType.COLUMN) {
                    currentValue = this._value?.[r]?.[0];
                } else {
                    currentValue = this._value?.[r]?.[c];
                }

                let opValue: Nullable<BaseValueObject>;
                if (opCalculateType === ArrayCalculateType.SINGLE) {
                    opValue = valueObjectList?.[0]?.[0];
                } else if (opCalculateType === ArrayCalculateType.ROW) {
                    opValue = valueObjectList?.[0]?.[c];
                } else if (opCalculateType === ArrayCalculateType.COLUMN) {
                    opValue = valueObjectList?.[r]?.[0];
                } else {
                    opValue = valueObjectList?.[r]?.[c];
                }

                if (currentValue && opValue) {
                    if (currentValue.isError()) {
                        rowList[c] = currentValue as ErrorValueObject;
                    } else if (opValue.isError()) {
                        rowList[c] = opValue as ErrorValueObject;
                    } else {
                        switch (batchOperatorType) {
                            case BatchOperatorType.PLUS:
                                rowList[c] = (currentValue as BaseValueObject).plus(opValue as BaseValueObject);
                                break;
                            case BatchOperatorType.MINUS:
                                rowList[c] = (currentValue as BaseValueObject).minus(opValue as BaseValueObject);
                                break;
                            case BatchOperatorType.MULTIPLY:
                                rowList[c] = (currentValue as BaseValueObject).multiply(opValue as BaseValueObject);
                                break;
                            case BatchOperatorType.DIVIDED:
                                rowList[c] = (currentValue as BaseValueObject).divided(opValue as BaseValueObject);
                                break;
                            case BatchOperatorType.COMPARE:
                                if (!operator) {
                                    rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                                } else {
                                    rowList[c] = (currentValue as BaseValueObject).compare(
                                        opValue as BaseValueObject,
                                        operator as compareToken
                                    );
                                }
                                break;
                            case BatchOperatorType.CONCATENATE_FRONT:
                                rowList[c] = (currentValue as BaseValueObject).concatenateFront(
                                    opValue as BaseValueObject
                                );
                                break;
                            case BatchOperatorType.CONCATENATE_BACK:
                                rowList[c] = (currentValue as BaseValueObject).concatenateBack(
                                    opValue as BaseValueObject
                                );
                                break;
                            case BatchOperatorType.PRODUCT:
                                if (!operator) {
                                    rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                                } else {
                                    rowList[c] = (currentValue as BaseValueObject).product(
                                        opValue as BaseValueObject,
                                        operator as callbackProductFnType
                                    );
                                }
                                break;
                            case BatchOperatorType.LIKE:
                                if (!operator) {
                                    rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                                } else {
                                    rowList[c] = (currentValue as BaseValueObject).wildcard(
                                        opValue as StringValueObject,
                                        operator as compareToken
                                    );
                                }
                                break;
                            case BatchOperatorType.POW:
                                rowList[c] = (currentValue as BaseValueObject).pow(opValue as BaseValueObject);
                                break;
                            case BatchOperatorType.ROUND:
                                rowList[c] = (currentValue as BaseValueObject).round(opValue as BaseValueObject);
                                break;
                            case BatchOperatorType.ATAN2:
                                rowList[c] = (currentValue as BaseValueObject).atan2(opValue as BaseValueObject);
                                break;
                            case BatchOperatorType.FLOOR:
                                rowList[c] = (currentValue as BaseValueObject).floor(opValue as BaseValueObject);
                                break;
                            case BatchOperatorType.CEIL:
                                rowList[c] = (currentValue as BaseValueObject).ceil(opValue as BaseValueObject);
                                break;
                        }
                    }
                }
                // else if (currentValue) {
                //     rowList[c] = currentValue;
                // } else if (opValue) {
                //     rowList[c] = opValue;
                // }
                else {
                    rowList[c] = ErrorValueObject.create(ErrorType.NA);
                }
            }
            result.push(rowList);
        }

        return this._createNewArray(result, rowCount, columnCount);
    }

    private _checkArrayCalculateType(valueObject: ArrayValueObject) {
        if (valueObject.getRowCount() === 1 && valueObject.getColumnCount() === 1) {
            return ArrayCalculateType.SINGLE;
        }

        if (valueObject.getRowCount() === 1) {
            return ArrayCalculateType.ROW;
        }
        if (valueObject.getColumnCount() === 1) {
            return ArrayCalculateType.COLUMN;
        }

        return ArrayCalculateType.PRODUCT;
    }

    private _formatValue(rawValue: string | IArrayValueObject) {
        if (typeof rawValue !== 'string') {
            rawValue = rawValue as IArrayValueObject;

            this._rowCount = rawValue.rowCount;

            this._columnCount = rawValue.columnCount;

            this._unitId = rawValue.unitId;

            this._sheetId = rawValue.sheetId;

            this._currentRow = rawValue.row;

            this._currentColumn = rawValue.column;

            return rawValue.calculateValueList;
        }
        rawValue = rawValue.slice(1, -1) as string;
        const rowArray = rawValue.split(';');
        const rowArrayCount = rowArray.length;
        const result: BaseValueObject[][] = [];
        let maxColumnCount = 0;
        for (let r = 0; r < rowArrayCount; r++) {
            const columnRaw = rowArray[r];
            const columnArray = columnRaw.split(',');
            const columnArrayCount = columnArray.length;

            if (maxColumnCount < columnArrayCount) {
                maxColumnCount = columnArrayCount;
            }

            const row: BaseValueObject[] = [];
            for (let c = 0; c < columnArrayCount; c++) {
                const cellRaw = columnArray[c].trim();
                row.push(ValueObjectFactory.create(cellRaw));
            }
            result.push(row);
        }

        this._rowCount = rowArrayCount;

        this._columnCount = maxColumnCount;

        return result;
    }

    private _createNewArray(result: BaseValueObject[][], rowCount: number, columnCount: number) {
        const arrayValueObjectData: IArrayValueObject = {
            calculateValueList: result,
            rowCount,
            columnCount,
            unitId: this.getUnitId(),
            sheetId: this.getSheetId(),
            row: this._currentRow,
            column: this._currentColumn,
        };

        return new ArrayValueObject(arrayValueObjectData);
    }
}

export class ValueObjectFactory {
    static create(rawValue: string | number | boolean) {
        if (typeof rawValue === 'boolean') {
            return new BooleanValueObject(rawValue, true);
        }
        if (typeof rawValue === 'string') {
            const rawValueUpper = rawValue.toLocaleUpperCase();
            if (rawValueUpper === BooleanValue.TRUE || rawValueUpper === BooleanValue.FALSE) {
                return new BooleanValueObject(rawValueUpper);
            }
            if (isRealNum(rawValue)) {
                return new NumberValueObject(rawValue);
            }
            if (new RegExp($ARRAY_VALUE_REGEX, 'g').test(rawValue)) {
                return new ArrayValueObject(rawValue);
            }
            return new StringValueObject(rawValue);
        }
        if (typeof rawValue === 'number') {
            if (!Number.isFinite(rawValue)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
            return new NumberValueObject(rawValue, true);
        }
        return ErrorValueObject.create(ErrorType.NA);
    }
}
