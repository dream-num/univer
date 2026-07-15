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
import {
    isValidDate,
    parseBool,
    parseDate,
    parseNumber,
    parseTime,
    parseValue,
} from '../parse-value';
import { dateFromSerial, dateToSerial } from '../serial-date';

describe('numfmt dates and value parsing', () => {
    it('converts the spreadsheet serial epoch', () => {
        expect(dateFromSerial(28627)).toEqual([1978, 5, 17, 0, 0, 0]);
        expect(dateToSerial([1978, 5, 17])).toBe(28627);
    });

    it('keeps the Excel 1900 leap-day contract', () => {
        expect(dateFromSerial(60)).toEqual([1900, 2, 29, 0, 0, 0]);
        expect(dateFromSerial(60, { leap1900: false })).toEqual([1900, 2, 28, 0, 0, 0]);
    });

    it('parses representative values', () => {
        expect(parseNumber('1,234.50')).toEqual({ v: 1234.5, z: '#,##0.00' });
        expect(parseDate('3/13/1989')).toEqual({ v: 32580, z: 'm/d/yyyy' });
        expect(parseTime('5:30 PM')).toEqual({ v: 0.7291666666666666, z: 'h:mm AM/PM' });
        expect(parseBool('TRUE')).toEqual({ v: true });
        expect(parseValue('$1,000')).toEqual({ v: 1000, z: '$#,##0' });
        expect(isValidDate(2024, 2, 29)).toBe(true);
        expect(isValidDate(2023, 2, 29)).toBe(false);
    });
});
