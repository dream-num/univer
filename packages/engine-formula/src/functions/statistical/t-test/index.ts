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
import { getTwoArrayNumberValues, studentTCDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class TTest extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    // eslint-disable-next-line
    override calculate(array1: BaseValueObject, array2: BaseValueObject, tails: BaseValueObject, type: BaseValueObject): BaseValueObject {
        // Calculate first array1 and array2
        // type === 1
        const { isError: isError_sp, errorObject: errorObject_sp, array1Values: array1Values_sp, array2Values: array2Values_sp } = this._handleArray1AndArray2(array1, array2);
        // type !== 1
        const array1Values = this._getArrayValues(array1);
        const array2Values = this._getArrayValues(array2);

        const maxRowLength = Math.max(
            tails.isArray() ? (tails as ArrayValueObject).getRowCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            tails.isArray() ? (tails as ArrayValueObject).getColumnCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getColumnCount() : 1
        );

        const tailsArray = expandArrayValueObject(maxRowLength, maxColumnLength, tails, ErrorValueObject.create(ErrorType.NA));
        const typeArray = expandArrayValueObject(maxRowLength, maxColumnLength, type, ErrorValueObject.create(ErrorType.NA));

        const resultArray = tailsArray.mapValue((tailsObject, rowIndex, columnIndex) => {
            const typeObject = typeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (array1.isError()) {
                return array1;
            }

            if (array2.isError()) {
                return array2;
            }

            if (tailsObject.isError()) {
                return tailsObject;
            }

            if (typeObject.isError()) {
                return typeObject;
            }

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(tailsObject, typeObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_tailsObject, _typeObject] = variants as BaseValueObject[];

            const tailsValue = Math.floor(+_tailsObject.getValue());
            const typeValue = Math.floor(+_typeObject.getValue());

            if (![1, 2].includes(tailsValue) || ![1, 2, 3].includes(typeValue)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (typeValue === 1 && isError_sp) {
                return errorObject_sp as ErrorValueObject;
            }

            if (typeValue !== 1 && array1Values instanceof ErrorValueObject) {
                return array1Values as ErrorValueObject;
            }

            if (typeValue !== 1 && array2Values instanceof ErrorValueObject) {
                return array2Values as ErrorValueObject;
            }

            return this._handleSignleObject(
                (typeValue === 1 ? array1Values_sp : array1Values) as number[],
                (typeValue === 1 ? array2Values_sp : array2Values) as number[],
                tailsValue,
                typeValue
            );
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        array1Values: number[],
        array2Values: number[],
        tails: number,
        type: number
    ): BaseValueObject {
        if (array1Values.length < 2 || array2Values.length < 2) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        const { isError, errorObject, x, degFreedom } = this._getTDistParamByArrayValues(array1Values, array2Values, type);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        let result = studentTCDF(-x, degFreedom);

        if (tails === 2) {
            result *= 2;
        }

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }

    private _getArrayValues(array: BaseValueObject): number[] | ErrorValueObject {
        const rowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const columnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const arrayValues: number[] = [];

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
                }

                if (valueObject.isNull()) {
                    if (rowCount * columnCount === 1) {
                        return ErrorValueObject.create(ErrorType.VALUE);
                    }

                    continue;
                }

                if (valueObject.isBoolean() || valueObject.isString()) {
                    continue;
                }

                arrayValues.push(+valueObject.getValue());
            }
        }

        return arrayValues;
    }

    // eslint-disable-next-line
    private _handleArray1AndArray2(array1: BaseValueObject, array2: BaseValueObject) {
        const array1RowCount = array1.isArray() ? (array1 as ArrayValueObject).getRowCount() : 1;
        const array1ColumnCount = array1.isArray() ? (array1 as ArrayValueObject).getColumnCount() : 1;

        const array2RowCount = array2.isArray() ? (array2 as ArrayValueObject).getRowCount() : 1;
        const array2ColumnCount = array2.isArray() ? (array2 as ArrayValueObject).getColumnCount() : 1;

        let _array1 = array1;

        if (array1.isArray() && array1RowCount === 1 && array1ColumnCount === 1) {
            _array1 = (array1 as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_array1.isError()) {
            return {
                isError: true,
                errorObject: _array1 as ErrorValueObject,
                array1Values: [],
                array2Values: [],
            };
        }

        let _array2 = array2;

        if (array2.isArray() && array2RowCount === 1 && array2ColumnCount === 1) {
            _array2 = (array2 as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_array2.isError()) {
            return {
                isError: true,
                errorObject: _array2 as ErrorValueObject,
                array1Values: [],
                array2Values: [],
            };
        }

        if (array1RowCount * array1ColumnCount === 1 || array2RowCount * array2ColumnCount === 1) {
            if (_array1.isNull() || _array2.isNull()) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                    array1Values: [],
                    array2Values: [],
                };
            }
        }

        if (array1RowCount * array1ColumnCount !== array2RowCount * array2ColumnCount) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.NA),
                array1Values: [],
                array2Values: [],
            };
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
            return {
                isError: true,
                errorObject,
                array1Values: [],
                array2Values: [],
            };
        }

        if (noCalculate || array1Values.length < 2) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.DIV_BY_ZERO),
                array1Values: [],
                array2Values: [],
            };
        }

        return {
            isError: false,
            errorObject: null,
            array1Values,
            array2Values,
        };
    }

    private _getTDistParamByArrayValues(array1Values: number[], array2Values: number[], type: number) {
        if (type === 1) {
            return this._getTDistParamByType1(array1Values, array2Values);
        } else if (type === 2) {
            return this._getTDistParamByType2(array1Values, array2Values);
        } else {
            return this._getTDistParamByType3(array1Values, array2Values);
        }
    };

    private _getTDistParamByType1(array1Values: number[], array2Values: number[]) {
        const n = array1Values.length;

        let sum1 = 0;
        let sum2 = 0;
        let sumSquareDiff = 0;

        for (let i = 0; i < n; i++) {
            sum1 += array1Values[i];
            sum2 += array2Values[i];
            sumSquareDiff += (array1Values[i] - array2Values[i]) ** 2;
        }

        const sumDiff = sum1 - sum2;
        const den = n * sumSquareDiff - sumDiff ** 2;
        const degFreedom = n - 1;

        if (den === 0) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.DIV_BY_ZERO),
                x: 0,
                degFreedom,
            };
        }

        const x = Math.abs(sumDiff) * Math.sqrt(degFreedom / den);

        return {
            isError: false,
            errorObject: null,
            x,
            degFreedom,
        };
    }

    private _getTDistParamByType2(array1Values: number[], array2Values: number[]) {
        const array1Length = array1Values.length;
        const array2Length = array2Values.length;

        let sum1 = 0;
        let sumSquare1 = 0;

        for (let i = 0; i < array1Length; i++) {
            sum1 += array1Values[i];
            sumSquare1 += array1Values[i] ** 2;
        }

        let sum2 = 0;
        let sumSquare2 = 0;

        for (let i = 0; i < array2Length; i++) {
            sum2 += array2Values[i];
            sumSquare2 += array2Values[i] ** 2;
        }

        const temp1 = sumSquare1 - sum1 ** 2 / array1Length;
        const temp2 = sumSquare2 - sum2 ** 2 / array2Length;
        const den = Math.sqrt(temp1 + temp2);

        if (den === 0) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.DIV_BY_ZERO),
                x: 0,
                degFreedom: 0,
            };
        }

        const degFreedom = array1Length - 1 + array2Length - 1;
        const temp3 = Math.sqrt(array1Length * array2Length * degFreedom / (array1Length + array2Length));
        const x = Math.abs(sum1 / array1Length - sum2 / array2Length) / den * temp3;

        return {
            isError: false,
            errorObject: null,
            x,
            degFreedom,
        };
    }

    private _getTDistParamByType3(array1Values: number[], array2Values: number[]) {
        const array1Length = array1Values.length;
        const array2Length = array2Values.length;

        let sum1 = 0;
        let sumSquare1 = 0;

        for (let i = 0; i < array1Length; i++) {
            sum1 += array1Values[i];
            sumSquare1 += array1Values[i] ** 2;
        }

        let sum2 = 0;
        let sumSquare2 = 0;

        for (let i = 0; i < array2Length; i++) {
            sum2 += array2Values[i];
            sumSquare2 += array2Values[i] ** 2;
        }

        const temp1 = (sumSquare1 - sum1 ** 2 / array1Length) / (array1Length * (array1Length - 1));
        const temp2 = (sumSquare2 - sum2 ** 2 / array2Length) / (array2Length * (array2Length - 1));

        if (temp1 + temp2 === 0) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.DIV_BY_ZERO),
                x: 0,
                degFreedom: 0,
            };
        }

        const temp3 = temp1 / (temp1 + temp2);

        const x = Math.abs(sum1 / array1Length - sum2 / array2Length) / Math.sqrt(temp1 + temp2);
        const degFreedom = 1 / (temp3 ** 2 / (array1Length - 1) + ((1 - temp3) ** 2) / (array2Length - 1));

        return {
            isError: false,
            errorObject: null,
            x,
            degFreedom,
        };
    }
}
