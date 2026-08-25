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
    if (typeof weekend === 'string' && /^[0|1]{7}/.test(weekend)) {
        return true;
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

    if (typeof weekend === 'string' && /^[0|1]{7}/.test(weekend)) {
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
    const weekendArray = getWeekendArray(weekend);

    const start = Math.floor(startDateSerialNumber);
    const end = Math.floor(endDateSerialNumber);
    const startSerialNumber = end > start ? start : end;

    let workingDays = 0;

    const daysDiff = Math.abs(Math.floor(endDateSerialNumber) - Math.floor(startDateSerialNumber)) + 1;

    for (let i = 0; i < daysDiff; i++) {
        const currentDateSerialNumber = startSerialNumber + i;

        if (holidays && holidays.length > 0 && holidays.some((item) => Math.floor(item) === currentDateSerialNumber)) {
            continue;
        }

        const weekDay = getWeekDayByDateSerialNumber(currentDateSerialNumber, dateSystem);

        if (weekendArray.includes(weekDay)) {
            continue;
        }

        workingDays++;
    }

    return end >= start ? workingDays : -workingDays;
}

export function getDateSerialNumberByWorkingDays(startDateSerialNumber: number, workingDays: number, weekend: number | string = 1, holidays?: number[], dateSystem = DateSystem.Date1900): number | ErrorValueObject {
    const weekendArray = getWeekendArray(weekend);

    const _startDateSerialNumber = Math.floor(startDateSerialNumber);
    let targetDateSerialNumber = _startDateSerialNumber;

    let days = Math.abs(workingDays);

    for (let i = 1; i <= days; i++) {
        const currentDateSerialNumber = workingDays < 0 ? _startDateSerialNumber - i : _startDateSerialNumber + i;

        if (currentDateSerialNumber < 0) {
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
    dateSystem?: DateSystem
): ErrorValueObject | number {
    if (serialNumberObject.isError()) {
        return serialNumberObject as ErrorValueObject;
    }

    const dateValue = serialNumberObject.getValue();
    const maxSerial = getDateSystemMaxSerial(dateSystem);

    if (serialNumberObject.isString()) {
        let dateSerial: any;
        const options = { dateSystem };

        if (parseFormattedDate(`${dateValue}`, options)) {
            dateSerial = parseFormattedDate(`${dateValue}`, options)!.v;
        } else if (parseFormattedTime(`${dateValue}`, options)) {
            dateSerial = parseFormattedTime(`${dateValue}`, options)!.v;
        } else if (parseEnglishMonthNameDate(`${dateValue}`)) {
            dateSerial = parseEnglishMonthNameDate(`${dateValue}`)!;
        } else if (isRealNum(dateValue)) {
            dateSerial = +dateValue;
        } else {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (dateSerial instanceof Date) {
            dateSerial = excelDateTimeSerial(dateSerial, dateSystem);
        }

        if (+dateSerial < 0 || +dateSerial > maxSerial) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return +dateSerial;
    } else {
        const dateSerial = +serialNumberObject.getValue();

        if (dateSerial < 0 || dateSerial > maxSerial) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return dateSerial;
    }
}

export function getWeekDayByDateSerialNumber(dateSerialNumber: number, dateSystem = DateSystem.Date1900): number {
    const offset = dateSystem === DateSystem.Date1904 ? 5 : 6;
    return ((Math.floor(dateSerialNumber) + offset) % 7 + 7) % 7;
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

function getDaysByActual(startDateSerialNumber: number, endDateSerialNumber: number, dateSystem: DateSystem): ITwoDateDaysType {
    const startDateDate = excelSerialToDate(startDateSerialNumber, dateSystem);
    const startIsDate1900SerialZero = dateSystem === DateSystem.Date1900 && startDateSerialNumber === 0;
    const startYear = startIsDate1900SerialZero ? 1900 : startDateDate.getUTCFullYear();
    const startMonth = startIsDate1900SerialZero ? 1 : startDateDate.getUTCMonth() + 1;
    const startDay = startIsDate1900SerialZero ? 0 : startDateDate.getUTCDate();

    const endDateDate = excelSerialToDate(endDateSerialNumber, dateSystem);
    const endIsDate1900SerialZero = dateSystem === DateSystem.Date1900 && endDateSerialNumber === 0;
    const endYear = endIsDate1900SerialZero ? 1900 : endDateDate.getUTCFullYear();
    const endMonth = endIsDate1900SerialZero ? 1 : endDateDate.getUTCMonth() + 1;
    const endDay = endIsDate1900SerialZero ? 0 : endDateDate.getUTCDate();

    const totalDays = Math.abs(endDateSerialNumber - startDateSerialNumber);

    // A period from a date to the same date in a later year is a whole number of years.
    // Excel uses the actual length of those years instead of averaging both boundary years.
    if (endDateSerialNumber >= startDateSerialNumber && endYear > startYear && startMonth === endMonth && startDay === endDay) {
        return {
            days: totalDays,
            yearDays: totalDays / (endYear - startYear),
        };
    }

    const totalYear = Math.abs(endYear - startYear) + 1;

    let startYearFirstDaySerialNumber;
    let endYearLastDaySerialNumber;

    if (endYear < startYear) {
        const startYearFirstDay = new Date(Date.UTC(endYear, 0, 1));
        const endYearLastDay = new Date(Date.UTC(startYear, 11, 31));

        startYearFirstDaySerialNumber = excelDateSerial(startYearFirstDay, dateSystem);
        endYearLastDaySerialNumber = excelDateSerial(endYearLastDay, dateSystem);

        if (dateSystem === DateSystem.Date1900 && endYear === 1900) { // Special handle. excel 1900 days = 365, 1900/12/31 SerialNumber = 366. so start add 1
            startYearFirstDaySerialNumber += 1;
        }
    } else {
        const startYearFirstDay = new Date(Date.UTC(startYear, 0, 1));
        const endYearLastDay = new Date(Date.UTC(endYear, 11, 31));

        startYearFirstDaySerialNumber = excelDateSerial(startYearFirstDay, dateSystem);
        endYearLastDaySerialNumber = excelDateSerial(endYearLastDay, dateSystem);

        if (dateSystem === DateSystem.Date1900 && startYear === 1900) { // Special handle. excel 1900 days = 365, 1900/12/31 SerialNumber = 366. so start add 1
            startYearFirstDaySerialNumber += 1;
        }
    }

    return {
        days: totalDays,
        yearDays: (endYearLastDaySerialNumber - startYearFirstDaySerialNumber + 1) / totalYear,
    };
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
