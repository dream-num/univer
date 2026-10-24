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

import {
    ArrangeTypeEnum,
    DrawingTypeEnum,
    FOCUSING_COMMON_DRAWINGS,
    IContextService,
    IImageIoService,
    ImageSourceType,
    ImageUploadStatusType,
    IPermissionService,
    IURLImageService,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    Rect,
    SHEET_VIEWPORT_KEY,
    Spreadsheet,
    Viewport,
} from '@univerjs/engine-render';
import { WorksheetEditPermission } from '@univerjs/sheets';
import {
    InsertSheetDrawingCommand,
    ISheetDrawingService,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import {
    ISheetSelectionRenderService,
    SHEET_VIEW_KEY,
    SheetSelectionRenderService,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import {
    DesktopLocalFileService,
    DesktopMessageService,
    ILocalFileService,
    IMessageService,
    IPlatformService,
    IShortcutService,
    IUIPartsService,
    IUIRuntimeScopeService,
    PlatformService,
    ShortcutService,
    UIPartsService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { createAbsoluteChart, createChartDrawingTestBed } from '../../__tests__/chart-drawing-test-bed';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { GroupSheetDrawingCommand } from '../../commands/commands/group-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../../commands/commands/ungroup-sheet-drawing.command';
import { SheetDrawingUpdateController } from '../sheet-drawing-update.controller';

describe('SheetDrawingUpdateController', () => {
    it.each([
        [600, 100, 500, 500 / 6],
        [100, 600, 500 / 6, 500],
        [1000, 800, 500, 400],
        [400, 100, 400, 100],
        [100, 400, 100, 400],
        [500, 100, 500, 100],
        [500, 500, 500, 500],
    ])('fits a %i × %i floating image without enlarging it or changing its aspect ratio', async (width, height, expectedWidth, expectedHeight) => {
        const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        const imageConstructor = vi.spyOn(globalThis, 'Image').mockImplementation(function () {
            const image = document.createElement('img');
            image.width = width;
            image.height = height;
            queueMicrotask(() => image.dispatchEvent(new Event('load')));
            return image;
        });
        const bed = createSheetsDrawingUiTestBed(undefined, [
            [ICanvasColorService, { useClass: CanvasColorService }],
            [IPlatformService, { useClass: PlatformService }],
            [IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }],
            [IShortcutService, { useClass: ShortcutService }],
            [ILocalFileService, { useClass: DesktopLocalFileService }],
            [IUIPartsService, { useClass: UIPartsService }],
            [IMessageService, { useClass: DesktopMessageService }],
        ]);

        try {
            const renderManager = bed.get(IRenderManagerService);
            const render = renderManager.createRender(bed.unitId);
            render.engine.resizeBySize(800, 600);
            render.scene.transformByState({ width: 10000, height: 10000 });
            bed.injector.createInstance(Viewport, SHEET_VIEWPORT_KEY.VIEW_MAIN, render.scene, {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            });
            const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN);
            render.mainComponent = spreadsheet;
            render.components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
            render.scene.addObject(spreadsheet);
            renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
            render.with(SheetSkeletonManagerService).setCurrent({ sheetId: bed.subUnitId });
            renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [
                ISheetSelectionRenderService,
                { useClass: SheetSelectionRenderService },
            ]);
            renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetDrawingUpdateController]);
            const controller = render.with(SheetDrawingUpdateController);

            await expect(controller.insertFloatImageByFile(new File(['image'], 'screenshot.png', {
                type: 'image/png',
            }))).resolves.toBe(true);

            const drawings = Object.values(bed.get(ISheetDrawingService).getDrawingData(bed.unitId, bed.subUnitId));
            expect(drawings).toHaveLength(1);
            expect(drawings[0].transform?.width).toBeCloseTo(expectedWidth, 1);
            expect(drawings[0].transform?.height).toBeCloseTo(expectedHeight, 1);
        } finally {
            bed.univer.dispose();
            imageConstructor.mockRestore();
            canvasContext.mockRestore();
        }
    });

    it('uploads a worksheet background image through the real command, resource and history owners', async () => {
        const bed = createChartDrawingTestBed();
        bed.activate('grid');
        const file = new File(['png'], 'background.png', { type: 'image/png' });
        vi.spyOn(bed.get(ILocalFileService), 'openFile').mockResolvedValue([file]);
        vi.spyOn(bed.get(IImageIoService), 'saveImage').mockResolvedValue({ imageId: 'background', source: 'uploaded-file-id', imageSourceType: ImageSourceType.UUID, base64Cache: '', status: ImageUploadStatusType.SUCCUSS });
        const controller = bed.render.with(SheetDrawingUpdateController);
        expect(await controller.setWorksheetBackgroundImage()).toBe(true);
        expect(bed.workbook.getSheetBySheetId('grid')!.getConfig().backgroundImage).toMatchObject({ source: 'uploaded-file-id', imageSourceType: ImageSourceType.UUID });
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.workbook.getSheetBySheetId('grid')!.getConfig().backgroundImage).toBeUndefined();
    });

    it('reports empty and over-limit picker results without uploading or creating a drawing', async () => {
        const bed = createChartDrawingTestBed();
        bed.activate('grid');
        const picker = vi.spyOn(bed.get(ILocalFileService), 'openFile').mockResolvedValue([]);
        const upload = vi.spyOn(bed.get(IImageIoService), 'saveImage');
        const message = vi.spyOn(bed.get(IMessageService), 'show');
        const controller = bed.render.with(SheetDrawingUpdateController);
        expect(await controller.insertFloatImage()).toBe(false);
        expect(await controller.insertCellImage()).toBe(false);
        picker.mockResolvedValue(Array.from({ length: 30 }, (_, index) => new File(['png'], `image-${index}.png`, { type: 'image/png' })));
        expect(await controller.insertFloatImage()).toBe(false);
        expect(message).toHaveBeenCalledWith(expect.objectContaining({ type: MessageType.Error }));
        expect(upload).not.toHaveBeenCalled();
        expect(bed.drawings.getDrawingData('test', 'grid')).toEqual({});
    });
});

