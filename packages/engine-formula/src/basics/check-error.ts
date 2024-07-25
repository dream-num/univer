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

import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import { ErrorType } from './error-type';

export function checkVariantsErrorIsArrayOrBoolean(...variants: BaseValueObject[]) {
    for (let i = 0; i < variants.length; i++) {
        let variant = variants[i];

        if (variant.isArray()) {
            const rowCount = (variant as ArrayValueObject).getRowCount();
            const columnCount = (variant as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                };
            }

            variant = (variant as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (variant.isError()) {
            return {
                isError: true,
                errorObject: variant,
            };
        }

        if (variant.isBoolean()) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        variants[i] = variant;
    }

    return {
        isError: false,
        variants,
    };
}
