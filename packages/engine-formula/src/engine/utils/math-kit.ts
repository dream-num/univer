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
 * Handle addition, subtraction, multiplication and division of floating-point numbers to avoid loss of precision. The method here cannot guarantee complete accuracy.
 *
 * Learn more https://zhuanlan.zhihu.com/p/100353781
 */
interface IntegerTransform {
    times: number;
    num: number;
}

enum Operation {
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
}

function toInteger(floatNum: number): IntegerTransform {
    const isNegative = floatNum < 0;
    if (Number.isInteger(floatNum)) {
        return { times: 1, num: floatNum };
    }

    const eSplit = floatNum.toString().split(/[eE]/);
    const len = (eSplit[0].split('.')[1] || '').length - +(eSplit[1] || 0);
    const times = 10 ** (len > 0 ? len : 0);

    /* Why add 0.5?
    Multiplication can also cause precision problems
    Assume that 0.16344556 is passed in and the multiple is 100000000
    Math.abs(0.16344556) * 100000000=0.16344556*10000000=1634455.5999999999
    0.0000000001 is missing
    Add 0.5 0.16344556*10000000+0.5=1634456.0999999999 After parseInt, the precision problem of multiplication is corrected
    */
    const intNum = Number.parseInt((Math.abs(floatNum) * times + 0.5).toString(), 10);

    return {
        times,
        num: isNegative ? -intNum : intNum,
    };
}

/**
 * Core method to implement plus, minus, multiply and divide operations to ensure no loss of precision
 *
 * 1. Enlarge the decimal to an integer (multiplication), perform arithmetic operations, and then reduce it to a decimal (division)
   2. Truncate the result value to the first 12 digits. If the error is acceptable, it means there is still a precision problem. Take the truncated value
 * @param a
 * @param b
 * @param op
 * @returns
 */
function operation(a: number, b: number, op: Operation): number {
    const o1 = toInteger(a);
    const o2 = toInteger(b);
    const t1 = o1.times;
    const t2 = o2.times;
    const max = Math.max(t1, t2);
    let result: number;

    switch (op) {
        case Operation.PLUS:
            result = t1 === t2 ? o1.num + o2.num : t1 > t2 ? o1.num + o2.num * (t1 / t2) : o1.num * (t2 / t1) + o2.num;
            result /= max;
            break;
        case Operation.MINUS:
            result = t1 === t2 ? o1.num - o2.num : t1 > t2 ? o1.num - o2.num * (t1 / t2) : o1.num * (t2 / t1) - o2.num;
            result /= max;
            break;
        case Operation.MULTIPLY:
            result = (o1.num * o2.num) / (t1 * t2);
            break;
        case Operation.DIVIDE:
            result = (o1.num / o2.num) * (t2 / t1);
            break;
        default:
            throw new Error("Operation must be 'plus', 'minus', 'multiply', or 'divide'");
    }

    // Why 12?
    // This is an empirical choice. Generally, choosing 12 can solve most of the 0001 and 0009 problems. e.g. 0.07/0.1 = 0.7000000000000001
    const stripResult = strip(result, 12);
    if (withinErrorMargin(result, stripResult)) {
        return stripResult;
    }
    return result;
}

export function plus(a: number, b: number): number {
    return operation(a, b, Operation.PLUS);
}

export function minus(a: number, b: number): number {
    return operation(a, b, Operation.MINUS);
}

export function multiply(a: number, b: number): number {
    return operation(a, b, Operation.MULTIPLY);
}

export function divide(a: number, b: number): number {
    return operation(a, b, Operation.DIVIDE);
}

/**
 * Rounds a number to a specified number of decimal places.
 * @param base The number to round.
 * @param precision The number of decimal places to round to.
 * @returns The rounded number.
 */
export function round(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.round(multiply(base, factor)) / factor;
}

/**
 * Rounds down a number to a specified number of decimal places.
 * @param base The number to round down.
 * @param precision The number of decimal places to round down to.
 * @returns The floored number.
 */
export function floor(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.floor(multiply(base, factor)) / factor;
}

/**
 * Rounds up a number to a specified number of decimal places.
 * @param base The number to round up.
 * @param precision The number of decimal places to round up to.
 * @returns The ceiled number.
 */
export function ceil(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.ceil(multiply(base, factor)) / factor;
}

/**
 * Returns the remainder of division of two numbers.
 * @param base The dividend.
 * @param divisor The divisor.
 * @returns The remainder.
 */
export function mod(base: number, divisor: number): number {
    return base % divisor;
}

/**
 * Raises a base number to the power of the exponent.
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
 * e.g. strip(0.30000000000000004,16) => 0.3
 *
 * Why precision is 16?
 *
 * Excel only saves 15 digits, in order to ensure that 15 digits can be intercepted normally, the accuracy is handled by 16 digits
 *
  reference: https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
 * @param num
 * @param precision
 * @returns
 */
export function strip(num: number, precision = 16) {
    return Number.parseFloat(num.toPrecision(precision));
}

/**
 * Set an error range for floating-point calculations. If the error is less than Number.EPSILON, we can consider the result reliable.
 * @param left
 * @param right
 * @returns
 */
function withinErrorMargin(left: number, right: number) {
    return Math.abs(left - right) < Number.EPSILON;
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
