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

import type { Nullable } from '@univerjs/core';

import { BooleanValue } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { CELL_INVERTED_INDEX_CACHE } from '../../basics/inverted-index-cache';
import { $ARRAY_VALUE_REGEX } from '../../basics/regex';
import { compareToken } from '../../basics/token';
import { ErrorValueObject } from '../other-object/error-value-object';
import type {
    CalculateValueType,
    callbackMapFnType,
    callbackProductFnType,
    IArrayValueObject,
} from './base-value-object';
import { BaseValueObject } from './base-value-object';
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

export class ArrayValueObject extends BaseValueObject {
    private _value: CalculateValueType[][] = [];

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

    override setArrayValue(value: CalculateValueType[][]) {
        this._value = value;
    }

    override isArray() {
        return true;
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

    iterator(callback: (valueObject: CalculateValueType, rowIndex: number, columnIndex: number) => Nullable<boolean>) {
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

    override plus(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.PLUS);
    }

    override minus(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.MINUS);
    }

    override multiply(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.MULTIPLY);
    }

    override divided(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.DIVIDED);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.COMPARE, operator);
    }

    override concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.CONCATENATE_FRONT);
    }

    override concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.CONCATENATE_BACK);
    }

    override product(valueObject: BaseValueObject, callbackFn: callbackProductFnType): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.PRODUCT, callbackFn);
    }

    override map(callbackFn: callbackMapFnType): CalculateValueType {
        const rowCount = this._rowCount;
        const columnCount = this._columnCount;

        const result: CalculateValueType[][] = [];

        for (let r = 0; r < rowCount; r++) {
            const rowList: CalculateValueType[] = [];
            for (let c = 0; c < columnCount; c++) {
                const currentValue = this._value?.[r]?.[c];

                if (currentValue) {
                    if (currentValue.isErrorObject()) {
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

        this.setArrayValue(result);
        this.setRowCount(rowCount);
        this.setColumnCount(columnCount);

        return this;
    }

    private _batchOperator(
        valueObject: BaseValueObject,
        batchOperatorType: BatchOperatorType,
        operator?: compareToken | callbackProductFnType
    ): CalculateValueType {
        if (valueObject.isArray()) {
            this._batchOperatorArray(valueObject, batchOperatorType, operator);

            return this;
        }

        const rowCount = this._rowCount;
        const columnCount = this._columnCount;

        const result: CalculateValueType[][] = [];
        const cacheColumns = [];
        const unitId = this.getUnitId();
        const sheetId = this.getSheetId();
        const startRow = this.getCurrentRow();
        const startColumn = this.getCurrentColumn();
        /**
         * If comparison operations are conducted for a single numerical value,
         * then retrieve the judgment from the inverted index. This enhances performance.
         */
        if (batchOperatorType === BatchOperatorType.COMPARE && operator === compareToken.EQUALS) {
            for (let c = 0; c < columnCount; c++) {
                const canUseCache = CELL_INVERTED_INDEX_CACHE.canUseCache(
                    unitId,
                    sheetId,
                    c + startColumn,
                    startRow,
                    startRow + rowCount - 1
                );
                cacheColumns.push(canUseCache);
                if (canUseCache === false) {
                    continue;
                }

                const rows = CELL_INVERTED_INDEX_CACHE.getCellPositions(
                    unitId,
                    sheetId,
                    c + startColumn,
                    operator as compareToken,
                    valueObject.getValue()
                );

                if (rows == null) {
                    continue;
                }

                for (let r = 0; r < rowCount; r++) {
                    if (result[r] == null) {
                        result[r] = [];
                    }
                    if (rows.includes(r + startRow)) {
                        result[r][c] = new BooleanValueObject(true);
                    } else {
                        result[r][c] = new BooleanValueObject(false);
                    }
                }
            }
        }

        for (let c = 0; c < columnCount; c++) {
            if (batchOperatorType === BatchOperatorType.COMPARE && operator === compareToken.EQUALS) {
                CELL_INVERTED_INDEX_CACHE.setContinueBuildingCache(
                    unitId,
                    sheetId,
                    c + startColumn,
                    startRow,
                    startRow + rowCount - 1
                );

                if (cacheColumns[c] === true) {
                    continue;
                }
            }

            for (let r = 0; r < rowCount; r++) {
                const currentValue = this._value?.[r]?.[c];
                if (result[r] == null) {
                    result[r] = [];
                }
                if (currentValue && valueObject) {
                    if (currentValue.isErrorObject()) {
                        result[r][c] = currentValue as ErrorValueObject;
                    } else if (valueObject.isErrorObject()) {
                        result[r][c] = ErrorValueObject.create(ErrorType.VALUE);
                    } else {
                        switch (batchOperatorType) {
                            case BatchOperatorType.PLUS:
                                result[r][c] = (currentValue as BaseValueObject).plus(valueObject);
                                break;
                            case BatchOperatorType.MINUS:
                                result[r][c] = (currentValue as BaseValueObject).minus(valueObject);
                                break;
                            case BatchOperatorType.MULTIPLY:
                                result[r][c] = (currentValue as BaseValueObject).multiply(valueObject);
                                break;
                            case BatchOperatorType.DIVIDED:
                                result[r][c] = (currentValue as BaseValueObject).divided(valueObject);
                                break;
                            case BatchOperatorType.COMPARE:
                                if (!operator) {
                                    result[r][c] = ErrorValueObject.create(ErrorType.VALUE);
                                } else {
                                    result[r][c] = (currentValue as BaseValueObject).compare(
                                        valueObject,
                                        operator as compareToken
                                    );

                                    /**
                                     * Inverted indexing enhances matching performance.
                                     */
                                    if (operator === compareToken.EQUALS) {
                                        CELL_INVERTED_INDEX_CACHE.set(
                                            unitId,
                                            sheetId,
                                            c + startColumn,
                                            operator as compareToken,
                                            (currentValue as BaseValueObject).getValue(),
                                            r + startRow
                                        );
                                    }
                                }
                                break;
                            case BatchOperatorType.CONCATENATE_FRONT:
                                result[r][c] = (currentValue as BaseValueObject).concatenateFront(valueObject);
                                break;
                            case BatchOperatorType.CONCATENATE_BACK:
                                result[r][c] = (currentValue as BaseValueObject).concatenateBack(valueObject);
                                break;
                            case BatchOperatorType.PRODUCT:
                                if (!operator) {
                                    result[r][c] = ErrorValueObject.create(ErrorType.VALUE);
                                } else {
                                    result[r][c] = (currentValue as BaseValueObject).product(
                                        valueObject,
                                        operator as callbackProductFnType
                                    );
                                }

                                break;
                        }
                    }
                } else {
                    result[r][c] = ErrorValueObject.create(ErrorType.VALUE);
                }
            }
        }

        this.setArrayValue(result);
        this.setRowCount(rowCount);
        this.setColumnCount(columnCount);

        return this;
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

        const result: CalculateValueType[][] = [];

        const valueObjectList = (valueObject as ArrayValueObject).getArrayValue();

        const arrayCalculateType = this._checkArrayCalculateType(valueObject as ArrayValueObject);

        for (let r = 0; r < rowCount; r++) {
            const rowList: CalculateValueType[] = [];
            for (let c = 0; c < columnCount; c++) {
                const currentValue = this._value?.[r]?.[c];
                let opValue: Nullable<CalculateValueType>;
                if (arrayCalculateType === ArrayCalculateType.SINGLE) {
                    opValue = valueObjectList?.[0]?.[0];
                } else if (arrayCalculateType === ArrayCalculateType.ROW) {
                    opValue = valueObjectList?.[0]?.[c];
                } else if (arrayCalculateType === ArrayCalculateType.COLUMN) {
                    opValue = valueObjectList?.[r]?.[0];
                } else {
                    opValue = valueObjectList?.[r]?.[c];
                }

                if (currentValue && opValue) {
                    if (currentValue.isErrorObject()) {
                        rowList[c] = currentValue as ErrorValueObject;
                    } else if (opValue.isErrorObject()) {
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
                        }
                    }
                } else if (currentValue) {
                    rowList[c] = currentValue;
                } else if (opValue) {
                    rowList[c] = opValue;
                } else {
                    rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                }
            }
            result.push(rowList);
        }

        this.setArrayValue(result);
        this.setRowCount(rowCount);
        this.setColumnCount(columnCount);

        return this;
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
        const result: CalculateValueType[][] = [];
        let maxColumnCount = 0;
        for (let r = 0; r < rowArrayCount; r++) {
            const columnRaw = rowArray[r];
            const columnArray = columnRaw.split(',');
            const columnArrayCount = columnArray.length;

            if (maxColumnCount < columnArrayCount) {
                maxColumnCount = columnArrayCount;
            }

            const row: CalculateValueType[] = [];
            for (let c = 0; c < columnArrayCount; c++) {
                const cellRaw = columnArray[c];
                row.push(ValueObjectFactory.create(cellRaw));
            }
            result.push(row);
        }

        this._rowCount = rowArrayCount;

        this._columnCount = maxColumnCount;

        return result;
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
            if (!isNaN(Number(rawValue))) {
                return new NumberValueObject(rawValue);
            }
            if (new RegExp($ARRAY_VALUE_REGEX, 'g').test(rawValue)) {
                return new ArrayValueObject(rawValue);
            }
            return new StringValueObject(rawValue);
        }
        if (typeof rawValue === 'number') {
            return new NumberValueObject(rawValue, true);
        }
        return ErrorValueObject.create(ErrorType.NA);
    }
}
