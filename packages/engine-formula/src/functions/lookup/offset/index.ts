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

import type { ArrayValueObject } from '../../..';
import { RangeReferenceObject } from '../../..';
import { ErrorType } from '../../../basics/error-type';
import type { BaseReferenceObject } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Offset extends BaseFunction {
    override calculate(
        reference: BaseValueObject,
        rows: BaseValueObject,
        columns: BaseValueObject,
        height?: BaseValueObject,
        width?: BaseValueObject
    ) {
        if (!reference.isArray()) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        const row = (reference as ArrayValueObject).getCurrentRow();
        const column = (reference as ArrayValueObject).getCurrentColumn();
        const rowOffset = this.getIndexNumValue(rows);
        const columnOffset = this.getIndexNumValue(columns);

        if (typeof rowOffset !== 'number' || typeof columnOffset !== 'number') {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        const targetRow = row + (rowOffset as number);
        const targetColumn = column + (columnOffset as number);
        const heightCount = (height && this.getIndexNumValue(height)) || 1;
        const widthCount = (width && this.getIndexNumValue(width)) || 1;

        if (typeof heightCount !== 'number' || typeof widthCount !== 'number') {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        const range = {
            startRow: targetRow,
            startColumn: targetColumn,
            endRow: targetRow + (heightCount as number) - 1,
            endColumn: targetColumn + (widthCount as number) - 1,
        };

        const unitId = (reference as ArrayValueObject).getUnitId();
        const sheetId = (reference as ArrayValueObject).getSheetId();

        const rangeReferenceObject = new RangeReferenceObject(range, sheetId, unitId);

        // TODO: test
        // TODO: edge case

        return this._setDefault(rangeReferenceObject);
    }

    private _setDefault(object: BaseReferenceObject) {
        if (this.unitId == null || this.subUnitId == null) {
            return new ErrorValueObject(ErrorType.REF);
        }
        object.setDefaultUnitId(this.unitId);
        object.setDefaultSheetId(this.subUnitId);
        return object;
    }
}
