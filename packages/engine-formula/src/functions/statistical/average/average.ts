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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject, CalculateValueType } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Average extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        let accumulatorSum: CalculateValueType = new NumberValueObject(0);
        let accumulatorCount: CalculateValueType = new NumberValueObject(0);
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isErrorObject()) {
                return variant;
            }

            if (accumulatorSum.isErrorObject()) {
                return accumulatorSum;
            }

            if (variant.isReferenceObject()) {
                variant = (variant as BaseReferenceObject).toArrayValueObject();
            }

            if ((variant as ArrayValueObject).isArray()) {
                accumulatorSum = accumulatorSum.plus((variant as ArrayValueObject).sum());
                accumulatorCount = accumulatorCount.plus((variant as ArrayValueObject).count());
            } else {
                if (!(variant as BaseValueObject).isNull()) {
                    accumulatorCount = accumulatorCount.plus(new NumberValueObject(1));
                }
            }
        }

        return accumulatorSum.divided(accumulatorCount);
    }
}
