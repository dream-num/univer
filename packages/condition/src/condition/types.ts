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

export type CompareFunc = (compareValue: any, expectedValue: any) => boolean;
export type SqlFunc = () => string;
export type CompareType = DateCompareTypeEnum | TextCompareTypeEnum | NumberCompareTypeEnum | DynamicCompareTypeEnum | DateGroupCompareTypeEnum | LogicCompareTypeEnum;

export enum DateCompareTypeEnum {
    /**
     * @description the same date
     */
    dateEqual,
    /**
     * @description not the same date
     */
    dateNotEqual,
    /**
     * @description old than expected date
     */
    dateOlderThan,
    /**
     * @description old than or equal date
     */
    dateOlderThanOrEqual,
    /**
     * @description before expected date
     */
    dateNewerThan,
    /**
     * @description before or equal expected date
     */
    dateNewerThanOrEqual,
    /**
     * @description a date is between two other expected date
     */
    dateBetween,
    /**
     * @description a date is between two other expected date
     */
    dateNotBetween,
    /**
     * @description The first quarter of a year
     */
    Q1,
    /**
     * @description The second quarter of a year
     */
    Q2,
    /**
     * @description The 3'th quarter of a year
     */
    Q3,
    /**
     * @description The last quarter of a year
     */
    Q4,
    /**
     * @description January
     */
    M1,
    /**
     * @description February
     */
    M2,
    /**
     * @description March
     */
    M3,
    /**
     * @description April
     */
    M4,
    /**
     * @description May
     */
    M5,
    /**
     * @description June
     */
    M6,
    /**
     * @description July
     */
    M7,
    /**
     * @description August
     */
    M8,
    /**
     * @description September
     */
    M9,
    /**
     * @description October
     */
    M10,
    /**
     * @description November
     */
    M11,
    /**
     * @description December
     */
    M12,

}

export enum TextCompareTypeEnum {
    /**
     * @description the string is equal to expect string
     */
    textNotEqual = 'textNotEqual',
    /**
     * @description the string is equal to expect string
     */
    textEqual = 'textEqual',
    /**
     * @description the string start with expected text
     */
    BeginsWith = 'BeginsWith',
    /**
     * @description the string not start with expected text
     */
    NotBeginsWith = 'NotBeginsWith',
    /**
     * @description the string end with expected text
     */
    EndsWith = 'EndsWith',
    /**
     * @description the string not end with expected text
     */
    NotEndsWith = 'NotEndsWith',
    /**
     * @description the string contain expected text
     */
    Contains = 'Contains',
    /**
     * @description the string not contain expected text
     */
    NotContains = 'NotContains',

}

export enum NumberCompareTypeEnum {
    /**
     *@description The given value is equal to the expected
     */
    equal = 'equal',
    /**
     *@description a value is not equal to a expected value
     */
    notEqual = 'notEqual',
    /**
     *@description a value is greater than to a expected value
     */
    greaterThan = 'greaterThan',
    /**
     *@description a value is greater than or equal to a expected value
     */
    greaterThanOrEqual = 'greaterThanOrEqual',
    /**
     *@description a value is less than a expected value
     */
    lessThan = 'lessThan',
    /**
     *@description a value is less than than or equal to a expected value
     */
    lessThanOrEqual = 'lessThanOrEqual',
    /**
     *@description closed interval , a value is greater than or equal to the smaller expected value, and less than or equal to the bigger value
     */
    between = 'between',
    /**
     *@description open interval, a value is greater than or equal to the bigger expected value, and less than or equal to the smaller value
     */
    notBetween = 'notBetween',
}

export enum DynamicCompareTypeEnum {
    /**
     * @description the value is above the average value
     */
    above = 'above',
    /**
     * @description the value is below the average value
     */
    below = 'below',
    /**
     * @description  the value is in the top 10
     */
    top10 = 'top10',
    /**
     *@description day after today
     */
    tomorrow = 'tomorrow',
    /**
     *@description today
     */
    today = 'today',
    /**
     *@description yesterday
     */
    yesterday = 'yesterday',
    /**
     *@description next week
     */
    nextWeek = 'nextWeek',
    /**
     *@description this week
     */
    thisWeek = 'thisWeek',
    /**
     *@description last week
     */
    lastWeek = 'lastWeek',
    /**
     *@description next month
     */
    nextMonth = 'nextMonth',
    /**
     *@description this month
     */
    thisMonth = 'thisMonth',
    /**
     *@description last month
     */
    lastMonth = 'lastMonth',
    /**
     *@description next quarter
     */
    nextQuarter = 'nextQuarte',
    /**
     *@description this quarter
     */
    thisQuarter = 'thisQuarte',
    /**
     *@description last quarter
     */
    lastQuarter = 'lastQuarte',
    /**
     *@description next year
     */
    nextYear = 'nextYear',
    /**
     *@description this year
     */
    thisYear = 'thisYear',
    /**
     *@description last year
     */
    lastYear = 'lastYear',
    /**
     *@description the time area for this year begin to current
     */
    yearToDate = 'yearToDate',
}

export enum DateGroupCompareTypeEnum {
    /**
     * @description Group by day
     */
    day = 'day',
    /**
     * @description Group by hour
     */
    hour = 'hour',
    /**
     * @description Group by minute
     */
    minute = 'minute',
    /**
     * @description Group by month
     */
    month = 'month',
    /**
     * @description Group by second
     */
    second = 'second',
    /**
     * @description Group by year
     */
    year = 'year',

}

export enum LogicCompareTypeEnum {
    /**
     * @description return a opposite of expect condition
     */
    not = 'not',
    /**
     * @description all expect conditions is true it will return true , otherwise it will be false
     */
    and = 'and',
    /**
     * @description one of expect conditions is true , it will return true
     */
    or = 'or',
}

/**
 * @description Represents the expected date grouping by day.
 */
export interface IDateGroupByDayExpected {
    year: number; // The year value.
    month: number; // The month value.
    day: number; // The day value.
    dateGroupCompareType: DateGroupCompareTypeEnum.day; // The date grouping type.
}

/**
 * @description Represents the expected date grouping by month.
 */
export interface IDateGroupByMonthExpected {
    year: number; // The year value.
    month: number; // The month value.
    dateGroupCompareType: DateGroupCompareTypeEnum.month; // The date grouping type.
}

/**
 * @description Represents the expected date grouping by hour.
 */
export interface IDateGroupByHourExpected {
    year: number; // The year value.
    month: number; // The month value.
    day: number; // The day value.
    hour: number; // The hour value.
    dateGroupCompareType: DateGroupCompareTypeEnum.hour; // The date grouping type.
}

/**
 * @description Represents the expected date grouping by minute.
 */
export interface IDateGroupByMinuteExpected {
    year: number; // The year value.
    month: number; // The month value.
    day: number; // The day value.
    hour: number; // The hour value.
    minute: number; // The minute value.
    dateGroupCompareType: DateGroupCompareTypeEnum.minute; // The date grouping type.
}

/**
 * @description Represents the expected date grouping by year.
 */
export interface IDateGroupByYearExpected {
    year: number; // The year value.
    dateGroupCompareType: DateGroupCompareTypeEnum.year; // The date grouping type.
}
