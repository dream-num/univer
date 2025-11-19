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
import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { getArrayValuesByAggregateIgnoreOptions, getPercentileIncResult } from '../../../basics/statistical';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { BaseFunction } from '../../base-function';

export class PercentileInc extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(array: BaseValueObject, k: BaseValueObject): BaseValueObject {
        const arrayValues = getArrayValuesByAggregateIgnoreOptions(array);

        if (k.isArray()) {
            const resultArray = (k as ArrayValueObject).mapValue((kObject) => this._handleSingleObject(arrayValues, kObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(arrayValues, k);
    }

    private _handleSingleObject(array: number[] | ErrorValueObject, k: BaseValueObject): BaseValueObject {
        if (!Array.isArray(array)) {
            return array as ErrorValueObject;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(k);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [kObject] = variants as BaseValueObject[];
        const kValue = +kObject.getValue();

        return getPercentileIncResult(array, kValue);
    }
}
