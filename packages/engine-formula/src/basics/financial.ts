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

import { excelDateSerial, excelSerialToDate, getTwoDateDaysByBasis } from './date';

export function calculateCoupdaybs(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number, basis: number): number {
    const coupDateSerialNumber = calculateCouppcd(settlementSerialNumber, maturitySerialNumber, frequency);

    const { days } = getTwoDateDaysByBasis(coupDateSerialNumber, settlementSerialNumber, basis);

    return days;
}

export function calculateCoupdays(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number, basis: number): number {
    let result;

    if (basis === 1) {
        const beforeSettlementDateSerialNumber = calculateCouppcd(settlementSerialNumber, maturitySerialNumber, frequency);

        const coupDate = excelSerialToDate(beforeSettlementDateSerialNumber);
        coupDate.setUTCMonth(coupDate.getUTCMonth() + 12 / frequency);

        const afterSettlementDateSerialNumber = excelDateSerial(coupDate);

        // special handle for excel
        if (beforeSettlementDateSerialNumber < 0 && frequency === 1) {
            result = 365;
        } else {
            result = afterSettlementDateSerialNumber - beforeSettlementDateSerialNumber;
        }
    } else if (basis === 3) {
        result = 365 / frequency;
    } else {
        result = 360 / frequency;
    }

    return result;
}

export function calculateCoupnum(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number): number {
    let result = 0;

    const settlementDate = excelSerialToDate(settlementSerialNumber);
    const coupDate = excelSerialToDate(maturitySerialNumber);

    // eslint-disable-next-line
    while (coupDate > settlementDate) {
        coupDate.setUTCMonth(coupDate.getUTCMonth() - 12 / frequency);
        result++;
    }

    return result;
}

export function calculateCouppcd(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number): number {
    const settlementDate = excelSerialToDate(settlementSerialNumber);
    const coupDate = excelSerialToDate(maturitySerialNumber);

    coupDate.setUTCFullYear(settlementDate.getUTCFullYear());

    if (coupDate < settlementDate) {
        coupDate.setUTCFullYear(coupDate.getUTCFullYear() + 1);
    }

    // eslint-disable-next-line
    while (coupDate > settlementDate) {
        coupDate.setUTCMonth(coupDate.getUTCMonth() - 12 / frequency);
    }

    let coupDateSerialNumber = excelDateSerial(coupDate);

    // special handle for excel
    if (coupDateSerialNumber < 0) {
        coupDateSerialNumber = 0;
    }

    return coupDateSerialNumber;
}

export function calculateDuration(settlementSerialNumber: number, maturitySerialNumber: number, coupon: number, yld: number, frequency: number, basis: number) {
    const daybs = calculateCoupdaybs(settlementSerialNumber, maturitySerialNumber, frequency, basis);
    const days = calculateCoupdays(settlementSerialNumber, maturitySerialNumber, frequency, basis);
    const num = calculateCoupnum(settlementSerialNumber, maturitySerialNumber, frequency);

    let duration = 0;
    let p = 0;

    const dsc = days - daybs;
    const diff = dsc / days - 1;
    const _yld = yld / frequency + 1;

    const _coupon = coupon * 100 / frequency;

    for (let index = 1; index <= num; index++) {
        const di = index + diff;

        const yldPOW = _yld ** di;

        duration += di * _coupon / yldPOW;

        p += _coupon / yldPOW;
    }

    const yldDiffPow = 100 / (_yld ** (diff + num));

    duration += (diff + num) * yldDiffPow;
    p += yldDiffPow;

    return duration / p / frequency;
}

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
