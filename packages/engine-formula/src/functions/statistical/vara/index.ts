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

import { isRealNum, type Nullable } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { createNewArray } from '../../../engine/utils/array-object';
import { convertTonNumber } from '../../../engine/utils/object-covert';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject } from '../../..';

export class Vara extends BaseFunction {
    override calculate(...variants: BaseValueObject[]) {
        if (variants.length === 0) {
            return new ErrorValueObject(ErrorType.NA);
        }

        const flattenValues: BaseValueObject[][] = [];
        flattenValues[0] = [];

        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isError()) {
                return variant;
            }

            if (variant.isString()) {
                const value = variant.getValue();
                const isStringNumber = isRealNum(value);

                if (!isStringNumber) {
                    return new ErrorValueObject(ErrorType.VALUE);
                }

                variant = new NumberValueObject(value);
            }

            if (variant.isBoolean()) {
                variant = convertTonNumber(variant);
            }

            if (variant.isArray()) {
                let errorValue: Nullable<BaseValueObject>;

                (variant as ArrayValueObject).iterator((valueObject) => {
                    if (valueObject == null || valueObject.isNull()) {
                        return true;
                    }

                    // Including logical values
                    if (valueObject.isBoolean()) {
                        valueObject = convertTonNumber(valueObject);
                    }

                    // Including number string
                    if (valueObject.isString()) {
                        const value = Number(valueObject.getValue());

                        // Non-text numbers also need to be counted to the sample size
                        valueObject = new NumberValueObject(isNaN(value) ? 0 : value);
                    }

                    if (valueObject.isError()) {
                        errorValue = valueObject;
                        return false;
                    }

                    flattenValues[0].push(valueObject);
                });

                if (errorValue?.isError()) {
                    return errorValue;
                }
            } else if (!variant.isNull()) {
                flattenValues[0].push(variant);
            }
        }

        const newArray = createNewArray(flattenValues, 1, flattenValues[0].length);

        return newArray.var(1);
    }
}
