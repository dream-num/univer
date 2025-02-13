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
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';

export class Fisher extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(x: BaseValueObject): BaseValueObject {
        if (x.isArray()) {
            return (x as ArrayValueObject).mapValue((xObject) => this._handleSingleObject(xObject as BaseValueObject));
        }

        return this._handleSingleObject(x);
    }

    private _handleSingleObject(x: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(x);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [xObject] = variants as BaseValueObject[];

        const xValue = (xObject as NumberValueObject).getValue();

        if (xValue <= -1 || xValue >= 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = Math.log((1 + xValue) / (1 - xValue)) / 2;

        return NumberValueObject.create(result);
    }
}
