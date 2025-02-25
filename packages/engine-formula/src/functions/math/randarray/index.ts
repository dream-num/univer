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

import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Randarray extends BaseFunction {
    override minParams = 0;

    override maxParams = 5;

    override needsSheetRowColumnCount = true;

    override calculate(rows?: BaseValueObject, columns?: BaseValueObject, min?: BaseValueObject, max?: BaseValueObject, wholeNumber?: BaseValueObject) {
        if (rows?.isError()) {
            return rows;
        }

        if (columns?.isError()) {
            return columns;
        }

        if (min?.isError()) {
            return min;
        }

        if (max?.isError()) {
            return max;
        }

        if (wholeNumber?.isError()) {
            return wholeNumber;
        }

        const _rows = rows ?? NumberValueObject.create(1);
        const _columns = columns ?? NumberValueObject.create(1);
        const _min = min ?? NumberValueObject.create(0);
        const _max = max ?? NumberValueObject.create(1);
        const _wholeNumber = wholeNumber ?? NumberValueObject.create(0);

        return this._calculateResult(_rows, _columns, _min, _max, _wholeNumber);
    }

    private _calculateResult(rows: BaseValueObject, columns: BaseValueObject, min: BaseValueObject, max: BaseValueObject, wholeNumber: BaseValueObject) {
        const maxRowLength = Math.max(
            rows.isArray() ? (rows as ArrayValueObject).getRowCount() : 1,
            columns.isArray() ? (columns as ArrayValueObject).getRowCount() : 1,
            min.isArray() ? (min as ArrayValueObject).getRowCount() : 1,
            max.isArray() ? (max as ArrayValueObject).getRowCount() : 1,
            wholeNumber.isArray() ? (wholeNumber as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            rows.isArray() ? (rows as ArrayValueObject).getColumnCount() : 1,
            columns.isArray() ? (columns as ArrayValueObject).getColumnCount() : 1,
            min.isArray() ? (min as ArrayValueObject).getColumnCount() : 1,
            max.isArray() ? (max as ArrayValueObject).getColumnCount() : 1,
            wholeNumber.isArray() ? (wholeNumber as ArrayValueObject).getColumnCount() : 1
        );

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return this._calculateSingleCell(rows, columns, min, max, wholeNumber);
        }

        const rowsArray = expandArrayValueObject(maxRowLength, maxColumnLength, rows, ErrorValueObject.create(ErrorType.NA));
        const columnsArray = expandArrayValueObject(maxRowLength, maxColumnLength, columns, ErrorValueObject.create(ErrorType.NA));
        const minArray = expandArrayValueObject(maxRowLength, maxColumnLength, min, ErrorValueObject.create(ErrorType.NA));
        const maxArray = expandArrayValueObject(maxRowLength, maxColumnLength, max, ErrorValueObject.create(ErrorType.NA));
        const wholeNumberArray = expandArrayValueObject(maxRowLength, maxColumnLength, wholeNumber, ErrorValueObject.create(ErrorType.NA));

        return rowsArray.map((rowsObject, rowIndex, columnIndex) => {
            const columnsObject = columnsArray.get(rowIndex, columnIndex) as BaseValueObject;
            const minObject = minArray.get(rowIndex, columnIndex) as BaseValueObject;
            const maxObject = maxArray.get(rowIndex, columnIndex) as BaseValueObject;
            const wholeNumberObject = wholeNumberArray.get(rowIndex, columnIndex) as BaseValueObject;

            const _handleError = this._handleError(rowsObject, columnsObject, minObject, maxObject, wholeNumberObject);

            if (_handleError.errorObject) {
                return _handleError.errorObject;
            }

            let { minValue, maxValue, wholeNumberValue } = _handleError;

            let result: number;

            if (!wholeNumberValue) {
                result = Math.random() * (maxValue - minValue) + minValue;
            } else {
                minValue = Math.ceil(minValue);
                maxValue = Math.floor(maxValue);

                result = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            }

            if (result < minValue || result > maxValue) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return NumberValueObject.create(result);
        });
    }

    private _calculateSingleCell(rows: BaseValueObject, columns: BaseValueObject, min: BaseValueObject, max: BaseValueObject, wholeNumber: BaseValueObject) {
        let _rows = rows;

        if (_rows.isArray()) {
            _rows = (_rows as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        let _columns = columns;

        if (_columns.isArray()) {
            _columns = (_columns as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        let _min = min;

        if (_min.isArray()) {
            _min = (_min as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        let _max = max;

        if (_max.isArray()) {
            _max = (_max as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        let _wholeNumber = wholeNumber;

        if (_wholeNumber.isArray()) {
            _wholeNumber = (_wholeNumber as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        const _handleError = this._handleError(_rows, _columns, _min, _max, _wholeNumber);

        if (_handleError.errorObject) {
            return _handleError.errorObject;
        }

        let { rowsValue, columnsValue, minValue, maxValue, wholeNumberValue } = _handleError;

        if (wholeNumberValue) {
            minValue = Math.ceil(minValue);
            maxValue = Math.floor(maxValue);

            if (minValue > maxValue) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
        }

        const result: number[][] = [];

        for (let r = 0; r < rowsValue; r++) {
            const row: number[] = [];

            for (let c = 0; c < columnsValue; c++) {
                if (wholeNumberValue) {
                    row.push(Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
                } else {
                    row.push(Math.random() * (maxValue - minValue) + minValue);
                }
            }

            result.push(row);
        }

        if (rowsValue === 1 && columnsValue === 1) {
            return NumberValueObject.create(result[0][0]);
        }

        return ArrayValueObject.createByArray(result);
    }

    private _handleError(rowsObject: BaseValueObject, columnsObject: BaseValueObject, minObject: BaseValueObject, maxObject: BaseValueObject, wholeNumberObject: BaseValueObject) {
        let _rowsObject = rowsObject;

        if (_rowsObject.isString()) {
            _rowsObject = _rowsObject.convertToNumberObjectValue();
        }

        if (_rowsObject.isError()) {
            return {
                errorObject: _rowsObject,
            };
        }

        let _columnsObject = columnsObject;

        if (_columnsObject.isString()) {
            _columnsObject = _columnsObject.convertToNumberObjectValue();
        }

        if (_columnsObject.isError()) {
            return {
                errorObject: _columnsObject,
            };
        }

        let _minObject = minObject;

        if (_minObject.isString()) {
            _minObject = _minObject.convertToNumberObjectValue();
        }

        if (_minObject.isError()) {
            return {
                errorObject: _minObject,
            };
        }

        let _maxObject = maxObject;

        if (_maxObject.isString()) {
            _maxObject = _maxObject.convertToNumberObjectValue();
        }

        if (_maxObject.isError()) {
            return {
                errorObject: _maxObject,
            };
        }

        let _wholeNumberObject = wholeNumberObject;

        if (_wholeNumberObject.isString()) {
            _wholeNumberObject = _wholeNumberObject.convertToNumberObjectValue();
        }

        if (_wholeNumberObject.isError()) {
            return {
                errorObject: _wholeNumberObject,
            };
        }

        return this._getValue(_rowsObject, _columnsObject, _minObject, _maxObject, _wholeNumberObject);
    }

    private _getValue(rowsObject: BaseValueObject, columnsObject: BaseValueObject, minObject: BaseValueObject, maxObject: BaseValueObject, wholeNumberObject: BaseValueObject) {
        const rowsValue = Math.floor(+rowsObject.getValue());
        const columnsValue = Math.floor(+columnsObject.getValue());

        if (rowsValue === 0 || columnsValue === 0) {
            return {
                errorObject: ErrorValueObject.create(ErrorType.CALC),
            };
        }

        const maxRows = this._rowCount - this.row;
        const maxColumns = this._columnCount - this.column;

        // max count of cells is 10^7
        if (rowsValue < 0 || columnsValue < 0 || rowsValue * columnsValue > 10 ** 7) {
            return {
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        // Cannot exceed the current number of available rows and columns in the table
        if (rowsValue > maxRows || columnsValue > maxColumns) {
            return {
                errorObject: ErrorValueObject.create(ErrorType.REF),
            };
        }

        const minValue = +minObject.getValue();
        const maxValue = +maxObject.getValue();
        const wholeNumberValue = +wholeNumberObject.getValue();

        if (minValue > maxValue) {
            return {
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        if (wholeNumberValue && (!Number.isInteger(minValue) || !Number.isInteger(maxValue))) {
            return {
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        return {
            rowsValue,
            columnsValue,
            minValue,
            maxValue,
            wholeNumberValue,
        };
    }
}
