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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { ISheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import {
    Direction,
    DrawingTypeEnum,
    ICommandService,
    ImageSourceType,
    Injector,
    IResourceLoaderService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommandId,
    Tools,
    UndoCommandId,
    UniverInstanceType,
} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    DeltaColumnWidthCommand,
    DeltaRowHeightCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColByRangeCommand,
    RemoveColCommand,
    RemoveRowByRangeCommand,
    RemoveRowCommand,
    SetColHiddenCommand,
    SetColWidthCommand,
    SetRowHeightCommand,
    SetRowHiddenCommand,
    SetWorksheetRowAutoHeightMutation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { drawingPositionToTransform } from '../../basics/transform-position';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { SetSheetDrawingPlacementCommand } from '../../commands/commands/set-sheet-drawing-placement.command';
import { DrawingApplyType, SetDrawingApplyMutation } from '../../commands/mutations/set-drawing-apply.mutation';
import { ClearSheetDrawingTransformerOperation } from '../../commands/operations/clear-drawing-transformer.operation';
import {
    applySheetDrawingPlacement,
    getSheetDrawingPlacement,
    normalizeSheetDrawingPlacement,
} from '../../services/sheet-drawing-placement';
import { SheetDrawingTransformPlanService } from '../../services/sheet-drawing-transform-plan.service';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';
import { SheetDrawingTransformAffectedController } from '../sheet-drawing-transform-affected.controller';
import { SHEET_DRAWING_PLUGIN } from '../sheet-drawing.controller';

const UNIT_ID = 'unit-1';
const SUB_UNIT_ID = 'sheet-1';
const injectors: Injector[] = [];

afterEach(() => injectors.splice(0).forEach((injector) => injector.dispose()));

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
        makeDirty: vi.fn(),
        calculate: vi.fn(),
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
    const injector = new Injector([
        [SheetSkeletonService, { useValue: {
            getSkeletonParam: vi.fn(() => sheetSkeletonParam),
            getSkeleton: vi.fn(() => skeleton),
        } }],
        [ISheetDrawingService, { useValue: sheetDrawingService }],
        [IDrawingManagerService, { useValue: drawingManagerService }],
        [ICommandService, { useValue: {
            syncExecuteCommand: vi.fn(),
            onCommandExecuted: () => ({ dispose() {} }),
        } }],
        [SheetInterceptorService, { useValue: { interceptAfterCommand: () => ({ dispose() {} }) } }],
        [SheetsSelectionsService, { useValue: {} }],
        [IUniverInstanceService, { useValue: {} }],
        [SheetDrawingTransformPlanService],
        [SheetDrawingTransformAffectedController],
    ]);
    injectors.push(injector);
    vi.spyOn(injector.get(SheetDrawingTransformPlanService), 'transform');
    const controller = injector.get(SheetDrawingTransformAffectedController) as any;

    controller._getUnitIdAndSubUnitId = vi.fn(() => ({ unitId: UNIT_ID, subUnitId: SUB_UNIT_ID }));

    return { controller, skeleton, sheetDrawingService, drawingManagerService };
}

