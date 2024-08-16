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

export class Xirr extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(values: BaseValueObject, dates: BaseValueObject, guess?: BaseValueObject) {
        if (values.isNull() || dates.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const { isError, errorObejct, _values, _dates } = this._checkErrors(values, dates);

        if (isError) {
            return errorObejct as ErrorValueObject;
        }

        let _guess = guess ?? NumberValueObject.create(0.1);

        if (_guess.isNull()) {
            _guess = NumberValueObject.create(0.1);
        }

        const guessValue = +_guess.getValue();

        if (_guess.isArray() || _guess.isBoolean() || Number.isNaN(guessValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const { positive, negative } = this._checkValues(_values as number[]);

        if (!positive || !negative || _values?.length !== _dates?.length || guessValue < 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = this._getResult(_values as number[], _dates as number[], guessValue);

        if (typeof result !== 'number') {
            return result as ErrorValueObject;
        }

        return NumberValueObject.create(result);
    }

    private _checkErrors(values: BaseValueObject, dates: BaseValueObject) {
        if (values.isError()) {
            return {
                isError: true,
                errorObejct: values,
            };
        }

        if (dates.isError()) {
            return {
                isError: true,
                errorObejct: dates,
            };
        }

        const { isError: isError_values, errorObejct: errorObejct_values, _values } = this._checkErrorValues(values);

        if (isError_values) {
            return {
                isError: isError_values,
                errorObejct: errorObejct_values,
            };
        }

        const { isError: isError_dates, errorObejct: errorObejct_dates, _dates } = this._checkErrorDates(dates);

        if (isError_dates) {
            return {
                isError: isError_dates,
                errorObejct: errorObejct_dates,
            };
        }

        return {
            isError: false,
            _values,
            _dates,
        };
    }

    private _checkErrorValues(values: BaseValueObject) {
        const _values: number[] = [];

        if (values.isArray()) {
            let isError = false;
            let errorObejct = ErrorValueObject.create(ErrorType.VALUE);

            (values as ArrayValueObject).iterator((valuesObject) => {
                if (valuesObject?.isError()) {
                    isError = true;
                    errorObejct = valuesObject as ErrorValueObject;
                    return false;
                }

                if (valuesObject?.isBoolean()) {
                    isError = true;
                    errorObejct = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                const value = +(valuesObject as BaseValueObject).getValue();

                if (Number.isNaN(value)) {
                    isError = true;
                    errorObejct = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                _values.push(value);
            });

            if (isError) {
                return {
                    isError,
                    errorObejct,
                };
            }

            return {
                isError,
                _values,
            };
        } else {
            const valuesValue = values.getValue();

            if (values.isBoolean() || (values.isString() && !isRealNum(valuesValue))) {
                return {
                    isError: true,
                    errorObejct: ErrorValueObject.create(ErrorType.VALUE),
                };
            }

            return {
                isError: true,
                errorObejct: ErrorValueObject.create(ErrorType.NA),
            };
        }
    }

    private _checkErrorDates(dates: BaseValueObject) {
        const _dates: number[] = [];

        if (dates.isArray()) {
            let isError = false;
            let errorObejct = ErrorValueObject.create(ErrorType.VALUE);

            (dates as ArrayValueObject).iterator((datesObject) => {
                if (datesObject?.isError()) {
                    isError = true;
                    errorObejct = datesObject as ErrorValueObject;
                    return false;
                }

                if (datesObject?.isBoolean()) {
                    isError = true;
                    errorObejct = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                const datesValue = +(datesObject as BaseValueObject).getValue();

                if (Number.isNaN(datesValue)) {
                    isError = true;
                    errorObejct = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                if (datesValue < 0) {
                    isError = true;
                    errorObejct = ErrorValueObject.create(ErrorType.NUM);
                    return false;
                }

                _dates.push(datesValue);
            });

            if (isError) {
                return {
                    isError,
                    errorObejct,
                };
            }

            return {
                isError,
                _dates,
            };
        } else {
            const datesValue = dates.getValue();

            if (dates.isBoolean() || (dates.isString() && !isRealNum(datesValue))) {
                return {
                    isError: true,
                    errorObejct: ErrorValueObject.create(ErrorType.VALUE),
                };
            }

            if (+datesValue < 0) {
                return {
                    isError: true,
                    errorObejct: ErrorValueObject.create(ErrorType.NUM),
                };
            }

            return {
                isError: true,
                errorObejct: ErrorValueObject.create(ErrorType.NA),
            };
        }
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

    private _xirrFunction(values: number[], dates: number[], rate: number): number {
        const D_0 = dates[0];
        const r = rate + 1;

        let res = values[0];

        for (let i = 1; i < values.length; i++) {
            res += values[i] / (r ** ((dates[i] - D_0) / 365));
        }

        return res;
    }

    private _getResult(values: number[], dates: number[], guess: number): number | ErrorValueObject {
        const g_Eps = 1e-7;
        const g_Eps2 = g_Eps * 2;
        const nIM = 500;

        let eps = 1;
        let nMC = 0;
        let xN;
        let _guess = guess;

        while (eps > g_Eps && nMC < nIM) {
            const den = (this._xirrFunction(values, dates, _guess + g_Eps) - this._xirrFunction(values, dates, _guess - g_Eps)) / g_Eps2;
            xN = _guess - this._xirrFunction(values, dates, _guess) / den;
            nMC++;
            eps = Math.abs(xN - _guess);
            _guess = xN;
        }

        if (Number.isNaN(_guess) || Infinity === Math.abs(_guess)) {
            return this._guessIsNaNorInfinity(values, dates, guess);
        }

        return _guess;
    }

    private _guessIsNaNorInfinity(values: number[], dates: number[], guess: number): number | ErrorValueObject {
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
            x = this._xirrFunction(values, dates, xBegin);
            y = this._xirrFunction(values, dates, xEnd);

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

        let fXbegin = this._xirrFunction(values, dates, xBegin);
        const fXend = this._xirrFunction(values, dates, xEnd);
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
            fXi = this._xirrFunction(values, dates, xI);

            if (fXbegin * fXi < 0) {
                xEnd = xI;
            } else {
                xBegin = xI;
            }

            fXbegin = this._xirrFunction(values, dates, xBegin);
            currentIter++;
        } while (Math.abs(fXi) > g_Eps && currentIter < nIM);

        return xI;
    }
}
