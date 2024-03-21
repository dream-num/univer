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

import type { IRange } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { REFERENCE_REGEX_SINGLE_COLUMN, REFERENCE_REGEX_SINGLE_ROW, REFERENCE_SINGLE_RANGE_REGEX } from '../../../basics/regex';
import type { BaseReferenceObject } from '../../../engine/reference-object/base-reference-object';
import { CellReferenceObject } from '../../../engine/reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../../../engine/reference-object/column-reference-object';
import { RangeReferenceObject } from '../../../engine/reference-object/range-reference-object';
import { RowReferenceObject } from '../../../engine/reference-object/row-reference-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { serializeRangeToRefString } from '../../../engine/utils/reference';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

/**
 * The result of the INDEX function is a reference and is interpreted as such by other formulas. Depending on the formula, the return value of INDEX may be used as a reference or as a value.
 *
 * =INDEX(A2:A5,2,1):A1 same as =A1:A3
 *
 * OPTIMIZE: maybe we can remove some unknown type
 */
export class Index extends BaseFunction {
    override needsReferenceObject = true;

    override calculate(referenceObject: BaseValueObject, rowNum: BaseValueObject, columnNum?: BaseValueObject, areaNum?: BaseValueObject) {
        // covert to real type
        const reference = referenceObject as unknown as RangeReferenceObject;

        if (reference == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

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

        if (!(reference.isRange())) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const { startRow, endRow, startColumn, endColumn } = reference.getRangeData();
        const referenceRowCount = endRow - startRow + 1;
        const referenceColumnCount = endColumn - startColumn + 1;

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

        if (rowNum.isReferenceObject()) {
            rowNum = (rowNum as unknown as BaseReferenceObject).toArrayValueObject();
        }

        if (columnNum.isReferenceObject()) {
            columnNum = (columnNum as unknown as BaseReferenceObject).toArrayValueObject();
        }

        if (areaNum.isReferenceObject()) {
            areaNum = (areaNum as unknown as BaseReferenceObject).toArrayValueObject();
        }

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
            return this._calculateSingleCell(reference, rowNum, columnNum, areaNum);
        } else {
            const rowNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, rowNum, ErrorValueObject.create(ErrorType.NA));
            const columnNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, columnNum, ErrorValueObject.create(ErrorType.NA));
            const areaNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, areaNum, ErrorValueObject.create(ErrorType.NA));

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

    private _calculateSingleCell(reference: RangeReferenceObject, rowNum: BaseValueObject, columnNum: BaseValueObject, areaNum: BaseValueObject) {
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

        return this._getReferenceObject(reference, rowNumberValue, columnNumberValue, areaNumberValue);
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

    private _setDefault(reference: BaseReferenceObject, object: BaseReferenceObject) {
        if (this.unitId == null || this.subUnitId == null) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        object.setDefaultUnitId(this.unitId);
        object.setDefaultSheetId(this.subUnitId);
        object.setUnitData(reference.getUnitData());
        object.setRuntimeData(reference.getRuntimeData());
        object.setArrayFormulaCellData(reference.getArrayFormulaCellData());
        object.setRuntimeArrayFormulaCellData(reference.getRuntimeArrayFormulaCellData());

        return object;
    }

    private _getReferenceObject(reference: RangeReferenceObject, rowNumberValue: number, columnNumberValue: number, areaNumberValue: number) {
        const { startRow, endRow, startColumn, endColumn } = reference.getRangeData();

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

        const unitId = reference.getForcedUnitId();
        const sheetId = reference.getForcedSheetId() || '';
        const sheetName = reference.getForcedSheetName();

        const gridRangeName = {
            unitId,
            sheetName,
            range,
        };

        const token = serializeRangeToRefString(gridRangeName);

        const referenceObject = this._createReferenceObject(token, unitId, sheetId, range);

        return this._setDefault(reference, referenceObject);
    }

    private _createReferenceObject(token: string, unitId: string, sheetId: string, range: IRange) {
        let referenceObject: BaseReferenceObject;

        if (new RegExp(REFERENCE_SINGLE_RANGE_REGEX).test(token)) {
            referenceObject = new CellReferenceObject(token);
        } else if (new RegExp(REFERENCE_REGEX_SINGLE_ROW).test(token)) {
            referenceObject = new RowReferenceObject(token);
        } else if (new RegExp(REFERENCE_REGEX_SINGLE_COLUMN).test(token)) {
            referenceObject = new ColumnReferenceObject(token);
        } else {
            referenceObject = new RangeReferenceObject(range, sheetId, unitId);
        }

        return referenceObject;
    }

    private _getReferenceObjectFirstCell(reference: BaseReferenceObject) {
        const { startRow, startColumn } = reference.getRangeData();
        const range = {
            startRow,
            startColumn,
            endRow: startRow,
            endColumn: startColumn,
        };

        const unitId = reference.getForcedUnitId();
        const sheetName = reference.getForcedSheetName();

        const gridRangeName = {
            unitId,
            sheetName,
            range,
        };

        const token = serializeRangeToRefString(gridRangeName);

        return new CellReferenceObject(token);
    }
}
