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

export const DEFFAULT_DATE_FORMAT = 'yyyy/mm/dd';

/**
 * Excel stores dates as sequential serial numbers so they can be used in calculations. By default, January 1, 1900 is serial number 1, and January 1, 2008 is serial number 39448 because it is 39,447 days after January 1, 1900.
 *
 * @param date
 * @returns
 */
export function excelDateSerial(date: Date): number {
    // TODO@Dushusir: set current time zone, reference https://stackoverflow.com/questions/38399465/how-to-get-list-of-all-timezones-in-javascript
    const baseDate = new Date(1900, 0, 1); // January 1, 1900
    const dayDifference = (date.getTime() - baseDate.getTime()) / (1000 * 3600 * 24);
    return Math.ceil(dayDifference) + 1; // +1 for adjusting for Excel's 1900 leap year error
}
