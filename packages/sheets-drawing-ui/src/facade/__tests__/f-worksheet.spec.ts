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

import type { Dependency, ICellData, IDrawingParam, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISheetFloatDom, ISheetImage } from '@univerjs/sheets-drawing';
import {
    DrawingTypeEnum,
    ICommandService,
    ILogService,
    ImageSourceType,
    Inject,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    IURLImageService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { IDrawingManagerService, UniverDrawingPlugin } from '@univerjs/drawing';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import {
    InsertSheetDrawingCommand,
    ISheetDrawingService,
    RemoveSheetDrawingCommand,
    SetSheetDrawingCommand,
    UniverSheetsDrawingPlugin,
} from '@univerjs/sheets-drawing';
import {
    BatchSaveImagesService,
    IBatchSaveImagesService,
    SheetCanvasFloatDomManagerService,
} from '@univerjs/sheets-drawing-ui';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { CanvasFloatDomService, ComponentManager } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-drawing-ui/facade';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
    },
};

function createDrawingUITestBed(dependencies: Dependency[] = []) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            this._injector.get(IUndoRedoService);

            ([
                [IRenderManagerService, { useClass: RenderManagerService }],
                [ComponentManager],
                [CanvasFloatDomService],
                [IBatchSaveImagesService, { useClass: BatchSaveImagesService }],
                [SheetCanvasFloatDomManagerService],
                ...dependencies,
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverDrawingPlugin);
    univer.registerPlugin(UniverSheetsDrawingPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        Tools.deepClone(TEST_WORKBOOK_DATA)
    );

    get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    get(ILogService).setLogLevel(LogLevel.SILENT);

    const localeService = get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: sheetsEnUS });
    localeService.setLocale(LocaleType.EN_US);

    return {
        univer,
        injector,
        workbook,
    };
}

