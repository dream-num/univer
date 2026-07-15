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
import { getTimeZoneName, numfmtTest } from './test-utils';

/* global process */

const excelOpts = { dateSpanLarge: false, dateErrorNumber: false };

numfmtTest('option: overflow', (t) => {
    t.format('yyyy', -1, '######', { ...excelOpts });
    t.format('yyyy', -1, '🦆', { ...excelOpts, overflow: '🦆' });
    t.format('yyyy', -1, '👻', { ...excelOpts, overflow: '👻' });
});

numfmtTest('option: locale', (t) => {
    t.format('mmmm', 2000, 'June');
    t.format('mmmm', 2000, '六月', { locale: 'zh_CN' });
    t.format('mmmm', 2000, 'kesäkuuta', { locale: 'fi' });
});

numfmtTest('option: throws', (t) => {
    t.throws(() => format('h #', 0), '{}');
    t.equal(format('h #', 0, { throws: false }), '######', '{ throws: false }');
    t.throws(() => format('h #', 0, { throws: true }), '{ throws: true }');
});

numfmtTest('option: invalid', (t) => {
    t.format('h #', 0, '######', { throws: false });
    t.format('h #', 0, '🦂', { invalid: '🦂', throws: false });
    t.format('h #', 0, '#VALUE!', { invalid: '#VALUE!', throws: false });
    t.format('h #', 0, 'true', { invalid: true as unknown as string, throws: false });
});

numfmtTest('option: leap1900', (t) => {
    t.format('yyyy-mm-dd', 60, '1900-02-29', {});
    t.format('yyyy-mm-dd', 60, '1900-02-29', { leap1900: true });
    t.format('yyyy-mm-dd', 60, '1900-02-28', { leap1900: false });
});

numfmtTest('option: dateErrorThrows', (t) => {
    t.format('yyyy', -694325, '-694325', {});
    t.format('yyyy', -1, '-1', { dateSpanLarge: false });
    t.formatThrows('yyyy', -1, '-1', { dateSpanLarge: false, dateErrorThrows: true });
    t.formatThrows('yyyy', -694325, '-694325', { dateErrorThrows: true });
});

numfmtTest('option: dateErrorNumber', (t) => {
    t.format('yyyy', -1, '-1', { dateSpanLarge: false });
    t.format('yyyy', -1, '-1', { dateSpanLarge: false, dateErrorNumber: true });
    t.format('yyyy', -1, '######', { dateSpanLarge: false, dateErrorNumber: false });
});

numfmtTest('option: nbsp', (t) => {
    const spaceFmt = '???0" ". 0??';
    t.format(spaceFmt, 1, '   1 . 0  ');
    t.format(spaceFmt, 1, '   1 . 0  ', { nbsp: true });
    t.format(spaceFmt, 1, '   1 . 0  ', { nbsp: false });
    t.format('0 "foo bar" .0', 1.1, '1 foo bar .1');
    t.format('0 "foo bar" .0', 1.1, '1 foo bar .1', { nbsp: false });
    t.format('0 "foo bar" .0', 1.1, '1 foo bar .1', { nbsp: true });
});

numfmtTest('option: grouping', (t) => {
    t.format('0', 1234567890, '1234567890', { grouping: [2, 2] });
    t.format('#,##0', 1234567890, '1,234,567,890', { grouping: [3, 3] });
    t.format('#,##0', 1234567890, '1,234,567,890', { grouping: [3] });
    t.format('#,##0', 1234567890, '1,23,45,67,890', { grouping: [3, 2] });
    t.format('#,##0', 1234567890, '12,34,56,78,90', { grouping: [2, 2] });
    t.format('#,##0', 1234567890, '12,34,56,78,90', { grouping: [2] });
    t.format('#,##0', 1234567890, '12,345,678,90', { grouping: [2, 3] });
});

numfmtTest('option: grouping', (t) => {
    t.format('_($* #,##0.00_)', 12345.67, ' $12,345.67 ');
    t.format('_($* #,##0.00_)', 12345.67, '\x03($12,345.67\x03)', { skipChar: '\x03' });
    t.format('_($* #,##0.00_)', 12345.67, 'ÆÐ($12,345.67ÆÐ)', { skipChar: 'ÆÐ' });
    t.format('_($* #,##0.00_)', 12345.67, ' $\x04 12,345.67 ', { fillChar: '\x04' });
    t.format('_($* #,##0.00_)', 12345.67, ' $ÞÖ 12,345.67 ', { fillChar: 'ÞÖ' });
    t.format('_($* #,##0.00_)', 12345.67, '\x03($\x04 12,345.67\x03)', { skipChar: '\x03', fillChar: '\x04' });
});

// this test is flaky at best in node versions < 14 so only run it in 14+
if (Number.parseInt(process.version.replace(/^v/, ''), 10) >= 14) {
    numfmtTest('option: ignoreTimezone', (t) => {
        process.env.TZ = 'Asia/Calcutta';
        t.equal(getTimeZoneName(), 'India Standard Time', 'Timezone is IST');
        const baseDate = new Date(2000, 0, 1);
        t.equal(baseDate.toUTCString(), 'Fri, 31 Dec 1999 18:30:00 GMT', 'Date has a timezone');
        const gmtStr = 'ddd, dd mmm yyyy hh:mm:ss "GMT"';
        t.format(gmtStr, baseDate, 'Sat, 01 Jan 2000 00:00:00 GMT', { nbsp: 0 as unknown as boolean });
        t.format(gmtStr, baseDate, 'Fri, 31 Dec 1999 18:30:00 GMT', { nbsp: 0 as unknown as boolean, ignoreTimezone: true });
        t.format(gmtStr, baseDate, 'Sat, 01 Jan 2000 00:00:00 GMT', { nbsp: 0 as unknown as boolean, ignoreTimezone: false });
    });
}
