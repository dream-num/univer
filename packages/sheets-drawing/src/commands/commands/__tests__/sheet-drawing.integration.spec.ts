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
import type { ISheetDrawing } from '../../../services/sheet-drawing.service';
import { ArrangeTypeEnum, DrawingTypeEnum, ImageSourceType, IUniverInstanceService, UndoCommand } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { CopySheetCommand, RemoveSheetCommand, SetWorksheetActivateCommand } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { ISheetDrawingService } from '../../../services/sheet-drawing.service';
import { InsertSheetDrawingCommand } from '../insert-sheet-drawing.command';
import { RemoveSheetDrawingCommand } from '../remove-sheet-drawing.command';
import { SetDrawingArrangeCommand } from '../set-drawing-arrange.command';
import { SetSheetDrawingCommand } from '../set-sheet-drawing.command';

function createSheetDrawing(drawingId: string, subUnitId = 'sheet1'): ISheetDrawing {
    return {
        unitId: 'test',
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: `https://example.com/${drawingId}.png`,
        sheetTransform: {
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            from: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
            to: { row: 4, rowOffset: 0, column: 3, columnOffset: 0 },
        },
        axisAlignSheetTransform: {
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            from: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
            to: { row: 4, rowOffset: 0, column: 3, columnOffset: 0 },
        },
    };
}

describe('sheet drawing integration', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createSheetsDrawingTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = testBed.commandService;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('inserts and removes a drawing through the real command pipeline', async () => {
        const drawing = createSheetDrawing('drawing-1');

        expect(await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        })).toBe(true);

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toMatchObject({
            drawingId: 'drawing-1',
            subUnitId: 'sheet1',
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toMatchObject({
            drawingId: 'drawing-1',
            subUnitId: 'sheet1',
        });

        expect(await commandService.executeCommand(RemoveSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'drawing-1',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            }],
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toBeUndefined();
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toBeUndefined();
    });

    it('updates drawing data and drawing order through real commands', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createSheetDrawing('drawing-a'), createSheetDrawing('drawing-b')],
        });

        expect(await commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'drawing-a',
                source: 'https://example.com/updated.png',
            }],
        })).toBe(true);

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-a' })).toMatchObject({
            source: 'https://example.com/updated.png',
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-a' })).toMatchObject({
            source: 'https://example.com/updated.png',
        });

        expect(await commandService.executeCommand(SetDrawingArrangeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingIds: ['drawing-a'],
            arrangeType: ArrangeTypeEnum.back,
        })).toBe(true);

        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual(['drawing-a', 'drawing-b']);
        expect(drawingManagerService.getDrawingOrder('test', 'sheet1')).toEqual(['drawing-a', 'drawing-b']);
    });

    it('copies sheet drawings on sheet duplication and restores deleted sheet drawings on undo', async () => {
        await commandService.executeCommand(SetWorksheetActivateCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        });
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createSheetDrawing('drawing-3')],
        });

        expect(commandService.syncExecuteCommand(CopySheetCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        const workbook = get(IUniverInstanceService).getUniverSheetInstance('test')!;
        const copiedSheetId = workbook.getSheets()
            .map((sheet) => sheet.getSheetId())
            .find((sheetId) => sheetId !== 'sheet1' && sheetId !== 'sheet2')!;

        const copiedDrawings = Object.values(get(ISheetDrawingService).getDrawingData('test', copiedSheetId));
        expect(copiedDrawings).toHaveLength(1);
        expect(copiedDrawings[0]).toMatchObject({
            unitId: 'test',
            subUnitId: copiedSheetId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        });

        expect(commandService.syncExecuteCommand(RemoveSheetCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        expect(get(ISheetDrawingService).getDrawingOrder('test', 'sheet1')).toEqual([]);
        expect(get(IDrawingManagerService).getDrawingOrder('test', 'sheet1')).toEqual([]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(get(ISheetDrawingService).getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-3' })).toMatchObject({
            drawingId: 'drawing-3',
        });
        expect(get(IDrawingManagerService).getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-3' })).toMatchObject({
            drawingId: 'drawing-3',
        });
    });
});
