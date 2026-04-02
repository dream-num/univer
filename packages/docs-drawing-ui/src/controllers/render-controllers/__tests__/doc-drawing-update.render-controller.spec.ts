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

import type { DocumentDataModel, ICommand, IDocumentData, Injector } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import { BooleanNumber, DrawingTypeEnum, ICommandService, ImageSourceType, ImageUploadStatusType, LocaleService, PositionedObjectLayoutType, WrapTextType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { DocSelectionManagerService, DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocDrawingController as CoreDocDrawingController, DocDrawingService, IDocDrawingService } from '@univerjs/docs-drawing';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { DRAWING_IMAGE_COUNT_LIMIT, DrawingManagerService, IDrawingManagerService, IImageIoService } from '@univerjs/drawing';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { ILocalFileService, IMessageService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocUiTestBed } from '../../../__tests__/create-doc-ui-test-bed';
import { InsertDocDrawingCommand } from '../../../commands/commands/insert-doc-drawing.command';
import { InsertDocImageCommand } from '../../../commands/commands/insert-image.command';
import { DocRefreshDrawingsService } from '../../../services/doc-refresh-drawings.service';
import { DocDrawingAddRemoveController } from '../../doc-drawing-notification.controller';
import { DocDrawingUpdateRenderController } from '../doc-drawing-update.render-controller';

vi.mock('@univerjs/drawing', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/drawing')>();

    return {
        ...actual,
        getImageSize: vi.fn(async () => ({
            width: 120,
            height: 80,
            image: { width: 120, height: 80 },
        })),
    };
});

function createBaseDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello\r\n',
            customBlocks: [],
        },
        drawings: {},
        drawingsOrder: [],
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function createRenderControllerTestBed(options?: {
    docData?: IDocumentData;
    files?: File[];
    editArea?: DocumentEditArea;
    saveImageImpl?: (file: File) => Promise<any>;
}) {
    let injector!: Injector;
    let controller!: DocDrawingUpdateRenderController;
    const fileOpenerService = {
        openFile: vi.fn(async () => options?.files ?? []),
    };
    const imageIoService = {
        saveImage: vi.fn(options?.saveImageImpl ?? (async () => ({
            imageId: 'image-1',
            imageSourceType: ImageSourceType.UUID,
            source: 'image-1',
            base64Cache: 'data:image/png;base64,Zm9v',
            status: ImageUploadStatusType.SUCCUSS,
        }))),
        addImageSourceCache: vi.fn(),
    };
    const messageService = {
        show: vi.fn(),
    };
    const transformer = {
        changeEnd$: new Subject(),
        resetProps: vi.fn(),
    };
    const editAreaChange$ = new Subject<void>();
    const scene = {
        getTransformerByCreate: () => transformer,
        fuzzyMathObjects: vi.fn(() => []),
        detachTransformerFrom: vi.fn(),
        attachTransformerTo: vi.fn(),
    };
    const docSelectionRenderService = {
        getActiveTextRange: vi.fn(() => ({
            getAbsolutePosition: () => ({
                left: 42,
                top: 0,
            }),
        })),
        getSegment: vi.fn(() => ''),
        setSegment: vi.fn(),
    };

    const renderManagerService = {
        getRenderById: () => ({
            scene,
            mainComponent: {
                getOffsetConfig: () => ({
                    docsLeft: 12,
                    docsTop: 18,
                }),
            },
            with: <T>(token: T) => {
                if (token === DocSkeletonManagerService) {
                    const viewModel = injector.get(DocSkeletonManagerService).getViewModel() as any;
                    viewModel.getEditArea = () => options?.editArea ?? DocumentEditArea.BODY;
                    viewModel.editAreaChange$ = editAreaChange$;

                    return {
                        getViewModel: () => viewModel,
                    } as T;
                }

                if (token === DocDrawingUpdateRenderController) {
                    return controller as T;
                }

                return injector.get(token as never);
            },
        }),
        getRenderUnitById: () => ({
            with: <T>(token: T) => {
                if (token === DocDrawingUpdateRenderController) {
                    return controller as T;
                }

                return injector.get(token as never);
            },
        }),
    };

    const testBed = createDocUiTestBed(options?.docData ?? createBaseDocData(), [
        [IRenderManagerService, { useValue: renderManagerService as never }],
        [IImageIoService, { useValue: imageIoService as never }],
        [IMessageService, { useValue: messageService as never }],
        [ILocalFileService, { useValue: fileOpenerService as never }],
        [DocSelectionRenderService, { useValue: docSelectionRenderService as never }],
    ]);

    injector = testBed.injector;
    testBed.get(LocaleService).load({
        enUS: {
            'update-status': {
                exceedMaxCount: 'exceed {0}',
                exceedMaxSize: 'size {0}',
                invalidImageType: 'invalid image type',
                invalidImage: 'invalid image',
            },
        } as never,
    });
    injector.add([DocDrawingService]);
    injector.add([IDocDrawingService, { useClass: DocDrawingService }]);
    injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
    injector.add([CoreDocDrawingController]);
    injector.add([DocDrawingAddRemoveController]);
    injector.add([DocRefreshDrawingsService]);

    const commandService = testBed.get(ICommandService);
    [
        InsertDocImageCommand,
        InsertDocDrawingCommand,
        RichTextEditingMutation as unknown as ICommand,
    ].forEach((command) => commandService.registerCommand(command));

    const selectionManager = testBed.get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({
        unitId: 'test-doc',
        subUnitId: 'test-doc',
    });
    selectionManager.__TEST_ONLY_add([{
        startOffset: 5,
        endOffset: 5,
        collapsed: true,
        isActive: true,
        segmentId: '',
        style: null as never,
    }]);

    const coreController = injector.get(CoreDocDrawingController);
    injector.get(DocDrawingAddRemoveController);
    coreController.loadDrawingDataForUnit('test-doc');

    controller = injector.createInstance(DocDrawingUpdateRenderController, {
        unit: testBed.doc,
        unitId: 'test-doc',
        scene,
        mainComponent: {
            getOffsetConfig: () => ({
                docsLeft: 12,
                docsTop: 18,
            }),
        },
    } as unknown as IRenderContext<DocumentDataModel>);

    return {
        ...testBed,
        commandService,
        selectionManager,
        controller,
        fileOpenerService,
        imageIoService,
        messageService,
        transformer,
        drawingManagerService: injector.get(IDrawingManagerService),
    };
}

