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

import { Direction, DrawingTypeEnum, IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import {
    applySheetDrawingPlacement,
    InsertSheetDrawingCommand,
    ISheetDrawingService,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import { describe, expect, it } from 'vitest';
import { createAbsoluteChart, createChartDrawingTestBed } from '../../../__tests__/chart-drawing-test-bed';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { MoveDrawingsCommand } from '../move-drawings.command';
import { createSheetDrawing, insertDrawings } from './drawing-command-test-utils';

describe('MoveDrawingsCommand', () => {
    it.each([DrawingTypeEnum.DRAWING_IMAGE, DrawingTypeEnum.DRAWING_OLE, DrawingTypeEnum.DRAWING_SHAPE])('moves drawing type %s and replays geometry through undo and redo', async (drawingType) => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(MoveDrawingsCommand);
        const drawing = { ...createSheetDrawing('drawing-1', 100, 100), drawingType, oleAttachmentId: 'retained-attachment' };
        await insertDrawings(testBed, [drawing]);
        sheetDrawingService.focusDrawing([{
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-1',
        }]);

        expect(await testBed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-1',
        })?.transform).toMatchObject({
            left: 101,
            top: 100,
        });

        const param = { unitId: testBed.unitId, subUnitId: testBed.subUnitId, drawingId: 'drawing-1' };
        const history = testBed.get(IUndoRedoService).pitchTopUndoElement()!;
        for (const mutation of history.undoMutations) {
            testBed.commandService.syncExecuteCommand(mutation.id, mutation.params);
        }
        expect(sheetDrawingService.getDrawingByParam(param)).toMatchObject({ drawingType, oleAttachmentId: 'retained-attachment', transform: { left: 100, top: 100 } });
        for (const mutation of history.redoMutations) {
            testBed.commandService.syncExecuteCommand(mutation.id, mutation.params);
        }
        expect(sheetDrawingService.getDrawingByParam(param)).toMatchObject({ drawingType, oleAttachmentId: 'retained-attachment', transform: { left: 101, top: 100 } });

        testBed.univer.dispose();
    });

    it.each([Direction.LEFT, Direction.UP, Direction.RIGHT, Direction.DOWN])('stops keyboard movement at worksheet edge %s without adding undo history', async (direction) => {
        const testBed = createSheetsDrawingUiTestBed();
        const service = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(MoveDrawingsCommand);
        try {
            const skeleton = testBed.get(SheetSkeletonService).getSkeleton(testBed.unitId, testBed.subUnitId)!;
            const left = direction === Direction.RIGHT
                ? skeleton.rowHeaderWidthAndMarginLeft + skeleton.columnTotalWidth - 100
                : skeleton.rowHeaderWidthAndMarginLeft;
            const top = direction === Direction.DOWN
                ? skeleton.columnHeaderHeightAndMarginTop + skeleton.rowTotalHeight - 80
                : skeleton.columnHeaderHeightAndMarginTop;
            const drawing = createSheetDrawing('edge', left, top);
            await insertDrawings(testBed, [drawing]);
            service.focusDrawing([drawing]);
            const history = testBed.get(IUndoRedoService).pitchTopUndoElement();

            expect(await testBed.commandService.executeCommand(MoveDrawingsCommand.id, { direction })).toBe(false);
            expect(service.getDrawingByParam(drawing)?.transform).toMatchObject({ left, top });
            expect(testBed.get(IUndoRedoService).pitchTopUndoElement()).toBe(history);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('keeps the relative positions of selected drawings when one reaches an edge', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const service = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(MoveDrawingsCommand);
        try {
            const skeleton = testBed.get(SheetSkeletonService).getSkeleton(testBed.unitId, testBed.subUnitId)!;
            const left = skeleton.rowHeaderWidthAndMarginLeft + 0.5;
            const first = createSheetDrawing('first', left, 100);
            const second = createSheetDrawing('second', left + 200, 200);
            await insertDrawings(testBed, [first, second]);
            service.focusDrawing([second, first]);

            expect(await testBed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.LEFT })).toBe(true);
            expect(service.getDrawingByParam(first)?.transform).toMatchObject({ left: left - 0.5, top: 100 });
            expect(service.getDrawingByParam(second)?.transform).toMatchObject({ left: left + 199.5, top: 200 });
        } finally {
            testBed.univer.dispose();
        }
    });

    it('keeps drawing positions unchanged when move is triggered without a focused drawing', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(MoveDrawingsCommand);
        await insertDrawings(testBed, [createSheetDrawing('drawing-2', 30, 40)]);

        expect(await testBed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.UP })).toBe(false);
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-2',
        })?.transform).toMatchObject({
            left: 30,
            top: 40,
        });

        testBed.univer.dispose();
    });
});

