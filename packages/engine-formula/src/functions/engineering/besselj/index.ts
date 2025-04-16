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

import { BESSEL } from '../../../basics/engineering';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

export class Besselj extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(x: BaseValueObject, n: BaseValueObject): BaseValueObject {
        if (x.isNull() || n.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(x, n);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [xObject, nObject] = variants as BaseValueObject[];

        const xValue = +xObject.getValue();
        const nValue = Math.floor(+nObject.getValue());

        if (Number.isNaN(xValue) || Number.isNaN(nValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (nValue < 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = BESSEL.besselj(xValue, nValue);

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }
}