describe('DocDrawingUpdateRenderController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns false when the user does not pick any image', async () => {
        const testBed = createRenderControllerTestBed({ files: [] });

        expect(await testBed.commandService.executeCommand(InsertDocImageCommand.id)).toBe(false);
        expect(testBed.fileOpenerService.openFile).toHaveBeenCalled();
        expect(testBed.messageService.show).not.toHaveBeenCalled();

        testBed.controller.dispose();
        testBed.univer.dispose();
    });

    it('blocks insertion when the selected image count exceeds the supported limit', async () => {
        const files = Array.from({ length: DRAWING_IMAGE_COUNT_LIMIT + 1 }, (_, index) => new File(['image'], `image-${index}.png`, { type: 'image/png' }));
        const testBed = createRenderControllerTestBed({ files });

        expect(await testBed.commandService.executeCommand(InsertDocImageCommand.id)).toBe(false);
        expect(testBed.messageService.show).toHaveBeenCalledWith(expect.objectContaining({
            type: MessageType.Error,
        }));

        testBed.controller.dispose();
        testBed.univer.dispose();
    });

    it('inserts images through the real doc drawing command chain and persists the final snapshot', async () => {
        const file = new File(['image'], 'hello.png', { type: 'image/png' });
        const testBed = createRenderControllerTestBed({ files: [file] });

        expect(await testBed.commandService.executeCommand(InsertDocImageCommand.id)).toBe(true);
        await new Promise((resolve) => setTimeout(resolve, 0));

        const docData = testBed.doc.getSnapshot();

        expect(docData?.drawingsOrder).toEqual(['image-1']);
        expect(docData?.drawings?.['image-1']).toMatchObject({
            drawingId: 'image-1',
            layoutType: PositionedObjectLayoutType.INLINE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
            docTransform: {
                positionH: {
                    posOffset: 42,
                },
            },
        });
        expect(testBed.doc.getBody()?.customBlocks).toEqual([{ startIndex: 5, blockId: 'image-1' }]);
        expect(testBed.imageIoService.addImageSourceCache).toHaveBeenCalled();
        expect(testBed.drawingManagerService.getDrawingByParam({ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'image-1' })).toMatchObject({
            drawingId: 'image-1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        });

        testBed.controller.dispose();
        testBed.univer.dispose();
    });

    it('surfaces upload failures through the message service and avoids mutating the document', async () => {
        const file = new File(['image'], 'bad.png', { type: 'image/png' });
        const testBed = createRenderControllerTestBed({
            files: [file],
            saveImageImpl: async () => {
                throw new Error(ImageUploadStatusType.ERROR_IMAGE_TYPE);
            },
        });

        expect(await testBed.commandService.executeCommand(InsertDocImageCommand.id)).toBe(true);
        expect(testBed.messageService.show).toHaveBeenCalledWith(expect.objectContaining({
            type: MessageType.Error,
        }));
        expect(testBed.doc.getSnapshot().drawingsOrder).toEqual([]);

        testBed.controller.dispose();
        testBed.univer.dispose();
    });

    it('marks inserted drawings as multi-transform when inserting in header or footer edit mode', async () => {
        const file = new File(['image'], 'header.png', { type: 'image/png' });
        const testBed = createRenderControllerTestBed({
            files: [file],
            editArea: DocumentEditArea.HEADER,
        });

        expect(await testBed.commandService.executeCommand(InsertDocImageCommand.id)).toBe(true);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(testBed.doc.getSnapshot().drawings?.['image-1']).toMatchObject({
            isMultiTransform: BooleanNumber.TRUE,
            transforms: [expect.any(Object)],
        });

        testBed.controller.dispose();
        testBed.univer.dispose();
    });
});
