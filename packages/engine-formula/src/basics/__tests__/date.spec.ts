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

import { DateSystem, excelDateSerial, excelDateTimeSerial, excelSerialToDate } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { stripErrorMargin } from '../../engine/utils/math-kit';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import {
    countWorkingDays,
    formatDateDefault,
    getDateSerialNumberByObject,
    getTwoDateDaysByBasis,
    getWeekDayByDateSerialNumber,
    getWeekendArray,
    isValidDateStr,
    isValidWeekend,
} from '../date';
import { ErrorType } from '../error-type';

describe('Test date', () => {
    it.each(['', '1', '000001', '00000110', '00000001', '00000|1', '0000011x', '11111111', '0000011\n'])('rejects invalid weekend mask %j', (weekend) => {
        expect(isValidWeekend(weekend)).toBe(false);
        expect(getWeekendArray(weekend)).toEqual([]);
    });

    it.each<[string, number[]]>([
        ['0000011', [6, 0]],
        ['1000000', [1]],
        ['0000000', []],
        ['1111111', [1, 2, 3, 4, 5, 6, 0]],
    ])('decodes valid weekend mask %s', (weekend, expected) => {
        expect(isValidWeekend(weekend)).toBe(true);
        expect(getWeekendArray(weekend)).toEqual(expected);
    });

    it.each<[number, number[]]>([
        [1, [6, 0]],
        [2, [0, 1]],
        [3, [1, 2]],
        [4, [2, 3]],
        [5, [3, 4]],
        [6, [4, 5]],
        [7, [5, 6]],
        [11, [0]],
        [12, [1]],
        [13, [2]],
        [14, [3]],
        [15, [4]],
        [16, [5]],
        [17, [6]],
    ])('decodes valid numeric weekend code %i', (weekend, expected) => {
        expect(isValidWeekend(weekend)).toBe(true);
        expect(getWeekendArray(weekend)).toEqual(expected);
    });

    it('Function excelDateSerial', () => {
        expect(excelDateSerial(new Date(Date.UTC(1900, 1, 28)))).toBe(59);
        expect(excelDateSerial(new Date(Date.UTC(1900, 1, 29)))).toBe(61);
        expect(excelDateSerial(new Date(Date.UTC(1900, 2, 1)))).toBe(61);
        expect(excelDateSerial(new Date(Date.UTC(1901, 0, 1)))).toBe(367);
        expect(excelDateSerial(new Date(Date.UTC(2024, 1, 2)))).toBe(45324);
    });

    it('Function excelDateSerial should account for hours, minutes, and seconds', () => {
        // Testing midday, which is exactly half of a day
        expect(excelDateTimeSerial(new Date(Date.UTC(2024, 0, 2, 12, 0, 0)))).toBe(45293.5);
        // Testing exact hour, which is a quarter of a day
        expect(excelDateTimeSerial(new Date(Date.UTC(2024, 0, 2, 6, 0, 0)))).toBe(45293.25);
        // Testing minutes and seconds
        expect(stripErrorMargin(excelDateTimeSerial(new Date(Date.UTC(2024, 0, 2, 1, 2, 3))))).toBe(45293.0430902778);
        expect(stripErrorMargin(excelDateTimeSerial(new Date(Date.UTC(2024, 5, 24, 15, 10, 0))))).toBe(45467.6319444444);
    });

    it('Function excelSerialToDate', () => {
        expect(formatDateDefault(excelSerialToDate(59))).toBe('1900/02/28');
        expect(formatDateDefault(excelSerialToDate(61))).toBe('1900/03/01');
        expect(formatDateDefault(excelSerialToDate(367))).toBe('1901/01/01');
        expect(formatDateDefault(excelSerialToDate(45324))).toBe('2024/02/02');
        expect(formatDateDefault(excelSerialToDate(0, DateSystem.Date1904))).toBe('1904/01/01');
        expect(excelDateSerial(new Date(Date.UTC(1904, 0, 2)), DateSystem.Date1904)).toBe(1);
    });
    it('Function isValidDateStr', () => {
        expect(isValidDateStr('2020-1-1')).toBeTruthy();
        expect(isValidDateStr('2020/1/31')).toBeTruthy();
        expect(isValidDateStr('2020-2-31')).toBeFalsy();
        expect(isValidDateStr('2020/001/31')).toBeFalsy();
    });

    it('uses the decoded 1904 date when day-count calculations receive serial zero', () => {
        expect(getTwoDateDaysByBasis(0, 1, 0, DateSystem.Date1904).days).toBe(1);
        expect(getTwoDateDaysByBasis(0, 1, 1, DateSystem.Date1904)).toEqual({ days: 1, yearDays: 366 });
        expect(getTwoDateDaysByBasis(0, 1, 4, DateSystem.Date1904).days).toBe(1);
    });

    it('validates the maximum serial against the active Excel date system', () => {
        const invalid1900 = getDateSerialNumberByObject(NumberValueObject.create(2958466), DateSystem.Date1900);
        const invalid1904 = getDateSerialNumberByObject(NumberValueObject.create(2957004), DateSystem.Date1904);

        expect(getDateSerialNumberByObject(NumberValueObject.create(2958465), DateSystem.Date1900)).toBe(2958465);
        expect(typeof invalid1900 === 'number' ? invalid1900 : invalid1900.getValue()).toBe(ErrorType.NUM);
        expect(getDateSerialNumberByObject(NumberValueObject.create(2957003), DateSystem.Date1904)).toBe(2957003);
        expect(typeof invalid1904 === 'number' ? invalid1904 : invalid1904.getValue()).toBe(ErrorType.NUM);
    });
});

