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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Csc extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(variant: BaseValueObject) {
        if (variant.isArray()) {
            return variant.map((numberObject) => this._handleSingleObject(numberObject));
        }

        return this._handleSingleObject(variant);
    }

    private _handleSingleObject(number: BaseValueObject) {
        let numberObject = number;

        if (numberObject.isString()) {
            numberObject = numberObject.convertToNumberObjectValue();
        }

        if (numberObject.isError()) {
            return numberObject;
        }

        const numberValue = +numberObject.getValue();

        // The absolute value of Number must be less than 2^27. If Number is outside its constraints, COT returns the #NUM! error value.
        if (Math.abs(numberValue) >= 2 ** 27) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // CSC(0) returns the #DIV/0! error value.
        if (numberValue === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return numberObject.sin().getReciprocal();
    }
}