describe('SheetDrawingTransformAffectedController', () => {
    it('finalizes complete drawing candidates through extensions in mutation order', () => {
        const skeleton = createSkeleton();
        const drawing = createDrawing({ drawingId: 'extended' }, skeleton);
        const { controller, sheetDrawingService } = createController({
            skeleton,
            drawingData: { [drawing.drawingId]: drawing },
        });
        controller._transformPlanService.transform.mockImplementation((plan: any) => {
            const candidate = plan.updates.get(drawing.drawingId);
            expect(candidate).toMatchObject({
                drawingId: drawing.drawingId,
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                anchorType: SheetDrawingAnchorType.Both,
            });
            plan.updates.set(drawing.drawingId, {
                ...candidate,
                transform: { ...candidate.transform, left: 77, top: 88 },
            });
            return {
                preRedos: [{ id: 'feature.pre-redo', params: {} }],
                redos: [{ id: 'feature.redo', params: {} }],
                preUndos: [{ id: 'feature.pre-undo', params: {} }],
                undos: [{ id: 'feature.undo', params: {} }],
            };
        });

        const result = controller._moveColInterceptor({
            range: { startRow: 0, endRow: 9, startColumn: 0, endColumn: 0 },
        }, 'insert');

        expect(result.redos.map(({ id }: any) => id)).toEqual([
            'feature.pre-redo',
            SetDrawingApplyMutation.id,
            'feature.redo',
            ClearSheetDrawingTransformerOperation.id,
        ]);
        expect(result.undos.map(({ id }: any) => id)).toEqual([
            'feature.pre-undo',
            SetDrawingApplyMutation.id,
            'feature.undo',
            ClearSheetDrawingTransformerOperation.id,
        ]);
        expect(sheetDrawingService.getBatchUpdateOp.mock.calls[0][0][0].transform).toMatchObject({ left: 77, top: 88 });
    });

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

    it('shrinks a both-anchored drawing when deleted rows cover its top anchor', () => {
        const skeleton = createSkeleton();
        const drawing = createDrawing({
            drawingId: 'row-delete-top-anchor',
            sheetTransform: {
                from: { row: 2, column: 1, rowOffset: 5, columnOffset: 0 },
                to: { row: 6, column: 2, rowOffset: 5, columnOffset: 5 },
            },
        }, skeleton);
        const { controller, sheetDrawingService } = createController({
            skeleton,
            drawingData: { [drawing.drawingId]: drawing },
        });

        controller._moveRowInterceptor({
            range: { startRow: 2, endRow: 4, startColumn: 0, endColumn: 9 },
        }, 'remove');
        const updatedDrawing = sheetDrawingService.getBatchUpdateOp.mock.calls[0][0][0];

        expect(updatedDrawing).toMatchObject({
            transform: { top: 40, height: 25 },
            sheetTransform: {
                from: { row: 2, rowOffset: 0 },
                to: { row: 3, rowOffset: 5 },
            },
        });
    });

    it('shrinks a both-anchored drawing when deleted columns cover its left anchor', () => {
        const skeleton = createSkeleton();
        const drawing = createDrawing({
            drawingId: 'column-delete-left-anchor',
            sheetTransform: {
                from: { row: 1, column: 2, rowOffset: 0, columnOffset: 5 },
                to: { row: 2, column: 6, rowOffset: 5, columnOffset: 5 },
            },
        }, skeleton);
        const { controller, sheetDrawingService } = createController({
            skeleton,
            drawingData: { [drawing.drawingId]: drawing },
        });

        controller._moveColInterceptor({
            range: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 4 },
        }, 'remove');
        const updatedDrawing = sheetDrawingService.getBatchUpdateOp.mock.calls[0][0][0];

        expect(updatedDrawing).toMatchObject({
            transform: { left: 20, width: 15 },
            sheetTransform: {
                from: { column: 2, columnOffset: 0 },
                to: { column: 3, columnOffset: 5 },
            },
        });
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
            { id: ClearSheetDrawingTransformerOperation.id, params: [UNIT_ID] },
        ]);
    });
});

