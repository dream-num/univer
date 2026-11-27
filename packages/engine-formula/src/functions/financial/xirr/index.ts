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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { DateSystem, EXCEL_1904_OFFSET, isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

interface ICheckErrorType {
    isError: boolean;
    errorObejct?: ErrorValueObject;
}

interface ICheckErrorValues extends ICheckErrorType {
    _values?: number[];
}

interface ICheckErrorDates extends ICheckErrorType {
    _dates?: number[];
}

interface ICheckNumber {
    positive: boolean;
    negative: boolean;
}

export class Xirr extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(valueArg: FunctionVariantType, dateArg: FunctionVariantType, guessArg?: FunctionVariantType): BaseValueObject {
        const values = resolveArgument(valueArg);
        const dates = resolveArgument(dateArg);
        const guess = guessArg === undefined ? undefined : resolveArgument(guessArg);
        if (values.isNull() || dates.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const { isError, errorObejct, _values, _dates } = this._checkErrors(values, dates);

        if (isError) {
            return errorObejct as ErrorValueObject;
        }

        let _guess = guess ?? NumberValueObject.create(0.1);

        if (_guess.isNull()) {
            _guess = NumberValueObject.create(guessArg?.isReferenceObject() ? 0 : 0.1);
        }

        const { isError: _isError_guess, errorObject: _errorObject_guess, variants } = checkVariantsErrorIsArrayOrBoolean(_guess);

        if (_isError_guess) {
            return _errorObject_guess as ErrorValueObject;
        }

        const [guessObject] = variants as BaseValueObject[];

        const guessValue = +guessObject.getValue();

        if (Number.isNaN(guessValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const { positive, negative } = this._checkValues(_values as number[]);

        if (!positive || !negative || _values?.length !== _dates?.length || guessValue <= -1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const amounts = _values as number[];
        const serials = _dates as number[];
        if (serials.some((date) => date < serials[0] || date > 2_958_465)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        const result = solveXirr(amounts, serials, guessValue);
        return result === undefined ? ErrorValueObject.create(ErrorType.NUM) : NumberValueObject.create(result);
    }

    private _checkErrors(values: BaseValueObject, dates: BaseValueObject): ICheckErrorValues & ICheckErrorDates {
        if (values.isError()) {
            return {
                isError: true,
                errorObejct: values as ErrorValueObject,
            };
        }

        if (dates.isError()) {
            return {
                isError: true,
                errorObejct: dates as ErrorValueObject,
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

    private _checkErrorValues(values: BaseValueObject): ICheckErrorValues {
        const _values: number[] = [];

        if (values.isArray()) {
            let isError = false;
            let errorObejct = ErrorValueObject.create(ErrorType.VALUE);

            (values as ArrayValueObject).iterator((valuesObject) => {
                const _valuesObject = valuesObject as BaseValueObject;

                if (_valuesObject.isError()) {
                    isError = true;
                    errorObejct = _valuesObject as ErrorValueObject;
                    return false;
                }

                if (_valuesObject.isBoolean()) {
                    isError = true;
                    errorObejct = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                const value = +_valuesObject.getValue();

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

            if (_values.length <= 1) {
                return {
                    isError: true,
                    errorObejct: ErrorValueObject.create(ErrorType.NA),
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

    private _checkErrorDates(dates: BaseValueObject): ICheckErrorDates {
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

                const dateOffset = datesObject?.isString() && this.getDateSystem() === DateSystem.Date1904 ? EXCEL_1904_OFFSET : 0;
                _dates.push(Math.floor(datesValue) - dateOffset);
            });

            if (isError) {
                return {
                    isError,
                    errorObejct,
                };
            }

            if (_dates.length <= 1) {
                return {
                    isError: true,
                    errorObejct: ErrorValueObject.create(ErrorType.NA),
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

    private _checkValues(values: number[]): ICheckNumber {
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

function resolveArgument(arg: FunctionVariantType): BaseValueObject {
    if (!arg.isReferenceObject()) return arg as BaseValueObject;
    const array = (arg as BaseReferenceObject).toArrayValueObject();
    return array.getRowCount() === 1 && array.getColumnCount() === 1 ? array.getFirstCell() : array;
}

function solveXirr(amounts: number[], dates: number[], guess: number): number | undefined {
    if (!Number.isFinite(guess)) return;
    let rate = guess === 0 ? 1e-5 : guess;
    const initial = amounts[0];
    const nominal = amounts.slice(1).reduce((total, amount) => total + amount, 0);
    if (Math.abs(initial) > Math.abs(nominal) && rate > 0) rate = -rate;

    const years = dates.map((date) => (date - dates[0]) / 365);
    const negative = rate < 0;
    let lower = negative ? -1 : 0;
    let upper = 0;
    let bracketed = negative;
    for (let i = 0; i <= 100; i++) {
        let discounted = 0;
        for (let j = 1; j < amounts.length; j++) {
            discounted += amounts[j] / ((1 + rate) ** years[j]);
        }
        const residual = initial + discounted;
        if (bracketed && upper - lower < (1 + Math.abs(upper + lower)) * 1e-8
            && (!negative || Math.abs(residual) < (Math.abs(initial) + Math.abs(discounted)) * 1e-8)) {
            return rate;
        }
        if ((initial < 0 && residual > 0) || (initial > 0 && residual < 0)) {
            if (!bracketed) {
                rate *= 2;
                continue;
            }
            lower = rate;
        } else {
            upper = rate;
            bracketed = true;
        }
        rate = lower + (upper - lower) / 2;
    }
}
