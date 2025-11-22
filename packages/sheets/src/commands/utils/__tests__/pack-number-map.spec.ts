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
import { packNumberMap, unpackNumberMap } from '../pack-number-map';

describe('packNumberMap', () => {
    it('should return empty object for empty input', () => {
        expect(packNumberMap({})).toEqual({});
    });

    it('should handle single value', () => {
        const input = { 1: 10 };
        const expected = { 10: 1 };
        expect(packNumberMap(input)).toEqual(expected);
    });

    it('should handle multiple values with same value (continuous indices)', () => {
        const input = { 1: 10, 2: 10, 3: 10 };
        const expected = { 10: [[1, 3]] }; // Optimized to interval wrapped in array
        expect(packNumberMap(input)).toEqual(expected);
    });

    it('should handle multiple values with same value (discontinuous indices)', () => {
        const input = { 1: 10, 3: 10, 5: 10 };
        const expected = { 10: [1, 3, 5] }; // List of points
        expect(packNumberMap(input)).toEqual(expected);
    });

    it('should handle multiple values with different values', () => {
        const input = { 1: 10, 2: 20 };
        const expected = { 10: 1, 20: 2 };
        expect(packNumberMap(input)).toEqual(expected);
    });

    it('should handle mixed scenarios (single points and intervals)', () => {
        // 1, 2, 3 -> 10 (interval [1, 3])
        // 5 -> 10 (point 5)
        // 7, 8 -> 10 (interval [7, 8])
        const input = { 1: 10, 2: 10, 3: 10, 5: 10, 7: 10, 8: 10 };
        const expected = { 10: [[1, 3], 5, [7, 8]] };
        expect(packNumberMap(input)).toEqual(expected);
    });

    it('should optimize single element array to number', () => {
        const input = { 1: 10 };
        // Should be 1 instead of [1]
        expect(packNumberMap(input)).toEqual({ 10: 1 });
    });
});

describe('unpackNumberMap', () => {
    it('should return empty object for empty input', () => {
        expect(unpackNumberMap({})).toEqual({});
    });

    it('should handle single number value (optimized format)', () => {
        const input = { 10: 1 };
        const expected = { 1: 10 };
        expect(unpackNumberMap(input)).toEqual(expected);
    });

    it('should handle array with single number', () => {
        // Although packNumberMap optimizes this, unpack should still handle it if it occurs
        const input = { 10: [1] };
        const expected = { 1: 10 };
        expect(unpackNumberMap(input as any)).toEqual(expected);
    });

    it('should handle array with interval', () => {
        const input = { 10: [[1, 3]] };
        const expected = { 1: 10, 2: 10, 3: 10 };
        expect(unpackNumberMap(input as any)).toEqual(expected);
    });

    it('should handle array with mixed numbers and intervals', () => {
        const input = { 10: [[1, 3], 5, [7, 8]] };
        const expected = {
            1: 10,
            2: 10,
            3: 10,
            5: 10,
            7: 10,
            8: 10,
        };
        expect(unpackNumberMap(input as any)).toEqual(expected);
    });

    it('should verify round-trip consistency', () => {
        const original = {
            1: 10,
            2: 10,
            3: 10,
            5: 20,
            7: 10,
            8: 10,
            10: 30,
        };
        const packed = packNumberMap(original);
        const unpacked = unpackNumberMap(packed);

        // Convert keys back to strings for comparison because unpackNumberMap returns string keys
        // Wait, unpackNumberMap returns Record<string, number>, but keys in JS objects are always strings.
        // packNumberMap takes Record<string, number>.
        // Let's check if the keys match.

        // original keys are '1', '2', ...
        // unpacked keys should be '1', '2', ...

        expect(unpacked).toEqual(original);
    });
});
