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

import type { ITableDateFilterInfo } from '../../types/type';
import { TableDateCompareTypeEnum } from '../../types/enum';

/**
 * The provided date is a date in Q1 of the year.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateQ1 = (date: Date): boolean => {
    const month = date.getMonth();
    return month <= 2;
};

/**
 * The provided date is a date in Q2 of the year.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateQ2 = (date: Date): boolean => {
    const month = date.getMonth();
    return month > 2 && month <= 5;
};

/**
 * The provided date is a date in Q3 of the year.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateQ3 = (date: Date): boolean => {
    const month = date.getMonth();
    return month > 5 && month <= 8;
};

/**
 * The provided date is a date in Q4 of the year.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateQ4 = (date: Date): boolean => {
    const month = date.getMonth();
    return month > 8 && month <= 11;
};

/**
 * The provided date is a date in January.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM1 = (date: Date): boolean => {
    return date.getMonth() === 0;
};

/**
 * The provided date is a date in February.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM2 = (date: Date): boolean => {
    return date.getMonth() === 1;
};

/**
 * The provided date is a date in March.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM3 = (date: Date): boolean => {
    return date.getMonth() === 2;
};

/**
 * The provided date is a date in April.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM4 = (date: Date): boolean => {
    return date.getMonth() === 3;
};

/**
 * The provided date is a date in May.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM5 = (date: Date): boolean => {
    return date.getMonth() === 4;
};

/**
 * The provided date is a date in June.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM6 = (date: Date): boolean => {
    return date.getMonth() === 5;
};

/**
 * The provided date is a date in July.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM7 = (date: Date): boolean => {
    return date.getMonth() === 6;
};

/**
 * The provided date is a date in August.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM8 = (date: Date): boolean => {
    return date.getMonth() === 7;
};

/**
 * The provided date is a date in September.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM9 = (date: Date): boolean => {
    return date.getMonth() === 8;
};

/**
 * The provided date is a date in October.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM10 = (date: Date): boolean => {
    return date.getMonth() === 9;
};

/**
 * The provided date is a date in November.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM11 = (date: Date): boolean => {
    return date.getMonth() === 10;
};

/**
 * The provided date is a date in December.
 * @param {Date} date - The date to compare.
 * @returns {boolean} return the date is match
 */
export const dateM12 = (date: Date): boolean => {
    return date.getMonth() === 11;
};

/**
 * The provided date is today.
 * @param {Date} expectedDate - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const today = (expectedDate: Date, anchorTime: Date = new Date()): boolean => {
    return expectedDate.toDateString() === anchorTime.toDateString();
};

/**
 * The provided date is tomorrow.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const tomorrow = (date: Date, anchorTime: Date = new Date()): boolean => {
    const tomorrow = new Date(anchorTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
};

/**
 * The provided date is yesterday.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const yesterday = (date: Date, anchorTime: Date = new Date()): boolean => {
    const yesterday = new Date(anchorTime);
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
};

/**
 * Get the start date of the week for the provided date.
 * @param {Date} date - The date to get the week start.
 * @returns {Date} The start date of the week.
 */
const getWeekStart = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    return weekStart;
};

const perWeek = 7 * 24 * 60 * 60 * 1000;

/**
 * The provided date is in the current week.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const thisWeek = (date: Date, anchorTime: Date = new Date()): boolean => {
    const weekStart = getWeekStart(date);
    const anchorTimeWeekStart = getWeekStart(anchorTime);
    return weekStart.toDateString() === anchorTimeWeekStart.toDateString();
};

/**
 * The provided date is in the next week.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const nextWeek = (date: Date, anchorTime: Date = new Date()): boolean => {
    const weekStart = getWeekStart(date);
    const anchorTimeNextWeekStart = new Date(getWeekStart(anchorTime).getTime() + perWeek);
    return weekStart.toDateString() === anchorTimeNextWeekStart.toDateString();
};

/**
 * The provided date is in the last week.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const lastWeek = (date: Date, anchorTime: Date = new Date()): boolean => {
    const weekStart = getWeekStart(date);
    const anchorTimeLastWeekStart = new Date(getWeekStart(anchorTime).getTime() - perWeek);
    return weekStart.toDateString() === anchorTimeLastWeekStart.toDateString();
};

/**
 * The provided date is in the current month.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const thisMonth = (date: Date, anchorTime: Date = new Date()): boolean => {
    return date.getFullYear() === anchorTime.getFullYear() && date.getMonth() === anchorTime.getMonth();
};

/**
 * Get the start date of the month for the provided date.
 * @param {Date} date - The date to get the month start.
 * @returns {Date} The start date of the month.
 */
