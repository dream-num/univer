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

import type { BaseValueObject } from '../engine/value-object/base-value-object';
import type { NullValueObject } from '../engine/value-object/primitive-object';
import {
    DateSystem,
    excelDateSerial,
    excelDateTimeSerial,
    excelSerialToDate,
    getDateSystemMaxSerial,
    isRealNum,
    numfmt,
} from '@univerjs/core';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import { ErrorType } from './error-type';

export const DEFAULT_DATE_FORMAT = 'yyyy/mm/dd;@';
export const DEFAULT_NOW_FORMAT = 'yyyy/mm/dd hh:mm';
export const DEFAULT_TIME_FORMAT = 'h:mm A/P';

export function formatDateDefault(date: Date): string {
    // Get the year from the date object
    const year: number = date.getFullYear();

    // Get the month from the date object and add 1 (since getMonth() returns 0-11)
    // Convert it to a string and pad with zero if necessary to ensure two digits
    const month: string = (date.getMonth() + 1).toString().padStart(2, '0');

    // Get the day from the date object
    // Convert it to a string and pad with zero if necessary to ensure two digits
    const day: string = date.getDate().toString().padStart(2, '0');

    // Concatenate year, month, and day with '/' as separator to form yyyy/mm/dd format
    return `${year}/${month}/${day}`;
}

/**
 * Validate date string
 *
 * TODO @Dushusir: Internationalization and more format support, can be reused when editing and saving cells, like "2020年1月1日"
 */
export function isValidDateStr(dateStr: string): boolean {
    // Regular expression to validate date format
    const regex = /^\d{4}[-/](0?[1-9]|1[012])[-/](0?[1-9]|[12][0-9]|3[01])$/;

    // Check if the date format is correct
    if (!regex.test(dateStr)) {
        return false;
    }
    // Convert date string to local time format
    const normalizedDateStr = dateStr.replace(/-/g, '/').replace(/T.+/, '');
    const dateWithTime = new Date(`${normalizedDateStr}`);

    // Check if the date is valid
    if (Number.isNaN(dateWithTime.getTime())) {
        return false;
    }

    // Convert the parsed date back to the same format as the original date string for comparison
    const year = dateWithTime.getFullYear();
    const month = (dateWithTime.getMonth() + 1).toString().padStart(2, '0');
    const day = dateWithTime.getDate().toString().padStart(2, '0');
    const reconstructedDateStr = `${year}-${month}-${day}`;

    const dateStrPad = dateStr.replace(/\//g, '-').split('-').map((v) => v.padStart(2, '0')).join('-');

    return dateStrPad === reconstructedDateStr;
}

export function parseFormattedDate(value: string, options?: { dateSystem?: DateSystem }) {
    return numfmt.parseDate(value, options);
}

export function parseFormattedTime(value: string, options?: { dateSystem?: DateSystem }) {
    return numfmt.parseTime(value, options);
}

function parseEnglishMonthNameDate(value: string): Date | null {
    const match = value.trim().match(/^(\d{1,2})\s*([A-Za-z]{3,9})\s*(\d{2,4})$/);

    if (!match) {
        return null;
    }

    const [, dayText, monthText, yearText] = match;
    const monthMap: Record<string, number> = {
        jan: 0,
        january: 0,
        feb: 1,
        february: 1,
        mar: 2,
        march: 2,
        apr: 3,
        april: 3,
        may: 4,
        jun: 5,
        june: 5,
        jul: 6,
        july: 6,
        aug: 7,
        august: 7,
        sep: 8,
        sept: 8,
        september: 8,
        oct: 9,
        october: 9,
        nov: 10,
        november: 10,
        dec: 11,
        december: 11,
    };
    const month = monthMap[monthText.toLowerCase()];

    if (month == null) {
        return null;
    }

    const day = Number(dayText);
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
    const date = new Date(Date.UTC(year, month, day));

    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
        return null;
    }

    return date;
}

export function isDate(format: string) {
    return numfmt.getFormatInfo(format).isDate;
}

