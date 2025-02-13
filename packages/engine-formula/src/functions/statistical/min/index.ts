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

import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Min extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]) {
        let accumulatorAll: BaseValueObject = NumberValueObject.create(Number.POSITIVE_INFINITY);
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isNull()) {
                continue;
            }

            if (variant.isString() || variant.isBoolean()) {
                variant = variant.convertToNumberObjectValue();
            }

            if (variant.isArray()) {
                variant = variant.min();
            }

            if (variant.isError()) {
                return variant as ErrorValueObject;
            }

            accumulatorAll = this._validator(accumulatorAll, variant as BaseValueObject);
        }

        if (accumulatorAll.getValue() === Number.POSITIVE_INFINITY) {
            return NumberValueObject.create(0);
        }

        return accumulatorAll;
    }

    private _validator(accumulatorAll: BaseValueObject, valueObject: BaseValueObject) {
        const validator = accumulatorAll.isGreaterThan(valueObject);

        let _accumulatorAll = accumulatorAll;

        if (validator.getValue()) {
            _accumulatorAll = valueObject;
        }

        return _accumulatorAll;
    }
}