it('keeps real GRID transform, arrange, grouping and focus event consumers coherent without persisting derived group flags', async () => {
    const bed = createChartDrawingTestBed();
    bed.activate('grid');
    bed.commandService.registerCommand(GroupSheetDrawingCommand);
    bed.commandService.registerCommand(UngroupSheetDrawingCommand);
    const first = createAbsoluteChart('first', 'grid');
    const second = createAbsoluteChart('second', 'grid');
    expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [first, second] })).toBe(true);
    bed.drawingManager.featurePluginUpdateNotification([{ unitId: 'test', subUnitId: 'grid', drawingId: 'first', drawingType: DrawingTypeEnum.DRAWING_CHART, transform: { left: 200, top: 150 } }]);
    await Promise.resolve();
    const search = { unitId: 'test', subUnitId: 'grid', drawingId: 'first' };
    expect(bed.drawings.getDrawingByParam(search)!.transform).toMatchObject({ left: 200, top: 150, width: 200, height: 140 });
    bed.drawingManager.featurePluginOrderUpdateNotification({ unitId: 'test', subUnitId: 'grid', drawingIds: ['first'], arrangeType: ArrangeTypeEnum.front });
    await Promise.resolve();
    expect(bed.drawings.getDrawingOrder('test', 'grid')).toEqual(['second', 'first']);
    bed.drawingManager.focusDrawing([search]);
    expect(bed.get(IContextService).getContextValue(FOCUSING_COMMON_DRAWINGS)).toBe(true);
    expect(bed.drawings.getFocusDrawings()).toEqual([expect.objectContaining(search)]);
    bed.drawingManager.focusDrawing([]);
    expect(bed.get(IContextService).getContextValue(FOCUSING_COMMON_DRAWINGS)).toBe(false);
    const parent = { unitId: 'test', subUnitId: 'grid', drawingId: 'group', drawingType: DrawingTypeEnum.DRAWING_GROUP, transform: { left: 100, top: 100, width: 400, height: 300 } };
    const children = [bed.drawings.getDrawingByParam(search)!, second];
    bed.drawingManager.featurePluginGroupUpdateNotification([{ parent, children: children.map((child) => ({ ...child, groupId: 'group' })) }]);
    await Promise.resolve();
    const group = bed.drawings.getDrawingByParam({ ...search, drawingId: 'group' })!;
    expect(group).toBeDefined();
    expect(group.transform).not.toHaveProperty('rotateEnabled');
    expect(bed.drawings.getDrawingsByGroup({ ...search, drawingId: 'group' })).toHaveLength(2);
    bed.drawingManager.featurePluginUngroupUpdateNotification([{ parent: group, children: children.map((child) => ({ ...child, groupId: undefined })) }]);
    await Promise.resolve();
    expect(bed.drawings.getDrawingByParam({ ...search, drawingId: 'group' })).toBeUndefined();
    expect(bed.drawings.getDrawingByParam(search)!.groupId).toBeUndefined();
});

