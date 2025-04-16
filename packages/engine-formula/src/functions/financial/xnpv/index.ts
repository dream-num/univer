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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

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

export class Xnpv extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(rate: BaseValueObject, values: BaseValueObject, dates: BaseValueObject): BaseValueObject {
        if (rate.isNull() || values.isNull() || dates.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const { isError: _isError_rate, errorObject: _errorObject_rate, variants } = checkVariantsErrorIsArrayOrBoolean(rate);

        if (_isError_rate) {
            return _errorObject_rate as ErrorValueObject;
        }

        const [rateObject] = variants as BaseValueObject[];

        const rateValue = +rateObject.getValue();

        if (Number.isNaN(rateValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let { isError, errorObejct, _values, _dates } = this._checkErrors(values, dates);

        if (isError) {
            return errorObejct as ErrorValueObject;
        }

        _values = _values as number[];
        _dates = _dates as number[];

        if (rateValue < 0 || _values.length !== _dates.length) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result = 0;
        const d1 = _dates[0];

        for (let i = 0; i < _dates.length; i++) {
            const di = _dates[i];
            const Pi = _values[i];

            result += Pi / ((1 + rateValue) ** ((di - d1) / 365));
        }

        return NumberValueObject.create(result);
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

                if (_valuesObject.isNull() || _valuesObject.isBoolean()) {
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

            if (values.isNull() || values.isBoolean() || (values.isString() && !isRealNum(valuesValue))) {
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
                const _datesObject = datesObject as BaseValueObject;

                if (_datesObject.isError()) {
                    isError = true;
                    errorObejct = _datesObject as ErrorValueObject;
                    return false;
                }

                if (_datesObject.isNull() || _datesObject.isBoolean()) {
                    isError = true;
                    errorObejct = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                const datesValue = +_datesObject.getValue();

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

                _dates.push(Math.floor(datesValue));
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

            if (dates.isNull() || dates.isBoolean() || (dates.isString() && !isRealNum(datesValue))) {
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
}