describe('MoveDrawingsCommand on Chart Sheets', () => {
    it('nudges None through canonical placement and history without a skeleton', async () => {
        const bed = createChartDrawingTestBed(undefined, createAbsoluteChart());
        const search = { unitId: 'test', subUnitId: 'chart', drawingId: 'child' };
        const before = bed.drawings.getDrawingByParam(search)!;
        bed.drawings.focusDrawing([search]);
        expect(await bed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(true);
        const after = bed.drawings.getDrawingByParam(search)!;
        expect(after.transform).toEqual({ ...before.transform, left: 151 });
        expect(after.sheetTransform.from).toEqual({ row: 0, column: 0, rowOffset: 120, columnOffset: 151 });
        expect(bed.drawingManager.getDrawingByParam(search)).toEqual(after);
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingByParam(search)).toEqual(before);
        expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingByParam(search)).toEqual(after);
        const reopened = createChartDrawingTestBed(bed.save());
        expect(reopened.drawings.getDrawingByParam(search)).toEqual(after);
        expect(reopened.skeletons.getSkeleton('test', 'chart')).toBeUndefined();
    });

    it('refuses unsupported cell anchors instead of committing an empty nudge', () => {
        const drawing = { ...createAbsoluteChart(), anchorType: SheetDrawingAnchorType.Position };
        const bed = createChartDrawingTestBed(undefined, drawing);
        bed.drawings.focusDrawing([drawing]);
        expect(bed.commandService.syncExecuteCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(false);
    });

    it.each([SheetDrawingAnchorType.None, SheetDrawingAnchorType.Position, SheetDrawingAnchorType.Both])('retains GRID nudge behavior for anchor %s', async (kind) => {
        const bed = createChartDrawingTestBed();
        bed.activate('grid');
        const skeleton = bed.skeletons.getSkeleton('test', 'grid')!;
        const drawing = applySheetDrawingPlacement(createAbsoluteChart('grid-child', 'grid'), {
            kind,
            bounds: { left: 250, top: 180, width: 200, height: 140 },
        }, skeleton);
        expect(bed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [drawing] })).toBe(true);
        bed.drawings.focusDrawing([drawing]);
        expect(await bed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(true);
        const after = bed.drawings.getDrawingByParam(drawing)!;
        expect(after.anchorType).toBe(kind);
        expect(after.transform).toEqual({ ...drawing.transform, left: 251 });
        expect(bed.drawingManager.getDrawingByParam(drawing)).toEqual(after);
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingByParam(drawing)).toEqual(drawing);
        if (kind === SheetDrawingAnchorType.None) {
            expect(after.sheetTransform.from).toEqual({ row: 0, column: 0, rowOffset: 180, columnOffset: 251 });
        } else {
            expect(after.sheetTransform.from.column).toBeGreaterThan(0);
        }
    });

    it('groups consecutive nudges into one undo and restores the final geometry on redo', async () => {
        const bed = createChartDrawingTestBed(undefined, createAbsoluteChart());
        const search = { unitId: 'test', subUnitId: 'chart', drawingId: 'child' };
        const before = bed.drawings.getDrawingByParam(search)!;
        bed.drawings.focusDrawing([search]);
        expect(await bed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(true);
        expect(await bed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.DOWN })).toBe(true);
        const after = bed.drawings.getDrawingByParam(search)!;
        expect(after.transform).toMatchObject({ left: 151, top: 121 });
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingByParam(search)).toEqual(before);
        expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingByParam(search)).toEqual(after);
    });
});
