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
import { isFormulaId, isFormulaString } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Anchorarray extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override needsReferenceObject = true;

    override calculate(reference: FunctionVariantType) {
        if (reference.isError()) {
            return reference;
        }
        if (!reference.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const anchor = reference as BaseReferenceObject;
        return resolveSpillAnchor(anchor, (range) => this.createReferenceObject(anchor, range));
    }
}

export function resolveSpillAnchor(
    anchor: BaseReferenceObject,
    createReference: (range: IRange) => BaseReferenceObject | ErrorValueObject
): BaseReferenceObject | ErrorValueObject {
    const { startRow, startColumn, endRow, endColumn } = anchor.getRangePosition();
    if (startRow !== endRow || startColumn !== endColumn || (anchor.getForcedSheetName() && !anchor.getForcedSheetId())) {
        return ErrorValueObject.create(ErrorType.REF);
    }

    const current = anchor.getCurrentRuntimeActiveArrayFormulaRange()?.[startRow]?.[startColumn];
    // An anchor already recalculated as a scalar must not reuse its old spill extent.
    const range = current || anchor.getCurrentRuntimeSheetData()?.getValue(startRow, startColumn) != null
        ? current
        : anchor.getCurrentActiveArrayFormulaRange()?.[startRow]?.[startColumn];
    if (range != null && anchor.getCellData(startRow, startColumn)?.v !== ErrorType.SPILL) {
        return createReference(range);
    }

    const source = anchor.getCurrentActiveSheetData()?.cellData.getValue(startRow, startColumn);
    return isFormulaString(source?.f) || isFormulaId(source?.si) ? anchor : ErrorValueObject.create(ErrorType.REF);
}
