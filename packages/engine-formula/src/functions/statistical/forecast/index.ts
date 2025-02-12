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
import { forecastLinear, getTwoArrayNumberValues } from '../../../basics/statistical';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Forecast extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(x: BaseValueObject, knownYs: BaseValueObject, knownXs: BaseValueObject): BaseValueObject {
        const knownYsRowCount = knownYs.isArray() ? (knownYs as ArrayValueObject).getRowCount() : 1;
        const knownYsColumnCount = knownYs.isArray() ? (knownYs as ArrayValueObject).getColumnCount() : 1;

        const knownXsRowCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getRowCount() : 1;
        const knownXsColumnCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getColumnCount() : 1;

        let _knownYs = knownYs;

        if (knownYs.isArray() && knownYsRowCount === 1 && knownYsColumnCount === 1) {
            _knownYs = (knownYs as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        let _knownXs = knownXs;

        if (knownXs.isArray() && knownXsRowCount === 1 && knownXsColumnCount === 1) {
            _knownXs = (knownXs as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (x.isArray()) {
            return (x as ArrayValueObject).mapValue(
                (xObject) => this._handleSignleObject(xObject, _knownYs, _knownXs, knownYsRowCount, knownYsColumnCount, knownXsRowCount, knownXsColumnCount)
            );
        }

        return this._handleSignleObject(x, _knownYs, _knownXs, knownYsRowCount, knownYsColumnCount, knownXsRowCount, knownXsColumnCount);
    }

    private _handleSignleObject(
        x: BaseValueObject,
        knownYs: BaseValueObject,
        knownXs: BaseValueObject,
        knownYsRowCount: number,
        knownYsColumnCount: number,
        knownXsRowCount: number,
        knownXsColumnCount: number
    ): BaseValueObject {
        if (x.isError()) {
            return x;
        }

        if (knownYs.isError()) {
            return knownYs;
        }

        if (knownXs.isError()) {
            return knownXs;
        }

        let _x = x;

        if (x.isString()) {
            _x = x.convertToNumberObjectValue();
        }

        if (_x.isError()) {
            return _x;
        }

        const xValue = +_x.getValue();

        if (knownYsRowCount * knownYsColumnCount === 1 || knownXsRowCount * knownXsColumnCount === 1) {
            if (knownYs.isNull() || knownXs.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
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

        const result = forecastLinear(xValue, array1Values, array2Values);

        if (!Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return NumberValueObject.create(result);
    }
}
