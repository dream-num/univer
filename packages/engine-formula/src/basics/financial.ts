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

import { DateSystem, excelDateSerial, excelDateTimePartsToSerial, excelSerialToDate, excelSerialToDateTimeParts } from '@univerjs/core';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import {
    dateAddMonths,
    getDaysInMonth,
    getTwoDateDaysByBasis,
    lastDayOfMonth,
} from './date';
import { ErrorType } from './error-type';

interface ICouponDateParts {
    year: number;
    month: number;
    day: number;
    monthEnd: boolean;
}

interface ICouponSchedule {
    previousSerial: number;
    nextSerial: number;
    count: number;
}

const COUPON_DATE_PARTS_OPTIONS = { hours: 0, minutes: 0, seconds: 0, fractionalSecond: 0 };

function getCouponDateParts(serial: number, dateSystem: DateSystem): ICouponDateParts {
    const parts = excelSerialToDateTimeParts(serial, { dateSystem });

    if (parts) {
        return {
            year: parts.year,
            month: parts.month,
            day: parts.day,
            monthEnd: parts.day === getDaysInMonth(parts.year, parts.month - 1),
        };
    }

    const date = excelSerialToDate(serial, dateSystem);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    return { year, month, day, monthEnd: day === getDaysInMonth(year, month - 1) };
}

function getCouponDateSerial(parts: ICouponDateParts, dateSystem: DateSystem): number {
    if (dateSystem === DateSystem.Date1900 && parts.year === 1900 && parts.month === 1 && parts.day === 0) {
        return 0;
    }

    if (dateSystem === DateSystem.Date1900 && parts.year === 1900 && parts.month === 2 && parts.day === 29) {
        return 60;
    }

    const serial = excelDateTimePartsToSerial({
        year: parts.year,
        month: parts.month,
        day: parts.day,
        ...COUPON_DATE_PARTS_OPTIONS,
    }, { dateSystem });

    if (serial != null) {
        return serial;
    }

    return excelDateSerial(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)), dateSystem);
}

function compareCouponDate(left: ICouponDateParts, right: ICouponDateParts): number {
    if (left.year !== right.year) {
        return left.year - right.year;
    }

    if (left.month !== right.month) {
        return left.month - right.month;
    }

    return left.day - right.day;
}

// Excel keeps the maturity day/month-end rule for every coupon period; it must not be inferred from an intermediate date.
function addCouponMonths(parts: ICouponDateParts, months: number): ICouponDateParts {
    const monthIndex = parts.year * 12 + parts.month - 1 + months;
    const year = Math.floor(monthIndex / 12);
    const month = monthIndex - year * 12 + 1;
    const maxDay = getDaysInMonth(year, month - 1);
    const day = parts.monthEnd ? maxDay : Math.min(parts.day, maxDay);

    return { year, month, day, monthEnd: parts.monthEnd };
}

function getCouponSchedule(
    settlementSerialNumber: number,
    maturitySerialNumber: number,
    frequency: number,
    dateSystem: DateSystem
): ICouponSchedule {
    const settlement = getCouponDateParts(settlementSerialNumber, dateSystem);
    const maturity = getCouponDateParts(maturitySerialNumber, dateSystem);
    const periodMonths = 12 / frequency;
    let candidate: ICouponDateParts = {
        ...maturity,
        year: settlement.year,
    };

    if (compareCouponDate(candidate, settlement) < 0) {
        candidate = { ...candidate, year: candidate.year + 1 };
    }

    while (compareCouponDate(candidate, settlement) > 0) {
        candidate = addCouponMonths(candidate, -periodMonths);
    }

    const previousSerial = getCouponDateSerial(candidate, dateSystem);
    const nextSerial = getCouponDateSerial(addCouponMonths(candidate, periodMonths), dateSystem);

    let count = 0;
    let countCandidate = maturity;
    while (compareCouponDate(countCandidate, settlement) > 0) {
        countCandidate = addCouponMonths(countCandidate, -periodMonths);
        count++;
    }

    return { previousSerial, nextSerial, count };
}

export function calculateCoupdaybs(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number, basis: number, dateSystem = DateSystem.Date1900): number {
    const coupDateSerialNumber = calculateCouppcd(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem);

    const { days } = getTwoDateDaysByBasis(coupDateSerialNumber, settlementSerialNumber, basis, dateSystem);

    return days;
}

