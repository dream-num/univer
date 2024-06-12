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

    override calculate(variant1: any, variant2: BaseValueObject) {
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

        // Assuming variant1 and variant2 can be arrays of different lengths
        let array1 = Array.isArray(variant1) ? variant1 : [variant1];
        let array2 = Array.isArray(variant2) ? variant2 : [variant2];

        const length1 = array1.length;
        const length2 = array2.length;

        if (length1 !== length2) {
            if (length1 < length2) {
                array1 = expandArray(array1, length2);
            } else {
                array2 = expandArray(array2, length1);
            }
        }

        const results = [];
        for (let i = 0; i < array1.length; i++) {
            const result = atan2(array1[i] as BaseValueObject, array2[i] as BaseValueObject);
            if (result.isError()) {
                return result;
            }
            results.push(result);
        }

        return results.length === 1 ? results[0] : results;
    }
}

function expandArray(arr: BaseValueObject[], targetLength: number): BaseValueObject[] {
    const result = [];
    while (result.length < targetLength) {
        for (let i = 0; i < arr.length && result.length < targetLength; i++) {
            result.push(arr[i]);
        }
    }
    return result;
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
