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

import { SheetSkeletonService } from '@univerjs/sheets';
import { ISheetDrawingService, RemoveSheetDrawingCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing';
import { FileNamePart, IBatchSaveImagesService, SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { ComponentManager } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FWorksheetDrawingUIMixin } from '../f-worksheet';

vi.mock('@univerjs/sheets-drawing', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/sheets-drawing')>();

    return {
        ...actual,
        transformToDrawingPosition: vi.fn((position) => ({ convertedFrom: position.left ?? 0 })),
        transformToAxisAlignPosition: vi.fn((position) => ({ convertedTo: position.top ?? 0 })),
    };
});

vi.mock('@univerjs/sheets-ui/facade', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/sheets-ui/facade')>();

    return {
        ...actual,
        transformComponentKey: vi.fn((layer) => ({
            key: layer.componentKey,
            disposableCollection: {
                add: vi.fn(),
                dispose: vi.fn(),
            },
        })),
    };
});

function createWorksheetMixin() {
    const floatDomInfo = {
        id: 'float-1',
        unitId: 'book-1',
        subUnitId: 'sheet-1',
        rect: {
            getState: () => ({
                left: 10,
                top: 20,
                width: 30,
                height: 40,
                flipX: false,
                flipY: false,
                angle: 15,
                skewX: 1,
                skewY: 2,
            }),
        },
    };
    const drawingParam = {
        unitId: 'book-1',
        subUnitId: 'sheet-1',
        drawingId: 'float-1',
        componentKey: 'float-dom',
        allowTransform: true,
        data: { label: 'hello' },
        transform: { left: 10, top: 20, width: 30, height: 40 },
        sheetTransform: { from: { row: 0 }, to: { row: 1 } },
    };
    const floatDomService = {
        getFloatDomInfo: vi.fn((id: string) => id === 'float-1' ? floatDomInfo : null),
        getFloatDomsBySubUnitId: vi.fn(() => new Map([['float-1', floatDomInfo]])),
        addFloatDomToPosition: vi.fn(() => ({ id: 'float-1', dispose: vi.fn() })),
        addFloatDomToRange: vi.fn(() => ({ id: 'float-range', dispose: vi.fn() })),
        addFloatDomToColumnHeader: vi.fn(() => ({ id: 'float-column', dispose: vi.fn() })),
    };
    const drawingService = {
        getDrawingByParam: vi.fn((search) => search.drawingId === 'float-1' ? drawingParam : null),
    };
    const commandService = {
        syncExecuteCommand: vi.fn(() => true),
    };
    const batchSaveService: any = {
        getCellImagesFromRanges: vi.fn(() => []),
        downloadSingleImage: vi.fn(async () => {}),
        saveImagesWithContext: vi.fn(async () => {}),
    };

    const mixin: any = Object.create(FWorksheetDrawingUIMixin.prototype);
    mixin._injector = {
        get: (token: unknown) => {
            if (token === SheetCanvasFloatDomManagerService) {
                return floatDomService;
            }
            if (token === ISheetDrawingService) {
                return drawingService;
            }
            if (token === SheetSkeletonService) {
                return {
                    getSkeleton: () => ({ skeletonId: 'sheet-skeleton' }),
                };
            }
            if (token === ComponentManager) {
                return {};
            }
            if (token === IBatchSaveImagesService) {
                return batchSaveService;
            }

            throw new Error(`Unknown dependency ${String(token)}`);
        },
    };
    mixin._commandService = commandService;
    mixin._workbook = { getUnitId: () => 'book-1' };
    mixin._worksheet = {
        getSheetId: () => 'sheet-1',
        getCellMatrix: () => ({
            getDataRange: () => ({ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 }),
        }),
    };
    mixin._fWorkbook = { getId: () => 'book-1' };
    mixin.getSheetId = () => 'sheet-1';

    return { mixin: mixin as FWorksheetDrawingUIMixin & Record<string, any>, floatDomService, drawingService, commandService, batchSaveService };
}

