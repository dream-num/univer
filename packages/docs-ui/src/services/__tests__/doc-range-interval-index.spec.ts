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
import { buildDocIntervalIndex, visitDocIntervals } from '../doc-range-interval-index';

describe('Doc range interval index', () => {
    it('keeps late point queries local when an outer range spans thousands of smaller ranges', () => {
        const count = 4_800;
        let endReads = 0;
        const intervals = Array.from({ length: count }, (_, value) => ({
            start: 2 * value,
            get end() {
                endReads++;
                return 2 * value + 1;
            },
            value,
        }));
        const outer = { start: 0, end: count * 2, value: -1 };
        const index = buildDocIntervalIndex([...intervals, outer]);
        endReads = 0;

        const matched: number[] = [];
        const lastChildEnd = count * 2 - 1;
        visitDocIntervals(index, lastChildEnd, lastChildEnd, (value) => matched.push(value));

        expect(matched.sort((left, right) => left - right)).toEqual([outer.value, count - 1]);
        expect(endReads).toBeLessThan(100);
    });
});