describe('explicit deletion targets', () => {
    it.each([
        ['row', 'worksheet'],
        ['column', 'worksheet'],
        ['row', 'workbook'],
        ['column', 'workbook'],
    ] as const)('deletes a %s in an inactive %s without changing the active drawing owner', async (axis, context) => {
        const testBed = createSheetsDrawingTestBed();
        try {
            testBed.get(SheetDrawingTransformAffectedController);
            const { workbook, commandService } = testBed;
            const sheetTransform = {
                from: { row: 3, column: 3, rowOffset: 0, columnOffset: 0 },
                to: { row: 6, column: 6, rowOffset: 0, columnOffset: 0 },
            };
            const skeleton = testBed.get(SheetSkeletonService).getSkeletonParam('test', 'sheet1');
            const drawing: ISheetDrawing = {
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'inactive-target-drawing',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                imageSourceType: ImageSourceType.URL,
                source: 'https://example.com/drawing.png',
                anchorType: SheetDrawingAnchorType.Both,
                sheetTransform,
                axisAlignSheetTransform: sheetTransform,
                transform: drawingPositionToTransform(sheetTransform, skeleton)!,
            };
            expect(await commandService.executeCommand(InsertSheetDrawingCommand.id, {
                unitId: 'test',
                drawings: [drawing],
            })).toBe(true);
            const drawingService = testBed.get(ISheetDrawingService);
            const readDrawing = () => drawingService.getDrawingByParam({
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: drawing.drawingId,
            })!;
            const before = Tools.deepClone(readDrawing());
            let peer = workbook;
            if (context === 'worksheet') {
                workbook.setActiveSheet(workbook.getSheetBySheetId('sheet2')!);
            } else {
                peer = testBed.univer.createUnit<ReturnType<Workbook['getSnapshot']>, Workbook>(
                    UniverInstanceType.UNIVER_SHEET,
                    { ...Tools.deepClone(workbook.getSnapshot()), id: 'peer-workbook' }
                );
                testBed.get(IUniverInstanceService).focusUnit(peer.getUnitId());
            }
            const peerSheetBefore = Tools.deepClone(peer.getActiveSheet()!.getSnapshot());
            const range = axis === 'row'
                ? { startRow: 1, endRow: 1, startColumn: 0, endColumn: 19 }
                : { startRow: 0, endRow: 19, startColumn: 1, endColumn: 1 };
            expect(await commandService.executeCommand(
                axis === 'row' ? RemoveRowByRangeCommand.id : RemoveColByRangeCommand.id,
                { unitId: 'test', subUnitId: 'sheet1', range }
            )).toBe(true);
            const after = Tools.deepClone(readDrawing());
            expect(after.sheetTransform?.from[axis]).toBe(before.sheetTransform!.from[axis] - 1);
            expect(after.sheetTransform?.to[axis]).toBe(before.sheetTransform!.to[axis] - 1);
            const position = axis === 'row' ? 'top' : 'left';
            expect(after.transform?.[position]).toBeLessThan(before.transform![position]!);
            expect(after.transform?.width).toBe(before.transform?.width);
            expect(after.transform?.height).toBe(before.transform?.height);
            expect(peer.getActiveSheet()!.getSnapshot()).toEqual(peerSheetBefore);
            testBed.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
            expect(commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
            expect(readDrawing()).toEqual(before);
            expect(commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
            expect(readDrawing()).toEqual(after);
        } finally {
            testBed.univer.dispose();
        }
    });
});

describe('sheet drawing transforms without UI plugins', () => {
    let testBed: ReturnType<typeof createSheetsDrawingTestBed>;

    beforeEach(() => {
        testBed = createSheetsDrawingTestBed();
    });

    afterEach(() => testBed.univer.dispose());

    async function insertDrawing(anchorType: SheetDrawingAnchorType | undefined) {
        const sheetTransform = {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        };
        const skeleton = testBed.get(SheetSkeletonService).getSkeletonParam('test', 'sheet1');
        const drawing: ISheetDrawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'drawing-1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: 'https://example.com/drawing.png',
            anchorType,
            sheetTransform,
            axisAlignSheetTransform: sheetTransform,
            transform: drawingPositionToTransform(sheetTransform, skeleton)!,
        };
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        })).toBe(true);
        return testBed.get(ISheetDrawingService);
    }

    function getDrawing(service: ISheetDrawingService) {
        return service.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })!;
    }

    it.each([DeleteRangeMoveLeftCommand.id, DeleteRangeMoveUpCommand.id])('%s removes a legacy cell anchor and preserves an explicit absolute image', async (commandId) => {
        const service = await insertDrawing(undefined);
        const before = structuredClone(getDrawing(service));
        const absolute = { ...before, drawingId: 'absolute-image', anchorType: SheetDrawingAnchorType.None };
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [absolute],
        })).toBe(true);

        expect(await testBed.commandService.executeCommand(commandId, {
            range: { startRow: 1, endRow: 4, startColumn: 1, endColumn: 3 },
        })).toBe(true);
        expect(getDrawing(service)).toBeUndefined();
        expect(service.getDrawingByParam(absolute)).toEqual(absolute);
        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toBeUndefined();
        expect(service.getDrawingByParam(absolute)).toEqual(absolute);
    });

    it('inserts rows and restores the exact drawing through undo and redo', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));

        expect(await testBed.commandService.executeCommand(InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
            direction: Direction.DOWN,
        })).toBe(true);
        const after = structuredClone(getDrawing(service));
        expect(after.transform?.height).toBeGreaterThan(before.transform?.height ?? 0);

        expect(testBed.commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(testBed.commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    it.each([
        ['insert row', InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
            direction: Direction.DOWN,
        }],
        ['delete row', RemoveRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
        }],
        ['insert column', InsertColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 },
            direction: Direction.RIGHT,
        }],
        ['delete column', RemoveColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 },
        }],
        ['resize row', SetRowHeightCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value: 60,
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
        }],
        ['resize column', SetColWidthCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value: 120,
            ranges: [{ startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 }],
        }],
        ['resize row by dragging', DeltaRowHeightCommand.id, {
            anchorRow: 2,
            deltaY: 40,
        }],
        ['resize column by dragging', DeltaColumnWidthCommand.id, {
            anchorCol: 2,
            deltaX: 50,
        }],
        ['hide row', SetRowHiddenCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
        }],
        ['hide column', SetColHiddenCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 }],
        }],
    ])('%s preserves explicit and default placement contracts in headless mode', async (_name, commandId, params) => {
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
        if (!skeleton) {
            throw new Error('Expected the Sheet skeleton to exist.');
        }
        const base = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: 'https://example.com/anchor.png',
            sheetTransform: {
                from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
                to: { row: 0, column: 0, rowOffset: 1, columnOffset: 1 },
            },
            axisAlignSheetTransform: {
                from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
                to: { row: 0, column: 0, rowOffset: 1, columnOffset: 1 },
            },
            transform: { left: 0, top: 0, width: 1, height: 1 },
        };
        const placements: ISheetDrawingPlacement[] = [
            {
                kind: SheetDrawingAnchorType.Position,
                from: { row: 3, column: 3, rowOffset: 4, columnOffset: 6 },
                width: 240,
                height: 120,
            },
            {
                kind: SheetDrawingAnchorType.Both,
                from: { row: 1, column: 1, rowOffset: 4, columnOffset: 6 },
                to: { row: 8, column: 6, rowOffset: 0, columnOffset: 0 },
            },
            {
                kind: SheetDrawingAnchorType.None,
                left: 640,
                top: 96,
                width: 240,
                height: 120,
            },
        ];
        const drawings = placements.map((placement, index) => applySheetDrawingPlacement({
            ...base,
            drawingId: `placement-${index}`,
        }, placement, placement.kind === SheetDrawingAnchorType.None ? undefined : skeleton));
        drawings.push({
            ...applySheetDrawingPlacement({
                ...base,
                drawingId: 'implicit-position',
            }, placements[0], skeleton),
            anchorType: undefined,
        });
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings,
        })).toBe(true);

        const service = testBed.get(ISheetDrawingService);
        const readDrawings = () => drawings.map((drawing) => {
            const current = service.getDrawingByParam(drawing);
            if (!current) {
                throw new Error(`Expected drawing "${drawing.drawingId}" to exist.`);
            }
            return structuredClone(current);
        });
        const before = readDrawings();

        if (commandId === DeltaRowHeightCommand.id || commandId === DeltaColumnWidthCommand.id) {
            testBed.get(SheetsSelectionsService).setSelections([{
                range: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                    rangeType: RANGE_TYPE.NORMAL,
                },
                primary: null,
                style: null,
            }]);
        }

        expect(await testBed.commandService.executeCommand(commandId, params)).toBe(true);
        const after = readDrawings();
        expect(after[0].transform).not.toEqual(before[0].transform);
        expect(after[2].transform).toEqual(before[2].transform);
        expect(after[3].transform).toEqual(after[0].transform);
        expect(getSheetDrawingPlacement(after[3])).toEqual(getSheetDrawingPlacement(after[0]));
        expect(getSheetDrawingPlacement(after[2])).toEqual(getSheetDrawingPlacement(before[2]));
        expect(after[0].transform?.width).toBe(before[0].transform?.width);
        expect(after[0].transform?.height).toBe(before[0].transform?.height);
        expect(after[3].transform?.width).toBe(before[3].transform?.width);
        expect(after[3].transform?.height).toBe(before[3].transform?.height);
        if (commandId === SetRowHiddenCommand.id || commandId === SetColHiddenCommand.id) {
            expect(after[1]).not.toEqual(before[1]);
        } else {
            expect(after[1].transform).not.toEqual(before[1].transform);
            expect([
                after[1].transform?.width !== before[1].transform?.width,
                after[1].transform?.height !== before[1].transform?.height,
            ]).toContain(true);
        }
        expect(after.map(getSheetDrawingPlacement).map(({ kind }) => kind)).toEqual([
            SheetDrawingAnchorType.Position,
            SheetDrawingAnchorType.Both,
            SheetDrawingAnchorType.None,
            SheetDrawingAnchorType.Position,
        ]);

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(readDrawings()).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(readDrawings()).toEqual(after);
    });

    it.each([
        [DeltaRowHeightCommand.id, { anchorRow: 2, deltaY: 48 }, SheetDrawingAnchorType.Position],
        [DeltaColumnWidthCommand.id, { anchorCol: 2, deltaX: 48 }, SheetDrawingAnchorType.Position],
        [DeltaRowHeightCommand.id, { anchorRow: 2, deltaY: 48 }, undefined],
        [DeltaColumnWidthCommand.id, { anchorCol: 2, deltaX: 48 }, undefined],
    ])('%s with %j preserves drawing size for anchor %s', async (commandId, params, anchorType) => {
        const service = await insertDrawing(anchorType);
        const before = structuredClone(getDrawing(service).transform);
        testBed.get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
        }]);

        expect(await testBed.commandService.executeCommand(commandId, params)).toBe(true);
        expect(getDrawing(service).transform).toEqual(before);
    });

    it.each([SheetDrawingAnchorType.Position, undefined])('keeps anchor %s drawing size across auto-height and a preceding column resize', async (anchorType) => {
        const service = await insertDrawing(anchorType);
        const before = structuredClone(getDrawing(service).transform)!;
        const worksheet = testBed.workbook.getSheetBySheetId('sheet1')!;
        testBed.get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
        }]);

        testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rowsAutoHeightInfo: [{ row: 2, autoHeight: worksheet.getRowHeight(2) + 30 }],
        });
        await Promise.resolve();
        await testBed.commandService.executeCommand(DeltaColumnWidthCommand.id, { anchorCol: 0, deltaX: 48 });

        expect(getDrawing(service).transform).toEqual({ ...before, left: before.left! + 48 });
    });

    it('round-trips legacy floating cell anchors through saved resources and undo/redo', async () => {
        const service = await insertDrawing(undefined);
        const original = getDrawing(service);
        const floating = { ...original, drawingId: 'legacy-floating', drawingType: DrawingTypeEnum.DRAWING_DOM };
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [floating],
        })).toBe(true);
        const snapshot = testBed.get(IResourceLoaderService).saveUnit<IWorkbookData>('test');
        if (!snapshot) {
            throw new Error('Expected the Sheet snapshot to exist.');
        }
        const resource = snapshot.resources.find(({ name }) => name === SHEET_DRAWING_PLUGIN);
        if (!resource) {
            throw new Error('Expected the drawing resource to exist.');
        }
        const persisted = JSON.parse(resource.data).sheet1.data['legacy-floating'];
        expect(persisted).not.toHaveProperty('anchorType');
        const restored = createSheetsDrawingTestBed(snapshot);
        try {
            const restoredService = restored.get(ISheetDrawingService);
            const readDrawing = () => restoredService.getDrawingByParam(floating)!;
            const before = structuredClone(readDrawing());
            expect(getSheetDrawingPlacement(before)).toMatchObject({
                kind: SheetDrawingAnchorType.Position,
                from: floating.sheetTransform.from,
                width: floating.transform?.width,
                height: floating.transform?.height,
            });
            expect(await restored.commandService.executeCommand(InsertRowCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 19 },
                direction: Direction.UP,
            })).toBe(true);
            const after = structuredClone(readDrawing());
            expect(after.transform?.top).toBeGreaterThan(before.transform?.top ?? 0);
            expect(after.transform?.width).toBe(before.transform?.width);
            expect(after.transform?.height).toBe(before.transform?.height);
            expect(await restored.commandService.executeCommand(UndoCommandId)).toBe(true);
            expect(readDrawing()).toEqual(before);
            expect(await restored.commandService.executeCommand(RedoCommandId)).toBe(true);
            expect(readDrawing()).toEqual(after);
        } finally {
            restored.univer.dispose();
        }
    });

    it('resizes both-anchored drawings when row height changes', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));

        expect(testBed.commandService.syncExecuteCommand(SetRowHeightCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
            value: 40,
        })).toBe(true);
        const after = structuredClone(getDrawing(service));
        expect(after.transform?.height).toBeGreaterThan(before.transform?.height ?? 0);

        expect(testBed.commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(testBed.commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    it('updates placement through a command and round-trips through undo and redo', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));
        const placement: ISheetDrawingPlacement = {
            kind: SheetDrawingAnchorType.None,
            left: 640,
            top: 96,
            width: 240,
            height: 120,
        };

        expect(await testBed.commandService.executeCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{ drawingId: 'drawing-1', placement }],
        })).toBe(true);
        const after = structuredClone(getDrawing(service));
        expect(getSheetDrawingPlacement(after)).toEqual(placement);

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    it('requires a loaded Sheet for bounds inference and preserves rotation state', () => {
        expect(() => normalizeSheetDrawingPlacement({
            kind: SheetDrawingAnchorType.Position,
            bounds: { left: 120, top: 80, width: 240, height: 120 },
        })).toThrow('SHEET_DRAWING_PLACEMENT_SKELETON_REQUIRED');

        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
        if (!skeleton) {
            throw new Error('Expected the Sheet skeleton to exist.');
        }
        const source: ISheetDrawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'rotated-drawing',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            transform: {
                left: 120,
                top: 80,
                width: 240,
                height: 120,
                angle: 37,
                flipX: true,
                flipY: false,
                skewX: 4,
                skewY: 2,
            },
            sheetTransform: {
                from: { row: 2, column: 2, rowOffset: 4, columnOffset: 6 },
                to: { row: 8, column: 6, rowOffset: 0, columnOffset: 0 },
                angle: 37,
                flipX: true,
                flipY: false,
                skewX: 4,
                skewY: 2,
            },
            axisAlignSheetTransform: {
                from: { row: 2, column: 2, rowOffset: 4, columnOffset: 6 },
                to: { row: 8, column: 6, rowOffset: 0, columnOffset: 0 },
            },
        };
        const placements: ISheetDrawingPlacement[] = [
            {
                kind: SheetDrawingAnchorType.Position,
                from: { row: 3, column: 3, rowOffset: 8, columnOffset: 8 },
                width: 320,
                height: 180,
            },
            {
                kind: SheetDrawingAnchorType.Both,
                from: { row: 3, column: 3, rowOffset: 8, columnOffset: 8 },
                to: { row: 10, column: 8, rowOffset: 0, columnOffset: 0 },
            },
            {
                kind: SheetDrawingAnchorType.None,
                left: 640,
                top: 96,
                width: 320,
                height: 180,
            },
        ];

        for (const placement of placements) {
            const result = applySheetDrawingPlacement(
                source,
                placement,
                placement.kind === SheetDrawingAnchorType.None ? undefined : skeleton
            );
            expect(result.transform).toEqual(expect.objectContaining({
                angle: 37,
                flipX: true,
                flipY: false,
                skewX: 4,
                skewY: 2,
            }));
            expect(result.sheetTransform).toEqual(expect.objectContaining({
                angle: 37,
                flipX: true,
                flipY: false,
                skewX: 4,
                skewY: 2,
            }));
        }
    });

    it.each([
        ['remove row', RemoveRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
        }],
        ['insert column', InsertColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            direction: Direction.RIGHT,
            range: { startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 },
        }],
        ['remove column', RemoveColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 },
        }],
        ['insert cells down', InsertRangeMoveDownCommand.id, {
            range: { startRow: 2, endRow: 2, startColumn: 1, endColumn: 3 },
        }],
        ['insert cells right', InsertRangeMoveRightCommand.id, {
            range: { startRow: 1, endRow: 4, startColumn: 2, endColumn: 2 },
        }],
        ['delete cells up', DeleteRangeMoveUpCommand.id, {
            range: { startRow: 2, endRow: 2, startColumn: 1, endColumn: 3 },
        }],
        ['delete cells left', DeleteRangeMoveLeftCommand.id, {
            range: { startRow: 1, endRow: 4, startColumn: 2, endColumn: 2 },
        }],
        ['set column width', SetColWidthCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value: 120,
            ranges: [{ startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 }],
        }],
        ['hide row', SetRowHiddenCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
        }],
        ['hide column', SetColHiddenCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 }],
        }],
        ['move rows', MoveRowsCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 1, endRow: 4, startColumn: 0, endColumn: 19, rangeType: RANGE_TYPE.ROW },
            fromRange: { startRow: 1, endRow: 4, startColumn: 0, endColumn: 19 },
            toRange: { startRow: 8, endRow: 11, startColumn: 0, endColumn: 19 },
        }],
        ['move columns', MoveColsCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 3, rangeType: RANGE_TYPE.COLUMN },
            fromRange: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 3 },
            toRange: { startRow: 0, endRow: 19, startColumn: 7, endColumn: 9 },
        }],
        ['move range', MoveRangeCommand.id, {
            fromUnitId: 'test',
            fromSubUnitId: 'sheet1',
            toUnitId: 'test',
            toSubUnitId: 'sheet1',
            fromRange: { startRow: 1, endRow: 4, startColumn: 1, endColumn: 3 },
            toRange: { startRow: 8, endRow: 11, startColumn: 7, endColumn: 9 },
        }],
    ])('%s changes drawing geometry and round-trips exactly', async (_name, commandId, params) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));

        expect(await testBed.commandService.executeCommand(commandId, params)).toBe(true);
        const after = structuredClone(getDrawing(service));
        expect(after).not.toEqual(before);

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    it('refreshes direct auto-height mutations and their inverse without UI', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));
        const worksheet = testBed.workbook.getSheetBySheetId('sheet1')!;
        const originalHeight = worksheet.getRowHeight(2);

        expect(testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rowsAutoHeightInfo: [{ row: 2, autoHeight: originalHeight + 30 }],
        })).toBe(true);
        await Promise.resolve();
        expect(getDrawing(service).transform?.height).toBeGreaterThan(before.transform?.height ?? 0);

        expect(testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rowsAutoHeightInfo: [{ row: 2, autoHeight: originalHeight }],
        })).toBe(true);
        await Promise.resolve();
        expect(getDrawing(service)).toEqual(before);
    });
});
