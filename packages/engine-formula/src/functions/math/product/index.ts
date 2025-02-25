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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Product extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]) {
        let accumulatorAll: BaseValueObject = NumberValueObject.create(1);
        let noCalculate = true;

        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isError()) {
                return variant;
            }

            if (variant.isArray()) {
                let isError = false;
                let errorObject: ErrorValueObject | null = null;

                (variant as ArrayValueObject).iterator((valueObject) => {
                    if (valueObject?.isError()) {
                        isError = true;
                        errorObject = valueObject as ErrorValueObject;
                        return false;
                    }

                    // cell range ignore string, boolean, blank cell
                    if (!valueObject || valueObject.isNull() || valueObject.isString() || valueObject.isBoolean()) {
                        return true;
                    }

                    accumulatorAll = accumulatorAll.multiply(valueObject);
                    noCalculate = false;
                });

                if (isError) {
                    return errorObject!;
                }
            } else {
                if (variant.isNull()) {
                    continue;
                }

                // not cell reference, number string and boolean can be calculated
                if (variant.isString()) {
                    variant = variant.convertToNumberObjectValue();
                }

                if (variant.isError()) {
                    return variant;
                }

                accumulatorAll = accumulatorAll.multiply(variant);
                noCalculate = false;
            }

            if (accumulatorAll.isError()) {
                return accumulatorAll;
            }
        }

        // if all params is ignored, return 0
        if (noCalculate) {
            return NumberValueObject.create(0);
        }

        return accumulatorAll;
    }
}
