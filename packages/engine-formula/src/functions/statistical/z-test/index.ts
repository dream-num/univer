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
import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { normalCDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class ZTest extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(array: BaseValueObject, x: BaseValueObject, sigma?: BaseValueObject): BaseValueObject {
        const arrayValues = this._getArrayValues(array);

        const maxRowLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            sigma?.isArray() ? (sigma as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            sigma?.isArray() ? (sigma as ArrayValueObject).getColumnCount() : 1
        );

        const xArray = expandArrayValueObject(maxRowLength, maxColumnLength, x, ErrorValueObject.create(ErrorType.NA));
        const sigmaArray = sigma ? expandArrayValueObject(maxRowLength, maxColumnLength, sigma, ErrorValueObject.create(ErrorType.NA)) : undefined;

        const resultArray = xArray.mapValue((xObject, rowIndex, columnIndex) => {
            if (arrayValues instanceof ErrorValueObject) {
                return arrayValues;
            }

            if (xObject.isError()) {
                return xObject;
            }

            const sigmaObject = sigma ? (sigmaArray as ArrayValueObject).get(rowIndex, columnIndex) as BaseValueObject : undefined;

            if (sigmaObject?.isError()) {
                return sigmaObject;
            }

            if (arrayValues.length === 0) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            if (arrayValues.length === 1) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            return this._handleSignleObject(arrayValues as number[], xObject, sigmaObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        arrayValues: number[],
        x: BaseValueObject,
        sigma: BaseValueObject | undefined
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(x);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [xObject] = variants as BaseValueObject[];

        const xValue = +xObject.getValue();

        const n = arrayValues.length;

        let sum = 0;
        let sumSquare = 0;

        for (let i = 0; i < n; i++) {
            sum += arrayValues[i];
            sumSquare += arrayValues[i] ** 2;
        }

        let sigmaValue = 0;

        if (sigma !== undefined) {
            const { isError: _isError, errorObject: _errorObject, variants: _variants } = checkVariantsErrorIsStringToNumber(sigma);

            if (_isError) {
                return _errorObject as ErrorValueObject;
            }

            const [sigmaObject] = _variants as BaseValueObject[];

            sigmaValue = +sigmaObject.getValue();
        } else {
            const mean = sum / n;

            sigmaValue = Math.sqrt((sumSquare - 2 * mean * sum + n * mean ** 2) / (n - 1));
        }

        if (sigmaValue <= 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const z = (sum / n - xValue) / (sigmaValue / Math.sqrt(n));

        const result = 1 - normalCDF(z, 0, 1);

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }

    private _getArrayValues(array: BaseValueObject): number[] | ErrorValueObject {
        const values: number[] = [];

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        for (let r = 0; r < arrayRowCount; r++) {
            for (let c = 0; c < arrayColumnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
                }

                if (valueObject.isNull() || valueObject.isBoolean() || valueObject.isString()) {
                    continue;
                }

                const value = valueObject.getValue();

                if (!isRealNum(value)) {
                    continue;
                }

                values.push(+value);
            }
        }

        return values;
    }
}
