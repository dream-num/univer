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

export class Product extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]) {
        let accumulatorAll: BaseValueObject = NumberValueObject.create(1);
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isNull()) {
                continue;
            }

            if (variant.isString()) {
                variant = variant.convertToNumberObjectValue();
            }

            if (variant.isArray()) {
                variant = this._multiplyArray(variant as ArrayValueObject);
            }

            if (variant.isError()) {
                return variant as ErrorValueObject;
            }

            accumulatorAll = accumulatorAll.multiply(variant);

            if (accumulatorAll.isError()) {
                return accumulatorAll;
            }
        }

        return accumulatorAll;
    }

    private _multiplyArray(array: ArrayValueObject) {
        let result: BaseValueObject = NumberValueObject.create(1);
        array.iterator((valueObject) => {
            // 'test', ' ',  blank cell, TRUE and FALSE are ignored
            if (valueObject == null || valueObject.isString() || valueObject.isBoolean() || valueObject.isNull()) {
                return true; // continue
            }

            if (valueObject.isError()) {
                result = valueObject;
                return false; // break
            }

            result = (result as NumberValueObject).multiply(
                valueObject as BaseValueObject
            ) as BaseValueObject;
        });

        return result;
    }
}