export function calculateCoupdays(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number, basis: number, dateSystem = DateSystem.Date1900): number {
    let result;

    if (basis === 1) {
        const beforeSettlementDateSerialNumber = calculateCouppcd(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem);

        const afterSettlementDateSerialNumber = getCouponSchedule(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem).nextSerial;

        // special handle for excel
        if (beforeSettlementDateSerialNumber < 0 && frequency === 1) {
            result = 365;
        } else if (dateSystem === DateSystem.Date1900 && settlementSerialNumber === 0 && frequency === 2 && beforeSettlementDateSerialNumber < 0) {
            result = 184;
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

export function calculateCoupncd(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number, dateSystem = DateSystem.Date1900): number {
    return getCouponSchedule(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem).nextSerial;
}

export function calculateCoupnum(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number, dateSystem = DateSystem.Date1900): number {
    return getCouponSchedule(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem).count;
}

export function calculateCouppcd(settlementSerialNumber: number, maturitySerialNumber: number, frequency: number, dateSystem = DateSystem.Date1900): number {
    return getCouponSchedule(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem).previousSerial;
}

export function calculateDuration(settlementSerialNumber: number, maturitySerialNumber: number, coupon: number, yld: number, frequency: number, basis: number, dateSystem = DateSystem.Date1900): number {
    const coupdaybs = calculateCoupdaybs(settlementSerialNumber, maturitySerialNumber, frequency, basis, dateSystem);
    const coupdays = calculateCoupdays(settlementSerialNumber, maturitySerialNumber, frequency, basis, dateSystem);
    const coupnum = calculateCoupnum(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem);

    const coupdaysDiff = (coupdays - coupdaybs) / coupdays - 1;
    const _yld = yld / frequency + 1;
    const _coupon = coupon * 100 / frequency;

    let duration = 0;
    let den = 0;

    for (let i = 1; i <= coupnum; i++) {
        const index = i + coupdaysDiff;
        const num = _coupon / (_yld ** index);

        duration += index * num;
        den += num;
    }

    const index = coupnum + coupdaysDiff;
    const num = 100 / (_yld ** index);

    duration += index * num;
    den += num;

    return duration / den / frequency;
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
        if (rate === -1 && nper === 0) {
            return Number.NaN;
        }

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

export function calculateNpv(rate: number, values: number[]): number {
    let res = 0;

    for (let i = 1; i <= values.length; i++) {
        res += values[i - 1] / ((1 + rate) ** i);
    }

    return res;
}

export function calculateOddFPrice(
    settlementSerialNumber: number,
    maturitySerialNumber: number,
    issueSerialNumber: number,
    firstCouponSerialNumber: number,
    rate: number,
    yld: number,
    redemption: number,
    frequency: number,
    basis: number,
    dateSystem = DateSystem.Date1900
): number {
    // DFC = number of days from the beginning of the odd first coupon to the first coupon date.
    const DFC = getPositiveDaysBetween(issueSerialNumber, firstCouponSerialNumber, basis, dateSystem);

    // E = number of days in the coupon period.
    const E = calculateCoupdays(settlementSerialNumber, firstCouponSerialNumber, frequency, basis, dateSystem);

    if (DFC < E) {
        return calculateOddShortFirstCoupon(
            settlementSerialNumber,
            maturitySerialNumber,
            issueSerialNumber,
            firstCouponSerialNumber,
            rate,
            yld,
            redemption,
            frequency,
            basis,
            DFC,
            E,
            dateSystem
        );
    } else {
        return calculateOddLongFirstCoupon(
            settlementSerialNumber,
            maturitySerialNumber,
            issueSerialNumber,
            firstCouponSerialNumber,
            rate,
            yld,
            redemption,
            frequency,
            basis,
            E,
            dateSystem
        );
    }
}

function calculateOddShortFirstCoupon(
    settlementSerialNumber: number,
    maturitySerialNumber: number,
    issueSerialNumber: number,
    firstCouponSerialNumber: number,
    rate: number,
    yld: number,
    redemption: number,
    frequency: number,
    basis: number,
    DFC: number,
    E: number,
    dateSystem: DateSystem
): number {
    // calculate method from
    // https://support.microsoft.com/en-us/office/oddfprice-function-d7d664a8-34df-4233-8d2b-922bcf6a69e1
    // Odd short first coupon:
    let result = 0;

    // N = number of coupons payable between the settlement date and the redemption date. (If this number contains a fraction, it is raised to the next whole number.)
    const N = calculateCoupnum(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem);

    // DSC = number of days from the settlement to the next coupon date.
    const DSC = getPositiveDaysBetween(settlementSerialNumber, firstCouponSerialNumber, basis, dateSystem);

    result += redemption / ((1 + yld / frequency) ** (N - 1 + DSC / E));

    result += (100 * rate / frequency * DFC / E) / ((1 + yld / frequency) ** (DSC / E));

    for (let k = 2; k <= N; k++) {
        result += (100 * rate / frequency) / ((1 + yld / frequency) ** (k - 1 + DSC / E));
    }

    // A = number of days from the beginning of the coupon period to the settlement date (accrued days).
    const A = getPositiveDaysBetween(issueSerialNumber, settlementSerialNumber, basis, dateSystem);

    result -= 100 * rate / frequency * A / E;

    return result;
}

function calculateOddLongFirstCoupon(
    settlementSerialNumber: number,
    maturitySerialNumber: number,
    issueSerialNumber: number,
    firstCouponSerialNumber: number,
    rate: number,
    yld: number,
    redemption: number,
    frequency: number,
    basis: number,
    E: number,
    dateSystem: DateSystem
): number {
    // calculate method from
    // https://support.microsoft.com/en-us/office/oddfprice-function-d7d664a8-34df-4233-8d2b-922bcf6a69e1
    // Odd long first coupon:
    let result = 0;

    // N = number of coupons payable between the first real coupon date and redemption date. (If this number contains a fraction, it is raised to the next whole number.)
    const N = calculateCoupnum(firstCouponSerialNumber, maturitySerialNumber, frequency, dateSystem);

    // Nq = number of whole quasi-coupon periods between settlement date and first coupon.
    const Nq = getCouponsNumber(firstCouponSerialNumber, settlementSerialNumber, 12 / frequency, true, dateSystem);

    // DSC = number of days from the settlement to the next coupon date.
    let DSC;

    if (basis === 2 || basis === 3) {
        const coupncd = calculateCoupncd(settlementSerialNumber, firstCouponSerialNumber, frequency, dateSystem);
        DSC = getPositiveDaysBetween(settlementSerialNumber, coupncd, basis, dateSystem);
    } else {
        const couppcd = calculateCouppcd(settlementSerialNumber, firstCouponSerialNumber, frequency, dateSystem);
        const { days } = getTwoDateDaysByBasis(couppcd, settlementSerialNumber, basis, dateSystem);
        DSC = E - days;
    }

    result += redemption / ((1 + yld / frequency) ** (N + Nq + DSC / E));

    // NC = number of quasi-coupon periods that fit in odd period. (If this number contains a fraction, it is raised to the next whole number.)
    const NC = calculateCoupnum(issueSerialNumber, firstCouponSerialNumber, frequency, dateSystem);

    let lateCoupon = firstCouponSerialNumber;
    let DCiDivNLiSum = 0;
    let AiDivNLiSum = 0;

    for (let index = NC; index >= 1; index--) {
        const earlyCoupon = getDateSerialNumberByMonths(lateCoupon, -12 / frequency, false, dateSystem);
        const NLi = basis === 1 ? getPositiveDaysBetween(earlyCoupon, lateCoupon, basis, dateSystem) : E;
        const DCi = index > 1 ? NLi : getPositiveDaysBetween(issueSerialNumber, lateCoupon, basis, dateSystem);

        DCiDivNLiSum += DCi / NLi;

        const startDate = issueSerialNumber > earlyCoupon ? issueSerialNumber : earlyCoupon;
        const endDate = settlementSerialNumber < lateCoupon ? settlementSerialNumber : lateCoupon;
        const Ai = getPositiveDaysBetween(startDate, endDate, basis, dateSystem);

        AiDivNLiSum += Ai / NLi;

        lateCoupon = earlyCoupon;
    }

    result += (100 * rate / frequency * DCiDivNLiSum) / ((1 + yld / frequency) ** (Nq + DSC / E));

    for (let k = 1; k <= N; k++) {
        result += (100 * rate / frequency) / ((1 + yld / frequency) ** (k + Nq + DSC / E));
    }

    result -= 100 * rate / frequency * AiDivNLiSum;

    return result;
}

function getPositiveDaysBetween(startDateSerialNumber: number, endDateSerialNumber: number, basis: number, dateSystem: DateSystem): number {
    const { days } = getTwoDateDaysByBasis(startDateSerialNumber, endDateSerialNumber, basis, dateSystem);

    return startDateSerialNumber < endDateSerialNumber ? days : 0;
}

export function validDaysBetweenIsWholeFrequencyByTwoDate(date1SerialNumber: number, date2SerialNumber: number, frequency: number, dateSystem = DateSystem.Date1900): boolean {
    const date1 = excelSerialToDate(date1SerialNumber, dateSystem);
    const date1Year = date1.getUTCFullYear();
    const date1Month = date1.getUTCMonth();
    const date1Day = date1.getUTCDate();
    const date1LastDayOfMonth = lastDayOfMonth(date1Year, date1Month, date1Day);

    const date2 = excelSerialToDate(date2SerialNumber, dateSystem);
    const date2Year = date2.getUTCFullYear();
    const date2Month = date2.getUTCMonth();
    const date2Day = date2.getUTCDate();
    const date2LastDayOfMonth = lastDayOfMonth(date2Year, date2Month, date2Day);

    if (date1Day !== date2Day && !(date1LastDayOfMonth && date2LastDayOfMonth)) {
        return false;
    }

    const months = Math.abs((date2Year - date1Year) * 12 + (date2Month - date1Month));

    if (months % (12 / frequency) !== 0) {
        return false;
    }

    return true;
}

export function validCouppcdIsGte0ByTwoDate(date1SerialNumber: number, date2SerialNumber: number, frequency: number, dateSystem = DateSystem.Date1900): boolean {
    const couppcd = calculateCouppcd(date1SerialNumber, date2SerialNumber, frequency, dateSystem);
    return couppcd >= 0;
}

export function getDateSerialNumberByMonths(serialNumber: number, months: number, returnLastDay: boolean, dateSystem = DateSystem.Date1900): number {
    let date = excelSerialToDate(serialNumber, dateSystem);
    date = dateAddMonths(date, months);

    if (returnLastDay) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const daysInMonth = getDaysInMonth(year, month);
        date.setUTCDate(daysInMonth);
    }

    return excelDateSerial(date, dateSystem);
}

function getCouponsNumber(startDateSerialNumber: number, endDateSerialNumber: number, months: number, isWholeNumber: boolean, dateSystem: DateSystem): number {
    const startDate = excelSerialToDate(startDateSerialNumber, dateSystem);
    const endDate = excelSerialToDate(endDateSerialNumber, dateSystem);

    const startDateYear = startDate.getUTCFullYear();
    const startDateMonth = startDate.getUTCMonth();
    const startDateDay = startDate.getUTCDate();

    const endDateYear = endDate.getUTCFullYear();
    const endDateMonth = endDate.getUTCMonth();
    const endDateDay = endDate.getUTCDate();

    const endOfMonthTemp = lastDayOfMonth(startDateYear, startDateMonth, startDateDay);
    const endOfMonth = (!endOfMonthTemp && startDateMonth !== 1 && startDateDay > 28 && startDateDay < getDaysInMonth(startDateYear, startDateMonth))
        ? lastDayOfMonth(endDateYear, endDateMonth, endDateDay)
        : endOfMonthTemp;

    const newDateSerialNumber = getDateSerialNumberByMonths(endDateSerialNumber, 0, endOfMonth, dateSystem);

    let coupons = (+isWholeNumber - 0) + +(endDateSerialNumber < newDateSerialNumber);
    let frontDateSerialNumber = getDateSerialNumberByMonths(newDateSerialNumber, months, endOfMonth, dateSystem);

    while (!(months > 0 ? frontDateSerialNumber >= endDateSerialNumber : frontDateSerialNumber <= endDateSerialNumber)) {
        frontDateSerialNumber = getDateSerialNumberByMonths(frontDateSerialNumber, months, endOfMonth, dateSystem);
        coupons++;
    }

    return coupons;
}

interface IIterFFunctionType {
    (x: number): number;
}

export function getResultByGuessIterF(guess: number, iterF: IIterFFunctionType): number | ErrorValueObject {
    const g_Eps = 1e-7;
    const g_Eps2 = g_Eps * 2;
    const nIM = 500;

    let eps = 1;
    let nMC = 0;
    let x = guess;
    let xN;

    while (eps > g_Eps && nMC < nIM) {
        const den = (iterF(x + g_Eps) - iterF(x - g_Eps)) / g_Eps2;
        xN = x - iterF(x) / den;
        nMC++;
        eps = Math.abs(xN - x);
        x = xN;
    }

    if (Number.isNaN(x) || Infinity === Math.abs(x) || nMC === nIM) {
        return guessIsNaNorInfinity(guess, iterF);
    }

    return x;
}

function guessIsNaNorInfinity(guess: number, iterF: IIterFFunctionType): number | ErrorValueObject {
    const g_Eps = 1e-7;
    const nIM = 60;

    const max = Number.MAX_VALUE;
    const min = -1;
    const step = 1.6;

    let low = guess - 0.01 <= min ? min + g_Eps : guess - 0.01;
    let high = guess + 0.01 >= max ? max - g_Eps : guess + 0.01;
    let xBegin;
    let xEnd;
    let currentIter = 0;

    if (guess <= min || guess >= max) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    for (let i = 0; i < nIM; i++) {
        xBegin = low <= min ? min + g_Eps : low;
        xEnd = high >= max ? max - g_Eps : high;

        const x = iterF(xBegin);
        const y = iterF(xEnd);

        if (x * y <= 0) {
            break;
        } else if (x * y > 0) {
            low = (xBegin + step * (xBegin - xEnd));
            high = (xEnd + step * (xEnd - xBegin));
        } else {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (i === nIM - 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
    }

    xBegin = xBegin as number;
    xEnd = xEnd as number;

    let fXbegin = iterF(xBegin);
    const fXend = iterF(xEnd);
    let fXi;
    let xI;

    if (Math.abs(fXbegin) < g_Eps) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    if (Math.abs(fXend) < g_Eps) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    do {
        xI = xBegin + (xEnd - xBegin) / 2;
        fXi = iterF(xI);

        if (fXbegin * fXi < 0) {
            xEnd = xI;
        } else {
            xBegin = xI;
        }

        fXbegin = iterF(xBegin);
        currentIter++;
    } while (Math.abs(fXi) > g_Eps && currentIter < nIM);

    return xI;
}

export function calculatePrice(
    settlementSerialNumber: number,
    maturitySerialNumber: number,
    rate: number,
    yld: number,
    redemption: number,
    frequency: number,
    basis: number,
    dateSystem = DateSystem.Date1900
): number {
    // N is the number of coupons payable between the settlement date and redemption date
    const N = calculateCoupnum(settlementSerialNumber, maturitySerialNumber, frequency, dateSystem);

    // E = number of days in coupon period in which the settlement date falls.
    const E = calculateCoupdays(settlementSerialNumber, maturitySerialNumber, frequency, basis, dateSystem);

    // A = number of days from beginning of coupon period to settlement date.
    const A = calculateCoupdaybs(settlementSerialNumber, maturitySerialNumber, frequency, basis, dateSystem);

    if (N === 1) {
        const DSR = E - A;
        const T1 = 100 * rate / frequency + redemption;
        const T2 = yld / frequency * DSR / E + 1;
        const T3 = 100 * rate / frequency * A / E;

        return T1 / T2 - T3;
    }

    const DSC = E - A;

    let result = redemption / ((1 + yld / frequency) ** (N - 1 + DSC / E));

    for (let k = 1; k <= N; k++) {
        result += (100 * rate / frequency) / ((1 + yld / frequency) ** (k - 1 + DSC / E));
    }

    result -= 100 * rate / frequency * A / E;

    return result;
}

export function calculateDDB(cost: number, salvage: number, life: number, period: number, factor: number): number {
    let oldCost = 0;
    let fdl = factor / life;

    if (fdl >= 1) {
        fdl = 1;
        oldCost = period === 1 ? cost : 0;
    } else {
        oldCost = cost * ((1 - fdl) ** (period - 1));
    }

    const newCost = cost * ((1 - fdl) ** period);

    let result = 0;

    if (newCost < salvage) {
        result = oldCost - salvage;
    } else {
        result = oldCost - newCost;
    }

    if (result < 0) {
        result = 0;
    }

    return result;
}
