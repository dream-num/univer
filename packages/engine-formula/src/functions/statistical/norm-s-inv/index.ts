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
import { normalINV } from '../../../basics/statistical';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class NormSInv extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(probability: BaseValueObject): BaseValueObject {
        if (probability.isArray()) {
            const resultArray = (probability as ArrayValueObject).mapValue((probabilityObject) => this._handleSignleObject(probabilityObject));

            if ((probability as ArrayValueObject).getRowCount() === 1 && (probability as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSignleObject(probability);
    }

    private _handleSignleObject(probabilityObject: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(probabilityObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_probabilityObject] = variants as BaseValueObject[];

        const probabilityValue = +_probabilityObject.getValue();

        if (probabilityValue <= 0 || probabilityValue >= 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = normalINV(probabilityValue, 0, 1);

        return NumberValueObject.create(result);
    }
}
