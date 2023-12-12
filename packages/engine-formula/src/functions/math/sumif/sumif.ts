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
import type { compareToken } from '../../../basics/token';
import { ErrorValueObject } from '../../../engine/other-object/error-value-object';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { valueObjectCompare } from '../../../engine/utils/object-compare';
import { type ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import type { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sumif extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        // 1. Check whether the number of parameters is correct,
        // TODO@Dushusir: Report the allowed parameter number range and the actual number of parameters
        if (variants.length < 2 || variants.length > 3) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const range = variants[0];
        const criteria = variants[1];
        const sumRange = variants[2];

        // 2. Check whether all parameter types meet the requirements
        if (range.isErrorObject() || criteria.isErrorObject() || (sumRange && sumRange.isErrorObject())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let accumulatorAll: BaseValueObject = new NumberValueObject(0);

        if (range.isReferenceObject() || (range.isValueObject() && (range as BaseValueObject).isArray())) {
            // TODO@Dushusir: criteria is referenceObject
            const resultArrayObject = valueObjectCompare(range as BaseReferenceObject, criteria as BaseValueObject);

            const resultArrayValue = (resultArrayObject as ArrayValueObject).getArrayValue();

            const sumRangeValue = (sumRange || range) as BaseReferenceObject | ArrayValueObject;
            const { startRow, startColumn } = sumRangeValue.getRangePosition();

            sumRangeValue.iterator((valueObject, row, column) => {
                if (!valueObject.isErrorObject()) {
                    const arrayValue = resultArrayValue[row - startRow][column - startColumn] as BaseValueObject;
                    const accumulator = arrayValue.getValue()
                        ? (valueObject as BaseValueObject)
                        : new NumberValueObject(0);
                    accumulatorAll = accumulatorAll.plus(accumulator) as BaseValueObject;
                }
            });
        } else if (criteria.isValueObject()) {
            // TODO@Dushusir: criteria is referenceObject
            accumulatorAll = this._validator(range as BaseValueObject, criteria as BaseValueObject);
        }

        return accumulatorAll;
    }

    private _validator(rangeValue: BaseValueObject, criteriaValue: BaseValueObject) {
        const criteriaValueString = criteriaValue.getValue();
        if (criteriaValueString) {
            // TODO@Dushusir: support ==, !=, >, >=, <, <=, <>, *, ?, ~?, ~*
            const token = (criteriaValueString as string).substring(0, 1) as compareToken;
            const criteriaString = (criteriaValueString as string).substring(1);
            // TODO@Dushusir: support string value
            const validator = rangeValue.compare(new NumberValueObject(criteriaString), token) as BooleanValueObject;
            const validatorValue = validator.getValue();
            if (!validatorValue) {
                rangeValue = new NumberValueObject(0);
            }
        }

        return rangeValue;
    }
}
