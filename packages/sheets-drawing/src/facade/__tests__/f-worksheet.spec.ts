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

import type {
    Injector,
    Workbook,
} from '@univerjs/core';
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import type { FWorkbook } from '@univerjs/sheets/facade';
import {
    DrawingTypeEnum,
    ICommandService,
    ImageSourceType,
    IUniverInstanceService,
    LocaleType,
    RedoCommand,
    SheetTypes,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SheetSkeletonService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ISheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { transformToAxisAlignPosition } from '../../basics/transform-position';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { SetSheetDrawingCommand } from '../../commands/commands/set-sheet-drawing.command';
import { DrawingApplyType, SetDrawingApplyMutation } from '../../commands/mutations/set-drawing-apply.mutation';
import { resolveSheetDrawingRotateEnabled } from '../../common/rotate-enabled';
import { getSheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';
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
            { ...createDrawing('drawing-1', 350), transform: { left: 350, top: 320, width: 40, height: 30 } },
            { ...createDrawing('drawing-2', 470), transform: { left: 470, top: 350, width: 40, height: 30 } },
        ];
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);

        const groupId = fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1');
        const groupDrawing = sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' });

        expect(groupId).toBe('group-1');
        expect(groupDrawing?.axisAlignSheetTransform).toEqual({
            from: { row: 12, rowOffset: 12, column: 3, columnOffset: 40 },
            to: { row: 15, rowOffset: 0, column: 5, columnOffset: 24 },
        });
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

    it('derives released child markers when ungrouping a moved group, through undo and redo', async () => {
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const skeleton = injector.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const fWorksheet = createFacade(injector);
        const getChild = () => sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })!;

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createDrawing('drawing-1', 10), createDrawing('drawing-2', 80)],
        })).toBe(true);
        expect(fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1')).toBe('group-1');
        const groupTransform = sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1' })!.transform!;
        expect(await commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-1', transform: { ...groupTransform, left: groupTransform.left! + 500, top: groupTransform.top! + 200 } }],
        })).toBe(true);

        expect(fWorksheet.ungroupDrawings(['group-1'])).toBe(true);
        const released = getChild();
        expect(released.transform).toMatchObject({ left: 510, top: 220 });
        expect(released.axisAlignSheetTransform).toEqual(transformToAxisAlignPosition(released.transform!, skeleton));

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(true);
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getChild().axisAlignSheetTransform).toEqual(released.axisAlignSheetTransform);
    });

    it('restores a nested group with its outer group and child types when undoing an ungroup', async () => {
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const fWorksheet = createFacade(injector);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createDrawing('drawing-1', 10), createDrawing('drawing-2', 80), createDrawing('drawing-3', 150)],
        })).toBe(true);
        expect(fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'inner')).toBe('inner');
        expect(fWorksheet.groupDrawings(['inner', 'drawing-3'], 'outer')).toBe('outer');
        expect(fWorksheet.ungroupDrawings(['inner'])).toBe(true);

        const applied: IDrawingGroupUpdateParam[][] = [];
        const listener = commandService.onCommandExecuted(({ id, params }) => {
            if (id === SetDrawingApplyMutation.id && (params as { type: DrawingApplyType }).type === DrawingApplyType.GROUP) {
                applied.push((params as { objects: IDrawingGroupUpdateParam[] }).objects);
            }
        });
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        listener.dispose();

        // The renderer attaches the restored group to `parent.groupId`.
        expect(applied).toHaveLength(1);
        expect(applied[0][0].parent).toMatchObject({ drawingId: 'inner', groupId: 'outer' });
        expect(applied[0][0].children.map((child) => child.drawingType)).toEqual([DrawingTypeEnum.DRAWING_SHAPE, DrawingTypeEnum.DRAWING_SHAPE]);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'inner' })?.groupId).toBe('outer');
        expect(fWorksheet.getDrawingParentGroup('drawing-1')?.drawingId).toBe('inner');
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
        const ensureSkeleton = vi.spyOn(injector.get(SheetSkeletonService), 'ensureSkeleton')
            .mockImplementation(() => {
                throw new Error('SKELETON_MUST_NOT_BE_READ');
            });
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
        const current = fWorksheet.getDrawingPlacement(drawing.drawingId);
        expect(both).toEqual({ ...current, bounds });

        const layout = fWorksheet.getDrawingLayout();
        expect(layout.gridBounds.width).toBeGreaterThan(0);
        expect(layout.gridBounds.height).toBeGreaterThan(0);
        expect(layout.dataBounds.width).toBeGreaterThan(0);
        expect(layout.dataBounds.height).toBeGreaterThan(0);
        expect(layout.drawings).toEqual([
            expect.objectContaining({
                drawingId: drawing.drawingId,
                bounds,
                placement: current,
            }),
        ]);
    });

    it.each([SheetDrawingAnchorType.Position, SheetDrawingAnchorType.Both])(
        'preserves rotated geometry when applying resolved bounds in anchor mode %s',
        (kind) => {
            const fWorksheet = createFacade(injector);
            const commandService = injector.get(ICommandService);
            const drawing = createDrawing('rotated-layout-drawing', 120);
            const bounds = { left: 200, top: 220, width: 160, height: 40 };
            const skeleton = injector.get(SheetSkeletonService).ensureSkeleton(drawing.unitId, drawing.subUnitId)!;
            const transform = { ...bounds, angle: 90 };
            expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
                unitId: drawing.unitId,
                drawings: [{ ...drawing, transform, axisAlignSheetTransform: transformToAxisAlignPosition(transform, skeleton) }],
            })).toBe(true);

            const resolved = fWorksheet.resolveDrawingPlacement({ kind, bounds });
            expect(fWorksheet.setDrawingPlacement(drawing.drawingId, resolved)).toBe(true);
            const saved = injector.get(ISheetDrawingService).getDrawingByParam(drawing)!;
            expect(saved.transform).toMatchObject(transform);
            expect(saved.axisAlignSheetTransform).toEqual(transformToAxisAlignPosition(transform, skeleton));
        }
    );

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

