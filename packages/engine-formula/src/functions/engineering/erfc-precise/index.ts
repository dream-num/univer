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

import { erfc } from '../../../basics/engineering';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class ErfcPrecise extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(x: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(x);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [xObject] = variants as BaseValueObject[];

        const xValue = +xObject.getValue();

        if (Number.isNaN(xValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = erfc(xValue);

        return NumberValueObject.create(result);
    }
}
