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
import { getTwoArrayNumberValues } from '../../../basics/statistical';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Steyx extends BaseFunction {
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
        const n = knownYs.length;

        if (n <= 2) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        let knownYsSum = 0;
        let knownXsSum = 0;

        for (let i = 0; i < n; i++) {
            knownYsSum += knownYs[i];
            knownXsSum += knownXs[i];
        }

        const knownYsMean = knownYsSum / n;
        const knownXsMean = knownXsSum / n;

        let num = 0;
        let knownYsPowSum = 0;
        let knownXsPowSum = 0;

        for (let i = 0; i < n; i++) {
            num += (knownYs[i] - knownYsMean) * (knownXs[i] - knownXsMean);
            knownYsPowSum += (knownYs[i] - knownYsMean) ** 2;
            knownXsPowSum += (knownXs[i] - knownXsMean) ** 2;
        }

        if (knownXsPowSum === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        const result = Math.sqrt((knownYsPowSum - (num ** 2) / knownXsPowSum) / (n - 2));

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }
}
