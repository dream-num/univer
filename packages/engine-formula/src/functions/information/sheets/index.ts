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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { MultiAreaReferenceObject } from '../../../engine/reference-object/multi-area-reference-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sheets extends BaseFunction {
    override minParams = 0;

    override maxParams = 1;

    override needsSheetsInfo = true;

    override needsReferenceObject = true;

    override lazyIfReferenceArrayArgumentIndexes = [0];

    override calculate(reference?: FunctionVariantType): BaseValueObject {
        if (reference == null) {
            return NumberValueObject.create(this.getSheetsInfo().sheetOrder.length);
        }
        if (reference.isError()) {
            return reference as ErrorValueObject;
        }
        if (!reference.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.NA);
        }
        if (!(reference instanceof MultiAreaReferenceObject)) {
            return NumberValueObject.create(1);
        }
        const sheets = new Set<string>();
        for (const area of reference.getAreas().flat()) {
            if (area.isError()) {
                return area as ErrorValueObject;
            }
            const item = area as BaseReferenceObject;
            sheets.add(JSON.stringify([item.getUnitId(), item.getSheetId()]));
        }
        if (!reference.isSheetSpan && sheets.size > 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        return NumberValueObject.create(sheets.size);
    }
}
