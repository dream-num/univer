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
import * as numfmt from '../api';

describe('local numfmt API', () => {
    it.each(['\n', '\r', '\u2028', '\u2029'])('preserves escaped line separators in Excel formats (%j)', (separator) => {
        const pattern = `[$-409]m/d\\${separator}h:mm;@`;
        expect(numfmt.isValidFormat(pattern)).toBe(true);
        expect(numfmt.format(pattern, 44137.5)).toBe(`11/2${separator}12:00`);
        expect(numfmt.format(`0\\${separator}0`, 12)).toBe(`1${separator}2`);
        expect(numfmt.format('0\\n', 12)).toBe('12n');
    });

    it('exposes only the planned runtime surface', () => {
        expect(Object.keys(numfmt).sort()).toEqual([
            'addLocale',
            'dateFromSerial',
            'dateToSerial',
            'dec2frac',
            'format',
            'formatColor',
            'getDateTimeEditPattern',
            'getFormatDateInfo',
            'getFormatInfo',
            'getLocale',
            'isDateFormat',
            'isPercentFormat',
            'isTextFormat',
            'isValidFormat',
            'parseBool',
            'parseDate',
            'parseLocale',
            'parseNumber',
            'parseTime',
            'parseValue',
            'round',
            'tokenTypes',
            'tokenize',
        ]);
    });

    it.each([
        ['#,##0.00', 1234.567, '1,234.57'],
        ['0.0%', 0.0294, '2.9%'],
        ['0.00E+00', 12.34, '1.23E+01'],
        ['yyyy-mm-dd', 3290, '1909-01-02'],
        ['# ?/?', 1.25, '1 1/4'],
        ['@', 'hello', 'hello'],
    ])('formats %s', (pattern, value, expected) => {
        expect(numfmt.format(pattern, value)).toBe(expected);
    });

    it('exposes color and metadata helpers', () => {
        expect(numfmt.formatColor('[Green]0;[Red]-0', -1)).toBe('red');
        expect(numfmt.isDateFormat('yyyy-mm-dd')).toBe(true);
        expect(numfmt.isPercentFormat('0%')).toBe(true);
        expect(numfmt.isTextFormat('@')).toBe(true);
        expect(numfmt.isValidFormat('0.00')).toBe(true);
    });
});
