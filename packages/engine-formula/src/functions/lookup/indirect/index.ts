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

import type { BaseReferenceObject } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../basics/error-type';
import { regexTestColumn, regexTestRow, regexTestSingeRange } from '../../../basics/regex';
import { operatorToken } from '../../../basics/token';
import { CellReferenceObject } from '../../../engine/reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../../../engine/reference-object/column-reference-object';
import { RangeReferenceObject } from '../../../engine/reference-object/range-reference-object';
import { RowReferenceObject } from '../../../engine/reference-object/row-reference-object';
import { deserializeRangeForR1C1 } from '../../../engine/utils/r1c1-reference';

import { deserializeRangeWithSheetWithCache } from '../../../engine/utils/reference-cache';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Indirect extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override isAddress() {
        return true;
    }

    override calculate(refText: BaseValueObject, a1?: BaseValueObject) {
        if (refText.isError()) {
            return refText;
        }

        if (a1?.isError()) {
            return a1;
        }

        let a1Value = this.getZeroOrOneByOneDefault(a1);

        if (a1Value == null) {
            a1Value = 1;
        }

        let _refText = refText;

        if (refText.isArray()) {
            const rowCount = (refText as ArrayValueObject).getRowCount();
            const columnCount = (refText as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                // TODO
                return refText.map(() => {
                    return ErrorValueObject.create(ErrorType.VALUE);
                });
            }

            _refText = (refText as ArrayValueObject).getFirstCell();
        }

        return this._handleSingleObject(_refText, a1Value);
    }

    private _handleSingleObject(refTextObject: BaseValueObject, a1Value: number) {
        const refTextValue = `${refTextObject.getValue()}`;

        if (refTextValue.trim() === '') {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const refTextV = this._convertToDefinedName(refTextValue);

        if (a1Value === 0) {
            const gridRange = deserializeRangeForR1C1(refTextV);

            const { range, sheetName, unitId } = gridRange;

            const rangeReferenceObject = new RangeReferenceObject(range);

            rangeReferenceObject.setForcedUnitIdDirect(unitId);
            rangeReferenceObject.setForcedSheetName(sheetName);

            return this._setDefault(rangeReferenceObject);
        }

        if (regexTestSingeRange(refTextV)) {
            return this._setDefault(new CellReferenceObject(refTextV));
        }
        if (regexTestRow(refTextV)) {
            return this._setDefault(new RowReferenceObject(refTextV));
        }

        if (regexTestColumn(refTextV)) {
            return this._setDefault(new ColumnReferenceObject(refTextV));
        }

        const gridRange = deserializeRangeWithSheetWithCache(refTextV);

        const { range, sheetName, unitId } = gridRange;

        if (Number.isNaN(range.startRow) || range.endRow + 1 > 1048576 || Number.isNaN(range.startColumn) || range.endColumn + 1 > 16384) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const rangeReferenceObject = new RangeReferenceObject(range);

        rangeReferenceObject.setForcedUnitIdDirect(unitId);
        rangeReferenceObject.setForcedSheetName(sheetName);

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

    /**
     * In Excel, to inject a defined name into a function that has positioning capabilities,
     * such as using the INDIRECT function to reference a named range,
     * you can write it as follows:
     * =INDIRECT("DefinedName1")
     */
    private _convertToDefinedName(refText: string) {
        const definedName = this.getDefinedName(refText);
        if (definedName == null) {
            return refText;
        }

        const formulaOrRefString = definedName.formulaOrRefString;

        if (formulaOrRefString == null) {
            return refText;
        }

        if (formulaOrRefString.startsWith(operatorToken.EQUALS)) {
            return formulaOrRefString.slice(1);
        }

        return formulaOrRefString;
    }
}
