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
import { dateKit } from '../date-kit';

describe('date-kit', () => {
    it('should format common date tokens', () => {
        expect(dateKit('2024-01-02 03:04:05').format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-02 03:04:05');
        expect(dateKit('2024-01-02 03:04:05').format('YYYY/MM/DD HH:mm')).toBe('2024/01/02 03:04');
    });

    it('should parse cjk date strings', () => {
        expect(dateKit('2020年11月11日').format('YYYY-MM-DD')).toBe('2020-11-11');
    });

    it('should keep month addition clamped to month end', () => {
        expect(dateKit('2024-01-31 12:00:00').add(1, 'month').format('YYYY-MM-DD')).toBe('2024-02-29');
        expect(dateKit('2024-03-31 12:00:00').subtract(1, 'month').format('YYYY-MM-DD')).toBe('2024-02-29');
    });

    it('should compute week boundaries with sunday as start', () => {
        const value = dateKit('2024-01-03 10:20:30');
        expect(value.startOf('week').format('YYYY-MM-DD')).toBe('2023-12-31');
        expect(value.endOf('week').format('YYYY-MM-DD')).toBe('2024-01-06');
    });

    it('should support weekday and week helpers', () => {
        expect(dateKit('2024-01-07').weekday()).toBe(0);
        expect(dateKit('2024-01-07').weekday(1).format('YYYY-MM-DD')).toBe('2024-01-08');
        expect(dateKit('2024-01-01').week()).toBeGreaterThanOrEqual(1);
    });

    it('should support localized and advanced format tokens', () => {
        const value = dateKit('2024-02-01 15:04:05');
        expect(value.format('L')).toBe('02/01/2024');
        expect(value.format('Do')).toBe('1st');
        expect(value.format('Qo')).toBe('1st');
    });

    it('should expose static helpers', () => {
        expect(dateKit.utc('2024-01-01 00:00:00').format('Z')).toBe('+00:00');
        expect(dateKit.unix(1704067200).valueOf()).toBe(1704067200000);
        expect(dateKit.isDateKit(dateKit())).toBe(true);
    });

    it('should format dates with Intl locale options', () => {
        const value = dateKit('2024-01-02 03:04:05');

        expect(value.formatIntl('ar-SA-u-nu-arab', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })).toMatch(/[٠-٩]/);
        expect(value.formatIntl('fa-IR-u-nu-arabext', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })).toMatch(/[۰-۹]/);
    });
});
