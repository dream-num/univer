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

import type { IWorkbookData } from '@univerjs/core';
import type { IDrawingSubunitMap } from '@univerjs/drawing';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import type { Subscription } from 'rxjs';
import { DrawingTypeEnum, ILogService, ImageSourceType, IUndoRedoService, LocaleType, LogLevel, Tools, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { IDrawingManagerService } from '@univerjs/drawing';
import { CanvasColorService, ICanvasColorService, IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesCommand, SetWorksheetRowAutoHeightMutation, SheetSkeletonService } from '@univerjs/sheets';
import {
    ISheetDrawingService,
    resolveSheetDrawingRotateEnabled,
    SetDrawingApplyMutation,
    SetSheetDrawingCommand,
    SHEET_DRAWING_PLUGIN,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetsDrawingRenderController } from '../sheet-drawing.render-controller';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-drawing/facade';

const OWNER_UNIT_ID = 'drawing-owner';
const OTHER_UNIT_ID = 'drawing-other-owner';
const TIMELINE_ID = 'shared-timeline';

const SHEET_1_POSITION = {
    from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
    to: { row: 3, column: 3, rowOffset: 0, columnOffset: 0 },
};

function createDrawingResource(data: IDrawingSubunitMap<ISheetDrawing>) {
    return [{ name: SHEET_DRAWING_PLUGIN, data: JSON.stringify(data) }];
}

function createWorkbookData(id: string, resources: IWorkbookData['resources']): IWorkbookData {
    return {
        id,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: id,
        sheetOrder: ['sheet-1', 'sheet-2'],
        styles: {},
        resources,
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet 1',
                rowCount: 20,
                columnCount: 20,
                defaultColumnWidth: 80,
                defaultRowHeight: 20,
                rowHeader: { width: 46 },
                columnHeader: { height: 20 },
                cellData: {},
            },
            'sheet-2': {
                id: 'sheet-2',
                name: 'Sheet 2',
                rowCount: 20,
                columnCount: 20,
                defaultColumnWidth: 50,
                defaultRowHeight: 25,
                rowHeader: { width: 30 },
                columnHeader: { height: 10 },
                cellData: {},
            },
        },
    };
}

