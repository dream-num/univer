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

import { numfmtTest } from './test-utils';

const ISODATE = 'yyyy-mm-dd';

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