// Weekend is a weekend number or string that specifies when weekends occur.
const weekendNumberMap: {
    [index: number]: number[];
} = {
    1: [6, 0], // Saturday, Sunday
    2: [0, 1], // Sunday, Monday
    3: [1, 2], // Monday, Tuesday
    4: [2, 3], // Tuesday, Wednesday
    5: [3, 4], // Wednesday, Thursday
    6: [4, 5], // Thursday, Friday
    7: [5, 6], // Friday, Saturday
    11: [0], // Sunday only
    12: [1], // Monday only
    13: [2], // Tuesday only
    14: [3], // Wednesday only
    15: [4], // Thursday only
    16: [5], // Friday only
    17: [6], // Saturday only
};

export function isValidWeekend(weekend: number | string): boolean {
    // Weekend string values are seven characters long and each character in the string represents a day of the week, starting with Monday.
    if (typeof weekend === 'string') {
        return weekend.length === 7 && /^[01]{7}$/.test(weekend);
    }

    if (weekendNumberMap[Number(weekend)]) {
        return true;
    }

    return false;
}

export function getWeekendArray(weekend: number | string): number[] {
    if (!isValidWeekend(weekend)) {
        return [];
    }

    if (typeof weekend === 'string') {
        // 1 represents a non-workday and 0 represents a workday. Only the characters 1 and 0 are permitted in the string. Using 1111111 will always return 0.
        const result = [];

        for (let i = 1; i <= weekend.length; i++) {
            if (`${weekend[i - 1]}` === '1') {
                if (i === weekend.length) {
                    result.push(0);
                } else {
                    result.push(i);
                }
            }
        }

        return result;
    }

    return weekendNumberMap[Number(weekend)] || [];
}

export function countWorkingDays(startDateSerialNumber: number, endDateSerialNumber: number, weekend: number | string = 1, holidays?: number[], dateSystem = DateSystem.Date1900): number {
    if (!Number.isFinite(startDateSerialNumber) || !Number.isFinite(endDateSerialNumber)) {
        return 0;
    }

    const weekendArray = getWeekendArray(weekend);

    const start = Math.floor(startDateSerialNumber);
    const end = Math.floor(endDateSerialNumber);
    const first = Math.min(start, end);
    const last = Math.max(start, end);
    const days = last - first + 1;
    const isWeekday = (serial: number) => !weekendArray.includes(getWeekDayByDateSerialNumber(serial, dateSystem));
    let workingDays = Math.floor(days / 7) * (7 - weekendArray.length);
    for (let serial = first; serial < first + days % 7; serial++) {
        if (isWeekday(serial)) {
            workingDays++;
        }
    }
    const excluded = new Set<number>();
    for (const holiday of holidays ?? []) {
        const serial = Math.floor(holiday);
        if (serial >= first && serial <= last && isWeekday(serial)) {
            excluded.add(serial);
        }
    }
    const count = workingDays - excluded.size;
    return end >= start ? count : -count;
}

export function getDateSerialNumberByWorkingDays(startDateSerialNumber: number, workingDays: number, weekend: number | string = 1, holidays?: number[], dateSystem = DateSystem.Date1900): number | ErrorValueObject {
    const weekendArray = getWeekendArray(weekend);

    const _startDateSerialNumber = Math.floor(startDateSerialNumber);
    const maxSerial = getDateSystemMaxSerial(dateSystem);
    if (workingDays < -_startDateSerialNumber || workingDays > maxSerial - _startDateSerialNumber) {
        return ErrorValueObject.create(ErrorType.NUM);
    }
    let targetDateSerialNumber = _startDateSerialNumber;

    let days = Math.abs(workingDays);

    for (let i = 1; i <= days; i++) {
        const currentDateSerialNumber = workingDays < 0 ? _startDateSerialNumber - i : _startDateSerialNumber + i;

        if (currentDateSerialNumber < 0 || currentDateSerialNumber > maxSerial) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (holidays && holidays.length > 0 && holidays.some((item) => Math.floor(item) === currentDateSerialNumber)) {
            days++;
            continue;
        }

        const weekDay = getWeekDayByDateSerialNumber(currentDateSerialNumber, dateSystem);

        if (weekendArray.includes(weekDay)) {
            days++;
            continue;
        }

        targetDateSerialNumber = currentDateSerialNumber;
    }

    return targetDateSerialNumber;
}

