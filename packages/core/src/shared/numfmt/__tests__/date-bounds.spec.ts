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

import { format } from '../api';
import { numfmtTest } from './test-utils';

const ISODATE = 'yyyy-mm-dd';
const ISODATETIME = 'yyyy-mm-dd\\Thh:mm:ss';

numfmtTest('dateSpanLarge: OFF', (t) => {
    const opts = { leap1900: false, dateSpanLarge: false, dateErrorThrows: true };

    t.throws(() => format(ISODATE, -0.1, opts), '-0.1');
    t.throws(() => format(ISODATE, -0.01, opts), '-0.01');
    t.throws(() => format(ISODATE, -0.001, opts), '-0.001');
    t.throws(() => format(ISODATE, -0.0001, opts), '-0.0001');
    t.throws(() => format(ISODATE, -0.00001, opts), '-0.00001');
    t.throws(() => format(ISODATE, -0.000001, opts), '-0.000001');
    t.equal(format(ISODATE, 0, opts), '1899-12-30', '0');

    t.throws(() => format(ISODATE, 2958465.99999422, opts), '2958465.99999422');
    t.equal(format(ISODATE, 2958465.99999421, opts), '9999-12-31', '2958465.99999421');

    const dt = 'yyyy-mm-dd/hh:mm:ss';
    t.throws(() => format(dt, 2958465.99999422, opts), '2958465.99999422');
    t.equal(format(dt, 2958465.99999421, opts), '9999-12-31/23:59:59', '2958465.99999421');

    const dt0 = 'yyyy-mm-dd/hh:mm:ss.0';
    t.throws(() => format(dt0, 2958465.99999943, opts), '2958465.99999943');
    t.equal(format(dt0, 2958465.99999942, opts), '9999-12-31/23:59:59.9', '2958465.99999942');

    const dt00 = `${ISODATE}/hh:mm:ss.00`;
    t.throws(() => format(dt00, 2958465.99999995, opts), '2958465.99999995');
    t.equal(format(dt00, 2958465.99999994, opts), '9999-12-31/23:59:59.99', '2958465.99999994');

    const dt000 = `${ISODATE}/hh:mm:ss.000`;
    // Excel can't really represent 2958465.999999995 so this never happens, but:
    t.throws(() => format(dt000, 2958465.999999995, opts), '2958465.99999999');
    t.equal(format(dt000, 2958465.99999999, opts), '9999-12-31/23:59:59.999', '2958465.99999999');
});