describe('FWorksheetDrawingUIMixin', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reads float doms from the canvas float dom manager and drawing service', () => {
        const { mixin } = createWorksheetMixin();

        expect(mixin.getFloatDomById('float-1')).toEqual({
            position: {
                left: 10,
                top: 20,
                width: 30,
                height: 40,
                flipX: false,
                flipY: false,
                angle: 15,
                skewX: 1,
                skewY: 2,
            },
            componentKey: 'float-dom',
            allowTransform: true,
            data: { label: 'hello' },
            id: 'float-1',
        });
        expect(mixin.getAllFloatDoms()).toEqual([expect.objectContaining({ id: 'float-1', componentKey: 'float-dom' })]);
        expect(mixin.getFloatDomById('missing')).toBeNull();
    });

    it('updates and batch-updates float doms through the sheet drawing command pipeline', () => {
        const { mixin, commandService } = createWorksheetMixin();

        expect(mixin.updateFloatDom('float-1', {
            position: { left: 50, top: 60 },
            data: { label: 'updated' },
            allowTransform: false,
        })).toBe(mixin);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetSheetDrawingCommand.id, expect.objectContaining({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawings: [expect.objectContaining({
                drawingId: 'float-1',
                data: { label: 'updated' },
                allowTransform: false,
                transform: expect.objectContaining({ left: 50, top: 60 }),
            })],
        }));

        expect(mixin.batchUpdateFloatDoms([
            { id: 'float-1', config: { position: { left: 99, top: 100 } } },
            { id: 'missing', config: { position: { left: 1, top: 2 } } },
        ])).toBe(mixin);
        expect(commandService.syncExecuteCommand).toHaveBeenLastCalledWith(SetSheetDrawingCommand.id, expect.objectContaining({
            drawings: [expect.objectContaining({
                drawingId: 'float-1',
                transform: expect.objectContaining({ left: 99, top: 100 }),
            })],
        }));
    });

    it('removes float doms through the sheet drawing command pipeline', () => {
        const { mixin, commandService } = createWorksheetMixin();

        expect(mixin.removeFloatDom('float-1')).toBe(mixin);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(RemoveSheetDrawingCommand.id, {
            unitId: 'book-1',
            drawings: [expect.objectContaining({ drawingId: 'float-1' })],
        });
        expect(mixin.removeFloatDom('missing')).toBe(mixin);
    });

    it('adds float doms to positions, ranges, and column headers while preserving the wrapped dispose lifecycle', () => {
        const { mixin, floatDomService } = createWorksheetMixin();
        const range = {
            getRange: () => ({
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
            }),
        };

        const positionHandle = mixin.addFloatDomToPosition({ componentKey: 'float-dom', initPosition: { startX: 0, endX: 10, startY: 0, endY: 10 } } as never, 'float-1');
        const rangeHandle = mixin.addFloatDomToRange(range as never, { componentKey: 'float-dom' } as never, {} as never, 'float-range');
        const columnHandle = mixin.addFloatDomToColumnHeader(1, { componentKey: 'float-dom' } as never, {} as never, 'float-column');

        expect(positionHandle?.id).toBe('float-1');
        expect(rangeHandle?.id).toBe('float-range');
        expect(columnHandle?.id).toBe('float-column');
        expect(floatDomService.addFloatDomToPosition).toHaveBeenCalled();
        expect(floatDomService.addFloatDomToRange).toHaveBeenCalled();
        expect(floatDomService.addFloatDomToColumnHeader).toHaveBeenCalled();

        positionHandle?.dispose();
        rangeHandle?.dispose();
        columnHandle?.dispose();
    });

    it('saves worksheet cell images through the batch save service using direct download or multi-image save', async () => {
        const { mixin, batchSaveService } = createWorksheetMixin();
        batchSaveService.getCellImagesFromRanges
            .mockReturnValueOnce([])
            .mockReturnValueOnce([{ cellAddress: 'A1' }])
            .mockReturnValueOnce([{ cellAddress: 'A1' }, { cellAddress: 'B2' }]);

        expect(await mixin.saveCellImagesAsync()).toBe(false);
        expect(await mixin.saveCellImagesAsync()).toBe(true);
        expect(batchSaveService.downloadSingleImage).toHaveBeenCalledWith({ cellAddress: 'A1' });

        expect(await mixin.saveCellImagesAsync({ useCellAddress: false, useColumnIndex: 2 })).toBe(true);
        expect(batchSaveService.saveImagesWithContext).toHaveBeenCalledWith(
            [{ cellAddress: 'A1' }, { cellAddress: 'B2' }],
            {
                fileNameParts: [FileNamePart.COLUMN_VALUE],
                columnIndex: 2,
            },
            'book-1',
            'sheet-1'
        );
    });
});
