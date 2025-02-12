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
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { Complex as COMPLEX } from '../../../basics/complex';

export class Complex extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(realNum: BaseValueObject, iNum: BaseValueObject, suffix?: BaseValueObject): BaseValueObject {
        const _suffix = suffix ?? StringValueObject.create('i');

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(realNum, iNum, _suffix);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [realNumObject, iNumObject, suffixObject] = variants as BaseValueObject[];

        const realNumValue = +realNumObject.getValue();
        const iNumValue = +iNumObject.getValue();
        const suffixValue = `${suffixObject.getValue()}`;

        if (
            Number.isNaN(realNumValue) ||
            Number.isNaN(iNumValue) ||
            (suffixValue !== 'i' && suffixValue !== 'j')
        ) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = COMPLEX.getComplex(realNumValue, iNumValue, suffixValue);

        if (typeof result === 'number') {
            return NumberValueObject.create(result);
        }

        return StringValueObject.create(result);
    }
}
