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

export class RowReferenceObject extends BaseReferenceObject {
    constructor(token: string) {
        super(token);
        const grid = deserializeRangeWithSheetWithCache(token);
        this.setForcedUnitIdDirect(grid.unitId);
        this.setForcedSheetName(grid.sheetName);
        const range: IRange = {
            ...grid.range,
            startColumn: Number.NaN,
            startRow: grid.range.startRow,
            endColumn: Number.NaN,
            endRow: grid.range.endRow,
            rangeType: RANGE_TYPE.ROW,
        };
        this.setRangeData(range);
    }

    override isRow() {
        return true;
    }

    override unionBy(referenceObject: BaseReferenceObject) {
        if (!referenceObject.isRow()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const rowReferenceObject = referenceObject as RowReferenceObject;
        if (rowReferenceObject.getForcedSheetName() !== undefined && rowReferenceObject.getForcedSheetName() !== '') {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const currentRangeData = this.getRangeData();

        // if (currentRangeData.endRow !== -1) {
        //     return ErrorValueObject.create(ErrorType.REF);
        // }
        const newRowRange = rowReferenceObject.getRangeData();

        const newRow = newRowRange.startRow;

        // if the row is already in the range, return the same object
        if (newRow >= currentRangeData.startRow && newRow <= currentRangeData.endRow) {
            return this;
        }

        const row = currentRangeData.startRow;

        if (newRow > row) {
            currentRangeData.endRow = newRow;
        } else {
            currentRangeData.startRow = newRow;
            currentRangeData.endRow = row;
        }

        if (newRowRange.startAbsoluteRefType) {
            currentRangeData.endAbsoluteRefType = newRowRange.startAbsoluteRefType;
        }

        currentRangeData.rangeType = RANGE_TYPE.ROW;

        this.setToken(`${this.getToken()}${matchToken.COLON}${rowReferenceObject.getToken()}`);

        return this;
    }
}
