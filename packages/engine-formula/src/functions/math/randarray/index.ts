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

import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

export class Randarray extends BaseFunction {
    override minParams = 0;

    override maxParams = 5;

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

        rows = rows ?? NumberValueObject.create(1);
        columns = columns ?? NumberValueObject.create(1);
        min = min ?? NumberValueObject.create(0);
        max = max ?? NumberValueObject.create(1);
        wholeNumber = wholeNumber ?? NumberValueObject.create(0);

        // get max row length
        const maxRowLength = Math.max(
            rows?.isArray() ? (rows as ArrayValueObject).getRowCount() : 1,
            columns?.isArray() ? (columns as ArrayValueObject).getRowCount() : 1,
            min?.isArray() ? (min as ArrayValueObject).getRowCount() : 1,
            max?.isArray() ? (max as ArrayValueObject).getRowCount() : 1,
            wholeNumber?.isArray() ? (wholeNumber as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            rows?.isArray() ? (rows as ArrayValueObject).getColumnCount() : 1,
            columns?.isArray() ? (columns as ArrayValueObject).getColumnCount() : 1,
            min?.isArray() ? (min as ArrayValueObject).getColumnCount() : 1,
            max?.isArray() ? (max as ArrayValueObject).getColumnCount() : 1,
            wholeNumber?.isArray() ? (wholeNumber as ArrayValueObject).getColumnCount() : 1
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

            if (_handleError.error) {
                return _handleError.error;
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

    private _calculateSingleCell(rows?: BaseValueObject, columns?: BaseValueObject, min?: BaseValueObject, max?: BaseValueObject, wholeNumber?: BaseValueObject) {
        if (rows?.isArray()) {
            rows = (rows as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (columns?.isArray()) {
            columns = (columns as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (min?.isArray()) {
            min = (min as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (max?.isArray()) {
            max = (max as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (wholeNumber?.isArray()) {
            wholeNumber = (wholeNumber as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        const _handleError = this._handleError(rows, columns, min, max, wholeNumber);

        if (_handleError.error) {
            return _handleError.error;
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

    private _handleError(rowsObject?: BaseValueObject, columnsObject?: BaseValueObject, minObject?: BaseValueObject, maxObject?: BaseValueObject, wholeNumberObject?: BaseValueObject) {
        if (rowsObject?.isString()) {
            rowsObject = rowsObject.convertToNumberObjectValue();
        }

        if (rowsObject?.isError()) {
            return {
                error: rowsObject,
            };
        }

        if (columnsObject?.isString()) {
            columnsObject = columnsObject.convertToNumberObjectValue();
        }

        if (columnsObject?.isError()) {
            return {
                error: columnsObject,
            };
        }

        if (minObject?.isString()) {
            minObject = minObject.convertToNumberObjectValue();
        }

        if (minObject?.isError()) {
            return {
                error: minObject,
            };
        }

        if (maxObject?.isString()) {
            maxObject = maxObject.convertToNumberObjectValue();
        }

        if (maxObject?.isError()) {
            return {
                error: maxObject,
            };
        }

        if (wholeNumberObject?.isString()) {
            wholeNumberObject = wholeNumberObject.convertToNumberObjectValue();
        }

        if (wholeNumberObject?.isError()) {
            return {
                error: wholeNumberObject,
            };
        }

        const rowsValue = rowsObject ? Math.floor(+rowsObject.getValue()) : 1;
        const columnsValue = columnsObject ? Math.floor(+columnsObject.getValue()) : 1;

        if (rowsValue === 0 || columnsValue === 0) {
            return {
                error: ErrorValueObject.create(ErrorType.CALC),
            };
        }

        if (rowsValue < 0 || columnsValue < 0) {
            return {
                error: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        const minValue = minObject ? +minObject.getValue() : 0;
        const maxValue = maxObject ? +maxObject.getValue() : 1;
        const wholeNumberValue = wholeNumberObject ? +wholeNumberObject.getValue() : 0;

        if (minValue > maxValue) {
            return {
                error: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        if (wholeNumberValue && (!Number.isInteger(minValue) || !Number.isInteger(maxValue))) {
            return {
                error: ErrorValueObject.create(ErrorType.VALUE),
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
