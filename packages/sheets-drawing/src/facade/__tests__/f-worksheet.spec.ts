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

import type { Injector } from '@univerjs/core';
import type { FWorksheet } from '@univerjs/sheets/facade';
import {
    DrawingTypeEnum,
    ICommandService,
    ImageSourceType,
    IUndoRedoService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { SheetSkeletonService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ISheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { resolveSheetDrawingRotateEnabled } from '../../common/rotate-enabled';
import { getSheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';
import '../f-worksheet';

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

    it('uses non-drawing worksheet APIs before drawing services are registered', () => {
        univer.dispose();
        univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'test',
            sheetOrder: ['sheet1'],
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Sheet1',
                    rowCount: 20,
                    columnCount: 20,
                    cellData: {},
                },
            },
        });

        expect(createFacade(univer.__getInjector()).getSheetName()).toBe('Sheet1');
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
        const groupDrawing = sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' });

        expect(groupId).toBe('group-1');
        expect(groupDrawing?.drawingType).toBe(DrawingTypeEnum.DRAWING_GROUP);
        expect(Object.prototype.hasOwnProperty.call(groupDrawing?.transform ?? {}, 'rotateEnabled')).toBe(false);
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(true);
        expect(fWorksheet.getDrawingParentGroup('drawing-1')?.drawingId).toBe('group-1');
        expect(fWorksheet.getDrawingGroupChildren('group-1').map((drawing: ISheetDrawing) => drawing.drawingId))
            .toEqual(['drawing-1', 'drawing-2']);
    });

    it('groups chart drawings through the facade and disables group rotation', () => {
        const drawings = [
            createDrawing('drawing-1', 10),
            createDrawing('chart-1', 80, DrawingTypeEnum.DRAWING_CHART),
        ];
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);

        const groupId = fWorksheet.groupDrawings(['drawing-1', 'chart-1'], 'group-1');
        const groupDrawing = sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' });

        expect(groupId).toBe('group-1');
        expect(groupDrawing?.drawingType).toBe(DrawingTypeEnum.DRAWING_GROUP);
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(true);
        expect(fWorksheet.isDrawingGrouped('chart-1')).toBe(true);
        expect(fWorksheet.getDrawingGroupChildren('group-1').map((drawing: ISheetDrawing) => drawing.drawingId).sort())
            .toEqual(['chart-1', 'drawing-1']);
        expect(resolveSheetDrawingRotateEnabled(groupDrawing!, sheetDrawingService)).toBe(false);
    });

    it('creates an owner-anchored group readable by placement and layout through history and snapshot recovery', async () => {
        const api = FUniver.newAPI(univer);
        const initial = api.getWorkbook('test')!.save();
        initial.sheets.sheet1.defaultColumnWidth = 50;
        initial.sheets.sheet1.defaultRowHeight = 20;
        initial.sheets.sheet1.rowHeader = { width: 40 };
        initial.sheets.sheet1.columnHeader = { height: 20 };
        initial.sheets.sheet2.defaultColumnWidth = 100;
        initial.sheets.sheet2.defaultRowHeight = 40;
        initial.sheets.sheet2.rowHeader = { width: 40 };
        initial.sheets.sheet2.columnHeader = { height: 20 };
        expect(api.disposeUnit('test')).toBe(true);
        const workbook = api.createWorkbook(initial);
        injector.get(IUniverInstanceService).focusUnit('test');
        workbook.setActiveSheet('sheet2');
        expect(workbook.getActiveSheet().getSheetId()).toBe('sheet2');
        const sheet = workbook.getSheetBySheetId('sheet1')!;
        const commands = injector.get(ICommandService);
        const history = injector.get(IUndoRedoService);
        const children = [createDrawing('drawing-1', 120), createDrawing('drawing-2', 190)]
            .map((drawing) => ({
                ...drawing,
                anchorType: SheetDrawingAnchorType.None,
                transform: { ...drawing.transform, top: 80 },
            }));
        expect(commands.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: children })).toBe(true);
        const before = history.getUndoRedoStatus('test');
        expect(sheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1')).toBe('group-1');
        const placement: ISheetDrawingPlacement = {
            kind: SheetDrawingAnchorType.Position,
            from: { row: 3, column: 1, rowOffset: 0, columnOffset: 30 },
            width: 110,
            height: 30,
        };
        expect(sheet.getDrawingPlacement('group-1')).toEqual(placement);
        expect(sheet.getDrawingLayout().drawings.find((drawing) => drawing.drawingId === 'group-1'))
            .toMatchObject({ bounds: { left: 120, top: 80, width: 110, height: 30 }, placement });
        expect(history.getUndoRedoStatus('test')).toEqual({ undos: before.undos + 1, redos: 0 });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheet.getDrawingPlacement('group-1')).toBeNull();
        expect(sheet.getDrawingGroupChildren('group-1')).toEqual([]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(sheet.getDrawingPlacement('group-1')).toEqual(placement);
        const saved = JSON.parse(JSON.stringify(workbook.save()));
        expect(api.disposeUnit('test')).toBe(true);
        const reopened = api.createWorkbook(saved).getSheetBySheetId('sheet1')!;
        expect(reopened.getDrawingPlacement('group-1')).toEqual(placement);
        expect(reopened.getDrawingLayout().drawings.find((drawing) => drawing.drawingId === 'group-1')?.bounds)
            .toEqual({ left: 120, top: 80, width: 110, height: 30 });
        expect(reopened.getDrawingGroupChildren('group-1').map((drawing) => drawing.drawingId).sort())
            .toEqual(['drawing-1', 'drawing-2']);
        expect(reopened.ungroupDrawings(['group-1'])).toBe(true);
        expect(reopened.getDrawingLayout().drawings.map(({ drawingId, bounds }) => ({ drawingId, bounds }))
            .sort((first, second) => first.drawingId.localeCompare(second.drawingId)))
            .toEqual([
                { drawingId: 'drawing-1', bounds: { left: 120, top: 80, width: 40, height: 30 } },
                { drawingId: 'drawing-2', bounds: { left: 190, top: 80, width: 40, height: 30 } },
            ]);
    });

    it('keeps a group anchored to the same column when created at a different zoom', () => {
        const sheet = createFacade(injector);
        const commands = injector.get(ICommandService);
        const skeleton = injector.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const children = [createDrawing('drawing-1', 120), createDrawing('drawing-2', 190)]
            .map((drawing) => ({ ...drawing, anchorType: SheetDrawingAnchorType.None }));
        expect(commands.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: children })).toBe(true);

        expect(sheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-at-default-zoom')).toBe('group-at-default-zoom');
        const placement = sheet.getDrawingPlacement('group-at-default-zoom');
        const bounds = sheet.getDrawingLayout().drawings.find((drawing) => drawing.drawingId === 'group-at-default-zoom')!.bounds;
        expect(sheet.ungroupDrawings(['group-at-default-zoom'])).toBe(true);

        skeleton.setScale(0.75);
        expect(sheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-at-75-percent')).toBe('group-at-75-percent');

        sheet.insertColumnsBefore(1, 1);
        expect(sheet.getDrawingLayout().drawings.find((drawing) => drawing.drawingId === 'group-at-75-percent')?.bounds)
            .toEqual(bounds);
        expect(sheet.getDrawingPlacement('group-at-75-percent')).toEqual(placement);
    });

    it('preserves absolute group scaling and child geometry through ungroup, Undo and snapshot recovery', async () => {
        const api = FUniver.newAPI(univer);
        const workbook = api.getWorkbook('test')!;
        const sheet = workbook.getSheetBySheetId('sheet1')!;
        const commands = injector.get(ICommandService);
        const children = [createDrawing('drawing-1', 10), createDrawing('drawing-2', 80)]
            .map((drawing) => ({ ...drawing, anchorType: SheetDrawingAnchorType.None }));
        expect(commands.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: children })).toBe(true);
        expect(sheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1')).toBe('group-1');
        const original = sheet.getDrawingPlacement('group-1');
        const moved: ISheetDrawingPlacement = { kind: SheetDrawingAnchorType.None, left: 500, top: 90, width: 220, height: 60 };
        expect(sheet.setDrawingPlacement('group-1', moved)).toBe(true);
        expect(sheet.getDrawingPlacement('group-1')).toEqual(moved);
        expect(sheet.ungroupDrawings(['group-1'])).toBe(true);
        const scaled = [
            { drawingId: 'drawing-1', bounds: { left: 500, top: 90, width: 80, height: 60 } },
            { drawingId: 'drawing-2', bounds: { left: 640, top: 90, width: 80, height: 60 } },
        ];
        expect(sheet.getDrawingLayout().drawings.map(({ drawingId, bounds }) => ({ drawingId, bounds }))
            .sort((first, second) => first.drawingId.localeCompare(second.drawingId))).toEqual(scaled);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheet.getDrawingPlacement('group-1')).toEqual(moved);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheet.getDrawingPlacement('group-1')).toEqual(original);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(sheet.getDrawingPlacement('group-1')).toEqual(moved);
        const saved = JSON.parse(JSON.stringify(workbook.save()));
        expect(api.disposeUnit('test')).toBe(true);
        const reopened = api.createWorkbook(saved).getSheetBySheetId('sheet1')!;
        expect(reopened.getDrawingPlacement('group-1')).toEqual(moved);
        expect(reopened.ungroupDrawings(['group-1'])).toBe(true);
        expect(reopened.getDrawingLayout().drawings.map(({ drawingId, bounds }) => ({ drawingId, bounds }))
            .sort((first, second) => first.drawingId.localeCompare(second.drawingId))).toEqual(scaled);
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

    it('inserts, reads, updates, and deletes over-grid images through the worksheet facade', async () => {
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const fWorksheet = createFacade(injector);
        const image = await fWorksheet.newOverGridImage()
            .setSource('https://example.com/image.png', ImageSourceType.URL)
            .setColumn(2)
            .setRow(3)
            .setColumnOffset(4)
            .setRowOffset(5)
            .setWidth(120)
            .setHeight(80)
            .setCropTop(1)
            .setCropLeft(2)
            .setCropBottom(3)
            .setCropRight(4)
            .setRotate(15)
            .buildAsync();

        expect(fWorksheet.insertImages([image])).toBe(fWorksheet);

        const images = fWorksheet.getImages();
        expect(images).toHaveLength(1);
        expect(images[0].getId()).toBe(image.drawingId);
        expect(fWorksheet.getImageById(image.drawingId)?.toBuilder().getSource()).toBe('https://example.com/image.png');

        const updatedImage = {
            ...image,
            source: 'https://example.com/updated.png',
        };
        expect(fWorksheet.updateImages([updatedImage])).toBe(fWorksheet);
        expect((sheetDrawingService.getDrawingByParam({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: image.drawingId,
        }) as { source: string }).source).toBe('https://example.com/updated.png');

        expect(fWorksheet.deleteImages(images)).toBe(fWorksheet);
        expect(fWorksheet.getImageById(image.drawingId)).toBeNull();
        expect(fWorksheet.getImages()).toEqual([]);
    });

    it('builds and round-trips an Absolute image placement without a Sheet skeleton', async () => {
        const fWorksheet = createFacade(injector);
        const ensureSkeleton = vi.spyOn(injector.get(SheetSkeletonService), 'ensureSkeleton');
        const placement: ISheetDrawingPlacement = {
            kind: SheetDrawingAnchorType.None,
            left: 640,
            top: 96,
            width: 320,
            height: 180,
        };

        const image = await fWorksheet.newOverGridImage()
            .setSource('https://example.com/absolute.png', ImageSourceType.URL)
            .setPlacement(placement)
            .buildAsync();

        expect(ensureSkeleton).not.toHaveBeenCalled();
        expect(image.transform).toEqual(expect.objectContaining({
            left: placement.left,
            top: placement.top,
            width: placement.width,
            height: placement.height,
        }));

        fWorksheet.insertImages([image]);
        expect(fWorksheet.getDrawingPlacement(image.drawingId)).toEqual(placement);
        expect(fWorksheet.getImageById(image.drawingId)?.getPlacement()).toEqual(placement);

        const moved: ISheetDrawingPlacement = {
            ...placement,
            left: 720,
            top: 128,
        };
        expect(fWorksheet.setDrawingPlacement(image.drawingId, moved)).toBe(true);
        expect(fWorksheet.getDrawingPlacement(image.drawingId)).toEqual(moved);
    });

    it('infers Position and Both markers from model bounds and returns the headless host layout', () => {
        const fWorksheet = createFacade(injector);
        const commandService = injector.get(ICommandService);
        const drawing = createDrawing('layout-drawing', 120);
        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        })).toBe(true);

        const bounds = { left: 120, top: 80, width: 320, height: 160 };
        const position = fWorksheet.resolveDrawingPlacement({
            kind: SheetDrawingAnchorType.Position,
            bounds,
        });
        const both = fWorksheet.resolveDrawingPlacement({
            kind: SheetDrawingAnchorType.Both,
            bounds,
        });

        expect(position).toEqual(expect.objectContaining({
            kind: SheetDrawingAnchorType.Position,
            width: bounds.width,
            height: bounds.height,
        }));
        expect(position).toHaveProperty('from');
        expect(both).toEqual(expect.objectContaining({
            kind: SheetDrawingAnchorType.Both,
        }));
        expect(both).toHaveProperty('from');
        expect(both).toHaveProperty('to');

        expect(fWorksheet.setDrawingPlacement(drawing.drawingId, {
            kind: SheetDrawingAnchorType.Both,
            bounds,
        })).toBe(true);
        expect(fWorksheet.getDrawingPlacement(drawing.drawingId)).toEqual(both);

        const layout = fWorksheet.getDrawingLayout();
        expect(layout.gridBounds.width).toBeGreaterThan(0);
        expect(layout.gridBounds.height).toBeGreaterThan(0);
        expect(layout.dataBounds.width).toBeGreaterThan(0);
        expect(layout.dataBounds.height).toBeGreaterThan(0);
        expect(layout.drawings).toEqual([
            expect.objectContaining({
                drawingId: drawing.drawingId,
                bounds,
                placement: both,
            }),
        ]);
    });

    it('rejects invalid bounds and reversed TwoCell markers without mutating the drawing', () => {
        const fWorksheet = createFacade(injector);
        const commandService = injector.get(ICommandService);
        const drawing = createDrawing('validated-drawing', 120);
        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        })).toBe(true);

        expect(() => fWorksheet.setDrawingPlacement(drawing.drawingId, {
            kind: SheetDrawingAnchorType.Position,
            bounds: { left: 120, top: 80, width: -1, height: 160 },
        })).toThrow('SHEET_DRAWING_PLACEMENT_EXTENT_INVALID');
        expect(() => fWorksheet.setDrawingPlacement(drawing.drawingId, {
            kind: SheetDrawingAnchorType.Both,
            from: { row: 8, column: 6, rowOffset: 0, columnOffset: 0 },
            to: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 },
        })).toThrow('SHEET_DRAWING_PLACEMENT_EXTENT_INVALID');
        expect(fWorksheet.getDrawingPlacement(drawing.drawingId)).toEqual(getSheetDrawingPlacement(drawing));
    });

    it('returns only images from sheet drawing data and exposes active images from the drawing selection', () => {
        const commandService = injector.get(ICommandService);
        const fWorksheet = createFacade(injector);
        const image = createDrawing('image-1', 10, DrawingTypeEnum.DRAWING_IMAGE);
        const shape = createDrawing('shape-1', 80, DrawingTypeEnum.DRAWING_SHAPE);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [image, shape] })).toBe(true);
        expect(fWorksheet.getImages().map((drawing) => drawing.getId())).toEqual(['image-1']);

        injector.get(ISheetDrawingService).focusDrawing([{
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'image-1',
        }]);

        expect(fWorksheet.getActiveImages().map((drawing) => drawing.getId())).toEqual(['image-1']);
    });

    it('keeps grouping APIs inert when requested drawings or groups do not exist', () => {
        const commandService = injector.get(ICommandService);
        const fWorksheet = createFacade(injector);
        const image = createDrawing('drawing-1', 10);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [image] })).toBe(true);

        expect(fWorksheet.groupDrawings(['drawing-1', 'missing-drawing'], 'group-1')).toBeNull();
        expect(fWorksheet.ungroupDrawings(['missing-group'])).toBe(false);
        expect(fWorksheet.getDrawingGroupChildren('missing-group', true)).toEqual([]);
        expect(fWorksheet.getDrawingParentGroup('drawing-1')).toBeNull();
    });
});

describe('FWorksheetDrawingMixin background image', () => {
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

    it('sets, returns, and deletes the worksheet background image', () => {
        const fWorksheet = createFacade(injector);

        expect(fWorksheet.getBackgroundImage()).toBeNull();
        expect(fWorksheet.setBackgroundImage('https://example.com/background.png')).toBe(fWorksheet);
        expect(fWorksheet.getBackgroundImage()).toEqual({
            source: 'https://example.com/background.png',
            imageSourceType: ImageSourceType.URL,
        });
        expect(fWorksheet.deleteBackgroundImage()).toBe(fWorksheet);
        expect(fWorksheet.getBackgroundImage()).toBeNull();
    });
});

function createFacade(injector: Injector): FWorksheet {
    return FUniver.newAPI(injector).getWorkbook('test')!.getSheetBySheetId('sheet1')!;
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