function createOwnerDrawingData(): IDrawingSubunitMap<ISheetDrawing> {
    return {
        'sheet-1': {
            data: {
                [TIMELINE_ID]: {
                    unitId: OWNER_UNIT_ID,
                    subUnitId: 'sheet-1',
                    drawingId: TIMELINE_ID,
                    drawingType: DrawingTypeEnum.DRAWING_TIMELINE,
                    slicerViewId: 'timeline-view',
                    anchorType: SheetDrawingAnchorType.Both,
                    sheetTransform: {
                        ...SHEET_1_POSITION,
                        angle: 17,
                        flipX: true,
                        flipY: false,
                        skewX: 3,
                        skewY: -2,
                    },
                    axisAlignSheetTransform: SHEET_1_POSITION,
                    transform: {
                        left: 900,
                        top: 901,
                        width: 902,
                        height: 903,
                        angle: 91,
                        rotateEnabled: false,
                    },
                },
                'group-1': {
                    unitId: OWNER_UNIT_ID,
                    subUnitId: 'sheet-1',
                    drawingId: 'group-1',
                    drawingType: DrawingTypeEnum.DRAWING_GROUP,
                    anchorType: SheetDrawingAnchorType.Both,
                    sheetTransform: SHEET_1_POSITION,
                    axisAlignSheetTransform: SHEET_1_POSITION,
                    transform: { left: 700, top: 701, width: 702, height: 703 },
                },
                'group-child': {
                    unitId: OWNER_UNIT_ID,
                    subUnitId: 'sheet-1',
                    drawingId: 'group-child',
                    drawingType: DrawingTypeEnum.DRAWING_SHAPE,
                    groupId: 'group-1',
                    anchorType: SheetDrawingAnchorType.Both,
                    sheetTransform: SHEET_1_POSITION,
                    axisAlignSheetTransform: SHEET_1_POSITION,
                    transform: { left: 11, top: 12, width: 13, height: 14 },
                },
                absolute: {
                    unitId: OWNER_UNIT_ID,
                    subUnitId: 'sheet-1',
                    drawingId: 'absolute',
                    drawingType: DrawingTypeEnum.DRAWING_SHAPE,
                    anchorType: SheetDrawingAnchorType.None,
                    sheetTransform: SHEET_1_POSITION,
                    axisAlignSheetTransform: SHEET_1_POSITION,
                    transform: { left: 21, top: 22, width: 23, height: 24 },
                },
            },
            order: [TIMELINE_ID, 'group-1', 'group-child', 'absolute'],
        },
        'sheet-2': {
            data: {
                [TIMELINE_ID]: {
                    unitId: OWNER_UNIT_ID,
                    subUnitId: 'sheet-2',
                    drawingId: TIMELINE_ID,
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                    imageSourceType: ImageSourceType.URL,
                    source: 'https://example.com/sheet-2.png',
                    anchorType: SheetDrawingAnchorType.Position,
                    sheetTransform: {
                        from: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 },
                        to: { row: 4, column: 4, rowOffset: 0, columnOffset: 0 },
                    },
                    axisAlignSheetTransform: SHEET_1_POSITION,
                    transform: { left: 800, top: 801, width: 802, height: 803 },
                },
            },
            order: [TIMELINE_ID],
        },
        'missing-sheet': {
            data: {
                'missing-skeleton': {
                    unitId: OWNER_UNIT_ID,
                    subUnitId: 'missing-sheet',
                    drawingId: 'missing-skeleton',
                    drawingType: DrawingTypeEnum.DRAWING_SHAPE,
                    anchorType: SheetDrawingAnchorType.Both,
                    sheetTransform: SHEET_1_POSITION,
                    axisAlignSheetTransform: SHEET_1_POSITION,
                    transform: { left: 31, top: 32, width: 33, height: 34 },
                },
            },
            order: ['missing-skeleton'],
        },
    };
}

function createOtherOwnerDrawingData(): IDrawingSubunitMap<ISheetDrawing> {
    return {
        'sheet-1': {
            data: {
                [TIMELINE_ID]: {
                    unitId: OTHER_UNIT_ID,
                    subUnitId: 'sheet-1',
                    drawingId: TIMELINE_ID,
                    drawingType: DrawingTypeEnum.DRAWING_TIMELINE,
                    slicerViewId: 'other-timeline-view',
                    anchorType: SheetDrawingAnchorType.Both,
                    sheetTransform: SHEET_1_POSITION,
                    axisAlignSheetTransform: SHEET_1_POSITION,
                    transform: {
                        left: 41,
                        top: 42,
                        width: 43,
                        height: 44,
                        rotateEnabled: false,
                    },
                },
            },
            order: [TIMELINE_ID],
        },
    };
}

