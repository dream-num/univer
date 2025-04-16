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

import { ErrorType as ErrorTypeBase } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class ErrorType extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(errorVal: BaseValueObject) {
        if (errorVal.isArray()) {
            return errorVal.mapValue((errorValObject) => this._handleSingleObject(errorValObject));
        }

        return this._handleSingleObject(errorVal);
    }

    private _handleSingleObject(errorVal: BaseValueObject) {
        const errorValValue = errorVal.getValue();
        const result = this._errorTypeValueMap.get(errorValValue as ErrorTypeBase);

        if (result) {
            return NumberValueObject.create(result);
        }

        return ErrorValueObject.create(ErrorTypeBase.NA);
    }

    private _errorTypeValueMap = new Map([
        [ErrorTypeBase.NULL, 1],
        [ErrorTypeBase.DIV_BY_ZERO, 2],
        [ErrorTypeBase.VALUE, 3],
        [ErrorTypeBase.REF, 4],
        [ErrorTypeBase.NAME, 5],
        [ErrorTypeBase.NUM, 6],
        [ErrorTypeBase.NA, 7],
        [ErrorTypeBase.CONNECT, 8],
        [ErrorTypeBase.CALC, 14],
    ]);
}
