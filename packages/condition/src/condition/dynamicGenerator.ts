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

import { getLargestK, getSmallestK } from './topN';

/**
 * @description Checks if a value is above the average.
 * @param {number} value - The value to check.
 * @param {number} average - The average value.
 * @returns {boolean} A boolean value indicating whether the value is above the average.
 */
export const above = (value: number, average: number): boolean => {
    return value > average;
};

/**
 * @description Checks if a value is below the average.
 * @param {number} value - The value to check.
 * @param {number} average - The average value.
 * @returns {boolean} A boolean value indicating whether the value is below the average.
 */
export const below = (value: number, average: number): boolean => {
    return value < average;
};

/**
 * @description Gets the largest N values from a list and checks if the expected value is included.
 * @param {number[]} list - The list of numbers.
 * @param {number} top - The number of top values to retrieve.
 * @param {number} expectedValue - The expected value to check for inclusion.
 * @returns {boolean} A boolean value indicating whether the expected value is included in the top N values.
 */
export const getTopN = (list: number[], top: number, expectedValue: number): boolean => {
    const heap = getLargestK(list, top);
    return heap.includes(expectedValue);
};

/**
 * @description Gets the smallest N values from a list and checks if the expected value is included.
 * @param {number[]} list - The list of numbers.
 * @param {number} bottom - The number of bottom values to retrieve.
 * @param {number} expectedValue - The expected value to check for inclusion.
 * @returns {boolean} A boolean value indicating whether the expected value is included in the bottom N values.
 */
export const getBottomN = (list: number[], bottom: number, expectedValue: number): boolean => {
    const heap = getSmallestK(list, bottom);
    return heap.includes(expectedValue);
};

/**
 * @description get is same day with given date xml: <dynamicFilter type="today" val="45448" maxVal="45449"/>
 * @param {Date} expectedDate the date to be compared
 * @param {Date} [anchorTime] the anchor time to compare, if the anchor time is not given, it will use the current time
 * @returns {boolean} return true if the date is same day with the anchor time
 */
export const today = (expectedDate: Date, anchorTime: Date = new Date()): boolean => {
    return expectedDate.toDateString() === anchorTime.toDateString();
};

/**
 * @description get is tomorrow with given date xml: <dynamicFilter type="tomorrow" val="45448" maxVal="45449"/>
 * @param {Date} date the date to be compared
 * @param {Date} anchorTime the anchor time to compare, if the anchor time is not given, it will use the current time
 * @returns {boolean} return true if the date is tomorrow with the anchor time
 */
export const tomorrow = (date: Date, anchorTime: Date = new Date()): boolean => {
    const tomorrow = new Date(anchorTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
};

/**
 * @description get is yesterday with given date xml: <dynamicFilter type="yesterday" val="45448" maxVal="45449"/>
 * @param {Date} date the date to be compared
 * @param {Date} anchorTime the anchor time to compare, if the anchor time is not given, it will use the current time
 * @returns {boolean} return true if the date is yesterday with the anchor time
 */
export const yesterday = (date: Date, anchorTime: Date = new Date()): boolean => {
    const yesterday = new Date(anchorTime);
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
};
/**
 * @description get the day a week start date
 * @param {Date} date the date to be compared
 * @returns {Date} return the week start date
 */
const getWeekStart = (date: Date): Date => {
    // Sunday - Saturday : 0 - 6
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    return weekStart;
};
const perWeek = 7 * 24 * 60 * 60 * 1000;

/**
 * @description get is same week with given date xml: <dynamicFilter type="thisWeek" val="45448" maxVal="45449"/>
 * @param {Date} date the date to be compared
 * @param {Date} [anchorTime] the anchor time to compare, if the anchor time is not given, it will use the current time
 * @returns {boolean} return true if the date is same week with the anchor time
 */
export const thisWeek = (date: Date, anchorTime: Date = new Date()): boolean => {
    const weekStart = getWeekStart(date);
    const anchorTimeWeekStart = getWeekStart(anchorTime);
    return weekStart.toDateString() === anchorTimeWeekStart.toDateString();
};

/**
 * @description Checks if a given date is exactly one week after the anchor time.
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is exactly one week after the anchor time.
 */
export const nextWeek = (date: Date, anchorTime: Date = new Date()): boolean => {
    const weekStart = getWeekStart(date);
    const anchorTimeNextWeekStart = new Date(getWeekStart(anchorTime).getTime() + perWeek);
    return weekStart.toDateString() === anchorTimeNextWeekStart.toDateString();
};

/**
 * @description Checks if a given date is exactly one week before the anchor time.
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is exactly one week before the anchor time.
 */
export const lastWeek = (date: Date, anchorTime: Date = new Date()): boolean => {
    const weekStart = getWeekStart(date);
    const anchorTimeLastWeekStart = new Date(getWeekStart(anchorTime).getTime() - perWeek);
    return weekStart.toDateString() === anchorTimeLastWeekStart.toDateString();
};

/**
 * @description get is same month with given date xml:  <dynamicFilter type="thisMonth" val="45444" maxVal="45474"/>
 * @param {Date} date
 * @param {Date} [anchorTime] the anchor time to compare, if the anchor time is not given, it will use the current time
 * @returns {boolean} return true if the date is same month with the anchor time
 */
export const thisMonth = (date: Date, anchorTime: Date = new Date()): boolean => {
    return date.getFullYear() === anchorTime.getFullYear() && date.getMonth() === anchorTime.getMonth();
};

const getMonthStart = (date: Date): Date => {
    const monthStart = new Date(date);
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);
    return monthStart;
};

