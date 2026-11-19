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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantErrorIsArray, checkVariantsErrorIsArray, checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { round, roundHalfEven } from '../../../engine/utils/math-kit';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

interface IEuroCurrency {
    /** Units of the currency in one euro: its irrevocably fixed conversion rate. */
    rate: number;
    /** Decimal places a result in the currency is rounded to, Excel's calculation precision. */
    precision: number;
}

// The currencies Excel's EUROCONVERT accepts, by ISO code.
const EURO_CURRENCIES: Record<string, IEuroCurrency> = {
    BEF: { rate: 40.3399, precision: 0 },
    LUF: { rate: 40.3399, precision: 0 },
    DEM: { rate: 1.95583, precision: 2 },
    ESP: { rate: 166.386, precision: 0 },
    FRF: { rate: 6.55957, precision: 2 },
    IEP: { rate: 0.787564, precision: 2 },
    ITL: { rate: 1936.27, precision: 0 },
    NLG: { rate: 2.20371, precision: 2 },
    ATS: { rate: 13.7603, precision: 2 },
    PTE: { rate: 200.482, precision: 0 },
    FIM: { rate: 5.94573, precision: 2 },
    GRD: { rate: 340.75, precision: 0 },
    SIT: { rate: 239.64, precision: 2 },
    EUR: { rate: 1, precision: 2 },
};

const EURO = 'EUR';

const MIN_TRIANGULATION_PRECISION = 3;

// VBA's Integer upper bound: Excel converts the argument with CInt, so a larger value overflows.
const MAX_TRIANGULATION_PRECISION = 32767;

// Excel never rounds the intermediate euro value to more than 15 decimals.
const MAX_EURO_DECIMALS = 15;

// Rounds half away from zero, as Excel's ROUND does.
const roundHalfAwayFromZero = (value: number, decimals: number) => (value < 0 ? -round(-value, decimals) : round(value, decimals));

export class Euroconvert extends BaseFunction {
    override minParams = 3;

    override maxParams = 5;

    override calculate(
        number: BaseValueObject,
        source: BaseValueObject,
        target: BaseValueObject,
        fullPrecision?: BaseValueObject,
        triangulationPrecision?: BaseValueObject
    ): BaseValueObject {
        // Excel does not evaluate EUROCONVERT over arrays, so a multi-cell argument is an invalid one.
        const { isError, errorObject, variants } = checkVariantsErrorIsArray(number, source, target, fullPrecision ?? BooleanValueObject.create(false));

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject, sourceObject, targetObject, fullPrecisionObject] = variants as BaseValueObject[];

        const { isError: isNotNumeric, errorObject: notNumericObject, variants: numericVariants } = checkVariantsErrorIsStringToNumber(numberObject, fullPrecisionObject);

        if (isNotNumeric) {
            return notNumericObject as ErrorValueObject;
        }

        const [numericNumberObject, numericFullPrecisionObject] = numericVariants as BaseValueObject[];

        const numberValue = +numericNumberObject.getValue();
        const isFullPrecision = +numericFullPrecisionObject.getValue() !== 0;
        const sourceCurrency = this._getCurrency(sourceObject);
        const targetCurrency = this._getCurrency(targetObject);

        if (Number.isNaN(numberValue) || !sourceCurrency || !targetCurrency) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const triangulationDecimals = this._getTriangulationDecimals(triangulationPrecision);

        if (typeof triangulationDecimals !== 'number' && triangulationDecimals !== null) {
            return triangulationDecimals;
        }

        // The same currency on both sides returns the number as it is, without rounding.
        if (sourceCurrency === targetCurrency) {
            return NumberValueObject.create(numberValue);
        }

        let result: number;

        if (sourceCurrency === EURO_CURRENCIES[EURO]) {
            result = numberValue * targetCurrency.rate;
        } else {
            // Member currencies convert through the euro, and only that intermediate value is rounded.
            let euros = numberValue / sourceCurrency.rate;

            if (triangulationDecimals !== null) {
                euros = roundHalfAwayFromZero(euros, triangulationDecimals);
            }

            result = euros * targetCurrency.rate;
        }

        if (!isFullPrecision) {
            result = roundHalfAwayFromZero(result, targetCurrency.precision);
        }

        return NumberValueObject.create(result);
    }

    private _getCurrency(code: BaseValueObject): IEuroCurrency | undefined {
        if (!code.isString()) {
            return undefined;
        }

        const isoCode = `${code.getValue()}`.toUpperCase();

        return Object.prototype.hasOwnProperty.call(EURO_CURRENCIES, isoCode) ? EURO_CURRENCIES[isoCode] : undefined;
    }

    /**
     * The decimals the intermediate euro value is rounded to, `null` when the argument is
     * omitted, or the error it produces.
     */
    private _getTriangulationDecimals(triangulationPrecision?: BaseValueObject): number | null | ErrorValueObject {
        if (!triangulationPrecision) {
            return null;
        }

        const precisionObject = checkVariantErrorIsArray(triangulationPrecision);

        if (precisionObject.isError()) {
            return precisionObject as ErrorValueObject;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(precisionObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const precision = +(variants as BaseValueObject[])[0].getValue();

        if (Number.isNaN(precision)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // Excel converts the argument with VBA's CInt: 3.5 becomes 4 and 2.5 becomes 2.
        const decimals = roundHalfEven(precision, 0);

        if (decimals > MAX_TRIANGULATION_PRECISION) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (decimals < MIN_TRIANGULATION_PRECISION) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return Math.min(decimals, MAX_EURO_DECIMALS);
    }
}
