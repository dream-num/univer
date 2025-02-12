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
import { isRealNum, numfmt } from '@univerjs/core';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import { ErrorType } from './error-type';

export const DEFAULT_DATE_FORMAT = 'yyyy/mm/dd;@';
export const DEFAULT_NOW_FORMAT = 'yyyy/mm/dd hh:mm';
export const DEFAULT_TIME_FORMAT = 'h:mm A/P';

/**
 * Excel stores dates as sequential serial numbers so they can be used in calculations. By default, January 1, 1900 is serial number 1, and January 1, 2008 is serial number 39448 because it is 39,447 days after January 1, 1900.
 *
 * Excel has a leap year error in 1900. February 29, 1900 is considered a legal date. In fact, there is no February 29 in 1900.
 * 1900.2.28 Date Serial 59
 * 1900.2.29 Date Serial 61
 * 1900.3.1 Date Serial 61
 * 1901.1.1 Date Serial 367
 * @param date
 * @returns
 */
export function excelDateSerial(date: Date): number {
    const baseDate = new Date(Date.UTC(1900, 0, 1)); // January 1, 1900, UTC
    const leapDayDate = new Date(Date.UTC(1900, 1, 28)); // February 28, 1900, UTC
    const dateInUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

    // Calculate the difference in days between the base date and the input date
    let dayDifference = (dateInUTC - baseDate.getTime()) / (1000 * 3600 * 24);

    // If the date is later than February 28, 1900, the day difference needs to be adjusted to account for Excel errors
    if (dateInUTC > leapDayDate.getTime()) {
        dayDifference += 1;
    }

    return Math.floor(dayDifference) + 1; // Excel serial number starts from 1
}

/**
 * Time serial number with date
 * @param date
 * @returns
 */
export function excelDateTimeSerial(date: Date): number {
    const baseDate = new Date(Date.UTC(1900, 0, 1, 0, 0, 0)); // January 1, 1900, UTC at midnight
    const leapDayDate = new Date(Date.UTC(1900, 1, 28, 0, 0, 0)); // February 28, 1900, UTC at midnight

    // Calculate the difference in milliseconds between the input date and the base date
    const diffMilliseconds = date.getTime() - baseDate.getTime();
    let dayDifference = diffMilliseconds / (1000 * 3600 * 24);

    // Adjusting for the Excel leap year bug
    if (date > leapDayDate) {
        dayDifference += 1;
    }

    return dayDifference + 1; // Excel serial number starts from 1
}

export function excelSerialToDate(serial: number): Date {
    const baseDate = new Date(Date.UTC(1900, 0, 1)); // January 1, 1900, UTC
    const leapDayDate = new Date(Date.UTC(1900, 1, 28)); // February 28, 1900, UTC

    let dayDifference = Math.floor(serial) - 1; // Adjust for Excel serial number starting from 1

    // If the serial number corresponds to a date later than February 28, 1900, adjust the day difference
    if (dayDifference > (leapDayDate.getTime() - baseDate.getTime()) / (1000 * 3600 * 24)) {
        dayDifference -= 1;
    }

    const resultDate = new Date(baseDate.getTime() + dayDifference * (1000 * 3600 * 24));
    return resultDate;
}

export function excelSerialToDateTime(serial: number): Date {
    const baseDate = new Date(Date.UTC(1900, 0, 1, 0, 0, 0)); // January 1, 1900, UTC
    const leapDayDate = new Date(Date.UTC(1900, 1, 28, 0, 0, 0)); // February 28, 1900, UTC

    let dayDifference = serial - 1; // Adjust for Excel serial number starting from 1

    // If the serial number corresponds to a date later than February 28, 1900, adjust the day difference
    if (dayDifference > (leapDayDate.getTime() - baseDate.getTime()) / (1000 * 3600 * 24)) {
        dayDifference -= 1;
    }

    if (dayDifference < 0) {
        dayDifference = serial;
    }

    const resultDate = new Date(baseDate.getTime() + dayDifference * (1000 * 3600 * 24));
    return resultDate;
}

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
 * @param dateStr
 * @returns
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

