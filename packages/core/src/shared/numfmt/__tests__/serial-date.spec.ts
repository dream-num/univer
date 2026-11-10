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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { DateSystem } from '../../../types/enum/date-system';
import {
    dateFromSerial,
    dateToSerial,
    excelDateSerial,
    excelDateTimePartsToSerial,
    excelDateTimeSerial,
    excelSerialToDate,
    excelSerialToDateTime,
    excelSerialToDateTimeParts,
} from '../serial-date';
import { getTimeZoneName, numfmtTest } from './test-utils';

/* globals process */

function round(n: number) {
    return Math.round(n * 1e10) / 1e10;
}

describe('Excel serial bounds', () => {
    it.each([
        [DateSystem.Date1900, 2_958_465],
        [DateSystem.Date1904, 2_957_003],
    ])('rejects overflowing serials and preserves the last day in %s', (dateSystem, maxSerial) => {
        for (const serial of [maxSerial + 1, 1e12, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE]) {
            expect(excelSerialToDateTimeParts(serial, { dateSystem })).toBeNull();
        }
        expect(excelSerialToDateTimeParts(maxSerial + 0.5, { dateSystem })).toMatchObject({
            year: 9999,
            month: 12,
            day: 31,
            hours: 12,
        });
    });
});

numfmtTest('dateToSerial (Date):', (t) => {
    process.env.TZ = 'Asia/Calcutta';
    t.equal(getTimeZoneName(), 'India Standard Time', 'Timezone is IST');

    const testYMD = (y: number, m: number, d: number, hh: number, mm: number, ss: number, tz = false) => {
        const dt = new Date(y, m - 1, d, hh, mm, ss);
        return round(dateToSerial(dt, { ignoreTimezone: tz })!);
    };

    t.equal(testYMD(1978, 5, 17, 10, 25, 30, true), 28627.2052083333, '[1978, 5, 17, 10, 25, 30] ignoreTimezone');
    t.equal(testYMD(1978, 5, 17, 10, 25, 30), 28627.434375, '[1978, 5, 17, 10, 25, 30]');

    t.equal(testYMD(2022, 3, 1, 13, 53, 11), 44621.578599537, '[2022, 3, 1, 13, 53, 11]');
    t.equal(testYMD(2022, 3, 1, 13, 53, 11, true), 44621.3494328704, '[2022, 3, 1, 13, 53, 11] ignoreTimezone');

    t.equal(testYMD(1900, 1, 1, 0, 0, 0), 1, '[1900, 1, 1, 0, 0, 0]');
    t.equal(testYMD(1900, 1, 1, 0, 0, 0, true), 0.7769675926, '[1900, 1, 1, 0, 0, 0] ignoreTimezone');

    t.equal(testYMD(1950, 1, 1, 0, 0, 0), 18264, '[1950, 1, 1, 0, 0, 0]');
    t.equal(testYMD(1950, 1, 1, 0, 0, 0, true), 18263.7708333333, '[1950, 1, 1, 0, 0, 0] ignoreTimezone');

    t.equal(testYMD(2000, 1, 1, 0, 0, 0), 36526, '[2000, 1, 1, 0, 0, 0]');
    t.equal(testYMD(2000, 1, 1, 0, 0, 0, true), 36525.7708333333, '[2000, 1, 1, 0, 0, 0] ignoreTimezone');
});

numfmtTest('dateToSerial (Array):', (t) => {
    const testYMD = (y: number, m: number, d: number, hh: number, mm: number, ss: number, tz = false) => {
        return round(dateToSerial(
            [y, m, d, hh, mm, ss],
            { ignoreTimezone: tz }
        )!);
    };
    t.equal(testYMD(1978, 5, 17, 10, 25, 30, false), 28627.434375, '[1978, 5, 17, 10, 25, 30]');
    t.equal(testYMD(1978, 5, 17, 10, 25, 30, true), 28627.434375, '[1978, 5, 17, 10, 25, 30]');
    t.equal(testYMD(2022, 3, 1, 13, 53, 11, false), 44621.578599537, '[2022, 3, 1, 13, 53, 11]');
    t.equal(testYMD(2022, 3, 1, 13, 53, 11, true), 44621.578599537, '[2022, 3, 1, 13, 53, 11]');
    t.equal(testYMD(1900, 1, 1, 0, 0, 0, false), 1, '[1900, 1, 1, 0, 0, 0]');
    t.equal(testYMD(1900, 1, 1, 0, 0, 0, true), 1, '[1900, 1, 1, 0, 0, 0]');
    t.equal(testYMD(1950, 1, 1, 0, 0, 0, false), 18264, '[1950, 1, 1, 0, 0, 0]');
    t.equal(testYMD(1950, 1, 1, 0, 0, 0, true), 18264, '[1950, 1, 1, 0, 0, 0]');
    t.equal(testYMD(2000, 1, 1, 0, 0, 0, false), 36526, '[2000, 1, 1, 0, 0, 0]');
    t.equal(testYMD(2000, 1, 1, 0, 0, 0, true), 36526, '[2000, 1, 1, 0, 0, 0]');
});

numfmtTest('dateFromSerial:', (t) => {
    process.env.TZ = 'Europe/Amsterdam';
    t.ok(
        /^Central European (Standard|Summer) Time$/.test(getTimeZoneName()),
        'Timezone is what we think it is'
    );

    t.deepLooseEqual(
        dateFromSerial(1234),
        [1903, 5, 18, 0, 0, 0],
        'dateFromSerial(1234)'
    );
    t.deepLooseEqual(
        dateFromSerial(1234.567),
        [1903, 5, 18, 13, 36, 28],
        'dateFromSerial(1234)'
    );
    t.deepLooseEqual(
        dateFromSerial(12),
        [1900, 1, 12, 0, 0, 0],
        'dateFromSerial(12)'
    );
    t.deepLooseEqual(
        dateFromSerial(24052.8361),
        [1965, 11, 6, 20, 3, 59],
        'dateFromSerial(24052.8361)'
    );
    t.deepLooseEqual(
        dateFromSerial(42341),
        [2015, 12, 3, 0, 0, 0],
        'dateFromSerial(42341)'
    );
});

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
