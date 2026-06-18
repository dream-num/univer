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

import { DrawingTypeEnum } from '@univerjs/core';
import {
    ClearSheetDrawingTransformerOperation,
    DrawingApplyType,
    SetDrawingApplyMutation,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { SheetDrawingTransformAffectedController } from '../sheet-drawing-transform-affected.controller';

const UNIT_ID = 'unit-1';
const SUB_UNIT_ID = 'sheet-1';

function createSkeleton(options: { rowHeights?: number[]; colWidths?: number[] } = {}) {
    const rowHeights = options.rowHeights ?? [];
    const colWidths = options.colWidths ?? [];
    const rowHeightAt = (row: number) => rowHeights[row] ?? 20;
    const colWidthAt = (column: number) => colWidths[column] ?? 10;
    const sumRows = (end: number) => Array.from({ length: Math.max(end, 0) }, (_, row) => rowHeightAt(row)).reduce((sum, height) => sum + height, 0);
    const sumCols = (end: number) => Array.from({ length: Math.max(end, 0) }, (_, column) => colWidthAt(column)).reduce((sum, width) => sum + width, 0);

    return {
        rowHeaderWidth: 0,
        columnHeaderHeight: 0,
        rowTotalHeight: 2000,
        columnTotalWidth: 1000,
        getNoMergeCellWithCoordByIndex: vi.fn((row: number, column: number) => {
            const startY = sumRows(row);
            const startX = sumCols(column);
            return {
                startX,
                endX: startX + colWidthAt(column),
                startY,
                endY: startY + rowHeightAt(row),
            };
        }),
        getCellIndexAndOffsetByPosition: vi.fn((left: number, top: number) => {
            let column = 0;
            let colStart = 0;
            while (left >= colStart + colWidthAt(column)) {
                colStart += colWidthAt(column);
                column++;
            }

            let row = 0;
            let rowStart = 0;
            while (top >= rowStart + rowHeightAt(row)) {
                rowStart += rowHeightAt(row);
                row++;
            }

            return {
                column,
                row,
                columnOffset: left - colStart,
                rowOffset: top - rowStart,
            };
        }),
    };
}

function transformFromPosition(sheetTransform: any, skeleton: any) {
    const fromCell = skeleton.getNoMergeCellWithCoordByIndex(sheetTransform.from.row, sheetTransform.from.column);
    const toCell = skeleton.getNoMergeCellWithCoordByIndex(sheetTransform.to.row, sheetTransform.to.column);
    const left = fromCell.startX + sheetTransform.from.columnOffset;
    const top = fromCell.startY + sheetTransform.from.rowOffset;

    return {
        left,
        top,
        width: toCell.startX + sheetTransform.to.columnOffset - left,
        height: toCell.startY + sheetTransform.to.rowOffset - top,
    };
}

function createDrawing(overrides: Record<string, any> = {}, skeleton = createSkeleton()) {
    const sheetTransform = overrides.sheetTransform ?? {
        from: { row: 1, column: 1, rowOffset: 2, columnOffset: 2 },
        to: { row: 3, column: 3, rowOffset: 6, columnOffset: 6 },
    };
    const transform = overrides.transform ?? transformFromPosition(sheetTransform, skeleton);

    return {
        unitId: UNIT_ID,
        subUnitId: SUB_UNIT_ID,
        drawingId: overrides.drawingId ?? 'drawing-1',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        anchorType: overrides.anchorType ?? SheetDrawingAnchorType.Both,
        sheetTransform,
        axisAlignSheetTransform: sheetTransform,
        transform,
        ...overrides,
    };
}

function createController(options: { drawingData?: Record<string, any>; skeleton?: any } = {}) {
    const skeleton = options.skeleton ?? createSkeleton();
    const drawingData = options.drawingData ?? {};
    const sheetSkeletonParam = { unitId: UNIT_ID, sheetId: SUB_UNIT_ID, skeleton };
    const sheetDrawingService = {
        getDrawingData: vi.fn(() => drawingData),
        getBatchUpdateOp: vi.fn((drawings) => ({ undo: 'update-undo', redo: 'update-redo', objects: drawings })),
        getBatchRemoveOp: vi.fn((drawings) => ({ undo: 'remove-undo', redo: 'remove-redo', objects: drawings })),
        refreshTransform: vi.fn(),
    };
    const drawingManagerService = {
        getDrawingData: vi.fn(() => drawingData),
        refreshTransform: vi.fn(),
    };
    const controller = Object.create(SheetDrawingTransformAffectedController.prototype) as any;

    controller._sheetSkeletonService = {
        getSkeletonParam: vi.fn(() => sheetSkeletonParam),
        getSkeleton: vi.fn(() => skeleton),
    };
    controller._sheetDrawingService = sheetDrawingService;
    controller._drawingManagerService = drawingManagerService;
    controller._commandService = { syncExecuteCommand: vi.fn() };
    controller._getUnitIdAndSubUnitId = vi.fn(() => ({ unitId: UNIT_ID, subUnitId: SUB_UNIT_ID }));

    return { controller, skeleton, sheetDrawingService, drawingManagerService };
}

describe('SheetDrawingTransformAffectedController', () => {
    it('removes drawings covered by deleted rows and shifts drawings below into undoable mutations', () => {
        const skeleton = createSkeleton();
        const deleted = createDrawing({
            drawingId: 'deleted',
            sheetTransform: {
                from: { row: 2, column: 1, rowOffset: 0, columnOffset: 0 },
                to: { row: 3, column: 2, rowOffset: 10, columnOffset: 5 },
            },
        }, skeleton);
        const shifted = createDrawing({
            drawingId: 'shifted',
            sheetTransform: {
                from: { row: 5, column: 1, rowOffset: 2, columnOffset: 2 },
                to: { row: 6, column: 2, rowOffset: 6, columnOffset: 5 },
            },
        }, skeleton);
        const { controller, sheetDrawingService } = createController({
            skeleton,
            drawingData: { deleted, shifted },
        });

        const result = controller._moveRowInterceptor({
            range: { startRow: 2, endRow: 3, startColumn: 0, endColumn: 9 },
        }, 'remove');

        expect(sheetDrawingService.getBatchUpdateOp).toHaveBeenCalledWith([
            expect.objectContaining({
                drawingId: 'shifted',
                transform: expect.objectContaining({ top: 62, height: 24 }),
                sheetTransform: expect.objectContaining({
                    from: expect.objectContaining({ row: 3, rowOffset: 2 }),
                    to: expect.objectContaining({ row: 4, rowOffset: 6 }),
                }),
            }),
        ]);
        expect(sheetDrawingService.getBatchRemoveOp).toHaveBeenCalledWith([
            { unitId: UNIT_ID, subUnitId: SUB_UNIT_ID, drawingId: 'deleted' },
        ]);
        expect(result.redos).toEqual([
            { id: SetDrawingApplyMutation.id, params: { unitId: UNIT_ID, subUnitId: SUB_UNIT_ID, op: 'update-redo', objects: sheetDrawingService.getBatchUpdateOp.mock.calls[0][0], type: DrawingApplyType.UPDATE } },
            { id: SetDrawingApplyMutation.id, params: { unitId: UNIT_ID, subUnitId: SUB_UNIT_ID, op: 'remove-redo', objects: sheetDrawingService.getBatchRemoveOp.mock.calls[0][0], type: DrawingApplyType.REMOVE } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [UNIT_ID] },
        ]);
        expect(result.undos[1].params.type).toBe(DrawingApplyType.INSERT);
    });

    it('moves drawings to the right when columns are inserted before them', () => {
        const skeleton = createSkeleton();
        const drawing = createDrawing({
            drawingId: 'image-after-inserted-cols',
            sheetTransform: {
                from: { row: 1, column: 3, rowOffset: 2, columnOffset: 2 },
                to: { row: 2, column: 4, rowOffset: 8, columnOffset: 5 },
            },
        }, skeleton);
        const { controller, sheetDrawingService } = createController({
            skeleton,
            drawingData: { [drawing.drawingId]: drawing },
        });

        const result = controller._moveColInterceptor({
            range: { startRow: 0, endRow: 9, startColumn: 1, endColumn: 2 },
        }, 'insert');
        const updatedDrawing = sheetDrawingService.getBatchUpdateOp.mock.calls[0][0][0];

        expect(updatedDrawing).toMatchObject({
            drawingId: 'image-after-inserted-cols',
            transform: { left: 52, top: 22, width: 13, height: 26 },
            sheetTransform: {
                from: { row: 1, column: 5, rowOffset: 2, columnOffset: 2 },
                to: { row: 2, column: 6, rowOffset: 8, columnOffset: 5 },
            },
        });
        expect(result.redos).toContainEqual({ id: ClearSheetDrawingTransformerOperation.id, params: [UNIT_ID] });
    });

    it('updates both-anchored drawings when hidden rows cut through their top edge', () => {
        const skeleton = createSkeleton();
        const drawing = createDrawing({
            drawingId: 'row-hidden-top-edge',
            sheetTransform: {
                from: { row: 1, column: 1, rowOffset: 5, columnOffset: 0 },
                to: { row: 4, column: 3, rowOffset: 5, columnOffset: 0 },
            },
        }, skeleton);
        const { controller, sheetDrawingService } = createController({
            skeleton,
            drawingData: { [drawing.drawingId]: drawing },
        });

        const result = controller._getDrawingUndoForRowVisible(UNIT_ID, SUB_UNIT_ID, [
            { startRow: 1, endRow: 2, startColumn: 0, endColumn: 9 },
        ]);
        const updatedDrawing = sheetDrawingService.getBatchUpdateOp.mock.calls[0][0][0];

        expect(updatedDrawing).toMatchObject({
            drawingId: 'row-hidden-top-edge',
            transform: { left: 10, top: 20, width: 20, height: 20 },
            sheetTransform: {
                from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                to: { row: 2, column: 3, rowOffset: 0, columnOffset: 0 },
            },
        });
        expect(result.redos).toEqual([
            { id: SetDrawingApplyMutation.id, params: { unitId: UNIT_ID, subUnitId: SUB_UNIT_ID, op: 'update-redo', objects: [updatedDrawing], type: DrawingApplyType.UPDATE } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [UNIT_ID] },
        ]);
    });

    it('recalculates drawing transforms after row height changes without changing anchors', () => {
        const resizedSkeleton = createSkeleton({ rowHeights: [20, 20, 40, 20] });
        const sheetTransform = {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 3, column: 3, rowOffset: 0, columnOffset: 0 },
        };
        const drawing = createDrawing({
            drawingId: 'resized-by-row-height',
            sheetTransform,
            transform: { left: 10, top: 20, width: 20, height: 40 },
        }, resizedSkeleton);
        const { controller, sheetDrawingService } = createController({
            skeleton: resizedSkeleton,
            drawingData: { [drawing.drawingId]: drawing },
        });

        const result = controller._getDrawingUndoForRowAndColSize(UNIT_ID, SUB_UNIT_ID, [
            { startRow: 2, endRow: 2, startColumn: 0, endColumn: 9 },
        ]);
        const updatedDrawing = sheetDrawingService.getBatchUpdateOp.mock.calls[0][0][0];

        expect(updatedDrawing).toMatchObject({
            drawingId: 'resized-by-row-height',
            sheetTransform,
            transform: { left: 10, top: 20, width: 20, height: 60 },
        });
        expect(result.undos).toEqual([
            { id: SetDrawingApplyMutation.id, params: { unitId: UNIT_ID, subUnitId: SUB_UNIT_ID, op: 'update-undo', objects: [updatedDrawing], type: DrawingApplyType.UPDATE } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [UNIT_ID] },
        ]);
    });

    it('moves only fully contained both-anchored drawings when a range is moved', () => {
        const skeleton = createSkeleton();
        const contained = createDrawing({
            drawingId: 'contained',
            sheetTransform: {
                from: { row: 1, column: 1, rowOffset: 2, columnOffset: 2 },
                to: { row: 2, column: 2, rowOffset: 6, columnOffset: 6 },
            },
        }, skeleton);
        const positionOnly = createDrawing({
            drawingId: 'position-only',
            anchorType: SheetDrawingAnchorType.Position,
            sheetTransform: {
                from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                to: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 },
            },
        }, skeleton);
        const partlyOutside = createDrawing({
            drawingId: 'partly-outside',
            sheetTransform: {
                from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
                to: { row: 3, column: 3, rowOffset: 0, columnOffset: 0 },
            },
        }, skeleton);
        const { controller, sheetDrawingService } = createController({
            skeleton,
            drawingData: {
                contained,
                [positionOnly.drawingId]: positionOnly,
                [partlyOutside.drawingId]: partlyOutside,
            },
        });

        const result = controller._moveRangeInterceptor(
            UNIT_ID,
            SUB_UNIT_ID,
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            { startRow: 3, endRow: 4, startColumn: 4, endColumn: 5 }
        );
        const updatedDrawing = sheetDrawingService.getBatchUpdateOp.mock.calls[0][0][0];

        expect(sheetDrawingService.getBatchUpdateOp).toHaveBeenCalledTimes(1);
        expect(sheetDrawingService.getBatchUpdateOp.mock.calls[0][0]).toHaveLength(1);
        expect(updatedDrawing).toMatchObject({
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            drawingId: 'contained',
            transform: { left: 42, top: 62, width: 14, height: 24 },
            sheetTransform: {
                from: { row: 3, column: 4, rowOffset: 2, columnOffset: 2 },
                to: { row: 4, column: 5, rowOffset: 6, columnOffset: 6 },
            },
        });
        expect(result.redos).toEqual([
            { id: SetDrawingApplyMutation.id, params: { unitId: UNIT_ID, subUnitId: SUB_UNIT_ID, op: 'update-redo', objects: [updatedDrawing], type: DrawingApplyType.UPDATE } },
        ]);
    });
});
