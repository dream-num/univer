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

export class Imsub extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(inumber1: BaseValueObject, inumber2: BaseValueObject): BaseValueObject {
        if (inumber1.isNull() || inumber2.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(inumber1, inumber2);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [inumber1Object, inumber2Object] = variants as BaseValueObject[];

        const inumber1Value = `${inumber1Object.getValue()}`;
        const inumber2Value = `${inumber2Object.getValue()}`;

        const complex1 = new Complex(inumber1Value);
        const complex2 = new Complex(inumber2Value);

        if (complex1.isError() || complex2.isError()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // Cannot perform operations on complex numbers with different suffixes.
        if (complex1.isDifferentSuffixes(complex2)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = complex1.Sub(complex2);

        if (typeof result === 'number' || isRealNum(result)) {
            return NumberValueObject.create(+result);
        }

        return StringValueObject.create(result);
    }
}
