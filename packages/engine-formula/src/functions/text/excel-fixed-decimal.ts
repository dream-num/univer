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

import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { getCurrencySymbolByLocale } from '@univerjs/core';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NullValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { mapFinancialScalars } from '../financial/scalar-arguments';

export function formatExcelFixedDecimal(value: number, decimals: number, groupThousands: boolean): string {
    const [mantissa, exponent] = Math.abs(value).toExponential(14).split('e');
    const digits = mantissa.replace('.', '');
    const cutoff = Number(exponent) + 1 + decimals;
    const retained = Number(digits.slice(0, Math.max(0, cutoff))) + (cutoff >= 0 && digits[cutoff] >= '5' ? 1 : 0);
    const trailingZeros = retained ? Math.max(0, cutoff - digits.length) + Math.max(0, -decimals) : 0;
    const decimalPlaces = Math.max(0, decimals);
    const padded = (String(retained) + '0'.repeat(trailingZeros)).padStart(decimalPlaces + 1, '0');
    const point = padded.length - decimalPlaces;
    const sign = value < 0 && retained !== 0 ? '-' : '';
    const whole = padded.slice(0, point);
    const integer = groupThousands ? whole.replace(/\B(?=(?:\d{3})+(?!\d))/g, ',') : whole;
    return `${sign}${integer}${decimalPlaces ? `.${padded.slice(point)}` : ''}`;
}

export class ExcelFixed extends BaseFunction {
    override minParams = 1;
    override maxParams = 3;
    protected readonly _currency: boolean = false;

    override calculate(...args: BaseValueObject[]): BaseValueObject {
        return mapFinancialScalars(args, (cells) => this._format(cells));
    }

    private _format(cells: BaseValueObject[]): BaseValueObject {
        const error = cells.find((cell) => cell.isError());
        if (error) return error;
        const [value, decimals, noCommas] = cells;
        const numberValue = value.convertToNumberObjectValue();
        if (numberValue.isError()) return numberValue;
        const number = Number(numberValue.getValue());
        const omittedDecimals = decimals === undefined || (!this._currency && decimals instanceof NullValueObject && decimals.isOmitted());
        const digitsValue = omittedDecimals ? undefined : decimals.convertToNumberObjectValue();
        if (digitsValue?.isError()) return digitsValue;
        const digits = digitsValue === undefined ? 2 : Math.trunc(Number(digitsValue.getValue()));
        if (!Number.isFinite(number) || !Number.isFinite(digits) || digits > 127) return ErrorValueObject.create(ErrorType.VALUE);

        let skipGrouping = Boolean(noCommas?.getValue());
        if (noCommas?.isString()) {
            const logical = String(noCommas.getValue()).toUpperCase();
            if (logical !== 'TRUE' && logical !== 'FALSE') return ErrorValueObject.create(ErrorType.VALUE);
            skipGrouping = logical === 'TRUE';
        }

        if (!this._currency) {
            const formatted = formatExcelFixedDecimal(number, digits, !skipGrouping);
            return formatted.length > 255 ? ErrorValueObject.create(ErrorType.VALUE) : StringValueObject.create(formatted);
        }

        const decimal = formatExcelFixedDecimal(Math.abs(number), digits, true);
        const amount = `${getCurrencySymbolByLocale(this.getLocale())}${decimal}`;
        const negative = number < 0 && (digits >= 0 || decimal !== '0');
        if (amount.length + (negative ? 2 : 1) > 255) return ErrorValueObject.create(ErrorType.VALUE);
        return StringValueObject.create(negative ? `(${amount})` : amount);
    }
}

export class ExcelDollar extends ExcelFixed {
    override maxParams = 2;
    override needsLocale = true;
    protected override readonly _currency: boolean = true;
}
