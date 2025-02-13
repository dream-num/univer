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

import { isValidOctalNumber } from '../../../basics/engineering';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

export class Oct2dec extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(number: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(number);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject] = variants as BaseValueObject[];

        const numberValue = `${numberObject.getValue()}`;

        // Return error if number is not octal or contains more than ten characters (10 digits)
        if (!isValidOctalNumber(numberValue)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result = Number.parseInt(numberValue, 8);

        if (result >= 536870912) {
            result -= 1073741824;
        }

        return NumberValueObject.create(result);
    }
}
