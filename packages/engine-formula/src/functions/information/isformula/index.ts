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

import { ErrorType } from '../../../basics/error-type';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Isformula extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override needsReferenceObject = true;

    override calculate(reference: FunctionVariantType): BaseValueObject {
        if (reference.isError()) {
            return reference as ErrorValueObject;
        }

        if (!reference.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const cellDataMatrix = (reference as BaseReferenceObject).getCurrentActiveSheetData()?.cellData.getMatrix();
        const { startRow, startColumn } = (reference as BaseReferenceObject).getRangePosition();

        const _reference = (reference as BaseReferenceObject).toArrayValueObject();

        const resultArray = _reference.mapValue((valueObject, rowIndex, columnIndex) => {
            const cellData = cellDataMatrix?.[startRow + rowIndex]?.[startColumn + columnIndex];

            if (cellData?.f || cellData?.si) {
                return BooleanValueObject.create(true);
            }

            return BooleanValueObject.create(false);
        });

        if (_reference.getRowCount() === 1 && _reference.getColumnCount() === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
