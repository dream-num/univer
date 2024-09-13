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
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';

export class Quotient extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(numerator: BaseValueObject, denominator: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(numerator, denominator);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numeratorObject, denominatorObject] = variants as BaseValueObject[];

        const numeratorValue = +numeratorObject.getValue();
        const denominatorValue = +denominatorObject.getValue();

        if (Number.isNaN(numeratorValue) || Number.isNaN(denominatorValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (denominatorValue === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        const result = Math.trunc(numeratorValue / denominatorValue);

        return NumberValueObject.create(result);
    }
}
