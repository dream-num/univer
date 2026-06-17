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

import type { Injector, Univer, Workbook } from '@univerjs/core';
import type { FWorkbook } from '@univerjs/sheets/facade';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import {
    DrawingTypeEnum,
    ICommandService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { ISheetDrawingService } from '../../services/sheet-drawing.service';
import { FWorksheetDrawingMixin } from '../f-worksheet';

describe('FWorksheetDrawingMixin group drawings', () => {
    let univer: Univer;
    let injector: Injector;

    beforeEach(() => {
        const testBed = createSheetsDrawingTestBed();
        univer = testBed.univer;
        injector = testBed.injector;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('groups drawings and exposes parent and child relationships', () => {
        const drawings = [
            createDrawing('drawing-1', 10),
            createDrawing('drawing-2', 80),
        ];
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);

        const groupId = fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1');

        expect(groupId).toBe('group-1');
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })?.drawingType)
            .toBe(DrawingTypeEnum.DRAWING_GROUP);
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(true);
        expect(fWorksheet.getDrawingParentGroup('drawing-1')?.drawingId).toBe('group-1');
        expect(fWorksheet.getDrawingGroupChildren('group-1').map((drawing: ISheetDrawing) => drawing.drawingId))
            .toEqual(['drawing-1', 'drawing-2']);
    });

    it('does not group unsupported drawing types', () => {
        const drawings = [
            createDrawing('drawing-1', 10),
            createDrawing('chart-1', 80, DrawingTypeEnum.DRAWING_CHART),
        ];
        const commandService = injector.get(ICommandService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);

        const groupId = fWorksheet.groupDrawings(['drawing-1', 'chart-1'], 'group-1');

        expect(groupId).toBeNull();
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(false);
        expect(fWorksheet.isDrawingGrouped('chart-1')).toBe(false);
    });

    it('supports undo and redo for group and ungroup facade operations', async () => {
        const drawings = [
            createDrawing('drawing-1', 10),
            createDrawing('drawing-2', 80),
        ];
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);
        expect(fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1')).toBe('group-1');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })).toBeUndefined();
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(false);

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })?.drawingType)
            .toBe(DrawingTypeEnum.DRAWING_GROUP);
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(true);

        expect(fWorksheet.ungroupDrawings(['group-1'])).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })).toBeUndefined();

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })?.drawingType)
            .toBe(DrawingTypeEnum.DRAWING_GROUP);
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(true);
    });

    it('does not group with duplicate drawing ids or an existing group id', () => {
        const drawings = [
            createDrawing('drawing-1', 10),
            createDrawing('drawing-2', 80),
        ];
        const commandService = injector.get(ICommandService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);

        expect(fWorksheet.groupDrawings(['drawing-1', 'drawing-1'], 'group-1')).toBeNull();
        expect(fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'drawing-1')).toBeNull();
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(false);
        expect(fWorksheet.isDrawingGrouped('drawing-2')).toBe(false);
    });

    it('ungroups drawings and clears parent relationships', () => {
        const drawings = [
            createDrawing('drawing-1', 10),
            createDrawing('drawing-2', 80),
        ];
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);
        expect(fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1')).toBe('group-1');

        expect(fWorksheet.ungroupDrawings(['group-1'])).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })).toBeUndefined();
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(false);
        expect(fWorksheet.isDrawingGrouped('drawing-2')).toBe(false);
    });

    it('returns nested group children when recursive is enabled', () => {
        const drawings = [
            createDrawing('drawing-1', 10),
            createDrawing('drawing-2', 80),
            createDrawing('drawing-3', 150),
        ];
        const commandService = injector.get(ICommandService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);
        expect(fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1')).toBe('group-1');
        expect(fWorksheet.groupDrawings(['group-1', 'drawing-3'], 'group-2')).toBe('group-2');

        expect(fWorksheet.getDrawingGroupChildren('group-2').map((drawing: ISheetDrawing) => drawing.drawingId))
            .toEqual(['drawing-3', 'group-1']);
        const recursiveChildren = fWorksheet.getDrawingGroupChildren('group-2', true).map((drawing: ISheetDrawing) => drawing.drawingId);
        expect(recursiveChildren).toHaveLength(4);
        expect(recursiveChildren).toEqual(expect.arrayContaining(['drawing-1', 'drawing-2', 'drawing-3', 'group-1']));
    });
});

function createFacade(injector: Injector): FWorksheetDrawingMixin {
    const workbook = injector.get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getSheetBySheetId('sheet1')!;
    return injector.createInstance(FWorksheetDrawingMixin, { getId: () => 'test' } as FWorkbook, workbook, worksheet);
}

function createDrawing(drawingId: string, left: number, drawingType = DrawingTypeEnum.DRAWING_SHAPE): ISheetDrawing {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType,
        transform: {
            left,
            top: 20,
            width: 40,
            height: 30,
        },
        sheetTransform: {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 3, column: 3, rowOffset: 0, columnOffset: 0 },
        },
        axisAlignSheetTransform: {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 3, column: 3, rowOffset: 0, columnOffset: 0 },
        },
    };
}
