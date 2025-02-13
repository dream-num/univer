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
import { ErrorType } from '../../../basics/error-type';
import { forecastLinear, getTwoArrayNumberValues } from '../../../basics/statistical';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Intercept extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(knownYs: BaseValueObject, knownXs: BaseValueObject): BaseValueObject {
        const knownYsRowCount = knownYs.isArray() ? (knownYs as ArrayValueObject).getRowCount() : 1;
        const knownYsColumnCount = knownYs.isArray() ? (knownYs as ArrayValueObject).getColumnCount() : 1;

        const knownXsRowCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getRowCount() : 1;
        const knownXsColumnCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getColumnCount() : 1;

        let _knownYs = knownYs;

        if (knownYs.isArray() && knownYsRowCount === 1 && knownYsColumnCount === 1) {
            _knownYs = (knownYs as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_knownYs.isError()) {
            return _knownYs;
        }

        let _knownXs = knownXs;

        if (knownXs.isArray() && knownXsRowCount === 1 && knownXsColumnCount === 1) {
            _knownXs = (knownXs as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_knownXs.isError()) {
            return _knownXs;
        }

        if (knownYsRowCount * knownYsColumnCount === 1 || knownXsRowCount * knownXsColumnCount === 1) {
            if (_knownYs.isNull() || _knownXs.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        if (knownYsRowCount * knownYsColumnCount !== knownXsRowCount * knownXsColumnCount) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const {
            isError,
            errorObject,
            array1Values,
            array2Values,
            noCalculate,
        } = getTwoArrayNumberValues(
            knownYs,
            knownXs,
            knownYsRowCount * knownYsColumnCount,
            knownYsColumnCount,
            knownXsColumnCount
        );

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if (noCalculate) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return this._getResult(array1Values, array2Values);
    }

    private _getResult(knownYs: number[], knownXs: number[]): BaseValueObject {
        const result = forecastLinear(0, knownYs, knownXs);

        if (!Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return NumberValueObject.create(result);
    }
}
