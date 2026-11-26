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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Expand extends BaseFunction {
    override minParams = 2;

    override maxParams = 4;

    override needsReferenceObject = true;

    override calculate(source: FunctionVariantType, rowInput: FunctionVariantType, columnInput?: FunctionVariantType, padInput?: FunctionVariantType): BaseValueObject {
        const array = this._resolveReference(source);
        const rows = this._resolveReference(rowInput);
        const columns = columnInput && this._resolveReference(columnInput);
        const padWith = padInput && this._resolveReference(padInput);
        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        let _rows = rows;
        let _columns = columns ?? NumberValueObject.create(arrayColumnCount);
        const _padWith = padWith?.isNull() ? NumberValueObject.create(0) : padWith ?? ErrorValueObject.create(ErrorType.NA);

        if (rows.isNull()) {
            _rows = NumberValueObject.create(arrayRowCount);
        }

        if (_columns.isNull()) {
            _columns = NumberValueObject.create(arrayColumnCount);
        }

        const maxRowLength = Math.max(
            _rows.isArray() ? (_rows as ArrayValueObject).getRowCount() : 1,
            _columns.isArray() ? (_columns as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            _rows.isArray() ? (_rows as ArrayValueObject).getColumnCount() : 1,
            _columns.isArray() ? (_columns as ArrayValueObject).getColumnCount() : 1
        );

        const rowsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _rows, ErrorValueObject.create(ErrorType.NA));
        const columnsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _columns, ErrorValueObject.create(ErrorType.NA));

        if (maxRowLength > 1 || maxColumnLength > 1) {
            return rowsArray.mapValue((rowsObject, rowIndex, columnIndex) => {
                const columnsObject = columnsArray.get(rowIndex, columnIndex) as BaseValueObject;

                if (array.isError()) {
                    return array;
                }

                if (array.isNull()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                const { isError, errorObject } = this._checkRowsColumnsPadWith(rowsObject, columnsObject, _padWith, arrayRowCount, arrayColumnCount);

                if (isError) {
                    return errorObject as ErrorValueObject;
                }

                if (array.isArray()) {
                    return (array as ArrayValueObject).get(0, 0) as BaseValueObject;
                }

                return array;
            });
        }

        if (array.isError()) {
            return array;
        }

        if (array.isNull()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const rowsObject = _rows.isArray() ? (_rows as ArrayValueObject).get(0, 0) as BaseValueObject : _rows;
        const columnsObject = _columns.isArray() ? (_columns as ArrayValueObject).get(0, 0) as BaseValueObject : _columns;

        const { isError, errorObject, rowsValue, columnsValue, padWithObject } = this._checkRowsColumnsPadWith(rowsObject, columnsObject, _padWith, arrayRowCount, arrayColumnCount);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        return this._getResultArray(array, rowsValue as number, columnsValue as number, padWithObject as BaseValueObject, arrayRowCount, arrayColumnCount);
    }

    private _resolveReference(input: FunctionVariantType): BaseValueObject {
        if (!input.isReferenceObject()) {
            return input as BaseValueObject;
        }
        const values = (input as BaseReferenceObject).toArrayValueObject();
        if (values.getRowCount() !== 1 || values.getColumnCount() !== 1) {
            return values;
        }
        const cell = values.getFirstCell();
        return cell.isNull() ? NumberValueObject.create(0) : cell;
    }

    private _checkRowsColumnsPadWith(
        rowsObject: BaseValueObject,
        columnsObject: BaseValueObject,
        padWith: BaseValueObject,
        arrayRowCount: number,
        arrayColumnCount: number
    ) {
        if (rowsObject.isError()) {
            return {
                isError: true,
                errorObject: rowsObject as ErrorValueObject,
            };
        }

        if (columnsObject.isError()) {
            return {
                isError: true,
                errorObject: columnsObject as ErrorValueObject,
            };
        }

        const rowsValue = Math.trunc(+rowsObject.getValue());
        const columnsValue = Math.trunc(+columnsObject.getValue());

        if (!Number.isFinite(rowsValue) || !Number.isFinite(columnsValue)) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        if (rowsValue < arrayRowCount || columnsValue < arrayColumnCount) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        if (rowsValue > 1048576 || columnsValue > 16384) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(rowsValue > 1048576 ? ErrorType.NUM : ErrorType.SPILL),
            };
        }

        let _padWith = padWith;

        if (padWith.isArray()) {
            const rowCount = (padWith as ArrayValueObject).getRowCount();
            const columnCount = (padWith as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                };
            }

            _padWith = (padWith as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return {
            isError: false,
            rowsValue,
            columnsValue,
            padWithObject: _padWith,
        };
    }

    private _getResultArray(
        array: BaseValueObject,
        rows: number,
        columns: number,
        padWith: BaseValueObject,
        arrayRowCount: number,
        arrayColumnCount: number
    ): BaseValueObject {
        let resultArray: BaseValueObject[][] = [];

        if (array.isArray()) {
            resultArray = (array as ArrayValueObject).map((valueObject) => valueObject.isNull() ? NumberValueObject.create(0) : valueObject).getArrayValue() as BaseValueObject[][];
        } else {
            resultArray = [[array]];
        }

        const addRows = Math.max(0, rows - arrayRowCount);
        const addColumns = Math.max(0, columns - arrayColumnCount);

        for (let r = 0; r < addRows; r++) {
            resultArray.push(new Array(arrayColumnCount).fill(padWith));
        }

        for (let c = 0; c < addColumns; c++) {
            resultArray.forEach((row) => {
                row.push(padWith);
            });
        }

        if (rows === 1 && columns === 1) {
            return resultArray[0][0];
        }

        return ArrayValueObject.create({
            calculateValueList: resultArray,
            rowCount: resultArray.length,
            columnCount: resultArray[0].length,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    };
}
