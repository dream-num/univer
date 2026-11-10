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
import { lastWeek, nextWeek } from '../date-filter-util';

describe('relative week date filters', () => {
    it.each([
        { matches: nextWeek, anchor: new Date(2026, 9, 26), start: new Date(2026, 10, 2) },
        { matches: lastWeek, anchor: new Date(2026, 2, 9), start: new Date(2026, 2, 2) },
        { matches: nextWeek, anchor: new Date(2026, 2, 2, 23, 30), start: new Date(2026, 2, 9) },
        { matches: lastWeek, anchor: new Date(2026, 10, 2, 23, 30), start: new Date(2026, 9, 26) },
    ])('matches all seven calendar dates for $anchor', ({ matches, anchor, start }) => {
        for (let offset = -1; offset <= 7; offset++) {
            const candidate = new Date(start);
            candidate.setDate(candidate.getDate() + offset);
            expect(matches(candidate, anchor)).toBe(offset >= 0 && offset < 7);
        }
    });
});