describe('SheetsDrawingRenderController', () => {
    it('rehydrates cell anchors through real models without losing drawing capabilities or history', () => {
        const contextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        const bed = createSheetsDrawingUiTestBed(
            createWorkbookData(OWNER_UNIT_ID, createDrawingResource(createOwnerDrawingData())),
            [[ICanvasColorService, { useClass: CanvasColorService }]]
        );
        const independent = bed.univer.createUnit(
            UniverInstanceType.UNIVER_SHEET,
            createWorkbookData(OTHER_UNIT_ID, createDrawingResource(createOtherOwnerDrawingData()))
        );
        const renderManager = bed.get(IRenderManagerService);
        const moduleRegistration = renderManager.registerRenderModule(
            UniverInstanceType.UNIVER_SHEET,
            [SheetsDrawingRenderController]
        );
        const sheetDrawingService = bed.get(ISheetDrawingService);
        const drawingManagerService = bed.get(IDrawingManagerService);
        const history = bed.get(IUndoRedoService);
        const skeletonService = bed.get(SheetSkeletonService);
        const hydrationMutations: Array<{ subUnitId: string; objects: unknown; onlyLocal: boolean | undefined }> = [];
        const commandSubscription = bed.commandService.onCommandExecuted((command, options) => {
            if (command.id === SetDrawingApplyMutation.id) {
                const params = command.params as { subUnitId: string; objects: unknown };
                hydrationMutations.push({ subUnitId: params.subUnitId, objects: params.objects, onlyLocal: options?.onlyLocal });
            }
        });
        const ownerHistoryBefore = history.getUndoRedoStatus(OWNER_UNIT_ID);
        const otherHistoryBefore = history.getUndoRedoStatus(OTHER_UNIT_ID);
        const otherBefore = Tools.deepClone(sheetDrawingService.getDrawingByParam({
            unitId: OTHER_UNIT_ID,
            subUnitId: 'sheet-1',
            drawingId: TIMELINE_ID,
        }));

        try {
            expect(skeletonService.getSkeletonParam(OWNER_UNIT_ID, 'sheet-1')).toBeDefined();
            expect(skeletonService.getSkeletonParam(OWNER_UNIT_ID, 'missing-sheet')).toBeUndefined();

            const render = renderManager.createRender(OWNER_UNIT_ID);
            expect(render.with(SheetsDrawingRenderController)).toBeInstanceOf(SheetsDrawingRenderController);

            const restoredTimeline = sheetDrawingService.getDrawingByParam({
                unitId: OWNER_UNIT_ID,
                subUnitId: 'sheet-1',
                drawingId: TIMELINE_ID,
            })!;
            expect(restoredTimeline).toEqual({
                unitId: OWNER_UNIT_ID,
                subUnitId: 'sheet-1',
                drawingId: TIMELINE_ID,
                drawingType: DrawingTypeEnum.DRAWING_TIMELINE,
                slicerViewId: 'timeline-view',
                anchorType: SheetDrawingAnchorType.Both,
                sheetTransform: {
                    ...SHEET_1_POSITION,
                    angle: 17,
                    flipX: true,
                    flipY: false,
                    skewX: 3,
                    skewY: -2,
                },
                axisAlignSheetTransform: SHEET_1_POSITION,
                transform: {
                    left: 126,
                    top: 40,
                    width: 160,
                    height: 40,
                    angle: 17,
                    flipX: true,
                    flipY: false,
                    skewX: 3,
                    skewY: -2,
                    rotateEnabled: false,
                },
            });
            expect(drawingManagerService.getDrawingByParam(restoredTimeline)).toEqual(restoredTimeline);
            expect(resolveSheetDrawingRotateEnabled(restoredTimeline, sheetDrawingService)).toBe(false);

            expect(sheetDrawingService.getDrawingByParam({
                unitId: OWNER_UNIT_ID,
                subUnitId: 'sheet-1',
                drawingId: 'group-1',
            })?.transform).toEqual({
                left: 80,
                top: 20,
                width: 160,
                height: 40,
                angle: 0,
                flipX: false,
                flipY: false,
                skewX: 0,
                skewY: 0,
            });
            expect(sheetDrawingService.getDrawingByParam({
                unitId: OWNER_UNIT_ID,
                subUnitId: 'sheet-1',
                drawingId: 'group-child',
            })?.transform).toEqual({ left: 11, top: 12, width: 13, height: 14 });
            expect(sheetDrawingService.getDrawingByParam({
                unitId: OWNER_UNIT_ID,
                subUnitId: 'sheet-1',
                drawingId: 'absolute',
            })?.transform).toEqual({ left: 21, top: 22, width: 23, height: 24 });
            expect(sheetDrawingService.getDrawingByParam({
                unitId: OWNER_UNIT_ID,
                subUnitId: 'missing-sheet',
                drawingId: 'missing-skeleton',
            })?.transform).toEqual({ left: 31, top: 32, width: 33, height: 34 });
            expect(sheetDrawingService.getDrawingByParam({
                unitId: OWNER_UNIT_ID,
                subUnitId: 'sheet-2',
                drawingId: TIMELINE_ID,
            })?.transform).toEqual({
                left: 130,
                top: 60,
                width: 802,
                height: 803,
            });

            expect(hydrationMutations).toEqual([
                {
                    subUnitId: 'sheet-1',
                    objects: [
                        { unitId: OWNER_UNIT_ID, subUnitId: 'sheet-1', drawingId: TIMELINE_ID },
                        { unitId: OWNER_UNIT_ID, subUnitId: 'sheet-1', drawingId: 'group-1' },
                    ],
                    onlyLocal: true,
                },
                {
                    subUnitId: 'sheet-2',
                    objects: [{ unitId: OWNER_UNIT_ID, subUnitId: 'sheet-2', drawingId: TIMELINE_ID }],
                    onlyLocal: true,
                },
            ]);
            renderManager.createRender(OWNER_UNIT_ID);
            expect(hydrationMutations).toHaveLength(2);
            expect(history.getUndoRedoStatus(OWNER_UNIT_ID)).toEqual(ownerHistoryBefore);
            expect(history.getUndoRedoStatus(OTHER_UNIT_ID)).toEqual(otherHistoryBefore);
            expect(sheetDrawingService.getDrawingByParam({
                unitId: OTHER_UNIT_ID,
                subUnitId: 'sheet-1',
                drawingId: TIMELINE_ID,
            })).toEqual(otherBefore);
            expect(drawingManagerService.getDrawingByParam({
                unitId: OTHER_UNIT_ID,
                subUnitId: 'sheet-1',
                drawingId: TIMELINE_ID,
            })).toEqual(otherBefore);

            expect(bed.commandService.syncExecuteCommand(SetSheetDrawingCommand.id, {
                unitId: OWNER_UNIT_ID,
                drawings: [{
                    unitId: OWNER_UNIT_ID,
                    subUnitId: 'sheet-1',
                    drawingId: TIMELINE_ID,
                    drawingType: DrawingTypeEnum.DRAWING_TIMELINE,
                    transform: { angle: 90 },
                }],
            })).toBe(true);
            expect(sheetDrawingService.getDrawingByParam(restoredTimeline)?.transform?.angle).toBe(17);
            expect(drawingManagerService.getDrawingByParam(restoredTimeline)?.transform?.angle).toBe(17);
        } finally {
            contextSpy.mockRestore();
            commandSubscription.dispose();
            moduleRegistration.dispose();
            independent.dispose();
            bed.univer.dispose();
        }
    });
});

