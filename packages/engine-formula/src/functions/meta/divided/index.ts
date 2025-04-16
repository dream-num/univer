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

import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Divided extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(variant1: BaseValueObject, variant2: BaseValueObject) {
        if (variant1.isError()) {
            return variant1;
        }

        if (variant2.isError()) {
            return variant2;
        }

        if (!variant2.isArray() && variant2.getValue() === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return variant1.divided(variant2);
    }
}
