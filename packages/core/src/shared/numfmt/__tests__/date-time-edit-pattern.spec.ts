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

// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { getDateTimeEditPattern } from '../api';

const DATE_SERIAL = 45839;

describe('date-time edit pattern', () => {
    it('completes normal numeric date formats while preserving their style', () => {
        expect(getDateTimeEditPattern('mm-dd', DATE_SERIAL)).toBe('yyyy-mm-dd');
        expect(getDateTimeEditPattern('m-d', DATE_SERIAL)).toBe('yyyy-m-d');
        expect(getDateTimeEditPattern('dd/mm', DATE_SERIAL)).toBe('dd/mm/yyyy');
        expect(getDateTimeEditPattern('d/m', DATE_SERIAL)).toBe('d/m/yyyy');
        expect(getDateTimeEditPattern('yyyy-mm', DATE_SERIAL)).toBe('yyyy-mm-dd');
        expect(getDateTimeEditPattern('yyyy/m', DATE_SERIAL)).toBe('yyyy/m/d');
        expect(getDateTimeEditPattern('yyyy-m-d', DATE_SERIAL)).toBe('yyyy-m-d');
        expect(getDateTimeEditPattern('dd/mm/yyyy', DATE_SERIAL)).toBe('dd/mm/yyyy');
    });

    it('completes date and time components together', () => {
        expect(getDateTimeEditPattern('mm-dd h:mm', DATE_SERIAL)).toBe('yyyy-mm-dd h:mm:ss');
        expect(getDateTimeEditPattern('dd/mm hh:mm', DATE_SERIAL)).toBe('dd/mm/yyyy hh:mm:ss');
        expect(getDateTimeEditPattern('yyyy-m-d h:mm', DATE_SERIAL)).toBe('yyyy-m-d h:mm:ss');
        expect(getDateTimeEditPattern('h:mm', DATE_SERIAL)).toBe('h:mm:ss');
        expect(getDateTimeEditPattern('hh:mm AM/PM', DATE_SERIAL)).toBe('hh:mm:ss AM/PM');
        expect(getDateTimeEditPattern('AM/PM h:mm', DATE_SERIAL)).toBe('AM/PM h:mm:ss');
    });

    it('falls back for complex dates and preserves a normal clock time', () => {
        expect(getDateTimeEditPattern('mmm d', DATE_SERIAL)).toBe('yyyy/mm/dd');
        expect(getDateTimeEditPattern('m"月"d"日"', DATE_SERIAL)).toBe('yyyy/mm/dd');
        expect(getDateTimeEditPattern('dddd, mmmm d', DATE_SERIAL)).toBe('yyyy/mm/dd');
        expect(getDateTimeEditPattern('m"月"d"日" h:mm', DATE_SERIAL)).toBe('yyyy/mm/dd h:mm:ss');
        expect(getDateTimeEditPattern('mm/dd-yyyy', DATE_SERIAL)).toBe('yyyy/mm/dd');
    });

    it('uses the effective number-format section', () => {
        expect(getDateTimeEditPattern('[<50000]mm-dd;dd/mm', DATE_SERIAL)).toBe('yyyy-mm-dd');
        expect(getDateTimeEditPattern('[<40000]mm-dd;dd/mm', DATE_SERIAL)).toBe('dd/mm/yyyy');
    });

    it('hides subsecond precision and leaves durations to the duration editor', () => {
        expect(getDateTimeEditPattern('h:mm', 0.5242683912037037)).toBe('h:mm:ss');
        expect(getDateTimeEditPattern('[h]:mm', 1.25)).toBeNull();
    });
});
