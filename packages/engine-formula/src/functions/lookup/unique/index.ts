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

import { isRealNum, type Nullable } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';

import { BaseFunction } from '../../base-function';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

interface IObjectMapType {
    r: number;
    valueObject: BaseValueObject;
}

export class Unique extends BaseFunction {
    override minParams = 1;

    override maxParams = 3;

    override calculate(array: BaseValueObject, byCol?: BaseValueObject, exactlyOnce?: BaseValueObject) {
        const _byCol = byCol ?? BooleanValueObject.create(false);
        const _exactlyOnce = exactlyOnce ?? BooleanValueObject.create(false);

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const maxRowLength = Math.max(
            _byCol.isArray() ? (_byCol as ArrayValueObject).getRowCount() : 1,
            _exactlyOnce.isArray() ? (_exactlyOnce as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            _byCol.isArray() ? (_byCol as ArrayValueObject).getColumnCount() : 1,
            _exactlyOnce.isArray() ? (_exactlyOnce as ArrayValueObject).getColumnCount() : 1
        );

        const byColArray = expandArrayValueObject(maxRowLength, maxColumnLength, _byCol, ErrorValueObject.create(ErrorType.NA));
        const exactlyOnceArray = expandArrayValueObject(maxRowLength, maxColumnLength, _exactlyOnce, ErrorValueObject.create(ErrorType.NA));

        const resultArray = byColArray.map((byColObject, rowIndex, columnIndex) => {
            let _byColObject = byColObject;
            let exactlyOnceObject = exactlyOnceArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (array.isError()) {
                return array;
            }

            if (_byColObject.isString()) {
                _byColObject = _byColObject.convertToNumberObjectValue();
            }

            if (_byColObject.isError()) {
                return _byColObject;
            }

            if (exactlyOnceObject.isString()) {
                exactlyOnceObject = exactlyOnceObject.convertToNumberObjectValue();
            }

            if (exactlyOnceObject.isError()) {
                return exactlyOnceObject;
            }

            const byColValue = +_byColObject.getValue();
            const exactlyOnceValue = +exactlyOnceObject.getValue();

            let result: Nullable<BaseValueObject>;

            if ((!byColValue && arrayRowCount === 1) || (byColValue && arrayColumnCount === 1)) {
                result = array;
            } else {
                result = this._getResult(array, byColValue, exactlyOnceValue);
            }

            if ((maxRowLength > 1 || maxColumnLength > 1) && result?.isArray()) {
                return (result as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return result;
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _getResult(array: BaseValueObject, byColValue: number, exactlyOnceValue: number) {
        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        let arrayValue = array.getArrayValue();
        let arrayRows = arrayRowCount;
        let arrayColumns = arrayColumnCount;

        if (byColValue) {
            arrayValue = this._transposeArray(arrayValue);
            arrayRows = arrayColumnCount;
            arrayColumns = arrayRowCount;
        }

        const repeatRows = this._getRepeatRows(arrayValue as Array<Array<BaseValueObject>>, arrayRows, arrayColumns);

        if (repeatRows.length > 0) {
            const spliceRows: number[] = [];

            repeatRows.forEach((rows) => {
                rows.forEach((r, index) => {
                    if (index !== 0 || exactlyOnceValue) {
                        spliceRows.push(r);
                    }
                });
            });

            arrayValue = arrayValue.filter((row, rowIndex) => !spliceRows.includes(rowIndex));
        }

        if (arrayValue.length === 0) {
            return ErrorValueObject.create(ErrorType.CALC);
        }

        if (byColValue) {
            arrayValue = this._transposeArray(arrayValue);
        }

        return ArrayValueObject.create({
            calculateValueList: arrayValue,
            rowCount: arrayValue.length,
            columnCount: arrayValue[0].length || 0,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }

    private _getRepeatRows(arrayValue: Array<Array<BaseValueObject>>, arrayRows: number, arrayColumns: number): Array<Array<number>> {
        let repeatRows: Array<Array<number>> = [];

        for (let c = 0; c < arrayColumns; c++) {
            if (c === 0) {
                const objects: Array<IObjectMapType> = new Array(arrayRows).fill(null).map((item, index) => {
                    return {
                        r: index,
                        valueObject: arrayValue[index][c] as BaseValueObject,
                    };
                });

                repeatRows = this._getRepeatRowsByObjects(objects);
            } else {
                if (repeatRows.length === 0) {
                    break;
                }

                let newRepeatRows: Array<Array<number>> = [];

                repeatRows.forEach((item) => {
                    const objects = item.map((r) => {
                        return {
                            r,
                            valueObject: arrayValue[r][c] as BaseValueObject,
                        };
                    });

                    const _repeatRows = this._getRepeatRowsByObjects(objects);

                    newRepeatRows = newRepeatRows.concat(_repeatRows);
                });

                repeatRows = newRepeatRows;
            }
        }

        return repeatRows;
    }

    private _getRepeatRowsByObjects(objects: Array<IObjectMapType>): Array<Array<number>> {
        const valueMap = new Map();

        objects.forEach((item) => {
            const r = item.r;
            const valueObject = item.valueObject;

            let value: Nullable<string | number | boolean> = valueObject.getValue();

            if (valueObject.isNull()) {
                value = null;
            } else if (valueObject.isString() && isRealNum(value as number)) {
                value = +value;
            }

            if (!valueMap.has(value)) {
                valueMap.set(value, [r]);
            } else {
                const valueMapItem = valueMap.get(value);
                valueMapItem.push(r);
                valueMap.set(value, valueMapItem);
            }
        });

        return Array.from(valueMap.values()).filter((item) => item.length > 1);
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
}
