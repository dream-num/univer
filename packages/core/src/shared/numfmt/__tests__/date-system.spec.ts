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

import { describe, expect, it } from 'vitest';
import { DateSystem } from '../../../types/enum/date-system';
import { excelDateSerial, excelDateTimePartsToSerial, excelDateTimeSerial, excelSerialToDate, excelSerialToDateTime, excelSerialToDateTimeParts } from '../serial-date';

describe('Excel date systems', () => {
    it('preserves the Excel 1900 compatibility dates', () => {
        expect(excelSerialToDateTimeParts(0, { dateSystem: DateSystem.Date1900 })).toEqual({
            year: 1900,
            month: 1,
            day: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            fractionalSecond: 0,
        });
        expect(excelSerialToDateTimeParts(60, { dateSystem: DateSystem.Date1900 })).toEqual({
            year: 1900,
            month: 2,
            day: 29,
            hours: 0,
            minutes: 0,
            seconds: 0,
            fractionalSecond: 0,
        });
    });

    it('uses 1904-01-01 as serial zero in the Excel 1904 system', () => {
        const parts = {
            year: 1904,
            month: 1,
            day: 1,
            hours: 0,
            minutes: 0,
            seconds: 0,
            fractionalSecond: 0,
        };

        expect(excelSerialToDateTimeParts(0, { dateSystem: DateSystem.Date1904 })).toEqual(parts);
        expect(excelDateTimePartsToSerial(parts, { dateSystem: DateSystem.Date1904 })).toBe(0);
    });

    it('preserves fractional seconds without using a native Date', () => {
        const parts = excelSerialToDateTimeParts(0.5242683912037037, { dateSystem: DateSystem.Date1900 });

        expect(parts).toMatchObject({
            year: 1900,
            month: 1,
            day: 0,
            hours: 12,
            minutes: 34,
            seconds: 56,
        });
        expect(parts?.fractionalSecond).toBeCloseTo(0.789, 9);
    });

    it('rejects invalid calendar inputs', () => {
        expect(excelSerialToDateTimeParts(-1, { dateSystem: DateSystem.Date1900 })).toBeNull();
        expect(excelSerialToDateTimeParts(Number.POSITIVE_INFINITY, { dateSystem: DateSystem.Date1900 })).toBeNull();
        expect(excelDateTimePartsToSerial({
            year: 1900,
            month: 2,
            day: 29,
            hours: 0,
            minutes: 0,
            seconds: 0,
            fractionalSecond: 0,
        }, { dateSystem: DateSystem.Date1904 })).toBeNull();
    });

    it('converts serials to UTC native Dates and normalizes pseudo-dates', () => {
        expect(excelSerialToDate(0, DateSystem.Date1900).getTime()).toBe(Date.UTC(1899, 11, 31));
        expect(excelSerialToDate(60, DateSystem.Date1900).getTime()).toBe(Date.UTC(1900, 1, 28));
        expect(excelSerialToDate(0, DateSystem.Date1904).getTime()).toBe(Date.UTC(1904, 0, 1));
        expect(excelSerialToDateTime(0.5, DateSystem.Date1904).getTime()).toBe(Date.UTC(1904, 0, 1, 12));
        expect(Number.isNaN(excelSerialToDate(-1, DateSystem.Date1900).getTime())).toBe(true);
    });

    it('converts UTC native Dates to serials for both Excel date systems', () => {
        expect(excelDateSerial(new Date(Date.UTC(1900, 1, 28)))).toBe(59);
        expect(excelDateSerial(new Date(Date.UTC(1900, 2, 1)))).toBe(61);
        expect(excelDateSerial(new Date(Date.UTC(1904, 0, 1)), DateSystem.Date1904)).toBe(0);
        expect(excelDateTimeSerial(new Date(Date.UTC(2024, 0, 2, 12)))).toBe(45293.5);
        expect(Number.isNaN(excelDateSerial(new Date(Number.NaN)))).toBe(true);
    });
});
