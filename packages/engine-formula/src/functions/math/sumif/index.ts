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
import type { BaseReferenceObject } from '../../../engine/reference-object/base-reference-object';
import { valueObjectCompare } from '../../../engine/utils/object-compare';
import { type ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import type { StringValueObject } from '../../../engine/value-object/primitive-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sumif extends BaseFunction {
    override calculate(...variants: BaseValueObject[]) {
        // 1. Check whether the number of parameters is correct,
        // TODO@Dushusir: Report the allowed parameter number range and the actual number of parameters
        if (variants.length < 2 || variants.length > 3) {
            return new ErrorValueObject(ErrorType.NA);
        }

        const range = variants[0];
        const criteria = variants[1];
        const sumRange = variants[2];

        // 2. Check whether all parameter types meet the requirements
        if (range.isError() || criteria.isError() || (sumRange && sumRange.isError())) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        let accumulatorAll: BaseValueObject = new NumberValueObject(0);

        if (range.isReferenceObject() || (range.isValueObject() && range.isArray())) {
            // TODO@Dushusir: criteria is referenceObject,stringValueObject,numberValueObject
            const resultArrayObject = valueObjectCompare(range as unknown as BaseReferenceObject, criteria);

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
        } else if (criteria.isValueObject()) {
            // TODO@Dushusir: criteria is referenceObject
            accumulatorAll = this._validator(range, criteria as StringValueObject);
        }

        return accumulatorAll;
    }

    private _validator(rangeValue: BaseValueObject, criteriaValue: StringValueObject) {
        const criteriaValueString = criteriaValue.getValue();
        if (criteriaValueString) {
            // TODO@Dushusir: support ==, !=, >, >=, <, <=, <>, *, ?, ~?, ~*
            const token = criteriaValueString.substring(0, 1) as compareToken;
            const criteriaString = criteriaValueString.substring(1);
            // TODO@Dushusir: support string value
            const validator = rangeValue.compare(new NumberValueObject(criteriaString), token);
            const validatorValue = validator.getValue();
            if (!validatorValue) {
                rangeValue = new NumberValueObject(0);
            }
        }

        return rangeValue;
    }
}
