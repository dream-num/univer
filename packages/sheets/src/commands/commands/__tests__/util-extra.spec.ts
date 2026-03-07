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

import { ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { countCells, getSuitableRangesInView } from '../util';

describe('sheets command util', () => {
    it('should select nearest ranges and split overflow range by max visible row quota', () => {
        const ranges = [
            { startRow: 50, endRow: 749, startColumn: 0, endColumn: 2 },
            { startRow: 2000, endRow: 2499, startColumn: 0, endColumn: 2 },
        ];

        const result = getSuitableRangesInView(ranges, {
            worksheet: { getColumnCount: () => 10 },
            scrollY: 0,
            getOffsetRelativeToRowCol: () => ({ row: 100 }),
        } as any);

        expect(result.suitableRanges).toEqual([
            { startRow: 50, endRow: 749, startColumn: 0, endColumn: 2 },
            { startRow: 2000, endRow: 2299, startColumn: 0, endColumn: 2 },
        ]);
        expect(result.remainingRanges).toEqual([
            { startRow: 2300, endRow: 2499, startColumn: 0, endColumn: 2 },
        ]);
    });

    it('should return original ranges when skeleton is absent', () => {
        const ranges = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }];
        const result = getSuitableRangesInView(ranges, null);
        expect(result).toEqual({ suitableRanges: ranges, remainingRanges: [] });
    });

    it('should count matrix cells with values only', () => {
        const matrix = new ObjectMatrix<number>();
        matrix.setValue(0, 0, 1);
        matrix.setValue(1, 2, 2);
        matrix.setValue(10, 4, 3);

        expect(countCells(matrix)).toBe(3);
    });
});
