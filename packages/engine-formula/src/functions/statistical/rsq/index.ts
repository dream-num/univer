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

export class Rsq extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(array1: BaseValueObject, array2: BaseValueObject): BaseValueObject {
        const array1RowCount = array1.isArray() ? (array1 as ArrayValueObject).getRowCount() : 1;
        const array1ColumnCount = array1.isArray() ? (array1 as ArrayValueObject).getColumnCount() : 1;

        const array2RowCount = array2.isArray() ? (array2 as ArrayValueObject).getRowCount() : 1;
        const array2ColumnCount = array2.isArray() ? (array2 as ArrayValueObject).getColumnCount() : 1;

        let _array1 = array1;

        if (array1.isArray() && array1RowCount === 1 && array1ColumnCount === 1) {
            _array1 = (array1 as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_array1.isError()) {
            return _array1;
        }

        let _array2 = array2;

        if (array2.isArray() && array2RowCount === 1 && array2ColumnCount === 1) {
            _array2 = (array2 as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_array2.isError()) {
            return _array2;
        }

        if (array1RowCount * array1ColumnCount === 1 || array2RowCount * array2ColumnCount === 1) {
            if (_array1.isNull() || _array2.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
        }

        if (array1RowCount * array1ColumnCount !== array2RowCount * array2ColumnCount) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const {
            isError,
            errorObject,
            array1Values,
            array2Values,
            noCalculate,
        } = getTwoArrayNumberValues(
            array1,
            array2,
            array1RowCount * array1ColumnCount,
            array1ColumnCount,
            array2ColumnCount
        );

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if (noCalculate) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return this._getResult(array1Values, array2Values);
    }

    private _getResult(array1: number[], array2: number[]): BaseValueObject {
        if (array1.length === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        const n = array1.length;

        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < n; i++) {
            sumX += array1[i];
            sumY += array2[i];
        }

        const meanX = sumX / n;
        const meanY = sumY / n;

        let num = 0;
        let den1 = 0;
        let den2 = 0;

        for (let i = 0; i < n; i++) {
            num += (array1[i] - meanX) * (array2[i] - meanY);
            den1 += (array1[i] - meanX) ** 2;
            den2 += (array2[i] - meanY) ** 2;
        }

        if (den1 === 0 || den2 === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        const result = (num / Math.sqrt(den1 * den2)) ** 2;

        return NumberValueObject.create(result);
    }
}
