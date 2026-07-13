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

import type { IDrawingSearch } from '@univerjs/core';
import type { IGalleryProps } from '@univerjs/design';
import type { IDocFloatDomData, IImageData } from '@univerjs/drawing';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import {
    BooleanNumber,
    DrawingTypeEnum,
    IImageIoService,
    ImageSourceType,
    Injector,
    IUniverInstanceService,
    IURLImageService,
    PositionedObjectLayoutType,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import {
    getDrawingShapeKeyByDrawingSearch,
    IDrawingManagerService,
} from '@univerjs/drawing';
import { DRAWING_OBJECT_LAYER_INDEX, Image, Rect } from '@univerjs/engine-render';
import { IGalleryService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DrawingImageClipService } from '../drawing-image-clip.service';
import { DOC_DRAWING_BEHIND_TEXT_LAYER_INDEX, DrawingRenderService } from '../drawing-render.service';

const BASE_TRANSFORM = {
    left: 10,
    top: 20,
    width: 30,
    height: 40,
    angle: 0,
    flipX: false,
    flipY: false,
    skewX: 0,
    skewY: 0,
};

const SECOND_TRANSFORM = {
    left: 50,
    top: 60,
    width: 70,
    height: 80,
    angle: 15,
    flipX: true,
    flipY: false,
    skewX: 1,
    skewY: 2,
};

function imageParam(overrides: Partial<IImageData> = {}): IImageData {
    return {
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        drawingId: 'drawing-1',
        unitId: 'book-1',
        subUnitId: 'sheet-1',
        source: 'image-source',
        imageSourceType: ImageSourceType.BASE64,
        transform: BASE_TRANSFORM,
        ...overrides,
    } as IImageData;
}

function floatDomParam(overrides: Partial<IDocFloatDomData> = {}): IDocFloatDomData {
    return {
        drawingType: DrawingTypeEnum.DRAWING_DOM,
        drawingId: 'float-1',
        unitId: 'doc-1',
        subUnitId: 'doc-1',
        transform: BASE_TRANSFORM,
        ...overrides,
    } as IDocFloatDomData;
}

function drawingKey(param: IDrawingSearch, index?: number) {
    return getDrawingShapeKeyByDrawingSearch(param, index);
}

function cacheKey(source: string, imageSourceType: ImageSourceType) {
    return `${source}:${imageSourceType}`;
}

class TestDrawingManagerService {
    visible = true;
    editable = true;
    orders = ['drawing-1'];
    visibleReads: boolean[] = [];
    readonly drawings = new Map<string, unknown>();

    getDrawingVisible() {
        return this.visibleReads.length > 0 ? this.visibleReads.shift()! : this.visible;
    }

    getDrawingEditable() {
        return this.editable;
    }

    getDrawingOrder() {
        return this.orders;
    }

    getDrawingByParam(param: IDrawingSearch | null | undefined) {
        if (param == null) {
            return null;
        }

        return this.drawings.get(drawingKey(param)) ?? null;
    }
}

class TestImageIoService {
    imageUrl = 'resolved-image-url';
    imageError: unknown;
    beforeResolveImage: (() => void) | undefined;
    readonly imageRequests: string[] = [];
    readonly cache = new Map<string, HTMLImageElement>();
    readonly cacheWrites: Array<{ source: string; imageSourceType: ImageSourceType; image: HTMLImageElement | null }> = [];
    readonly change$ = new Subject<number>();

    setWaitCount() {
        // not used by DrawingRenderService
    }

    async saveImage() {
        return null;
    }

    async getImage(imageId: string) {
        this.imageRequests.push(imageId);
        this.beforeResolveImage?.();
        if (this.imageError) {
            throw this.imageError;
        }
        return this.imageUrl;
    }

    getImageSourceCache(source: string, imageSourceType: ImageSourceType) {
        return this.cache.get(cacheKey(source, imageSourceType)) ?? null;
    }

    addImageSourceCache(source: string, imageSourceType: ImageSourceType, image: HTMLImageElement | null) {
        this.cacheWrites.push({ source, imageSourceType, image });
        if (image) {
            this.cache.set(cacheKey(source, imageSourceType), image);
        }
    }
}

class TestUrlImageService {
    imageUrl = 'downloaded-image-url';
    imageError: unknown;
    readonly requests: string[] = [];

    async getImage(url: string) {
        this.requests.push(url);
        if (this.imageError) {
            throw this.imageError;
        }
        return this.imageUrl;
    }

    async downloadImage() {
        return new Blob();
    }

    registerURLImageDownloader() {
        return toDisposable(() => {});
    }
}

class TestGalleryService {
    gallery$ = new Subject<IGalleryProps>();
    lastOpen: IGalleryProps | undefined;
    closeCount = 0;

    open(params: IGalleryProps) {
        this.lastOpen = params;
        return toDisposable(() => {});
    }

    close() {
        this.closeCount += 1;
    }
}

class TestUniverInstanceService {
    unitType = UniverInstanceType.UNIVER_DOC;
    activeSheetId = 'sheet-1';

    getUnitType() {
        return this.unitType;
    }

    getCurrentUnitOfType() {
        return {
            getActiveSheet: () => ({
                getSheetId: () => this.activeSheetId,
            }),
        };
    }
}

interface IRecordedScene {
    readonly objects: Map<string, BaseObject | ITransformRecorder>;
    readonly addedObjects: Array<{ object: BaseObject; layerIndex: number }>;
    readonly transformerObjects: BaseObject[];
    readonly getObjectKeys: string[];
    getObject(key: string): BaseObject | ITransformRecorder | null;
    getObjectIncludeInGroup(key: string): BaseObject | ITransformRecorder | null;
    addObject(object: BaseObject, layerIndex: number): Scene;
    attachTransformerTo(object: BaseObject): Scene;
}

interface ITransformRecorder {
    readonly oKey: string;
    readonly transformCalls: unknown[];
    transformByState(state: unknown): void;
}

function createTransformRecorder(oKey: string): ITransformRecorder {
    return {
        oKey,
        transformCalls: [],
        transformByState(state: unknown) {
            this.transformCalls.push(state);
        },
    };
}

function createScene(): IRecordedScene {
    const scene: IRecordedScene = {
        objects: new Map(),
        addedObjects: [],
        transformerObjects: [],
        getObjectKeys: [],
        getObject(key: string) {
            this.getObjectKeys.push(key);
            return this.objects.get(key) ?? null;
        },
        getObjectIncludeInGroup(key: string) {
            return this.objects.get(key) ?? null;
        },
        addObject(object: BaseObject, layerIndex: number) {
            this.objects.set(object.oKey, object);
            this.addedObjects.push({ object, layerIndex });
            return this as unknown as Scene;
        },
        attachTransformerTo(object: BaseObject) {
            this.transformerObjects.push(object);
            return this as unknown as Scene;
        },
    };

    return scene;
}

function createHarness() {
    const injector = new Injector();

    injector.add([IDrawingManagerService, { useClass: TestDrawingManagerService as never }]);
    injector.add([IImageIoService, { useClass: TestImageIoService as never }]);
    injector.add([IGalleryService, { useClass: TestGalleryService as never }]);
    injector.add([IURLImageService, { useClass: TestUrlImageService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([DrawingImageClipService]);
    injector.add([DrawingRenderService]);

    return {
        service: injector.get(DrawingRenderService),
        drawingManagerService: injector.get(IDrawingManagerService) as unknown as TestDrawingManagerService,
        imageIoService: injector.get(IImageIoService) as unknown as TestImageIoService,
        urlImageService: injector.get(IURLImageService) as unknown as TestUrlImageService,
        galleryService: injector.get(IGalleryService) as unknown as TestGalleryService,
        univerInstanceService: injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService,
        drawingImageClipService: injector.get(DrawingImageClipService),
        scene: createScene(),
    };
}

describe('DrawingRenderService', () => {
    it('skips image rendering when the drawing is not renderable in the current context', async () => {
        const hiddenCase = createHarness();
        hiddenCase.drawingManagerService.visible = false;
        expect(await hiddenCase.service.renderImages(imageParam(), hiddenCase.scene as unknown as Scene)).toBeUndefined();
        expect(hiddenCase.scene.getObjectKeys).toEqual([]);

        const nonImageCase = createHarness();
        expect(await nonImageCase.service.renderImages(imageParam({ drawingType: DrawingTypeEnum.DRAWING_SHAPE }), nonImageCase.scene as unknown as Scene)).toBeUndefined();
        expect(nonImageCase.scene.getObjectKeys).toEqual([]);

        const inactiveSheetCase = createHarness();
        inactiveSheetCase.univerInstanceService.unitType = UniverInstanceType.UNIVER_SHEET;
        inactiveSheetCase.univerInstanceService.activeSheetId = 'sheet-2';
        expect(await inactiveSheetCase.service.renderImages(imageParam(), inactiveSheetCase.scene as unknown as Scene)).toBeUndefined();
        expect(inactiveSheetCase.scene.getObjectKeys).toEqual([]);

        const inactivePrintingSheetCase = createHarness();
        inactivePrintingSheetCase.univerInstanceService.unitType = UniverInstanceType.UNIVER_SHEET;
        inactivePrintingSheetCase.univerInstanceService.activeSheetId = 'sheet-2';
        expect(await inactivePrintingSheetCase.service.renderImages(
            imageParam(),
            inactivePrintingSheetCase.scene as unknown as Scene,
            { allowInactiveSheet: true }
        )).toHaveLength(1);

        const noTransformCase = createHarness();
        expect(await noTransformCase.service.renderImages(imageParam({ transform: null }), noTransformCase.scene as unknown as Scene)).toBeUndefined();
        expect(noTransformCase.scene.getObjectKeys).toEqual([]);
    });

    it('adds a base64 image with drawing metadata, cache, and transformer state', async () => {
        const { service, scene, drawingManagerService, imageIoService, drawingImageClipService } = createHarness();
        drawingManagerService.orders = ['background', 'drawing-1'];
        const srcRect = { left: 0.1, top: 0.2, right: 0.3, bottom: 0.4 };

        const result = await service.renderImages(imageParam({
            hidden: true,
            prstGeom: 'roundRect',
            adjustValues: { adj: 0.25 },
            srcRect,
        }), scene as unknown as Scene);

        const key = drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' });
        const image = scene.objects.get(key) as Image;

        expect(result).toEqual([image]);
        expect(image).toBeInstanceOf(Image);
        expect(image.left).toBe(10);
        expect(image.top).toBe(20);
        expect(image.width).toBe(30);
        expect(image.height).toBe(40);
        expect(image.zIndex).toBe(1);
        expect(image.visible).toBe(false);
        expect(image.printable).toBe(true);
        expect(image.getProps().url).toBe('image-source');
        expect(image.getClipService()).toBe(drawingImageClipService);
        expect(image.prstGeom).toBe('roundRect');
        expect(image.prstGeomAdjValues).toEqual({ adj: 0.25 });
        expect(image.srcRect).toEqual(srcRect);
        expect(scene.addedObjects.map(({ object, layerIndex }) => [object.oKey, layerIndex])).toEqual([[key, DRAWING_OBJECT_LAYER_INDEX]]);
        expect(scene.transformerObjects).toEqual([image]);
        expect(imageIoService.cacheWrites).toEqual([{ source: 'image-source', imageSourceType: ImageSourceType.BASE64, image: image.getNative() }]);
    });

    it('syncs hidden state when an existing image shape is refreshed', async () => {
        const { service, scene } = createHarness();
        const key = drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' });
        const image = new Image(key, { ...BASE_TRANSFORM, url: 'existing-image' });
        scene.objects.set(key, image);

        await service.renderImages(imageParam({ hidden: true, transform: SECOND_TRANSFORM }), scene as unknown as Scene);

        expect(image.visible).toBe(false);
        expect(image.left).toBe(50);
        expect(image.top).toBe(60);
        expect(image.width).toBe(70);
        expect(image.height).toBe(80);

        await service.renderImages(imageParam({ hidden: false, transform: BASE_TRANSFORM }), scene as unknown as Scene);

        expect(image.visible).toBe(true);
    });

    it('uses cached native images instead of resolving the source again', async () => {
        const { service, scene, imageIoService } = createHarness();
        const nativeImage = document.createElement('img');
        Object.defineProperty(nativeImage, 'complete', { value: true });
        Object.defineProperty(nativeImage, 'naturalWidth', { value: 1 });
        Object.defineProperty(nativeImage, 'naturalHeight', { value: 1 });
        imageIoService.cache.set(cacheKey('image-source', ImageSourceType.BASE64), nativeImage);

        await service.renderImages(imageParam(), scene as unknown as Scene);

        const image = scene.objects.get(drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' })) as Image;
        expect(image.getNative()).toBe(nativeImage);
        expect(imageIoService.imageRequests).toEqual([]);
        expect(imageIoService.cacheWrites).toEqual([]);
    });

    it('loads stored and URL images through their respective services', async () => {
        const uuidCase = createHarness();
        uuidCase.imageIoService.imageUrl = 'stored-image-url';
        await uuidCase.service.renderImages(imageParam({
            source: 'stored-image-id',
            imageSourceType: ImageSourceType.UUID,
        }), uuidCase.scene as unknown as Scene);
        const storedImage = uuidCase.scene.objects.get(drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' })) as Image;
        expect(storedImage.getProps().url).toBe('stored-image-url');
        expect(uuidCase.imageIoService.imageRequests).toEqual(['stored-image-id']);
        expect(uuidCase.imageIoService.cacheWrites).toEqual([]);

        const urlCase = createHarness();
        urlCase.urlImageService.imageUrl = 'downloaded-url-image';
        await urlCase.service.renderImages(imageParam({
            source: 'https://example.test/image.png',
            imageSourceType: ImageSourceType.URL,
        }), urlCase.scene as unknown as Scene);
        const urlImage = urlCase.scene.objects.get(drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' })) as Image;
        expect(urlImage.getProps().url).toBe('downloaded-url-image');
        expect(urlCase.urlImageService.requests).toEqual(['https://example.test/image.png']);
        expect(urlCase.imageIoService.cacheWrites).toEqual([{ source: 'https://example.test/image.png', imageSourceType: ImageSourceType.URL, image: urlImage.getNative() }]);
    });

    it('keeps URL drawings visible with their original source when downloading fails', async () => {
        const { service, scene, urlImageService } = createHarness();
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        urlImageService.imageError = new Error('network unavailable');

        await service.renderImages(imageParam({
            source: 'https://example.test/offline.png',
            imageSourceType: ImageSourceType.URL,
        }), scene as unknown as Scene);

        const image = scene.objects.get(drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' })) as Image;
        expect(image.getProps().url).toBe('https://example.test/offline.png');
        expect(errorSpy).toHaveBeenCalledWith(urlImageService.imageError);
        errorSpy.mockRestore();
    });

    it('does not duplicate an image that appears while its source is loading', async () => {
        const { service, scene, imageIoService } = createHarness();
        const key = drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' });
        const existingObject = createTransformRecorder(key);
        imageIoService.beforeResolveImage = () => scene.objects.set(key, existingObject);

        const result = await service.renderImages(imageParam({
            source: 'stored-image-id',
            imageSourceType: ImageSourceType.UUID,
        }), scene as unknown as Scene);

        expect(result).toEqual([]);
        expect(scene.addedObjects).toEqual([]);
        expect(scene.objects.get(key)).toBe(existingObject);
    });

    it('updates existing image objects for each transform instead of recreating them', async () => {
        const { service, scene } = createHarness();
        const firstKey = drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' }, 0);
        const secondKey = drawingKey({ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' }, 1);
        const firstObject = createTransformRecorder(firstKey);
        const secondObject = createTransformRecorder(secondKey);
        scene.objects.set(firstKey, firstObject);
        scene.objects.set(secondKey, secondObject);

        const result = await service.renderImages(imageParam({
            isMultiTransform: 1,
            transforms: [BASE_TRANSFORM, SECOND_TRANSFORM],
        }), scene as unknown as Scene);

        expect(result).toEqual([]);
        expect(firstObject.transformCalls).toEqual([BASE_TRANSFORM]);
        expect(secondObject.transformCalls).toEqual([SECOND_TRANSFORM]);
        expect(scene.addedObjects).toEqual([]);
    });

    it('skips float DOM rendering when the drawing cannot produce a scene object', () => {
        const hiddenCase = createHarness();
        hiddenCase.drawingManagerService.visible = false;
        expect(hiddenCase.service.renderFloatDom(floatDomParam(), hiddenCase.scene as unknown as Scene)).toBeUndefined();
        expect(hiddenCase.scene.getObjectKeys).toEqual([]);

        const nonDomCase = createHarness();
        expect(nonDomCase.service.renderFloatDom(floatDomParam({ drawingType: DrawingTypeEnum.DRAWING_IMAGE }), nonDomCase.scene as unknown as Scene)).toBeUndefined();
        expect(nonDomCase.scene.getObjectKeys).toEqual([]);

        const noTransformCase = createHarness();
        expect(noTransformCase.service.renderFloatDom(floatDomParam({ transform: null }), noTransformCase.scene as unknown as Scene)).toBeUndefined();
        expect(noTransformCase.scene.getObjectKeys).toEqual([]);
    });

    it('adds float DOM placeholders for every transform and respects transform permissions', () => {
        const { service, scene, drawingManagerService } = createHarness();
        drawingManagerService.orders = ['float-1', 'later'];

        const result = service.renderFloatDom(floatDomParam({
            isMultiTransform: 1,
            transforms: [BASE_TRANSFORM, SECOND_TRANSFORM],
            allowTransform: false,
        }), scene as unknown as Scene);

        const firstKey = drawingKey({ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'float-1' }, 0);
        const secondKey = drawingKey({ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'float-1' }, 1);
        const firstRect = scene.objects.get(firstKey) as Rect;
        const secondRect = scene.objects.get(secondKey) as Rect;

        expect(result).toEqual([firstRect, secondRect]);
        expect(firstRect).toBeInstanceOf(Rect);
        expect(firstRect.left).toBe(10);
        expect(firstRect.top).toBe(20);
        expect(firstRect.zIndex).toBe(0);
        expect(firstRect.printable).toBe(false);
        expect(secondRect.left).toBe(50);
        expect(secondRect.top).toBe(60);
        expect(scene.addedObjects.map(({ object, layerIndex }) => [object.oKey, layerIndex])).toEqual([
            [firstKey, DRAWING_OBJECT_LAYER_INDEX],
            [secondKey, DRAWING_OBJECT_LAYER_INDEX],
        ]);
        expect(scene.transformerObjects).toEqual([]);
    });

    it('updates existing float DOM placeholders and does not add stale placeholders after visibility changes', () => {
        const updateCase = createHarness();
        const key = drawingKey({ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'float-1' });
        const existingObject = createTransformRecorder(key);
        updateCase.scene.objects.set(key, existingObject);

        const updateResult = updateCase.service.renderFloatDom(floatDomParam(), updateCase.scene as unknown as Scene);

        expect(updateResult).toEqual([]);
        expect(existingObject.transformCalls).toEqual([BASE_TRANSFORM]);
        expect(updateCase.scene.addedObjects).toEqual([]);

        const staleCase = createHarness();
        staleCase.drawingManagerService.visibleReads = [true, false];
        expect(staleCase.service.renderFloatDom(floatDomParam(), staleCase.scene as unknown as Scene)).toEqual([]);
        expect(staleCase.scene.addedObjects).toEqual([]);
    });

    it('renders drawings fetched from the drawing manager and ignores unsupported records', async () => {
        const imageCase = createHarness();
        const search = { unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1' };
        imageCase.drawingManagerService.drawings.set(drawingKey(search), imageParam());

        const imageResult = await imageCase.service.renderDrawing(search, imageCase.scene as unknown as Scene);

        expect(imageResult).toEqual([imageCase.scene.objects.get(drawingKey(search))]);

        const missingCase = createHarness();
        expect(missingCase.service.renderDrawing(search, missingCase.scene as unknown as Scene)).toBeUndefined();

        const unsupportedCase = createHarness();
        unsupportedCase.drawingManagerService.drawings.set(drawingKey(search), { ...imageParam(), drawingType: DrawingTypeEnum.DRAWING_SHAPE });
        expect(unsupportedCase.service.renderDrawing(search, unsupportedCase.scene as unknown as Scene)).toBeUndefined();
    });

    it('opens preview images in the gallery and closes the gallery when the preview is dismissed', () => {
        const { service, galleryService } = createHarness();

        service.previewImage('drawing-1', 'preview-src', 640, 480);
        galleryService.lastOpen?.onOpenChange?.(true);
        galleryService.lastOpen?.onOpenChange?.(false);

        expect(galleryService.lastOpen?.images).toEqual(['preview-src']);
        expect(galleryService.closeCount).toBe(1);
    });

    it('renders incomplete cached images through url loading so onload can repaint', async () => {
        const { imageIoService, scene, service } = createHarness();
        const incompleteImage = document.createElement('img');
        Object.defineProperty(incompleteImage, 'complete', { value: false });
        imageIoService.cache.set(cacheKey('image-source', ImageSourceType.BASE64), incompleteImage);

        await service.renderImages(imageParam(), scene as unknown as Scene);

        const image = scene.addedObjects[0]?.object as Image;
        expect(image.getNative()).not.toBe(incompleteImage);
        expect(imageIoService.cacheWrites).toEqual([{ source: 'image-source', imageSourceType: ImageSourceType.BASE64, image: image.getNative() }]);
    });

    it('uses completed cached images directly', async () => {
        const { imageIoService, scene, service } = createHarness();
        const completeImage = document.createElement('img');
        Object.defineProperty(completeImage, 'complete', { value: true });
        Object.defineProperty(completeImage, 'naturalWidth', { value: 1 });
        Object.defineProperty(completeImage, 'naturalHeight', { value: 1 });
        imageIoService.cache.set(cacheKey('image-source', ImageSourceType.BASE64), completeImage);

        await service.renderImages(imageParam(), scene as unknown as Scene);

        const image = scene.addedObjects[0]?.object as Image;
        expect(image.getNative()).toBe(completeImage);
        expect(imageIoService.cacheWrites).toEqual([]);
    });

    it('reloads completed cached images without natural dimensions', async () => {
        const { imageIoService, scene, service } = createHarness();
        const brokenCompleteImage = document.createElement('img');
        Object.defineProperty(brokenCompleteImage, 'complete', { value: true });
        Object.defineProperty(brokenCompleteImage, 'naturalWidth', { value: 0 });
        Object.defineProperty(brokenCompleteImage, 'naturalHeight', { value: 0 });
        imageIoService.cache.set(cacheKey('image-source', ImageSourceType.BASE64), brokenCompleteImage);

        await service.renderImages(imageParam(), scene as unknown as Scene);

        const image = scene.addedObjects[0]?.object as Image;
        expect(image.getNative()).not.toBe(brokenCompleteImage);
        expect(imageIoService.cacheWrites).toEqual([{ source: 'image-source', imageSourceType: ImageSourceType.BASE64, image: image.getNative() }]);
    });

    it('renders docs behind-text images between page background and document text', async () => {
        const { scene, service } = createHarness();

        await service.renderImages(imageParam({ behindText: true } as never), scene as unknown as Scene);

        expect(scene.addedObjects[0]?.layerIndex).toBe(DOC_DRAWING_BEHIND_TEXT_LAYER_INDEX);
    });

    it('renders Word behindDoc wrap-none images between page background and document text', async () => {
        const { scene, service } = createHarness();

        await service.renderImages(imageParam({
            behindDoc: BooleanNumber.TRUE,
            layoutType: PositionedObjectLayoutType.WRAP_NONE,
        } as never), scene as unknown as Scene);

        expect(scene.addedObjects[0]?.layerIndex).toBe(DOC_DRAWING_BEHIND_TEXT_LAYER_INDEX);
    });

    it('keeps normal images on the regular drawing layer', async () => {
        const { scene, service } = createHarness();

        await service.renderImages(imageParam(), scene as unknown as Scene);

        expect(scene.addedObjects[0]?.layerIndex).toBe(DRAWING_OBJECT_LAYER_INDEX);
    });
});
