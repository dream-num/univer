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

import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { Direction, DrawingTypeEnum, ImageSourceType, RANGE_TYPE, RedoCommandId, UndoCommandId } from '@univerjs/core';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveRowCommand,
    SetColHiddenCommand,
    SetColWidthCommand,
    SetRowHeightCommand,
    SetRowHiddenCommand,
    SetWorksheetRowAutoHeightMutation,
    SheetSkeletonService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { drawingPositionToTransform } from '../../basics/transform-position';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';

describe('sheet drawing transforms without UI plugins', () => {
    let testBed: ReturnType<typeof createSheetsDrawingTestBed>;

    beforeEach(() => {
        testBed = createSheetsDrawingTestBed();
    });

    afterEach(() => testBed.univer.dispose());

    async function insertDrawing() {
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
            anchorType: SheetDrawingAnchorType.Both,
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

    it('inserts rows and restores the exact drawing through undo and redo', async () => {
        const service = await insertDrawing();
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

    it('resizes both-anchored drawings when row height changes', async () => {
        const service = await insertDrawing();
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
        const service = await insertDrawing();
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
        const service = await insertDrawing();
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
