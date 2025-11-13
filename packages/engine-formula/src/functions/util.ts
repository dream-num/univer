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

import type { BaseReferenceObject, FunctionVariantType } from '../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import { stripErrorMargin } from '../engine/utils/math-kit';
import { stripArrayValue } from './__tests__/create-function-test-bed';

export function getObjectValue(result: FunctionVariantType, isUseStrip: boolean = false) {
    if (result.isReferenceObject()) {
        const arrayValue = (result as BaseReferenceObject).toArrayValueObject().toValue();

        return isUseStrip ? stripArrayValue(arrayValue) : arrayValue;
    } else if (result.isArray()) {
        const arrayValue = (result as ArrayValueObject).toValue();

        return isUseStrip ? stripArrayValue(arrayValue) : arrayValue;
    } else if ((result as BaseValueObject).isNumber()) {
        const value = (result as BaseValueObject).getValue() as number;

        return isUseStrip ? stripErrorMargin(value) : value;
    }

    return (result as BaseValueObject).getValue();
}