function countDayByDay(start: number, end: number, weekend: number | string, holidays: number[], dateSystem: DateSystem): number {
    const weekendDays = getWeekendArray(weekend);
    let count = 0;
    for (let day = Math.min(Math.floor(start), Math.floor(end)); day <= Math.max(Math.floor(start), Math.floor(end)); day++) {
        if (!weekendDays.includes(getWeekDayByDateSerialNumber(day, dateSystem)) && !holidays.some((holiday) => Math.floor(holiday) === day)) {
            count++;
        }
    }
    return Math.floor(end) >= Math.floor(start) ? count : -count;
}

describe('Working-day counts', () => {
    it.each([DateSystem.Date1900, DateSystem.Date1904])('returns zero for non-finite date arguments in date system %s', (dateSystem) => {
        for (const invalid of [Number.NaN, Infinity, -Infinity]) {
            for (const [from, to] of [[invalid, 10], [10, invalid], [invalid, invalid]]) {
                for (const weekend of [1, '0000000', '1111111']) {
                    expect(countWorkingDays(from, to, weekend, [1, 2, 2], dateSystem)).toBeCloseTo(0);
                }
            }
        }
    });

    it.each([DateSystem.Date1900, DateSystem.Date1904])('matches daily enumeration for every weekend mask in date system %s', (dateSystem) => {
        const weekends: (number | string)[] = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17];
        for (let mask = 0; mask < 128; mask++) {
            weekends.push(mask.toString(2).padStart(7, '0'));
        }

        for (const weekend of weekends) {
            for (let start = 0; start < 7; start++) {
                for (const length of [0, 1, 6, 7, 8, 13, 14, 20, 30]) {
                    const end = start + length;
                    const holidays = [start - 1, start, start + 0.9, start + 1, start + 3.5, end + 1];
                    for (const [from, to] of [[start + 0.5, end + 0.9], [end + 0.9, start + 0.5]]) {
                        expect(countWorkingDays(from, to, weekend, holidays, dateSystem), JSON.stringify({ from, to, weekend, dateSystem }))
                            .toBe(countDayByDay(from, to, weekend, holidays, dateSystem));
                    }
                }
            }
        }
    });

    it('counts a long calendar with repeated holidays', () => {
        const holidays = Array.from({ length: 5000 }, (_, i) => 45000 + (i % 2500));
        expect(countWorkingDays(45000, 81524, 1, holidays)).toBe(countDayByDay(45000, 81524, 1, holidays, DateSystem.Date1900));
    });
});
