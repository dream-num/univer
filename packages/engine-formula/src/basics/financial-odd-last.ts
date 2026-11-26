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

import type { BaseValueObject, ErrorValueObject } from '../engine/value-object/base-value-object';
import { DateSystem, EXCEL_1904_OFFSET, getDateSystemMaxSerial } from '@univerjs/core';
import { getDateSerialNumberByObject, getDaysInMonth } from './date';
import { getCouponDateParts, getCouponDateSerial } from './financial';

type CouponDateParts = ReturnType<typeof getCouponDateParts>;

interface IOddLastCouponPeriods {
    accrued: number;
    remaining: number;
    total: number;
}

export function getExcelOddLastDateSerial(value: BaseValueObject, dateSystem = DateSystem.Date1900): number | ErrorValueObject {
    const serial = getDateSerialNumberByObject(value, dateSystem, true);
    if (typeof serial !== 'number') {
        return serial;
    }
    // Excel's financial date validation adds the 1904 offset to numeric arguments.
    return Math.floor(serial) + (dateSystem === DateSystem.Date1904 && !value.isString() ? EXCEL_1904_OFFSET : 0);
}

function monthLength(parts: CouponDateParts, dateSystem: DateSystem): number {
    return dateSystem === DateSystem.Date1900 && parts.year === 1900 && parts.month === 2
        ? 29
        : getDaysInMonth(parts.year, parts.month - 1);
}

function shiftCouponMonth(parts: CouponDateParts, months: number, endOfMonth: boolean, dateSystem: DateSystem): number {
    const monthIndex = parts.year * 12 + parts.month - 1 + months;
    const year = Math.floor(monthIndex / 12);
    const month = monthIndex - year * 12 + 1;
    const target = { ...parts, year, month };
    const lastDay = monthLength(target, dateSystem);
    target.day = endOfMonth ? lastDay : Math.min(parts.day, lastDay);
    return getCouponDateSerial(target, dateSystem);
}

function couponDays(start: number, end: number, basis: number, wholePeriod: boolean, dateSystem: DateSystem): number {
    if (end <= start) {
        return 0;
    }
    if (basis >= 1 && basis <= 3) {
        return end - start;
    }
    const first = getCouponDateParts(start, dateSystem);
    const last = getCouponDateParts(end, dateSystem);
    let firstDay = first.day;
    let lastDay = last.day;
    if (basis === 4) {
        firstDay = Math.min(firstDay, 30);
        lastDay = Math.min(lastDay, 30);
    } else {
        const februaryEnd = (parts: CouponDateParts, serial: number) => parts.month === 2
            && parts.day === monthLength(parts, dateSystem)
            && !(dateSystem === DateSystem.Date1900 && serial === 60);
        const firstFebruary = februaryEnd(first, start);
        const lastFebruary = februaryEnd(last, end);
        if ((lastFebruary && (firstFebruary || wholePeriod)) || (lastDay === 31 && (firstDay >= 30 || wholePeriod))) {
            lastDay = 30;
        }
        if (firstFebruary || firstDay === 31) {
            firstDay = 30;
        }
    }
    return (last.year - first.year) * 360 + (last.month - first.month) * 30 + lastDay - firstDay;
}

export function getExcelOddLastCouponPeriods(
    settlement: number,
    maturity: number,
    lastInterest: number,
    frequency: number,
    basis: number,
    dateSystem: DateSystem
): IOddLastCouponPeriods | null {
    const maximumDate = getDateSystemMaxSerial(dateSystem);
    if (!(lastInterest >= 0 && lastInterest < settlement && settlement < maturity)
        || maturity > maximumDate
        || (dateSystem === DateSystem.Date1900 && (lastInterest === 0 || settlement === 60))) {
        return null;
    }

    const months = 12 / frequency;
    const maturityParts = getCouponDateParts(maturity, dateSystem);
    const interestParts = getCouponDateParts(lastInterest, dateSystem);
    const endOfMonth = maturityParts.day === monthLength(maturityParts, dateSystem);
    let count = Math.floor(((maturityParts.year - interestParts.year) * 12 + maturityParts.month - interestParts.month) / months);
    let previous = shiftCouponMonth(maturityParts, -count * months, endOfMonth, dateSystem);
    if (previous > lastInterest) {
        count++;
        previous = shiftCouponMonth(maturityParts, -count * months, endOfMonth, dateSystem);
    }
    if (dateSystem === DateSystem.Date1900 && previous < 1) {
        return null;
    }

    let current = lastInterest;
    let accrued = 0;
    let remaining = 0;
    let total = 0;
    // Maturity determines the interval count. Dates within those intervals advance from the last payment.
    for (let index = 1; index <= count; index++) {
        const next = shiftCouponMonth(getCouponDateParts(current, dateSystem), months, false, dateSystem);
        if (!Number.isFinite(next) || next > maximumDate || next <= current) {
            return null;
        }
        const length = couponDays(current, next, basis, true, dateSystem);
        const end = index === count ? maturity : next;
        const periodDays = couponDays(current, end, basis, true, dateSystem);
        const accruedDays = next < settlement ? periodDays : couponDays(current, settlement, basis, false, dateSystem);
        const remainingDays = couponDays(Math.max(current, settlement), Math.min(next, maturity), basis, false, dateSystem);
        total += periodDays / length;
        accrued += accruedDays / length;
        remaining += remainingDays / length;
        current = next;
    }
    return { accrued, remaining, total };
}
