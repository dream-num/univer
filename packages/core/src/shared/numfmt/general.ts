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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

import type { IDecimalValue } from './decimal';
import type { LocaleData, ParsedFormatSection } from './types';
import {
    decimalPartsToPlainString,
    roundScientificDecimal,
} from './decimal';
import { numDec } from './num-dec';
import { getExponent, getSignificand } from './number-props';
import { round } from './round';

function fixLocale(value: string, locale: LocaleData): string {
    return value.replace(/\./, locale.decimal);
}

function getAbsoluteDecimal(value: IDecimalValue | null): IDecimalValue | null {
    if (!value) {
        return null;
    }
    return value.negative ? { ...value, negative: false } : value;
}

function getDecimalExponent(value: IDecimalValue | null): number {
    return value?.exponent ?? 0;
}

function usesShortestSignificand(value: IDecimalValue | null): boolean {
    return !value || value.exponent < -308;
}

function getExp(value: IDecimalValue, locale: LocaleData): Array<string | number> {
    const scientific = roundScientificDecimal(value, 1, true, 5);
    const exponent = scientific.exponent;
    const absoluteExponent = Math.abs(exponent);
    const mantissa = decimalPartsToPlainString(scientific.rounded);
    return [
        fixLocale(mantissa, locale),
        locale.exponent,
        exponent < 0 ? locale.negative : locale.positive,
        absoluteExponent < 10 ? '0' : '',
        absoluteExponent,
    ];
}

function getShortestExp(number: number, exponent: number, locale: LocaleData): Array<string | number> {
    const absoluteExponent = Math.abs(exponent);
    const mantissa = number === 1 ? number : Math.round(number * 100000) / 100000;
    return [
        fixLocale(String(mantissa), locale),
        locale.exponent,
        exponent < 0 ? locale.negative : locale.positive,
        absoluteExponent < 10 ? '0' : '',
        absoluteExponent,
    ];
}

export function general(
    output: Array<string | number>,
    part: Partial<ParsedFormatSection>,
    value: number | string,
    locale: LocaleData,
    decimalValue: IDecimalValue | null = null
): Array<string | number> {
    const integer = typeof value === 'number' ? value | 0 : 0;

    if (typeof value === 'string') {
        // special case for: [<-25]General;[>25]General;General;General
        output.push(value);
    } else if (value === integer) {
        output.push(Math.abs(integer));
    } else {
        const absoluteValue = Math.abs(value);
        const absoluteDecimal = getAbsoluteDecimal(decimalValue);
        let exponent = getDecimalExponent(absoluteDecimal);
        let shortestSignificand: number | null = null;
        if (usesShortestSignificand(absoluteDecimal)) {
            // Preserve pinned numfmt behavior for extreme subnormals, whose
            // shortest round-trip decimal differs from their 15-digit value,
            // and for converted BigInts without canonical decimal provenance.
            exponent = getExponent(absoluteValue);
            shortestSignificand = getSignificand(absoluteValue, exponent);
            if (shortestSignificand === 10) {
                shortestSignificand = 1;
                exponent++;
            }
        }

        // The application shall attempt to display the full number
        // up to 11 digits (inc. decimal point).
        const digits = numDec(absoluteValue);
        if (exponent >= -4 && exponent <= -1) {
            const formatted = absoluteValue.toPrecision(10 + exponent).replace(/\.?0+$/, '');
            output.push(fixLocale(formatted, locale));
        } else if (exponent === 10) {
            const formatted = absoluteValue.toFixed(10)
                .slice(0, 12)
                .replace(/\.$/, '');
            output.push(fixLocale(formatted, locale));
        } else if (Math.abs(exponent) <= 9) {
            if (digits.total <= 11) {
                const formatted = round(absoluteValue, 9).toFixed(digits.frac);
                output.push(fixLocale(formatted, locale));
            } else if (exponent === 9) {
                output.push(Math.floor(absoluteValue));
            } else if (exponent >= 0 && exponent < 9) {
                output.push(fixLocale(String(round(absoluteValue, 9 - exponent)), locale));
            } else {
                output.push(...(shortestSignificand === null
                    ? getExp(absoluteDecimal!, locale)
                    : getShortestExp(shortestSignificand, exponent, locale)));
            }
        } else if (digits.total >= 12) {
            output.push(...(shortestSignificand === null
                ? getExp(absoluteDecimal!, locale)
                : getShortestExp(shortestSignificand, exponent, locale)));
        } else {
            output.push(fixLocale(round(absoluteValue, 9).toFixed(digits.frac), locale));
        }
    }
    return output;
}