const getMonthStart = (date: Date): Date => {
    const monthStart = new Date(date);
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);
    return monthStart;
};

/**
 * The provided date is in the next month.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const nextMonth = (date: Date, anchorTime: Date = new Date()): boolean => {
    const nextMonthStart = new Date(anchorTime);
    nextMonthStart.setHours(0, 0, 0, 0);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1, 1);

    const monthEnd = new Date(nextMonthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

    const dateTime = date.getTime();

    return dateTime >= nextMonthStart.getTime() && dateTime < monthEnd.getTime();
};

/**
 * The provided date is in the last month.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const lastMonth = (date: Date, anchorTime: Date = new Date()): boolean => {
    const lastMonthStart = getMonthStart(anchorTime);

    const monthEnd = new Date(lastMonthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

    const dateTime = date.getTime();

    return dateTime >= lastMonthStart.getTime() && dateTime < monthEnd.getTime();
};

/**
 * Get the start date of the quarter for the provided date.
 * @param {Date} date - The date to get the quarter start.
 * @returns {Date} The start date of the quarter.
 */
const getQuarterStart = (date: Date): Date => {
    const quarterStart = new Date(date);
    quarterStart.setHours(0, 0, 0, 0);
    quarterStart.setDate(1);
    const month = quarterStart.getMonth();
    quarterStart.setMonth(month - month % 3);
    return quarterStart;
};

/**
 * The provided date is in the current quarter.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const thisQuarter = (date: Date, anchorTime: Date = new Date()): boolean => {
    const quarterStart = getQuarterStart(anchorTime);
    const nextQuarterStart = new Date(quarterStart);
    nextQuarterStart.setMonth(nextQuarterStart.getMonth() + 3);
    const dateTime = date.getTime();
    return dateTime >= quarterStart.getTime() && dateTime < nextQuarterStart.getTime();
};

/**
 * The provided date is in the next quarter.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
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
 * The provided date is in the last quarter.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
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
 * The provided date is in the current year.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const thisYear = (date: Date, anchorTime: Date = new Date()): boolean => {
    return date.getFullYear() === anchorTime.getFullYear();
};

/**
 * The provided date is in the next year.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const nextYear = (date: Date, anchorTime: Date = new Date()): boolean => {
    return date.getFullYear() === anchorTime.getFullYear() + 1;
};

/**
 * The provided date is in the last year.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const lastYear = (date: Date, anchorTime: Date = new Date()): boolean => {
    return date.getFullYear() === anchorTime.getFullYear() - 1;
};

/**
 * The provided date is in the year to date.
 * @param {Date} date - The date to compare.
 * @param {Date} [anchorTime] - The reference date.
 * @returns {boolean} return the date is match
 */
export const yearToDate = (date: Date, anchorTime: Date = new Date()): boolean => {
    const yearStart = new Date(anchorTime);
    yearStart.setHours(0, 0, 0, 0);
    yearStart.setMonth(0, 1);
    const dateTime = date.getTime();
    return dateTime >= yearStart.getTime() && dateTime < anchorTime.getTime();
};

