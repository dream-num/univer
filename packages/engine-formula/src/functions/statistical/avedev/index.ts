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

import type { Nullable } from '@univerjs/core';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { createNewArray } from '../../../engine/utils/array-object';
import { ErrorType } from '../../../basics/error-type';

export class Avedev extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]) {
        let accumulatorSum: BaseValueObject = NumberValueObject.create(0);
        let accumulatorCount: BaseValueObject = NumberValueObject.create(0);

         // First, calculate the average
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isString()) {
                variant = variant.convertToNumberObjectValue();
            }

            if (variant.isError()) {
                return variant;
            }

            if (variant.isArray()) {
                variant = filterNumberValueObject(variant as ArrayValueObject);

                if (variant.isError()) {
                    return variant;
                }

                variants[i] = variant;
                accumulatorSum = accumulatorSum.plus(variant.sum());

                if (accumulatorSum.isError()) {
                    return accumulatorSum;
                }

                accumulatorCount = accumulatorCount.plus(variant.count());
            } else if (!variant.isNull()) {
                accumulatorSum = accumulatorSum.plus(variant);
                accumulatorCount = accumulatorCount.plus(NumberValueObject.create(1));
            }
        }

        // If there is no data in the range, this calculation cannot be performed and a #NUM! error will be generated.
        if (accumulatorCount.getValue() === 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const average = accumulatorSum.divided(accumulatorCount);
        if (average.isError()) {
            return average;
        }

         // Then, calculate the average of the absolute deviations from the average
        let accumulatorAveDev: BaseValueObject = NumberValueObject.create(0);
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isString()) {
                variant = variant.convertToNumberObjectValue();
            }

            if (variant.isError()) {
                return variant;
            }

            if (variant.isArray()) {
                // ignore strings and booleans
                // const { newArray, count } = ignoreStringAndBoolean(variant as ArrayValueObject);
                // variant = newArray;
                // accumulatorCount = accumulatorCount.minus(NumberValueObject.create(count));

                accumulatorAveDev = accumulatorAveDev.plus(variant.minus(average).abs().sum());
                if (accumulatorAveDev.isError()) {
                    return accumulatorAveDev;
                }
            } else if (!variant.isNull()) {
                accumulatorAveDev = accumulatorAveDev.plus(variant.minus(average).abs());
            }
        }

        return accumulatorAveDev.divided(accumulatorCount);
    }
}

/**
 * Filter the number value object from the array
 * @param array
 * @returns
 */
function filterNumberValueObject(array: ArrayValueObject) {
    const newArray: BaseValueObject[][] = [];
    newArray[0] = [];

    let isError: ErrorValueObject | null = null;

    array.iterator((valueObject: Nullable<BaseValueObject>, _rowIndex: number, _columnIndex: number) => {
        if (valueObject?.isError()) {
            isError = valueObject as ErrorValueObject;
            return false;
        }

        if (valueObject?.isNumber()) {
            newArray[0].push(valueObject);
        }
    });

    if (isError) {
        return isError;
    }

    return createNewArray(newArray, 1, newArray[0].length);
}
