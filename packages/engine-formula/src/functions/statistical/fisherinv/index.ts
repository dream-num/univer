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

import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';

export class Fisherinv extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(y: BaseValueObject): BaseValueObject {
        if (y.isArray()) {
            return (y as ArrayValueObject).mapValue((yObject) => this._handleSingleObject(yObject as BaseValueObject));
        }

        return this._handleSingleObject(y);
    }

    private _handleSingleObject(y: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(y);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [yObject] = variants as BaseValueObject[];

        const yValue = +yObject.getValue();

        const num = Math.exp(2 * yValue) - 1;
        const den = Math.exp(2 * yValue) + 1;

        if (!Number.isFinite(num) && num > 0 && !Number.isFinite(den) && den > 0) {
            return NumberValueObject.create(1);
        }

        return NumberValueObject.create(num / den);
    }
}
