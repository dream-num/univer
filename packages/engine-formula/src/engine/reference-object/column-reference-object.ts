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

import { type IRange, RANGE_TYPE } from '@univerjs/core';

import { ErrorType } from '../../basics/error-type';
import { matchToken } from '../../basics/token';

import { deserializeRangeWithSheetWithCache } from '../utils/reference-cache';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseReferenceObject } from './base-reference-object';

export class ColumnReferenceObject extends BaseReferenceObject {
    constructor(token: string) {
        super(token);
        const grid = deserializeRangeWithSheetWithCache(token);
        this.setForcedUnitIdDirect(grid.unitId);
        this.setForcedSheetName(grid.sheetName);
        const range: IRange = {
            ...grid.range,
            startColumn: grid.range.startColumn,
            startRow: Number.NaN,
            endColumn: grid.range.endColumn,
            endRow: Number.NaN,
            rangeType: RANGE_TYPE.COLUMN,
        };
        this.setRangeData(range);
    }

    override isColumn() {
        return true;
    }

    override unionBy(referenceObject: BaseReferenceObject) {
        if (!referenceObject.isColumn()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const columnReferenceObject = referenceObject as ColumnReferenceObject;
        if (
            columnReferenceObject.getForcedSheetName() !== undefined &&
            columnReferenceObject.getForcedSheetName() !== ''
        ) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const currentRangeData = this.getRangeData();

        // if (currentRangeData.endColumn !== -1) {
        //     return ErrorValueObject.create(ErrorType.REF);
        // }

        const newColumnRange = columnReferenceObject.getRangeData();

        const newColumn = newColumnRange.startColumn;

        // if the column is already in the range, return the same object
        if (newColumn >= currentRangeData.startColumn && newColumn <= currentRangeData.endColumn) {
            return this;
        }

        const column = currentRangeData.startColumn;

        if (newColumn > column) {
            currentRangeData.endColumn = newColumn;
        } else {
            currentRangeData.startColumn = newColumn;
            currentRangeData.endColumn = column;
        }

        if (newColumnRange.startAbsoluteRefType) {
            currentRangeData.endAbsoluteRefType = newColumnRange.startAbsoluteRefType;
        }

        currentRangeData.rangeType = RANGE_TYPE.COLUMN;

        this.setToken(`${this.getToken()}${matchToken.COLON}${columnReferenceObject.getToken()}`);

        return this;
    }
}
