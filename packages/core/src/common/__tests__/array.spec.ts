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
import { rotate } from '../array';

describe('Test array util function', () => {
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
});
