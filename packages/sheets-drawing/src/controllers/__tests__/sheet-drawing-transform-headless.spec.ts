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

import type { ISheetDrawingBoundsPlacement, ISheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { Direction, DrawingTypeEnum, ImageSourceType, RANGE_TYPE, RedoCommandId, UndoCommandId } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { drawingPositionToTransform } from '../../basics/transform-position';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { SetSheetDrawingPlacementCommand } from '../../commands/commands/set-sheet-drawing-placement.command';
import {
    applySheetDrawingPlacement,
    getSheetDrawingPlacement,

} from '../../services/sheet-drawing-placement';
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

    it('preserves drawing rotation when rows resize a two-cell anchor', async () => {
        const service = await insertDrawing();
        const drawing = getDrawing(service);
        drawing.transform = {
            ...drawing.transform,
            angle: 45,
        };

        expect(await testBed.commandService.executeCommand(InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
            direction: Direction.DOWN,
        })).toBe(true);

        expect(getDrawing(service).transform?.angle).toBe(45);
    });

    it.each([
        ['insert row', InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 19 },
            direction: Direction.DOWN,
        }],
        ['delete row', RemoveRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 19 },
        }],
        ['insert column', InsertColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 1 },
            direction: Direction.RIGHT,
        }],
        ['delete column', RemoveColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 1 },
        }],
    ])('%s preserves the three placement contracts in headless mode', async (_name, commandId, params) => {
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
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
                from: { row: 2, column: 2, rowOffset: 4, columnOffset: 6 },
                width: 240,
                height: 120,
            },
            {
                kind: SheetDrawingAnchorType.Both,
                from: { row: 2, column: 2, rowOffset: 4, columnOffset: 6 },
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
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings,
        })).toBe(true);

        const service = testBed.get(ISheetDrawingService);
        const readPlacements = () => drawings.map((drawing) =>
            getSheetDrawingPlacement(service.getDrawingByParam(drawing)!));
        const before = readPlacements();

        expect(await testBed.commandService.executeCommand(commandId, params)).toBe(true);
        const after = readPlacements();
        expect(after[0]).not.toEqual(before[0]);
        expect(after[1]).not.toEqual(before[1]);
        expect(after[2]).toEqual(before[2]);
        if (
            before[0].kind === SheetDrawingAnchorType.Position &&
            after[0].kind === SheetDrawingAnchorType.Position
        ) {
            expect(after[0].width).toBe(before[0].width);
            expect(after[0].height).toBe(before[0].height);
        }

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(readPlacements()).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(readPlacements()).toEqual(after);
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

    it('keeps a position anchor size fixed while a both anchor resizes', async () => {
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
        if (!skeleton) {
            throw new Error('SHEET_SKELETON_NOT_FOUND');
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
        const positionDrawing = applySheetDrawingPlacement({
            ...base,
            drawingId: 'position-anchor',
        }, {
            kind: SheetDrawingAnchorType.Position,
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            width: 240,
            height: 120,
        }, skeleton);
        const bothDrawing = applySheetDrawingPlacement({
            ...base,
            drawingId: 'both-anchor',
        }, {
            kind: SheetDrawingAnchorType.Both,
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        }, skeleton);

        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [positionDrawing, bothDrawing],
        })).toBe(true);

        const service = testBed.get(ISheetDrawingService);
        const getById = (drawingId: string): ISheetDrawing => {
            const drawing = service.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId });
            if (!drawing) {
                throw new Error(`DRAWING_NOT_FOUND:${drawingId}`);
            }
            return drawing;
        };
        const positionBefore = structuredClone(getById('position-anchor'));
        const bothBefore = structuredClone(getById('both-anchor'));

        expect(testBed.commandService.syncExecuteCommand(SetRowHeightCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
            value: 60,
        })).toBe(true);

        const positionAfter = getById('position-anchor');
        const bothAfter = getById('both-anchor');
        expect(positionAfter.transform?.width).toBe(positionBefore.transform?.width);
        expect(positionAfter.transform?.height).toBe(positionBefore.transform?.height);
        expect(bothAfter.transform?.height).toBeGreaterThan(bothBefore.transform?.height ?? 0);
    });

    it('updates placement through a command and round-trips through undo and redo', async () => {
        const service = await insertDrawing();
        const before = structuredClone(getDrawing(service));
        const renderManagerService = testBed.get(IRenderManagerService);
        const getRenderUnitById = vi.spyOn(renderManagerService, 'getRenderUnitById');
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
        expect(getRenderUnitById).not.toHaveBeenCalled();

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    async function expectBoundsNormalizedByCommand(
        kind: SheetDrawingAnchorType.Position | SheetDrawingAnchorType.Both
    ) {
        const service = await insertDrawing();
        const before = structuredClone(getDrawing(service));
        const placement: ISheetDrawingBoundsPlacement = {
            kind,
            left: 123,
            top: 47,
            width: 205,
            height: 91,
        };

        expect(await testBed.commandService.executeCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{ drawingId: 'drawing-1', placement }],
        })).toBe(true);

        const after = structuredClone(getDrawing(service));
        expect(after.transform).toEqual(expect.objectContaining({
            left: placement.left,
            top: placement.top,
            width: placement.width,
            height: placement.height,
        }));
        const normalized = getSheetDrawingPlacement(after);
        expect(normalized.kind).toBe(kind);
        expect('left' in normalized).toBe(false);
        if (normalized.kind === SheetDrawingAnchorType.Position) {
            expect(normalized.width).toBe(placement.width);
            expect(normalized.height).toBe(placement.height);
        } else if (normalized.kind === SheetDrawingAnchorType.Both) {
            expect(normalized.from).not.toEqual(normalized.to);
        }

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    }

    it('normalizes absolute bounds to Position cell markers in the command', async () => {
        await expectBoundsNormalizedByCommand(SheetDrawingAnchorType.Position);
    });

    it('normalizes absolute bounds to Both cell markers in the command', async () => {
        await expectBoundsNormalizedByCommand(SheetDrawingAnchorType.Both);
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
