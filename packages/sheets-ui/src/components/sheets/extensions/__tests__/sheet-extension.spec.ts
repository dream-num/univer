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
import { SHEET_EXTENSION_TYPE, SheetExtension } from '../sheet-extension';

describe('sheet extension range helpers', () => {
    it('checks cell, row and column diff intersections', () => {
        const extension = new SheetExtension();
        const diffRanges = [
            { startRow: 2, endRow: 4, startColumn: 3, endColumn: 5 },
        ];

        expect(extension.type).toBe(SHEET_EXTENSION_TYPE.GRID);
        expect(extension.isRenderDiffRangesByCell({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })).toBe(true);
        expect(extension.isRenderDiffRangesByCell({ startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 }, diffRanges)).toBe(true);
        expect(extension.isRenderDiffRangesByCell({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }, diffRanges)).toBe(false);

        expect(extension.isRenderDiffRangesByColumn(0, 1)).toBe(true);
        expect(extension.isRenderDiffRangesByColumn(4, 6, diffRanges)).toBe(true);
        expect(extension.isRenderDiffRangesByColumn(0, 1, diffRanges)).toBe(false);

        expect(extension.isRenderDiffRangesByRow(0, 1)).toBe(true);
        expect(extension.isRenderDiffRangesByRow(4, 6, diffRanges)).toBe(true);
        expect(extension.isRenderDiffRangesByRow(0, 1, diffRanges)).toBe(false);
    });

    it('checks whether row ranges overlap the current view ranges', () => {
        const extension = new SheetExtension();
        const viewRanges = [
            { startRow: 5, endRow: 8, startColumn: 0, endColumn: 2 },
        ];

        expect(extension.isRowInRanges(1, 2)).toBe(true);
        expect(extension.isRowInRanges(5, 5, viewRanges)).toBe(true);
        expect(extension.isRowInRanges(8, 10, viewRanges)).toBe(true);
        expect(extension.isRowInRanges(4, 9, viewRanges)).toBe(true);
        expect(extension.isRowInRanges(1, 4, viewRanges)).toBe(false);
    });
});
