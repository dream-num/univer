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

import Big from 'big.js';

/**
 * Packaging basic mathematical calculation methods, adding precision parameters and solving native JavaScript precision problems
 */

/**
 * Native JavaScript: 0.6789 * 10000 = 6788.999999999999
 *
 * @param a
 * @param b
 * @returns
 */
export function multiply(a: number, b: number): number {
    return Big(a).times(b).toNumber();
}

export function round(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.round(multiply(base, factor)) / factor;
}

export function floor(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.floor(multiply(base, factor)) / factor;
}

export function ceil(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.ceil(multiply(base, factor)) / factor;
}

export function mod(base: number, divisor: number): number {
    const bigNumber = new Big(base);
    const bigDivisor = new Big(divisor);

    const quotient = Math.floor(base / divisor);

    const result = bigNumber.minus(bigDivisor.times(quotient));

    return result.toNumber();
}

export function pow(base: number, exponent: number): number {
    return base ** exponent;
}

/**
 * Excel can display numbers with up to about 15 digits of precision. This includes the sum of the integer part and the decimal part
 * @param input
 * @returns
 */
export function truncateNumber(input: number | string): number {
    const num = new Big(input);
    const numStr = num.toFixed(); // Convert to fixed-point notation

    const parts = numStr.split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    // Handle integer part greater than 15 digits
    if (integerPart.length > 15) {
        integerPart = integerPart.slice(0, 15) + '0'.repeat(integerPart.length - 15);
    }

    // Handle decimal part for numbers with an integer part of '0' and leading zeros
    if (integerPart === '0') {
        const nonZeroIndex = decimalPart.search(/[1-9]/); // Find the first non-zero digit
        if (nonZeroIndex !== -1 && nonZeroIndex + 15 < decimalPart.length) {
            decimalPart = decimalPart.slice(0, nonZeroIndex + 15);
        }
    } else if (integerPart.length + decimalPart.length > 15) {
        // Adjust decimal part if total length exceeds 15
        decimalPart = decimalPart.slice(0, 15 - integerPart.length);
    }

    // Convert back to number, may cause precision loss for very large or small numbers
    return Number.parseFloat(integerPart + (decimalPart ? `.${decimalPart}` : ''));
}
