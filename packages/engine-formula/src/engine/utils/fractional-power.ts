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

// Fixed-point intermediates keep the small remainder of log(1 + x) when x is one binary64 step.
const FRACTION_BITS = 160n;
const UNIT = 1n << FRACTION_BITS;
const SCALE = Number(UNIT);
const bits = new DataView(new ArrayBuffer(8));

// log(m) = 2 * atanh((m - 1) / (m + 1)). Range reduction keeps the series short.
function logFromRatio(ratio: bigint): bigint {
    const squared = ratio * ratio / UNIT;
    let term = ratio;
    let sum = term;
    for (let divisor = 3n; term !== 0n; divisor += 2n) {
        term = term * squared / UNIT;
        sum += term / divisor;
    }
    return 2n * sum;
}

const LOG_TWO = logFromRatio(UNIT / 3n);

function logOfPositive(base: number): number {
    const subnormal = base < 2 ** -1022;
    bits.setFloat64(0, subnormal ? base * 2 ** 54 : base);
    const high = bits.getUint32(0);
    let exponent = (high >>> 20) - 1023 - (subnormal ? 54 : 0);
    bits.setUint32(0, (high & 0xFFFFF) | 0x3FF00000);
    let mantissa = bits.getFloat64(0);
    if (mantissa > Math.SQRT2) {
        mantissa /= 2;
        exponent++;
    }
    const fixed = BigInt(mantissa * SCALE);
    const logMantissa = logFromRatio((fixed - UNIT) * UNIT / (fixed + UNIT));
    return Number(BigInt(exponent) * LOG_TWO + logMantissa) / SCALE;
}

/** Computes the positive magnitude of an Excel power, rounding its logarithm to binary64 first. */
export function fractionalPower(base: number, exponent: number): number {
    const product = exponent * logOfPositive(base);
    if (!Number.isFinite(product)) return Number.NaN;
    if (product > 710) return Infinity;
    if (product < -746) return 0;

    const scaleExponent = Math.round(product * Math.LOG2E);
    const remainder = BigInt(Math.trunc(product * SCALE)) - BigInt(scaleExponent) * LOG_TWO;
    let term = UNIT;
    let sum = term;
    for (let divisor = 1n; term !== 0n; divisor++) {
        term = term * remainder / (UNIT * divisor);
        sum += term;
    }

    if (scaleExponent < -1021) {
        // Round once directly to the subnormal grid. Rounding the mantissa first can change the last bit.
        const shift = FRACTION_BITS - BigInt(scaleExponent + 1074);
        const whole = sum >> shift;
        const discarded = sum - (whole << shift);
        const half = 1n << (shift - 1n);
        const roundUp = discarded > half || (discarded === half && whole % 2n !== 0n);
        return Number(roundUp ? whole + 1n : whole) * Number.MIN_VALUE;
    }
    const mantissa = Number(sum) / SCALE;
    return scaleExponent === 1024 ? mantissa * 2 ** 1023 * 2 : mantissa * 2 ** scaleExponent;
}
