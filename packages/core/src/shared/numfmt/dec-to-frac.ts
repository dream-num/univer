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

// https://web.archive.org/web/20110813042636/http://homepage.smc.edu/kennedy_john/DEC2FRAC.PDF
const PRECISION = 1e-13;

/**
 * Split a fractional number into a numerator and denominator for display as
 * vulgar fractions.
 *
 * @ignore
 * @param {number} number The value to split
 * @param {number} [numeratorMaxDigits] The maxdigits number
 * @param {number} [denominatorMaxDigits] The maxdigits de
 * @returns {Array<number>} Array of two numbers, numerator and denominator.
 */
export function dec2frac(
    number: number,
    numeratorMaxDigits: number = 2,
    denominatorMaxDigits: number = 2
): [number, number] {
    const sign = number < 0 ? -1 : 1;
    const maxdigits_n = 10 ** (numeratorMaxDigits || 2);
    const maxdigits_d = 10 ** (denominatorMaxDigits || 2);
    let z = Math.abs(number);
    let last_d = 0;
    let last_n = 0;
    let curr_n = 0;
    let curr_d = 1;
    let tmp;
    let r: [number, number];
    number = z;
    if (number % 1 === 0) {
        // handles exact integers including 0
        r = [number * sign, 1];
    } else if (number < 1e-19) {
        r = [sign, 1e+19];
    } else if (number > 1e+19) {
        r = [1e+19 * sign, 1];
    } else {
        do {
            z = 1 / (z - Math.floor(z));
            tmp = curr_d;
            curr_d = curr_d * Math.floor(z) + last_d;
            last_d = tmp;
            last_n = curr_n;
            curr_n = Math.floor(number * curr_d + 0.5); // round
            if (curr_n >= maxdigits_n || curr_d >= maxdigits_d) {
                return [sign * last_n, last_d];
            }
        } while (Math.abs(number - curr_n / curr_d) >= PRECISION && z !== Math.floor(z));
        r = [sign * curr_n, curr_d];
    }
    return r;
}
