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

import { AbsoluteRefType } from '../../types/interfaces/i-range';
import { moveRangeByOffset } from '../range';

describe('test moveRangeByOffset', () => {
    it('test normal', () => {
        const range = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
        };
        const newRange = moveRangeByOffset(range, 1, 1);
        expect(newRange).toEqual({
            startRow: 2,
            startColumn: 2,
            endRow: 4,
            endColumn: 4,
        });
    });

    it('test absolute', () => {
        const range = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
            startAbsoluteRefType: AbsoluteRefType.ROW,
            endAbsoluteRefType: AbsoluteRefType.COLUMN,
        };
        const newRange = moveRangeByOffset(range, 1, 1);
        expect(newRange).toEqual({
            startRow: 1,
            startColumn: 2,
            endRow: 4,
            endColumn: 3,
            startAbsoluteRefType: AbsoluteRefType.ROW,
            endAbsoluteRefType: AbsoluteRefType.COLUMN,
        });
    });

    it('test ignoreAbsolute', () => {
        const range = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
            startAbsoluteRefType: AbsoluteRefType.ROW,
            endAbsoluteRefType: AbsoluteRefType.COLUMN,
        };
        const newRange = moveRangeByOffset(range, 1, 1, true);
        expect(newRange).toEqual({
            startRow: 2,
            startColumn: 2,
            endRow: 4,
            endColumn: 4,
            startAbsoluteRefType: AbsoluteRefType.ROW,
            endAbsoluteRefType: AbsoluteRefType.COLUMN,
        });
    });
});
