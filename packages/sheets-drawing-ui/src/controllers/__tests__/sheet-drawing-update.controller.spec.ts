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

import { ICommandService, IContextService, ImageSourceType, ImageUploadStatusType, Injector, IURLImageService, LocaleService } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IDrawingManagerService, IImageIoService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesCommand, SheetInterceptorService, SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { InsertSheetDrawingCommand, ISheetDrawingService } from '@univerjs/sheets-drawing';
import { ISheetSelectionRenderService } from '@univerjs/sheets-ui';
import { ILocalFileService, IMessageService } from '@univerjs/ui';
import { EMPTY } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDrawingSizeByCell, SheetDrawingUpdateController } from '../sheet-drawing-update.controller';

vi.mock('@univerjs/drawing', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/drawing')>();

    return {
        ...actual,
        getImageSize: vi.fn(async () => ({
            width: 200,
            height: 100,
            image: { width: 200, height: 100 },
        })),
    };
});

vi.mock('@univerjs/sheets-drawing', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/sheets-drawing')>();

    return {
        ...actual,
        drawingPositionToTransform: vi.fn(() => ({ left: 10, top: 20, width: 60, height: 30 })),
        transformToAxisAlignPosition: vi.fn(() => ({
            from: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
            to: { row: 2, rowOffset: 0, column: 3, columnOffset: 0 },
        })),
    };
});

function createController() {
    const injector = new Injector();
    const executeCommand = vi.fn(async () => true);
    const syncExecuteCommand = vi.fn(() => true);
    const messageService = {
        show: vi.fn(),
    };
    const workbookSelections = {
        getCurrentSelections: vi.fn(() => [{
            range: {
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
            },
        }]),
        getCurrentLastSelection: vi.fn(() => ({
            primary: {
                actualRow: 1,
                actualColumn: 1,
                isMerged: false,
                startRow: 1,
                startColumn: 1,
            },
        })),
    };
    const skeleton = {
        getCellByIndex: () => ({
            mergeInfo: {
                startX: 0,
                endX: 102,
                startY: 0,
                endY: 52,
            },
        }),
        getNoMergeCellWithCoordByIndex: (row: number, col: number) => ({
            startX: col * 10,
            endX: col * 10 + 10,
            startY: row * 10,
            endY: row * 10 + 10,
        }),
    };

    injector.add([ICommandService, {
        useValue: {
            executeCommand,
            syncExecuteCommand,
        } as never,
    }]);
    injector.add([SheetInterceptorService, { useValue: { interceptCommand: vi.fn(() => ({ dispose: vi.fn() })) } as never }]);
    injector.add([ISheetSelectionRenderService, {
        useValue: {
            getCellWithCoordByOffset: vi.fn((x: number, y: number) => ({
                actualColumn: x < 100 ? 1 : 3,
                actualRow: y < 50 ? 1 : 2,
                startX: x < 100 ? 10 : 100,
                startY: y < 50 ? 20 : 50,
            })),
        } as never,
    }]);
    injector.add([IImageIoService, {
        useValue: {
            saveImage: vi.fn(async () => ({
                imageId: 'image-1',
                imageSourceType: ImageSourceType.UUID,
                source: 'image-1',
                base64Cache: 'data:image/png;base64,Zm9v',
                status: ImageUploadStatusType.SUCCUSS,
            })),
            addImageSourceCache: vi.fn(),
        } as never,
    }]);
    injector.add([ILocalFileService, { useValue: { openFile: vi.fn() } as never }]);
    injector.add([ISheetDrawingService, { useValue: {} as never }]);
    injector.add([IDrawingManagerService, {
        useValue: {
            featurePluginOrderUpdate$: EMPTY,
            featurePluginUpdate$: EMPTY,
            featurePluginGroupUpdate$: EMPTY,
            featurePluginUngroupUpdate$: EMPTY,
            focus$: EMPTY,
        } as never,
    }]);
    injector.add([IContextService, { useValue: { setContextValue: vi.fn() } as never }]);
    injector.add([IMessageService, { useValue: messageService as never }]);
    injector.add([LocaleService, { useValue: { t: (key: string) => key } as never }]);
    injector.add([SheetsSelectionsService, { useValue: { getWorkbookSelections: vi.fn(() => workbookSelections) } as never }]);
    injector.add([SheetSkeletonService, {
        useValue: {
            getSkeletonParam: vi.fn(() => ({ skeleton })),
        } as never,
    }]);
    injector.add([IURLImageService, { useValue: { getImage: vi.fn(async () => 'data:image/png;base64,Zm9v') } as never }]);
    injector.add([IRenderManagerService, {
        useValue: {
            getRenderById: vi.fn(() => ({
                with: () => ({
                    getSkeletonParam: () => ({ skeleton }),
                }),
            })),
        } as never,
    }]);

    const context = {
        unitId: 'book-1',
        unit: {
            getUnitId: () => 'book-1',
            getActiveSheet: () => ({
                getSheetId: () => 'sheet-1',
            }),
        },
        scene: {
            width: 300,
            height: 200,
        },
    };

    const controller = injector.createInstance(SheetDrawingUpdateController, context as never);

    return {
        injector,
        controller,
        executeCommand,
        syncExecuteCommand,
        messageService,
        workbookSelections,
    };
}

