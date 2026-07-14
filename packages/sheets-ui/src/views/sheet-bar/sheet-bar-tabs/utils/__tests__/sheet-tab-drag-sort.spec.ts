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
import { calculateSheetTabDragSort, getSheetTabTargetOrder, reorderItems } from '../sheet-tab-drag-sort';

const layout = [
    { id: 'sheet-0', left: 0, width: 40 },
    { id: 'sheet-1', left: 45, width: 40 },
    { id: 'sheet-2', left: 90, width: 40 },
    { id: 'sheet-3', left: 135, width: 40 },
];

describe('sheet-tab-drag-sort', () => {
    it('moves following tabs left when the dragged tab crosses their midlines', () => {
        expect(calculateSheetTabDragSort(layout, 1, 10)).toEqual({
            targetIndex: 1,
            itemOffsets: [0, 10, 0, 0],
        });

        expect(calculateSheetTabDragSort(layout, 1, 30)).toEqual({
            targetIndex: 2,
            itemOffsets: [0, 30, -40, 0],
        });

        expect(calculateSheetTabDragSort(layout, 1, 75)).toEqual({
            targetIndex: 3,
            itemOffsets: [0, 75, -40, -40],
        });
    });

    it('moves previous tabs right when the dragged tab crosses their midlines', () => {
        expect(calculateSheetTabDragSort(layout, 2, -10)).toEqual({
            targetIndex: 2,
            itemOffsets: [0, 0, -10, 0],
        });

        expect(calculateSheetTabDragSort(layout, 2, -30)).toEqual({
            targetIndex: 1,
            itemOffsets: [0, 40, -30, 0],
        });

        expect(calculateSheetTabDragSort(layout, 2, -75)).toEqual({
            targetIndex: 0,
            itemOffsets: [40, 40, -75, 0],
        });
    });

    it('ignores invalid active indexes', () => {
        expect(calculateSheetTabDragSort(layout, -1, 20)).toEqual({
            targetIndex: -1,
            itemOffsets: [0, 0, 0, 0],
        });
        expect(calculateSheetTabDragSort(layout, 99, 20)).toEqual({
            targetIndex: 99,
            itemOffsets: [0, 0, 0, 0],
        });
    });

    it('reorders arrays by the calculated target index', () => {
        expect(reorderItems(['a', 'b', 'c', 'd'], 1, 3)).toEqual(['a', 'c', 'd', 'b']);
        expect(reorderItems(['a', 'b', 'c', 'd'], 2, 0)).toEqual(['c', 'a', 'b', 'd']);
        expect(reorderItems(['a', 'b', 'c', 'd'], 2, 2)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('moves sheet 2 after sheet 6 when sheet 5 is hidden', () => {
        const sheetOrder = ['sheet-1', 'sheet-2', 'sheet-3', 'sheet-4', 'sheet-5', 'sheet-6'];
        const visibleSheetIds = ['sheet-1', 'sheet-2', 'sheet-3', 'sheet-4', 'sheet-6'];
        const targetOrder = getSheetTabTargetOrder(sheetOrder, visibleSheetIds, 4);

        expect(reorderItems(sheetOrder, 1, targetOrder)).toEqual([
            'sheet-1',
            'sheet-3',
            'sheet-4',
            'sheet-5',
            'sheet-6',
            'sheet-2',
        ]);
    });
});
