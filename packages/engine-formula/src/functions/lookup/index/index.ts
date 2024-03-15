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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Index extends BaseFunction {
    override calculate(reference: BaseValueObject, rowNum: BaseValueObject, columnNum?: BaseValueObject, areaNum?: BaseValueObject) {
        if (reference == null || rowNum == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (reference.isError()) {
            return reference;
        }

        if (rowNum.isError()) {
            return rowNum;
        }

        if (columnNum?.isError()) {
            return columnNum;
        }

        if (areaNum?.isError()) {
            return areaNum;
        }

        if (!reference.isArray()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const referenceRowCount = (reference as ArrayValueObject).getRowCount();
        const referenceColumnCount = (reference as ArrayValueObject).getColumnCount();

        // When there is only one row, the rowNum is considered to be the column number.
        // =INDEX(A6:B6,2) equals =INDEX(A6:B6,1,2)
        if (referenceRowCount === 1 && referenceColumnCount > 1 && columnNum == null) {
            columnNum = rowNum ?? NumberValueObject.create(0);
            rowNum = NumberValueObject.create(0);
        } else {
            rowNum = rowNum ?? NumberValueObject.create(0);
            columnNum = columnNum ?? NumberValueObject.create(0);
        }

        areaNum = areaNum ?? NumberValueObject.create(1);

        // get max row length
        const maxRowLength = Math.max(
            rowNum.isArray() ? (rowNum as ArrayValueObject).getRowCount() : 1,
            columnNum.isArray() ? (columnNum as ArrayValueObject).getRowCount() : 1,
            areaNum.isArray() ? (areaNum as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            rowNum.isArray() ? (rowNum as ArrayValueObject).getColumnCount() : 1,
            columnNum.isArray() ? (columnNum as ArrayValueObject).getColumnCount() : 1,
            areaNum.isArray() ? (areaNum as ArrayValueObject).getColumnCount() : 1
        );

        // If maxRowLength and maxColumnLength are both 1, pick the value from the reference array
        // Otherwise, filter the results from the reference according to the specified rowNum/columnNum/areaNum, take the upper left corner cell value of each result array, and then form an array with maxRowLength row number and maxColumnLength column number.
        if (maxRowLength === 1 && maxColumnLength === 1) {
            return this._calculateSingleCell(reference as ArrayValueObject, rowNum, columnNum, areaNum);
        } else {
            const rowNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, rowNum, ErrorValueObject.create(ErrorType.NA));
            const columnNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, columnNum, ErrorValueObject.create(ErrorType.NA));
            const areaNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, areaNum, ErrorValueObject.create(ErrorType.NA));

            return rowNumArray.map((rowNumValue, rowIndex, columnIndex) => {
                const columnNumValue = columnNumArray.get(rowIndex, columnIndex);
                const areaNumValue = areaNumArray.get(rowIndex, columnIndex);

                const result = this._calculateSingleCell(reference as ArrayValueObject, rowNumValue, columnNumValue, areaNumValue);

                if (result.isArray()) {
                    return (result as ArrayValueObject).getFirstCell();
                }

                return result;
            });
        }
    }

    private _calculateSingleCell(reference: ArrayValueObject, rowNum: BaseValueObject, columnNum: BaseValueObject, areaNum: BaseValueObject) {
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

        const rowParam = rowNumberValue === 0 ? [undefined] : [rowNumberValue - 1, rowNumberValue];
        const columnParam = columnNumberValue === 0 ? [undefined] : [columnNumberValue - 1, columnNumberValue];

        const result = reference.slice(rowParam, columnParam);

        if (!result) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        return result;
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
}