describe('SheetDrawingUpdateController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('computes cell image sizes from the current render skeleton', () => {
        const accessor = {
            get: (token: unknown) => {
                if (token === IRenderManagerService) {
                    return {
                        getRenderById: () => ({
                            with: () => ({
                                getSkeletonParam: () => ({
                                    skeleton: {
                                        getCellByIndex: () => ({
                                            mergeInfo: {
                                                startX: 0,
                                                endX: 102,
                                                startY: 0,
                                                endY: 52,
                                            },
                                        }),
                                    },
                                }),
                            }),
                        }),
                    };
                }

                return null;
            },
        } as never;

        expect(getDrawingSizeByCell(accessor, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
        }, 200, 100, 0)).toEqual({
            width: 100,
            height: 50,
        });
    });

    it('inserts a float image through the sheet drawing command pipeline', async () => {
        const { controller, executeCommand, injector } = createController();
        const file = new File(['image'], 'float.png', { type: 'image/png' });

        await controller.insertFloatImageByFile(file);

        expect(injector.get(IImageIoService).addImageSourceCache).toHaveBeenCalled();
        expect(executeCommand).toHaveBeenCalledWith(InsertSheetDrawingCommand.id, expect.objectContaining({
            unitId: 'book-1',
            drawings: [expect.objectContaining({
                drawingId: 'image-1',
                source: 'image-1',
                imageSourceType: ImageSourceType.UUID,
                transform: { left: 10, top: 20, width: 60, height: 30 },
            })],
        }));
    });

    it('surfaces float image upload validation failures through the message service', async () => {
        const { controller, injector, messageService } = createController();
        vi.mocked(injector.get(IImageIoService).saveImage).mockRejectedValueOnce(new Error(ImageUploadStatusType.ERROR_IMAGE_TYPE));

        await controller.insertFloatImageByFile(new File(['image'], 'bad.png', { type: 'image/png' }));

        expect(messageService.show).toHaveBeenCalledWith(expect.objectContaining({
            type: MessageType.Error,
            content: 'update-status.invalidImageType',
        }));
    });

    it('writes a cell image document snapshot into the target cell through SetRangeValuesCommand', async () => {
        const { controller, syncExecuteCommand } = createController();

        expect(await controller.insertCellImageByUrl('https://example.com/image.png', {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            row: 3,
            col: 4,
        })).toBe(true);

        expect(syncExecuteCommand).toHaveBeenCalledWith(SetRangeValuesCommand.id, expect.objectContaining({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            value: {
                3: {
                    4: expect.objectContaining({
                        t: 1,
                        p: expect.objectContaining({
                            body: expect.objectContaining({
                                customBlocks: expect.arrayContaining([
                                    expect.objectContaining({ blockId: expect.any(String) }),
                                ]),
                            }),
                            drawingsOrder: expect.any(Array),
                        }),
                    }),
                },
            },
        }));
    });
});