describe('SheetsDrawingRenderController issue 5842', () => {
    it('loads issue 5842 data, initializes healthy images, and preserves edits across save and reload', async () => {
        const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
            { setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D
        );
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const source = createSheetsDrawingUiTestBed();
        let restored: ReturnType<typeof createSheetsDrawingUiTestBed> | undefined;
        let reloaded: ReturnType<typeof createSheetsDrawingUiTestBed> | undefined;
        try {
            const snapshot = FUniver.newAPI(source.univer).getActiveWorkbook()!.save();
            snapshot.sheets.sheet1.rowCount = 300;
            const from = { column: 3, columnOffset: 0, row: 198, rowOffset: -4460 };
            const to = { column: 4, columnOffset: 60.3, row: -2, rowOffset: 0 };
            const broken: ISheetDrawing = {
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'broken-image',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                anchorType: SheetDrawingAnchorType.Position,
                transform: { left: 300, top: -4243, width: 180.3, height: -4243, angle: 0 },
                sheetTransform: { from, to, angle: 0 },
                axisAlignSheetTransform: { from, to, angle: 0 },
            };
            const healthy: ISheetDrawing = {
                ...broken,
                drawingId: 'healthy-image',
                transform: { left: 999, top: 999, width: 120, height: 80, angle: 0 },
                sheetTransform: {
                    from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                    to: { row: 4, column: 2, rowOffset: 8, columnOffset: 20 },
                    angle: 0,
                },
            };
            snapshot.resources = (snapshot.resources ?? []).filter((resource) => resource.name !== SHEET_DRAWING_PLUGIN);
            snapshot.resources.push({ name: SHEET_DRAWING_PLUGIN, data: JSON.stringify({
                sheet1: {
                    data: { [broken.drawingId]: broken, [healthy.drawingId]: healthy },
                    order: [broken.drawingId, healthy.drawingId],
                },
            }) });
            restored = createSheetsDrawingUiTestBed(snapshot, [[ICanvasColorService, { useClass: CanvasColorService }]]);
            restored.get(ILogService).setLogLevel(LogLevel.WARN);
            const skeleton = restored.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
            const manager = restored.get(IRenderManagerService);
            manager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetsDrawingRenderController]);
            expect(() => manager.createRender('test').with(SheetsDrawingRenderController)).not.toThrow();
            expect(warning).toHaveBeenCalledWith(expect.stringContaining('[SheetsDrawingRenderController]'), expect.any(String), expect.objectContaining({
                drawingId: broken.drawingId,
                error: expect.any(Error),
            }));
            const drawings = restored.get(ISheetDrawingService);
            const renderDrawings = restored.get(IDrawingManagerService);
            expect(drawings.getDrawingByParam(broken)).toEqual(broken);
            expect(renderDrawings.getDrawingByParam(broken)).toEqual(broken);
            const cell = skeleton.getNoMergeCellWithCoordByIndex(1, 1);
            expect(drawings.getDrawingByParam(healthy)?.transform).toMatchObject({
                left: cell.startX,
                top: cell.startY,
                width: 120,
                height: 80,
            });
            expect(renderDrawings.getDrawingByParam(healthy)).toEqual(drawings.getDrawingByParam(healthy));
            expect(restored.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                rowsAutoHeightInfo: [{ row: 80, autoHeight: 40 }],
            })).toBe(true);
            await Promise.resolve();
            expect(await restored.commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 80, endRow: 80, startColumn: 0, endColumn: 0 },
                value: { v: 'edited after replay' },
            })).toBe(true);
            reloaded = createSheetsDrawingUiTestBed(FUniver.newAPI(restored.univer).getActiveWorkbook()!.save(), [
                [ICanvasColorService, { useClass: CanvasColorService }],
            ]);
            reloaded.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
            const reloadedManager = reloaded.get(IRenderManagerService);
            reloadedManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetsDrawingRenderController]);
            expect(() => reloadedManager.createRender('test').with(SheetsDrawingRenderController)).not.toThrow();
            expect(reloaded.workbook.getSheetBySheetId('sheet1')!.getCell(80, 0)?.v).toBe('edited after replay');
            expect(reloaded.get(ISheetDrawingService).getDrawingByParam(broken)).toEqual(broken);
            expect(reloaded.get(ISheetDrawingService).getDrawingByParam(healthy)).toEqual(drawings.getDrawingByParam(healthy));
        } finally {
            reloaded?.univer.dispose();
            restored?.univer.dispose();
            source.univer.dispose();
            warning.mockRestore();
            canvasContext.mockRestore();
        }
    });

    it.each([
        ['row', SheetDrawingAnchorType.Position],
        ['column', SheetDrawingAnchorType.Position],
        ['auto height', SheetDrawingAnchorType.Position],
        ['row', undefined],
        ['column', undefined],
        ['auto height', undefined],
        ['collapsed row', SheetDrawingAnchorType.Both],
        ['collapsed column', SheetDrawingAnchorType.Both],
    ] as const)('preserves image anchors and size across %s, save, rendering and show (%s)', async (scenario, anchorType) => {
        const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
            { setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D
        );
        const bed = createSheetsDrawingUiTestBed();
        let restored: ReturnType<typeof createSheetsDrawingUiTestBed> | undefined;
        try {
            const book = FUniver.newAPI(bed.univer).getActiveWorkbook()!;
            const sheet = book.getSheets()[0];
            const builder = sheet.newOverGridImage().setSource('https://example.com/drawing.png').setRow(1).setColumn(1).setWidth(180).setHeight(120).setRowOffset(6).setColumnOffset(12);
            if (anchorType !== undefined) {
                builder.setAnchorType(anchorType);
            }
            const image = await builder.buildAsync();
            sheet.insertImages([image]);
            const service = bed.get(ISheetDrawingService);
            const before = Tools.deepClone(service.getDrawingByParam(image)!);
            const rows = scenario === 'row' || scenario === 'collapsed row';
            const count = anchorType === SheetDrawingAnchorType.Both ? 8 : 1;
            const cell = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!.getNoMergeCellWithCoordByIndex(1, 1);
            if (scenario === 'auto height') {
                const worksheet = bed.workbook.getActiveSheet()!;
                expect(bed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    rowsAutoHeightInfo: [{ row: 2, autoHeight: worksheet.getRowHeight(2) + 30 }],
                })).toBe(true);
            } else if (rows) {
                sheet.hideRows(1, count);
            } else {
                sheet.hideColumns(1, count);
            }
            await Promise.resolve();
            const hidden = Tools.deepClone(service.getDrawingByParam(image)!);
            expect(hidden.sheetTransform.from).toEqual(before.sheetTransform.from);
            if (scenario !== 'auto height') {
                expect(hidden.transform?.[rows ? 'top' : 'left']).toBe(rows ? cell.startY : cell.startX);
            }
            if (anchorType === SheetDrawingAnchorType.Both) {
                expect(hidden.transform?.[rows ? 'height' : 'width']).toBe(0);
            } else {
                expect(hidden.transform).toMatchObject({ width: 180, height: 120 });
            }
            restored = createSheetsDrawingUiTestBed(book.save(), [[ICanvasColorService, { useClass: CanvasColorService }]]);
            restored.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
            const manager = restored.get(IRenderManagerService);
            manager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetsDrawingRenderController]);
            manager.createRender('test').with(SheetsDrawingRenderController);
            const restoredService = restored.get(ISheetDrawingService);
            expect(restoredService.getDrawingByParam(image)).toEqual(hidden);
            const restoredSheet = FUniver.newAPI(restored.univer).getActiveWorkbook()!.getSheets()[0];
            if (scenario === 'auto height') {
                expect(restoredService.getDrawingByParam(image)!.transform).toEqual(before.transform);
            } else {
                if (rows) {
                    restoredSheet.showRows(1, count);
                } else {
                    restoredSheet.showColumns(1, count);
                }
                await Promise.resolve();
                expect(restoredService.getDrawingByParam(image)).toEqual(before);
            }
            expect(restored.get(IDrawingManagerService).getDrawingByParam(image))
                .toEqual(restoredService.getDrawingByParam(image));
        } finally {
            restored?.univer.dispose();
            bed.univer.dispose();
            canvasContext.mockRestore();
        }
    });

    it('renders legacy cell anchors while preserving explicit absolute and group-local bounds', () => {
        const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
            { setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D
        );
        const bed = createSheetsDrawingUiTestBed({
            id: 'unit-1',
            name: 'Book',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: {
                'sheet-1': {
                    id: 'sheet-1',
                    name: 'Sheet1',
                    rowCount: 20,
                    columnCount: 20,
                    defaultRowHeight: 36,
                    defaultColumnWidth: 12,
                    cellData: {},
                },
            },
        }, [[ICanvasColorService, { useClass: CanvasColorService }]]);
        const subscriptions: Subscription[] = [];
        try {
            const sheetTransform = {
                from: { row: 1, column: 2, rowOffset: 0, columnOffset: 0 },
                to: { row: 3, column: 4, rowOffset: 0, columnOffset: 0 },
            };
            const legacy: Partial<ISheetDrawing> = {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'legacy-anchor',
                drawingType: DrawingTypeEnum.DRAWING_DOM,
                sheetTransform,
                transform: { left: 1000, top: 2000, width: 24, height: 72 },
            };
            const missingSkeleton: Partial<ISheetDrawing> = {
                unitId: 'unit-1',
                subUnitId: 'missing-sheet',
                drawingId: 'missing-skeleton',
                anchorType: SheetDrawingAnchorType.Both,
                sheetTransform,
            };
            const grouped: Partial<ISheetDrawing> = {
                ...legacy,
                drawingId: 'grouped',
                groupId: 'group-1',
                anchorType: SheetDrawingAnchorType.Position,
                transform: { left: 2, top: 3, width: 40, height: 50 },
            };
            const group: Partial<ISheetDrawing> = {
                ...legacy,
                drawingId: 'group',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                anchorType: SheetDrawingAnchorType.Both,
            };
            const absolute: Partial<ISheetDrawing> = {
                ...legacy,
                drawingId: 'absolute',
                anchorType: SheetDrawingAnchorType.None,
                transform: { left: 240, top: 96, width: 120, height: 80 },
            };
            const drawingData = {
                'sheet-1': {
                    data: {
                        [legacy.drawingId!]: legacy,
                        [grouped.drawingId!]: grouped,
                        [group.drawingId!]: group,
                        [absolute.drawingId!]: absolute,
                        'missing-transform': { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'missing-transform' },
                    },
                    order: ['legacy-anchor', 'grouped', 'group', 'absolute', 'missing-transform'],
                },
                'missing-sheet': {
                    data: { [missingSkeleton.drawingId!]: missingSkeleton },
                    order: ['missing-skeleton'],
                },
            };
            const sheetDrawingService = bed.get(ISheetDrawingService);
            const drawingManagerService = bed.get(IDrawingManagerService);
            const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('unit-1', 'sheet-1');
            if (!skeleton) {
                throw new Error('Expected the Sheet skeleton to exist.');
            }
            sheetDrawingService.registerDrawingData('unit-1', drawingData as never);
            const sheetDrawingsAdded = vi.fn();
            const renderDrawingsAdded = vi.fn();
            subscriptions.push(
                sheetDrawingService.add$.subscribe(sheetDrawingsAdded),
                drawingManagerService.add$.subscribe(renderDrawingsAdded)
            );
            const renderManager = bed.get(IRenderManagerService);
            renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetsDrawingRenderController]);
            const render = renderManager.createRender('unit-1');
            render.with(SheetsDrawingRenderController);

            const initializedDrawings = Object.values(drawingData).flatMap((subUnit) => Object.values(subUnit.data));
            expect(sheetDrawingsAdded).toHaveBeenCalledExactlyOnceWith(expect.arrayContaining(initializedDrawings));
            const hydratedDrawings = Object.values(drawingManagerService.getDrawingDataForUnit('unit-1'))
                .flatMap((subUnit) => Object.values(subUnit.data));
            expect(renderDrawingsAdded).toHaveBeenCalledExactlyOnceWith(expect.arrayContaining(hydratedDrawings));
            const marker = skeleton.getNoMergeCellWithCoordByIndex(1, 2);
            const restoredLegacy = sheetDrawingService.getDrawingByParam(legacy as ISheetDrawing)!;
            const restoredGroup = sheetDrawingService.getDrawingByParam(group as ISheetDrawing)!;
            expect(restoredLegacy.transform).toMatchObject({ left: marker.startX, top: marker.startY, width: 24, height: 72 });
            expect(restoredLegacy).not.toHaveProperty('anchorType');
            expect(restoredGroup.transform).toMatchObject({
                left: marker.startX - skeleton.rowHeaderWidthAndMarginLeft,
                top: marker.startY - skeleton.columnHeaderHeightAndMarginTop,
                width: 24,
                height: 72,
            });
            expect(sheetDrawingService.getDrawingByParam(grouped as ISheetDrawing)?.transform)
                .toEqual({ left: 2, top: 3, width: 40, height: 50 });
            expect(sheetDrawingService.getDrawingByParam(absolute as ISheetDrawing)?.transform)
                .toEqual({ left: 240, top: 96, width: 120, height: 80 });
            expect(sheetDrawingService.getDrawingByParam(missingSkeleton as ISheetDrawing)).not.toHaveProperty('transform');
            expect(drawingManagerService.getDrawingByParam({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'legacy-anchor',
            })?.transform).toEqual(restoredLegacy.transform);
        } finally {
            subscriptions.forEach((subscription) => subscription.unsubscribe());
            bed.univer.dispose();
            canvasContext.mockRestore();
        }
    });
});
