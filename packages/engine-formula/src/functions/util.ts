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
import type { BaseValueObject, ErrorValueObject } from '../engine/value-object/base-value-object';

export function getObjectValue(result: FunctionVariantType) {
    if ((result as ErrorValueObject).isError()) {
        return (result as ErrorValueObject).getValue();
    } else if ((result as BaseReferenceObject).isReferenceObject()) {
        return (result as BaseReferenceObject).toArrayValueObject().toValue();
    } else if ((result as ArrayValueObject).isArray()) {
        return (result as ArrayValueObject).toValue();
    }
    return (result as BaseValueObject).getValue();
}
