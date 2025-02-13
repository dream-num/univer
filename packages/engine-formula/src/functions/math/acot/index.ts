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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Acot extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(variant: BaseValueObject) {
        let _variant = variant;

        if (_variant.isString()) {
            _variant = _variant.convertToNumberObjectValue();
        }

        if (_variant.isError()) {
            return _variant;
        }

        if ((_variant as BaseValueObject).isArray()) {
            return (_variant as BaseValueObject).map((currentValue) => {
                if (currentValue.isError()) {
                    return currentValue;
                }
                return acot(currentValue as BaseValueObject);
            });
        }

        return acot(_variant as BaseValueObject);
    }
}

function acot(num: BaseValueObject) {
    let currentValue = num.getValue();

    if (num.isBoolean()) {
        currentValue = currentValue ? 1 : 0;
    }

    if (!Number.isFinite(currentValue)) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    currentValue = Number(currentValue);

    let result = Math.atan(1 / currentValue);

    // When the input value is negative, adjust the result to [0, π]
    if (currentValue < 0) {
        result += Math.PI;
    }

    if (Number.isNaN(result)) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    return NumberValueObject.create(result);
}
