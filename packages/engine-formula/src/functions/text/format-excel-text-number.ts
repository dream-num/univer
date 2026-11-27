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

export function formatExcelTextNumber(value: number, roundTiesTowardZero = true): string {
    if (!Number.isFinite(value) || (Number.isInteger(value) && Math.abs(value) < 1e15)) {
        return String(value);
    }
    const magnitude = Math.abs(value);
    const [coefficient, power] = magnitude.toExponential(14).split('e');
    let exponent = Number(power);
    let digits = coefficient.replace('.', '');
    if (roundTiesTowardZero && Number(`${coefficient}e${power}`) > magnitude) {
        const previous = previousIfExactMidpoint(magnitude, Number(digits), exponent);
        if (previous !== undefined) {
            if (Number(digits) === 1e14) exponent--;
            digits = String(previous);
        }
    }
    const sign = value < 0 ? '-' : '';
    const significant = digits.replace(/0+$/, '');
    if (exponent >= 20 || exponent < -18) {
        const mantissa = significant.length === 1 ? significant : `${significant[0]}.${significant.slice(1)}`;
        return `${sign}${mantissa}E${exponent >= 0 ? '+' : ''}${exponent}`;
    }
    const point = exponent + 1;
    if (point <= 0) {
        return `${sign}0.${'0'.repeat(-point)}${significant}`;
    }
    if (point >= significant.length) {
        return sign + significant.padEnd(point, '0');
    }
    return `${sign}${significant.slice(0, point)}.${significant.slice(point)}`;
}

function previousIfExactMidpoint(value: number, rounded: number, exponent: number): number | undefined {
    const carried = rounded === 1e14;
    const previous = carried ? 1e15 - 1 : rounded - 1;
    const binaryExponent = exponent - (carried ? 16 : 15);
    // A decimal midpoint is exactly representable only if its factors of five cancel.
    const odd = 2 * previous + 1;
    const factorsOfFive = 5 ** Math.abs(binaryExponent + 1);
    let numerator = odd * factorsOfFive;
    if (binaryExponent < 0) {
        if (odd % factorsOfFive !== 0) return;
        numerator = odd / factorsOfFive;
    }
    return Number.isSafeInteger(numerator) && numerator * 2 ** binaryExponent === value ? previous : undefined;
}
