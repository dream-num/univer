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
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Csch extends BaseFunction {
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

        // CSCH(0) returns the #DIV/0! error value.
        if (numberValue === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        // sinh(number) = Infinity  return 0
        if (!Number.isNaN(numberValue) && !Number.isFinite(Math.sinh(numberValue))) {
            return NumberValueObject.create(0);
        }

        return numberObject.sinh().getReciprocal();
    }
}
