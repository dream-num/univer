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

import { BooleanNumber, DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS, ObjectRelativeFromH, ObjectRelativeFromV, PermissionService, PositionedObjectLayoutType } from '@univerjs/core';
import { RichTextEditingMutation, setDocumentPermissionValue } from '@univerjs/docs';
import { SetDocDrawingArrangeCommand, UpdateDrawingDocTransformCommand } from '@univerjs/docs-drawing';
import { DocumentEditArea } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
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
    const add$ = new Subject<Array<{ unitId: string }>>();
    const update$ = new Subject<Array<{ unitId: string }>>();
    const changeEnd$ = new Subject<any>();
    const editAreaChange$ = new Subject<void>();
    const refreshDrawings$ = new Subject<unknown>();
    const onFocus$ = new Subject<unknown>();
    const onBlur$ = new Subject<unknown>();
    const commandHandlers: Array<(command: { id: string; params?: Record<string, unknown> }) => void> = [];
    let editArea = options.editArea ?? DocumentEditArea.BODY;
    let isFocusing = options.isFocusing ?? true;
    let focusDrawings: Array<{ unitId: string; subUnitId: string; drawingId: string }> = [];

    focus$.subscribe((drawings) => {
        focusDrawings = drawings ?? [];
    });

    const transformer = {
        changeEnd$,
        clearControlByIds: vi.fn(),
        resetProps: vi.fn(),
    };
    const shapeByDrawingId = new Map<string, any>();
    const getShape = (drawingId: string) => {
        if (!shapeByDrawingId.has(drawingId)) {
            shapeByDrawingId.set(drawingId, {
                drawingId,
                evented: true,
                oKey: `doc-1#-#doc-1#-#${drawingId}`,
                setOpacity: vi.fn(),
                transformerConfig: {},
            });
        }
        return shapeByDrawingId.get(drawingId);
    };
    Object.keys(options.drawings ?? {}).forEach(getShape);
    const scene = {
        getTransformerByCreate: vi.fn(() => transformer),
        fuzzyMathObjects: vi.fn((objectKey: string) => {
            const drawingId = objectKey.split('#-#').at(-1) ?? objectKey;
            return [getShape(drawingId)];
        }),
        getAllObjects: vi.fn(() => [...shapeByDrawingId.values()]),
        attachTransformerTo: vi.fn(),
        detachTransformerFrom: vi.fn(),
        getTransformer: vi.fn(() => transformer),
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
            dataStream: 'abcdefghij\r\n',
            customBlocks: [
                { blockId: 'body-drawing', startIndex: 4 },
            ],
        },
        headers: {
            'header-1': {
                body: {
                    dataStream: 'abcdefghij\r\n',
                    customBlocks: [
                        { blockId: 'header-drawing', startIndex: 2 },
                    ],
                },
            },
        },
        footers: {
            'footer-1': {
                body: {
                    dataStream: 'abcdefghij\r\n',
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
            getMutationRevision: vi.fn(() => 0),
            getSnapshot: vi.fn(() => snapshot),
            getBody: vi.fn(() => snapshot.body),
            getSelfOrHeaderFooterModel: vi.fn((segmentId: string) => ({
                getBody: () => segmentId ? snapshot.headers[segmentId as keyof typeof snapshot.headers]?.body ?? snapshot.footers[segmentId as keyof typeof snapshot.footers]?.body : snapshot.body,
            })),
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
        add$,
        featurePluginUpdate$,
        featurePluginOrderUpdate$,
        featurePluginGroupUpdate$,
        featurePluginUngroupUpdate$,
        focus$,
        update$,
        getDrawingByParam: vi.fn(({ drawingId }: { drawingId: string }) => options.drawings?.[drawingId]),
        focusDrawing: vi.fn(),
        getFocusDrawings: vi.fn(() => focusDrawings),
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

    const permissionService = new PermissionService();
    const controller = new DocDrawingUpdateRenderController(
        context as never,
        commandService as never,
        docSelectionManagerService as never,
        renderManagerSrv as never,
        imageIoService as never,
        docDrawingService as never,
        drawingManagerService as never,
        permissionService,
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
        permissionService,
        refreshDrawings$,
        scene,
        setEditArea: (value: DocumentEditArea) => {
            editArea = value;
        },
        setIsFocusing: (value: boolean) => {
            isFocusing = value;
        },
        transformer,
        update$,
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

    it('does not open the image picker when Document Edit is denied', async () => {
        const openFile = vi.fn(async () => [{} as File]);
        const { commandService, controller, permissionService } = createController({ openFile });
        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, false);

        await expect(controller.insertDocImage()).resolves.toBe(false);

        expect(openFile).not.toHaveBeenCalled();
        expect(commandService.executeCommand).not.toHaveBeenCalled();
    });

    it('does not insert an image when Document Edit is revoked during upload', async () => {
        let finishSaving: (value: unknown) => void = () => {};
        const saveImage = vi.fn(() => new Promise<unknown>((resolve) => {
            finishSaving = resolve;
        }));
        const { commandService, controller, permissionService } = createController({
            openFile: async () => [{} as File],
            saveImage,
        });

        const insertion = controller.insertDocImage();
        await vi.waitFor(() => expect(saveImage).toHaveBeenCalledTimes(1));
        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, false);
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

    it('removes read-only drawings from picking and transformer interaction, then restores both', async () => {
        const { getShape, permissionService, scene, transformer } = createController({
            drawings: {
                'body-drawing': {
                    drawingId: 'body-drawing',
                    isMultiTransform: BooleanNumber.FALSE,
                },
            },
        });

        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, false);

        expect(getShape('body-drawing').evented).toBe(false);
        expect(transformer.clearControlByIds).toHaveBeenCalledWith(['doc-1#-#doc-1#-#body-drawing']);
        expect(getShape('body-drawing').transformerConfig).toMatchObject({
            moveEnabled: false,
            resizeEnabled: false,
            rotateEnabled: false,
        });

        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, true);
        expect(getShape('body-drawing').evented).toBe(true);
        expect(scene.attachTransformerTo).toHaveBeenLastCalledWith(getShape('body-drawing'));
        expect(getShape('body-drawing').transformerConfig).not.toHaveProperty('moveEnabled', false);
        expect(getShape('body-drawing').transformerConfig).not.toHaveProperty('resizeEnabled', false);
        expect(getShape('body-drawing').transformerConfig).not.toHaveProperty('rotateEnabled', false);
    });

    it('keeps a remotely updated drawing non-interactive while local permission is read-only', async () => {
        const { getShape, permissionService, scene, update$ } = createController({
            drawings: {
                'body-drawing': {
                    drawingId: 'body-drawing',
                    isMultiTransform: BooleanNumber.FALSE,
                },
            },
        });
        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, false);
        scene.attachTransformerTo.mockClear();

        update$.next([{ unitId: 'doc-1' }]);
        await Promise.resolve();

        expect(getShape('body-drawing').evented).toBe(false);
        expect(scene.attachTransformerTo).not.toHaveBeenCalled();
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

    it('indexes scene drawings once and ignores duplicate focus notifications', () => {
        const { getShape, onFocus$, scene } = createController({
            drawings: {
                'body-drawing': {
                    drawingId: 'body-drawing',
                    isMultiTransform: BooleanNumber.FALSE,
                },
                'header-drawing': {
                    drawingId: 'header-drawing',
                    isMultiTransform: BooleanNumber.TRUE,
                },
            },
            isFocusing: true,
        });

        expect(scene.getAllObjects).toHaveBeenCalledTimes(1);
        expect(scene.fuzzyMathObjects).not.toHaveBeenCalled();
        getShape('body-drawing').setOpacity.mockClear();
        getShape('header-drawing').setOpacity.mockClear();

        onFocus$.next({});

        expect(scene.getAllObjects).toHaveBeenCalledTimes(1);
        expect(getShape('body-drawing').setOpacity).not.toHaveBeenCalled();
        expect(getShape('header-drawing').setOpacity).not.toHaveBeenCalled();
    });

    it('keeps peer drawings interactive while a drawing owns focus', () => {
        const {
            focus$,
            getShape,
            scene,
        } = createController({
            drawings: {
                'body-drawing': {
                    drawingId: 'body-drawing',
                    isMultiTransform: BooleanNumber.FALSE,
                },
                'peer-drawing': {
                    drawingId: 'peer-drawing',
                    isMultiTransform: BooleanNumber.FALSE,
                },
            },
            isFocusing: false,
        });

        scene.attachTransformerTo.mockClear();
        focus$.next([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'body-drawing' }]);

        expect(scene.attachTransformerTo).toHaveBeenCalledWith(getShape('body-drawing'));
        expect(scene.attachTransformerTo).toHaveBeenCalledWith(getShape('peer-drawing'));
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
