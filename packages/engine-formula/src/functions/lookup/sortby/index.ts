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

import type { Nullable } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { getCompare } from '../../../engine/utils/compare';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';

import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';

import { BaseFunction } from '../../base-function';
import { calculateMaxDimensions } from '../../../engine/utils/value-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

export class Sortby extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override calculate(array: BaseValueObject, ...variants: BaseValueObject[]) {
        // if has byArray1 no sortOrder, sortOrder default 1. but has multiple byArray, sortOrder length must be equal to byArray length
        if (variants.length === 1) {
            variants.push(NumberValueObject.create(1));
        }

        const variantsError = this._getVariantsError(array, ...variants);

        const { maxRowLength, maxColumnLength } = calculateMaxDimensions(variants);

        if (variantsError.isError()) {
            const expandArray = expandArrayValueObject(maxRowLength, maxColumnLength, variantsError);

            if (maxRowLength === 1 && maxColumnLength === 1) {
                return (expandArray as ArrayValueObject).get(0, 0) as ErrorValueObject;
            }

            return expandArray;
        }

        const _variants = variants.map((variant, index) => {
            if (index % 2 === 0) {
                return variant;
            }

            const variantArray = expandArrayValueObject(maxRowLength, maxColumnLength, variant, ErrorValueObject.create(ErrorType.NA));

            return variantArray;
        });

