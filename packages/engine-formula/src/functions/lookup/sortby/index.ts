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
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { createSortCompare } from '../../../engine/utils/sort-compare';
import { compareSortValues, getSortIndices } from '../../../engine/utils/sort-order';
import { calculateMaxDimensions } from '../../../engine/utils/value-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sortby extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override needsReferenceObject = true;

    override calculate(arrayInput: FunctionVariantType, ...variantInputs: FunctionVariantType[]) {
        const array = this._resolveReference(arrayInput);
        const variants = variantInputs.map((value) => this._resolveReference(value));
        // if has byArray1 no sortOrder, sortOrder default 1. but has multiple byArray, sortOrder length must be equal to byArray length
        if (variants.length === 1) {
            variants.push(NumberValueObject.create(1));
        }

        const variantsError = this._getVariantsError(array, ...variants);

        const { maxRowLength, maxColumnLength } = calculateMaxDimensions(variants);
        const lifted = variants.some((variant, index) => index % 2 === 1 && variant.isArray());

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

            const variantArray = expandArrayValueObject(maxRowLength, maxColumnLength, variant.isNull() ? NumberValueObject.create(1) : variant, ErrorValueObject.create(ErrorType.NA));

            return variantArray;
        });

        const resultArray = this._getResultArray(array, _variants, maxRowLength, maxColumnLength, lifted);

        if (maxRowLength === 1 && maxColumnLength === 1 && !lifted) {
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

    private _resolveReference(input: FunctionVariantType): BaseValueObject {
        if (!input.isReferenceObject()) return input as BaseValueObject;
        const array = (input as BaseReferenceObject).toArrayValueObject();
        if (array.getRowCount() !== 1 || array.getColumnCount() !== 1) return array;
        const value = array.getFirstCell();
        return value.isNull() ? NumberValueObject.create(0) : value;
    }

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

        const byColumn = byArray1RowCount === 1 && byArray1ColumnCount === arrayColumnCount;
        const byRow = byArray1ColumnCount === 1 && byArray1RowCount === arrayRowCount;
        if (!byColumn && !byRow) {
            return ErrorValueObject.create(ErrorType.VALUE);
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

    private _getResultArray(array: BaseValueObject, variants: BaseValueObject[], maxRowLength: number, maxColumnLength: number, lifted: boolean): Array<Array<BaseValueObject>> {
        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const byArray1RowCount = variants[0].isArray() ? (variants[0] as ArrayValueObject).getRowCount() : 1;
        const byArray1ColumnCount = variants[0].isArray() ? (variants[0] as ArrayValueObject).getColumnCount() : 1;

        const resultArray: Array<Array<BaseValueObject>> = [];
        let consumed = false;

        for (let r = 0; r < maxRowLength; r++) {
            resultArray[r] = [] as BaseValueObject[];

            for (let c = 0; c < maxColumnLength; c++) {
                // Excel retains the shapes of multiple key arrays after moving their cells.
                if (consumed && variants.length > 2 && (byArray1RowCount > 1 || byArray1ColumnCount > 1)) {
                    resultArray[r].push(ErrorValueObject.create(ErrorType.VALUE));
                    continue;
                }
                const { isError, errorObject, byArrays, sortOrders } = this._getByArraysAndSortOrders(variants, r, c, byArray1ColumnCount, !consumed);

                if (isError) {
                    resultArray[r].push(errorObject as ErrorValueObject);
                    continue;
                }

                if (consumed) {
                    resultArray[r].push(NullValueObject.create());
                    continue;
                }

                if (!array.isArray() || (arrayRowCount === 1 && arrayColumnCount === 1)) {
                    resultArray[r].push(lifted && array.isArray() ? (array as ArrayValueObject).get(0, 0) as BaseValueObject : array);
                    consumed = true;
                    continue;
                }

                let arrayValue = array.getArrayValue();
                const simple = byArrays.every((values) => values[0]?.isNumber()
                    ? values.every((value) => value?.isNumber())
                    : values.every((value) => value?.isString() && !/[^a-z0-9]/i.test(String(value.getValue()))));

                if (!(byArray1RowCount === 1 && byArray1ColumnCount === 1)) {
                    if (byArray1ColumnCount === 1 && arrayColumnCount === 1) {
                        // A single data column has no wide payload to avoid transposing.
                        arrayValue = this._transposeArray(arrayValue);
                        arrayValue = arrayValue.concat(byArrays);
                        arrayValue = this._transposeArray(arrayValue);
                        const compare = this._sort(arrayColumnCount, sortOrders as Array<1 | -1>);
                        arrayValue = simple ? arrayValue.sort(compare) : getSortIndices(arrayValue.length, (left, right) => compare(arrayValue[left], arrayValue[right])).map((index) => arrayValue[index]);
                        arrayValue = arrayValue.map((row) => row.slice(0, arrayColumnCount));
                    } else {
                        const indices = this._sortIndices(byArrays, sortOrders as Array<1 | -1>, simple);
                        if (byArray1RowCount === 1) {
                            arrayValue = arrayValue.map((row) => {
                                const result: Nullable<BaseValueObject>[] = [];
                                for (let i = 0; i < indices.length; i++) {
                                    result[i] = row[indices[i]];
                                }
                                return result;
                            });
                        } else if (byArray1ColumnCount === 1) {
                            arrayValue = indices.map((index) => {
                                const row = arrayValue[index].slice(0, arrayColumnCount);
                                if (row.length < arrayColumnCount) {
                                    row.length = arrayColumnCount;
                                }
                                return row;
                            });
                        }
                    }
                }

                const result = ArrayValueObject.create({
                    calculateValueList: arrayValue,
                    rowCount: arrayValue.length,
                    columnCount: arrayColumnCount,
                    unitId: this.unitId as string,
                    sheetId: this.subUnitId as string,
                    row: this.row,
                    column: this.column,
                });

                consumed = true;
                if (lifted) {
                    resultArray[r].push(result.get(0, 0) as BaseValueObject);
                    continue;
                }

                resultArray[r].push(result);
            }
        }

        return resultArray;
    }

    private _getByArraysAndSortOrders(variants: BaseValueObject[], r: number, c: number, byArray1ColumnCount: number, readArrays: boolean) {
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

            if (!readArrays) continue;

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
        const compare = createSortCompare();

        return (a: Nullable<BaseValueObject>[], b: Nullable<BaseValueObject>[]) => {
            let columnA = a[sortIndex] as BaseValueObject;
            let columnB = b[sortIndex] as BaseValueObject;
            let result = compareSortValues(columnA, columnB, sortOrders[0], compare);

            if (result === 0 && sortOrders.length > 1) {
                for (let i = 1; i < sortOrders.length; i++) {
                    columnA = a[sortIndex + i] as BaseValueObject;
                    columnB = b[sortIndex + i] as BaseValueObject;
                    result = compareSortValues(columnA, columnB, sortOrders[i], compare);

                    if (result !== 0) {
                        return result;
                    }
                }
            }

            return result;
        };
    }

    private _sortIndices(byArrays: Nullable<BaseValueObject>[][], sortOrders: Array<1 | -1>, simple: boolean) {
        const compare = createSortCompare();
        const primary = byArrays[0];
        const primaryOrder = sortOrders[0];
        const compareIndices = (a: number, b: number) => {
            let result = compareSortValues(primary[a], primary[b], primaryOrder, compare);
            if (result === 0) {
                for (let i = 1; i < sortOrders.length; i++) {
                    result = compareSortValues(byArrays[i][a], byArrays[i][b], sortOrders[i], compare);
                    if (result !== 0) {
                        return result;
                    }
                }
            }
            return result;
        };
        return simple
            ? Array.from({ length: primary.length }, (_, index) => index).sort(compareIndices)
            : getSortIndices(primary.length, compareIndices);
    }
}
