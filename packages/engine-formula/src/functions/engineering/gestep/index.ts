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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

export class Gestep extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(number: BaseValueObject, step?: BaseValueObject): BaseValueObject {
        if (number.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const _step = step ?? NumberValueObject.create(0);

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(number, _step);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject, stepObject] = variants as BaseValueObject[];

        const numberValue = +numberObject.getValue();
        const stepValue = +stepObject.getValue();

        if (Number.isNaN(numberValue) || Number.isNaN(stepValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = numberValue >= stepValue ? 1 : 0;

        return NumberValueObject.create(result);
    }
}
