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

export function calculatePMT(rate: number, nper: number, pv: number, fv: number, type: number): number {
    // type = 0  Payment at the end of the period
    // type = 1  Payment at the beginning of the period
    let result: number;

    if (rate === 0) {
        result = (pv + fv) / nper;
    } else {
        const term = (1 + rate) ** nper;

        result = type === 1
            ? ((fv * rate) / (term - 1) + (pv * rate) / (1 - 1 / term)) / (1 + rate)
            : (fv * rate) / (term - 1) + (pv * rate) / (1 - 1 / term);
    }

    return -result;
}

export function calculateFV(rate: number, nper: number, pmt: number, pv: number, type: number): number {
    // type = 0  Payment at the end of the period
    // type = 1  Payment at the beginning of the period
    let result: number;

    if (rate === 0) {
        result = pv + pmt * nper;
    } else {
        const term = (1 + rate) ** nper;

        result = type === 1
            ? pv * term + (pmt * (1 + rate) * (term - 1)) / rate
            : pv * term + (pmt * (term - 1)) / rate;
    }

    return -result;
}

export function calculateIPMT(rate: number, per: number, nper: number, pv: number, fv: number, type: number): number {
    // type = 0  Payment at the end of the period
    // type = 1  Payment at the beginning of the period
    const payment = calculatePMT(rate, nper, pv, fv, type);

    const result = per === 1
        ? (type === 1 ? 0 : -pv)
        : (type === 1 ? calculateFV(rate, per - 2, payment, pv, 1) - payment : calculateFV(rate, per - 1, payment, pv, 0));

    return result * rate;
}