export function parseFormattedDate(value: string) {
    return numfmt.parseDate(value);
}

export function parseFormattedValue(value: string) {
    return numfmt.parseValue(value);
}

export function parseFormattedTime(value: string) {
    return numfmt.parseTime(value);
}

export function isDate(format: string) {
    return numfmt.isDate(format);
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

export function countWorkingDays(startDateSerialNumber: number, endDateSerialNumber: number, weekend: number | string = 1, holidays?: number[]): number {
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

        const weekDay = getWeekDayByDateSerialNumber(currentDateSerialNumber);

        if (weekendArray.includes(weekDay)) {
            continue;
        }

        workingDays++;
    }

    return end >= start ? workingDays : -workingDays;
}

export function getDateSerialNumberByWorkingDays(startDateSerialNumber: number, workingDays: number, weekend: number | string = 1, holidays?: number[]): (number | ErrorValueObject) {
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

        const weekDay = getWeekDayByDateSerialNumber(currentDateSerialNumber);

        if (weekendArray.includes(weekDay)) {
            days++;
            continue;
        }

        targetDateSerialNumber = currentDateSerialNumber;
    }

    return targetDateSerialNumber;
}

export function getDateSerialNumberByObject(serialNumberObject: BaseValueObject): (ErrorValueObject | number) {
    if (serialNumberObject.isError()) {
        return serialNumberObject as ErrorValueObject;
    }

    const dateValue = serialNumberObject.getValue();

    if (serialNumberObject.isString()) {
        let dateSerial;

        if (parseFormattedDate(`${dateValue}`)) {
            dateSerial = parseFormattedDate(`${dateValue}`).v;
        } else if (parseFormattedTime(`${dateValue}`)) {
            dateSerial = parseFormattedTime(`${dateValue}`).v;
        } else if (isRealNum(dateValue)) {
            dateSerial = +dateValue;
        } else {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (dateSerial instanceof Date) {
            dateSerial = excelDateTimeSerial(dateSerial);
        }

        if (+dateSerial < 0 || +dateSerial > 2958465) { // 2958465 = 9999/12/31
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return +dateSerial;
    } else {
        const dateSerial = +serialNumberObject.getValue();

        if (dateSerial < 0 || dateSerial > 2958465) { // 2958465 = 9999/12/31
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return dateSerial;
    }
}

export function getWeekDayByDateSerialNumber(dateSerialNumber: number): number {
    // special date 1900-02-29(serialNumber = 60)
    const isDate19000229 = Math.floor(dateSerialNumber) === 60;

    let date = excelSerialToDate(dateSerialNumber);

    const dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).getTime();
    const leapDayDateTime = new Date(Date.UTC(1900, 1, 28)).getTime(); // February 28, 1900, UTC

    if (!isDate19000229 && dateTime <= leapDayDateTime) {
        date = new Date(dateTime - 24 * 3600 * 1000);
    }

    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).getUTCDay();
}

interface ITwoDateDaysType {
    days: number;
    yearDays: number;
}

export function getTwoDateDaysByBasis(startDateSerialNumber: number, endDateSerialNumber: number, basis: number): ITwoDateDaysType {
    switch (basis) {
        case 0:
            // U.S. (NASD) method 30/360.
            return getDaysByNASD(startDateSerialNumber, endDateSerialNumber);
        case 1:
            // Actual/actual
            return getDaysByActual(startDateSerialNumber, endDateSerialNumber);
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
            return getDaysByEuropean(startDateSerialNumber, endDateSerialNumber);
        default:
            return {
                days: Math.abs(endDateSerialNumber - startDateSerialNumber),
                yearDays: 365,
            };
    }
}

function getDaysByNASD(startDateSerialNumber: number, endDateSerialNumber: number): ITwoDateDaysType {
    const startDateDate = excelSerialToDate(startDateSerialNumber);
    const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;
    const startMonth = startDateSerialNumber > 0 ? startDateDate.getUTCMonth() + 1 : 1;
    let startDay = startDateSerialNumber > 0 ? startDateDate.getUTCDate() : 0;

    let endDateDate = excelSerialToDate(endDateSerialNumber);
    let endYear = endDateSerialNumber > 0 ? endDateDate.getUTCFullYear() : 1900;
    let endMonth = endDateSerialNumber > 0 ? endDateDate.getUTCMonth() + 1 : 1;
    let endDay = endDateSerialNumber > 0 ? endDateDate.getUTCDate() : 0;

    // If the starting date is the last day of a month, it becomes equal to the 30th day of the same month.
    // If the ending date is the last day of a month and the starting date is earlier than the 30th day of a month, the ending date becomes equal to the 1st day of the next month; otherwise the ending date becomes equal to the 30th day of the same month.
    if (startMonth === 2) {
        const startDateAfterDay = excelSerialToDate(startDateSerialNumber + 1);

        if (startDateAfterDay.getUTCMonth() + 1 === 3) {
            startDay = 30;
        }
    } else if (startDay === 31) {
        startDay = 30;
    }

    if (endDay === 31) {
        if (startDay < 30) {
            endDateDate = excelSerialToDate(endDateSerialNumber + 1);
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

function getDaysByActual(startDateSerialNumber: number, endDateSerialNumber: number): ITwoDateDaysType {
    const startDateDate = excelSerialToDate(startDateSerialNumber);
    const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;

    const endDateDate = excelSerialToDate(endDateSerialNumber);
    const endYear = endDateSerialNumber > 0 ? endDateDate.getUTCFullYear() : 1900;

    const totalDays = Math.abs(endDateSerialNumber - startDateSerialNumber);
    const totalYear = Math.abs(endYear - startYear) + 1;

    let startYearFirstDaySerialNumber;
    let endYearLastDaySerialNumber;

    if (endYear < startYear) {
        const startYearFirstDay = new Date(Date.UTC(endYear, 0, 1));
        const endYearLastDay = new Date(Date.UTC(startYear, 11, 31));

        startYearFirstDaySerialNumber = excelDateSerial(startYearFirstDay);
        endYearLastDaySerialNumber = excelDateSerial(endYearLastDay);

        if (endYear === 1900) { // Special handle. excel 1900 days = 365, 1900/12/31 SerialNumber = 366. so start add 1
            startYearFirstDaySerialNumber += 1;
        }
    } else {
        const startYearFirstDay = new Date(Date.UTC(startYear, 0, 1));
        const endYearLastDay = new Date(Date.UTC(endYear, 11, 31));

        startYearFirstDaySerialNumber = excelDateSerial(startYearFirstDay);
        endYearLastDaySerialNumber = excelDateSerial(endYearLastDay);

        if (startYear === 1900) { // Special handle. excel 1900 days = 365, 1900/12/31 SerialNumber = 366. so start add 1
            startYearFirstDaySerialNumber += 1;
        }
    }

    return {
        days: totalDays,
        yearDays: (endYearLastDaySerialNumber - startYearFirstDaySerialNumber + 1) / totalYear,
    };
}

function getDaysByEuropean(startDateSerialNumber: number, endDateSerialNumber: number): ITwoDateDaysType {
    const startDateDate = excelSerialToDate(startDateSerialNumber);
    const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;
    const startMonth = startDateSerialNumber > 0 ? startDateDate.getUTCMonth() + 1 : 1;
    let startDay = startDateSerialNumber > 0 ? startDateDate.getUTCDate() : 0;

    const endDateDate = excelSerialToDate(endDateSerialNumber);
    const endYear = endDateSerialNumber > 0 ? endDateDate.getUTCFullYear() : 1900;
    const endMonth = endDateSerialNumber > 0 ? endDateDate.getUTCMonth() + 1 : 1;
    let endDay = endDateSerialNumber > 0 ? endDateDate.getUTCDate() : 0;

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

export function getNormalYearDaysByBasis(dateSerialNumber: number, basis: number): number {
    switch (basis) {
        case 0:
        case 2:
        case 4:
            return 360;
        case 1:
            return getDaysInYear(excelSerialToDate(dateSerialNumber).getUTCFullYear());
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
