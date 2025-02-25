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

import { isRealNum } from '@univerjs/core';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { Complex } from '../../../basics/complex';
import { ErrorType } from '../../../basics/error-type';

export class Impower extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(inumber: BaseValueObject, number: BaseValueObject): BaseValueObject {
        if (inumber.isNull() || number.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(inumber, number);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [inumberObject, numberObject] = variants as BaseValueObject[];

        const inumberValue = `${inumberObject.getValue()}`;

        const complex = new Complex(inumberValue);

        if (complex.isError()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const numberValue = +numberObject.getValue();

        if (Number.isNaN(numberValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = complex.Power(numberValue);

        if (complex.isError()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (typeof result === 'number' || isRealNum(result)) {
            return NumberValueObject.create(+result);
        }

        return StringValueObject.create(result);
    }
}