it('commits actual None feature updates through both stores, full save/reopen and undo/redo without a grid', async () => {
    const bed = createChartDrawingTestBed(undefined, createAbsoluteChart());
    const search = { unitId: 'test', subUnitId: 'chart', drawingId: 'child' };
    const before = bed.drawings.getDrawingByParam(search)!;
    bed.drawingManager.featurePluginUpdateNotification([{ ...search, drawingType: DrawingTypeEnum.DRAWING_CHART, transform: { left: 210, top: 180, width: 330, height: 220 } }]);
    await Promise.resolve();
    const changed = bed.drawings.getDrawingByParam(search)!;
    expect(changed.transform).toMatchObject({ ...before.transform, left: 210, top: 180, width: 330, height: 220 });
    expect(changed.sheetTransform.from).toEqual({ row: 0, column: 0, columnOffset: 210, rowOffset: 180 });
    expect(bed.drawingManager.getDrawingByParam(search)).toEqual(changed);
    expect(bed.manager.getFloatDomInfo('child')!.rect.width).toBe(330);
    expect(bed.manager.getFloatDomInfo('child')!.rect.left).toBe(210);
    expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
    expect(bed.drawings.getDrawingByParam(search)).toEqual(before);
    expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
    expect(bed.drawings.getDrawingByParam(search)).toEqual(changed);
    const reopened = createChartDrawingTestBed(bed.save());
    expect(reopened.drawings.getDrawingByParam(search)).toEqual(changed);
    expect(reopened.drawingManager.getDrawingByParam(search)).toEqual(changed);
    expect(reopened.skeletons.ensureSkeleton('test', 'chart')).toBeUndefined();
});