export function getDateSerialNumberByObject(
    serialNumberObject: BaseValueObject,
    dateSystem?: DateSystem,
    allowLastDayTime = false
): ErrorValueObject | number {
    if (serialNumberObject.isError()) {
        return serialNumberObject as ErrorValueObject;
    }

    const dateValue = serialNumberObject.getValue();
    const maxSerial = getDateSystemMaxSerial(dateSystem);
    let serial: number;

    if (serialNumberObject.isString()) {
        const options = { dateSystem };
        const input = String(dateValue);
        const parsed = parseFormattedDate(input, options) ?? parseFormattedTime(input, options);
        const date = parsed == null ? parseEnglishMonthNameDate(input) : null;
        if (parsed) {
            serial = parsed.v;
        } else if (date) {
            serial = excelDateTimeSerial(date, dateSystem);
        } else if (isRealNum(dateValue)) {
            serial = +dateValue;
        } else {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
    } else {
        serial = +dateValue;
    }
    if (serial < 0 || (allowLastDayTime ? serial >= maxSerial + 1 : serial > maxSerial)) {
        return ErrorValueObject.create(ErrorType.NUM);
    }
    return serial;
}

export function getWeekDayByDateSerialNumber(dateSerialNumber: number, dateSystem = DateSystem.Date1900): number {
    const offset = dateSystem === DateSystem.Date1904 ? 5 : 6;
    return ((Math.floor(dateSerialNumber) + offset) % 7 + 7) % 7;
}

/**
 * Returns the serial number of the Monday that starts ISO 8601 week 1 of the given year.
 *
 * Week 1 is the week that contains the first Thursday of the year, so it starts on or before
 * 1 January when the year starts on Monday to Thursday, and in the last days of December of the
 * previous year when it starts on Friday to Sunday.
 */
function getIsoWeekStartSerialNumber(year: number, dateSystem: DateSystem): number {
    const yearStartSerialNumber = excelDateSerial(new Date(Date.UTC(year, 0, 1)), dateSystem);
    const yearStartWeekDay = getWeekDayByDateSerialNumber(yearStartSerialNumber, dateSystem);

    if (yearStartWeekDay === 0) {
        // 1 January is a Sunday, which still belongs to the last week of the previous year.
        return yearStartSerialNumber + 1;
    }

    if (yearStartWeekDay <= 4) {
        return yearStartSerialNumber - (yearStartWeekDay - 1);
    }

    return yearStartSerialNumber + (8 - yearStartWeekDay);
}

/**
 * Returns the ISO 8601 week number of a date serial, the value of `ISOWEEKNUM` and
 * `WEEKNUM(date, 21)`. The time fraction is ignored so a date-time keeps the week of its day.
 */
export function getIsoWeekNumber(dateSerialNumber: number, dateSystem = DateSystem.Date1900): number {
    const serialNumber = Math.floor(dateSerialNumber);
    const date = excelSerialToDate(serialNumber, dateSystem);
    // Serial 0 is Excel's 1900-01-00, which is kept in the 1900 calendar year.
    const currentYear = dateSystem === DateSystem.Date1900 && serialNumber === 0 ? 1900 : date.getUTCFullYear();

    let weekStartSerialNumber = getIsoWeekStartSerialNumber(currentYear, dateSystem);

    if (serialNumber < weekStartSerialNumber) {
        weekStartSerialNumber = getIsoWeekStartSerialNumber(currentYear - 1, dateSystem);
    } else if (date.getUTCMonth() === 11) {
        // The last days of December belong to week 1 of the next year when it starts Monday to Thursday.
        const nextYearWeekStartSerialNumber = getIsoWeekStartSerialNumber(currentYear + 1, dateSystem);

        if (serialNumber >= nextYearWeekStartSerialNumber) {
            return 1;
        }
    }

    return Math.floor((serialNumber - weekStartSerialNumber) / 7) + 1;
}

interface ITwoDateDaysType {
    days: number;
    yearDays: number;
}

export function getTwoDateDaysByBasis(startDateSerialNumber: number, endDateSerialNumber: number, basis: number, dateSystem = DateSystem.Date1900): ITwoDateDaysType {
    switch (basis) {
        case 0:
            // U.S. (NASD) method 30/360.
            return getDaysByNASD(startDateSerialNumber, endDateSerialNumber, dateSystem);
        case 1:
            // Actual/actual
            return getDaysByActual(startDateSerialNumber, endDateSerialNumber, dateSystem);
        case 2:
            // Actual/360
            return {
                days: Math.abs(endDateSerialNumber - startDateSerialNumber),
                yearDays: 360,
            };
        case 3:
            // Actual/365
            return {
                days: Math.abs(endDateSerialNumber - startDateSerialNumber),
                yearDays: 365,
            };
        case 4:
            // European method 30/360.
            return getDaysByEuropean(startDateSerialNumber, endDateSerialNumber, dateSystem);
        default:
            return {
                days: Math.abs(endDateSerialNumber - startDateSerialNumber),
                yearDays: 365,
            };
    }
}

/** Financial scalars retain their own Boolean and omitted-argument rules. */
export function getFinancialNumberByObject(value: BaseValueObject, dateSystem = DateSystem.Date1900): number | ErrorValueObject {
    if (value.isError()) return value as ErrorValueObject;
    if (value.isBoolean()) return ErrorValueObject.create(ErrorType.VALUE);
    if (value.isNull()) return (value as NullValueObject).isOmitted() ? ErrorValueObject.create(ErrorType.NA) : 0;
    const parsed = value.isString() ? value.withDateSystem(dateSystem).convertToNumberObjectValue() : value;
    if (parsed.isError()) return parsed as ErrorValueObject;
    const number = Number(parsed.getValue());
    if (!Number.isFinite(number)) return ErrorValueObject.create(ErrorType.VALUE);
    return number;
}

/** Converts a financial date while preserving Excel's numeric versus text path. */
export function getFinancialDateSerialNumberByObject(value: BaseValueObject, dateSystem = DateSystem.Date1900): number | ErrorValueObject {
    if (value.isBoolean()) return ErrorValueObject.create(ErrorType.VALUE);
    const serial = getFinancialNumberByObject(value, dateSystem);
    if (typeof serial !== 'number') return serial;
    const day = Math.floor(serial);
    if (day < 0 || day > getDateSystemMaxSerial(dateSystem)) return ErrorValueObject.create(ErrorType.NUM);
    return day + (dateSystem === DateSystem.Date1904 && !value.isString() ? 1462 : 0);
}

/** YEARFRAC's day-count convention is also used by the simple security functions. */
export function getYearFraction(first: number, last: number, basis: number, dateSystem = DateSystem.Date1900): number {
    const start = Math.min(first, last);
    const end = Math.max(first, last);
    // Calendar-dependent bases cannot decompose dates beyond Excel's last year.
    if ((basis === 1 || ((basis === 0 || basis === 4) && start !== end)) && end > getDateSystemMaxSerial(dateSystem)) return NaN;
    if (start === end) return 0;
    let { days, yearDays } = getTwoDateDaysByBasis(start, end, basis, dateSystem);
    if (basis === 0 || basis === 4) {
        const [startYear, startMonth, originalDay] = getFinancialDateParts(start, dateSystem);
        const [endYear, endMonth, originalEndDay] = getFinancialDateParts(end, dateSystem);
        let startDay = Math.min(originalDay, 30);
        let endDay = originalEndDay;
        if (basis === 4) {
            endDay = Math.min(endDay, 30);
        } else {
            if (endDay === 31 && originalDay >= 30) endDay = 30;
            if (startMonth === 2 && originalDay === getDaysInMonth(startYear, 1)) {
                startDay = 30;
                if (endMonth === 2 && endDay === getDaysInMonth(endYear, 1)) endDay = 30;
            }
        }
        days = (endYear - startYear) * 360 + (endMonth - startMonth) * 30 + endDay - startDay;
    }
    return days / yearDays;
}

function getFinancialDateParts(serial: number, dateSystem: DateSystem): [number, number, number] {
    if (dateSystem === DateSystem.Date1900) {
        if (serial === 0) return [1900, 1, 0];
        if (serial === 60) return [1900, 2, 29];
    }
    const date = excelSerialToDate(serial, dateSystem);
    return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
}

function getDaysByNASD(startDateSerialNumber: number, endDateSerialNumber: number, dateSystem: DateSystem): ITwoDateDaysType {
    const startDateDate = excelSerialToDate(startDateSerialNumber, dateSystem);
    const startIsDate1900SerialZero = dateSystem === DateSystem.Date1900 && startDateSerialNumber === 0;
    const startYear = startIsDate1900SerialZero ? 1900 : startDateDate.getUTCFullYear();
    const startMonth = startIsDate1900SerialZero ? 1 : startDateDate.getUTCMonth() + 1;
    let startDay = startIsDate1900SerialZero ? 0 : startDateDate.getUTCDate();

    let endDateDate = excelSerialToDate(endDateSerialNumber, dateSystem);
    const endIsDate1900SerialZero = dateSystem === DateSystem.Date1900 && endDateSerialNumber === 0;
    let endYear = endIsDate1900SerialZero ? 1900 : endDateDate.getUTCFullYear();
    let endMonth = endIsDate1900SerialZero ? 1 : endDateDate.getUTCMonth() + 1;
    let endDay = endIsDate1900SerialZero ? 0 : endDateDate.getUTCDate();

    const startIsLastDayOfFebruary = startMonth === 2 && startDay === getDaysInMonth(startYear, startMonth - 1);

    // If the starting date is the last day of a month, it becomes equal to the 30th day of the same month.
    // If the ending date is the last day of a month and the starting date is earlier than the 30th day of a month, the ending date becomes equal to the 1st day of the next month; otherwise the ending date becomes equal to the 30th day of the same month.
    if (startIsLastDayOfFebruary) {
        startDay = 30;
    } else if (startDay === 31) {
        startDay = 30;
    }

    if (endMonth === 2 && endDay === getDaysInMonth(endYear, endMonth - 1) && startIsLastDayOfFebruary) {
        endDay = 30;
    } else if (endDay === 31) {
        if (startDay < 30) {
            endDateDate = excelSerialToDate(endDateSerialNumber + 1, dateSystem);
            endYear = endDateDate.getUTCFullYear();
            endMonth = endDateDate.getUTCMonth() + 1;
            endDay = endDateDate.getUTCDate();
        } else {
            endDay = 30;
        }
    }

    const daysInYears = (endYear - startYear) * 360;
    const daysInStartMonth = endDateSerialNumber >= startDateSerialNumber ? 30 - startDay : -startDay;
    const daysInEndMonth = endDateSerialNumber >= startDateSerialNumber ? endDay : endDay - 30;
    const daysInMidMonths = (endDateSerialNumber >= startDateSerialNumber ? (endMonth - startMonth - 1) : (endMonth - startMonth + 1)) * 30;
    const totalDays = Math.abs(daysInYears + daysInStartMonth + daysInEndMonth + daysInMidMonths);

    return {
        days: totalDays,
        yearDays: 360,
    };
}

function getDaysByActual(start: number, end: number, dateSystem: DateSystem): ITwoDateDaysType {
    const earlier = Math.min(start, end);
    const later = Math.max(start, end);
    const startDate = excelSerialToDate(earlier, dateSystem);
    const endDate = excelSerialToDate(later, dateSystem);
    const startZero = dateSystem === DateSystem.Date1900 && earlier === 0;
    const endZero = dateSystem === DateSystem.Date1900 && later === 0;
    const startYear = startZero ? 1900 : startDate.getUTCFullYear();
    const endYear = endZero ? 1900 : endDate.getUTCFullYear();
    const startMonth = startZero ? 1 : startDate.getUTCMonth() + 1;
    const endMonth = endZero ? 1 : endDate.getUTCMonth() + 1;
    const startDay = startZero ? 0 : startDate.getUTCDate();
    const endDay = endZero ? 0 : endDate.getUTCDate();
    const days = later - earlier;
    if (startYear === endYear) return { days, yearDays: isLeapYear(startYear) ? 366 : 365 };
    if (endYear === startYear + 1 && (endMonth < startMonth || (endMonth === startMonth && endDay <= startDay))) {
        const containsLeapDay = (isLeapYear(startYear) && startMonth <= 2)
            || (isLeapYear(endYear) && (endMonth > 2 || (endMonth === 2 && endDay === 29)));
        return { days, yearDays: containsLeapDay ? 366 : 365 };
    }
    let totalYearDays = 0;
    for (let year = startYear; year <= endYear; year++) totalYearDays += isLeapYear(year) ? 366 : 365;
    return { days, yearDays: totalYearDays / (endYear - startYear + 1) };
}

function getDaysByEuropean(startDateSerialNumber: number, endDateSerialNumber: number, dateSystem: DateSystem): ITwoDateDaysType {
    const startDateDate = excelSerialToDate(startDateSerialNumber, dateSystem);
    const startIsDate1900SerialZero = dateSystem === DateSystem.Date1900 && startDateSerialNumber === 0;
    const startYear = startIsDate1900SerialZero ? 1900 : startDateDate.getUTCFullYear();
    const startMonth = startIsDate1900SerialZero ? 1 : startDateDate.getUTCMonth() + 1;
    let startDay = startIsDate1900SerialZero ? 0 : startDateDate.getUTCDate();

    const endDateDate = excelSerialToDate(endDateSerialNumber, dateSystem);
    const endIsDate1900SerialZero = dateSystem === DateSystem.Date1900 && endDateSerialNumber === 0;
    const endYear = endIsDate1900SerialZero ? 1900 : endDateDate.getUTCFullYear();
    const endMonth = endIsDate1900SerialZero ? 1 : endDateDate.getUTCMonth() + 1;
    let endDay = endIsDate1900SerialZero ? 0 : endDateDate.getUTCDate();

    // Starting dates and ending dates that occur on the 31st day of a month become equal to the 30th day of the same month.
    if (startDay === 31) {
        startDay = 30;
    }

    if (endDay === 31) {
        endDay = 30;
    }

    const daysInYears = (endYear - startYear) * 360;
    const daysInStartMonth = endDateSerialNumber >= startDateSerialNumber ? 30 - startDay : -startDay;
    const daysInEndMonth = endDateSerialNumber >= startDateSerialNumber ? endDay : endDay - 30;
    const daysInMidMonths = (endDateSerialNumber >= startDateSerialNumber ? (endMonth - startMonth - 1) : (endMonth - startMonth + 1)) * 30;
    const totalDays = Math.abs(daysInYears + daysInStartMonth + daysInEndMonth + daysInMidMonths);

    return {
        days: totalDays,
        yearDays: 360,
    };
}

export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function isLeapYear1900(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 || year === 1900;
}

const daysInMonthL = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const daysInMonthR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// month is 0 based
export function getDaysInMonth(year: number, month: number): number {
    return isLeapYear(year) ? daysInMonthL[month] : daysInMonthR[month];
}

export function getDaysInYear(year: number): number {
    return isLeapYear1900(year) ? 366 : 365;
}

export function getNormalYearDaysByBasis(dateSerialNumber: number, basis: number, dateSystem = DateSystem.Date1900): number {
    switch (basis) {
        case 0:
        case 2:
        case 4:
            return 360;
        case 1:
            return getDaysInYear(excelSerialToDate(dateSerialNumber, dateSystem).getUTCFullYear());
        case 3:
            return 365;
        default:
            return -1;
    }
}

export function lastDayOfMonth(year: number, month: number, day: number): boolean {
    return getDaysInMonth(year, month) === day;
}

export function dateAddMonths(date: Date, months: number): Date {
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth();
    const day = date.getUTCDate();

    if (lastDayOfMonth(year, month, day)) {
        date.setUTCDate(1);
        date.setUTCMonth(date.getUTCMonth() + months);

        year = date.getUTCFullYear();
        month = date.getUTCMonth();
        date.setUTCDate(getDaysInMonth(year, month));
    } else {
        date.setUTCMonth(date.getUTCMonth() + months);
    }

    return date;
}
