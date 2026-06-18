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

import type { IUnitRange } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { isInDirtyRange } from '../dirty';

describe('dirty range matching', () => {
    const dirtyRanges: IUnitRange[] = [
        {
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            range: {
                startRow: 2,
                endRow: 4,
                startColumn: 1,
                endColumn: 3,
            },
        },
        {
            unitId: 'unit-1',
            sheetId: 'sheet-2',
            range: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            },
        },
    ];

    it('matches cells inside the edited range including boundary cells', () => {
        expect(isInDirtyRange(dirtyRanges, 'unit-1', 'sheet-1', 2, 1)).toBe(true);
        expect(isInDirtyRange(dirtyRanges, 'unit-1', 'sheet-1', 3, 2)).toBe(true);
        expect(isInDirtyRange(dirtyRanges, 'unit-1', 'sheet-1', 4, 3)).toBe(true);
    });

    it('does not match cells outside the range or from another sheet/workbook', () => {
        expect(isInDirtyRange(dirtyRanges, 'unit-1', 'sheet-1', 1, 1)).toBe(false);
        expect(isInDirtyRange(dirtyRanges, 'unit-1', 'sheet-1', 4, 4)).toBe(false);
        expect(isInDirtyRange(dirtyRanges, 'unit-1', 'sheet-2', 3, 2)).toBe(false);
        expect(isInDirtyRange(dirtyRanges, 'unit-2', 'sheet-1', 3, 2)).toBe(false);
    });
});
