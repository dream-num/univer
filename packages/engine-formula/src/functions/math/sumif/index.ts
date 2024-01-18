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
import type { BaseReferenceObject } from '../../../engine/reference-object/base-reference-object';
import { valueObjectCompare } from '../../../engine/utils/object-compare';
import { type ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sumif extends BaseFunction {
    override calculate(...variants: BaseValueObject[]) {
        // 1. Check whether the number of parameters is correct,
        // TODO@Dushusir: Report the allowed parameter number range and the actual number of parameters
        if (variants.length < 2 || variants.length > 3) {
            return new ErrorValueObject(ErrorType.NA);
        }

        let range = variants[0];
        let criteria = variants[1];
        let sumRange = variants[2];

        // 2. Check whether all parameter types meet the requirements
        if (range.isError() || criteria.isError() || (sumRange && sumRange.isError())) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        let accumulatorAll: BaseValueObject = new NumberValueObject(0);

        if (range.isReferenceObject()) {
            range = (range as unknown as BaseReferenceObject).toArrayValueObject();
        }
        if (criteria.isReferenceObject()) {
            criteria = (criteria as unknown as BaseReferenceObject).toArrayValueObject();
        }
        if (sumRange && sumRange.isReferenceObject()) {
            sumRange = (sumRange as unknown as BaseReferenceObject).toArrayValueObject();
        }

        const resultArrayObject = valueObjectCompare(range, criteria);
        const resultArrayValue = resultArrayObject.getArrayValue();

        const sumRangeValue = (sumRange || range) as BaseReferenceObject | ArrayValueObject;
        const { startRow, startColumn } = sumRangeValue.getRangePosition();

        sumRangeValue.iterator((valueObject, row, column) => {
            if (!valueObject) return;

            if (!valueObject?.isError()) {
                const arrayValue = resultArrayValue[row - startRow][column - startColumn];
                const accumulator = arrayValue.getValue() ? valueObject : new NumberValueObject(0);
                accumulatorAll = accumulatorAll.plus(accumulator);
            }
        });

        return accumulatorAll;
    }
}
