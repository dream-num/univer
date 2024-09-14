/**
 * Copyright 2023-present DreamNum Inc.
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

import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { centralFCDF } from '../../../basics/statistical';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class FTest extends BaseFunction {
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

            return ErrorValueObject.create(ErrorType.NA);
        }

        if (array1RowCount * array1ColumnCount !== array2RowCount * array2ColumnCount) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const { isError, errorObject, array1Values, array2Values, noCalculate } = this._getValues(array1, array2, array1RowCount * array1ColumnCount, array1ColumnCount, array2ColumnCount);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if (noCalculate) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return this._getResult(array1Values, array2Values);
    }

    private _getValues(
        array1: BaseValueObject,
        array2: BaseValueObject,
        count: number,
        array1ColumnCount: number,
        array2ColumnCount: number
    ) {
        const array1Values: number[] = [];
        const array2Values: number[] = [];
        let noCalculate = true;

        for (let i = 0; i < count; i++) {
            const array1RowIndex = Math.floor(i / array1ColumnCount);
            const array1ColumnIndex = i % array1ColumnCount;

            const array2RowIndex = Math.floor(i / array2ColumnCount);
            const array2ColumnIndex = i % array2ColumnCount;

            const array1Object = (array1 as ArrayValueObject).get(array1RowIndex, array1ColumnIndex) as BaseValueObject;
            const array2Object = (array2 as ArrayValueObject).get(array2RowIndex, array2ColumnIndex) as BaseValueObject;

            if (array1Object.isError()) {
                return {
                    isError: true,
                    errorObject: array1Object as ErrorValueObject,
                    array1Values,
                    array2Values,
                    noCalculate,
                };
            }

            if (array2Object.isError()) {
                return {
                    isError: true,
                    errorObject: array2Object as ErrorValueObject,
                    array1Values,
                    array2Values,
                    noCalculate,
                };
            }

            if (array1Object.isNull() || array2Object.isNull() || array1Object.isBoolean() || array2Object.isBoolean()) {
                continue;
            }

            let array1Value = array1Object.getValue();
            let array2Value = array2Object.getValue();

            if (!isRealNum(array1Value) || !isRealNum(array2Value)) {
                continue;
            }

            array1Value = +array1Value;
            array2Value = +array2Value;

            array1Values.push(+array1Value);
            array2Values.push(+array2Value);
            noCalculate = false;
        }

        return {
            isError: false,
            errorObject: null,
            array1Values,
            array2Values,
            noCalculate,
        };
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

        let array1SumSquares = 0;
        let array2SumSquares = 0;

        for (let i = 0; i < n; i++) {
            array1SumSquares += (array1Values[i] - array1Mean) ** 2;
            array2SumSquares += (array2Values[i] - array2Mean) ** 2;
        }

        const array1Variance = array1SumSquares / (n - 1);
        const array2Variance = array2SumSquares / (n - 1);

        if (array2Variance === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        let result = 2 * (1 - centralFCDF(array1Variance / array2Variance, n - 1, n - 1));

        if (result > 1) {
            result = 2 - result;
        }

        return NumberValueObject.create(result);
    }
}
