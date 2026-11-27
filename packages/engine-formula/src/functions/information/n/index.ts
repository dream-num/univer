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
import type { MultiAreaReferenceObject } from '../../../engine/reference-object/multi-area-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class N extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override needsReferenceObject = true;

    override calculate(argument: FunctionVariantType): BaseValueObject {
        let value: BaseValueObject;
        if (argument.isReferenceObject()) {
            const reference = argument as BaseReferenceObject;
            value = reference.isMultiArea() && (reference as MultiAreaReferenceObject).isArrayOfReferences()
                ? reference.toArrayValueObject()
                : reference.getFirstCell();
        } else {
            value = argument as BaseValueObject;
        }
        if (value.isArray()) {
            return (value as ArrayValueObject).mapValue((item) => this._calculateSingle(item));
        }
        return this._calculateSingle(value);
    }

    private _calculateSingle(value: BaseValueObject): BaseValueObject {
        if (value.isError()) {
            return value;
        }

        if (value.isString()) {
            return NumberValueObject.create(0);
        }

        const val = +value.getValue();

        return NumberValueObject.create(val);
    }
}
