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

import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum, Injector } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import { ISheetDrawingService, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';

import { SheetsDrawingRenderController } from '../sheet-drawing.render-controller';

describe('SheetsDrawingRenderController', () => {
    it('preserves default absolute bounds while rendering cell-anchored drawings', () => {
        const drawingWithSheetTransform: Partial<ISheetDrawing> = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-1',
            anchorType: SheetDrawingAnchorType.Position,
            sheetTransform: {
                from: { row: 1, column: 2, rowOffset: 0, columnOffset: 0 },
                to: { row: 3, column: 4, rowOffset: 0, columnOffset: 0 },
            },
        };
        const drawingWithoutSkeleton: Partial<ISheetDrawing> = {
            unitId: 'unit-1',
            subUnitId: 'missing-sheet',
            drawingId: 'drawing-2',
            anchorType: SheetDrawingAnchorType.Both,
            sheetTransform: {
                from: { row: 5, column: 6, rowOffset: 0, columnOffset: 0 },
                to: { row: 7, column: 8, rowOffset: 0, columnOffset: 0 },
            },
        };
        const groupedDrawing: Partial<ISheetDrawing> = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-4',
            groupId: 'group-1',
            anchorType: SheetDrawingAnchorType.Position,
            transform: { left: 2, top: 3, width: 40, height: 50 },
            sheetTransform: {
                from: { row: 1, column: 2, rowOffset: 0, columnOffset: 0 },
                to: { row: 3, column: 4, rowOffset: 0, columnOffset: 0 },
            },
        };
        const drawingGroup: Partial<ISheetDrawing> = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-5',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            anchorType: SheetDrawingAnchorType.Both,
            sheetTransform: {
                from: { row: 1, column: 2, rowOffset: 0, columnOffset: 0 },
                to: { row: 3, column: 4, rowOffset: 0, columnOffset: 0 },
            },
        };
        const absoluteDrawing: Partial<ISheetDrawing> = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-6',
            transform: { left: 240, top: 96, width: 120, height: 80 },
            sheetTransform: {
                from: { row: 0, column: 0, rowOffset: 96, columnOffset: 240 },
                to: { row: 0, column: 0, rowOffset: 176, columnOffset: 360 },
            },
        };
        const drawingData = {
            'sheet-1': {
                data: {
                    'drawing-1': drawingWithSheetTransform,
                    'drawing-3': { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-3' },
                    'drawing-4': groupedDrawing,
                    'drawing-5': drawingGroup,
                    'drawing-6': absoluteDrawing,
                },
            },
            'missing-sheet': {
                data: {
                    'drawing-2': drawingWithoutSkeleton,
                },
            },
        };
        const sheetDrawingService = {
            initializeNotification: vi.fn(),
            getDrawingDataForUnit: vi.fn(() => drawingData),
        };
        const drawingManagerService = {
            registerDrawingData: vi.fn(),
            initializeNotification: vi.fn(),
        };
        const skeletonParam = {
            skeleton: {
                getNoMergeCellWithCoordByIndex: (row: number, column: number) => ({
                    startX: column * 12,
                    endX: (column + 1) * 12,
                    startY: row * 36,
                    endY: (row + 1) * 36,
                }),
                rowHeaderWidth: 10,
                columnHeaderHeight: 20,
                columnTotalWidth: 1000,
                rowTotalHeight: 2000,
                rowHeaderWidthAndMarginLeft: 10,
                columnHeaderHeightAndMarginTop: 20,
            },
        };
        const sheetSkeletonService = {
            getSkeletonParam: vi.fn((unitId: string, subUnitId: string) => {
                if (unitId === 'unit-1' && subUnitId === 'sheet-1') {
                    return skeletonParam;
                }

                return null;
            }),
        };

        const injector = new Injector([
            [ISheetDrawingService, { useValue: sheetDrawingService }],
            [IDrawingManagerService, { useValue: drawingManagerService }],
            [SheetSkeletonService, { useValue: sheetSkeletonService }],
        ]);
        const controller = injector.createInstance(SheetsDrawingRenderController, { unitId: 'unit-1' } as never);

        expect(sheetDrawingService.initializeNotification).toHaveBeenCalledWith('unit-1');
        expect(drawingWithSheetTransform.transform).toMatchObject({ left: 24, top: 36, width: 24, height: 72 });
        expect(drawingGroup.transform).toMatchObject({ left: 14, top: 16, width: 24, height: 72 });
        expect(groupedDrawing.transform).toEqual({ left: 2, top: 3, width: 40, height: 50 });
        expect(absoluteDrawing.transform).toEqual({ left: 240, top: 96, width: 120, height: 80 });
        expect(drawingWithoutSkeleton).not.toHaveProperty('transform');
        expect(drawingManagerService.registerDrawingData).toHaveBeenCalledWith('unit-1', drawingData);
        expect(drawingManagerService.initializeNotification).toHaveBeenCalledWith('unit-1');

        controller.dispose();
        injector.dispose();
    });
});
