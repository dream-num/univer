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

import type { DateTimeParts } from './types';
import { DateSystem } from '../../types/enum/date-system';
import { toYMD } from './to-ymd';

const floor = Math.floor;
const DAYSIZE = 86400;
const MILLISECONDS_PER_DAY = DAYSIZE * 1000;
const dateUTC = Date.UTC as (...values: unknown[]) => number;
// The 1904 epoch is 1,461 real days after the 1900 epoch; Excel's fictitious 1900-02-29 adds one serial day.
export const EXCEL_1904_OFFSET = 1462;
// Excel's supported calendar range ends at 9999-12-31.
const EXCEL_1900_MAX_SERIAL = 2958465;
const MAX_YEAR = 9999;

/**
 * Decoded Excel calendar and clock fields.
 * In the 1900 system, serial 0 returns 1900-01-00 and serial 60 returns the fictitious 1900-02-29.
 * Callers converting these fields to a native Date must choose how to normalize those two pseudo-dates.
 */
export interface IExcelDateTimeParts {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
    fractionalSecond: number;
}

interface IDateSystemOptions {
    dateSystem: DateSystem;
}

export function getDateSystemMaxSerial(dateSystem = DateSystem.Date1900): number {
    return dateSystem === DateSystem.Date1904
        ? EXCEL_1900_MAX_SERIAL - EXCEL_1904_OFFSET
        : EXCEL_1900_MAX_SERIAL;
}

function isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidGregorianDate(year: number, month: number, day: number): boolean {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || year < 1 || year > MAX_YEAR || month < 1 || month > 12) {
        return false;
    }

    const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day >= 1 && day <= daysInMonth[month - 1];
}

function civilDateToUnixDays(year: number, month: number, day: number): number {
    // Use pure proleptic-Gregorian arithmetic so native Date normalization and host time zones cannot affect serials.
    const adjustedYear = year - (month <= 2 ? 1 : 0);
    const era = Math.floor(adjustedYear / 400);
    const yearOfEra = adjustedYear - era * 400;
    const adjustedMonth = month + (month > 2 ? -3 : 9);
    const dayOfYear = Math.floor((153 * adjustedMonth + 2) / 5) + day - 1;
    const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
    return era * 146097 + dayOfEra - 719468;
}

function datePartsToExcel1900Serial(year: number, month: number, day: number): number | null {
    // Excel exposes both serial 0 (1900-01-00) and serial 60 (the Lotus 1-2-3 leap-year bug) as editable dates.
    if (year === 1900 && month === 1 && day === 0) {
        return 0;
    }
    if (year === 1900 && month === 2 && day === 29) {
        return 60;
    }
    if (!isValidGregorianDate(year, month, day)) {
        return null;
    }

    const unixDays = civilDateToUnixDays(year, month, day);
    // Serial 60 is reserved for the fictitious leap day, so real dates from 1900-03-01 use the larger offset.
    return unixDays + (unixDays <= -25509 ? 25568 : 25569);
}

export function excelSerialToDateTimeParts(
    serial: number,
    options: IDateSystemOptions
): IExcelDateTimeParts | null {
    if (!Number.isFinite(serial) || serial < 0) {
        return null;
    }

    const wholeDays = Math.floor(serial);
    const excel1900Serial = options.dateSystem === DateSystem.Date1904
        ? wholeDays + EXCEL_1904_OFFSET
        : wholeDays;
    const [year, month, day] = toYMD(excel1900Serial, 0, true);
    if (year > MAX_YEAR) {
        return null;
    }

    const totalSeconds = (serial - wholeDays) * DAYSIZE;
    const wholeSeconds = Math.floor(totalSeconds);

    return {
        year,
        month,
        day,
        hours: Math.floor(wholeSeconds / 3600),
        minutes: Math.floor(wholeSeconds / 60) % 60,
        seconds: wholeSeconds % 60,
        fractionalSecond: totalSeconds - wholeSeconds,
    };
}

function excelDateTimePartsToDate(parts: IExcelDateTimeParts, includeTime: boolean): Date {
    // Native Date cannot represent Excel's serial 0 or fictitious 1900-02-29.
    // Normalize those compatibility values to the nearest representable UTC date.
    const day = parts.year === 1900 && parts.month === 2 && parts.day === 29 ? 28 : parts.day;
    return new Date(Date.UTC(
        parts.year,
        parts.month - 1,
        day,
        includeTime ? parts.hours : 0,
        includeTime ? parts.minutes : 0,
        includeTime ? parts.seconds : 0,
        includeTime ? Math.round(parts.fractionalSecond * 1000) : 0
    ));
}

/** Convert an Excel serial to a native UTC Date, keeping only its calendar date. Returns an invalid Date for invalid serials. */
export function excelSerialToDate(serial: number, dateSystem = DateSystem.Date1900): Date {
    const parts = excelSerialToDateTimeParts(serial, { dateSystem });
    return parts ? excelDateTimePartsToDate(parts, false) : new Date(Number.NaN);
}

