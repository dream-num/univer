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

import { Direction, DrawingTypeEnum, IUndoRedoService } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { describe, expect, it } from 'vitest';
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
