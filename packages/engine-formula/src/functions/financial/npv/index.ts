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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { getCurrencyFormat } from '../../../engine/utils/numfmt-kit';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

// Core formula: same as Excel NPV
function calculateNpv(rate: number, values: number[]): number {
    let npv = 0;
    for (let i = 0; i < values.length; i++) {
        // Excel: first cash flow occurs at end of period 1 → exponent starts at 1
        npv += values[i] / (1 + rate) ** (i + 1);
    }
    return npv;
}

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
            return (rate as ArrayValueObject).map((rateObject, rowIndex, columnIndex) =>
                this._handleSingleObject(rateObject, isError, errorObject, values, rowIndex, columnIndex)
            );
        }

        return this._handleSingleObject(rate, isError, errorObject, values);
    }

    private _handleSingleObject(
        rateObj: BaseValueObject,
        isError: boolean,
        errorObject: ErrorValueObject | undefined,
        values: number[] | undefined,
        rowIndex: number = 0,
        columnIndex: number = 0
    ): BaseValueObject {
        if (rateObj.isString()) {
            // Excel: string cannot be used; text is ignored → but rate cannot be text → #VALUE!
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (rateObj.isError()) {
            return rateObj;
        }

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const rateValue = +rateObj.getValue();

        if (Number.isNaN(rateValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = calculateNpv(rateValue, values as number[]);

        if (!Number.isFinite(result)) {
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
            const v = variants[i];

            if (v.isError()) {
                return { isError: true, errorObject: v as ErrorValueObject };
            }

            // Array parameter
            if (v.isArray()) {
                let hasErr = false;
                let errObj: ErrorValueObject | undefined;

                (v as ArrayValueObject).iterator((item) => {
                    const obj = item as BaseValueObject;

                    if (obj.isError()) {
                        hasErr = true;
                        errObj = obj as ErrorValueObject;
                        return false;
                    }

                    if (obj.isNull() || obj.isBoolean() || obj.isString()) {
                        // Excel: ignore empty + boolean + ANY text (including "123")
                        return true;
                    }

                    const num = +obj.getValue();
                    if (Number.isFinite(num)) {
                        values.push(num);
                    }
                    // If NaN: ignore
                    return true;
                });

                if (hasErr) {
                    return { isError: true, errorObject: errObj };
                }
            } else {
                // Scalar parameter
                if (v.isNull() || v.isBoolean() || v.isString()) {
                    // Excel: ignore
                    continue;
                }

                const num = +v.getValue();
                if (Number.isNaN(num)) {
                    // Excel: ignore
                    continue;
                }

                values.push(num);
            }
        }

        return { isError: false, values };
    }
}
