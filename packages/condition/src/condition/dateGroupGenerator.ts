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

import type { IDateGroupByDayExpected, IDateGroupByHourExpected, IDateGroupByMinuteExpected, IDateGroupByMonthExpected, IDateGroupByYearExpected } from './types';

/**
 * @description match xml dateTimeGrouping by day, <dateGroupItem year="2024" month="5" day="1" dateTimeGrouping="day"/>
 * @param {Date} date the date to be compared
 * @param {IDateGroupByDayExpected} expected the expected date group by day
 * @returns {boolean} return true if the date matches the expected grouping
 */
export const groupByDay = (date: Date, expected: IDateGroupByDayExpected) => {
    return date.getFullYear() === expected.year && date.getMonth() === expected.month && date.getDate() === expected.day;
};

/**
 * @description match xml dateTimeGrouping by month, <dateGroupItem year="2024" month="5" dateTimeGrouping="month"/>
 * @param {Date} date the date to be compared
 * @param {IDateGroupByMonthExpected} expected the expected date group by month
 * @returns {boolean} return true if the date matches the expected grouping
 */
export const groupByMonth = (date: Date, expected: IDateGroupByMonthExpected) => {
    return date.getFullYear() === expected.year && date.getMonth() === expected.month;
};

/**
 * @description match xml dateTimeGrouping by year, <dateGroupItem year="2024" dateTimeGrouping="year"/>
 * @param {Date} date the date to be compared
 * @param {IDateGroupByYearExpected}  expected the expected date group by year
 * @returns {boolean} return true if the date matches the expected grouping
 */
export const groupByYear = (date: Date, expected: IDateGroupByYearExpected) => {
    return date.getFullYear() === expected.year;
};

/**
 * @description match xml dateTimeGrouping by hour, <dateGroupItem year="2024" month="5" day="1" hour="1" dateTimeGrouping="hour"/>
 * @param {Date} date the date to be compared
 * @param {IDateGroupByHourExpected} expected the expected date group by hour
 * @returns {boolean} return true if the date matches the expected grouping
 */
export const groupByHour = (date: Date, expected: IDateGroupByHourExpected) => {
    return date.getFullYear() === expected.year && date.getMonth() === expected.month && date.getDate() === expected.day && date.getHours() === expected.hour;
};

/**
 * @description match xml dateTimeGrouping by minute,  <dateGroupItem year="2024" month="5" day="1" hour="14" minute="23" dateTimeGrouping="minute"/>
 * @param {Date} date the date to be compared
 * @param {IDateGroupByMinuteExpected}  expected the expected date group by minute
 * @returns {boolean} return true if the date matches the expected grouping
 */
export const groupByMinute = (date: Date, expected: IDateGroupByMinuteExpected) => {
    return date.getFullYear() === expected.year && date.getMonth() === expected.month && date.getDate() === expected.day && date.getHours() === expected.hour && date.getMinutes() === expected.minute;
};
