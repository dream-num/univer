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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class T extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(value: BaseValueObject): BaseValueObject {
        let _value = value;

        if (value.isArray()) {
            _value = (value as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_value.isError()) {
            return _value;
        }

        if (_value.isNull() || _value.isBoolean() || _value.isNumber()) {
            return StringValueObject.create('');
        }

        return _value;
    }
}
