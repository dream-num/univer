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

import { getFormatInfo } from '../api';
import { numfmtTest } from './test-utils';

numfmtTest('numfmt.info', (t) => {
    const i1 = { ...getFormatInfo('0') };
    t.equal(typeof i1, 'object', 'getFormatInfo emits object');
    t.deepEqual(i1, {
        type: 'number',
        isDate: false,
        isText: false,
        isPercent: false,
        maxDecimals: 0,
        color: 0,
        scale: 1,
        parentheses: 0,
        grouped: 0,
        code: 'F0',
        level: 4,
    }, 'numfmt.info object is what we expect');

    const i2 = { ...getFormatInfo('0') };
    t.equal(typeof i2, 'object', 'formatters have info objects');
    t.deepEqual(i2, {
        type: 'number',
        isDate: false,
        isText: false,
        isPercent: false,
        maxDecimals: 0,
        scale: 1,
        color: 0,
        parentheses: 0,
        grouped: 0,
        code: 'F0',
        level: 4,
    }, 'formatters info is what we expect');

    const borked = { ...getFormatInfo('y 0') };
    t.deepEqual(borked, {
        type: 'error',
        isDate: false,
        isText: false,
        isPercent: false,
        maxDecimals: 0,
        scale: 1,
        color: 0,
        parentheses: 0,
        grouped: 0,
        code: 'G',
        level: 0,
    }, 'info makes sense even when pattern is bogus');
});

numfmtTest('General', (t) => {
    t.assertInfo('General', {
        type: 'general',
        maxDecimals: 9,
        code: 'G',
    });
    t.assertInfo('General;-General', {
        type: 'general',
        maxDecimals: 9,
        code: 'G',
    });
    t.assertInfo('(General);[blue](-General);0;@', {
        type: 'general',
        maxDecimals: 9,
        code: 'G-()',
        color: 1,
        parentheses: 1,
    });
});

numfmtTest('Numbers', (t) => {
    t.assertInfo('0', {
        type: 'number',
        maxDecimals: 0,
        code: 'F0',
        level: 4,
    });
    t.assertInfo('0.0', {
        type: 'number',
        maxDecimals: 1,
        code: 'F1',
        level: 4,
    });
    t.assertInfo('0.000', {
        type: 'number',
        maxDecimals: 3,
        code: 'F3',
        level: 4,
    });
    t.assertInfo('0.000000000000000', {
        type: 'number',
        maxDecimals: 15,
        code: 'F15',
        level: 4,
    });
    t.assertInfo('0.0000000000000000', {
        type: 'number',
        maxDecimals: 16,
        code: 'F15',
        level: 4,
    });

    t.assertInfo('#,##0', {
        type: 'grouped',
        maxDecimals: 0,
        code: ',0',
        grouped: 1,
        level: 10.2,
    });
    t.assertInfo('#,##0.00', {
        type: 'grouped',
        maxDecimals: 2,
        code: ',2',
        grouped: 1,
        level: 10.2,
    });
    t.assertInfo('(#,##0.00)', {
        type: 'grouped',
        maxDecimals: 2,
        code: ',2()',
        parentheses: 1,
        grouped: 1,
        level: 10.2,
    });

    t.assertInfo('0.00,"K"', {
        type: 'number',
        maxDecimals: 2,
        code: 'F2',
        scale: 0.001,
        level: 4,
    });
    t.assertInfo('0.00,,"K"', {
        type: 'number',
        maxDecimals: 2,
        code: 'F2',
        scale: 0.000001,
        level: 4,
    });
});

