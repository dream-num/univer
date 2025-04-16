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
import { calculateNpv } from '../../../basics/financial';
import { getCurrencyFormat } from '../../../engine/utils/numfmt-kit';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

interface IValuesType {
    isError: boolean;
    errorObject?: ErrorValueObject;
    values?: number[];
}

export class Npv extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override needsLocale = true;

    override calculate(rate: BaseValueObject, ...variants: BaseValueObject[]): BaseValueObject {
        if (rate.isError()) {
            return rate;
        }

        const { isError, errorObject, values } = this._getValues(variants);

        if (rate.isArray()) {
            return (rate as ArrayValueObject).map((rateObject, rowIndex, columnIndex) => this._handleSingleObject(rateObject, isError, errorObject, values, rowIndex, columnIndex));
        }

        return this._handleSingleObject(rate, isError, errorObject, values);
    }

    private _handleSingleObject(
        rate: BaseValueObject,
        isError: boolean,
        errorObject: ErrorValueObject | undefined,
        values: number[] | undefined,
        rowIndex: number = 0,
        columnIndex: number = 0
    ): BaseValueObject {
        let _rate = rate;

        if (_rate.isString()) {
            _rate = _rate.convertToNumberObjectValue();
        }

        if (_rate.isError()) {
            return _rate;
        }

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const rateValue = +rate.getValue();

        const result = calculateNpv(rateValue, values as number[]);

        if (Number.isNaN(result) || Math.abs(result) === Infinity) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        if (rowIndex === 0 && columnIndex === 0) {
            return NumberValueObject.create(result, getCurrencyFormat(this.getLocale()));
        }

        return NumberValueObject.create(result);
    }

    private _getValues(variants: BaseValueObject[]): IValuesType {
        const values: number[] = [];

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isError()) {
                return {
                    isError: true,
                    errorObject: variant as ErrorValueObject,
                };
            }

            if (variant.isArray()) {
                let isError = false;
                let errorObject = ErrorValueObject.create(ErrorType.VALUE);

                (variant as ArrayValueObject).iterator((variantOject) => {
                    const _variantOject = variantOject as BaseValueObject;

                    if (_variantOject.isError()) {
                        isError = true;
                        errorObject = _variantOject as ErrorValueObject;
                        return false;
                    }

                    if (_variantOject.isNull() || _variantOject.isBoolean()) {
                        return true;
                    }

                    const value = +_variantOject.getValue();

                    if (Number.isNaN(value)) {
                        return true;
                    }

                    values.push(value);
                });

                if (isError) {
                    return {
                        isError,
                        errorObject,
                    };
                }
            } else {
                const value = +variant.getValue();

                if (Number.isNaN(value)) {
                    return {
                        isError: true,
                        errorObject: ErrorValueObject.create(ErrorType.VALUE),
                    };
                }

                values.push(value);
            }
        }

        return {
            isError: false,
            values,
        };
    }
}
