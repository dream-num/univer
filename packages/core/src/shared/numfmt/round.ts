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

import { decimalFromNumber, decimalPartsToNumber, roundDecimal } from './decimal';

function legacyRound(number: number, places = 0): number {
    if (number < 0) {
        return -legacyRound(-number, places);
    }
    if (places) {
        const power = 10 ** places || 1;
        return legacyRound(number * power, 0) / power;
    }
    return Math.round(number);
}

/**
 * Return a number rounded to the specified amount of places. This is the
 * rounding function used internally by the formatter (symmetric arithmetic
 * rounding).
 *
 * @param {number} number - The number to round.
 * @param {number} [places] - The number of decimals to round to.
 * @returns {number} A rounded number.
 */
export function round(number: number, places?: number): number;
export function round(number: unknown, places?: number): unknown;
export function round(number: unknown, places = 0): unknown {
    if (typeof number !== 'number') {
        return number;
    }
    if (!Number.isFinite(number) || number === 0) {
        return number === 0 ? 0 : number;
    }
    if (!Number.isFinite(places)) {
        return legacyRound(number, places);
    }

    const normalizedPlaces = Math.trunc(places);
    if ((Number.isInteger(number) && normalizedPlaces >= 0) || normalizedPlaces > 324) {
        return number;
    }

    const rounded = decimalPartsToNumber(roundDecimal(decimalFromNumber(number), normalizedPlaces));
    return Number.isFinite(rounded) ? rounded : number;
}