numfmtTest('Parentheses', (t) => {
    t.assertInfo('(0)', {
        type: 'number',
        parentheses: 1,
        code: 'F0()',
        level: 4,
    });
    t.assertInfo('0;(0)', {
        type: 'number',
        code: 'F0',
        level: 4,
    });
    t.assertInfo('0;0;(0)', {
        type: 'number',
        code: 'F0',
        level: 4,
    });
    t.assertInfo('(General)', {
        type: 'general',
        parentheses: 1,
        code: 'G()',
        maxDecimals: 9,
    });
    t.assertInfo('(0', {
        type: 'number',
        parentheses: 1,
        code: 'F0()',
        level: 4,
    });
    t.assertInfo('0)', {
        type: 'number',
        code: 'F0',
        level: 4,
    });
});

numfmtTest('Fractions', (t) => {
    t.assertInfo('# ?/?', {
        type: 'fraction',
        maxDecimals: 0,
        code: 'G',
        level: 2,
    });
    t.assertInfo('0 ??/??', {
        type: 'fraction',
        maxDecimals: 0,
        code: 'G',
        level: 2,
    });
});

numfmtTest('Text', (t) => {
    t.assertInfo('@', {
        type: 'text',
        isText: true,
        code: 'G',
        level: 15,
    });
    t.assertInfo('(@)', {
        type: 'text',
        isText: true,
        code: 'G',
        level: 15,
    });
});

numfmtTest('Text', (t) => {
    t.assertInfo('@', {
        type: 'text',
        isText: true,
        code: 'G',
        level: 15,
    });
    t.assertInfo('(@)', {
        type: 'text',
        isText: true,
        code: 'G',
        level: 15,
    });
});

numfmtTest('Currency', (t) => {
    t.assertInfo('$#,##0;($#,##0)', {
        type: 'currency',
        code: 'C0',
        grouped: 1,
        level: 10.4,
    });
    t.assertInfo('#,##0.00 €', {
        type: 'currency',
        code: 'C2',
        maxDecimals: 2,
        grouped: 1,
        level: 10.4,
    });
    t.assertInfo('₿ 0.0000', {
        type: 'currency',
        code: 'C4',
        maxDecimals: 4,
        level: 10.4,
    });

    // can pass in own currency
    const testCurrency = (str: string, identifier: string, code: string) => {
        const info = getFormatInfo(str, { currency: identifier });
        t.equal(info.code, code, str);
    };
    // Excel doesn't really have a great solution to this:
    // It just contorts the string to ensure that the current
    // currency identifier is a separate token when parsed.
    testCurrency('#,##0.00 "ISK"', 'ISK', 'C2');
    testCurrency('#,##0\\ "fiskur"', 'ISK', ',0');
    testCurrency('#,##0\\ "fISKur"', 'ISK', ',0');
    testCurrency('#,##0\\ "f ISK ur"', 'ISK', ',0');
    testCurrency('#,##0\\ \\f"ISK"\\u\\r', 'ISK', 'C0');
    testCurrency('#,##0\\ "ISK"', 'ISK', 'C0');
    testCurrency('#,##0\\a"ISK"\\a', 'ISK', 'C0');
    testCurrency('#,##0"aISKa"', 'ISK', ',0');
});

numfmtTest('Percentages', (t) => {
    t.assertInfo('0%', {
        type: 'percent',
        isPercent: true,
        scale: 100,
        code: 'P0',
        level: 10.6,
    });
    t.assertInfo('0.00%;[red]0.00%', {
        type: 'percent',
        isPercent: true,
        scale: 100,
        code: 'P2-',
        color: 1,
        maxDecimals: 2,
        level: 10.6,
    });
});

numfmtTest('Scientific', (t) => {
    t.assertInfo('0E+0', {
        type: 'scientific',
        code: 'S0',
        level: 6,
    });
    t.assertInfo('0.00E+00', {
        type: 'scientific',
        code: 'S2',
        maxDecimals: 2,
        level: 6,
    });
    t.assertInfo('0.0E+0;[red]0.0E+0', {
        type: 'scientific',
        code: 'S1-',
        color: 1,
        maxDecimals: 1,
        level: 6,
    });
});

