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

export const SPREADSHEET_SIGNIFICANT_DIGITS = 15;

export interface IDecimalValue {
    readonly negative: boolean;
    readonly digits: string;
    readonly exponent: number;
}

export interface IRoundedDecimalParts {
    readonly negative: boolean;
    readonly integer: string;
    readonly fraction: string;
    readonly zero: boolean;
}

export interface IScientificDecimalParts {
    readonly exponent: number;
    readonly rounded: IRoundedDecimalParts;
}

export function decimalFromNumber(value: number): IDecimalValue {
    if (!Number.isFinite(value)) {
        throw new RangeError('decimalFromNumber requires a finite number');
    }

    const negative = value < 0 || Object.is(value, -0);
    if (value === 0) {
        return { negative, digits: '0', exponent: 0 };
    }

    const [mantissa, exponentText] = Math.abs(value)
        .toExponential(SPREADSHEET_SIGNIFICANT_DIGITS - 1)
        .split('e');
    const digits = mantissa.replace('.', '').replace(/0+$/, '') || '0';

    return {
        negative,
        digits,
        exponent: Number(exponentText),
    };
}

export function shiftDecimal(value: IDecimalValue, power: number): IDecimalValue {
    return {
        ...value,
        exponent: value.digits === '0' ? 0 : value.exponent + Math.trunc(power),
    };
}

function incrementDigits(value: string): string {
    const characters = [...value];
    for (let index = characters.length - 1; index >= 0; index--) {
        if (characters[index] !== '9') {
            characters[index] = String(Number(characters[index]) + 1);
            return characters.join('');
        }
        characters[index] = '0';
    }
    return `1${characters.join('')}`;
}

export function roundDecimal(value: IDecimalValue, places = 0): IRoundedDecimalParts {
    const normalizedPlaces = Math.trunc(places);
    const keep = value.exponent + 1 + normalizedPlaces;
    let units: string;

    if (keep < 0) {
        units = '0';
    } else if (keep === 0) {
        units = value.digits[0] >= '5' ? '1' : '0';
    } else {
        units = value.digits.slice(0, keep).padEnd(keep, '0') || '0';
        if (keep < value.digits.length && value.digits[keep] >= '5') {
            units = incrementDigits(units);
        }
    }

    const zero = /^0+$/.test(units);
    if (zero) {
        return { negative: value.negative, integer: '0', fraction: '', zero: true };
    }

    if (normalizedPlaces <= 0) {
        return {
            negative: value.negative,
            integer: units + '0'.repeat(-normalizedPlaces),
            fraction: '',
            zero: false,
        };
    }

    const fixed = units.padStart(normalizedPlaces + 1, '0');
    return {
        negative: value.negative,
        integer: fixed.slice(0, -normalizedPlaces),
        fraction: fixed.slice(-normalizedPlaces).replace(/0+$/, ''),
        zero: false,
    };
}

export function decimalPartsToNumber(value: IRoundedDecimalParts): number {
    const magnitude = Number(value.fraction ? `${value.integer}.${value.fraction}` : value.integer);
    return value.negative && !value.zero ? -magnitude : magnitude;
}

export function decimalPartsToPlainString(value: IRoundedDecimalParts): string {
    const sign = value.negative && !value.zero ? '-' : '';
    return `${sign}${value.integer}${value.fraction ? `.${value.fraction}` : ''}`;
}

export function roundScientificDecimal(
    value: IDecimalValue,
    integerDigits: number,
    hasIntegerPattern: boolean,
    fractionDigits: number
): IScientificDecimalParts {
    if (value.digits === '0') {
        return { exponent: 0, rounded: roundDecimal(value, fractionDigits) };
    }

    let exponent = integerDigits > 1
        ? Math.floor(value.exponent / integerDigits) * integerDigits
        : value.exponent;
    if (!hasIntegerPattern) {
        exponent++;
    }

    let rounded = roundDecimal(shiftDecimal(value, -exponent), fractionDigits);
    if (integerDigits === 1 && rounded.integer.length > 1) {
        exponent++;
        rounded = roundDecimal(shiftDecimal(value, -exponent), fractionDigits);
    }

    return { exponent, rounded };
}
