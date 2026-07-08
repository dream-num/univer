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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValue } from '../../../basics/common';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class If extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(logicalTest: BaseValueObject, valueIfTrue: BaseValueObject, valueIfFalse: BaseValueObject = BooleanValueObject.create(false)) {
        let _logicalTest = logicalTest;
        let useLegacyImplicitSelectedValue = false;

        if (logicalTest.isArray()) {
            const logicalTestArray = logicalTest as ArrayValueObject;
            const rowCount = logicalTestArray.getRowCount();
            const columnCount = logicalTestArray.getColumnCount();

            if (rowCount === 1 && columnCount === 1) {
                _logicalTest = logicalTestArray.get(0, 0) as BaseValueObject;
            } else if (
                !this._isCurrentArrayFormula() &&
                logicalTestArray.getUnitId() !== '' &&
                logicalTestArray.getSheetId() !== '' &&
                logicalTestArray.getCurrentRow() >= 0 &&
                logicalTestArray.getCurrentColumn() >= 0
            ) {
                _logicalTest = this._legacyImplicitArrayValue(logicalTestArray);
                useLegacyImplicitSelectedValue = true;
            }
        }

        if (!_logicalTest.isArray()) {
            return this._handleSingleObject(_logicalTest, valueIfTrue, valueIfFalse, useLegacyImplicitSelectedValue);
        }

        // get max row length
        const maxRowLength = Math.max(
            _logicalTest.isArray() ? (_logicalTest as ArrayValueObject).getRowCount() : 1,
            valueIfTrue.isArray() ? (valueIfTrue as ArrayValueObject).getRowCount() : 1,
            valueIfFalse.isArray() ? (valueIfFalse as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            _logicalTest.isArray() ? (_logicalTest as ArrayValueObject).getColumnCount() : 1,
            valueIfTrue.isArray() ? (valueIfTrue as ArrayValueObject).getColumnCount() : 1,
            valueIfFalse.isArray() ? (valueIfFalse as ArrayValueObject).getColumnCount() : 1
        );

        const logicalTestArray = expandArrayValueObject(maxRowLength, maxColumnLength, _logicalTest, ErrorValueObject.create(ErrorType.NA));
        const valueIfTrueArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfTrue, ErrorValueObject.create(ErrorType.NA));
        const valueIfFalseArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfFalse, ErrorValueObject.create(ErrorType.NA));

        return logicalTestArray.mapValue((logicalTestValue, rowIndex, columnIndex) => {
            const valueIfTrueValue = valueIfTrueArray.get(rowIndex, columnIndex) as BaseValueObject;
            const valueIfFalseValue = valueIfFalseArray.get(rowIndex, columnIndex) as BaseValueObject;

            return this._handleSingleObject(logicalTestValue, valueIfTrueValue, valueIfFalseValue, false);
        });
    }

    private _handleSingleObject(logicalTest: BaseValueObject, valueIfTrue: BaseValueObject, valueIfFalse: BaseValueObject, useLegacyImplicitSelectedValue: boolean) {
        if (logicalTest.isError()) {
            return logicalTest;
        }

        const logicalTestValue = this._coerceLogicalTest(logicalTest);
        if (logicalTestValue.isError()) {
            return logicalTestValue;
        }

        let selectedValue = logicalTestValue.getValue()
            ? valueIfTrue
            : valueIfFalse;
        if (useLegacyImplicitSelectedValue) {
            selectedValue = this._legacyImplicitSelectedValue(selectedValue);
        }
        return this._coerceSelectedValue(selectedValue);
    }

    private _coerceSelectedValue(value: BaseValueObject): BaseValueObject {
        return value.isNull() ? NumberValueObject.create(0) : value;
    }

    private _coerceLogicalTest(logicalTest: BaseValueObject): BaseValueObject {
        if (logicalTest.isNull()) {
            return BooleanValueObject.create(false);
        }

        if (logicalTest.isBoolean()) {
            return logicalTest;
        }

        if (logicalTest.isNumber()) {
            return BooleanValueObject.create(Number(logicalTest.getValue()) !== 0);
        }

        if (logicalTest.isString()) {
            const value = `${logicalTest.getValue()}`.trim().toUpperCase();
            if (value === BooleanValue.TRUE) {
                return BooleanValueObject.create(true);
            }
            if (value === BooleanValue.FALSE) {
                return BooleanValueObject.create(false);
            }
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }

    private _legacyImplicitSelectedValue(value: BaseValueObject): BaseValueObject {
        if (!value.isArray()) {
            return value;
        }

        const array = value as ArrayValueObject;

        if (
            array.getUnitId() === '' ||
            array.getSheetId() === '' ||
            array.getCurrentRow() < 0 ||
            array.getCurrentColumn() < 0
        ) {
            return value;
        }

        return this._legacyImplicitArrayValue(array);
    }

    private _legacyImplicitArrayValue(logicalTest: ArrayValueObject): BaseValueObject {
        const startRow = logicalTest.getCurrentRow();
        const startColumn = logicalTest.getCurrentColumn();
        const rowCount = logicalTest.getRowCount();
        const columnCount = logicalTest.getColumnCount();

        if (startRow < 0 || startColumn < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let rowIndex = -1;
        let columnIndex = -1;
        if (rowCount === 1 && columnCount === 1) {
            rowIndex = 0;
            columnIndex = 0;
        } else if (rowCount === 1) {
            rowIndex = 0;
            columnIndex = this.column - startColumn;
        } else if (columnCount === 1) {
            rowIndex = this.row - startRow;
            columnIndex = 0;
        } else {
            rowIndex = this.row - startRow;
            columnIndex = this.column - startColumn;
        }

        if (rowIndex < 0 || rowIndex >= rowCount || columnIndex < 0 || columnIndex >= columnCount) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return logicalTest.get(rowIndex, columnIndex) as BaseValueObject || ErrorValueObject.create(ErrorType.VALUE);
    }

    private _isCurrentArrayFormula(): boolean {
        return this.currentFormulaRowCount > 1 || this.currentFormulaColumnCount > 1;
    }
}
