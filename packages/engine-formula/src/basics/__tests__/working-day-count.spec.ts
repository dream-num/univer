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

import { DateSystem } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ArrayValueObject, transformToValueObject } from '../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_DATE } from '../../functions/date/function-names';
import { Networkdays } from '../../functions/date/networkdays';
import { NetworkdaysIntl } from '../../functions/date/networkdays-intl';
import { countWorkingDays, getWeekDayByDateSerialNumber, getWeekendArray } from '../date';

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

    it.each([DateSystem.Date1900, DateSystem.Date1904])('retains both public functions and holiday deduplication in date system %s', (dateSystem) => {
        const holidays = [59, 59.9, 60, 60, 61.1, 99, 100, 101];
        const holidayArray = ArrayValueObject.create({
            calculateValueList: transformToValueObject([holidays]),
            rowCount: 1,
            columnCount: holidays.length,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });
        const ordinary = new Networkdays(FUNCTION_NAMES_DATE.NETWORKDAYS);
        const international = new NetworkdaysIntl(FUNCTION_NAMES_DATE.NETWORKDAYS_INTL);
        ordinary.setDateSystem(dateSystem);
        international.setDateSystem(dateSystem);

        for (const [from, to] of [[58, 100], [100, 58], [60, 60]]) {
            expect(ordinary.calculate(NumberValueObject.create(from), NumberValueObject.create(to), holidayArray).getValue())
                .toBe(countDayByDay(from, to, 1, holidays, dateSystem));
            for (const weekend of ['1010101', '0000000', '1111111']) {
                expect(international.calculate(NumberValueObject.create(from), NumberValueObject.create(to), StringValueObject.create(weekend), holidayArray).getValue())
                    .toBe(countDayByDay(from, to, weekend, holidays, dateSystem));
            }
        }
    });

    it('counts a long calendar with repeated holidays', () => {
        const holidays = Array.from({ length: 5000 }, (_, i) => 45000 + (i % 2500));
        expect(countWorkingDays(45000, 81524, 1, holidays)).toBe(countDayByDay(45000, 81524, 1, holidays, DateSystem.Date1900));
    });
});
