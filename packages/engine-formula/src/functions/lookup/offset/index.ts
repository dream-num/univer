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
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';

export class Offset extends BaseFunction {
    override minParams = 3;

    override maxParams = 5;

    override needsReferenceObject = true;

    override isAddress() {
        return true;
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    override calculate(
        reference: FunctionVariantType,
        rows: FunctionVariantType,
        columns: FunctionVariantType,
        height?: FunctionVariantType,
        width?: FunctionVariantType
    ) {
        if (reference.isError()) {
            return reference;
        }

        if (rows.isError()) {
            return rows;
        }

        if (columns.isError()) {
            return columns;
        }

        if (height?.isError()) {
            return height;
        }

        if (width?.isError()) {
            return width;
        }

        if (!reference.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const rowCount = (reference as BaseReferenceObject).getRowCount();
        const columnCount = (reference as BaseReferenceObject).getColumnCount();

        let _rows = rows;

        if (_rows.isReferenceObject()) {
            _rows = (_rows as BaseReferenceObject).toArrayValueObject();
        }

        let _columns = columns;

        if (_columns.isReferenceObject()) {
            _columns = (_columns as BaseReferenceObject).toArrayValueObject();
        }

        let _height = height ?? NumberValueObject.create(rowCount);

        if (_height.isReferenceObject()) {
            _height = (_height as BaseReferenceObject).toArrayValueObject();
        }

        if ((_height as BaseValueObject).isNull()) {
            _height = NumberValueObject.create(rowCount);
        }

        let _width = width ?? NumberValueObject.create(columnCount);

        if (_width.isReferenceObject()) {
            _width = (_width as BaseReferenceObject).toArrayValueObject();
        }

        if ((_width as BaseValueObject).isNull()) {
            _width = NumberValueObject.create(columnCount);
        }

        // If rows/columns/height/width is a range, it needs to be extended
        // get max row length
        const maxRowLength = Math.max(
            _rows.isArray() ? (_rows as ArrayValueObject).getRowCount() : 1,
            _columns.isArray() ? (_columns as ArrayValueObject).getRowCount() : 1,
            _height.isArray() ? (_height as ArrayValueObject).getRowCount() : 1,
            _width.isArray() ? (_width as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            _rows.isArray() ? (_rows as ArrayValueObject).getColumnCount() : 1,
            _columns.isArray() ? (_columns as ArrayValueObject).getColumnCount() : 1,
            _height.isArray() ? (_height as ArrayValueObject).getColumnCount() : 1,
            _width.isArray() ? (_width as ArrayValueObject).getColumnCount() : 1
        );

        _rows = _rows as BaseValueObject;
        _columns = _columns as BaseValueObject;
        _height = _height as BaseValueObject;
        _width = _width as BaseValueObject;

        // If any parameter of row/columns/height/width is an array(not single cell reference), an error will be reported, and the error report also needs to be expanded and specific error information is required. Otherwise, calculate the offset.
        if (maxRowLength === 1 && maxColumnLength === 1) {
            _rows = _rows.isArray() ? (_rows as ArrayValueObject).get(0, 0) as BaseValueObject : _rows;
            _columns = _columns.isArray() ? (_columns as ArrayValueObject).get(0, 0) as BaseValueObject : _columns;
            _height = _height.isArray() ? (_height as ArrayValueObject).get(0, 0) as BaseValueObject : _height;
            _width = _width.isArray() ? (_width as ArrayValueObject).get(0, 0) as BaseValueObject : _width;

            return this._handleSingleObject(reference as BaseReferenceObject, _rows, _columns, _height, _width);
        }

        const rowsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _rows, ErrorValueObject.create(ErrorType.NA));
        const columnsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _columns, ErrorValueObject.create(ErrorType.NA));
        const heightArray = expandArrayValueObject(maxRowLength, maxColumnLength, _height, ErrorValueObject.create(ErrorType.NA));
        const widthArray = expandArrayValueObject(maxRowLength, maxColumnLength, _width, ErrorValueObject.create(ErrorType.NA));

        return rowsArray.mapValue((rowsValue, rowIndex, columnIndex) => {
            const columnsValue = columnsArray.get(rowIndex, columnIndex) as BaseValueObject;
            const heightValue = heightArray.get(rowIndex, columnIndex) as BaseValueObject;
            const widthValue = widthArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (rowsValue.isError()) {
                return rowsValue;
            }

            if (columnsValue.isError()) {
                return columnsValue;
            }

            if (heightValue.isError()) {
                return heightValue;
            }

            if (widthValue.isError()) {
                return widthValue;
            }

            // Ensure that the callback function returns a BaseValueObject
            return this._handleSingleObject(reference as BaseReferenceObject, rowsValue, columnsValue, heightValue, widthValue, true) as BaseValueObject;
        });
    }

    // eslint-disable-next-line
    private _handleSingleObject(reference: BaseReferenceObject, rowsValue: BaseValueObject, columnsValue: BaseValueObject, heightValue: BaseValueObject, widthValue: BaseValueObject, isReportError = false) {
        const { startRow: referenceStartRow, startColumn: referenceStartColumn } = reference.getRangePosition();

        let _rowsValue = rowsValue;

        if (_rowsValue.isString()) {
            _rowsValue = _rowsValue.convertToNumberObjectValue();
        }

        if (_rowsValue.isError()) {
            return _rowsValue;
        }

        let _columnsValue = columnsValue;

        if (_columnsValue.isString()) {
            _columnsValue = _columnsValue.convertToNumberObjectValue();
        }

        if (_columnsValue.isError()) {
            return _columnsValue;
        }

        const rowOffset = +_rowsValue.getValue();
        const columnOffset = +_columnsValue.getValue();

        if (typeof rowOffset !== 'number' || typeof columnOffset !== 'number') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const targetRow = referenceStartRow + rowOffset;
        const targetColumn = referenceStartColumn + columnOffset;

        // Excel has a limit on the number of rows and columns: targetRow > 1048576 || targetColumn > 16384, Univer has no limit
        if (targetRow < 0 || targetColumn < 0) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const heightCount = this.getIndexNumValue(heightValue);
        const widthCount = this.getIndexNumValue(widthValue);

        if (typeof heightCount !== 'number' || typeof widthCount !== 'number') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (heightCount === 0 || widthCount === 0) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const targetRowWithHeight = heightCount > 0 ? targetRow + heightCount - 1 : targetRow + heightCount + 1;
        const targetColumnWithWidth = widthCount > 0 ? targetColumn + widthCount - 1 : targetColumn + widthCount + 1;

        // Excel has a limit on the number of rows and columns: targetRow > 1048576 || targetColumn > 16384, Univer has no limit
        if (targetRowWithHeight < 0 || targetColumnWithWidth < 0) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (isReportError) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const startRow = targetRow < targetRowWithHeight ? targetRow : targetRowWithHeight;
        const startColumn = targetColumn < targetColumnWithWidth ? targetColumn : targetColumnWithWidth;
        const endRow = targetRow > targetRowWithHeight ? targetRow : targetRowWithHeight;
        const endColumn = targetColumn > targetColumnWithWidth ? targetColumn : targetColumnWithWidth;

        const range = {
            startRow,
            startColumn,
            endRow,
            endColumn,
        };

        return this.createReferenceObject(reference, range);
    }
}