describe('sheets-drawing-ui facade', () => {
    let univer: Univer;
    let injector: Injector;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createDrawingUITestBed();
        univer = testBed.univer;
        injector = testBed.injector;
        univerAPI = FUniver.newAPI(injector);
    });

    afterEach(() => {
        univer?.dispose();
    });

    it('uses real facade instances for empty float dom and cell image flows', async () => {
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const range = worksheet.getRange('A1:B2');

        expect(worksheet.getFloatDomById('missing')).toBeNull();
        expect(worksheet.getAllFloatDoms()).toEqual([]);
        expect(worksheet.removeFloatDom('missing')).toBe(worksheet);
        await expect(range.insertCellImageAsync('https://univer.ai/image.png')).resolves.toBe(false);
        await expect(range.saveCellImagesAsync()).resolves.toBe(false);
        await expect(worksheet.saveCellImagesAsync()).resolves.toBe(false);
    });

    it('registers a URL image downloader through the facade', async () => {
        const downloader = async (url: string) => `downloaded:${url}`;
        const disposable = univerAPI.registerURLImageDownloader(downloader);
        const urlImageService = injector.get(IURLImageService);

        await expect(urlImageService.getImage('https://univer.ai/image.png')).resolves.toBe('downloaded:https://univer.ai/image.png');
        disposable.dispose();
        await expect(urlImageService.getImage('https://univer.ai/image.png')).resolves.toBe('https://univer.ai/image.png');
    });

    it('adds, updates and removes float doms through worksheet facade state', async () => {
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();

        const added = worksheet.addFloatDomToPosition({
            componentKey: 'OrderCard',
            initPosition: {
                startX: 20,
                startY: 30,
                endX: 140,
                endY: 90,
            },
            data: { label: 'Draft order' },
            allowTransform: true,
        }, 'order-card');
        await Promise.resolve();

        expect(added).toBeNull();
        expect(injector.get(IDrawingManagerService).getDrawingByParam({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'order-card',
        })).toBeUndefined();

        expect(worksheet.addFloatDomToRange(worksheet.getRange('A1:B2'), {
            componentKey: 'RangeCard',
            data: { label: 'Range order' },
        }, {}, 'range-card')).toBeNull();
        expect(worksheet.addFloatDomToColumnHeader(1, {
            componentKey: 'HeaderCard',
            data: { label: 'Header order' },
        }, { width: 80, height: 24, marginX: 0, marginY: 0 }, 'header-card')).toBeNull();

        expect(worksheet.updateFloatDom('missing-dom', { data: { label: 'Ignored' } })).toBe(worksheet);
        expect(worksheet.batchUpdateFloatDoms([{ id: 'missing-dom', config: { data: { label: 'Ignored' } } }])).toBe(worksheet);

        worksheet.removeFloatDom('order-card');
    });

    it('saves cell images from range and worksheet selections', async () => {
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const savedFiles: string[] = [];
        const clickedDownloads: string[] = [];
        const originalShowDirectoryPicker = window.showDirectoryPicker;
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        const originalClick = HTMLAnchorElement.prototype.click;

        window.showDirectoryPicker = async () => ({
            getFileHandle: async (name: string) => {
                savedFiles.push(name);
                return {
                    createWritable: async () => ({
                        write: async () => {},
                        close: async () => {},
                    }),
                };
            },
        }) as unknown as FileSystemDirectoryHandle;
        URL.createObjectURL = () => 'blob:cell-image';
        URL.revokeObjectURL = () => {};
        HTMLAnchorElement.prototype.click = function click() {
            clickedDownloads.push(this.download);
        };

        const model = worksheet.getWorkbook().getSheetBySheetId(worksheet.getSheetId())!;
        model.getCellMatrix().setValue(0, 0, createCellImage('image-a', 'data:image/png;base64,aGVsbG8='));
        model.getCellMatrix().setValue(1, 1, createCellImage('image-b', 'data:image/jpeg;base64,aGVsbG8='));
        model.getCellMatrix().setValue(0, 2, { v: 'Customer/West' });

        await expect(worksheet.getRange('A1').saveCellImagesAsync()).resolves.toBe(true);
        expect(clickedDownloads).toEqual(['A1.png']);

        await expect(worksheet.saveCellImagesAsync(undefined, [worksheet.getRange('A1')])).resolves.toBe(true);
        expect(clickedDownloads).toEqual(['A1.png', 'A1.png']);

        await expect(worksheet.getRange('A1:B2').saveCellImagesAsync({ useCellAddress: false, useColumnIndex: 2 })).resolves.toBe(true);
        expect(savedFiles).toEqual(['Customer_West.png', 'B2.jpg']);

        savedFiles.length = 0;
        await expect(worksheet.saveCellImagesAsync({ useCellAddress: true, useColumnIndex: 2 }, [worksheet.getRange('A1:B2')])).resolves.toBe(true);
        expect(savedFiles).toEqual(['A1_Customer_West.png', 'B2.jpg']);

        URL.createObjectURL = () => {
            throw new Error('download denied');
        };
        await expect(worksheet.getRange('A1').saveCellImagesAsync()).resolves.toBe(false);
        await expect(worksheet.saveCellImagesAsync(undefined, [worksheet.getRange('A1')])).resolves.toBe(false);

        URL.createObjectURL = () => 'blob:cell-image';
        window.showDirectoryPicker = async () => {
            throw new Error('directory denied');
        };
        await expect(worksheet.getRange('A1:B2').saveCellImagesAsync()).resolves.toBe(false);
        await expect(worksheet.saveCellImagesAsync(undefined, [worksheet.getRange('A1:B2')])).resolves.toBe(false);

        window.showDirectoryPicker = originalShowDirectoryPicker;
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
        HTMLAnchorElement.prototype.click = originalClick;
    });

    it('emits float dom add, update and delete events from drawing commands', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const commandService = injector.get(ICommandService);
        const drawingManagerService = injector.get(IDrawingManagerService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const floatDom = createFloatDom('float-dom-1');

        const logs: string[] = [];
        const disposables = [
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomAdd, ({ drawings }) => logs.push(`before-add:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.FloatDomAdded, ({ drawings }) => logs.push(`add:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomUpdate, ({ drawings }) => logs.push(`before-update:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.FloatDomUpdated, ({ drawings }) => logs.push(`update:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomDelete, ({ drawings }) => logs.push(`before-delete:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.FloatDomDeleted, ({ drawings }) => logs.push(`delete:${drawings[0]}`)),
        ];

        commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: workbook.getId(),
            drawings: [floatDom],
        });
        drawingManagerService.registerDrawingData('test', sheetDrawingService.getDrawingDataForUnit('test') as Record<string, { data: Record<string, IDrawingParam>; order: string[] }>);
        drawingManagerService.initializeNotification('test');
        expect(commandService.syncExecuteCommand(SetSheetDrawingCommand.id, {
            unitId: workbook.getId(),
            subUnitId: 'sheet1',
            drawings: [{ ...floatDom, transform: { ...floatDom.transform, left: 24 }, data: { label: 'Updated order' } }],
        })).toBe(true);
        expect(commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id, {
            unitId: workbook.getId(),
            subUnitId: 'sheet1',
            drawings: [{ unitId: workbook.getId(), subUnitId: 'sheet1', drawingId: floatDom.drawingId, drawingType: DrawingTypeEnum.DRAWING_DOM }],
        })).toBe(true);

        expect(logs).toEqual([
            'before-add:float-dom-1',
            'add:float-dom-1',
            'before-update:float-dom-1',
            'update:float-dom-1',
            'before-delete:float-dom-1',
            'delete:float-dom-1',
        ]);

        disposables.forEach((disposable) => disposable.dispose());
    });

    it('cancels float dom commands before they mutate drawing state', () => {
        const commandService = injector.get(ICommandService);
        const drawingManagerService = injector.get(IDrawingManagerService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const floatDom = createFloatDom('guarded-dom');
        const disposables = [
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomAdd, (event) => {
                if (event.drawings[0].drawingId === 'guarded-dom') event.cancel = true;
            }),
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomUpdate, (event) => {
                if (event.drawings[0].drawingId === 'existing-dom') event.cancel = true;
            }),
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomDelete, (event) => {
                if (event.drawings[0].drawingId === 'existing-dom') event.cancel = true;
            }),
        ];

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [floatDom],
        })).toBe(false);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'guarded-dom' })).toBeUndefined();

        const existing = createFloatDom('existing-dom');
        sheetDrawingService.registerDrawingData('test', {
            sheet1: { data: { [existing.drawingId]: existing }, order: [existing.drawingId] },
        });
        drawingManagerService.registerDrawingData('test', {
            sheet1: { data: { [existing.drawingId]: existing as unknown as IDrawingParam }, order: [existing.drawingId] },
        });
        drawingManagerService.initializeNotification('test');

        expect(commandService.syncExecuteCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{ ...existing, data: { label: 'Blocked update' } }],
        })).toBe(false);
        expect((sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'existing-dom' }) as ISheetFloatDom | undefined)?.data)
            .toEqual({ label: 'Order card' });

        expect(commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{ unitId: 'test', subUnitId: 'sheet1', drawingId: 'existing-dom', drawingType: DrawingTypeEnum.DRAWING_DOM }],
        })).toBe(false);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'existing-dom' })).toBeDefined();

        disposables.forEach((disposable) => disposable.dispose());
    });

    it('does not emit float dom events for over-grid image drawing commands', () => {
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        const image = createOverGridImage('image-drawing');
        const logs: string[] = [];
        const disposables = [
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomAdd, ({ drawings }) => logs.push(`before-add:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.FloatDomAdded, ({ drawings }) => logs.push(`add:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomUpdate, ({ drawings }) => logs.push(`before-update:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.FloatDomUpdated, ({ drawings }) => logs.push(`update:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeFloatDomDelete, ({ drawings }) => logs.push(`before-delete:${drawings[0].drawingId}`)),
            univerAPI.addEvent(univerAPI.Event.FloatDomDeleted, ({ drawings }) => logs.push(`delete:${drawings[0]}`)),
        ];

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id)).toBe(false);
        expect(commandService.syncExecuteCommand(SetSheetDrawingCommand.id)).toBe(false);
        expect(commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id)).toBe(false);

        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [image],
        })).toBe(true);
        expect(commandService.syncExecuteCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{ ...image, source: 'data:image/png;base64,Zm9v' }],
        })).toBe(true);
        expect(commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{ unitId: 'test', subUnitId: 'sheet1', drawingId: image.drawingId, drawingType: DrawingTypeEnum.DRAWING_IMAGE }],
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: image.drawingId })).toBeUndefined();
        expect(logs).toEqual([]);

        disposables.forEach((disposable) => disposable.dispose());
    });
});

function createFloatDom(drawingId: string): ISheetFloatDom {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_DOM,
        componentKey: 'FloatDom',
        allowTransform: true,
        data: { label: 'Order card' },
        transform: {
            left: 10,
            top: 20,
            width: 120,
            height: 80,
        },
        sheetTransform: {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        },
        axisAlignSheetTransform: {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        },
    };
}

function createCellImage(drawingId: string, source: string): ICellData {
    return {
        p: {
            id: `${drawingId}-doc`,
            documentStyle: {},
            drawingsOrder: [drawingId],
            drawings: {
                [drawingId]: {
                    drawingId,
                    source,
                    imageSourceType: ImageSourceType.BASE64,
                },
            },
        } as unknown as ICellData['p'],
    };
}

function createOverGridImage(drawingId: string): ISheetImage {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.BASE64,
        source: 'data:image/png;base64,aGVsbG8=',
        transform: {
            left: 10,
            top: 10,
            width: 20,
            height: 20,
        },
        sheetTransform: {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 },
        },
        axisAlignSheetTransform: {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 },
        },
    };
}
