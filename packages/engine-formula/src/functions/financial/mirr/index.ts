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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

interface INumberValues {
    numberValues: number[];
    positive: boolean;
    negative: boolean;
}

interface IValuesType extends INumberValues {
    _values: BaseValueObject;
}

interface ICheckValuesType extends INumberValues {
    valuesHasError: boolean;
    errorObject: ErrorValueObject;
}

export class Mirr extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(values: BaseValueObject, financeRate: BaseValueObject, reinvestRate: BaseValueObject): BaseValueObject {
        const { _values, numberValues, positive, negative } = this._getValues(values);

        const maxRowLength = Math.max(
            financeRate.isArray() ? (financeRate as ArrayValueObject).getRowCount() : 1,
            reinvestRate.isArray() ? (reinvestRate as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            financeRate.isArray() ? (financeRate as ArrayValueObject).getColumnCount() : 1,
            reinvestRate.isArray() ? (reinvestRate as ArrayValueObject).getColumnCount() : 1
        );

        const financeRateArray = expandArrayValueObject(maxRowLength, maxColumnLength, financeRate, ErrorValueObject.create(ErrorType.NA));
        const reinvestRateArray = expandArrayValueObject(maxRowLength, maxColumnLength, reinvestRate, ErrorValueObject.create(ErrorType.NA));

        const resultArray = financeRateArray.map((financeRateObject, rowIndex, columnIndex) => {
            const reinvestRateObject = reinvestRateArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (values.isError()) {
                return values;
            }

            if (reinvestRateObject.isError()) {
                return reinvestRateObject;
            }

            if (_values.isError()) {
                return _values;
            }

            if (!positive || !negative) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            const financeRateValue = +financeRateObject.getValue();
            const reinvestRateValue = +reinvestRateObject.getValue();

            if (Number.isNaN(financeRateValue) || Number.isNaN(reinvestRateValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (reinvestRateValue === -1) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            const result = this._getResult(numberValues, financeRateValue, reinvestRateValue);

            if (rowIndex === 0 && columnIndex === 0) {
                return NumberValueObject.create(result, '0%');
            }

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _getValues(values: BaseValueObject): IValuesType {
        let _values = values;
        let _numberValues: number[] = [];
        let _positive = false;
        let _negative = false;

        if (!values.isError()) {
            if (values.isNull()) {
                _values = ErrorValueObject.create(ErrorType.VALUE);
            } else if (!values.isArray()) {
                _values = ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            } else {
                const { numberValues, valuesHasError, errorObject, positive, negative } = this._checkValues(values as ArrayValueObject);

                if (valuesHasError) {
                    _values = errorObject;
                }

                _numberValues = numberValues;
                _positive = positive;
                _negative = negative;
            }
        }

        return {
            _values,
            numberValues: _numberValues,
            positive: _positive,
            negative: _negative,
        };
    }

    private _checkValues(values: ArrayValueObject): ICheckValuesType {
        const numberValues: number[] = [];

        let valuesHasError = false;
        let errorObject: ErrorValueObject = ErrorValueObject.create(ErrorType.VALUE);
        let positive = false;
        let negative = false;

        (values as ArrayValueObject).iterator((valueOject) => {
            const _valueOject = valueOject as BaseValueObject;

            if (_valueOject.isError()) {
                valuesHasError = true;
                errorObject = _valueOject as ErrorValueObject;
                return false;
            }

            if (_valueOject.isNull() || _valueOject.isBoolean()) {
                return true;
            }

            const value = +_valueOject.getValue();

            if (Number.isNaN(value)) {
                return true;
            }

            if (value > 0) {
                positive = true;
            }

            if (value < 0) {
                negative = true;
            }

            numberValues.push(value);
        });

        return {
            numberValues,
            valuesHasError,
            errorObject,
            positive,
            negative,
        };
    }

    private _getResult(values: number[], financeRate: number, reinvestRate: number): number {
        const n = values.length;
        const negatives = [];
        const positives = [];

        for (let i = 0; i < n; i++) {
            if (values[i] > 0) {
                positives.push(values[i]);
            } else if (values[i] < 0) {
                negatives.push(values[i]);
            }
        }

        const npvR = this._npv(reinvestRate, values, 'positive');
        const npvF = this._npv(financeRate, values, 'negative');
        const num = -npvR * ((1 + reinvestRate) ** n);
        const den = npvF * (1 + financeRate);
        const result = (num / den) ** (1 / (n - 1)) - 1;

        return result;
    }

    private _npv(rate: number, values: number[], type: 'positive' | 'negative'): number {
        let res = 0;

        for (let i = 1; i <= values.length; i++) {
            const value = values[i - 1];

            if ((type === 'positive' && value > 0) || (type === 'negative' && value < 0)) {
                res += value / ((1 + rate) ** i);
            }
        }

        return res;
    }
}