/**
 * @description Checks if a given date is exactly one month after the anchor time. xml: <dynamicFilter type="nextMonth" val="45292" maxVal="45449"/>
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is exactly one month after the anchor time.
 */
export const nextMonth = (date: Date, anchorTime: Date = new Date()): boolean => {
    const nextMonthStart = new Date(anchorTime);
    // when the date is January 31, the next month is February ,but February doesn't have 31 days, so it will be March 3
    // so must set the date to 1
    nextMonthStart.setHours(0, 0, 0, 0);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1, 1);

    const monthEnd = new Date(nextMonthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

    const dateTime = date.getTime();

    return dateTime >= nextMonthStart.getTime() && dateTime < monthEnd.getTime();
};

/**
 * @description Checks if a given date is exactly one month before the anchor time. xml: <dynamicFilter type="lastMonth" val="45292" maxVal="45449"/>
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is exactly one month before the anchor time.
 */
export const lastMonth = (date: Date, anchorTime: Date = new Date()): boolean => {
    const lastMonthStart = getMonthStart(anchorTime);

    const monthEnd = new Date(lastMonthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

    const dateTime = date.getTime();

    return dateTime >= lastMonthStart.getTime() && dateTime < monthEnd.getTime();
};

const getQuarterStart = (date: Date): Date => {
    const quarterStart = new Date(date);
    quarterStart.setHours(0, 0, 0, 0);
    quarterStart.setDate(1);
    const month = quarterStart.getMonth();
    quarterStart.setMonth(month - month % 3);
    return quarterStart;
};

/**
 * @description Checks if a given date is within the current quarter. xml: <dynamicFilter type="thisQuarter" val="45292" maxVal="45449"/>
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is within the current quarter.
 */
export const thisQuarter = (date: Date, anchorTime: Date = new Date()): boolean => {
    const quarterStart = getQuarterStart(anchorTime);
    const nextQuarterStart = new Date(quarterStart);
    nextQuarterStart.setMonth(nextQuarterStart.getMonth() + 3);
    const dateTime = date.getTime();
    return dateTime >= quarterStart.getTime() && dateTime < nextQuarterStart.getTime();
};

/**
 * @description Checks if a given date is exactly one quarter after the anchor time. xml: <dynamicFilter type="nextQuarter" val="45292" maxVal="45449"/>
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is exactly one quarter after the anchor time.
 */
export const nextQuarter = (date: Date, anchorTime: Date = new Date()): boolean => {
    const quarterStart = getQuarterStart(anchorTime);
    const nextQuarterStart = new Date(quarterStart);
    nextQuarterStart.setMonth(nextQuarterStart.getMonth() + 3);
    const nextQuarterEnd = new Date(nextQuarterStart);
    nextQuarterEnd.setMonth(nextQuarterEnd.getMonth() + 3, 0);

    const dateTime = date.getTime();

    return dateTime >= nextQuarterStart.getTime() && dateTime < nextQuarterEnd.getTime();
};

/**
 * @description Checks if a given date is exactly one quarter before the anchor time. xml: <dynamicFilter type="lastQuarter" val="45292" maxVal="45449"/>
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is exactly one quarter before the anchor time.
 */
export const lastQuarter = (date: Date, anchorTime: Date = new Date()): boolean => {
    const quarterStart = getQuarterStart(anchorTime);
    const lastQuarterStart = new Date(quarterStart);
    lastQuarterStart.setMonth(lastQuarterStart.getMonth() - 3);
    const lastQuarterEnd = new Date(quarterStart);
    lastQuarterEnd.setDate(0);

    const dateTime = date.getTime();

    return dateTime >= lastQuarterStart.getTime() && dateTime < lastQuarterEnd.getTime();
};

/**
 * @description get is same year with given date xml: <dynamicFilter type="thisYear" val="45448" maxVal="45449"/>
 * @param {Date} date
 * @param {Date} [anchorTime] the anchor time to compare, if the anchor time is not given, it will use the current time
 * @returns {boolean} return true if the date is same year with the anchor time
 */
export const thisYear = (date: Date, anchorTime: Date = new Date()): boolean => {
    return date.getFullYear() === anchorTime.getFullYear();
};

/**
 * @description Checks if a given date is exactly one year after the anchor time. xml: <dynamicFilter type="nextYear" val="45292" maxVal="45449"/>
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is exactly one year after the anchor time.
 */
export const nextYear = (date: Date, anchorTime: Date = new Date()): boolean => {
    return date.getFullYear() === anchorTime.getFullYear() + 1;
};

/**
 * @description Checks if a given date is exactly one year before the anchor time. xml  <dynamicFilter type="lastYear" val="45292" maxVal="45449"/>
 * @param {Date} date - The date to check.
 * @param {Date} [anchorTime] - The anchor time. Defaults to the current date and time.
 * @returns A boolean value indicating whether the given date is exactly one year before the anchor time.
 */
export const lastYear = (date: Date, anchorTime: Date = new Date()): boolean => {
    return date.getFullYear() === anchorTime.getFullYear() - 1;
};

/**
 * @description Checks if a given date is exactly in same year with anchorTime but is before the anchorTime. xml: <dynamicFilter type="yearToDate" val="45292" maxVal="45449"/>
 * @param {Date} date the date to be compared
 * @returns {Date} return the year start date
 */
export const yearToDate = (date: Date, anchorTime: Date = new Date()): boolean => {
    const yearStart = new Date(anchorTime);
    yearStart.setHours(0, 0, 0, 0);
    yearStart.setMonth(0, 1);
    const dateTime = date.getTime();
    return dateTime >= yearStart.getTime() && dateTime < anchorTime.getTime();
};
