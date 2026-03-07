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

import type { ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { convertPositionSheetOverGridToAbsolute } from '@univerjs/sheets-ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { drawingPositionToTransform, transformToAxisAlignPosition, transformToDrawingPosition } from '../transform-position';

vi.mock('@univerjs/sheets-ui', () => ({
    convertPositionSheetOverGridToAbsolute: vi.fn(),
}));

describe('transform-position', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('clips drawing transforms to the current sheet bounds', () => {
        vi.mocked(convertPositionSheetOverGridToAbsolute).mockReturnValue({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            left: 90,
            top: 75,
            width: 20,
            height: 30,
        });

        const sheetSkeletonManagerService = {
            getCurrent: () => ({ unitId: 'unit-1', sheetId: 'sheet-1' }),
            getCurrentSkeleton: () => ({
                rowHeaderWidth: 0,
                columnHeaderHeight: 0,
                columnTotalWidth: 100,
                rowTotalHeight: 90,
            }),
        } as SheetSkeletonManagerService;

        const transform = drawingPositionToTransform({
            from: { column: 0, row: 0, columnOffset: 0, rowOffset: 0 },
            to: { column: 1, row: 1, columnOffset: 0, rowOffset: 0 },
            angle: 10,
            flipX: true,
        }, {} as ISheetSelectionRenderService, sheetSkeletonManagerService);

        expect(transform).toEqual({
            left: 80,
            top: 60,
            width: 20,
            height: 30,
            angle: 10,
            flipX: true,
            flipY: false,
            skewX: 0,
            skewY: 0,
        });
    });

    it('converts a transform back to sheet anchors', () => {
        const selectionRenderService = {
            getCellWithCoordByOffset: vi.fn()
                .mockReturnValueOnce({
                    actualColumn: 1,
                    actualRow: 2,
                    startX: 10,
                    startY: 20,
                })
                .mockReturnValueOnce({
                    actualColumn: 3,
                    actualRow: 4,
                    startX: 40,
                    startY: 60,
                }),
        } as unknown as ISheetSelectionRenderService;

        expect(transformToDrawingPosition({
            left: 15,
            top: 25,
            width: 40,
            height: 50,
            flipY: true,
            angle: 25,
        }, selectionRenderService)).toEqual({
            from: {
                column: 1,
                columnOffset: 5,
                row: 2,
                rowOffset: 5,
            },
            to: {
                column: 3,
                columnOffset: 15,
                row: 4,
                rowOffset: 15,
            },
            flipX: false,
            flipY: true,
            angle: 25,
            skewX: 0,
            skewY: 0,
        });
    });

    it('uses swapped bounds for axis-aligned positions when the angle rotates into a major-axis range', () => {
        const selectionRenderService = {
            getCellWithCoordByOffset: vi.fn()
                .mockReturnValueOnce({
                    actualColumn: 2,
                    actualRow: 3,
                    startX: 10,
                    startY: 40,
                })
                .mockReturnValueOnce({
                    actualColumn: 6,
                    actualRow: 7,
                    startX: 70,
                    startY: 80,
                }),
        } as unknown as ISheetSelectionRenderService;

        expect(transformToAxisAlignPosition({
            left: 20,
            top: 30,
            width: 40,
            height: 60,
            angle: 90,
        }, selectionRenderService)).toEqual({
            from: {
                column: 2,
                columnOffset: 0,
                row: 3,
                rowOffset: 0,
            },
            to: {
                column: 6,
                columnOffset: 0,
                row: 7,
                rowOffset: 0,
            },
            flipX: false,
            flipY: false,
            angle: 90,
            skewX: 0,
            skewY: 0,
        });

        expect(selectionRenderService.getCellWithCoordByOffset).toHaveBeenNthCalledWith(1, 10, 40);
        expect(selectionRenderService.getCellWithCoordByOffset).toHaveBeenNthCalledWith(2, 70, 80);
    });
});
