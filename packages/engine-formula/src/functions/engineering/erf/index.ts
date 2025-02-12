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

import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { erf } from '../../../basics/engineering';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

export class Erf extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(lowerLimit: BaseValueObject, upperLimit?: BaseValueObject): BaseValueObject {
        let result;

        if (upperLimit) {
            const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(lowerLimit, upperLimit);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [lowerLimitObject, upperLimitObject] = variants as BaseValueObject[];

            const lowerLimitValue = +lowerLimitObject.getValue();
            const upperLimitValue = +upperLimitObject.getValue();

            if (Number.isNaN(lowerLimitValue) || Number.isNaN(upperLimitValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            result = erf(upperLimitValue) - erf(lowerLimitValue);
        } else {
            const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(lowerLimit);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [lowerLimitObject] = variants as BaseValueObject[];

            const lowerLimitValue = +lowerLimitObject.getValue();

            if (Number.isNaN(lowerLimitValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            result = erf(lowerLimitValue);
        }

        return NumberValueObject.create(result);
    }
}
