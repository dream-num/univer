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
import { getTwoArrayNumberValues } from '../../../basics/statistical';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Correl extends BaseFunction {
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

            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
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

    private _getResult(array1Values: number[], array2Values: number[]): BaseValueObject {
        const n = array1Values.length;

        let array1Sum = 0;
        let array2Sum = 0;

        for (let i = 0; i < n; i++) {
            array1Sum += array1Values[i];
            array2Sum += array2Values[i];
        }

        const array1Mean = array1Sum / n;
        const array2Mean = array2Sum / n;

        let numerator = 0;
        let array1DiffSum = 0;
        let array2DiffSum = 0;

        for (let i = 0; i < n; i++) {
            const array1Diff = array1Values[i] - array1Mean;
            const array2Diff = array2Values[i] - array2Mean;

            numerator += array1Diff * array2Diff;
            array1DiffSum += array1Diff ** 2;
            array2DiffSum += array2Diff ** 2;
        }

        const denominator = Math.sqrt(array1DiffSum * array2DiffSum);

        if (denominator === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return NumberValueObject.create(numerator / denominator);
    }
}
