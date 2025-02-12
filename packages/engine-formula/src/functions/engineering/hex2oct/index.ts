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

import { isValidHexadecimalNumber } from '../../../basics/engineering';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

export class Hex2oct extends BaseFunction {
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

        // Return error if number is not hexadecimal or contains more than ten characters (10 digits)
        if (!isValidHexadecimalNumber(numberValue)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // Convert hexadecimal number to decimal
        const decimal = Number.parseInt(numberValue, 16);

        // Return error if number is positive and greater than 0x1fffffff (536870911)
        if (decimal > 536870911 && decimal < 1098974756864) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result;

        if (decimal >= 1098974756864) {
            result = (decimal - 1098437885952).toString(8);
        } else {
            result = decimal.toString(8);

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
