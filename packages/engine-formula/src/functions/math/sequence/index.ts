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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sequence extends BaseFunction {
    override minParams = 1;

    override maxParams = 4;

    override needsSheetRowColumnCount = true;

    override calculate(rows: BaseValueObject, columns?: BaseValueObject, start?: BaseValueObject, step?: BaseValueObject): BaseValueObject {
        let _rows = rows;
        let _columns = columns ?? NumberValueObject.create(1);
        let _start = start ?? NumberValueObject.create(1);
        let _step = step ?? NumberValueObject.create(1);

        if (_rows.isNull()) {
            _rows = NumberValueObject.create(1);
        }

        if (_columns.isNull()) {
            _columns = NumberValueObject.create(1);
        }

        if (_start.isNull()) {
            _start = NumberValueObject.create(1);
        }

        if (_step.isNull()) {
            _step = NumberValueObject.create(1);
        }

        const maxRowLength = Math.max(
            _rows.isArray() ? (_rows as ArrayValueObject).getRowCount() : 1,
            _columns.isArray() ? (_columns as ArrayValueObject).getRowCount() : 1,
            _start.isArray() ? (_start as ArrayValueObject).getRowCount() : 1,
            _step.isArray() ? (_step as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            _rows.isArray() ? (_rows as ArrayValueObject).getColumnCount() : 1,
            _columns.isArray() ? (_columns as ArrayValueObject).getColumnCount() : 1,
            _start.isArray() ? (_start as ArrayValueObject).getColumnCount() : 1,
            _step.isArray() ? (_step as ArrayValueObject).getColumnCount() : 1
        );

        const rowsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _rows, ErrorValueObject.create(ErrorType.NA));
        const columnsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _columns, ErrorValueObject.create(ErrorType.NA));
        const startArray = expandArrayValueObject(maxRowLength, maxColumnLength, _start, ErrorValueObject.create(ErrorType.NA));
        const stepArray = expandArrayValueObject(maxRowLength, maxColumnLength, _step, ErrorValueObject.create(ErrorType.NA));

        const resultArray = rowsArray.mapValue((rowsObject, rowIndex, columnIndex) => {
            const columnsObject = columnsArray.get(rowIndex, columnIndex) as BaseValueObject;
            const startObject = startArray.get(rowIndex, columnIndex) as BaseValueObject;
            const stepObject = stepArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (rowsObject.isError()) {
                return rowsObject;
            }

            if (columnsObject.isError()) {
                return columnsObject;
            }

            if (startObject.isError()) {
                return startObject;
            }

            if (stepObject.isError()) {
                return stepObject;
            }

            return this._getResult(rowsObject, columnsObject, startObject, stepObject, maxRowLength, maxColumnLength);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _getResult(
        rowsObject: BaseValueObject,
        columnsObject: BaseValueObject,
        startObject: BaseValueObject,
        stepObject: BaseValueObject,
        maxRowLength: number,
        maxColumnLength: number
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(rowsObject, columnsObject, startObject, stepObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_rowsObject, _columnsObject, _startObject, _stepObject] = variants as BaseValueObject[];

        const rowsValue = Math.floor(+_rowsObject.getValue());
        const columnsValue = Math.floor(+_columnsObject.getValue());
        const startValue = +_startObject.getValue();
        const stepValue = +_stepObject.getValue();

        // max count of cells is 10^7
        if (rowsValue < 0 || columnsValue < 0 || rowsValue * columnsValue > 10 ** 7) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (rowsValue === 0 || columnsValue === 0) {
            return ErrorValueObject.create(ErrorType.CALC);
        }

        const maxRows = this._rowCount - this.row;
        const maxColumns = this._columnCount - this.column;

        if (rowsValue > maxRows || columnsValue > maxColumns) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const result: number[][] = [];

        for (let r = 0; r < rowsValue; r++) {
            result[r] = [];

            for (let c = 0; c < columnsValue; c++) {
                result[r][c] = startValue + (r * columnsValue + c) * stepValue;
            }
        }

        if (maxRowLength > 1 || maxColumnLength > 1) {
            return NumberValueObject.create(result[0][0]);
        }

        return ArrayValueObject.createByArray(result);
    }
}
