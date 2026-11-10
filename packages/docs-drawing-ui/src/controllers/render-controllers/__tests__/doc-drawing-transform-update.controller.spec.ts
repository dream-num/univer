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

import type { IDrawingParam } from '@univerjs/core';
import type { IImageData } from '@univerjs/drawing';
import {
    AlignTypeH,
    AlignTypeV,
    BooleanNumber,
    DrawingTypeEnum,
    ICommandService,
    IImageIoService,
    ImageSourceType,
    IURLImageService,
    JSONX,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import {
    getDrawingShapeKeyByDrawingSearch,
    IDrawingManagerService,
    OleService,
    SetDrawingSelectedOperation,
} from '@univerjs/drawing';
import { DrawingImageClipService, DrawingRenderService, OleUIService } from '@univerjs/drawing-ui';
import { DrawingUpdateController } from '@univerjs/drawing-ui/controllers/drawing-update.controller.ts';
import { ImageUpdateController } from '@univerjs/drawing-ui/controllers/image-update.controller.ts';
import {
    Documents,
    DocumentSkeletonPageType,
    Liquid,
    Rect,
    setDocsTableRenderViewportProvider,
} from '@univerjs/engine-render';
import {
    DesktopDialogService,
    DesktopGalleryService,
    DesktopMessageService,
    DesktopNotificationService,
    IDialogService,
    IGalleryService,
    IMessageService,
    INotificationService,
    IUIPartsService,
    UIPartsService,
} from '@univerjs/ui';
import { EMPTY, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DocumentDrawingPublicationProgress } from '../doc-drawing-transform-update.controller';
import { createDocDrawingTestBed } from '../../../__tests__/create-doc-drawing-test-bed';
import { getDocsTableCellAnchorContext } from '../../doc-drawing-transformer-update.controller';
import { doesDocMutationAffectDrawingPresentation, getDocMutationAffectedDrawingIds } from '../doc-drawing-mutation';
import {
    DocDrawingPublicationTracker,
    DocDrawingTransformUpdateController,
    getDocsDrawingBehindText,
    getDocsDrawingClipPage,
    getDocsDrawingPageClipBounds,
    getDocsOverlayRuntimeDrawing,
    getDocsPageRelativeDrawingAnchorPage,
    getDocsPageRelativeDrawingLeft,
    getDocsPageRelativeDrawingTop,
    getDocsTableCellDrawingOffset,
    shouldRefreshDocDrawingTransform,
} from '../doc-drawing-transform-update.controller';

async function createRepeatedImageTestBed(unitId: string) {
    const testBed = createDocDrawingTestBed(unitId);
    const { univer, model, render } = testBed;
    const injector = univer.__getInjector();
    const manager = injector.get(IDrawingManagerService);
    const snapshot = model.getSnapshot();
    snapshot.body!.customBlocks = snapshot.body!.customBlocks!.filter(({ blockId }) => blockId !== 'a');
    snapshot.body!.paragraphs![1].paragraphStyle = { pageBreakBefore: BooleanNumber.TRUE };
    snapshot.headers = { header: {
        headerId: 'header',
        body: {
            dataStream: '\b\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'header-p' }],
            sectionBreaks: [{ startIndex: 2, sectionId: 'header-s' }],
            customBlocks: [{ startIndex: 0, blockId: 'a' }],
        },
    } };
    snapshot.documentStyle!.defaultHeaderId = 'header';
    const drawing = snapshot.drawings!.a;
    Object.assign(drawing, {
        source: 'cached-header-image',
        imageSourceType: ImageSourceType.BASE64,
        isMultiTransform: BooleanNumber.TRUE,
        transforms: [drawing.transform!],
    });
    model.reset(snapshot);
    Object.assign(manager.getDrawingByParam(drawing)!, drawing);
    const cachedImage = document.createElement('img');
    Object.defineProperties(cachedImage, {
        complete: { value: true },
        naturalWidth: { value: 40 },
        naturalHeight: { value: 30 },
    });
    injector.add([IImageIoService, { useValue: {
        change$: EMPTY,
        setWaitCount: () => {},
        getImage: async () => '',
        saveImage: async () => null,
        getImageSourceCache: () => cachedImage,
        addImageSourceCache: () => {},
    } }]);
    injector.add([IURLImageService, { useValue: {
        getImage: async (url: string) => url,
        downloadImage: async () => new Blob(),
        registerURLImageDownloader: () => ({ dispose: () => {} }),
    } }]);
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IGalleryService, { useClass: DesktopGalleryService }]);
    injector.add([IDialogService, { useClass: DesktopDialogService }]);
    injector.add([IMessageService, { useClass: DesktopMessageService }]);
    injector.add([INotificationService, { useClass: DesktopNotificationService }]);
    injector.add([OleService]);
    injector.add([OleUIService]);
    injector.add([DrawingImageClipService]);
    injector.add([DrawingRenderService]);
    injector.add([DrawingUpdateController]);
    injector.add([ImageUpdateController]);
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.get(ICommandService).registerCommand(SetDrawingSelectedOperation);
    injector.get(DrawingUpdateController);
    injector.get(ImageUpdateController);
    const skeletonManager = render.with(DocSkeletonManagerService);
    skeletonManager.getViewModel().reset(model);
    skeletonManager.getSkeleton().makeDirty(true);
    skeletonManager.recalculate();
    expect(skeletonManager.getSkeleton().getSkeletonData()!.pages).toHaveLength(2);
    render.mainComponent = new Documents(`${unitId}-document`);
    render.addRenderDependencies([[DocDrawingTransformUpdateController]]);
    const controller = render.with(DocDrawingTransformUpdateController);
    expect(manager.getDrawingByParam(drawing)).toMatchObject({ hidden: false, transforms: [expect.anything(), expect.anything()] });
    manager.addNotification([drawing]);
    await vi.advanceTimersByTimeAsync(34);
    return { ...testBed, manager, drawing, controller, commands: injector.get(ICommandService) };
}

