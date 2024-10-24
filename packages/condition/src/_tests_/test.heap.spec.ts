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
        expect(small.sort()).toMatchObject([5, 3, 4, 1, 2].sort()); // large heap
        expect(large.sort()).toMatchObject([6, 8, 7, 10, 9].sort()); // small heap
    });

    it('topN test2', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const small = getSmallestK(arr, 4);
        const large = getLargestK(arr, 4);
        expect(small.sort()).toMatchObject([4, 2, 3, 1].sort());
        expect(large.sort()).toMatchObject([10, 9, 8, 7].sort());
    });

    it('topN test randomSort  arr', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(randomSort);
        const small = getSmallestK(arr, 4);
        const large = getLargestK(arr, 4);
        expect(small.sort()).toMatchObject([4, 2, 3, 1].sort());
        expect(large.sort()).toMatchObject([10, 9, 8, 7].sort());
    });

    it('topN test randomSort  arr2', () => {
        const arr = [1, -2, 3, 4, -5, 6, 7, 8, 9, -10].sort(randomSort);
        const small = getSmallestK(arr, 5);
        const large = getLargestK(arr, 5);
        expect(small.sort()).toMatchObject([3, -2, 1, -10, -5].sort());
        expect(large.sort()).toMatchObject([4, 7, 6, 9, 8].sort());
    });

    it('topN test compare with array sort', () => {
        const arr: number[] = [];
        for (let i = 0; i < 100; i++) {
            arr.push(Math.floor(Math.random() * 1000));
        }
        const compare = (a: number, b: number) => a - b;

        const small = getSmallestK(arr, 5);
        const large = getLargestK(arr, 5);

        arr.sort(compare);
        const rs = arr.slice(0, 5);
        expect(rs).toMatchObject(small.sort(compare));

        arr.reverse();
        const rs2 = arr.slice(0, 5);
        expect(rs2.sort(compare)).toMatchObject(large.sort(compare));
    });
});
