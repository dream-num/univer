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
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

/**
 * The result of the INDEX function is a reference and is interpreted as such by other formulas. Depending on the formula, the return value of INDEX may be used as a reference or as a value.
 *
 * =INDEX(A2:A5,2,1):A1 same as =A1:A3
 *
 * We refer to Google Sheets and set both rowNum and columnNum to optional
 *
 */
export class Index extends BaseFunction {
    override minParams = 1;

    override maxParams = 4;

    override needsReferenceObject = true;

    // eslint-disable-next-line max-lines-per-function, complexity
    override calculate(reference: FunctionVariantType, rowNum?: FunctionVariantType, columnNum?: FunctionVariantType, areaNum?: FunctionVariantType) {
        if (reference.isError()) {
            return reference;
        }

        if (rowNum?.isError()) {
            return rowNum;
        }

        if (columnNum?.isError()) {
            return columnNum;
        }

        if (areaNum?.isError()) {
            return areaNum;
        }

        let referenceRowCount = 0;
        let referenceColumnCount = 0;

        if (reference.isValueObject()) {
            referenceRowCount = 1;
            referenceColumnCount = 1;
        } else if (reference.isReferenceObject()) {
            const { startRow, endRow, startColumn, endColumn } = (reference as BaseReferenceObject).getRangePosition();
            referenceRowCount = endRow - startRow + 1;
            referenceColumnCount = endColumn - startColumn + 1;
        } else {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _rowNum, _columnNum;
        // When there is only one row, the rowNum is considered to be the column number.
        // =INDEX(A6:B6,2) equals =INDEX(A6:B6,1,2)
        if (referenceRowCount === 1 && referenceColumnCount > 1 && columnNum == null) {
            _columnNum = rowNum ?? NumberValueObject.create(0);
            _rowNum = NumberValueObject.create(0);
        } else {
            _rowNum = rowNum ?? NumberValueObject.create(0);
            _columnNum = columnNum ?? NumberValueObject.create(0);
        }

        let _areaNum = areaNum ?? NumberValueObject.create(1);

        if (_rowNum.isReferenceObject()) {
            _rowNum = (_rowNum as BaseReferenceObject).toArrayValueObject();
        }

        if (_columnNum.isReferenceObject()) {
            _columnNum = (_columnNum as BaseReferenceObject).toArrayValueObject();
        }

        if (_areaNum.isReferenceObject()) {
            _areaNum = (_areaNum as BaseReferenceObject).toArrayValueObject();
        }

        // get max row length
        const maxRowLength = Math.max(
            _rowNum.isArray() ? (_rowNum as ArrayValueObject).getRowCount() : 1,
            _columnNum.isArray() ? (_columnNum as ArrayValueObject).getRowCount() : 1,
            _areaNum.isArray() ? (_areaNum as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            _rowNum.isArray() ? (_rowNum as ArrayValueObject).getColumnCount() : 1,
            _columnNum.isArray() ? (_columnNum as ArrayValueObject).getColumnCount() : 1,
            _areaNum.isArray() ? (_areaNum as ArrayValueObject).getColumnCount() : 1
        );

        _rowNum = _rowNum as BaseValueObject;
        _columnNum = _columnNum as BaseValueObject;
        _areaNum = _areaNum as BaseValueObject;

        // If maxRowLength and maxColumnLength are both 1, pick the value from the reference array
        // Otherwise, filter the results from the reference according to the specified rowNum/columnNum/areaNum, take the upper left corner cell value of each result array, and then form an array with maxRowLength row number and maxColumnLength column number.
        if (maxRowLength === 1 && maxColumnLength === 1) {
            return this._calculateSingleCell(reference, _rowNum, _columnNum, _areaNum);
        } else {
            const rowNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _rowNum, ErrorValueObject.create(ErrorType.NA));
            const columnNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _columnNum, ErrorValueObject.create(ErrorType.NA));
            const areaNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _areaNum, ErrorValueObject.create(ErrorType.NA));

            return rowNumArray.map((rowNumValue, rowIndex, columnIndex) => {
                const columnNumValue = columnNumArray.get(rowIndex, columnIndex) || NullValueObject.create();
                const areaNumValue = areaNumArray.get(rowIndex, columnIndex) || NullValueObject.create();

                const result = this._calculateSingleCell(reference, rowNumValue, columnNumValue, areaNumValue);

                if (result.isReferenceObject()) {
                    return (result as BaseReferenceObject).toArrayValueObject().getFirstCell();
                }

                return result as BaseValueObject;
            });
        }
    }

    private _calculateSingleCell(reference: FunctionVariantType, rowNum: BaseValueObject, columnNum: BaseValueObject, areaNum: BaseValueObject) {
        if (rowNum.isError()) {
            return rowNum;
        }

        const rowNumberValue = this._getNumberValue(rowNum);

        if (rowNumberValue === undefined || rowNumberValue < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (columnNum.isError()) {
            return columnNum;
        }

        const columnNumberValue = this._getNumberValue(columnNum);

        if (columnNumberValue === undefined || columnNumberValue < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // TODO areaNum
        if (areaNum.isError()) {
            return areaNum;
        }

        const areaNumberValue = this._getAreaNumberValue(areaNum);

        if (areaNumberValue === undefined || areaNumberValue < 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (reference.isReferenceObject()) {
            return this._getReferenceObject(reference as BaseReferenceObject, rowNumberValue, columnNumberValue, areaNumberValue);
        } else if (reference.isValueObject() && rowNumberValue === 1 && columnNumberValue === 1) {
            return reference;
        } else {
            return ErrorValueObject.create(ErrorType.REF);
        }
    }

    private _getNumberValue(numberValueObject?: BaseValueObject) {
        if (numberValueObject == null) {
            return 0;
        }

        let logicValue = 0;

        if (numberValueObject.isBoolean()) {
            const logicV = numberValueObject.getValue() as boolean;
            if (logicV === true) {
                logicValue = 1;
            }
        } else if (numberValueObject.isString()) {
            return;
        } else if (numberValueObject.isNumber()) {
            logicValue = Math.floor(numberValueObject.getValue() as number);
        } else if (numberValueObject.isNull()) {
            logicValue = 0;
        }

        return logicValue;
    }

    private _getAreaNumberValue(numberValueObject?: BaseValueObject) {
        if (numberValueObject == null) {
            return 1;
        }

        let logicValue = 0;

        if (numberValueObject.isBoolean()) {
            const logicV = numberValueObject.getValue() as boolean;
            if (logicV === true) {
                logicValue = 1;
            }
        } else if (numberValueObject.isString()) {
            return;
        } else if (numberValueObject.isNumber()) {
            logicValue = Math.floor(numberValueObject.getValue() as number);
        } else if (numberValueObject.isNull()) {
            logicValue = 0;
        }

        return logicValue;
    }

    private _getReferenceObject(reference: BaseReferenceObject, rowNumberValue: number, columnNumberValue: number, areaNumberValue: number) {
        const { startRow, endRow, startColumn, endColumn } = reference.getRangePosition();

        let referenceStartRow = 0;
        let referenceEndRow = 0;
        let referenceStartColumn = 0;
        let referenceEndColumn = 0;

        if (rowNumberValue === 0) {
            referenceStartRow = startRow;
            referenceEndRow = endRow;
        } else {
            referenceStartRow = referenceEndRow = startRow + rowNumberValue - 1;
        }

        if (columnNumberValue === 0) {
            referenceStartColumn = startColumn;
            referenceEndColumn = endColumn;
        } else {
            referenceStartColumn = referenceEndColumn = startColumn + columnNumberValue - 1;
        }

        if (referenceStartRow > endRow || referenceStartColumn > endColumn) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const range = {
            startRow: referenceStartRow,
            startColumn: referenceStartColumn,
            endRow: referenceEndRow,
            endColumn: referenceEndColumn,
        };

        return this.createReferenceObject(reference, range);
    }
}
