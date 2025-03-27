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

/**
 * Since Excel follows the IEEE 754 specification, it only handles precision issues when displaying cells. For example, =0.1+0.2, the stored value in XML is 0.30000000000000004, and the displayed value is 0.3. The accuracy of the calculation process does not need to be considered. We only focus on the accuracy of the calculation results. Any result is processed within 15 digits.

 Reference https://en.wikipedia.org/wiki/Numeric_precision_in_Microsoft_Excel
 */

import Decimal from 'decimal.js';

export function plus(a: number, b: number): number {
    const result = a + b;
    if (Number.isSafeInteger(result)) {
        return result;
    }
    return new Decimal(a).add(b).toNumber();
}

export function minus(a: number, b: number): number {
    const result = a - b;
    if (Number.isSafeInteger(result)) {
        return result;
    }
    return new Decimal(a).sub(b).toNumber();
}

export function multiply(a: number, b: number): number {
    const result = a * b;
    if (Number.isSafeInteger(result)) {
        return result;
    }
    return new Decimal(a).mul(b).toNumber();
}

export function divide(a: number, b: number): number {
    const result = a / b;
    if (Number.isSafeInteger(result)) {
        return result;
    }
    return new Decimal(a).div(b).toNumber();
}
/**
 * Rounds a number to a specified number of decimal places.
 * @param base The number to round.
 * @param precision The number of decimal places to round to.
 * @returns The rounded number.
 */
export function round(base: number, precision: number): number {
    const factor = 10 ** Math.trunc(precision);
    const epsilon = baseEpsilon(base, factor);
    return Math.round(multiply(base, factor) + epsilon) / factor;
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

/**
 * Raises a base number to the power of the exponent.
 *
 * @param base The base number.
 * @param exponent The exponent.
 * @returns The result of base raised to the power of exponent.
 */
export function pow(base: number, exponent: number): number {
    return base ** exponent;
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
    return a === b;
}

/**
 * Checks if the first number is greater than the second number.
 * @param a The first number.
 * @param b The second number.
 * @returns True if a is greater than b, false otherwise.
 */
export function greaterThan(a: number, b: number): boolean {
    return a > b;
}

/**
 * Checks if the first number is greater than or equal to the second number.
 * @param a The first number.
 * @param b The second number.
 * @returns True if a is greater than or equal to b, false otherwise.
 */
export function greaterThanOrEquals(a: number, b: number): boolean {
    return a >= b;
}

/**
 * Checks if the first number is less than the second number.
 * @param a The first number.
 * @param b The second number.
 * @returns True if a is less than b, false otherwise.
 */
export function lessThan(a: number, b: number): boolean {
    return a < b;
}

/**
 * Checks if the first number is less than or equal to the second number.
 * @param a The first number.
 * @param b The second number.
 * @returns True if a is less than or equal to b, false otherwise.
 */
export function lessThanOrEquals(a: number, b: number): boolean {
    return a <= b;
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
