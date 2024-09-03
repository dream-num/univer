/**
 * Copyright 2023-present DreamNum Inc.
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
import { excludePonintsFromRange } from '../custom-range'; // 替换为你的文件路径

describe('excludePonintsFromRange function', () => {
    it('should handle empty points array', () => {
        const range: [number, number] = [0, 10];
        const points: number[] = [];
        expect(excludePonintsFromRange(range, points)).toEqual([[0, 10]]);
    });

    it('should handle points at the beginning and end', () => {
        const range: [number, number] = [0, 10];
        const points = [0, 10];
        expect(excludePonintsFromRange(range, points)).toEqual([1, 9]);
    });

    it('should handle overlapping points', () => {
        const range: [number, number] = [0, 10];
        const points = [2, 3, 3, 5];
        expect(excludePonintsFromRange(range, points)).toEqual([[0, 1], [4, 4], [6, 10]]);
    });

    it('should handle points outside the range', () => {
        const range: [number, number] = [0, 10];
        const points = [-1, 12];
        expect(excludePonintsFromRange(range, points)).toEqual([[0, 10]]);
    });

    it('should handle a single point in the middle', () => {
        const range: [number, number] = [0, 10];
        const points = [5];
        expect(excludePonintsFromRange(range, points)).toEqual([[0, 4], [6, 10]]);
    });

    it('should handle multiple ranges', () => {
        const range: [number, number] = [0, 20];
        const points = [2, 5, 10, 15];
        expect(excludePonintsFromRange(range, points)).toEqual([[0, 1], [3, 4], [6, 9], [11, 14], [16, 20]]);
    });

    it('should handle points in ascending order', () => {
        const range: [number, number] = [0, 10];
        const points = [2, 4, 6, 8];
        expect(excludePonintsFromRange(range, points)).toEqual([[0, 1], [3, 3], [5, 5], [7, 7], [9, 10]]);
    });
});
