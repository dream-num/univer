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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Take extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(input: FunctionVariantType, rowCount: FunctionVariantType, columnCount?: FunctionVariantType): FunctionVariantType {
        const reference = input.isReferenceObject() ? input as BaseReferenceObject : undefined;
        const array = reference?.toArrayValueObject() ?? input as BaseValueObject;
        const rows = rowCount.isReferenceObject() ? (rowCount as BaseReferenceObject).toArrayValueObject() : rowCount as BaseValueObject;
        const columns = columnCount?.isReferenceObject() ? (columnCount as BaseReferenceObject).toArrayValueObject() : columnCount as BaseValueObject | undefined;
        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        let _rows = rows;
        let _columns = columns ?? NumberValueObject.create(arrayColumnCount);

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

                const { isError, errorObject } = this._checkRowsColumns(rowsObject, columnsObject, arrayRowCount, arrayColumnCount);

                if (isError) {
                    return errorObject as ErrorValueObject;
                }

                if (array.isArray()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
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

        const { isError, errorObject, rowsValue, columnsValue } = this._checkRowsColumns(rowsObject, columnsObject, arrayRowCount, arrayColumnCount);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const takeRows = rowsValue as number;
        const takeColumns = columnsValue as number;
        return reference
            ? this._takeReference(reference, takeRows, takeColumns, arrayRowCount, arrayColumnCount)
            : this._getResultArray(array, takeRows, takeColumns, arrayRowCount, arrayColumnCount);
    }

    private _takeReference(reference: BaseReferenceObject, rows: number, columns: number, rowCount: number, columnCount: number): BaseReferenceObject | ErrorValueObject {
        const range = reference.getRangePosition();
        const takenRows = Math.min(Math.abs(rows), rowCount);
        const takenColumns = Math.min(Math.abs(columns), columnCount);
        const startRow = range.startRow + (rows < 0 ? rowCount - takenRows : 0);
        const startColumn = range.startColumn + (columns < 0 ? columnCount - takenColumns : 0);
        return this.createReferenceObject(reference, {
            startRow,
            startColumn,
            endRow: startRow + takenRows - 1,
            endColumn: startColumn + takenColumns - 1,
        });
    }

    private _checkRowsColumns(rowsObject: BaseValueObject, columnsObject: BaseValueObject, arrayRowCount: number, arrayColumnCount: number) {
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

        let rowsValue = Math.trunc(+rowsObject.getValue());
        let columnsValue = Math.trunc(+columnsObject.getValue());

        if (Number.isNaN(rowsValue) || Number.isNaN(columnsValue)) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        if (Math.abs(rowsValue) === 0 || Math.abs(columnsValue) === 0) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.CALC),
            };
        }

        if (rowsValue > arrayRowCount) {
            rowsValue = arrayRowCount;
        }

        if (columnsValue > arrayColumnCount) {
            columnsValue = arrayColumnCount;
        }

        return {
            isError: false,
            rowsValue,
            columnsValue,
        };
    }

    private _getResultArray(array: BaseValueObject, rows: number, columns: number, arrayRowCount: number, arrayColumnCount: number): BaseValueObject {
        if (!array.isArray()) {
            return expandArrayValueObject(1, 1, array);
        }

        const rowParam = rows >= 0 ? [0, rows] : [arrayRowCount + rows, arrayRowCount];
        const columnParam = columns >= 0 ? [0, columns] : [arrayColumnCount + columns, arrayColumnCount];

        let resultArray: ArrayValueObject;

        if ((rows === arrayRowCount && columns === arrayColumnCount)) {
            resultArray = array as ArrayValueObject;
        } else if (rows === arrayRowCount) {
            resultArray = (array as ArrayValueObject).slice(undefined, columnParam) as ArrayValueObject;
        } else if (columns === arrayColumnCount) {
            resultArray = (array as ArrayValueObject).slice(rowParam, undefined) as ArrayValueObject;
        } else {
            resultArray = (array as ArrayValueObject).slice(rowParam, columnParam) as ArrayValueObject;
        }

        resultArray = resultArray.map((valueObject) => valueObject.isNull() ? NumberValueObject.create(0) : valueObject) as ArrayValueObject;

        return resultArray;
    };
}