numfmtTest('Dates', (t) => {
    const dt = { type: 'date', isDate: true, level: 10.8 } as const;
    const tm = { type: 'time', isDate: true, level: 10.8 } as const;
    // D1
    t.assertInfo('dd-mmm-yyyy h:mm:ss A/P', { ...dt, code: 'D1', type: 'datetime' });
    t.assertInfo('dd-mmm-yyyy h:mm:ss', { ...dt, code: 'D1', type: 'datetime' });
    t.assertInfo('dd-mmm-yyyy', { ...dt, code: 'D1' });
    t.assertInfo('d-mmm-yyyy', { ...dt, code: 'D1' });
    t.assertInfo('d-mm-yyyy', { ...dt, code: 'D1' });
    t.assertInfo('d-m-yyyy', { ...dt, code: 'D1' });
    t.assertInfo('d-m-yy', { ...dt, code: 'D1' });
    t.assertInfo('d-m-b', { ...dt, code: 'D1' });
    // D2
    t.assertInfo('dd-mmmm h:mm A/P', { ...dt, code: 'D2', type: 'datetime' });
    t.assertInfo('dd-mmm h:mm:ss', { ...dt, code: 'D2', type: 'datetime' });
    t.assertInfo('dd-mmm', { ...dt, code: 'D2' });
    t.assertInfo('d-mmm', { ...dt, code: 'D2' });
    t.assertInfo('d-mm', { ...dt, code: 'D2' });
    t.assertInfo('d-m', { ...dt, code: 'D2' });
    t.assertInfo('d-m-m', { ...dt, code: 'D2' });
    t.assertInfo('d-m-d', { ...dt, code: 'D2' });
    // D3
    t.assertInfo('mmmm-yyyy h:mm A/P', { ...dt, code: 'D3', type: 'datetime' });
    t.assertInfo('mmmm-yyyy', { ...dt, code: 'D3' });
    t.assertInfo('m-y', { ...dt, code: 'D3' });
    t.assertInfo('m-y-m', { ...dt, code: 'D3' });
    t.assertInfo('m-y-d', { ...dt, code: 'D3' });
    t.assertInfo('m-b', { ...dt, code: 'D3' });
    // D4 (same as D1 but month first)
    t.assertInfo('mmm-dd-yyyy h:mm:ss A/P', { ...dt, code: 'D4', type: 'datetime' });
    t.assertInfo('mmm-dd-yyyy h:mm:ss', { ...dt, code: 'D4', type: 'datetime' });
    t.assertInfo('mmm-dd-yyyy', { ...dt, code: 'D4' });
    t.assertInfo('mmm-d-yyyy', { ...dt, code: 'D4' });
    t.assertInfo('mm-d-yyyy', { ...dt, code: 'D4' });
    t.assertInfo('m-d-yyyy', { ...dt, code: 'D4' });
    t.assertInfo('m-d-yy', { ...dt, code: 'D4' });
    t.assertInfo('m-d-y-m', { ...dt, code: 'D4' });
    t.assertInfo('m-d-b', { ...dt, code: 'D4' });
    // D5 (same as D2 but month first)
    t.assertInfo('mmmm-dd h:mm A/P', { ...dt, code: 'D5', type: 'datetime' });
    t.assertInfo('mmm-dd h:mm:ss', { ...dt, code: 'D5', type: 'datetime' });
    t.assertInfo('mmm-dd', { ...dt, code: 'D5' });
    t.assertInfo('mmm-d', { ...dt, code: 'D5' });
    t.assertInfo('mm-d', { ...dt, code: 'D5' });
    t.assertInfo('m-d', { ...dt, code: 'D5' });
    t.assertInfo('m-d-d', { ...dt, code: 'D5' });
    t.assertInfo('m-d-m', { ...dt, code: 'D5' });
    t.assertInfo('m-d-d-y', { ...dt, code: 'D5' });
    // D6
    t.assertInfo('h:mm:ss AM/PM', { ...tm, code: 'D6' });
    t.assertInfo('h:mm:ss "foo" AM/PM', { ...tm, code: 'D6' });
    t.assertInfo('h:m:s A/P', { ...tm, code: 'D6' });
    // D7
    t.assertInfo('h:mm AM/PM', { ...tm, code: 'D7' });
    t.assertInfo('h:mm "foo" AM/PM', { ...tm, code: 'D7' });
    t.assertInfo('h:m A/P', { ...tm, code: 'D7' });
    // D8
    t.assertInfo('h:mm:ss', { ...tm, code: 'D8' });
    t.assertInfo('"foo" h:mm:ss "bar"', { ...tm, code: 'D8' });
    t.assertInfo('h:m:s', { ...tm, code: 'D8' });
    // D9
    t.assertInfo('h:mm', { ...tm, code: 'D9' });
    t.assertInfo('"foo" h:mm "bar"', { ...tm, code: 'D9' });
    t.assertInfo('h:m', { ...tm, code: 'D9' });
    // Non coded dates
    t.assertInfo('yyyy', { ...dt, code: 'G' });
    t.assertInfo('yyyy-mm-dd', { ...dt, code: 'G' });
    t.assertInfo('yyyy-mm-dd"T"hh:mm:ss', { ...dt, code: 'G', type: 'datetime' });
    t.assertInfo('dddd h:mm:ss', { ...dt, code: 'G', type: 'datetime' });
});

