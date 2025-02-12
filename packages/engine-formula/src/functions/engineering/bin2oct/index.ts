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

import { isValidBinaryNumber } from '../../../basics/engineering';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

export class Bin2oct extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(number: BaseValueObject, places?: BaseValueObject): BaseValueObject {
        if (number.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        let placesValue = 0;

        if (places) {
            // If places exists, it is prioritized.
            const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(places);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [placesObject] = variants as BaseValueObject[];

            placesValue = Math.floor(+placesObject.getValue());

            if (Number.isNaN(placesValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (placesValue < 0 || placesValue > 10) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(number);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject] = variants as BaseValueObject[];

        const numberValue = `${numberObject.getValue()}`;

        // Return error if number is not binary or contains more than 10 characters (10 digits)
        if (!isValidBinaryNumber(numberValue)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result;

        if (numberValue.length === 10 && numberValue.substring(0, 1) === '1') {
            result = (1073741312 + Number.parseInt(numberValue.substring(1), 2)).toString(8);
        } else {
            result = Number.parseInt(numberValue, 2).toString(8);

            if (places) {
                if (placesValue < result.length) {
                    return ErrorValueObject.create(ErrorType.NUM);
                }

                result = '0'.repeat(placesValue - result.length) + result;
            }
        }

        return StringValueObject.create(result);
    }
}
