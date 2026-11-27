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

import type { IRange } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { AbsoluteRefType } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { addQuotesBothSides, serializeRange } from '../../../engine/utils/reference';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Address extends BaseFunction {
    override minParams = 2;

    override maxParams = 5;

    override needsReferenceObject = true;

    // eslint-disable-next-line max-lines-per-function
    override calculate(
        rowInput: FunctionVariantType,
        columnInput: FunctionVariantType,
        absInput?: FunctionVariantType,
        a1Input?: FunctionVariantType,
        sheetInput?: FunctionVariantType
    ) {
        const rowNumber = this._getArgumentValue(rowInput);
        const columnNumber = this._getArgumentValue(columnInput);
        const absNumber = absInput && this._getArgumentValue(absInput);
        const a1 = a1Input && this._getArgumentValue(a1Input);
        const sheetText = sheetInput && this._getArgumentValue(sheetInput, true);

        if (rowNumber.isError()) {
            return rowNumber;
        }

        if (columnNumber.isError()) {
            return columnNumber;
        }

        if (absNumber?.isError()) {
            return absNumber;
        }

        if (a1?.isError()) {
            return a1;
        }

        if (sheetText?.isError()) {
            return sheetText;
        }

        const _absNumber = absNumber == null || absNumber.isNull() ? NumberValueObject.create(1) : absNumber;
        const _a1 = a1 == null || a1.isNull() ? BooleanValueObject.create(true) : a1;
        const _sheetText = sheetText ?? NullValueObject.create();

        if ([rowNumber, columnNumber, _absNumber, _a1, _sheetText].every((value) => !value.isArray())) {
            return this._calculateSingleCell(rowNumber, columnNumber, _absNumber, _a1, _sheetText);
        }

        // get max row length
        const maxRowLength = Math.max(
            rowNumber.isArray() ? (rowNumber as ArrayValueObject).getRowCount() : 1,
            columnNumber.isArray() ? (columnNumber as ArrayValueObject).getRowCount() : 1,
            _absNumber.isArray() ? (_absNumber as ArrayValueObject).getRowCount() : 1,
            _a1.isArray() ? (_a1 as ArrayValueObject).getRowCount() : 1,
            _sheetText.isArray() ? (_sheetText as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            rowNumber.isArray() ? (rowNumber as ArrayValueObject).getColumnCount() : 1,
            columnNumber.isArray() ? (columnNumber as ArrayValueObject).getColumnCount() : 1,
            _absNumber.isArray() ? (_absNumber as ArrayValueObject).getColumnCount() : 1,
            _a1.isArray() ? (_a1 as ArrayValueObject).getColumnCount() : 1,
            _sheetText.isArray() ? (_sheetText as ArrayValueObject).getColumnCount() : 1
        );

        const rowNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, rowNumber, ErrorValueObject.create(ErrorType.NA));
        const columnNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, columnNumber, ErrorValueObject.create(ErrorType.NA));
        const absNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _absNumber, ErrorValueObject.create(ErrorType.NA));
        const a1Array = expandArrayValueObject(maxRowLength, maxColumnLength, _a1, ErrorValueObject.create(ErrorType.NA));
        const sheetTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, _sheetText, ErrorValueObject.create(ErrorType.NA));

        return rowNumArray.map((rowNumValue, rowIndex, columnIndex) => {
            const columnNumValue = columnNumArray.get(rowIndex, columnIndex) || ErrorValueObject.create(ErrorType.NA);
            const absNumValue = absNumArray.get(rowIndex, columnIndex) || ErrorValueObject.create(ErrorType.NA);
            const a1Value = a1Array.get(rowIndex, columnIndex) || ErrorValueObject.create(ErrorType.NA);
            const sheetTextValue = sheetTextArray.get(rowIndex, columnIndex) || ErrorValueObject.create(ErrorType.NA);

            if (rowNumValue.isError()) {
                return rowNumValue;
            }

            if (columnNumValue.isError()) {
                return columnNumValue;
            }

            if (absNumValue.isError()) {
                return absNumValue;
            }

            if (a1Value.isError()) {
                return a1Value;
            }

            if (sheetTextValue.isError()) {
                return sheetTextValue;
            }

            return this._calculateSingleCell(rowNumValue, columnNumValue, absNumValue, a1Value, sheetTextValue);
        });
    }

    private _getArgumentValue(input: FunctionVariantType, isSheet = false): BaseValueObject {
        if (!input.isReferenceObject()) {
            return input as BaseValueObject;
        }
        const values = (input as BaseReferenceObject).toArrayValueObject();
        if (values.getRowCount() !== 1 || values.getColumnCount() !== 1) {
            return values;
        }
        const cell = values.getFirstCell();
        return cell.isNull() ? (isSheet ? StringValueObject.create('') : NumberValueObject.create(0)) : cell;
    }

    private _calculateSingleCell(rowNumber: BaseValueObject, columnNumber: BaseValueObject, absNumber: BaseValueObject, a1: BaseValueObject, sheetText: BaseValueObject) {
        const row = Math.trunc(Number(rowNumber.getValue()));
        const column = Math.trunc(Number(columnNumber.getValue()));
        const absNumberValue = Math.trunc(Number(absNumber.getValue()));
        const logical = a1.isString() ? String(a1.getValue()).toUpperCase() : a1.getValue();
        if (typeof logical === 'string' && logical !== 'TRUE' && logical !== 'FALSE') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        const isA1 = typeof logical === 'string' ? logical === 'TRUE' : Boolean(logical);
        const relativeRow = !isA1 && (absNumberValue === 3 || absNumberValue === 4);
        const relativeColumn = !isA1 && (absNumberValue === 2 || absNumberValue === 4);

        if (!Number.isFinite(row) || !Number.isFinite(column) || !Number.isFinite(absNumberValue) ||
            row < (relativeRow ? -1048576 : 1) || row > 1048576 ||
            column < (relativeColumn ? -16384 : 1) || column > 16384 ||
            absNumberValue < 1 || absNumberValue > 4) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const absType = transformAbsoluteRefType(absNumberValue);
        const sheetTextValue = sheetText.isNull() ? '' : String(sheetText.getValue());
        const simpleBookRef = /^\[[\p{L}\p{N}_.]+\][\p{L}\p{N}_.]*$/u.test(sheetTextValue);
        const prefix = sheetText.isNull() ? '' : `${simpleBookRef ? sheetTextValue : addQuotesBothSides(sheetTextValue)}!`;
        if (!isA1) {
            const coordinate = (index: number, relative: boolean) => {
                if (!relative) return String(index);
                return index === 0 ? '' : `[${index}]`;
            };
            return StringValueObject.create(`${prefix}R${coordinate(row, relativeRow)}C${coordinate(column, relativeColumn)}`);
        }

        const range: IRange = {
            startRow: row - 1,
            startColumn: column - 1,
            endRow: row - 1,
            endColumn: column - 1,
            startAbsoluteRefType: absType,
            endAbsoluteRefType: absType,
        };

        return StringValueObject.create(prefix + serializeRange(range));
    }
}

function transformAbsoluteRefType(number: number | string | boolean) {
    switch (number) {
        case 1:
            return AbsoluteRefType.ALL;
        case 2:
            return AbsoluteRefType.ROW;
        case 3:
            return AbsoluteRefType.COLUMN;
        case 4:
            return AbsoluteRefType.NONE;
        default:
            return AbsoluteRefType.ALL;
    }
}
