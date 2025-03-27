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
import { binSearchFirstGreaterThanTarget, searchArray, searchInOrderedArray } from '../array-search';

describe('test searchArray function', () => {
    const array = [0, 1, 2, 3, 4, 4, 4, 5, 5, 5];

    it('searchArray test', () => {
        expect(searchArray(array, -1)).toBe(array.indexOf(0));
        expect(searchArray(array, 0)).toBe(array.indexOf(1));
        expect(searchArray(array, 4)).toBe(array.indexOf(5));
        expect(searchArray(array, 5)).toBe(array.length - 1);
        expect(searchArray(array, 8)).toBe(array.length - 1);

        expect(searchArray(array, 4, true)).toBe(array.indexOf(5));
        expect(searchArray(array, 5, true)).toBe(array.indexOf(5));
        expect(searchArray(array, 8, true)).toBe(array.indexOf(5));
    });

    it('searchInOrderedArray test', () => {
        expect(searchInOrderedArray(array, -1)).toBe(array.indexOf(0));
        expect(searchInOrderedArray(array, 0)).toBe(array.indexOf(1));
        expect(searchInOrderedArray(array, 4)).toBe(array.indexOf(5));
        expect(searchInOrderedArray(array, 5)).toBe(array.length - 1);
        expect(searchInOrderedArray(array, 8)).toBe(array.length - 1);
    });

    it('binSearchFirstGreaterThanTarget test', () => {
        expect(searchArray(array, -1)).toBe(array.indexOf(0));
        expect(binSearchFirstGreaterThanTarget(array, 0)).toBe(array.indexOf(1));
        expect(binSearchFirstGreaterThanTarget(array, 4)).toBe(array.indexOf(5));
        expect(binSearchFirstGreaterThanTarget(array, 5)).toBe(array.length - 1);
        expect(binSearchFirstGreaterThanTarget(array, 8)).toBe(array.length - 1);
    });
});
