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
import { dedupe, dedupeBy, findLast, groupBy, makeArray, remove, rotate } from '../array';

describe('test array utils', () => {
    it('should "rotate" function work correctly', () => {
        const raw = [1, 2, 3, 4, 5];

        // The function do not mutate the original array.
        expect(rotate(raw, 0)).toEqual([1, 2, 3, 4, 5]);
        expect(rotate(raw, 1)).toEqual([2, 3, 4, 5, 1]);
        expect(rotate(raw, 2)).toEqual([3, 4, 5, 1, 2]);
        expect(rotate(raw, 3)).toEqual([4, 5, 1, 2, 3]);
        expect(rotate(raw, 4)).toEqual([5, 1, 2, 3, 4]);
        expect(rotate(raw, 5)).toEqual([1, 2, 3, 4, 5]);
        expect(rotate(raw, 6)).toEqual([2, 3, 4, 5, 1]);
    });

    it('should "dedupeBy" function work correctly', () => {
        const raw = [
            { id: '1', name: 'a' },
            { id: '2', name: 'b' },
            { id: '3', name: 'c' },
            { id: '1', name: 'd' },
        ];

        expect(raw.length).toBe(4);
        expect(raw[0].name).toBe('a');
        expect(raw[1].name).toBe('b');
        expect(raw[2].name).toBe('c');
        expect(raw[3].name).toBe('d');

        const deduped = dedupeBy(raw, (item) => item.id);
        expect(deduped.length).toBe(3);
        expect(deduped[0].name).toBe('a');
        expect(deduped[1].name).toBe('b');
        expect(deduped[2].name).toBe('c');
        expect(deduped[0].id).toBe('1');
    });

    it('should remove, dedupe, findLast, groupBy and make arrays consistently', () => {
        const raw = [1, 2, 2, 3, 4, 3];

        expect(remove(raw, 2)).toBe(true);
        expect(raw).toEqual([1, 2, 3, 4, 3]);
        expect(remove(raw, 9)).toBe(false);

        expect(dedupe(raw)).toEqual([1, 2, 3, 4]);
        expect(findLast(raw, (item, index) => item % 2 === 1 && index > 2)).toBe(3);
        expect(findLast(raw, (item) => item === 9)).toBeNull();

        const grouped = groupBy([
            { group: 'odd', value: 1 },
            { group: 'even', value: 2 },
            { group: 'odd', value: 3 },
        ], (item) => item.group);

        expect(grouped.get('odd')).toEqual([
            { group: 'odd', value: 1 },
            { group: 'odd', value: 3 },
        ]);
        expect(grouped.get('even')).toEqual([{ group: 'even', value: 2 }]);

        expect(makeArray('single')).toEqual(['single']);
        const arr = ['already'];
        expect(makeArray(arr)).toBe(arr);
    });
});
