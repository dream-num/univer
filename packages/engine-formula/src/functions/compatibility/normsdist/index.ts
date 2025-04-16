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

import { normalCDF } from '../../../basics/statistical';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';

export class Normsdist extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(z: BaseValueObject): BaseValueObject {
        if (z.isArray()) {
            const resultArray = (z as ArrayValueObject).mapValue((zObject) => this._handleSignleObject(zObject));

            if ((z as ArrayValueObject).getRowCount() === 1 && (z as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSignleObject(z);
    }

    private _handleSignleObject(zObject: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(zObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_zObject] = variants as BaseValueObject[];

        const zValue = +_zObject.getValue();

        const result = normalCDF(zValue, 0, 1);

        return NumberValueObject.create(result);
    }
}