describe('FWorksheetDrawingMixin group drawings on a Chart Sheet', () => {
    it('groups and ungroups absolute drawings without a grid skeleton, through undo and redo', async () => {
        const testBed = createSheetsDrawingTestBed({
            id: 'test',
            name: '',
            appVersion: 'test',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['chart'],
            sheets: { chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART } },
        });
        const { injector, commandService } = testBed;
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const fWorksheet = createFacade(injector, 'chart');
        const drawings = [createDrawing('drawing-1', 10), createDrawing('drawing-2', 80)]
            .map((drawing) => ({ ...drawing, subUnitId: 'chart', anchorType: SheetDrawingAnchorType.None }));
        const getGroup = () => sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'chart', drawingId: 'group-1' });

        expect(injector.get(SheetSkeletonService).ensureSkeleton('test', 'chart')).toBeUndefined();
        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings })).toBe(true);

        expect(fWorksheet.groupDrawings(['drawing-1', 'drawing-2'], 'group-1')).toBe('group-1');
        expect(getGroup()).toMatchObject({
            anchorType: SheetDrawingAnchorType.None,
            transform: { left: 10, top: 20, width: 110, height: 30 },
            axisAlignSheetTransform: {
                from: { row: 0, column: 0, columnOffset: 10, rowOffset: 20 },
                to: { row: 0, column: 0, columnOffset: 120, rowOffset: 50 },
            },
        });
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getGroup()).toBeUndefined();
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(fWorksheet.isDrawingGrouped('drawing-1')).toBe(true);

        expect(fWorksheet.ungroupDrawings(['group-1'])).toBe(true);
        expect(getGroup()).toBeUndefined();
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(fWorksheet.isDrawingGrouped('drawing-2')).toBe(true);
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(fWorksheet.isDrawingGrouped('drawing-2')).toBe(false);

        testBed.univer.dispose();
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

function createFacade(injector: Injector, subUnitId = 'sheet1'): FWorksheetDrawingMixin {
    const workbook = injector.get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getSheetBySheetId(subUnitId)!;
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
