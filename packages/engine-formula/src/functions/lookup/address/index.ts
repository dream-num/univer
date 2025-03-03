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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { AbsoluteRefType } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { serializeRangeToR1C1 } from '../../../engine/utils/r1c1-reference';
import { addQuotesBothSides, serializeRange } from '../../../engine/utils/reference';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Address extends BaseFunction {
    override minParams = 2;

    override maxParams = 5;

    // eslint-disable-next-line max-lines-per-function
    override calculate(
        rowNumber: BaseValueObject,
        columnNumber: BaseValueObject,
        absNumber?: BaseValueObject,
        a1?: BaseValueObject,
        sheetText?: BaseValueObject
    ) {
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

        const _absNumber = absNumber ?? NumberValueObject.create(1);
        const _a1 = a1 ?? BooleanValueObject.create(true);
        const _sheetText = sheetText ?? StringValueObject.create('');

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

    private _calculateSingleCell(rowNumber: BaseValueObject, columnNumber: BaseValueObject, absNumber: BaseValueObject, a1: BaseValueObject, sheetText: BaseValueObject) {
        const row = Number.parseInt(`${Number(rowNumber.getValue()) - 1}`);
        const column = Number.parseInt(`${Number(columnNumber.getValue()) - 1}`);
        const absNumberValue = Number.parseInt(`${Number(absNumber.getValue())}`);

        if (Number.isNaN(row) || Number.isNaN(column) || Number.isNaN(absNumberValue) || absNumberValue < 1 || absNumberValue > 4) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const absType = transformAbsoluteRefType(absNumberValue);
        const a1Value = this.getZeroOrOneByOneDefault(a1);
        const sheetTextValue = `${sheetText.getValue()}`;
        const sheetName = addQuotesBothSides(sheetTextValue);

        const range: IRange = {
            startRow: row,
            startColumn: column,
            endRow: row,
            endColumn: column,
            startAbsoluteRefType: absType,
            endAbsoluteRefType: absType,
        };

        const rangeString = a1 && !a1Value ? serializeRangeToR1C1(range) : serializeRange(range);
        return StringValueObject.create(sheetName !== '' ? `${sheetName}!${rangeString}` : rangeString);
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
