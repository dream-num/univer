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

import { dateFromSerial, dateToSerial } from '../api';
import { getTimeZoneName, numfmtTest } from './test-utils';

/* globals process */

function round(n: number) {
    return Math.round(n * 1e10) / 1e10;
}

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
