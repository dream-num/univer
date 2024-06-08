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
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Atan2 extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(variant1: BaseValueObject, variant2: BaseValueObject) {
        if (variant1.isString()) {
            variant1 = variant1.convertToNumberObjectValue();
        }

        if (variant2.isString()) {
            variant2 = variant2.convertToNumberObjectValue();
        }

        if (variant1.isError()) {
            return variant1;
        }

        if (variant2.isError()) {
            return variant2;
        }

        return atan2(variant1 as BaseValueObject, variant2 as BaseValueObject);
    }
}

function atan2(num1: BaseValueObject, num2: BaseValueObject) {
    let currentValue1 = num1.getValue();
    let currentValue2 = num2.getValue();

    if (num1.isBoolean()) {
        currentValue1 = currentValue1 ? 1 : 0;
    }

    if (num2.isBoolean()) {
        currentValue2 = currentValue2 ? 1 : 0;
    }

    if (!Number.isFinite(currentValue1) || !Number.isFinite(currentValue2)) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    const result = Math.atan2(Number(currentValue1), Number(currentValue2));

    if (Number.isNaN(result)) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    return NumberValueObject.create(result);
}
