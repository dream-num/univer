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

import { BooleanNumber, DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { SetDocDrawingArrangeCommand, UpdateDrawingDocTransformCommand } from '@univerjs/docs-drawing';
import { DocumentEditArea } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { GroupDocDrawingCommand } from '../../../commands/commands/group-doc-drawing.command';
import { UngroupDocDrawingCommand } from '../../../commands/commands/ungroup-doc-drawing.command';
import { DocDrawingUpdateRenderController } from '../doc-drawing-update.render-controller';

function createController(options: {
    editArea?: DocumentEditArea;
    drawings?: Record<string, unknown>;
    isFocusing?: boolean;
    openFile?: () => Promise<File[]>;
    saveImage?: (file: File) => Promise<unknown>;
} = {}) {
    const featurePluginOrderUpdate$ = new Subject<any>();
    const featurePluginUpdate$ = new Subject<any[]>();
    const featurePluginGroupUpdate$ = new Subject<any>();
    const featurePluginUngroupUpdate$ = new Subject<any>();
    const focus$ = new Subject<any[] | null>();
    const changeEnd$ = new Subject<any>();
    const editAreaChange$ = new Subject<void>();
    const refreshDrawings$ = new Subject<unknown>();
    const onFocus$ = new Subject<unknown>();
    const onBlur$ = new Subject<unknown>();
    const commandHandlers: Array<(command: { id: string; params?: Record<string, unknown> }) => void> = [];
    let editArea = options.editArea ?? DocumentEditArea.BODY;
    let isFocusing = options.isFocusing ?? true;

    const transformer = {
        changeEnd$,
        resetProps: vi.fn(),
    };
    const shapeByDrawingId = new Map<string, any>();
    const scene = {
        getTransformerByCreate: vi.fn(() => transformer),
        fuzzyMathObjects: vi.fn((objectKey: string) => {
            const drawingId = objectKey.split('#-#').at(-1) ?? objectKey;
            if (!shapeByDrawingId.has(drawingId)) {
                shapeByDrawingId.set(drawingId, {
                    drawingId,
                    setOpacity: vi.fn(),
                });
            }
            return [shapeByDrawingId.get(drawingId)];
        }),
        attachTransformerTo: vi.fn(),
        detachTransformerFrom: vi.fn(),
    };
    const viewModel = {
        editAreaChange$,
        getEditArea: vi.fn(() => editArea),
    };
    const renderUnit = {
        with: vi.fn(() => ({
            getViewModel: () => viewModel,
        })),
    };
    const snapshot = {
        body: {
            customBlocks: [
                { blockId: 'body-drawing', startIndex: 4 },
            ],
        },
        headers: {
            'header-1': {
                body: {
                    customBlocks: [
                        { blockId: 'header-drawing', startIndex: 2 },
                    ],
                },
            },
        },
        footers: {
            'footer-1': {
                body: {
                    customBlocks: [
                        { blockId: 'footer-drawing', startIndex: 7 },
                    ],
                },
            },
        },
        drawings: options.drawings ?? {},
    };
    const context = {
        unitId: 'doc-1',
        unit: {
            getDrawings: vi.fn(() => snapshot.drawings),
            getSnapshot: vi.fn(() => snapshot),
        },
        scene,
        mainComponent: {
            getOffsetConfig: () => ({ docsLeft: 12, docsTop: 18 }),
        },
    };
    const commandService = {
        executeCommand: vi.fn(),
        onCommandExecuted: vi.fn((handler) => {
            commandHandlers.push(handler);
            return { dispose: vi.fn() };
        }),
    };
    const docSelectionManagerService = {
        getActiveTextRange: vi.fn(() => null),
        refreshSelection: vi.fn(),
        replaceDocRanges: vi.fn(),
    };
    const renderManagerSrv = {
        getRenderUnitById: vi.fn(() => renderUnit),
    };
    const docDrawingService = {
        focusDrawing: vi.fn(),
        getDrawingByParam: vi.fn(({ drawingId }: { drawingId: string }) => options.drawings?.[drawingId]),
    };
    const drawingManagerService = {
        featurePluginUpdate$,
        featurePluginOrderUpdate$,
        featurePluginGroupUpdate$,
        featurePluginUngroupUpdate$,
        focus$,
        getDrawingByParam: vi.fn(({ drawingId }: { drawingId: string }) => options.drawings?.[drawingId]),
    };
    const contextService = {
        setContextValue: vi.fn(),
    };
    const docSelectionRenderService = {
        get isFocusing() {
            return isFocusing;
        },
        getActiveTextRange: vi.fn(() => null),
        getAllTextRanges: vi.fn(() => []),
        getSegment: vi.fn(() => ''),
        onBlur$,
        onFocus$,
        setSegment: vi.fn(),
    };
    const imageIoService = {
        addImageSourceCache: vi.fn(),
        saveImage: vi.fn(options.saveImage),
    };
    const fileOpenerService = {
        openFile: vi.fn(options.openFile ?? (async () => [])),
    };

    const controller = new DocDrawingUpdateRenderController(
        context as never,
        commandService as never,
        docSelectionManagerService as never,
        renderManagerSrv as never,
        imageIoService as never,
        docDrawingService as never,
        drawingManagerService as never,
        contextService as never,
        { show: vi.fn() } as never,
        { t: vi.fn((key: string) => key) } as never,
        docSelectionRenderService as never,
        { refreshDrawings$ } as never,
        fileOpenerService as never
    );

    return {
        controller,
        commandHandlers,
        commandService,
        contextService,
        docDrawingService,
        docSelectionManagerService,
        docSelectionRenderService,
        drawingManagerService,
        editAreaChange$,
        featurePluginUpdate$,
        focus$,
        getShape: (drawingId: string) => shapeByDrawingId.get(drawingId),
        onBlur$,
        onFocus$,
        refreshDrawings$,
        scene,
        setEditArea: (value: DocumentEditArea) => {
            editArea = value;
        },
        setIsFocusing: (value: boolean) => {
            isFocusing = value;
        },
        transformer,
    };
}

describe('DocDrawingUpdateRenderController', () => {
    it('persists inline image crop data without moving its text anchor', () => {
        const drawing = {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingId: 'body-drawing',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            layoutType: PositionedObjectLayoutType.INLINE,
            transform: { left: 10, top: 20, width: 100, height: 80 },
            docTransform: {
                size: { width: 100, height: 80 },
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 10 },
                positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 20 },
                angle: 0,
            },
        };
        const { commandService, featurePluginUpdate$ } = createController({ drawings: { 'body-drawing': drawing } });

        featurePluginUpdate$.next([{
            ...drawing,
            transform: { left: 25, top: 30, width: 70, height: 60 },
            srcRect: { left: 15, top: 10, right: 15, bottom: 10 },
        }]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(UpdateDrawingDocTransformCommand.id, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawings: [
                { drawingId: 'body-drawing', key: 'srcRect', value: { left: 15, top: 10, right: 15, bottom: 10 } },
                { drawingId: 'body-drawing', key: 'size', value: { width: 70, height: 60 } },
            ],
        });
    });

    it('persists floating crop position and ignores unrelated drawing updates', () => {
        const drawing = {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingId: 'body-drawing',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            transform: { left: 10, top: 20, width: 100, height: 80 },
            docTransform: {
                size: { width: 100, height: 80 },
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 40 },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 50 },
                angle: 0,
            },
        };
        const { commandService, featurePluginUpdate$ } = createController({ drawings: { 'body-drawing': drawing } });

        featurePluginUpdate$.next([{ ...drawing, transform: { left: 12, top: 24, width: 90, height: 70 } }]);
        featurePluginUpdate$.next([{ ...drawing, unitId: 'other-doc', srcRect: null }]);
        expect(commandService.executeCommand).not.toHaveBeenCalled();

        featurePluginUpdate$.next([{
            ...drawing,
            transform: { left: 25, top: 26, width: 70, height: 60 },
            srcRect: { left: 15, top: 6, right: 15, bottom: 14 },
        }]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(UpdateDrawingDocTransformCommand.id, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawings: [
                { drawingId: 'body-drawing', key: 'srcRect', value: { left: 15, top: 6, right: 15, bottom: 14 } },
                { drawingId: 'body-drawing', key: 'size', value: { width: 70, height: 60 } },
                { drawingId: 'body-drawing', key: 'positionH', value: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 55 } },
                { drawingId: 'body-drawing', key: 'positionV', value: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 56 } },
            ],
        });
    });

    it('persists shared crop data for repeated header and footer drawings without moving each occurrence', () => {
        const drawing = {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingId: 'header-drawing',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            isMultiTransform: BooleanNumber.TRUE,
            transform: { left: 10, top: 20, width: 100, height: 80 },
            transforms: [
                { left: 10, top: 20, width: 100, height: 80 },
                { left: 10, top: 820, width: 100, height: 80 },
            ],
            docTransform: {
                size: { width: 100, height: 80 },
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 10 },
                positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 20 },
                angle: 0,
            },
        };
        const { commandService, featurePluginUpdate$ } = createController({ drawings: { 'header-drawing': drawing } });

        featurePluginUpdate$.next([{ ...drawing, srcRect: { left: 10, top: 0, right: 10, bottom: 0 } }]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(UpdateDrawingDocTransformCommand.id, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawings: [
                { drawingId: 'header-drawing', key: 'srcRect', value: { left: 10, top: 0, right: 10, bottom: 0 } },
                { drawingId: 'header-drawing', key: 'size', value: { width: 100, height: 80 } },
            ],
        });
    });

    it('forwards drawing order and group events to doc drawing commands', () => {
        const { commandService, drawingManagerService } = createController();

        drawingManagerService.featurePluginOrderUpdate$.next({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingIds: ['drawing-1'],
            arrangeType: 'forward',
        });
        drawingManagerService.featurePluginGroupUpdate$.next({ unitId: 'doc-1', drawingIds: ['a', 'b'] });
        drawingManagerService.featurePluginUngroupUpdate$.next({ unitId: 'doc-1', drawingIds: ['group-1'] });

        expect(commandService.executeCommand).toHaveBeenNthCalledWith(1, SetDocDrawingArrangeCommand.id, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingIds: ['drawing-1'],
            arrangeType: 'forward',
        });
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(2, GroupDocDrawingCommand.id, { unitId: 'doc-1', drawingIds: ['a', 'b'] });
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(3, UngroupDocDrawingCommand.id, { unitId: 'doc-1', drawingIds: ['group-1'] });
    });

    it('keeps document selection and segment in sync when drawings gain or lose focus', () => {
        const {
            contextService,
            docDrawingService,
            docSelectionManagerService,
            docSelectionRenderService,
            focus$,
            transformer,
        } = createController();

        focus$.next([]);
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_COMMON_DRAWINGS, false);
        expect(docDrawingService.focusDrawing).toHaveBeenCalledWith([]);
        expect(transformer.resetProps).toHaveBeenLastCalledWith({ zeroTop: 0, zeroLeft: 0 });

        focus$.next([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'body-drawing' }]);
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_COMMON_DRAWINGS, true);
        expect(docDrawingService.focusDrawing).toHaveBeenLastCalledWith([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'body-drawing' }]);
        expect(docSelectionManagerService.replaceDocRanges).toHaveBeenCalledWith([{ startOffset: 4, endOffset: 5 }]);
        expect(docSelectionRenderService.setSegment).not.toHaveBeenCalled();
        expect(transformer.resetProps).toHaveBeenLastCalledWith({ zeroTop: 18, zeroLeft: 12 });

        focus$.next([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'header-drawing' }]);
        expect(docSelectionRenderService.setSegment).toHaveBeenCalledWith('header-1');
    });

    it('refreshes doc selection after transformer changes finish', async () => {
        vi.useFakeTimers();
        const { docSelectionManagerService, transformer } = createController();

        transformer.changeEnd$.next({});
        await vi.advanceTimersByTimeAsync(30);

        expect(docSelectionManagerService.refreshSelection).toHaveBeenCalledTimes(1);
        vi.useRealTimers();
    });

    it('cancels an image insertion when the render controller is disposed while saving', async () => {
        let finishSaving: (value: unknown) => void = () => {};
        const saveImage = vi.fn(() => new Promise<unknown>((resolve) => {
            finishSaving = resolve;
        }));
        const { commandService, controller } = createController({
            openFile: async () => [{} as File],
            saveImage,
        });

        const insertion = controller.insertDocImage();
        await vi.waitFor(() => expect(saveImage).toHaveBeenCalledTimes(1));

        controller.dispose();
        finishSaving({
            imageId: 'image-1',
            imageSourceType: 'URL',
            source: 'image.png',
            base64Cache: 'data:image/png;base64,',
        });

        await expect(insertion).resolves.toBe(false);
        expect(commandService.executeCommand).not.toHaveBeenCalled();
    });

    it('toggles drawing editability between body and header/footer edit areas', () => {
        const bodyDrawing = {
            drawingId: 'body-drawing',
            isMultiTransform: BooleanNumber.FALSE,
        };
        const headerDrawing = {
            drawingId: 'header-drawing',
            isMultiTransform: BooleanNumber.TRUE,
        };
        const { editAreaChange$, getShape, scene, setEditArea } = createController({
            drawings: {
                'body-drawing': bodyDrawing,
                'header-drawing': headerDrawing,
            },
        });

        expect(scene.attachTransformerTo).toHaveBeenCalledWith(getShape('body-drawing'));
        expect(getShape('body-drawing').setOpacity).toHaveBeenLastCalledWith(1);
        expect(getShape('header-drawing').setOpacity).toHaveBeenLastCalledWith(0.5);

        scene.attachTransformerTo.mockClear();
        setEditArea(DocumentEditArea.HEADER);
        editAreaChange$.next();

        expect(scene.attachTransformerTo).toHaveBeenCalledWith(getShape('header-drawing'));
        expect(getShape('header-drawing').setOpacity).toHaveBeenLastCalledWith(1);
        expect(getShape('body-drawing').setOpacity).toHaveBeenLastCalledWith(0.5);
    });

    it('keeps all drawings opaque while the document input is not focused', () => {
        const bodyDrawing = {
            drawingId: 'body-drawing',
            isMultiTransform: BooleanNumber.FALSE,
        };
        const headerDrawing = {
            drawingId: 'header-drawing',
            isMultiTransform: BooleanNumber.TRUE,
        };
        const {
            getShape,
            onBlur$,
            onFocus$,
            scene,
            setIsFocusing,
        } = createController({
            drawings: {
                'body-drawing': bodyDrawing,
                'header-drawing': headerDrawing,
            },
            isFocusing: false,
        });

        expect(scene.attachTransformerTo).not.toHaveBeenCalled();
        expect(getShape('body-drawing').setOpacity).toHaveBeenLastCalledWith(1);
        expect(getShape('header-drawing').setOpacity).toHaveBeenLastCalledWith(1);

        setIsFocusing(true);
        onFocus$.next({});

        expect(scene.attachTransformerTo).toHaveBeenCalledWith(getShape('body-drawing'));
        expect(getShape('body-drawing').setOpacity).toHaveBeenLastCalledWith(1);
        expect(getShape('header-drawing').setOpacity).toHaveBeenLastCalledWith(0.5);

        setIsFocusing(false);
        onBlur$.next({});

        expect(getShape('body-drawing').setOpacity).toHaveBeenLastCalledWith(1);
        expect(getShape('header-drawing').setOpacity).toHaveBeenLastCalledWith(1);
    });

    it('ignores rich text mutations from other document units', async () => {
        const { commandHandlers, getShape, scene } = createController({
            drawings: {
                'body-drawing': {
                    drawingId: 'body-drawing',
                    isMultiTransform: BooleanNumber.FALSE,
                },
            },
        });

        scene.attachTransformerTo.mockClear();
        getShape('body-drawing').setOpacity.mockClear();

        commandHandlers.forEach((handler) => handler({
            id: RichTextEditingMutation.id,
            params: { unitId: 'other-doc' },
        }));
        await Promise.resolve();

        expect(scene.attachTransformerTo).not.toHaveBeenCalled();
        expect(getShape('body-drawing').setOpacity).not.toHaveBeenCalled();

        commandHandlers.forEach((handler) => handler({
            id: RichTextEditingMutation.id,
            params: { unitId: 'doc-1' },
        }));
        await Promise.resolve();

        expect(scene.attachTransformerTo).toHaveBeenCalledWith(getShape('body-drawing'));
        expect(getShape('body-drawing').setOpacity).toHaveBeenCalledWith(1);
    });
});