describe('DocDrawingTransformUpdateController', () => {
    afterEach(() => {
        setDocsTableRenderViewportProvider(null);
    });

    it('keeps published header images while pages are appended and removes only surplus instances', () => {
        const { univer, render } = createDocDrawingTestBed('header-publication');
        try {
            const injector = univer.__getInjector();
            injector.add([IEditorService, { useClass: EditorService }]);
            render.mainComponent = new Documents('header-document');
            render.addRenderDependencies([[DocDrawingTransformUpdateController]]);
            const controller = render.with(DocDrawingTransformUpdateController) as unknown as {
                _handleMultiDrawingsTransform: (drawings: IDrawingParam[]) => void;
            };
            const manager = injector.get(IDrawingManagerService);
            const drawing = manager.getDrawingByParam({
                unitId: render.unitId,
                subUnitId: render.unitId,
                drawingId: 'a',
            })!;
            Object.assign(drawing, {
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                isMultiTransform: BooleanNumber.TRUE,
                hidden: false,
                selectable: true,
                behindText: false,
                transforms: [{ ...drawing.transform }],
            });
            const first = new Rect(getDrawingShapeKeyByDrawingSearch(drawing, 0), drawing.transform ?? undefined);
            render.scene.addObject(first);
            const remove = vi.spyOn(manager, 'removeNotification');
            const refresh = vi.spyOn(manager, 'refreshTransform');
            const update = { ...drawing, transforms: drawing.transforms!.map((transform) => ({ ...transform })) };

            controller._handleMultiDrawingsTransform([update]);
            expect(remove).not.toHaveBeenCalled();
            expect(refresh).not.toHaveBeenCalled();

            update.transforms = [...update.transforms, { ...drawing.transform, top: 500 }];
            controller._handleMultiDrawingsTransform([update]);
            expect(remove).not.toHaveBeenCalled();
            expect(refresh).toHaveBeenCalledTimes(1);
            expect(render.scene.getObjectIncludeInGroup(first.oKey)).toBe(first);

            const second = new Rect(getDrawingShapeKeyByDrawingSearch(drawing, 1), update.transforms[1]);
            render.scene.addObject(second);
            const transformer = render.scene.getTransformerByCreate();
            transformer.setSelectedControl(first);
            transformer.setSelectedControl(second);
            controller._handleMultiDrawingsTransform([{ ...update, transforms: update.transforms.slice(0, 1) }]);
            expect(render.scene.getObjectIncludeInGroup(first.oKey)).toBe(first);
            expect(render.scene.getObjectIncludeInGroup(second.oKey)).toBeFalsy();
            expect([...transformer.getSelectedObjectMap().values()]).toEqual([first]);
            expect(remove).not.toHaveBeenCalled();

            controller._handleMultiDrawingsTransform([]);
            expect(remove).toHaveBeenCalledWith([drawing]);
        } finally {
            univer.dispose();
            vi.restoreAllMocks();
        }
    });

    it('retains published repeated images while a new layout temporarily omits their header resources', async () => {
        vi.useFakeTimers();
        const { univer, render, drawing, manager, controller } = await createRepeatedImageTestBed('partial-header-resources');
        try {
            const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
            const data = skeleton.getSkeletonData()!;
            const headers = data.skeHeaders;
            const key = getDrawingShapeKeyByDrawingSearch(drawing, 0);
            const original = render.scene.getObject(key);
            const remove = vi.spyOn(manager, 'removeNotification');
            const refresh = controller as unknown as { _refreshDrawing(currentSkeleton: typeof skeleton): void };
            expect(original).toBeTruthy();

            skeleton.beginExternalLayout({ reason: 'edit' });
            expect(skeleton.hasCompleteLayout()).toBe(true);
            expect(skeleton.getLayoutProgress()?.complete).toBe(false);
            data.skeHeaders = new Map();
            refresh._refreshDrawing(skeleton);
            await vi.advanceTimersByTimeAsync(34);

            expect(remove).not.toHaveBeenCalled();
            expect(render.scene.getObject(key)).toBe(original);
            data.skeHeaders = headers;
            refresh._refreshDrawing(skeleton);
            await vi.advanceTimersByTimeAsync(34);
            expect(render.scene.getObject(key)).toBe(original);
            expect(original).toHaveProperty('visible', true);
        } finally {
            univer.dispose();
            vi.restoreAllMocks();
            vi.useRealTimers();
        }
    });

    it('publishes changed crop metadata for repeated images even when their layout is unchanged', () => {
        const { univer, model, render } = createDocDrawingTestBed('header-crop-edit');
        try {
            const injector = univer.__getInjector();
            const commands = injector.get(ICommandService);
            const manager = injector.get(IDrawingManagerService);
            const drawing = model.getSnapshot().drawings!.a;
            drawing.isMultiTransform = BooleanNumber.TRUE;
            drawing.transforms = [drawing.transform!];
            Object.assign(manager.getDrawingByParam(drawing)!, drawing);
            render.with(DocSkeletonManagerService).recalculate();
            injector.add([IEditorService, { useClass: EditorService }]);
            render.mainComponent = new Documents('header-crop-document');
            render.addRenderDependencies([[DocDrawingTransformUpdateController]]);
            render.with(DocDrawingTransformUpdateController);
            const publishedCrops: unknown[] = [];
            const subscription = manager.add$.subscribe((drawings) => {
                for (const published of drawings) {
                    if (published.drawingId === drawing.drawingId) {
                        publishedCrops.push((manager.getDrawingByParam(published) as IImageData | undefined)?.srcRect);
                    }
                }
            });
            try {
                const crop = { left: 0.2, top: 0.1, right: 0, bottom: 0 };
                const jsonX = JSONX.getInstance();
                expect(commands.syncExecuteCommand(RichTextEditingMutation.id, {
                    unitId: render.unitId,
                    actions: jsonX.insertOp(['drawings', drawing.drawingId, 'srcRect'], crop),
                    textRanges: null,
                })).toBeTruthy();
                expect(model.getSnapshot().drawings!.a).toMatchObject({ srcRect: crop });
                expect(publishedCrops).toContainEqual(crop);

                expect(commands.syncExecuteCommand(RichTextEditingMutation.id, {
                    unitId: render.unitId,
                    actions: jsonX.replaceOp(['drawings', drawing.drawingId, 'srcRect'], crop, null),
                    textRanges: null,
                })).toBeTruthy();
                expect(publishedCrops[publishedCrops.length - 1]).toBeNull();
            } finally {
                subscription.unsubscribe();
            }
        } finally {
            univer.dispose();
            vi.restoreAllMocks();
        }
    });

    it('batches changeset appearance edits and publishes the final repeated image after queued microtasks', async () => {
        vi.useFakeTimers();
        const { univer, model, render, drawing, manager, commands } = await createRepeatedImageTestBed('header-changeset-edit');
        try {
            const key = getDrawingShapeKeyByDrawingSearch(drawing, 0);
            const original = render.scene.getObject(key);
            expect(original).toBeTruthy();
            const add = vi.spyOn(manager, 'addNotification');
            const remove = vi.spyOn(manager, 'removeNotification');
            const firstCrop = { left: 0.1, top: 0, right: 0, bottom: 0 };
            const finalCrop = { left: 0.2, top: 0.1, right: 0, bottom: 0 };
            const jsonX = JSONX.getInstance();
            for (const actions of [
                jsonX.insertOp(['drawings', drawing.drawingId, 'srcRect'], firstCrop),
                jsonX.replaceOp(['drawings', drawing.drawingId, 'srcRect'], firstCrop, finalCrop),
            ]) {
                expect(commands.syncExecuteCommand(RichTextEditingMutation.id, {
                    unitId: render.unitId,
                    actions,
                    textRanges: null,
                }, { fromChangeset: true })).toBeTruthy();
            }
            expect(model.getSnapshot().drawings!.a).toMatchObject({ srcRect: finalCrop });
            expect(remove).not.toHaveBeenCalled();
            expect(add).not.toHaveBeenCalled();
            expect(render.scene.getObject(key)).toBe(original);

            await Promise.resolve();
            expect(remove).not.toHaveBeenCalled();
            await Promise.resolve();
            expect(remove).toHaveBeenCalledTimes(1);
            expect(add).toHaveBeenCalledTimes(1);
            await vi.advanceTimersByTimeAsync(34);

            const replacement = render.scene.getObject(key);
            expect(replacement).toBeTruthy();
            expect(replacement).not.toBe(original);
            expect(replacement).toHaveProperty('srcRect', finalCrop);
        } finally {
            univer.dispose();
            vi.restoreAllMocks();
            vi.useRealTimers();
        }
    });

    it('restores selected repeated images after consecutive appearance edits finish rendering', async () => {
        vi.useFakeTimers();
        const { univer, render, drawing, commands } = await createRepeatedImageTestBed('header-selected-crop-edit');
        try {
            const keys = [0, 1].map((index) => getDrawingShapeKeyByDrawingSearch(drawing, index));
            const originals = keys.map((key) => render.scene.getObject(key)!);
            const transformer = render.scene.getTransformerByCreate();
            originals.forEach((original) => transformer.setSelectedControl(original));
            const firstCrop = { left: 0.1, top: 0, right: 0, bottom: 0 };
            const finalCrop = { left: 0.2, top: 0.1, right: 0, bottom: 0 };
            const jsonX = JSONX.getInstance();

            for (const actions of [
                jsonX.insertOp(['drawings', drawing.drawingId, 'srcRect'], firstCrop),
                jsonX.replaceOp(['drawings', drawing.drawingId, 'srcRect'], firstCrop, finalCrop),
            ]) {
                expect(commands.syncExecuteCommand(RichTextEditingMutation.id, {
                    unitId: render.unitId,
                    actions,
                    textRanges: null,
                })).toBeTruthy();
            }
            await vi.advanceTimersByTimeAsync(34);

            expect([...transformer.getSelectedObjectMap().keys()]).toEqual(keys);
            keys.forEach((key, index) => {
                const replacement = render.scene.getObject(key);
                expect(replacement).toBeTruthy();
                expect(replacement).not.toBe(originals[index]);
                expect(replacement).toHaveProperty('srcRect', finalCrop);
                expect(transformer.getSelectedObjectMap().get(key)).toBe(replacement);
            });
        } finally {
            univer.dispose();
            vi.restoreAllMocks();
            vi.useRealTimers();
        }
    });

    it('discards a queued changeset appearance refresh when its render controller is disposed', async () => {
        vi.useFakeTimers();
        const { univer, render, drawing, manager, commands, controller } = await createRepeatedImageTestBed('header-disposed-changeset');
        try {
            const add = vi.spyOn(manager, 'addNotification');
            const remove = vi.spyOn(manager, 'removeNotification');
            expect(commands.syncExecuteCommand(RichTextEditingMutation.id, {
                unitId: render.unitId,
                actions: JSONX.getInstance().insertOp(['drawings', drawing.drawingId, 'srcRect'], {
                    left: 0.2,
                    top: 0.1,
                    right: 0,
                    bottom: 0,
                }),
                textRanges: null,
            }, { fromChangeset: true })).toBeTruthy();
            controller.dispose();
            await Promise.resolve();
            await Promise.resolve();
            await vi.advanceTimersByTimeAsync(34);

            expect(remove).not.toHaveBeenCalled();
            expect(add).not.toHaveBeenCalled();
        } finally {
            univer.dispose();
            vi.restoreAllMocks();
            vi.useRealTimers();
        }
    });

    it('keeps pending header selection when earlier instances finish loading before a layout refresh', async () => {
        vi.useFakeTimers();
        const { univer, render, drawing, manager, commands, controller } = await createRepeatedImageTestBed('header-staggered-selection');
        let finishSecondImage: (source: string) => void = () => {};
        const secondImage = new Promise<string>((resolve) => {
            finishSecondImage = resolve;
        });
        try {
            const keys = [0, 1].map((index) => getDrawingShapeKeyByDrawingSearch(drawing, index));
            const transformer = render.scene.getTransformerByCreate();
            keys.forEach((key) => transformer.setSelectedControl(render.scene.getObject(key)!));
            const imageIo = univer.__getInjector().get(IImageIoService);
            vi.spyOn(imageIo, 'getImageSourceCache').mockReturnValue(null);
            let imageRequests = 0;
            vi.spyOn(imageIo, 'getImage').mockImplementation(async () => {
                imageRequests++;
                return imageRequests === 2 ? secondImage : '';
            });
            expect(commands.syncExecuteCommand(RichTextEditingMutation.id, {
                unitId: render.unitId,
                actions: JSONX.getInstance().replaceOp(
                    ['drawings', drawing.drawingId, 'imageSourceType'],
                    ImageSourceType.BASE64,
                    ImageSourceType.UUID
                ),
                textRanges: null,
            })).toBeTruthy();
            await vi.advanceTimersByTimeAsync(34);
            expect(render.scene.getObject(keys[0])).toBeTruthy();
            expect(render.scene.getObject(keys[1])).toBeFalsy();

            const current = manager.getDrawingByParam(drawing)!;
            (controller as unknown as {
                _handleMultiDrawingsTransform: (drawings: IDrawingParam[]) => void;
            })._handleMultiDrawingsTransform([{
                ...current,
                transforms: current.transforms!.map((transform) => ({ ...transform, left: (transform.left ?? 0) + 1 })),
            }]);
            expect(transformer.getSelectedObjectMap().get(keys[0])).toBe(render.scene.getObject(keys[0]));
            transformer.refreshControls();
            finishSecondImage('');
            await vi.advanceTimersByTimeAsync(1);

            expect([...transformer.getSelectedObjectMap().keys()]).toEqual(keys);
            keys.forEach((key) => {
                expect(transformer.getSelectedObjectMap().get(key)).toBe(render.scene.getObject(key));
            });
        } finally {
            finishSecondImage('');
            univer.dispose();
            vi.restoreAllMocks();
            vi.useRealTimers();
        }
    });

    it.each(['clear', 'select another object', 'start a transform', 'remove', 'dispose'])('does not restore pending image selection after %s', async (action) => {
        vi.useFakeTimers();
        const { univer, model, render, drawing, commands, controller } = await createRepeatedImageTestBed(`header-selection-${action}`);
        try {
            const key = getDrawingShapeKeyByDrawingSearch(drawing, 0);
            const transformer = render.scene.getTransformerByCreate();
            transformer.setSelectedControl(render.scene.getObject(key)!);
            expect(commands.syncExecuteCommand(RichTextEditingMutation.id, {
                unitId: render.unitId,
                actions: JSONX.getInstance().insertOp(['drawings', drawing.drawingId, 'srcRect'], {
                    left: 0.2,
                    top: 0.1,
                    right: 0,
                    bottom: 0,
                }),
                textRanges: null,
            })).toBeTruthy();

            const other = new Rect('other-selection', { left: 40, top: 40, width: 10, height: 10 });
            render.scene.addObject(other);
            if (action === 'clear') {
                transformer.clearSelectedObjects();
            } else if (action === 'select another object') {
                transformer.setSelectedControl(other);
            } else if (action === 'start a transform') {
                transformer.activeAnObject(other);
            } else if (action === 'remove') {
                expect(commands.syncExecuteCommand(RichTextEditingMutation.id, {
                    unitId: render.unitId,
                    actions: JSONX.getInstance().removeOp(['drawings', drawing.drawingId], model.getSnapshot().drawings!.a),
                    textRanges: null,
                })).toBeTruthy();
            } else {
                controller.dispose();
            }
            await vi.advanceTimersByTimeAsync(34);

            if (action === 'remove') {
                expect(render.scene.getObject(key)).toBeFalsy();
            } else {
                expect(render.scene.getObject(key)).toBeTruthy();
            }
            expect(transformer.getSelectedObjectMap().has(key)).toBe(false);
            if (action === 'select another object' || action === 'start a transform') {
                expect(transformer.getSelectedObjectMap().get(other.oKey)).toBe(other);
            }
        } finally {
            univer.dispose();
            vi.restoreAllMocks();
            vi.useRealTimers();
        }
    });

    it('refreshes drawings when scrolling materializes pages without a layout progress event', () => {
        vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        const controller = Object.create(DocDrawingTransformUpdateController.prototype);
        const currentSkeleton$ = new Subject();
        const skeleton = {
            layoutProgress$: new Subject(),
            layoutPageMaterialized$: new Subject<void>(),
        };
        const subscriptions: Array<{ unsubscribe: () => void }> = [];
        controller.disposeWithMe = (subscription: { unsubscribe: () => void }) => subscriptions.push(subscription);
        controller._context = { mainComponent: null };
        controller._docSkeletonManagerService = { currentSkeleton$ };
        controller._docRefreshDrawingsService = { refreshDrawings$: new Subject() };
        controller._publicationTracker = new DocDrawingPublicationTracker();
        controller._refreshDrawing = vi.fn();
        controller._initialRenderRefresh();
        try {
            currentSkeleton$.next(skeleton);
            expect(controller._refreshDrawing).toHaveBeenCalledTimes(1);
            skeleton.layoutPageMaterialized$.next();
            expect(controller._refreshDrawing).toHaveBeenCalledTimes(2);
            expect(controller._refreshDrawing).toHaveBeenLastCalledWith(skeleton);
            currentSkeleton$.next(null);
            skeleton.layoutPageMaterialized$.next();
            expect(controller._refreshDrawing).toHaveBeenCalledTimes(2);
        } finally {
            subscriptions.forEach((subscription) => subscription.unsubscribe());
            vi.unstubAllGlobals();
        }
    });

    it('does not eagerly refresh drawings for table metadata mutations', () => {
        expect(doesDocMutationAffectDrawingPresentation([
            'tableSource',
            'table-1',
            'tableColumns',
            0,
            'size',
            'width',
            'v',
            { r: 28, i: 32 },
        ] as never)).toBe(false);
        expect(doesDocMutationAffectDrawingPresentation([
            'drawings',
            'drawing-1',
            'docTransform',
            { r: {}, i: { angle: 1 } },
        ] as never)).toBe(true);
        expect([...getDocMutationAffectedDrawingIds([
            'drawings',
            'drawing-1',
            'docTransform',
            { r: {}, i: { angle: 1 } },
        ] as never)!]).toEqual(['drawing-1']);
        expect(getDocMutationAffectedDrawingIds([
            'drawingsOrder',
            { r: [], i: ['drawing-1'] },
        ] as never)).toBeNull();
    });

    it('filters unchanged drawing transform notifications but preserves viewport refreshes', () => {
        const current = {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingId: 'drawing-1',
            drawingType: 0,
            behindText: false,
            hidden: false,
            isMultiTransform: BooleanNumber.FALSE,
            transform: { left: 10, top: 20, width: 30, height: 40 },
            transforms: [],
        };

        expect(shouldRefreshDocDrawingTransform(current as never, { ...current } as never)).toBe(false);
        expect(shouldRefreshDocDrawingTransform(current as never, {
            ...current,
            transform: { ...current.transform, left: 11 },
        } as never)).toBe(true);
        expect(shouldRefreshDocDrawingTransform(current as never, {
            ...current,
            customBlockRenderViewport: { contentWidth: 100 },
        } as never)).toBe(true);
        expect(shouldRefreshDocDrawingTransform(current as never, {
            ...current,
            selectable: false,
        } as never)).toBe(true);
    });

    it('publishes preview-only drawings as non-selectable and restores canonical drawings', () => {
        const controller = Object.create(DocDrawingTransformUpdateController.prototype);
        controller._context = {
            unit: { getSnapshot: () => ({ drawings: {} }) },
        };
        controller._liquid = new Liquid();
        const drawing = {
            aLeft: 10,
            aTop: 20,
            width: 30,
            height: 40,
            angle: 0,
            drawingId: 'drawing-1',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                behindDoc: BooleanNumber.FALSE,
                docTransform: { positionH: {}, positionV: {} },
            },
        };
        const page = {
            footerId: '',
            headerId: '',
            isLayoutPlaceholder: true,
            marginBottom: 10,
            marginLeft: 10,
            marginRight: 10,
            marginTop: 10,
            pageHeight: 300,
            pageWidth: 200,
            skeColumnGroups: new Map(),
            skeDrawings: new Map([['drawing-1', drawing]]),
            skeTables: new Map(),
        };
        const previewDrawings = {} as Record<string, { selectable: boolean }>;

        controller._collectPublishedPageDrawingPositions(
            'doc-1',
            page,
            new Map(),
            new Map(),
            0,
            0,
            previewDrawings
        );
        expect(previewDrawings['drawing-1']).toMatchObject({ selectable: false });

        page.isLayoutPlaceholder = false;
        const canonicalDrawings = {} as Record<string, { selectable: boolean }>;
        controller._collectPublishedPageDrawingPositions(
            'doc-1',
            page,
            new Map(),
            new Map(),
            0,
            0,
            canonicalDrawings
        );
        expect(canonicalDrawings['drawing-1']).toMatchObject({ selectable: true });
    });

    it('refreshes only incremental publications that can change drawing transforms', () => {
        const drawing = {};
        const pages = [
            { headerId: '', footerId: '', pageWidth: 100, skeDrawings: new Map([['cover', drawing]]), skeTables: new Map(), skeColumnGroups: new Map() },
            { headerId: '', footerId: '', pageWidth: 100, skeDrawings: new Map(), skeTables: new Map(), skeColumnGroups: new Map() },
            { headerId: '', footerId: '', pageWidth: 100, skeDrawings: new Map([['later', drawing]]), skeTables: new Map(), skeColumnGroups: new Map() },
        ];
        const skeleton = {
            getSkeletonData: () => ({
                pages,
                skeHeaders: new Map(),
                skeFooters: new Map(),
            }),
        };
        const tracker = new DocDrawingPublicationTracker();
        const progress = (overrides: Partial<DocumentDrawingPublicationProgress>): DocumentDrawingPublicationProgress => ({
            generation: 1,
            didPublish: true,
            didPublishAnchor: false,
            publishedPageCount: 1,
            reason: 'initial',
            complete: false,
            ...overrides,
        });

        expect(tracker.shouldRefresh(skeleton, progress({}))).toBe(true);
        expect(tracker.shouldRefresh(skeleton, progress({ publishedPageCount: 2 }))).toBe(false);
        expect(tracker.shouldRefresh(skeleton, progress({ publishedPageCount: 3 }))).toBe(true);
        expect(tracker.shouldRefresh(skeleton, progress({
            generation: 2,
            reason: 'edit',
            publishedPageCount: 3,
        }))).toBe(false);
        expect(tracker.shouldRefresh(skeleton, progress({
            generation: 2,
            reason: 'edit',
            didPublishAnchor: true,
            publishedPageCount: 3,
        }))).toBe(true);
    });

    it('refreshes when a later anchor resolves a drawing onto an already published page', () => {
        const firstPageDrawings = new Map();
        const pages = [
            { headerId: '', footerId: '', pageWidth: 100, skeDrawings: firstPageDrawings, skeTables: new Map(), skeColumnGroups: new Map() },
            { headerId: '', footerId: '', pageWidth: 100, skeDrawings: new Map(), skeTables: new Map(), skeColumnGroups: new Map() },
        ];
        const skeleton = {
            getSkeletonData: () => ({
                pages,
                skeHeaders: new Map(),
                skeFooters: new Map(),
            }),
        };
        const tracker = new DocDrawingPublicationTracker();
        const progress = (publishedPageCount: number): DocumentDrawingPublicationProgress => ({
            generation: 1,
            didPublish: true,
            didPublishAnchor: false,
            publishedPageCount,
            reason: 'edit',
            complete: false,
        });

        expect(tracker.shouldRefresh(skeleton, progress(1))).toBe(false);
        expect(tracker.shouldRefresh(skeleton, progress(2))).toBe(false);

        firstPageDrawings.set('late-drawing', {});

        expect(tracker.shouldRefresh(skeleton, progress(2))).toBe(true);
    });

    it.each(['column', 'footnote', 'header', 'footer'])('refreshes when a published %s contains drawings', (scope) => {
        const nestedPage = {
            skeDrawings: new Map([['column-drawing', {}]]),
            skeTables: new Map(),
            skeColumnGroups: new Map(),
        };
        const pages = [{
            headerId: scope === 'header' ? 'header' : '',
            footerId: scope === 'footer' ? 'footer' : '',
            headerLayoutKey: 'page-1',
            footerLayoutKey: 'page-1',
            pageWidth: 100,
            skeDrawings: new Map(),
            skeTables: new Map(),
            skeColumnGroups: new Map(scope === 'column'
                ? [['column-group', {
                    columns: [{ page: nestedPage }],
                }]]
                : []),
            notes: scope === 'footnote' ? [{ page: nestedPage }] : [],
        }];
        const skeleton = {
            getSkeletonData: () => ({
                pages,
                skeHeaders: new Map(scope === 'header' ? [['header', new Map([['page-1', nestedPage]])]] : []),
                skeFooters: new Map(scope === 'footer' ? [['footer', new Map([['page-1', nestedPage]])]] : []),
            }),
        };
        const tracker = new DocDrawingPublicationTracker();

        expect(tracker.shouldRefresh(skeleton, {
            generation: 1,
            didPublish: true,
            didPublishAnchor: false,
            publishedPageCount: 1,
            reason: 'initial',
            complete: false,
        })).toBe(true);
    });

    it('projects drawings in table cells through table, row, cell and scroll offsets', () => {
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 480,
                scrollLeft: 30,
                viewportWidth: 160,
            };
        });

        const table = {
            left: 40,
            tableId: 'table-1#-#0',
            top: 80,
        };
        const row = {
            top: 12,
        };
        const cell = {
            left: 120,
            marginLeft: 8,
            marginTop: 6,
        };

        expect(getDocsTableCellDrawingOffset('unit-1', table as never, row as never, cell as never)).toEqual({
            left: 138,
            top: 98,
        });
    });

    it('resolves a table cell drawing anchor to the host page and scrolled cell offset', () => {
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 480,
                scrollLeft: 30,
                viewportWidth: 160,
            };
        });

        const hostPage = { type: 'body' };
        const cell = {
            left: 120,
            marginLeft: 8,
            marginTop: 6,
        };
        const row = {
            cells: [cell],
            top: 12,
        };
        const table = {
            left: 40,
            parent: hostPage,
            rows: [row],
            tableId: 'table-1#-#0',
            top: 80,
        };
        Object.assign(row, { parent: table });
        Object.assign(cell, { parent: row });

        expect(getDocsTableCellAnchorContext('unit-1', cell as never)).toMatchObject({
            hostPage,
            offset: {
                left: 138,
                top: 98,
            },
        });
    });

    it('refreshes normal, table-cell, header, and multi-transform drawings into drawing notifications', () => {
        const selectedShape = {};
        const currentDrawings: Record<string, unknown> = {};
        const transformer = {
            getSelectedObjectMap: vi.fn(() => new Map([['multi-drawing', selectedShape]])),
            setSelectedControl: vi.fn(),
            refreshControls: vi.fn(),
        };
        const context = {
            unitId: 'unit-1',
            unit: {
                getSnapshot: vi.fn(() => ({ drawings: currentDrawings })),
            },
            mainComponent: {
                left: 5,
                top: 7,
                pageLayoutType: 0,
                pageMarginLeft: 0,
                pageMarginTop: 20,
            },
            scene: {
                getTransformer: vi.fn(() => transformer),
                getObject: vi.fn((key) => key === 'multi-drawing' ? selectedShape : null),
            },
        };
        const drawingManagerService = {
            refreshTransform: vi.fn(),
            getDrawingByParam: vi.fn((drawing) => drawing.drawingId === 'multi-drawing'
                ? { drawingId: drawing.drawingId, isMultiTransform: BooleanNumber.TRUE }
                : undefined),
            getDrawingData: vi.fn(() => ({
                'multi-drawing': { drawingId: 'multi-drawing', isMultiTransform: BooleanNumber.TRUE },
                'stale-multi': { drawingId: 'stale-multi', isMultiTransform: BooleanNumber.TRUE },
                'stale-normal': {
                    drawingId: 'stale-normal',
                    transform: { left: 0, top: 0, width: 100, height: 100, angle: 0 },
                },
            })),
            removeNotification: vi.fn(),
            addNotification: vi.fn(),
        };
        const controller = Object.create(DocDrawingTransformUpdateController.prototype);
        controller._pendingMultiDrawingSelection = new Set<string>();
        controller._context = context;
        controller._drawingManagerService = drawingManagerService;
        controller._liquid = new Liquid();
        const defaultDocTransform = {
            positionH: {},
            positionV: {},
        };

        const normalDrawing = {
            aLeft: 10,
            aTop: 20,
            width: 30,
            height: 40,
            angle: 5,
            drawingId: 'normal-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_NONE,
                behindDoc: BooleanNumber.TRUE,
                docTransform: defaultDocTransform,
            },
        };
        const pageRelativeDrawing = {
            ...normalDrawing,
            drawingId: 'page-relative-drawing',
            drawingOrigin: {
                ...normalDrawing.drawingOrigin,
                docTransform: {
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 99 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 88 },
                },
            },
        };
        currentDrawings['page-relative-drawing'] = {
            ...pageRelativeDrawing.drawingOrigin,
            behindDoc: BooleanNumber.FALSE,
            docTransform: {
                angle: 6,
                size: { width: 31, height: 41 },
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 109 },
                positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 98 },
            },
        };
        const squareDrawing = {
            ...normalDrawing,
            drawingId: 'square-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                behindDoc: BooleanNumber.FALSE,
                docTransform: pageRelativeDrawing.drawingOrigin.docTransform,
            },
        };
        const topBottomDrawing = {
            ...squareDrawing,
            aLeft: 12,
            aTop: 22,
            drawingId: 'top-bottom-drawing',
            drawingOrigin: {
                ...squareDrawing.drawingOrigin,
                layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
            },
        };
        const headerDrawing = {
            aLeft: 3,
            aTop: 4,
            width: 9,
            height: 10,
            angle: 0,
            drawingId: 'header-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: defaultDocTransform,
            },
        };
        const tableCellDrawing = {
            aLeft: 1,
            aTop: 2,
            width: 11,
            height: 12,
            angle: 0,
            drawingId: 'cell-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: defaultDocTransform,
            },
        };
        const columnDrawing = {
            ...tableCellDrawing,
            aLeft: 2,
            aTop: 3,
            drawingId: 'column-drawing',
        };
        const columnTableCellDrawing = {
            ...tableCellDrawing,
            drawingId: 'column-table-cell-drawing',
        };
        const inlineDrawing = {
            aLeft: 15,
            aTop: 25,
            width: 35,
            height: 45,
            angle: 0,
            drawingId: 'inline-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.INLINE,
                behindDoc: BooleanNumber.FALSE,
                docTransform: {
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 99 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 88 },
                },
            },
        };
        const multiDrawingOnPage = {
            aLeft: 6,
            aTop: 8,
            width: 13,
            height: 14,
            angle: 2,
            drawingId: 'multi-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                behindDoc: BooleanNumber.FALSE,
                isMultiTransform: BooleanNumber.TRUE,
                docTransform: defaultDocTransform,
            },
        };
        const multiDrawingInHeader = {
            ...multiDrawingOnPage,
            aLeft: 16,
            aTop: 18,
        };
        const cell = {
            left: 7,
            marginLeft: 2,
            marginTop: 3,
            skeDrawings: new Map([['cell-drawing', tableCellDrawing]]),
            skeTables: [],
        };
        const table = {
            left: 30,
            top: 40,
            tableId: 'table-1#-#0',
            rows: [{
                top: 4,
                cells: [cell],
            }],
        };
        const columnTableCell = {
            left: 3,
            marginLeft: 1,
            marginTop: 1,
            skeDrawings: new Map([['column-table-cell-drawing', columnTableCellDrawing]]),
            skeTables: new Map(),
            skeColumnGroups: new Map(),
        };
        const columnTable = {
            left: 4,
            top: 5,
            tableId: 'column-table#-#0',
            rows: [{
                top: 2,
                cells: [columnTableCell],
            }],
        };
        const columnPage = {
            marginLeft: 0,
            marginTop: 0,
            skeDrawings: new Map([['column-drawing', columnDrawing]]),
            skeTables: new Map([['column-table', columnTable]]),
            skeColumnGroups: new Map(),
        };
        const columnGroup = {
            left: 50,
            top: 60,
            columns: [{
                left: 8,
                top: 9,
                page: columnPage,
            }],
        };
        const page = {
            headerId: 'header-1',
            pageWidth: 200,
            pageHeight: 300,
            marginLeft: 11,
            marginTop: 13,
            marginBottom: 17,
            skeDrawings: new Map([
                ['normal-drawing', normalDrawing],
                ['page-relative-drawing', pageRelativeDrawing],
                ['square-drawing', squareDrawing],
                ['top-bottom-drawing', topBottomDrawing],
                ['inline-drawing', inlineDrawing],
                ['multi-drawing', multiDrawingOnPage],
            ]),
            skeTables: [table],
            skeColumnGroups: new Map([['column-group', columnGroup]]),
        };
        const headerPage = {
            marginTop: 19,
            skeDrawings: new Map([
                ['header-drawing', headerDrawing],
                ['multi-drawing', multiDrawingInHeader],
            ]),
            skeTables: [],
        };
        const skeleton = {
            getLayoutProgress: () => null,
            getSkeletonData: () => ({
                pages: [page],
                skeHeaders: new Map([['header-1', new Map([[200, headerPage]])]]),
                skeFooters: new Map(),
            }),
        };

        controller._refreshDrawing(skeleton);

        expect(drawingManagerService.refreshTransform).toHaveBeenCalledWith([
            expect.objectContaining({
                drawingId: 'header-drawing',
                transform: expect.objectContaining({ left: 19, top: 30, width: 9, height: 10, angle: 0 }),
            }),
            expect.objectContaining({
                drawingId: 'normal-drawing',
                behindText: true,
                transform: expect.objectContaining({ left: 26, top: 40, width: 30, height: 40, angle: 5 }),
            }),
            expect.objectContaining({
                drawingId: 'page-relative-drawing',
                behindText: false,
                transform: expect.objectContaining({ left: 114, top: 105, width: 31, height: 41, angle: 6 }),
            }),
            expect.objectContaining({
                drawingId: 'square-drawing',
                transform: expect.objectContaining({ left: 104, top: 95, width: 30, height: 40, angle: 5 }),
            }),
            expect.objectContaining({
                drawingId: 'top-bottom-drawing',
                transform: expect.objectContaining({ left: 104, top: 95, width: 30, height: 40, angle: 5 }),
            }),
            expect.objectContaining({
                drawingId: 'inline-drawing',
                transform: expect.objectContaining({ left: 31, top: 45, width: 35, height: 45, angle: 0 }),
            }),
            expect.objectContaining({
                drawingId: 'cell-drawing',
                transform: expect.objectContaining({ left: 56, top: 69, width: 11, height: 12, angle: 0 }),
            }),
            expect.objectContaining({
                drawingId: 'column-drawing',
                transform: expect.objectContaining({ left: 76, top: 92, width: 11, height: 12, angle: 0 }),
            }),
            expect.objectContaining({
                drawingId: 'column-table-cell-drawing',
                transform: expect.objectContaining({ left: 83, top: 99, width: 11, height: 12, angle: 0 }),
            }),
            expect.objectContaining({
                drawingId: 'stale-normal',
                hidden: true,
                transform: expect.objectContaining({ left: 0, top: 0, width: 100, height: 100, angle: 0 }),
            }),
        ]);
        expect(drawingManagerService.removeNotification).toHaveBeenCalledWith([
            { drawingId: 'stale-multi', isMultiTransform: BooleanNumber.TRUE, hidden: true },
        ]);
        expect(drawingManagerService.refreshTransform).toHaveBeenLastCalledWith([
            expect.objectContaining({
                drawingId: 'multi-drawing',
                isMultiTransform: BooleanNumber.TRUE,
                transforms: [
                    expect.objectContaining({ left: 32, top: 44, width: 13, height: 14, angle: 2 }),
                    expect.objectContaining({ left: 22, top: 28, width: 13, height: 14, angle: 2 }),
                ],
            }),
        ]);
        expect(transformer.setSelectedControl).not.toHaveBeenCalled();
    });

    it('projects a document page clip bound in scene coordinates before page padding is applied', () => {
        expect(getDocsDrawingPageClipBounds({
            docsLeft: 20,
            docsTop: 30,
            pageOffsetLeft: 100,
            pageOffsetTop: 200,
            page: {
                pageWidth: 793,
                pageHeight: 1122,
                marginLeft: 48,
                marginTop: 48,
            },
        } as never)).toEqual({
            left: 120,
            top: 230,
            width: 793,
            height: 1122,
        });
    });

    it('projects a table cell drawing clip bound through the cell offset', () => {
        expect(getDocsDrawingPageClipBounds({
            docsLeft: 20,
            docsTop: 30,
            pageOffsetLeft: 100,
            pageOffsetTop: 200,
            clipOffsetLeft: 138,
            clipOffsetTop: 98,
            page: {
                pageWidth: 321,
                pageHeight: 300,
            },
        })).toEqual({
            left: 258,
            top: 328,
            width: 321,
            height: 300,
        });
    });

    it('does not crop cell-anchored pictures to the vertically aligned text origin', () => {
        expect(getDocsDrawingPageClipBounds({
            docsLeft: 20,
            docsTop: 30,
            pageOffsetLeft: 100,
            pageOffsetTop: 200,
            clipOffsetLeft: 138,
            clipOffsetTop: 98 + 141,
            page: {
                type: DocumentSkeletonPageType.CELL,
                pageWidth: 321,
                pageHeight: 300,
                marginLeft: 8,
                marginTop: 141,
            },
        })).toEqual({ left: 250, top: 328, width: 321, height: 300 });
    });

    it('restores visibility and presentation when publishing a previously hidden header drawing', () => {
        const controller = Object.create(DocDrawingTransformUpdateController.prototype);
        controller._pendingMultiDrawingSelection = new Set<string>();
        const drawing = { drawingId: 'logo', hidden: true, source: 'image-source' };
        const update = {
            drawingId: 'logo',
            hidden: false,
            behindText: true,
            selectable: false,
            isMultiTransform: BooleanNumber.TRUE,
            transform: { left: 10, top: 20, width: 30, height: 40 },
            transforms: [{ left: 10, top: 20, width: 30, height: 40 }],
        };
        controller._context = {
            unitId: 'doc',
            scene: { getTransformer: () => undefined },
        };
        controller._drawingManagerService = {
            getDrawingByParam: () => drawing,
            getDrawingData: () => ({ logo: drawing }),
            removeNotification: vi.fn(),
            refreshTransform: vi.fn(() => expect(drawing).toMatchObject(update)),
        };
        controller._handleMultiDrawingsTransform([update]);
        expect(controller._drawingManagerService.refreshTransform).toHaveBeenCalledWith([update]);
        expect(drawing.source).toBe('image-source');
    });

    it('anchors footer drawings at the same bottom-aligned origin as footer text', () => {
        const controller = Object.create(DocDrawingTransformUpdateController.prototype);
        controller._collectSegmentDrawingPositions = vi.fn();
        const page = { pageWidth: 800, pageHeight: 1100, marginLeft: 50, marginBottom: 70, footerId: 'footer' };
        const footer = { height: 16, marginTop: 5, marginBottom: 30 };
        controller._collectPublishedPageDrawingPositions('doc', page, new Map(), new Map([['footer', new Map([[800, footer]])]]), 0, 0, {});
        expect(controller._collectSegmentDrawingPositions.mock.calls[0][5]).toBe(1054);
    });

    it('allows floating pictures to overflow a cell without crossing the document page', () => {
        const config = {
            docsLeft: 20,
            docsTop: 30,
            pageOffsetLeft: 0,
            pageOffsetTop: 0,
            clipOffsetLeft: 60,
            clipOffsetTop: 900,
            overflowClipBounds: { left: 20, top: 30, width: 794, height: 1123 },
            page: { type: DocumentSkeletonPageType.CELL, pageWidth: 200, pageHeight: 155 },
        };
        expect(getDocsDrawingPageClipBounds({
            ...config,
            drawingLayoutType: PositionedObjectLayoutType.WRAP_NONE,
        })).toEqual(config.overflowClipBounds);
        expect(getDocsDrawingPageClipBounds({
            ...config,
            drawingLayoutType: PositionedObjectLayoutType.INLINE,
        })).toEqual({ left: 80, top: 930, width: 200, height: 155 });
    });

    it('paints measured inline-object dimensions without changing source or overriding live floating transforms', () => {
        const source = {
            layoutType: PositionedObjectLayoutType.INLINE,
            docTransform: {
                angle: 0,
                size: { width: 100, height: 44 },
                positionH: { relativeFrom: ObjectRelativeFromH.COLUMN },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH },
            },
        };
        const measured = getDocsOverlayRuntimeDrawing(source, undefined, { width: 100, height: 76 });
        expect(measured.docTransform.size).toEqual({ width: 100, height: 76 });
        expect(source.docTransform.size.height).toBe(44);
        const overlay = { ...source, layoutType: PositionedObjectLayoutType.WRAP_NONE };
        const edited = { ...overlay, docTransform: { ...overlay.docTransform, size: { width: 120, height: 90 } } };
        expect(getDocsOverlayRuntimeDrawing(overlay, edited, { width: 100, height: 76 })).toBe(edited);
    });

    it.each([DocumentSkeletonPageType.HEADER, DocumentSkeletonPageType.FOOTER])('clips small foreground story drawings to physical page bounds (story: %s)', (type) => {
        const hostPage = { pageWidth: 794, pageHeight: 1123 };
        expect(getDocsDrawingClipPage({
            page: { type, pageWidth: 602, pageHeight: 510 },
            hostPage,
            drawing: { behindText: false, transform: { width: 175, height: 33 } },
        })).toBe(hostPage);
    });

    it('clips page-sized header background drawings to the host document page', () => {
        const headerPage = {
            pageWidth: 589,
            pageHeight: 476,
        };
        const hostPage = {
            pageWidth: 816,
            pageHeight: 1056,
        };

        expect(getDocsDrawingClipPage({
            drawing: {
                behindText: true,
                transform: {
                    width: 815,
                    height: 1055,
                },
            },
            hostPage,
            page: headerPage,
        })).toBe(hostPage);

        expect(getDocsDrawingClipPage({
            drawing: {
                behindText: true,
                transform: {
                    width: 120,
                    height: 40,
                },
            },
            hostPage,
            page: headerPage,
        })).toBe(headerPage);
    });

    it('clips overflowing header cover drawings to the host document page', () => {
        const headerPage = {
            pageWidth: 601,
            pageHeight: 510,
        };
        const hostPage = {
            pageWidth: 794,
            pageHeight: 1123,
        };

        expect(getDocsDrawingClipPage({
            drawing: {
                behindText: true,
                transform: {
                    width: 803,
                    height: 682,
                },
            },
            hostPage,
            page: headerPage,
        })).toBe(hostPage);
    });

    it('positions page-sized header backgrounds against the host page width', () => {
        expect(getDocsPageRelativeDrawingLeft({
            hostPage: {
                pageWidth: 816,
            },
            positionH: {
                align: AlignTypeH.RIGHT,
                relativeFrom: ObjectRelativeFromH.PAGE,
            },
            width: 815,
        })).toBe(1);
    });

    it('positions page-sized header backgrounds against the host page height', () => {
        expect(getDocsPageRelativeDrawingTop({
            hostPage: {
                pageHeight: 1056,
            },
            positionV: {
                align: AlignTypeV.TOP,
                relativeFrom: ObjectRelativeFromV.PAGE,
            },
            height: 1055,
        })).toBe(0);

        expect(getDocsPageRelativeDrawingTop({
            hostPage: {
                pageHeight: 1056,
            },
            positionV: {
                align: AlignTypeV.BOTTOM,
                relativeFrom: ObjectRelativeFromV.PAGE,
            },
            height: 1055,
        })).toBe(1);
    });

    it.each([
        PositionedObjectLayoutType.WRAP_NONE,
        PositionedObjectLayoutType.WRAP_SQUARE,
        PositionedObjectLayoutType.WRAP_POLYGON,
        PositionedObjectLayoutType.WRAP_THROUGH,
        PositionedObjectLayoutType.WRAP_TIGHT,
        PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
    ])('uses page coordinates for floating drawing layout %s regardless of text wrapping', (drawingLayoutType) => {
        const page = { pageWidth: 793.4, pageHeight: 1121.13 };
        const anchor = getDocsPageRelativeDrawingAnchorPage({ page, clipPage: page, drawingLayoutType });
        expect(anchor).toBe(page);
        expect(getDocsPageRelativeDrawingLeft({
            hostPage: anchor!,
            positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 35.4 },
            width: 755.4,
        })).toBe(35.4);
        expect(getDocsPageRelativeDrawingAnchorPage({
            page,
            clipPage: page,
            drawingLayoutType: PositionedObjectLayoutType.INLINE,
        })).toBeUndefined();
    });

    it('uses body pages as page-relative drawing anchors when no host page exists', () => {
        const bodyPage = {
            pageWidth: 816,
            pageHeight: 1056,
        };

        expect(getDocsPageRelativeDrawingAnchorPage({
            page: bodyPage,
            clipPage: bodyPage,
        })).toBe(bodyPage);
    });

    it('keeps a table-cell drawing in the translated cell coordinate space', () => {
        const cell = { type: DocumentSkeletonPageType.CELL, pageWidth: 200, pageHeight: 40 };
        expect(getDocsPageRelativeDrawingAnchorPage({
            page: cell,
            clipPage: cell,
            drawingLayoutType: PositionedObjectLayoutType.WRAP_NONE,
        })).toBeUndefined();
    });

    it('renders header and footer drawings in the host page behind-text layer', () => {
        expect(getDocsDrawingBehindText({
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_NONE,
                behindDoc: BooleanNumber.FALSE,
            },
            hostPage: {
                pageWidth: 816,
                pageHeight: 1056,
            },
        } as never)).toBe(true);

        expect(getDocsDrawingBehindText({
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_NONE,
                behindDoc: BooleanNumber.FALSE,
            },
        } as never)).toBe(false);
    });
});
