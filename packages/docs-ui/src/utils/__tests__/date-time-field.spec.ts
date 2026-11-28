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
import { createDateTimeField, resolveDateTimeField } from '../date-time-field';

describe('date and time fields', () => {
    it.each(['short', 'long', 'time'] as const)('inserts and refreshes %s fields for a private-use language', (format) => {
        const inserted = new Date(2026, 0, 15, 8, 10, 5);
        const refreshed = new Date(2026, 6, 9, 14, 32, 1);
        const field = createDateTimeField(format, 'x-univer', inserted);
        expect(field).toEqual(createDateTimeField(format, 'en-US', inserted));
        expect(resolveDateTimeField(field.instruction, 'x-univer', refreshed))
            .toBe(createDateTimeField(format, 'en-US', refreshed).cachedResult);
        expect(resolveDateTimeField(field.instruction, 'en_US', refreshed)).toBeUndefined();
    });
});
