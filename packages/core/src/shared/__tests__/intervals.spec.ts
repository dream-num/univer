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
import { generateIntervalsByPoints, mergeIntervals } from '../intervals';

describe('interval helpers', () => {
    it('should generate merged intervals from points and ranges', () => {
        expect(generateIntervalsByPoints([])).toEqual([]);
        expect(generateIntervalsByPoints([0, [1, 3], 4, 5, [8, 10], 12, 11])).toEqual([
            [0, 5],
            [8, 12],
        ]);
    });

    it('should merge overlapping and contiguous intervals', () => {
        expect(mergeIntervals([])).toEqual([]);
        expect(mergeIntervals([[5, 6], [1, 2], [2, 4], [9, 10], [8, 8]])).toEqual([
            [1, 6],
            [8, 10],
        ]);
    });
});
