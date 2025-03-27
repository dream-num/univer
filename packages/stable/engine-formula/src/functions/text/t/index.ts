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
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class T extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override needsReferenceObject = true;

    override calculate(value: FunctionVariantType): BaseValueObject {
        let _value = value;

        // If the parameter is a reference object, get the first value from the reference object
        if (value.isReferenceObject()) {
            _value = (value as BaseReferenceObject).toArrayValueObject().get(0, 0) as BaseValueObject;
        }

        // If the parameter is an array, return an array result
        if (_value.isArray()) {
            return (_value as ArrayValueObject).mapValue((valueObject) => this._handleSingleObject(valueObject));
        }

        return this._handleSingleObject(_value as BaseValueObject);
    }

    private _handleSingleObject(value: BaseValueObject): BaseValueObject {
        if (value.isError()) {
            return value;
        }

        if (value.isNull() || value.isBoolean() || value.isNumber()) {
            return StringValueObject.create('');
        }

        return value;
    }
}
