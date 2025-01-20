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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import type { FormulaDataModel } from '../../../models/formula-data.model';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Formulatext extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override needsReferenceObject = true;

    override needsFormulaDataModel = true;

    override calculate(reference: FunctionVariantType) {
        if (!reference.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const unitId = (reference as BaseReferenceObject).getUnitId();
        const sheetId = (reference as BaseReferenceObject).getSheetId();
        const unitData = (reference as BaseReferenceObject).getUnitData();
        const cellData = unitData[unitId]?.[sheetId]?.cellData;
        const { startRow, startColumn } = (reference as BaseReferenceObject).getRangePosition();

        const referenceObject = (reference as BaseReferenceObject).toArrayValueObject();

        const resultArray = referenceObject.mapValue((_, rowIndex, columnIndex) => {
            const cellValue = cellData.getValue(startRow + rowIndex, startColumn + columnIndex);

            if (cellValue?.f || cellValue?.si) {
                const formulaString = (this._formulaDataModel as FormulaDataModel).getFormulaStringByCell(startRow + rowIndex, startColumn + columnIndex, sheetId, unitId);

                return StringValueObject.create(formulaString as string);
            }

            return ErrorValueObject.create(ErrorType.NA);
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
