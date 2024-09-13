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
import { LRUMap } from '../lru-map';

describe('Test LRUMap', () => {
    it('Should "onShift" callback get called when LRU capacity is exceeded', () => {
        const shiftedEntries: number[] = [];
        const l = new LRUMap<number, number>(3);
        l.onShift((entry) => shiftedEntries.push(entry.key));

        l.set(1, 1);
        l.set(2, 2);
        l.set(3, 3);
        l.set(4, 4);

        expect(shiftedEntries.length).toBe(1);
        expect(l.has(1)).toBeFalsy();

        l.set(2, 2);
        l.set(5, 5);

        expect(shiftedEntries.length).toBe(2);
        expect(l.has(1)).toBeFalsy();
        expect(l.has(3)).toBeFalsy();

        l.delete(4);
        expect(shiftedEntries.length).toBe(2); // it won't trigger onShift
        expect(l.has(1)).toBeFalsy();
        expect(l.has(3)).toBeFalsy();
        expect(l.has(4)).toBeFalsy();
    });
});
