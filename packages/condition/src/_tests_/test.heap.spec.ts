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
import { getLargestK, getSmallestK } from '../condition/topN';

const randomSort = (a: number, b: number) => Math.random() > 0.5 ? 1 : -1;

describe('heap test', () => {
    it('topN test', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const small = getSmallestK(arr, 5);
        const large = getLargestK(arr, 5);
        expect(small).toEqual([5, 3, 4, 1, 2]); // large heap
        expect(large).toEqual([6, 8, 7, 9, 10]); // small heap
    });

    it('topN test2', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const small = getSmallestK(arr, 4);
        const large = getLargestK(arr, 4);
        expect(small).toEqual([4]);
        expect(large).toEqual([10, 9, 8, 7]);
    });

    it('topN test randomSort  arr', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(randomSort);
        const small = getSmallestK(arr, 4);
        const large = getLargestK(arr, 4);
        expect(small).toEqual([4]);
        expect(large).toEqual([10, 9, 8, 7]);
    });
});
