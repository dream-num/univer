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

import { ColumnSeparatorType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createSkeletonColumn } from '../column';

describe('column model', () => {
    const columnProperties = [
        { width: 120, paddingEnd: 20 },
        { width: 80, paddingEnd: 16 },
        { width: 160, paddingEnd: 0 },
    ];

    it('creates the first column at the section origin with its trailing gap', () => {
        const column = createSkeletonColumn(
            0,
            columnProperties,
            ColumnSeparatorType.BETWEEN_EACH_COLUMN,
            500
        );

        expect(column).toMatchObject({
            left: 0,
            width: 120,
            spaceWidth: 20,
            separator: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
            height: 0,
            isFull: false,
            drawingLRIds: [],
            lines: [],
        });
    });

    it('accumulates previous column widths and removes gap from the last column', () => {
        const middleColumn = createSkeletonColumn(1, columnProperties, ColumnSeparatorType.NONE, 500);
        const lastColumn = createSkeletonColumn(2, columnProperties, ColumnSeparatorType.NONE, 500);

        expect(middleColumn.left).toBe(140);
        expect(middleColumn.width).toBe(80);
        expect(middleColumn.spaceWidth).toBe(16);

        expect(lastColumn.left).toBe(236);
        expect(lastColumn.width).toBe(160);
        expect(lastColumn.spaceWidth).toBe(0);
    });

    it('keeps infinite width for single-column unconstrained sections', () => {
        const column = createSkeletonColumn(0, [{ width: 0, paddingEnd: 0 }], ColumnSeparatorType.NONE);

        expect(column.left).toBe(0);
        expect(column.width).toBe(Number.POSITIVE_INFINITY);
        expect(column.spaceWidth).toBe(0);
    });
});
