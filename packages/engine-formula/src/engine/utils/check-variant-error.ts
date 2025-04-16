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

import type { ArrayValueObject } from '../value-object/array-value-object';
import { ErrorType } from '../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../value-object/base-value-object';

export function checkVariantErrorIsArray(variant: BaseValueObject): BaseValueObject {
    let _variant = variant;

    if (variant.isArray()) {
        const rowCount = (variant as ArrayValueObject).getRowCount();
        const columnCount = (variant as ArrayValueObject).getColumnCount();

        if (rowCount > 1 || columnCount > 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        _variant = (variant as ArrayValueObject).get(0, 0) as BaseValueObject;
    }

    if (_variant.isError()) {
        return _variant;
    }

    return _variant;
}

export function checkVariantsErrorIsArray(...variants: BaseValueObject[]) {
    for (let i = 0; i < variants.length; i++) {
        const variant = checkVariantErrorIsArray(variants[i]);

        if (variant.isError()) {
            return {
                isError: true,
                errorObject: variant,
            };
        }

        variants[i] = variant;
    }

    return {
        isError: false,
        variants,
    };
}

export function checkVariantsErrorIsArrayOrBoolean(...variants: BaseValueObject[]) {
    for (let i = 0; i < variants.length; i++) {
        const variant = checkVariantErrorIsArray(variants[i]);

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

// All variants cannot be null.
export function checkVariantsErrorIsNullorArrayOrBoolean(...variants: BaseValueObject[]) {
    for (let i = 0; i < variants.length; i++) {
        let variant = variants[i];

        if (variant.isError()) {
            return {
                isError: true,
                errorObject: variant,
            };
        }

        if (variant.isNull()) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.NA),
            };
        }

        variant = checkVariantErrorIsArray(variants[i]);

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

export function checkVariantsErrorIsStringToNumber(...variants: BaseValueObject[]) {
    for (let i = 0; i < variants.length; i++) {
        let variant = variants[i];

        if (variant.isString()) {
            variant = variant.convertToNumberObjectValue();
        }

        if (variant.isError()) {
            return {
                isError: true,
                errorObject: variant,
            };
        }

        variants[i] = variant;
    }

    return {
        isError: false,
        variants,
    };
}
