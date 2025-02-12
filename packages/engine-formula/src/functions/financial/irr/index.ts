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
import { calculateNpv, getResultByGuessIterF } from '../../../basics/financial';

interface IValuesType {
    _values: number[];
    valuesHasError: boolean;
}

interface ICheckValuesType {
    positive: boolean;
    negative: boolean;
}

export class Irr extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(values: BaseValueObject, guess?: BaseValueObject): BaseValueObject {
        let _guess = guess ?? NumberValueObject.create(0.1);

        if (_guess.isNull()) {
            _guess = NumberValueObject.create(0.1);
        }

        if (_guess.isArray()) {
            return _guess.map((guessObject, rowIndex, columnIndex) => this._handleSingleObject(values, guessObject, rowIndex, columnIndex));
        }

        return this._handleSingleObject(values, _guess);
    }

    private _handleSingleObject(values: BaseValueObject, guess: BaseValueObject, rowIndex: number = 0, columnIndex: number = 0): BaseValueObject {
        if (values.isError()) {
            return values;
        }

        if (guess.isError()) {
            return guess;
        }

        if (values.isNull()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (!values.isArray()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const { _values, valuesHasError } = this._getValues(values as ArrayValueObject);

        if (valuesHasError) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _guess = guess;

        if (_guess.isString()) {
            _guess = _guess.convertToNumberObjectValue();

            if (_guess.isError()) {
                return _guess;
            }
        }

        const guessValue = +_guess.getValue();

        const { positive, negative } = this._checkValues(_values);

        if (!positive || !negative) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = getResultByGuessIterF(guessValue, (rate: number) => calculateNpv(rate, _values));

        if (typeof result !== 'number') {
            return result as ErrorValueObject;
        }

        if (rowIndex === 0 && columnIndex === 0) {
            return NumberValueObject.create(result, '0%');
        }

        return NumberValueObject.create(result);
    }

    private _getValues(values: ArrayValueObject): IValuesType {
        const _values: number[] = [];

        let valuesHasError = false;

        (values as ArrayValueObject).iterator((valueOject) => {
            const _valueOject = valueOject as BaseValueObject;

            if (_valueOject.isError()) {
                valuesHasError = true;
                return false;
            }

            if (_valueOject.isNull() || _valueOject.isBoolean()) {
                return true;
            }

            const value = +_valueOject.getValue();

            if (Number.isNaN(value)) {
                return true;
            }

            _values.push(value);
        });

        return {
            _values,
            valuesHasError,
        };
    }

    private _checkValues(values: number[]): ICheckValuesType {
        let positive = false;
        let negative = false;

        for (let i = 0; i < values.length; i++) {
            if (values[i] > 0) {
                positive = true;
            }

            if (values[i] < 0) {
                negative = true;
            }
        }

        return {
            positive,
            negative,
        };
    }
}
