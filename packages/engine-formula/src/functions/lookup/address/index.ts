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

import { AbsoluteRefType, type IRange } from '@univerjs/core';

import { ErrorType } from '../../../basics/error-type';
import { serializeRangeToR1C1 } from '../../../engine/utils/r1c1-reference';
import { needsQuoting, serializeRange } from '../../../engine/utils/reference';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Address extends BaseFunction {
    override minParams = 2;

    override maxParams = 5;

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

        const row = Number(rowNumber.getValue()) - 1;
        const column = Number(columnNumber.getValue()) - 1;

        if (Number.isNaN(row) || Number.isNaN(column)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const absType = absNumber ? transformAbsoluteRefType(absNumber.getValue()) : AbsoluteRefType.ALL;

        const a1Value = this.getZeroOrOneByOneDefault(a1);

        const sheetTextValue = sheetText ? `${sheetText.getValue()}` : '';
        const sheetName = needsQuoting(sheetTextValue) ? `'${sheetTextValue}'` : sheetTextValue;

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
