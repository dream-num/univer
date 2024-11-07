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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArray } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Isbetween extends BaseFunction {
    override minParams = 3;

    override maxParams = 5;

    override calculate(
        valueToCompare: BaseValueObject,
        lowerValue: BaseValueObject,
        upperValue: BaseValueObject,
        lowerValueIsInclusive?: BaseValueObject,
        upperValueIsInclusive?: BaseValueObject
    ): BaseValueObject {
        const _lowerValueIsInclusive = lowerValueIsInclusive ?? BooleanValueObject.create(true);
        const _upperValueIsInclusive = upperValueIsInclusive ?? BooleanValueObject.create(true);

        const { isError, errorObject, variants } = checkVariantsErrorIsArray(valueToCompare, lowerValue, upperValue, _lowerValueIsInclusive, _upperValueIsInclusive);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [valueToCompareObject, lowerValueObject, upperValueObject, lowerValueIsInclusiveObject, upperValueIsInclusiveObject] = variants as BaseValueObject[];

        if (
            valueToCompareObject.isString() ||
            lowerValueObject.isString() ||
            upperValueObject.isString() ||
            lowerValueIsInclusiveObject.isString() ||
            upperValueIsInclusiveObject.isString()
        ) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const valueToCompareValue = +valueToCompareObject.getValue();
        const lowerValueValue = +lowerValueObject.getValue();
        const upperValueValue = +upperValueObject.getValue();
        const lowerValueIsInclusiveValue = +lowerValueIsInclusiveObject.getValue();
        const upperValueIsInclusiveValue = +upperValueIsInclusiveObject.getValue();

        if (lowerValueValue > upperValueValue) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const lowerComparison = lowerValueIsInclusiveValue ? valueToCompareValue >= lowerValueValue : valueToCompareValue > lowerValueValue;
        const upperComparison = upperValueIsInclusiveValue ? valueToCompareValue <= upperValueValue : valueToCompareValue < upperValueValue;

        return BooleanValueObject.create(lowerComparison && upperComparison);
    }
}
