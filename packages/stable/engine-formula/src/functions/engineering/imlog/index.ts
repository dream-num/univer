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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { isRealNum } from '@univerjs/core';
import { Complex } from '../../../basics/complex';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArrayOrBoolean, checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Imlog extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(inumber: BaseValueObject, base?: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(inumber);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [inumberObject] = variants as BaseValueObject[];

        let _base = base ?? NumberValueObject.create(10);

        if (_base.isArray()) {
            const rowCount = (_base as ArrayValueObject).getRowCount();
            const columnCount = (_base as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _base = (_base as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        const { isError: _isError, errorObject: _errorObject, variants: _variants } = checkVariantsErrorIsStringToNumber(_base);

        if (_isError) {
            return _errorObject as ErrorValueObject;
        }

        const [baseObject] = _variants as BaseValueObject[];

        const inumberValue = `${inumberObject.getValue()}`;
        const baseValue = +baseObject.getValue();

        const complex = new Complex(inumberValue);

        if (complex.isError()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (complex.getRealNum() === 0 && complex.getINum() === 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (baseValue <= 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = complex.Log(baseValue);

        if (complex.isError()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (typeof result === 'number' || isRealNum(result)) {
            return NumberValueObject.create(+result);
        }

        return StringValueObject.create(result);
    }
}
