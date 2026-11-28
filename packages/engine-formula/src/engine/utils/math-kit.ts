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

import { ErrorType } from '../../basics/error-type';
import { fractionalPower } from './fractional-power';

export const EXCEL_MIN_NORMAL_NUMBER = 2 ** -1022;

/**
 * Since Excel follows the IEEE 754 specification, it only handles precision issues when displaying cells. For example, =0.1+0.2, the stored value in XML is 0.30000000000000004, and the displayed value is 0.3. The accuracy of the calculation process does not need to be considered. We only focus on the accuracy of the calculation results. Any result is processed within 15 digits.

 Reference https://en.wikipedia.org/wiki/Numeric_precision_in_Microsoft_Excel
 */

export function plus(a: number, b: number): number {
    return a + b;
}

export function minus(a: number, b: number): number {
    return a - b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

export function divide(a: number, b: number): number {
    return a / b;
}
/**
 * Rounds a number to a specified number of decimal places.
 * @param base The number to round.
 * @param precision The number of decimal places to round to.
 * @returns The rounded number.
 */
export function round(base: number, precision: number): number {
    if (!Number.isFinite(base) || !Number.isFinite(precision)) return NaN;
    if (base === 0) return 0;
    // Excel first rounds the binary64 input to 15 decimal significant digits, then rounds the requested place.
    const [mantissa, exponent] = Math.abs(base).toExponential(14).split('e');
    const places = Math.max(-0x7FFFFFFF, Math.min(0x7FFFFFFF, Math.trunc(precision)));
    // Excel calculates the retained digit count with signed 32-bit addition after saturating the input.
    const retained = (Number(exponent) + places + 1) | 0;
    if (retained >= 15) return Math.sign(base) * Number(`${mantissa}e${exponent}`);
    if (retained < 0) return Math.sign(base) * 0;

    const digits = mantissa.replace('.', '');
    const rounded = Number(digits.slice(0, retained)) + Number(digits[retained] >= '5');
    return Math.sign(base) * Number(`${rounded}e${-places}`);
}

/**
 * Rounds a number to a specified number of decimal places, halves to even ('banker's rounding').
 * @param base The number to round.
 * @param precision The number of decimal places to round to.
 * @returns The rounded number.
 */
export function roundHalfEven(base: number, precision: number): number {
    const factor = 10 ** Math.trunc(precision);
    // logic is:
    // If the digit to be rounded is 4 or less than, it is discarded.
    // If the digit to be rounded is 6 or greater, it rounds up.
    // If the digit to be rounded is exactly 5:
    // If there are any digits following the 5, it rounded up.
    // If there are no digits following the 5, If the preceding digit is odd, it rounds up. If the preceding digit is even, it is discarded.
    // 2.345 * 100 is 234.49999999999997, which still stands for an exact half in decimal terms.
    const scaled = +multiply(base, factor).toFixed(8);
    const lower = Math.floor(scaled);
    const decimalPart = scaled - lower;

    if (Math.abs(decimalPart - 0.5) > 1e-8) {
        return Math.round(scaled) / factor;
    }

    return (lower % 2 === 0 ? lower : lower + 1) / factor;
}

/**
 * Rounds down a number to a specified number of decimal places.
 * @param base The number to round down.
 * @param precision The number of decimal places to round down to.
 * @returns The floored number.
 */
export function floor(base: number, precision: number): number {
    const factor = 10 ** Math.trunc(precision);
    const epsilon = baseEpsilon(base, factor);
    return Math.floor(multiply(base, factor) + epsilon) / factor;
}

/**
 * Rounds up a number to a specified number of decimal places.
 * @param base The number to round up.
 * @param precision The number of decimal places to round up to.
 * @returns The ceiled number.
 */
export function ceil(base: number, precision: number): number {
    const factor = 10 ** Math.trunc(precision);
    const epsilon = baseEpsilon(base, factor);
    return Math.ceil(multiply(base, factor) - epsilon) / factor;
}

export function baseEpsilon(base: number, factor: number) {
    return Number.EPSILON * Math.max(1, Math.abs(multiply(base, factor)));
}

/**
 * Returns the remainder of division of two numbers.
 * @param base The dividend.
 * @param divisor The divisor.
 * @returns The remainder.
 */
export function mod(base: number, divisor: number): number {
    return base - divisor * Math.floor(base / divisor);
}

// Use binary multiplication in Excel's order while the exponent fits its unsigned integer fast path.
function integerPower(base: number, exponent: number): number {
    if (base === 10 && exponent > 22) {
        if (exponent > 308) return Infinity;
        // Excel's positive powers of ten match rounding first to 64 significand bits, then to binary64.
        const exact = 10n ** BigInt(exponent);
        const discardedBits = BigInt(exact.toString(2).length - 64);
        const half = 1n << (discardedBits - 1n);
        const lastRetainedBit = (exact >> discardedBits) & 1n;
        const rounded = (exact + half - 1n + lastRetainedBit) >> discardedBits;
        return Number(rounded << discardedBits);
    }
    let product = 1;
    let factor = base;
    for (let remaining = exponent; remaining > 0; remaining = Math.floor(remaining / 2)) {
        if (remaining % 2 === 1) product *= factor;
        if (remaining > 1) factor *= factor;
    }
    return product;
}

export function pow(base: number, exponent: number): number {
    if (base === 0 || !Number.isFinite(base) || !Number.isFinite(exponent)) return base ** exponent;
    const magnitude = Math.abs(exponent);
    let result: number;
    if (magnitude === 0.5) {
        result = Math.sqrt(base);
    } else if (Number.isInteger(magnitude) && magnitude < 0xFFFFFFFF) {
        result = integerPower(base, magnitude);
    } else {
        if (base < 0 && !Number.isInteger(magnitude)) return NaN;
        result = fractionalPower(Math.abs(base), magnitude);
        if (base < 0 && magnitude % 2 === 1) result = -result;
    }
    return exponent < 0 ? 1 / result : result;
}

function negativeBasePowerSign(magnitude: number): number {
    if (magnitude >= 0xFFFFFFFF) return NaN;
    if (Number.isInteger(magnitude)) return magnitude % 2 === 1 ? -1 : 1;
    // Excel accepts odd roots after rounding the reciprocal to 15 significant digits.
    const denominator = Number((1 / magnitude).toPrecision(15));
    return denominator < 0x7FFFFFFF && denominator % 2 === 1 ? -1 : NaN;
}

export function excelPowerValue(base: number, exponent: number): number | ErrorType {
    if (!Number.isFinite(base) || !Number.isFinite(exponent)) return ErrorType.NUM;
    if (exponent === 0) return base === 0 ? ErrorType.NUM : 1;
    if (base === 0) return exponent < 0 ? ErrorType.DIV_BY_ZERO : 0;

    const magnitude = Math.abs(exponent);
    const integral = Number.isInteger(magnitude);
    const sign = base < 0 ? negativeBasePowerSign(magnitude) : 1;
    if (Number.isNaN(sign)) return ErrorType.NUM;
    let result = Math.abs(pow(integral ? base : Math.abs(base), magnitude));
    // Excel treats overflow of the logarithm-times-exponent intermediate as an overflowing positive power.
    if (Number.isNaN(result)) return exponent < 0 ? 0 : ErrorType.NUM;
    if (exponent < 0) {
        // Excel flushes a subnormal denominator before taking a reciprocal.
        if (result < EXCEL_MIN_NORMAL_NUMBER) return ErrorType.DIV_BY_ZERO;
        result = 1 / result;
    }
    if (!Number.isFinite(result)) return ErrorType.NUM;
    if ((integral || exponent < 0) && result < EXCEL_MIN_NORMAL_NUMBER) return 0;
    return sign * result;
}

/**
 * Calculates the square root of a number.
 * @param base The number to take the square root of.
 * @returns The square root of base.
 */
export function sqrt(base: number): number {
    return Math.sqrt(base);
}

/**
 * Compares two numbers for equality.
 * @param a The first number.
 * @param b The second number.
 * @returns True if numbers are equal, false otherwise.
 */
export function equals(a: number, b: number): boolean {
    return a === b || stripErrorMargin(a) === stripErrorMargin(b);
}

/**
 * Checks if the first number is greater than the second number.
 * @param a The first number.
 * @param b The second number.
 * @returns True if a is greater than b, false otherwise.
 */
export function greaterThan(a: number, b: number): boolean {
    return !equals(a, b) && stripErrorMargin(a) > stripErrorMargin(b);
}

/**
 * Checks if the first number is greater than or equal to the second number.
 * @param a The first number.
 * @param b The second number.
 * @returns True if a is greater than or equal to b, false otherwise.
 */
export function greaterThanOrEquals(a: number, b: number): boolean {
    return equals(a, b) || stripErrorMargin(a) > stripErrorMargin(b);
}

/**
 * Checks if the first number is less than the second number.
 * @param a The first number.
 * @param b The second number.
 * @returns True if a is less than b, false otherwise.
 */
export function lessThan(a: number, b: number): boolean {
    return !equals(a, b) && stripErrorMargin(a) < stripErrorMargin(b);
}

/**
 * Checks if the first number is less than or equal to the second number.
 * @param a The first number.
 * @param b The second number.
 * @returns True if a is less than or equal to b, false otherwise.
 */
export function lessThanOrEquals(a: number, b: number): boolean {
    return equals(a, b) || stripErrorMargin(a) < stripErrorMargin(b);
}

/**
 * Complete the number to the specified accuracy and solve the accuracy error,
 *
 * e.g. strip(0.30000000000000004,15) => 0.3
 *
 * Why precision is 15?
 *
 * Excel only saves 15 digits
 *
  reference: https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
 * @param num
 * @param precision
 * @returns
 */
export function strip(num: number, precision = 15) {
    // If the integer part of the number is greater than or equal to the precision, return the number directly
    // e.g. 1212121212121212 should not be displayed as 1212121212121210
    if (Math.floor(Math.abs(num)).toString().length >= precision) {
        return num;
    }

    return Number.parseFloat(num.toPrecision(precision));
}

/**
 * Set an error range for floating-point calculations. If the error is less than Number.EPSILON, we can consider the result reliable.
 * @param left
 * @param right
 * @returns
 */
export function withinErrorMargin(left: number, right: number, tolerance = Number.EPSILON) {
    return Math.abs(left - right) < tolerance;
}

/**
 * Tolerance for the results of accuracy issues to tolerate certain errors
 *
 * Why is precision 12?
   This is an empirical choice. Generally, choosing 12 can solve most of the 0001 and 0009 problems. e.g. floor(5,1.23) = 0.0800000000000001

   why is tolerance 1e-10?
   Since the value of Number.EPSILON is too small to be applicable to all floating-point precision processing, for most application scenarios, the error range of 1e-10 can tolerate common floating-point errors.
   For example, =30.2 - 30 displayed as 0.2 in Excel
 * @param num
 * @param precision
 * @param tolerance
 * @returns
 */
export function stripErrorMargin(num: number, precision = 12, tolerance = 1e-10) {
    const stripResult = strip(num, precision);
    return withinErrorMargin(num, stripResult, tolerance) ? stripResult : strip(num);
}

/**
 * Get the fractional part of the number
 * @param num
 * @returns
 */
export function getFractionalPart(num: number): number {
    return num - Math.trunc(num);
}
