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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { MAX_COLUMN_COUNT } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { MultiAreaReferenceObject } from '../../../engine/reference-object/multi-area-reference-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Columns extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override needsReferenceObject = true;

    override calculate(
        referenceInput: FunctionVariantType
    ) {
        if (referenceInput instanceof MultiAreaReferenceObject) {
            if (!referenceInput.isArrayOfReferences()) {
                return ErrorValueObject.create(ErrorType.REF);
            }
        } else if (referenceInput.isReferenceObject()) {
            const { startColumn, endColumn } = (referenceInput as BaseReferenceObject).getRangeData();
            const start = Number.isNaN(startColumn) ? 0 : startColumn;
            const limit = Number.isNaN(endColumn) ? MAX_COLUMN_COUNT : endColumn + 1;
            return NumberValueObject.create(limit - start);
        }
        const reference = referenceInput.isReferenceObject()
            ? (referenceInput as BaseReferenceObject).toArrayValueObject()
            : referenceInput as BaseValueObject;

        if (reference.isError()) {
            return reference;
        }

        if (reference.isString() || reference.isNumber() || reference.isBoolean()) {
            return NumberValueObject.create(1);
        }

        if (!reference.isArray()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const columnCount = (reference as ArrayValueObject).getColumnCount();

        return NumberValueObject.create(columnCount);
    }
}
