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
import type { BaseReferenceObject } from '../../../engine/reference-object/base-reference-object';
import { RangeReferenceObject } from '../../../engine/reference-object/range-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
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
        if (reference == null || rows == null || columns == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (reference.isError()) {
            return reference;
        }

        if (rows.isError()) {
            return rows;
        }

        if (columns.isError()) {
            return columns;
        }

        if (height?.isError()) {
            return height;
        }

        if (width?.isError()) {
            return width;
        }

        if (!reference.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const row = (reference as ArrayValueObject).getCurrentRow();
        const column = (reference as ArrayValueObject).getCurrentColumn();
        const rowOffset = this.getIndexNumValue(rows);
        const columnOffset = this.getIndexNumValue(columns);

        if (typeof rowOffset !== 'number' || typeof columnOffset !== 'number') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const targetRow = row + rowOffset;
        const targetColumn = column + columnOffset;

        if (targetRow < 0 || targetColumn < 0 || targetRow > 1048576 || targetColumn > 16384) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const heightCount = (height && this.getIndexNumValue(height)) ?? 1;
        const widthCount = (width && this.getIndexNumValue(width)) ?? 1;

        if (typeof heightCount !== 'number' || typeof widthCount !== 'number') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (heightCount === 0 || widthCount === 0) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const targetRowWithHeight = heightCount > 0 ? targetRow + heightCount - 1 : targetRow + heightCount + 1;
        const targetColumnWithWidth = widthCount > 0 ? targetColumn + widthCount - 1 : targetColumn + widthCount + 1;

        if (targetRowWithHeight < 0 || targetColumnWithWidth < 0 || targetRowWithHeight > 1048576 || targetColumnWithWidth > 16384) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const startRow = targetRow < targetRowWithHeight ? targetRow : targetRowWithHeight;
        const startColumn = targetColumn < targetColumnWithWidth ? targetColumn : targetColumnWithWidth;
        const endRow = targetRow > targetRowWithHeight ? targetRow : targetRowWithHeight;
        const endColumn = targetColumn > targetColumnWithWidth ? targetColumn : targetColumnWithWidth;

        const range = {
            startRow,
            startColumn,
            endRow,
            endColumn,
        };

        const unitId = (reference as ArrayValueObject).getUnitId();
        const sheetId = (reference as ArrayValueObject).getSheetId();
        const sheetName = (reference as ArrayValueObject).getSheetName();

        const rangeReferenceObject = new RangeReferenceObject(sheetName, range, sheetId, unitId);

        return this._setDefault(rangeReferenceObject);
    }

    private _setDefault(object: BaseReferenceObject) {
        if (this.unitId == null || this.subUnitId == null) {
            return ErrorValueObject.create(ErrorType.REF);
        }
        object.setDefaultUnitId(this.unitId);
        object.setDefaultSheetId(this.subUnitId);
        return object;
    }
}
