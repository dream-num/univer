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

import { ErrorType } from '../../../basics/error-type';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Iseven extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(value: BaseValueObject) {
        if (value.isArray() || value.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (!value.isNumber()) {
            value = value.convertToNumberObjectValue();
            if (!value.isNumber()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
        }

        const val = value.getValue() as number;
        const floored = Math.floor(Math.abs(val));
        return BooleanValueObject.create(floored % 2 === 0);
    }
}
