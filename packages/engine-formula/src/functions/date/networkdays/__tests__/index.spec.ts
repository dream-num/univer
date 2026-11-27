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
import { getWeekDayByDateSerialNumber, getWeekendArray } from '../../../../basics/date';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Networkdays } from '../index';

describe('Test networkdays function', () => {
    const testFunction = new Networkdays(FUNCTION_NAMES_DATE.NETWORKDAYS);

    describe('Networkdays', () => {
        it('Value is all date string', () => {
            const startDate = StringValueObject.create('2012-10-1');
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(110);

            const holidays2 = StringValueObject.create('2012-11-22');
            const result2 = testFunction.calculate(startDate, endDate, holidays2);
            expect(result2.getValue()).toStrictEqual(109);

            const holidays3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2012-11-22'],
                    ['2012-12-4'],
                    ['2013-1-21'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(startDate, endDate, holidays3);
            expect(result3.getValue()).toStrictEqual(107);
        });

        it('uses the configured date system for serial zero', () => {
            const startDate = NumberValueObject.create(0);
            const endDate = NumberValueObject.create(0);

            testFunction.setDateSystem(DateSystem.Date1900);
            expect(testFunction.calculate(startDate, endDate).getValue()).toBe(0);

            testFunction.setDateSystem(DateSystem.Date1904);
            expect(testFunction.calculate(startDate, endDate).getValue()).toBe(1);

            testFunction.setDateSystem(DateSystem.Date1900);
        });

        it('Value is number or date string', () => {
            const startDate = NumberValueObject.create(45122);
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(-2706);

            const holidays2 = NumberValueObject.create(45001);
            const result2 = testFunction.calculate(startDate, endDate, holidays2);
            expect(result2.getValue()).toStrictEqual(-2705);
        });

        it('Value is not date string', () => {
            const startDate = StringValueObject.create('test');
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate2 = StringValueObject.create('2012-10-1');
            const endDate2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate3 = StringValueObject.create('2012-10-1');
            const endDate3 = StringValueObject.create('2013-3-1');
            const holidays3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(startDate3, endDate3, holidays3);
            expect(result3.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const startDate = NullValueObject.create();
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(29525);

            const startDate2 = StringValueObject.create('2012-10-1');
            const endDate2 = NullValueObject.create();
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(result2.getValue()).toStrictEqual(-29416);

            const startDate3 = StringValueObject.create('2012-10-1');
            const endDate3 = StringValueObject.create('2013-3-1');
            const holidays3 = NullValueObject.create();
            const result3 = testFunction.calculate(startDate3, endDate3, holidays3);
            expect(result3.getValue()).toStrictEqual(110);
        });

        it('Value is boolean', () => {
            const startDate = BooleanValueObject.create(true);
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate2 = StringValueObject.create('2012-10-1');
            const endDate2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate3 = StringValueObject.create('2012-10-1');
            const endDate3 = StringValueObject.create('2013-3-1');
            const holidays3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(startDate3, endDate3, holidays3);
            expect(result3.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is error', () => {
            const startDate = ErrorValueObject.create(ErrorType.NAME);
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const startDate2 = StringValueObject.create('2012-10-1');
            const endDate2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);

            const startDate3 = StringValueObject.create('2012-10-1');
            const endDate3 = StringValueObject.create('2013-3-1');
            const holidays3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(startDate3, endDate3, holidays3);
            expect(result3.getValue()).toStrictEqual(ErrorType.NAME);
        });
        it('checks the serial-zero boundary in both date systems', () => {
            const startDate = NumberValueObject.create(0);
            const endDate = NumberValueObject.create(366);

            testFunction.setDateSystem(DateSystem.Date1900);
            expect(testFunction.calculate(startDate, endDate).getValue()).toBe(261);

            testFunction.setDateSystem(DateSystem.Date1904);
            expect(testFunction.calculate(startDate, endDate).getValue()).toBe(261);

            testFunction.setDateSystem(DateSystem.Date1900);
        });
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

describe('Working-day ranges', () => {
    it.each([DateSystem.Date1900, DateSystem.Date1904])('retains zero for a non-finite formula result in date system %s', (dateSystem) => {
        const ordinary = new Networkdays(FUNCTION_NAMES_DATE.NETWORKDAYS);
        ordinary.setDateSystem(dateSystem);
        const invalid = NumberValueObject.create(Number.NaN);

        for (const [from, to] of [[invalid, NumberValueObject.create(10)], [NumberValueObject.create(10), invalid]]) {
            expect(ordinary.calculate(from, to).getValue()).toBeCloseTo(0);
            expect(ordinary.calculate(from, to, ArrayValueObject.createByArray([[1, 2, 2]])).getValue()).toBeCloseTo(0);
            expect(ordinary.calculate(from, to, ErrorValueObject.create(ErrorType.NA)).getValue()).toBe(ErrorType.NA);
        }
        for (const invalid of [Infinity, -Infinity]) {
            expect(ordinary.calculate(NumberValueObject.create(invalid), NumberValueObject.create(10)).getValue()).toBe(ErrorType.NUM);
        }
    });

    it.each([DateSystem.Date1900, DateSystem.Date1904])('retains holiday deduplication in date system %s', (dateSystem) => {
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
        ordinary.setDateSystem(dateSystem);

        for (const [from, to] of [[58, 100], [100, 58], [60, 60]]) {
            expect(ordinary.calculate(NumberValueObject.create(from), NumberValueObject.create(to), holidayArray).getValue())
                .toBe(countDayByDay(from, to, 1, holidays, dateSystem));
        }
    });
});
