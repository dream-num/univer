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

import type { ICommandService, Injector, Univer } from '@univerjs/core';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { Direction, DrawingTypeEnum, ImageSourceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { InsertSheetDrawingCommand, ISheetDrawingService } from '@univerjs/sheets-drawing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { ClearSheetDrawingTransformerOperation } from '../../operations/clear-drawing-transformer.operation';
import { DeleteDrawingsCommand } from '../delete-drawings.command';
import { FlipSheetDrawingCommand } from '../flip-drawings.command';
import { GroupSheetDrawingCommand } from '../group-sheet-drawing.command';
import { MoveDrawingsCommand } from '../move-drawings.command';
import { UngroupSheetDrawingCommand } from '../ungroup-sheet-drawing.command';

function createDrawing(drawingId: string): ISheetDrawing {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: `https://example.com/${drawingId}.png`,
        transform: {
            left: 10,
            top: 20,
            width: 30,
            height: 40,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
        sheetTransform: {
            from: { row: 2, rowOffset: 0, column: 1, columnOffset: 0 },
            to: { row: 6, rowOffset: 0, column: 4, columnOffset: 0 },
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
        axisAlignSheetTransform: {
            from: { row: 2, rowOffset: 0, column: 1, columnOffset: 0 },
            to: { row: 6, rowOffset: 0, column: 4, columnOffset: 0 },
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
    };
}

function createShiftedDrawing(drawingId: string, left: number, top: number): ISheetDrawing {
    return {
        ...createDrawing(drawingId),
        transform: {
            ...createDrawing(drawingId).transform!,
            left,
            top,
        },
    };
}

function createGroupDrawing(drawingId: string): ISheetDrawing {
    return {
        ...createDrawing(drawingId),
        drawingType: DrawingTypeEnum.DRAWING_GROUP,
        transform: {
            left: 10,
            top: 20,
            width: 60,
            height: 70,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
    };
}

describe('sheets drawing ui commands integration', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let debounceRefreshControls: ReturnType<typeof createSheetsDrawingUiTestBed>['debounceRefreshControls'];

    beforeEach(() => {
        const testBed = createSheetsDrawingUiTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = testBed.commandService;
        debounceRefreshControls = testBed.debounceRefreshControls;

        commandService.registerCommand(DeleteDrawingsCommand);
        commandService.registerCommand(FlipSheetDrawingCommand);
        commandService.registerCommand(GroupSheetDrawingCommand);
        commandService.registerCommand(MoveDrawingsCommand);
        commandService.registerCommand(UngroupSheetDrawingCommand);
        commandService.registerCommand(ClearSheetDrawingTransformerOperation);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('deletes all focused drawings through the real ui command', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createDrawing('drawing-1'), createDrawing('drawing-2')],
        });

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);

        sheetDrawingService.focusDrawing([
            { unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' },
            { unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-2' },
        ]);

        expect(await commandService.executeCommand(DeleteDrawingsCommand.id)).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toBeUndefined();
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-2' })).toBeUndefined();
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toBeUndefined();
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-2' })).toBeUndefined();
    });

    it('moves focused drawings through the real ui command and clears the transformer', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createDrawing('drawing-move')],
        });

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);
        sheetDrawingService.focusDrawing([{ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move' }]);

        expect(await commandService.executeCommand(MoveDrawingsCommand.id, {
            direction: Direction.RIGHT,
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move' })).toMatchObject({
            transform: expect.objectContaining({
                left: 11,
                top: 20,
            }),
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move' })).toMatchObject({
            transform: expect.objectContaining({
                left: 11,
                top: 20,
            }),
        });
        expect(debounceRefreshControls).toHaveBeenCalled();
    });

    it('moves all focused drawings through the real ui command', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [
                createShiftedDrawing('drawing-move-1', 10, 20),
                createShiftedDrawing('drawing-move-2', 35, 45),
            ],
        });

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);
        sheetDrawingService.focusDrawing([
            { unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move-1' },
            { unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move-2' },
        ]);

        expect(await commandService.executeCommand(MoveDrawingsCommand.id, {
            direction: Direction.DOWN,
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move-1' })).toMatchObject({
            transform: expect.objectContaining({
                left: 10,
                top: 21,
            }),
        });
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move-2' })).toMatchObject({
            transform: expect.objectContaining({
                left: 35,
                top: 46,
            }),
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move-1' })).toMatchObject({
            transform: expect.objectContaining({
                top: 21,
            }),
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-move-2' })).toMatchObject({
            transform: expect.objectContaining({
                top: 46,
            }),
        });
        expect(debounceRefreshControls).toHaveBeenCalled();
    });

    it('returns false when move command has no focused drawings', async () => {
        expect(await commandService.executeCommand(MoveDrawingsCommand.id, {
            direction: Direction.LEFT,
        })).toBe(false);
        expect(debounceRefreshControls).not.toHaveBeenCalled();
    });

    it('returns false when delete command has no focused drawings', async () => {
        expect(await commandService.executeCommand(DeleteDrawingsCommand.id)).toBe(false);
    });

    it('flips a drawing through the real ui command and persists the final transform state', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createDrawing('drawing-flip')],
        });

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);

        expect(await commandService.executeCommand(FlipSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-flip' }],
            flipH: true,
            flipV: true,
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-flip' })).toMatchObject({
            transform: expect.objectContaining({
                flipX: true,
                flipY: true,
            }),
            sheetTransform: expect.objectContaining({
                flipX: true,
                flipY: true,
            }),
            axisAlignSheetTransform: expect.objectContaining({
                flipX: true,
                flipY: true,
            }),
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-flip' })).toMatchObject({
            transform: expect.objectContaining({
                flipX: true,
                flipY: true,
            }),
        });
    });

    it('groups and ungroups drawings through the real ui commands', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createDrawing('child-1'), createDrawing('child-2')],
        });

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);
        const groupParent = createGroupDrawing('group-1');

        expect(await commandService.executeCommand(GroupSheetDrawingCommand.id, [{
            parent: groupParent,
            children: [
                { ...createDrawing('child-1'), groupId: 'group-1' },
                { ...createDrawing('child-2'), groupId: 'group-1' },
            ],
        }])).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })).toMatchObject({
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
        });
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'child-1' })).toMatchObject({
            groupId: 'group-1',
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'child-2' })).toMatchObject({
            groupId: 'group-1',
        });

        expect(await commandService.executeCommand(UngroupSheetDrawingCommand.id, [{
            parent: groupParent,
            children: [
                { ...createDrawing('child-1'), groupId: undefined },
                { ...createDrawing('child-2'), groupId: undefined },
            ],
        }])).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })).toBeUndefined();
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'child-1' })?.groupId).toBeUndefined();
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'child-2' })?.groupId).toBeUndefined();
    });
});
