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

import { DateSystem, excelDateTimePartsToSerial } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { parseTemporalEditorValue, serializeTemporalEditorValue } from '../temporal-editor-value';

const dateSystem = DateSystem.Date1900;

function serial(year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0, fractionalSecond = 0) {
    return excelDateTimePartsToSerial({ year, month, day, hours, minutes, seconds, fractionalSecond }, { dateSystem })!;
}

describe('temporal editor values', () => {
    it('serializes the complete value for the active temporal category', () => {
        expect(serializeTemporalEditorValue({ serial: serial(2025, 7, 1), pattern: 'mm-dd', locale: 'en', dateSystem })).toBe('2025-07-01');
        expect(serializeTemporalEditorValue({ serial: serial(2025, 7, 1), pattern: 'dd/mm', locale: 'en', dateSystem })).toBe('01/07/2025');
        expect(serializeTemporalEditorValue({ serial: serial(2025, 7, 1), pattern: 'yyyy-m-d', locale: 'zh-CN', dateSystem })).toBe('2025-7-1');
        expect(serializeTemporalEditorValue({ serial: serial(2025, 7, 1), pattern: 'mm/dd', locale: 'en', dateSystem })).toBe('2025/07/01');
        expect(serializeTemporalEditorValue({ serial: serial(2025, 7, 15, 12, 34, 56), pattern: 'yyyy-mm', locale: 'en', dateSystem })).toBe('2025-07-15');
        expect(serializeTemporalEditorValue({ serial: serial(2025, 7, 15, 12, 34, 56), pattern: 'mm-dd h:mm', locale: 'en', dateSystem })).toBe('2025-07-15 12:34:56');
        expect(serializeTemporalEditorValue({ serial: serial(2025, 7, 15, 12, 34, 56), pattern: 'mm/dd h:mm', locale: 'en', dateSystem })).toBe('2025/07/15 12:34:56');
        expect(serializeTemporalEditorValue({ serial: serial(2025, 7, 15, 12, 34, 56), pattern: 'h:mm', locale: 'en', dateSystem })).toBe('12:34:56');
        expect(serializeTemporalEditorValue({ serial: 0.5242683912037037, pattern: 'h:mm', locale: 'en', dateSystem })).toBe('12:34:57');
        expect(serializeTemporalEditorValue({ serial: 1.25, pattern: '[h]:mm', locale: 'en', dateSystem })).toBe('30:00:00');
        expect(serializeTemporalEditorValue({ serial: 0.5, pattern: 'h:mm AM/PM', locale: 'en', dateSystem })).toBe('12:00:00 PM');
    });

    it('preserves Excel date-system edge values', () => {
        expect(serializeTemporalEditorValue({ serial: 0, pattern: 'mm/dd', locale: 'en', dateSystem })).toBe('1900/01/00');
        expect(parseTemporalEditorValue({ content: '1900/01/00', originalSerial: 0, pattern: 'mm/dd', locale: 'en', dateSystem })).toBe(0);
        expect(serializeTemporalEditorValue({ serial: 60, pattern: 'mm/dd', locale: 'en', dateSystem })).toBe('1900/02/29');
        expect(serializeTemporalEditorValue({ serial: 0, pattern: 'mm/dd', locale: 'en', dateSystem: DateSystem.Date1904 })).toBe('1904/01/01');
    });

    it('edits negative elapsed durations without treating them as calendar dates', () => {
        expect(serializeTemporalEditorValue({ serial: -1.5, pattern: '[h]:mm', locale: 'en', dateSystem })).toBe('-36:00:00');
        expect(parseTemporalEditorValue({ content: '-36:00:00', originalSerial: -1.5, pattern: '[h]:mm', locale: 'en', dateSystem })).toBe(-1.5);
    });

    it('merges real edits with hidden original components', () => {
        const original = serial(2025, 7, 15, 12, 34, 56, 0.789);

        expect(parseTemporalEditorValue({ content: '08/20/2026', originalSerial: original, pattern: 'mm/dd', locale: 'en', dateSystem }))
            .toBeCloseTo(serial(2026, 8, 20, 12, 34, 56, 0.789), 10);
        expect(parseTemporalEditorValue({ content: '01:02:03.456', originalSerial: original, pattern: 'h:mm', locale: 'en', dateSystem }))
            .toBeCloseTo(serial(2025, 7, 15, 1, 2, 3, 0.456), 10);
        expect(parseTemporalEditorValue({ content: '24:00:00', originalSerial: original, pattern: 'h:mm', locale: 'en', dateSystem }))
            .toBe(serial(2025, 7, 16));
        expect(parseTemporalEditorValue({ content: '31:15:30.5', originalSerial: 1.25, pattern: '[h]:mm', locale: 'en', dateSystem }))
            .toBeCloseTo((31 * 3600 + 15 * 60 + 30.5) / 86400, 12);
    });
});