        const resultArray = this._getResultArray(array, _variants, maxRowLength, maxColumnLength);

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return resultArray[0][0] as ArrayValueObject;
        }

        return ArrayValueObject.create({
            calculateValueList: resultArray,
            rowCount: resultArray.length,
            columnCount: resultArray[0].length || 0,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }

    // eslint-disable-next-line complexity
    private _getVariantsError(array: BaseValueObject, ...variants: BaseValueObject[]): ErrorValueObject | BooleanValueObject {
        if (array.isError()) {
            return array as ErrorValueObject;
        }

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isError()) {
                return variant as ErrorValueObject;
            }
        }

        // byArray and sortOrder must be paired
        if (variants.length < 2 || variants.length % 2 !== 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const byArray1RowCount = variants[0].isArray() ? (variants[0] as ArrayValueObject).getRowCount() : 1;
        const byArray1ColumnCount = variants[0].isArray() ? (variants[0] as ArrayValueObject).getColumnCount() : 1;

        if (byArray1RowCount > 1 || byArray1ColumnCount > 1) {
            if (byArray1RowCount > 1 && byArray1ColumnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (byArray1RowCount === 1 && byArray1ColumnCount !== arrayColumnCount) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (byArray1ColumnCount === 1 && byArray1RowCount !== arrayRowCount) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
        }

        for (let i = 2; i < variants.length; i++) {
            if (i % 2 === 1) {
                continue;
            }

            const byArrayRowCount = variants[i].isArray() ? (variants[i] as ArrayValueObject).getRowCount() : 1;
            const byArrayColumnCount = variants[i].isArray() ? (variants[i] as ArrayValueObject).getColumnCount() : 1;

            if (byArrayRowCount !== byArray1RowCount || byArrayColumnCount !== byArray1ColumnCount) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
        }

        return BooleanValueObject.create(true);
    }

    private _getResultArray(array: BaseValueObject, variants: BaseValueObject[], maxRowLength: number, maxColumnLength: number): Array<Array<BaseValueObject>> {
        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const byArray1RowCount = variants[0].isArray() ? (variants[0] as ArrayValueObject).getRowCount() : 1;
        const byArray1ColumnCount = variants[0].isArray() ? (variants[0] as ArrayValueObject).getColumnCount() : 1;

        const resultArray: Array<Array<BaseValueObject>> = [];

        for (let r = 0; r < maxRowLength; r++) {
            resultArray[r] = [] as BaseValueObject[];

            for (let c = 0; c < maxColumnLength; c++) {
                const { isError, errorObject, byArrays, sortOrders } = this._getByArraysAndSortOrders(variants, r, c, byArray1ColumnCount);

                if (isError) {
                    resultArray[r].push(errorObject as ErrorValueObject);
                    continue;
                }

                if (!array.isArray() || (arrayRowCount === 1 && arrayColumnCount === 1)) {
                    resultArray[r].push(array);
                    continue;
                }

                let arrayValue = array.getArrayValue();

                if (!(byArray1RowCount === 1 && byArray1ColumnCount === 1)) {
                    if (byArray1RowCount === 1) {
                        arrayValue = arrayValue.concat(byArrays);
                        arrayValue = this._transposeArray(arrayValue);
                        arrayValue.sort(this._sort(arrayRowCount, sortOrders as Array<1 | -1>));
                        arrayValue = this._transposeArray(arrayValue).slice(0, arrayRowCount);
                    } else if (byArray1ColumnCount === 1) {
                        arrayValue = this._transposeArray(arrayValue);
                        arrayValue = arrayValue.concat(byArrays);
                        arrayValue = this._transposeArray(arrayValue);
                        arrayValue.sort(this._sort(arrayColumnCount, sortOrders as Array<1 | -1>));
                        arrayValue = arrayValue.map((row) => row.slice(0, arrayColumnCount));
                    }
                }

                const result = ArrayValueObject.create({
                    calculateValueList: arrayValue,
                    rowCount: arrayValue.length,
                    columnCount: arrayValue[0].length || 0,
                    unitId: this.unitId as string,
                    sheetId: this.subUnitId as string,
                    row: this.row,
                    column: this.column,
                });

                if (maxRowLength > 1 || maxColumnLength > 1) {
                    resultArray[r].push(result.get(0, 0) as BaseValueObject);
                    continue;
                }

                resultArray[r].push(result);
            }
        }

        return resultArray;
    }

    private _getByArraysAndSortOrders(variants: BaseValueObject[], r: number, c: number, byArray1ColumnCount: number) {
        const byArrays = [];
        const sortOrders = [];

        let isError: boolean = false;
        let errorObject: ErrorValueObject | null = null;

        for (let i = 0; i < variants.length; i++) {
            if (i % 2 === 1) {
                continue;
            }

            const byArray = variants[i];

            let sortOrder = (variants[i + 1] as ArrayValueObject).get(r, c) as BaseValueObject;

            if (sortOrder.isString()) {
                sortOrder = sortOrder.convertToNumberObjectValue();
            }

            if (sortOrder.isError()) {
                isError = true;
                errorObject = sortOrder as ErrorValueObject;
                break;
            }

            const sortOrderValue = Math.floor(+sortOrder.getValue());

            if (sortOrderValue !== -1 && sortOrderValue !== 1) {
                isError = true;
                errorObject = ErrorValueObject.create(ErrorType.VALUE);
                break;
            }

            sortOrders.push(sortOrderValue);

            if (byArray.isArray()) {
                let byArrayValue = byArray.getArrayValue();

                if (byArray1ColumnCount === 1) {
                    byArrayValue = this._transposeArray(byArrayValue);
                }

                byArrays.push(byArrayValue[0]);
            } else {
                byArrays.push([byArray]);
            }
        }

        return {
            isError,
            errorObject,
            byArrays,
            sortOrders,
        };
    }

    private _transposeArray(array: Nullable<BaseValueObject>[][]) {
        // Create a new 2D array as the transposed matrix
        const rows = array.length;
        const cols = array[0].length;
        const transposedArray: Nullable<BaseValueObject>[][] = [];

        // Traverse the columns of the original two-dimensional array
        for (let col = 0; col < cols; col++) {
            // Create new row
            transposedArray[col] = [] as BaseValueObject[];

            // Traverse the rows of the original two-dimensional array
            for (let row = 0; row < rows; row++) {
                // Assign elements to new rows
                transposedArray[col][row] = array[row][col];
            }
        }

        return transposedArray;
    }

    private _sort(sortIndex: number, sortOrders: Array<1 | -1>) {
        const compare = getCompare();

        return (a: Nullable<BaseValueObject>[], b: Nullable<BaseValueObject>[]) => {
            let columnA = a[sortIndex] as BaseValueObject;
            let columnB = b[sortIndex] as BaseValueObject;
            let result = this._compare(columnA, columnB, sortOrders[0], compare);

            if (result === 0 && sortOrders.length > 1) {
                for (let i = 1; i < sortOrders.length; i++) {
                    columnA = a[sortIndex + i] as BaseValueObject;
                    columnB = b[sortIndex + i] as BaseValueObject;
                    result = this._compare(columnA, columnB, sortOrders[i], compare);

                    if (result !== 0) {
                        return result;
                    }
                }
            }

            return result;
        };
    }

    private _compare(columnA: BaseValueObject, columnB: BaseValueObject, sortOrder: 1 | -1, compare: Function): number {
        if (sortOrder === 1) {
            return this._asc(columnA, columnB, compare);
        } else {
            return this._desc(columnA, columnB, compare);
        }
    }

    private _asc(columnA: BaseValueObject, columnB: BaseValueObject, compare: Function): number {
        if (columnA == null || columnA.isNull()) {
            return 1;
        }

        if (columnB == null || columnB.isNull()) {
            return -1;
        }

        if (columnA.isError() && columnB.isError()) {
            return 0;
        }

        if (columnA.isError()) {
            return 1;
        }

        if (columnB.isError()) {
            return -1;
        }

        const columnAValue = (columnA as BaseValueObject).getValue();
        const columnBValue = (columnB as BaseValueObject).getValue();

        if (columnA.isBoolean() && columnAValue === true) {
            return 1;
        }

        if (columnB.isBoolean() && columnBValue === true) {
            return -1;
        }

        if (columnA.isBoolean() && columnAValue === false) {
            return 1;
        }

        if (columnB.isBoolean() && columnBValue === false) {
            return -1;
        }

        if (columnA.isNumber() && columnB.isNumber()) {
            return (+columnAValue) - (+columnBValue);
        }

        return compare(
            columnAValue as string,
            columnBValue as string
        );
    }

    private _desc(columnA: BaseValueObject, columnB: BaseValueObject, compare: Function): number {
        if (columnA == null || columnA.isNull()) {
            return 1;
        }

        if (columnB == null || columnB.isNull()) {
            return -1;
        }

        if (columnA.isError() && columnB.isError()) {
            return 0;
        }

        if (columnA.isError()) {
            return -1;
        }

        if (columnB.isError()) {
            return 1;
        }

        const columnAValue = (columnA as BaseValueObject).getValue();
        const columnBValue = (columnB as BaseValueObject).getValue();

        if (columnA.isBoolean() && columnAValue === true) {
            return -1;
        }

        if (columnB.isBoolean() && columnBValue === true) {
            return 1;
        }

        if (columnA.isBoolean() && columnAValue === false) {
            return -1;
        }

        if (columnB.isBoolean() && columnBValue === false) {
            return 1;
        }

        if (columnA.isNumber() && columnB.isNumber()) {
            return (+columnBValue) - (+columnAValue);
        }

        return compare(
            columnBValue as string,
            columnAValue as string
        );
    }
}