/** Convert an Excel serial to a native UTC Date, including its time fraction. Returns an invalid Date for invalid serials. */
export function excelSerialToDateTime(serial: number, dateSystem = DateSystem.Date1900): Date {
    const parts = excelSerialToDateTimeParts(serial, { dateSystem });
    return parts ? excelDateTimePartsToDate(parts, true) : new Date(Number.NaN);
}

export function excelDateTimePartsToSerial(
    parts: IExcelDateTimeParts,
    options: IDateSystemOptions
): number | null {
    const { year, month, day, hours, minutes, seconds, fractionalSecond } = parts;
    if (
        !Number.isInteger(hours) || hours < 0 || hours > 23 ||
        !Number.isInteger(minutes) || minutes < 0 || minutes > 59 ||
        !Number.isInteger(seconds) || seconds < 0 || seconds > 59 ||
        !Number.isFinite(fractionalSecond) || fractionalSecond < 0 || fractionalSecond >= 1
    ) {
        return null;
    }

    if (options.dateSystem === DateSystem.Date1900 && year < 1900) {
        return null;
    }

    let dateSerial = datePartsToExcel1900Serial(year, month, day);
    if (dateSerial == null) {
        return null;
    }
    if (options.dateSystem === DateSystem.Date1904) {
        if ((year === 1900 && month === 1 && day === 0) || (year === 1900 && month === 2 && day === 29)) {
            return null;
        }
        dateSerial -= EXCEL_1904_OFFSET;
    }
    if (dateSerial < 0) {
        return null;
    }

    return dateSerial + (hours * 3600 + minutes * 60 + seconds + fractionalSecond) / DAYSIZE;
}

function dateToExcelSerial(date: Date, includeTime: boolean, dateSystem: DateSystem): number {
    if (!Number.isFinite(date.getTime())) {
        return Number.NaN;
    }

    const serial = excelDateTimePartsToSerial({
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hours: includeTime ? date.getUTCHours() : 0,
        minutes: includeTime ? date.getUTCMinutes() : 0,
        seconds: includeTime ? date.getUTCSeconds() : 0,
        fractionalSecond: includeTime ? date.getUTCMilliseconds() / 1000 : 0,
    }, { dateSystem });
    if (serial != null) {
        return serial;
    }

    // Keep compatibility for native dates outside the selected Excel epoch.
    const dateTime = includeTime
        ? date.getTime()
        : Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const epoch = dateSystem === DateSystem.Date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 31);
    return (dateTime - epoch) / MILLISECONDS_PER_DAY;
}

/** Convert a native UTC Date's calendar fields to an Excel date serial. */
export function excelDateSerial(date: Date, dateSystem = DateSystem.Date1900): number {
    return dateToExcelSerial(date, false, dateSystem);
}

/** Convert a native UTC Date's calendar and clock fields to an Excel serial. */
export function excelDateTimeSerial(date: Date, dateSystem = DateSystem.Date1900): number {
    return dateToExcelSerial(date, true, dateSystem);
}

/**
 * Convert a native JavaScript Date, or array to a spreadsheet serial date.
 *
 * Returns a serial date number if input was a Date object or an array of
 * numbers, or null.
 */
export function dateToSerial(
    date: unknown,
    options?: { ignoreTimezone?: boolean }
): number | null {
    let timestamp: number | null = null;
    if (Array.isArray(date)) {
        const [year, month, day, hours, minutes, seconds] = date;
        timestamp = dateUTC(
            year,
            month == null ? 0 : month - 1,
            day ?? 1,
            hours || 0,
            minutes || 0,
            seconds || 0
        );
    } else if (date instanceof Date) {
        timestamp = date.getTime();
        if (!options?.ignoreTimezone) {
            // Many timezones are offset in seconds but getTimezoneOffset() returns
            // time "rounded" to minutes, so reconstruct the local components in UTC.
            const localDate = new Date();
            localDate.setUTCFullYear(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );
            localDate.setUTCHours(
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
                date.getMilliseconds()
            );
            timestamp = localDate.getTime();
        }
    }
    if (timestamp != null && Number.isFinite(timestamp)) {
        const days = timestamp / 864e5;
        return days - (days <= -25509 ? -25568 : -25569);
    }
    return null;
}

/**
 * Convert a spreadsheet serial date to an array of date parts, accurate to a
 * second.
 */
export function dateFromSerial(
    serial: number,
    options?: { leap1900?: boolean }
): DateTimeParts {
    let date = serial | 0;
    const fractionalSeconds = DAYSIZE * (serial - date);
    let time = floor(fractionalSeconds);
    if ((fractionalSeconds - time) > 0.9999) {
        time += 1;
        if (time === DAYSIZE) {
            time = 0;
            date += 1;
        }
    }
    const normalizedTime = time < 0 ? DAYSIZE + time : time;
    const [year, month, day] = toYMD(serial, 0, options?.leap1900);
    const hours = floor((normalizedTime / 60) / 60) % 60;
    const minutes = floor(normalizedTime / 60) % 60;
    const seconds = floor(normalizedTime) % 60;
    return [year, month, day, hours, minutes, seconds];
}
