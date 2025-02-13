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
        const {
            isError: isError_array1,
            errorObject: errorObject_array1,
            variance: variance_array1,
            ns1: ns1_array1,
        } = this._getValues(array1);

        if (isError_array1) {
            return errorObject_array1 as ErrorValueObject;
        }

        const {
            isError: isError_array2,
            errorObject: errorObject_array2,
            variance: variance_array2,
            ns1: ns1_array2,
        } = this._getValues(array2);

        if (isError_array2) {
            return errorObject_array2 as ErrorValueObject;
        }

        let result = 2 * (1 - centralFCDF(variance_array1 / variance_array2, ns1_array1, ns1_array2));

        if (result > 1) {
            result = 2 - result;
        }

        return NumberValueObject.create(result);
    }

    // eslint-disable-next-line
    private _getValues(array: BaseValueObject) {
        let variance = 0;
        let ns1 = 0;

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        if (arrayRowCount === 1 && arrayColumnCount === 1) {
            const _array = array.isArray() ? (array as ArrayValueObject).get(0, 0) as BaseValueObject : array;

            if (_array.isError()) {
                return {
                    isError: true,
                    errorObject: _array,
                    variance,
                    ns1,
                };
            }

            if (_array.isNull()) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                    variance,
                    ns1,
                };
            }

            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.DIV_BY_ZERO),
                variance,
                ns1,
            };
        }

        const values = [];
        let sum = 0;

        for (let r = 0; r < arrayRowCount; r++) {
            for (let c = 0; c < arrayColumnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return {
                        isError: true,
                        errorObject: valueObject,
                        variance,
                        ns1,
                    };
                }

                if (valueObject.isNull() || valueObject.isBoolean()) {
                    continue;
                }

                const value = valueObject.getValue();

                if (!isRealNum(value)) {
                    continue;
                }

                values.push(+value);
                sum += +value;
            }
        }

        if (values.length <= 1) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.DIV_BY_ZERO),
                variance,
                ns1,
            };
        }

        const mean = sum / values.length;

        let sumSquares = 0;

        for (let i = 0; i < values.length; i++) {
            sumSquares += (values[i] - mean) ** 2;
        }

        ns1 = values.length - 1;
        variance = sumSquares / ns1;

        if (variance === 0) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.DIV_BY_ZERO),
                variance,
                ns1,
            };
        }

        return {
            isError: false,
            errorObject: null,
            variance,
            ns1,
        };
    }
}