numfmtTest('dateSpanLarge: ON', (t) => {
    t.format(ISODATETIME, 0.1, '1899-12-30T02:24:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.00001157407, '1899-12-29T23:59:59', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, 0, '1899-12-30T00:00:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.1, '1899-12-29T21:36:00', { leap1900: false, dateSpanLarge: true });

    t.format('[s]', -0.1, '-8640', { leap1900: false, dateSpanLarge: true });
    t.format('[m]', -0.1, '-144', { leap1900: false, dateSpanLarge: true });
    t.format('[h]', -0.1, '-2', { leap1900: false, dateSpanLarge: true });
    t.format('[s]', -2, '-172800', { leap1900: false, dateSpanLarge: true });
    t.format('[m]', -2, '-2880', { leap1900: false, dateSpanLarge: true });
    t.format('[h]', -2, '-48', { leap1900: false, dateSpanLarge: true });

    t.format(ISODATETIME, -0.2, '1899-12-29T19:12:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.3, '1899-12-29T16:48:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.4, '1899-12-29T14:24:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.5, '1899-12-29T12:00:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.6, '1899-12-29T09:36:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.7, '1899-12-29T07:12:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.8, '1899-12-29T04:48:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -0.9, '1899-12-29T02:24:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1, '1899-12-29T00:00:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.1, '1899-12-28T21:36:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.2, '1899-12-28T19:12:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.3, '1899-12-28T16:48:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.4, '1899-12-28T14:24:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.5, '1899-12-28T12:00:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.6, '1899-12-28T09:36:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.7, '1899-12-28T07:12:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.8, '1899-12-28T04:48:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -1.9, '1899-12-28T02:24:00', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, -2, '1899-12-28T00:00:00', { leap1900: false, dateSpanLarge: true });

    // negative dates should not be affected by the leap year bug
    t.format(ISODATETIME, -0.2, '1899-12-29T19:12:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -0.3, '1899-12-29T16:48:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -0.4, '1899-12-29T14:24:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -0.5, '1899-12-29T12:00:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -0.6, '1899-12-29T09:36:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -0.7, '1899-12-29T07:12:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -0.8, '1899-12-29T04:48:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -0.9, '1899-12-29T02:24:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1, '1899-12-29T00:00:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.1, '1899-12-28T21:36:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.2, '1899-12-28T19:12:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.3, '1899-12-28T16:48:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.4, '1899-12-28T14:24:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.5, '1899-12-28T12:00:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.6, '1899-12-28T09:36:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.7, '1899-12-28T07:12:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.8, '1899-12-28T04:48:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -1.9, '1899-12-28T02:24:00', { dateSpanLarge: true });
    t.format(ISODATETIME, -2, '1899-12-28T00:00:00', { dateSpanLarge: true });

    t.format(ISODATE, -45000, '1776-10-15', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATE, 35830289, '99999-12-30', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATE, 35830290, '99999-12-31', { leap1900: false, dateSpanLarge: true });
    t.format(ISODATETIME, 35830290.9, '99999-12-31T21:36:00', { leap1900: false, dateSpanLarge: true });
    // out of bounds
    t.format(ISODATETIME, 35830291, '######', { leap1900: false, dateSpanLarge: true, dateErrorNumber: false });
    t.format(ISODATETIME, 35830291, '35830291', { leap1900: false, dateSpanLarge: true, dateErrorNumber: true });

    // Google Sheets emits "00-1-01-02" for TEXT(-694324, ISODATE)
    // this is does not seem all that useful to anyone
    t.format(ISODATE, -694323, '-0001-01-02', { leap1900: false, dateSpanLarge: true, dateErrorNumber: false });
    t.format(ISODATE, -694324, '-0001-01-01', { leap1900: false, dateSpanLarge: true, dateErrorNumber: false });
    t.format(ISODATETIME, -694324.1, '######', { leap1900: false, dateSpanLarge: true, dateErrorNumber: false });
    t.format(ISODATETIME, -694324.1, '-694324.1', { leap1900: false, dateSpanLarge: true, dateErrorNumber: true });
});

numfmtTest('Excel leap 1900 bug: ON', (t) => {
    t.format(ISODATE, 61, '1900-03-01', { leap1900: true });
    t.format(ISODATE, 60, '1900-02-29', { leap1900: true });
    t.format(ISODATE, 59, '1900-02-28', { leap1900: true });
    t.format(ISODATE, 58, '1900-02-27', { leap1900: true });
    t.format(ISODATE, 57, '1900-02-26', { leap1900: true });
    t.format(ISODATE, 56, '1900-02-25', { leap1900: true });
    t.format(ISODATE, 55, '1900-02-24', { leap1900: true });
    t.format(ISODATE, 54, '1900-02-23', { leap1900: true });
    t.format(ISODATE, 53, '1900-02-22', { leap1900: true });
    t.format(ISODATE, 52, '1900-02-21', { leap1900: true });
    t.format(ISODATE, 51, '1900-02-20', { leap1900: true });
    t.format(ISODATE, 50, '1900-02-19', { leap1900: true });
    t.format(ISODATE, 49, '1900-02-18', { leap1900: true });
    t.format(ISODATE, 48, '1900-02-17', { leap1900: true });
    t.format(ISODATE, 47, '1900-02-16', { leap1900: true });
    t.format(ISODATE, 46, '1900-02-15', { leap1900: true });
    t.format(ISODATE, 45, '1900-02-14', { leap1900: true });
    t.format(ISODATE, 44, '1900-02-13', { leap1900: true });
    t.format(ISODATE, 43, '1900-02-12', { leap1900: true });
    t.format(ISODATE, 42, '1900-02-11', { leap1900: true });
    t.format(ISODATE, 41, '1900-02-10', { leap1900: true });
    t.format(ISODATE, 40, '1900-02-09', { leap1900: true });
    t.format(ISODATE, 39, '1900-02-08', { leap1900: true });
    t.format(ISODATE, 38, '1900-02-07', { leap1900: true });
    t.format(ISODATE, 37, '1900-02-06', { leap1900: true });
    t.format(ISODATE, 36, '1900-02-05', { leap1900: true });
    t.format(ISODATE, 35, '1900-02-04', { leap1900: true });
    t.format(ISODATE, 34, '1900-02-03', { leap1900: true });
    t.format(ISODATE, 33, '1900-02-02', { leap1900: true });
    t.format(ISODATE, 32, '1900-02-01', { leap1900: true });
    t.format(ISODATE, 31, '1900-01-31', { leap1900: true });
    t.format(ISODATE, 30, '1900-01-30', { leap1900: true });
    t.format(ISODATE, 29, '1900-01-29', { leap1900: true });
    t.format(ISODATE, 28, '1900-01-28', { leap1900: true });
    t.format(ISODATE, 27, '1900-01-27', { leap1900: true });
    t.format(ISODATE, 26, '1900-01-26', { leap1900: true });
    t.format(ISODATE, 25, '1900-01-25', { leap1900: true });
    t.format(ISODATE, 24, '1900-01-24', { leap1900: true });
    t.format(ISODATE, 23, '1900-01-23', { leap1900: true });
    t.format(ISODATE, 22, '1900-01-22', { leap1900: true });
    t.format(ISODATE, 21, '1900-01-21', { leap1900: true });
    t.format(ISODATE, 20, '1900-01-20', { leap1900: true });
    t.format(ISODATE, 19, '1900-01-19', { leap1900: true });
    t.format(ISODATE, 18, '1900-01-18', { leap1900: true });
    t.format(ISODATE, 17, '1900-01-17', { leap1900: true });
    t.format(ISODATE, 16, '1900-01-16', { leap1900: true });
    t.format(ISODATE, 15, '1900-01-15', { leap1900: true });
    t.format(ISODATE, 14, '1900-01-14', { leap1900: true });
    t.format(ISODATE, 13, '1900-01-13', { leap1900: true });
    t.format(ISODATE, 12, '1900-01-12', { leap1900: true });
    t.format(ISODATE, 11, '1900-01-11', { leap1900: true });
    t.format(ISODATE, 10, '1900-01-10', { leap1900: true });
    t.format(ISODATE, 9, '1900-01-09', { leap1900: true });
    t.format(ISODATE, 8, '1900-01-08', { leap1900: true });
    t.format(ISODATE, 7, '1900-01-07', { leap1900: true });
    t.format(ISODATE, 6, '1900-01-06', { leap1900: true });
    t.format(ISODATE, 5, '1900-01-05', { leap1900: true });
    t.format(ISODATE, 4, '1900-01-04', { leap1900: true });
    t.format(ISODATE, 3, '1900-01-03', { leap1900: true });
    t.format(ISODATE, 2, '1900-01-02', { leap1900: true });
    t.format(ISODATE, 1, '1900-01-01', { leap1900: true });
    t.format(ISODATE, 0, '1900-01-00', { leap1900: true });
});

numfmtTest('Excel 1900 bug: OFF', (t) => {
    t.format(ISODATE, 61, '1900-03-01', { leap1900: false });
    t.format(ISODATE, 60, '1900-02-28', { leap1900: false });
    t.format(ISODATE, 59, '1900-02-27', { leap1900: false });
    t.format(ISODATE, 58, '1900-02-26', { leap1900: false });
    t.format(ISODATE, 57, '1900-02-25', { leap1900: false });
    t.format(ISODATE, 56, '1900-02-24', { leap1900: false });
    t.format(ISODATE, 55, '1900-02-23', { leap1900: false });
    t.format(ISODATE, 54, '1900-02-22', { leap1900: false });
    t.format(ISODATE, 53, '1900-02-21', { leap1900: false });
    t.format(ISODATE, 52, '1900-02-20', { leap1900: false });
    t.format(ISODATE, 51, '1900-02-19', { leap1900: false });
    t.format(ISODATE, 50, '1900-02-18', { leap1900: false });
    t.format(ISODATE, 49, '1900-02-17', { leap1900: false });
    t.format(ISODATE, 48, '1900-02-16', { leap1900: false });
    t.format(ISODATE, 47, '1900-02-15', { leap1900: false });
    t.format(ISODATE, 46, '1900-02-14', { leap1900: false });
    t.format(ISODATE, 45, '1900-02-13', { leap1900: false });
    t.format(ISODATE, 44, '1900-02-12', { leap1900: false });
    t.format(ISODATE, 43, '1900-02-11', { leap1900: false });
    t.format(ISODATE, 42, '1900-02-10', { leap1900: false });
    t.format(ISODATE, 41, '1900-02-09', { leap1900: false });
    t.format(ISODATE, 40, '1900-02-08', { leap1900: false });
    t.format(ISODATE, 39, '1900-02-07', { leap1900: false });
    t.format(ISODATE, 38, '1900-02-06', { leap1900: false });
    t.format(ISODATE, 37, '1900-02-05', { leap1900: false });
    t.format(ISODATE, 36, '1900-02-04', { leap1900: false });
    t.format(ISODATE, 35, '1900-02-03', { leap1900: false });
    t.format(ISODATE, 34, '1900-02-02', { leap1900: false });
    t.format(ISODATE, 33, '1900-02-01', { leap1900: false });
    t.format(ISODATE, 32, '1900-01-31', { leap1900: false });
    t.format(ISODATE, 31, '1900-01-30', { leap1900: false });
    t.format(ISODATE, 30, '1900-01-29', { leap1900: false });
    t.format(ISODATE, 29, '1900-01-28', { leap1900: false });
    t.format(ISODATE, 28, '1900-01-27', { leap1900: false });
    t.format(ISODATE, 27, '1900-01-26', { leap1900: false });
    t.format(ISODATE, 26, '1900-01-25', { leap1900: false });
    t.format(ISODATE, 25, '1900-01-24', { leap1900: false });
    t.format(ISODATE, 24, '1900-01-23', { leap1900: false });
    t.format(ISODATE, 23, '1900-01-22', { leap1900: false });
    t.format(ISODATE, 22, '1900-01-21', { leap1900: false });
    t.format(ISODATE, 21, '1900-01-20', { leap1900: false });
    t.format(ISODATE, 20, '1900-01-19', { leap1900: false });
    t.format(ISODATE, 19, '1900-01-18', { leap1900: false });
    t.format(ISODATE, 18, '1900-01-17', { leap1900: false });
    t.format(ISODATE, 17, '1900-01-16', { leap1900: false });
    t.format(ISODATE, 16, '1900-01-15', { leap1900: false });
    t.format(ISODATE, 15, '1900-01-14', { leap1900: false });
    t.format(ISODATE, 14, '1900-01-13', { leap1900: false });
    t.format(ISODATE, 13, '1900-01-12', { leap1900: false });
    t.format(ISODATE, 12, '1900-01-11', { leap1900: false });
    t.format(ISODATE, 11, '1900-01-10', { leap1900: false });
    t.format(ISODATE, 10, '1900-01-09', { leap1900: false });
    t.format(ISODATE, 9, '1900-01-08', { leap1900: false });
    t.format(ISODATE, 8, '1900-01-07', { leap1900: false });
    t.format(ISODATE, 7, '1900-01-06', { leap1900: false });
    t.format(ISODATE, 6, '1900-01-05', { leap1900: false });
    t.format(ISODATE, 5, '1900-01-04', { leap1900: false });
    t.format(ISODATE, 4, '1900-01-03', { leap1900: false });
    t.format(ISODATE, 3, '1900-01-02', { leap1900: false });
    t.format(ISODATE, 2, '1900-01-01', { leap1900: false });
    t.format(ISODATE, 1, '1899-12-31', { leap1900: false });
    t.format(ISODATE, 0, '1899-12-30', { leap1900: false });
});