describe('target-bound image insertion', () => {
    function imageBed() {
        const bed = createChartDrawingTestBed();
        const frame = new Rect('test-page', { left: 500, top: 100, width: 300, height: 300 });
        bed.render.scene.transformByState({ width: 800, height: 600 });
        bed.render.scene.addObject(frame);
        bed.render.components.set('__ChartSheetPage__', frame);
        const imageConstructor = vi.spyOn(globalThis, 'Image').mockImplementation(function () {
            const image = document.createElement('img');
            image.width = 600;
            image.height = 300;
            queueMicrotask(() => image.dispatchEvent(new Event('load')));
            return image;
        });
        onTestFinished(() => imageConstructor.mockRestore());
        const io = bed.get(IImageIoService);
        const upload = vi.spyOn(io, 'saveImage').mockResolvedValue({ imageId: 'new-image', imageSourceType: ImageSourceType.BASE64, source: 'data:image/png;base64,test', base64Cache: 'data:image/png;base64,test', status: ImageUploadStatusType.SUCCUSS });
        const controller = bed.render.with(SheetDrawingUpdateController);
        const file = new File(['png'], 'test.png', { type: 'image/png' });
        return { ...bed, controller, file, upload, frame };
    }

    it('inserts a resource-backed image inside a nonzero Chart page without a skeleton and replays it', async () => {
        const bed = imageBed();
        expect(await bed.controller.insertFloatImageByFile(bed.file)).toBe(true);
        const search = { unitId: 'test', subUnitId: 'chart', drawingId: 'new-image' };
        const image = bed.drawings.getDrawingByParam(search)!;
        expect(image).toBeDefined();
        expect(image.anchorType).toBe(SheetDrawingAnchorType.None);
        expect(image.transform).toMatchObject({ left: 500, top: 175, width: 300, height: 150 });
        expect(bed.skeletons.ensureSkeleton('test', 'chart')).toBeUndefined();
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingByParam(search)).toBeUndefined();
        expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingByParam(search)).toEqual(image);
        const reopened = createChartDrawingTestBed(bed.save());
        expect(reopened.drawings.getDrawingByParam(search)).toEqual(image);
    });

    it.each(['switch', 'permission', 'permission-restore', 'render', 'delete'] as const)('cancels a captured Chart image after upload on %s', async (change) => {
        const bed = imageBed();
        let finish!: (value: Awaited<ReturnType<typeof bed.upload>>) => void;
        bed.upload.mockImplementation(() => new Promise((done) => {
            finish = done;
        }));
        const pending = bed.controller.insertFloatImageByFile(bed.file);
        if (change === 'switch') {
            bed.activate('grid');
        }
        if (change === 'permission' || change === 'permission-restore') {
            bed.get(IPermissionService).updatePermissionPoint(new WorksheetEditPermission('test', 'chart').id, false);
        }
        if (change === 'permission-restore') {
            bed.get(IPermissionService).updatePermissionPoint(new WorksheetEditPermission('test', 'chart').id, true);
        }
        if (change === 'render') {
            bed.renders.removeRender('test');
        }
        if (change === 'delete') {
            bed.workbook.removeSheet('chart');
        }
        finish({ imageId: 'new-image', imageSourceType: ImageSourceType.BASE64, source: 'data:image/png;base64,test', base64Cache: 'data:image/png;base64,test', status: ImageUploadStatusType.SUCCUSS });
        expect(await pending).toBe(false);
        expect(bed.drawings.getDrawingData('test', 'chart')).toEqual({});
        expect(bed.drawings.getDrawingData('test', 'grid')).toEqual({});
    });

    it('captures the host before the picker and awaits every file with truthful partial cancellation', async () => {
        const bed = imageBed();
        let finishPicker!: (files: File[]) => void;
        vi.spyOn(bed.get(ILocalFileService), 'openFile').mockImplementationOnce(() => new Promise((done) => {
            finishPicker = done;
        }));
        const switched = bed.controller.insertFloatImage();
        bed.activate('grid');
        finishPicker([bed.file]);
        expect(await switched).toBe(false);
        expect(bed.upload).not.toHaveBeenCalled();
        bed.activate('chart');
        let finishUpload!: (value: Awaited<ReturnType<typeof bed.upload>>) => void;
        bed.upload.mockResolvedValueOnce({ imageId: 'completed', imageSourceType: ImageSourceType.BASE64, source: 'data:image/png;base64,test', base64Cache: 'data:image/png;base64,test', status: ImageUploadStatusType.SUCCUSS });
        bed.upload.mockImplementationOnce(() => new Promise((done) => {
            finishUpload = done;
        }));
        vi.spyOn(bed.get(ILocalFileService), 'openFile').mockResolvedValue([bed.file, bed.file]);
        const completed = new Promise<void>((done) => {
            const listener = bed.commandService.onCommandExecuted((command) => {
                if (command.id === InsertSheetDrawingCommand.id) {
                    listener.dispose();
                    done();
                }
            });
        });
        const partial = bed.controller.insertFloatImage();
        await completed;
        expect(bed.drawings.getDrawingByParam({ unitId: 'test', subUnitId: 'chart', drawingId: 'completed' })).toBeDefined();
        bed.activate('grid');
        finishUpload({ imageId: 'cancelled', imageSourceType: ImageSourceType.BASE64, source: 'data:image/png;base64,test', base64Cache: 'data:image/png;base64,test', status: ImageUploadStatusType.SUCCUSS });
        expect(await partial).toBe(false);
        expect(Object.keys(bed.drawings.getDrawingData('test', 'chart'))).toEqual(['completed']);
        expect(bed.drawings.getDrawingData('test', 'grid')).toEqual({});
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingData('test', 'chart')).toEqual({});
    });

    it('awaits every file when a real insertion command notification throws and retains each completed history entry', async () => {
        const bed = imageBed();
        vi.spyOn(bed.get(ILocalFileService), 'openFile').mockResolvedValue([bed.file, bed.file]);
        let finishUpload!: (value: Awaited<ReturnType<typeof bed.upload>>) => void;
        bed.upload.mockResolvedValueOnce({ imageId: 'first', imageSourceType: ImageSourceType.BASE64, source: 'data:image/png;base64,test', base64Cache: 'data:image/png;base64,test', status: ImageUploadStatusType.SUCCUSS });
        bed.upload.mockImplementationOnce(() => new Promise((done) => {
            finishUpload = done;
        }));
        const listener = bed.commandService.onCommandExecuted((command) => {
            if (command.id === InsertSheetDrawingCommand.id && (command.params as { drawings: { drawingId: string }[] }).drawings[0].drawingId === 'first') {
                throw new Error('External insertion notification failed');
            }
        });
        onTestFinished(() => listener.dispose());
        let state = 'pending';
        const pending = bed.controller.insertFloatImage().then((value) => {
            state = 'fulfilled';
            return value;
        }, (error: unknown) => {
            state = 'rejected';
            return error;
        });
        await vi.advanceTimersByTimeAsync(1);
        expect(bed.drawings.getDrawingByParam({ unitId: 'test', subUnitId: 'chart', drawingId: 'first' })).toBeDefined();
        expect(state).toBe('pending');
        finishUpload({ imageId: 'second', imageSourceType: ImageSourceType.BASE64, source: 'data:image/png;base64,test', base64Cache: 'data:image/png;base64,test', status: ImageUploadStatusType.SUCCUSS });
        expect(await pending).toBe(false);
        expect(Object.keys(bed.drawings.getDrawingData('test', 'chart'))).toEqual(['first', 'second']);
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(Object.keys(bed.drawings.getDrawingData('test', 'chart'))).toEqual(['first']);
        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(bed.drawings.getDrawingData('test', 'chart')).toEqual({});
    });

    it('fails before upload when the Chart page is missing or outside the viewport', async () => {
        const bed = imageBed();
        bed.frame.transformByState({ left: 2000 });
        expect(await bed.controller.insertFloatImageByFile(bed.file)).toBe(false);
        bed.render.components.delete('__ChartSheetPage__');
        expect(await bed.controller.insertFloatImageByFile(bed.file)).toBe(false);
        expect(bed.upload).not.toHaveBeenCalled();
    });

    it.each(['file', 'url'] as const)('rejects an explicit Chart cell target before %s IO while GRID is active', async (method) => {
        const bed = imageBed();
        bed.activate('grid');
        const network = vi.spyOn(bed.get(IURLImageService), 'getImage');
        const location = { unitId: 'test', subUnitId: 'chart', row: 0, col: 0 };
        const result = method === 'file' ? await bed.controller.insertCellImageByFile(bed.file, location) : await bed.controller.insertCellImageByUrl('https://example.test/p.png', location);
        expect(result).toBe(false);
        expect(bed.upload).not.toHaveBeenCalled();
        expect(network).not.toHaveBeenCalled();
    });

    it.each(['file', 'url'] as const)('inserts into an explicit GRID cell while CHART is active through %s', async (method) => {
        const bed = imageBed();
        bed.skeletons.ensureSkeleton('test', 'grid');
        vi.spyOn(bed.get(IURLImageService), 'getImage').mockResolvedValue('data:image/png;base64,test');
        const location = { unitId: 'test', subUnitId: 'grid', row: 3, col: 4 };
        const result = method === 'file' ? await bed.controller.insertCellImageByFile(bed.file, location) : await bed.controller.insertCellImageByUrl('https://example.test/p.png', location);
        expect(result).toBe(true);
        expect(bed.workbook.getSheetBySheetId('grid')!.getCell(3, 4)?.p?.drawings).toBeDefined();
        expect(bed.workbook.getSheetBySheetId('chart')!.getCellMatrix().getMatrix()).toEqual({});
    });
});
