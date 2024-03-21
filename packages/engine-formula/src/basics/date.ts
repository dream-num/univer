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

export const DEFAULT_DATE_FORMAT = 'yyyy/mm/dd;@';

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
