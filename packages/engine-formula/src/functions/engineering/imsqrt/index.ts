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

export class Imsqrt extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(inumber: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(inumber);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [inumberObject] = variants as BaseValueObject[];

        const inumberValue = `${inumberObject.getValue()}`;

        const complex = new Complex(inumberValue);

        if (complex.isError()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (complex.getRealNum() === 0 && complex.getINum() === 0) {
            return NumberValueObject.create(0);
        }

        const result = complex.Sqrt();

        if (typeof result === 'number' || isRealNum(result)) {
            return NumberValueObject.create(+result);
        }

        return StringValueObject.create(result);
    }
}
