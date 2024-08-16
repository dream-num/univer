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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Irr extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(values: BaseValueObject, guess?: BaseValueObject) {
        let _guess = guess ?? NumberValueObject.create(0.1);

        if (_guess.isNull()) {
            _guess = NumberValueObject.create(0.1);
        }

        if (_guess.isArray()) {
            return _guess.map((guessObject, rowIndex, columnIndex) => this._handleSingleObject(values, guessObject, rowIndex, columnIndex));
        }

        return this._handleSingleObject(values, _guess);
    }

    private _handleSingleObject(values: BaseValueObject, guess: BaseValueObject, rowIndex: number = 0, columnIndex: number = 0) {
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

        const result = this._irrResult(_values, guessValue);

        if (typeof result !== 'number') {
            return result as ErrorValueObject;
        }

        if (rowIndex === 0 && columnIndex === 0) {
            return NumberValueObject.create(result, '0%');
        }

        return NumberValueObject.create(result);
    }

    private _getValues(values: ArrayValueObject) {
        const _values: number[] = [];

        let valuesHasError = false;

        (values as ArrayValueObject).iterator((valueOject) => {
            if (valueOject?.isError()) {
                valuesHasError = true;
                return false;
            }

            if (valueOject?.isNull() || valueOject?.isBoolean()) {
                return true;
            }

            const value = valueOject?.getValue();

            if (!value || !isRealNum(value)) {
                return true;
            }

            _values.push(+value);
        });

        return {
            _values,
            valuesHasError,
        };
    }

    private _checkValues(values: number[]) {
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

    private _npv(values: number[], guess: number): number {
        let res = 0;

        for (let i = 1; i <= values.length; i++) {
            res += values[i - 1] / ((1 + guess) ** i);
        }

        return res;
    }

    private _irrResult(values: number[], guess: number): number | ErrorValueObject {
        const g_Eps = 1e-7;
        const nIM = 500;

        let eps = 1;
        let nMC = 0;
        let xN;
        let _guess = guess;

        while (eps > g_Eps && nMC < nIM) {
            xN = _guess - this._npv(values, _guess) / ((this._npv(values, _guess + g_Eps) - this._npv(values, _guess - g_Eps)) / (2 * g_Eps));
            nMC++;
            eps = Math.abs(xN - _guess);
            _guess = xN;
        }

        if (Number.isNaN(_guess) || Infinity === Math.abs(_guess)) {
            return this._guessIsNaNorInfinity(values, guess);
        }

        return _guess;
    }

    private _guessIsNaNorInfinity(values: number[], guess: number): number | ErrorValueObject {
        const g_Eps = 1e-7;
        const nIM = 500;

        const max = Number.MAX_VALUE;
        const min = -Number.MAX_VALUE;
        const step = 1.6;

        let low = guess - 0.01 <= min ? min + g_Eps : guess - 0.01;
        let high = guess + 0.01 >= max ? max - g_Eps : guess + 0.01;
        let i;
        let xBegin;
        let xEnd;
        let x;
        let y;
        let currentIter = 0;

        if (guess <= min || guess >= max) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        for (i = 0; i < nIM; i++) {
            xBegin = low <= min ? min + g_Eps : low;
            xEnd = high >= max ? max - g_Eps : high;
            x = this._npv(values, xBegin);
            y = this._npv(values, xEnd);

            if (x * y <= 0) {
                break;
            } else if (x * y > 0) {
                low = (xBegin + step * (xBegin - xEnd));
                high = (xEnd + step * (xEnd - xBegin));
            } else {
                return ErrorValueObject.create(ErrorType.NUM);
            }
        }

        if (i === nIM) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        xBegin = xBegin as number;
        xEnd = xEnd as number;

        let fXbegin = this._npv(values, xBegin);
        const fXend = this._npv(values, xEnd);
        let fXi;
        let xI;

        if (Math.abs(fXbegin) < g_Eps) {
            return fXbegin;
        }

        if (Math.abs(fXend) < g_Eps) {
            return fXend;
        }

        do {
            xI = xBegin + (xEnd - xBegin) / 2;
            fXi = this._npv(values, xI);

            if (fXbegin * fXi < 0) {
                xEnd = xI;
            } else {
                xBegin = xI;
            }

            fXbegin = this._npv(values, xBegin);
            currentIter++;
        } while (Math.abs(fXi) > g_Eps && currentIter < nIM);

        return xI;
    }
}