numfmtTest('dateInfo', (t) => {
    // numfmt.getDateInfo returns "all off" for non dates
    t.assertDateInfo('0', {});

    // dateInfo makes sense even when pattern is bogus
    t.assertDateInfo('y 0', {});

    t.assertDateInfo('yyyy', { year: true });
    t.assertDateInfo('yyy', { year: true });
    t.assertDateInfo('yy', { year: true });
    t.assertDateInfo('y', { year: true });
    t.assertDateInfo('mmmm', { month: true });
    t.assertDateInfo('mmm', { month: true });
    t.assertDateInfo('mm', { month: true });
    t.assertDateInfo('m', { month: true });
    t.assertDateInfo('dddd', { day: true });
    t.assertDateInfo('ddd', { day: true });
    t.assertDateInfo('dd', { day: true });
    t.assertDateInfo('d', { day: true });
    t.assertDateInfo('hh', { hours: true });
    t.assertDateInfo('h', { hours: true });
    t.assertDateInfo('h:mm', { hours: true, minutes: true });
    t.assertDateInfo('h:m', { hours: true, minutes: true });
    t.assertDateInfo('ss', { seconds: true });
    t.assertDateInfo('s', { seconds: true });
    t.assertDateInfo('hh am/pm', { hours: true, clockType: 12 });
    t.assertDateInfo('hh A/P', { hours: true, clockType: 12 });

    t.assertDateInfo('yyyy-mm', { year: true, month: true });
    t.assertDateInfo('yyyy-mm-dd', { year: true, month: true, day: true });
    t.assertDateInfo('yyyy-mm-ddThh', { year: true, month: true, day: true, hours: true });
    t.assertDateInfo('yyyy-mm-ddThh:mm', { year: true, month: true, day: true, hours: true, minutes: true });
    t.assertDateInfo('yyyy-mm-ddThh:mm:ss', { year: true, month: true, day: true, hours: true, minutes: true, seconds: true });
    t.assertDateInfo('yyyy-mm-ddThh:mm:ss AM/PM', { year: true, month: true, day: true, hours: true, minutes: true, seconds: true, clockType: 12 });

    t.assertDateInfo('yy dd mm:ss', { year: true, day: true, month: true, seconds: true });

    t.assertDateInfo('dd', { year: false, month: false, day: true });

    t.assertDateInfo('yyyy-mm-dd', { year: true, month: true, day: true });
    t.assertDateInfo('dd-mm-yyyy', { year: true, month: true, day: true });
    t.assertDateInfo('dd yyyy', { year: true, day: true });
});
