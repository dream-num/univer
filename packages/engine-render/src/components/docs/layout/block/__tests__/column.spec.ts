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

import { ColumnLayoutType, ColumnResponsiveType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { calculateColumnGroupLayout } from '../column';

describe('column group layout', () => {
    it('compresses multiple columns without looping on floating-point residue', () => {
        const layout = calculateColumnGroupLayout({
            columnGroupId: 'column-group-1',
            columns: [
                { columnId: 'column-1', widthRatio: 1, minWidth: { v: 50 } },
                { columnId: 'column-2', widthRatio: 1 },
                { columnId: 'column-3', widthRatio: 1 },
            ],
            gap: { v: 0 },
            layout: ColumnLayoutType.FIXED,
            responsive: ColumnResponsiveType.SHRINK,
        }, 100, [0, 0, 0]);

        expect(layout.columns[0].width).toBe(50);
        expect(layout.columns[1].width).toBeCloseTo(25);
        expect(layout.columns[2].width).toBeCloseTo(25);
    });
});
