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

export class Sech extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(number: BaseValueObject) {
        if (number.isArray()) {
            return number.map((numberObject) => this._handleSingleObject(numberObject));
        }

        return this._handleSingleObject(number);
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

        if (!Number.isFinite(Math.cosh(numberValue))) {
            return NumberValueObject.create(0);
        }

        if (Math.abs(numberValue) >= 2 ** 27) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return numberObject.cosh().getReciprocal();
    }
}
