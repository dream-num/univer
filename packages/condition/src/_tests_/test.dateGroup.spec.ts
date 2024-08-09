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

import { describe, expect, it } from 'vitest';
import { groupByDay, groupByHour, groupByMinute, groupByMonth, groupByYear } from '../condition/dateGroupGenerator';
import type { IDateGroupByDayExpected, IDateGroupByHourExpected, IDateGroupByMinuteExpected, IDateGroupByMonthExpected, IDateGroupByYearExpected } from '../condition/types';
import { DateGroupCompareTypeEnum } from '../condition/types';

describe('dateGroup test', () => {
    describe('groupByDay test', () => {
        it('should group dates by day', () => {
            // Test case 1
            const input1 = [new Date('2022-01-01'), new Date('2023-01-01'), new Date('2022-01-02')];
            const expected1: IDateGroupByDayExpected = {
                year: 2022,
                month: 0,
                day: 1,
                dateGroupCompareType: DateGroupCompareTypeEnum.day,
            };
            expect(groupByDay(input1[0], expected1)).toEqual(true);
            expect(groupByDay(input1[1], expected1)).toEqual(false);
            expect(groupByDay(input1[2], expected1)).toEqual(false);

            // Test case 2
            const input2 = [new Date('2022-02-01'), new Date('2022-02-02'), new Date('2022-02-02')];
            const expected2: IDateGroupByDayExpected = {
                year: 2022,
                month: 1,
                day: 2,
                dateGroupCompareType: DateGroupCompareTypeEnum.day,
            };
            expect(groupByDay(input2[0], expected2)).toEqual(false);
            expect(groupByDay(input2[1], expected2)).toEqual(true);
            expect(groupByDay(input2[2], expected2)).toEqual(true);
        });
        it('should group dates by month', () => {
            // Test case 1
            const input1 = [new Date('2022-01-01'), new Date('2023-01-01'), new Date('2022-01-02')];
            const expected1: IDateGroupByMonthExpected = {
                year: 2022,
                month: 0,
                dateGroupCompareType: DateGroupCompareTypeEnum.month,
            };
            expect(groupByMonth(input1[0], expected1)).toEqual(true);
            expect(groupByMonth(input1[1], expected1)).toEqual(false);
            expect(groupByMonth(input1[2], expected1)).toEqual(true);

            // Test case 2
            const input2 = [new Date('2022-02-01'), new Date('2022-02-02'), new Date('2022-02-02')];
            const expected2: IDateGroupByMonthExpected = {
                year: 2022,
                month: 1,
                dateGroupCompareType: DateGroupCompareTypeEnum.month,
            };
            expect(groupByMonth(input2[0], expected2)).toEqual(true);
            expect(groupByMonth(input2[1], expected2)).toEqual(true);
            expect(groupByMonth(input2[2], expected2)).toEqual(true);
        });

        it('should group dates by year', () => {
            // Test case 1
            const input1 = [new Date('2022-01-01'), new Date('2023-01-01'), new Date('2022-01-02')];
            const expected1: IDateGroupByYearExpected = {
                year: 2022,
                dateGroupCompareType: DateGroupCompareTypeEnum.year,
            };
            expect(groupByYear(input1[0], expected1)).toEqual(true);
            expect(groupByYear(input1[1], expected1)).toEqual(false);
            expect(groupByYear(input1[2], expected1)).toEqual(true);

            // Test case 2
            const input2 = [new Date('2022-02-01'), new Date('2022-02-02'), new Date('2022-02-02')];
            const expected2: IDateGroupByYearExpected = {
                year: 2022,
                dateGroupCompareType: DateGroupCompareTypeEnum.year,
            };
            expect(groupByYear(input2[0], expected2)).toEqual(true);
            expect(groupByYear(input2[1], expected2)).toEqual(true);
            expect(groupByYear(input2[2], expected2)).toEqual(true);
        });

        it('should group dates by hour', () => {
            // Test case 1
            const input1 = [new Date('2022-01-01T01:00:00'), new Date('2023-01-01T01:00:00'), new Date('2022-01-02T01:00:00')];
            const expected1: IDateGroupByHourExpected = {
                year: 2022,
                month: 0,
                day: 1,
                hour: 1,
                dateGroupCompareType: DateGroupCompareTypeEnum.hour,
            };

            expect(groupByHour(input1[0], expected1)).toEqual(true);
            expect(groupByHour(input1[1], expected1)).toEqual(false);
            expect(groupByHour(input1[2], expected1)).toEqual(false);

            // Test case 2
            const input2 = [new Date('2022-02-01T02:00:00'), new Date('2022-02-02T02:00:00'), new Date('2022-02-02T02:00:00')];
            const expected2: IDateGroupByHourExpected = {
                year: 2022,
                month: 1,
                day: 2,
                hour: 2,
                dateGroupCompareType: DateGroupCompareTypeEnum.hour,
            };
            expect(groupByHour(input2[0], expected2)).toEqual(false);
            expect(groupByHour(input2[1], expected2)).toEqual(true);
            expect(groupByHour(input2[2], expected2)).toEqual(true);
        });
        it('should group dates by minute', () => {
            // Test case 1
            const input1 = [new Date('2022-01-01T01:00:00'), new Date('2023-01-01T01:00:00'), new Date('2022-01-02T01:00:00')];
            const expected1: IDateGroupByMinuteExpected = {
                year: 2022,
                month: 0,
                day: 1,
                hour: 1,
                minute: 0,
                dateGroupCompareType: DateGroupCompareTypeEnum.minute,
            };
            expect(groupByMinute(input1[0], expected1)).toEqual(true);
            expect(groupByMinute(input1[1], expected1)).toEqual(false);
            expect(groupByMinute(input1[2], expected1)).toEqual(false);

            // Test case 2
            const input2 = [new Date('2022-02-01T02:00:00'), new Date('2022-02-02T02:00:00'), new Date('2022-02-02T02:00:00')];
            const expected2: IDateGroupByMinuteExpected = {
                year: 2022,
                month: 1,
                day: 2,
                hour: 2,
                minute: 0,
                dateGroupCompareType: DateGroupCompareTypeEnum.minute,
            };
            expect(groupByMinute(input2[0], expected2)).toEqual(false);
            expect(groupByMinute(input2[1], expected2)).toEqual(true);
            expect(groupByMinute(input2[2], expected2)).toEqual(true);
        });
    });
});