// eslint-disable-next-line max-lines-per-function, complexity
export function getDateFilterExecuteFunc(filterInfo: ITableDateFilterInfo) {
    switch (filterInfo.compareType) {
        case TableDateCompareTypeEnum.Equal:
        {
            const expected = filterInfo.expectedValue as Date;
            return (date: Date) => date.getTime() === expected.getTime();
        }
        case TableDateCompareTypeEnum.NotEqual:
        {
            const expected = filterInfo.expectedValue as Date;
            return (date: Date) => date.getTime() !== expected.getTime();
        }
        case TableDateCompareTypeEnum.After:
        {
            const expected = filterInfo.expectedValue as Date;
            return (date: Date) => date.getTime() > expected.getTime();
        }
        case TableDateCompareTypeEnum.Before:
        {
            const expected = filterInfo.expectedValue as Date;
            return (date: Date) => date.getTime() < expected.getTime();
        }
        case TableDateCompareTypeEnum.AfterOrEqual:
        {
            const expected = filterInfo.expectedValue as Date;
            return (date: Date) => date.getTime() >= expected.getTime();
        }
        case TableDateCompareTypeEnum.BeforeOrEqual:
        {
            const expected = filterInfo.expectedValue as Date;
            return (date: Date) => date.getTime() <= expected.getTime();
        }
        case TableDateCompareTypeEnum.Between:
            return (date: Date) => {
                const [start, end] = filterInfo.expectedValue as [Date, Date];
                return date.getTime() >= new Date(start).getTime() && date.getTime() <= new Date(end).getTime();
            };
        case TableDateCompareTypeEnum.NotBetween:
            return (date: Date) => {
                const [start, end] = filterInfo.expectedValue as [Date, Date];
                return date.getTime() < new Date(start).getTime() || date.getTime() > new Date(end).getTime();
            };
        case TableDateCompareTypeEnum.Today:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => today(date, anchorTime);
        }
        case TableDateCompareTypeEnum.Yesterday:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => yesterday(date, anchorTime);
        }
        case TableDateCompareTypeEnum.Tomorrow:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => tomorrow(date, anchorTime);
        }
        case TableDateCompareTypeEnum.ThisWeek:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => thisWeek(date, anchorTime);
        }
        case TableDateCompareTypeEnum.LastWeek:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => lastWeek(date, anchorTime);
        }
        case TableDateCompareTypeEnum.NextWeek:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => nextWeek(date, anchorTime);
        }
        case TableDateCompareTypeEnum.ThisMonth:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => thisMonth(date, anchorTime);
        }
        case TableDateCompareTypeEnum.LastMonth:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => lastMonth(date, anchorTime);
        }
        case TableDateCompareTypeEnum.NextMonth:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => nextMonth(date, anchorTime);
        }
        case TableDateCompareTypeEnum.ThisQuarter:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => thisQuarter(date, anchorTime);
        }
        case TableDateCompareTypeEnum.LastQuarter:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => lastQuarter(date, anchorTime);
        }
        case TableDateCompareTypeEnum.NextQuarter:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => nextQuarter(date, anchorTime);
        }
        case TableDateCompareTypeEnum.ThisYear:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => thisYear(date, anchorTime);
        }
        case TableDateCompareTypeEnum.LastYear:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => lastYear(date, anchorTime);
        }
        case TableDateCompareTypeEnum.NextYear:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => nextYear(date, anchorTime);
        }
        case TableDateCompareTypeEnum.YearToDate:
        {
            const anchorTime = filterInfo.anchorTime ? new Date(filterInfo.anchorTime) : new Date();
            return (date: Date) => yearToDate(date, anchorTime);
        }
        case TableDateCompareTypeEnum.M1:
            return dateM1;
        case TableDateCompareTypeEnum.M2:
            return dateM2;
        case TableDateCompareTypeEnum.M3:
            return dateM3;
        case TableDateCompareTypeEnum.M4:
            return dateM4;
        case TableDateCompareTypeEnum.M5:
            return dateM5;
        case TableDateCompareTypeEnum.M6:
            return dateM6;
        case TableDateCompareTypeEnum.M7:
            return dateM7;
        case TableDateCompareTypeEnum.M8:
            return dateM8;
        case TableDateCompareTypeEnum.M9:
            return dateM9;
        case TableDateCompareTypeEnum.M10:
            return dateM10;
        case TableDateCompareTypeEnum.M11:
            return dateM11;
        case TableDateCompareTypeEnum.M12:
            return dateM12;
        case TableDateCompareTypeEnum.Q1:
            return dateQ1;
        case TableDateCompareTypeEnum.Q2:
            return dateQ2;
        case TableDateCompareTypeEnum.Q3:
            return dateQ3;
        case TableDateCompareTypeEnum.Q4:
            return dateQ4;
        default:
            throw new Error('Unsupported compare type');
    }
}
