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

import { Rectangle } from '../rectangle';

describe('test rectangle', () => {
    it('test subtract', () => {
        // completely covered
        const rect1 = {
            startRow: 1,
            startColumn: 1,
            endRow: 1,
            endColumn: 1,
        };

        const rect2 = {
            startRow: 1,
            startColumn: 1,
            endRow: 1,
            endColumn: 1,
        };
        expect(Rectangle.subtract(rect1, rect2)).toEqual([]);

        // partly covered
        const rect3 = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
        };

        const rect4 = {
            startRow: 1,
            startColumn: 1,
            endRow: 1,
            endColumn: 1,
        };
        expect(Rectangle.subtract(rect3, rect4)).toStrictEqual([
            { startRow: 2, startColumn: 1, endRow: 3, endColumn: 3 },
            { startRow: 1, startColumn: 2, endRow: 1, endColumn: 3 },
        ]);

        // covered at center point
        const rect5 = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
        };

        const rect6 = {
            startRow: 2,
            startColumn: 2,
            endRow: 2,
            endColumn: 2,
        };

        expect(Rectangle.subtract(rect5, rect6)).toStrictEqual([
            { startRow: 1, startColumn: 1, endRow: 1, endColumn: 3 },
            { startRow: 3, startColumn: 1, endRow: 3, endColumn: 3 },
            { startRow: 2, startColumn: 1, endRow: 2, endColumn: 1 },
            { startRow: 2, startColumn: 3, endRow: 2, endColumn: 3 },
        ]);
    });
});
