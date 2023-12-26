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
import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Min extends BaseFunction {
    override calculate(...variants: BaseValueObject[]) {
        let accumulatorAll: BaseValueObject = new NumberValueObject(Infinity);
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isError()) {
                return variant as ErrorValueObject;
            }

            if (variant.isArray()) {
                variant = (variant as ArrayValueObject).min();
            }

            if (variant.isNull()) {
                continue;
            }

            accumulatorAll = this._validator(accumulatorAll, variant as BaseValueObject);

            // if (variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray())) {
            //     (variant as BaseReferenceObject | ArrayValueObject).iterator((valueObject, row, column) => {
            //         if (!valueObject.isError() && !(valueObject as BaseValueObject).isString()) {
            //             accumulatorAll = this._validator(accumulatorAll, valueObject as BaseValueObject);
            //         }
            //     });
            // } else if (!(variant as BaseValueObject).isString()) {
            //     accumulatorAll = this._validator(accumulatorAll, variant as BaseValueObject);
            // }
        }

        return accumulatorAll;
    }

    private _validator(accumulatorAll: BaseValueObject, valueObject: BaseValueObject) {
        const validator = accumulatorAll.isGreaterThan(valueObject);
        if (validator.getValue()) {
            accumulatorAll = valueObject;
        }
        return accumulatorAll;
    }
}
