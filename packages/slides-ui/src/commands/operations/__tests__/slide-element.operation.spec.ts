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

import type { IPageElement, ISlideData, ISlidePage, SlideDataModel } from '@univerjs/slides';
import {
    ICommandService,
    IImageIoService,
    ImageSourceType,
    ImageUploadStatusType,
    IUniverInstanceService,
    LocaleService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { ObjectType } from '@univerjs/engine-render';
import { BasicShapes, PageElementType, PageType, UniverSlidesPlugin } from '@univerjs/slides';
import { DesktopSidebarService, ILocalFileService, ISidebarService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CanvasView } from '../../../controllers/canvas-view';
import { ActivateSlidePageOperation } from '../activate.operation';
import { AppendSlideOperation } from '../append-slide.operation';
import { DeleteSlideElementOperation } from '../delete-element.operation';
import { InsertSlideFloatImageCommand } from '../insert-image.operation';
import {
    InsertSlideShapeEllipseCommand,
    InsertSlideShapeEllipseOperation,
    InsertSlideShapeRectangleCommand,
    InsertSlideShapeRectangleOperation,
    ToggleSlideEditSidebarOperation,
} from '../insert-shape.operation';
import { SlideAddTextCommand, SlideAddTextOperation } from '../insert-text.operation';
import { SetSlidePageThumbOperation } from '../set-thumb.operation';
import { SetTextEditArrowOperation } from '../text-edit.operation';
import { UpdateSlideElementOperation } from '../update-element.operation';

const unitId = 'slide-command-unit';
const pageId = 'page-1';

class TestCanvasView {
    static thumbUnitIds: string[] = [];
    static activatedPages: string[] = [];
    static activeObjectIds: string[] = [];
    static clearedControls = 0;
    static activateCreatedObject = false;

    constructor(@IUniverInstanceService private readonly _instanceService: IUniverInstanceService) {}

    static reset() {
        this.thumbUnitIds = [];
        this.activatedPages = [];
        this.activeObjectIds = [];
        this.clearedControls = 0;
        this.activateCreatedObject = false;
    }

    createObjectToPage() {
        if (TestCanvasView.activateCreatedObject) {
            return { oKey: 'created-object' } as never;
        }

        return null;
    }

    setObjectActiveByPage(object: { oKey?: string }) {
        TestCanvasView.activeObjectIds.push(object.oKey ?? '');
    }

    removeObjectById() {
        // render boundary is not part of the data-model behavior under test
    }

    appendPage(unitId: string) {
        const slide = this._instanceService.getUnit<SlideDataModel>(unitId);
        const page = slide?.getBlankPage();
        if (page) {
            slide?.appendPage(page);
        }
    }

    activePage(pageId: string, unitId: string) {
        const slide = this._instanceService.getUnit<SlideDataModel>(unitId);
        slide?.setActivePage(slide.getPage(pageId) ?? null);
        TestCanvasView.activatedPages.push(pageId);
    }

    getRenderUnitByPageId(pageId: string, unitId: string) {
        const slide = this._instanceService.getUnit<SlideDataModel>(unitId);
        if (!slide?.getPage(pageId)) {
            return null;
        }

        return {
            scene: {
                getTransformer: () => ({
                    clearControls: () => {
                        TestCanvasView.clearedControls += 1;
                    },
                }),
            },
        };
    }

    createThumbs(unitId: string) {
        TestCanvasView.thumbUnitIds.push(unitId);
    }
}

class TestLocalFileService implements ILocalFileService {
    static files: File[] = [];

    static reset() {
        this.files = [];
    }

    openFile(): Promise<File[]> {
        return Promise.resolve(TestLocalFileService.files);
    }

    downloadFile(): void {
        // not used by slide image insertion
    }
}

class TestImageIoService {
    saveImage(): Promise<unknown> {
        return Promise.resolve({
            imageId: 'image-1',
            imageSourceType: ImageSourceType.BASE64,
            source: 'data:image/png;base64,ZmFrZQ==',
            base64Cache: 'data:image/png;base64,ZmFrZQ==',
            status: ImageUploadStatusType.SUCCUSS,
        });
    }
}

class TestImage {
    width = 64;
    height = 32;
    onload: (() => void) | null = null;
    onerror: ((error: unknown) => void) | null = null;

    set src(_value: string) {
        queueMicrotask(() => this.onload?.());
    }
}

function createSlideSnapshot(): Partial<ISlideData> {
    return {
        id: unitId,
        title: 'Command test deck',
        pageSize: { width: 960, height: 540 },
        body: {
            pageOrder: [pageId, 'page-2'],
            pages: {
                [pageId]: {
                    id: pageId,
                    pageType: PageType.SLIDE,
                    zIndex: 1,
                    title: 'Overview',
                    description: '',
                    pageBackgroundFill: { rgb: '#ffffff' },
                    pageElements: {
                        'title-text': {
                            id: 'title-text',
                            zIndex: 1,
                            left: 40,
                            top: 40,
                            width: 400,
                            height: 60,
                            title: 'Title',
                            description: '',
                            type: PageElementType.TEXT,
                            richText: { text: 'Quarterly review' },
                        },
                        'old-shape': {
                            id: 'old-shape',
                            zIndex: 2,
                            left: 100,
                            top: 120,
                            width: 80,
                            height: 80,
                            title: 'Old shape',
                            description: '',
                            type: PageElementType.SHAPE,
                            shape: {
                                shapeType: BasicShapes.Rect,
                                text: '',
                                shapeProperties: {
                                    shapeBackgroundFill: { rgb: 'rgb(0,0,255)' },
                                },
                            },
                        },
                    },
                },
                'page-2': {
                    id: 'page-2',
                    pageType: PageType.SLIDE,
                    zIndex: 2,
                    title: 'Appendix',
                    description: '',
                    pageBackgroundFill: { rgb: '#ffffff' },
                    pageElements: {},
                },
            },
        },
    };
}

function getActivePage(slide: SlideDataModel): ISlidePage {
    return slide.getActivePage()!;
}

function getElementIds(page: ISlidePage): string[] {
    const ids: string[] = [];
    for (const id in page.pageElements) {
        ids.push(id);
    }
    return ids;
}

function findElementAddedAfter(page: ISlidePage, beforeIds: string[]): IPageElement {
    for (const id in page.pageElements) {
        if (!beforeIds.includes(id)) {
            return page.pageElements[id];
        }
    }

    throw new Error('No new slide element was added.');
}

describe('slide element operations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let slide: SlideDataModel;
    let originalImage: typeof Image;

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverSlidesPlugin);
        TestCanvasView.reset();
        TestLocalFileService.reset();
        originalImage = globalThis.Image;
        (globalThis as unknown as { Image: typeof Image }).Image = TestImage as unknown as typeof Image;

        const injector = univer.__getInjector();
        injector.add([CanvasView, { useClass: TestCanvasView as never }]);
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([ILocalFileService, { useClass: TestLocalFileService }]);
        injector.add([IImageIoService, { useClass: TestImageIoService as never }]);

        slide = univer.createUnit<ISlideData, SlideDataModel>(UniverInstanceType.UNIVER_SLIDE, createSlideSnapshot());
        injector.get(IUniverInstanceService).focusUnit(unitId);
        commandService = injector.get(ICommandService);
        commandService.registerCommand(SlideAddTextOperation);
        commandService.registerCommand(SlideAddTextCommand);
        commandService.registerCommand(InsertSlideShapeRectangleOperation);
        commandService.registerCommand(InsertSlideShapeRectangleCommand);
        commandService.registerCommand(InsertSlideShapeEllipseOperation);
        commandService.registerCommand(InsertSlideShapeEllipseCommand);
        commandService.registerCommand(UpdateSlideElementOperation);
        commandService.registerCommand(DeleteSlideElementOperation);
        commandService.registerCommand(AppendSlideOperation);
        commandService.registerCommand(ActivateSlidePageOperation);
        commandService.registerCommand(SetSlidePageThumbOperation);
        commandService.registerCommand(InsertSlideFloatImageCommand);
        commandService.registerCommand(ToggleSlideEditSidebarOperation);
        commandService.registerCommand(SetTextEditArrowOperation);
        injector.get(LocaleService).load({});
    });

    afterEach(() => {
        (globalThis as unknown as { Image: typeof Image }).Image = originalImage;
        univer.dispose();
    });

    it('adds a text box to the active slide with the entered content', async () => {
        const page = getActivePage(slide);
        const beforeIds = getElementIds(page);

        const result = await commandService.executeCommand(SlideAddTextOperation.id, {
            unitId,
            text: 'Revenue is up',
        });

        expect(result).toBe(true);
        const element = findElementAddedAfter(page, beforeIds);
        expect(element).toMatchObject({
            zIndex: 3,
            type: PageElementType.TEXT,
            richText: {
                text: 'Revenue is up',
                fs: 30,
            },
        });
    });

    it('adds rectangle and ellipse shapes to the active slide', async () => {
        const page = getActivePage(slide);
        const beforeRectangleIds = getElementIds(page);

        await commandService.executeCommand(InsertSlideShapeRectangleCommand.id);
        const rectangle = findElementAddedAfter(page, beforeRectangleIds);

        const beforeEllipseIds = getElementIds(page);
        await commandService.executeCommand(InsertSlideShapeEllipseCommand.id);
        const ellipse = findElementAddedAfter(page, beforeEllipseIds);

        expect(rectangle).toMatchObject({
            zIndex: 3,
            type: PageElementType.SHAPE,
            shape: {
                shapeType: BasicShapes.Rect,
            },
        });
        expect(ellipse).toMatchObject({
            zIndex: 4,
            type: PageElementType.SHAPE,
            shape: {
                shapeType: BasicShapes.Ellipse,
            },
        });
    });

    it('uses the focused slide when adding text from the user command', async () => {
        const page = getActivePage(slide);
        const beforeIds = getElementIds(page);

        const result = await commandService.executeCommand(SlideAddTextCommand.id);

        expect(result).toBe(true);
        const element = findElementAddedAfter(page, beforeIds);
        expect(element).toMatchObject({
            type: PageElementType.TEXT,
            richText: { text: 'A New Text' },
        });
    });

    it('updates an existing slide element without replacing the rest of its content', async () => {
        const result = await commandService.executeCommand(UpdateSlideElementOperation.id, {
            unitId,
            oKey: 'title-text',
            props: {
                left: 120,
                title: 'Updated title box',
            },
        });

        expect(result).toBe(true);
        expect(slide.getElement(pageId, 'title-text')).toMatchObject({
            left: 120,
            title: 'Updated title box',
            type: PageElementType.TEXT,
            richText: { text: 'Quarterly review' },
        });
    });

    it('removes the selected element from the active slide', async () => {
        const result = await commandService.executeCommand(DeleteSlideElementOperation.id, {
            unitId,
            id: 'old-shape',
        });

        expect(result).toBe(true);
        expect(slide.getElement(pageId, 'old-shape')).toBeUndefined();
        expect(slide.getElement(pageId, 'title-text')).toBeDefined();
    });

    it('appends a new page after the active slide', async () => {
        expect(slide.getPageOrder()).toEqual([pageId, 'page-2']);

        const result = await commandService.executeCommand(AppendSlideOperation.id, { unitId });

        expect(result).toBe(true);
        expect(slide.getPageOrder()).toHaveLength(3);
        expect(slide.getPageOrder()?.[0]).toBe(pageId);
        expect(slide.getPageOrder()?.[1]).not.toBe('page-2');
        expect(slide.getPageOrder()?.[2]).toBe('page-2');
    });

    it('activates another page after clearing the current page controls', async () => {
        const result = await commandService.executeCommand(ActivateSlidePageOperation.id, {
            unitId,
            id: 'page-2',
        });

        expect(result).toBe(true);
        expect(slide.getActivePage()?.id).toBe('page-2');
        expect(TestCanvasView.clearedControls).toBe(1);
        expect(TestCanvasView.activatedPages).toEqual(['page-2']);
    });

    it('does not activate a missing page renderer', async () => {
        const result = await commandService.executeCommand(ActivateSlidePageOperation.id, {
            unitId: 'missing-slide',
            id: 'page-2',
        });

        expect(result).toBe(false);
        expect(slide.getActivePage()?.id).toBe(pageId);
    });

    it('creates thumbnails for the current deck', async () => {
        const result = await commandService.executeCommand(SetSlidePageThumbOperation.id, { unitId });

        expect(result).toBe(true);
        expect(TestCanvasView.thumbUnitIds).toEqual([unitId]);
    });

    it('keeps the deck unchanged when the user cancels image selection', async () => {
        const page = getActivePage(slide);
        const beforeIds = getElementIds(page);

        const result = await commandService.executeCommand(InsertSlideFloatImageCommand.id);

        expect(result).toBe(false);
        expect(getElementIds(page)).toEqual(beforeIds);
    });

    it('adds the selected image to the active slide and selects the created object', async () => {
        const page = getActivePage(slide);
        const beforeIds = getElementIds(page);
        TestCanvasView.activateCreatedObject = true;
        TestLocalFileService.files = [new File(['fake image'], 'chart.png', { type: 'image/png' })];

        const result = await commandService.executeCommand(InsertSlideFloatImageCommand.id);

        expect(result).toBe(true);
        const element = findElementAddedAfter(page, beforeIds);
        expect(element).toMatchObject({
            id: 'image-1',
            zIndex: 3,
            width: 64,
            height: 32,
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    imageSourceType: ImageSourceType.BASE64,
                    source: 'data:image/png;base64,ZmFrZQ==',
                    base64Cache: 'data:image/png;base64,ZmFrZQ==',
                },
            },
        });
        expect(TestCanvasView.activeObjectIds).toEqual(['created-object']);
    });

    it('keeps the current text-edit arrow operation as a no-op success', async () => {
        await expect(commandService.executeCommand(SetTextEditArrowOperation.id, { direction: 'left' })).resolves.toBe(true);
    });

    it('opens and closes the slide edit sidebar for the selected object type', async () => {
        const sidebarService = univer.__getInjector().get(ISidebarService);
        const objectTypes = [
            { type: ObjectType.RECT, title: 'slides-ui.sidebar.shape' },
            { type: ObjectType.IMAGE, title: 'slides-ui.sidebar.image' },
            { type: ObjectType.RICH_TEXT, title: 'slides-ui.sidebar.text' },
        ];

        for (const objectType of objectTypes) {
            await commandService.executeCommand(ToggleSlideEditSidebarOperation.id, {
                visible: '1',
                objectType: objectType.type,
            });

            expect(sidebarService.visible).toBe(true);
            expect(sidebarService.options.header?.title).toBe(objectType.title);
        }

        await commandService.executeCommand(ToggleSlideEditSidebarOperation.id, {
            visible: '',
            objectType: ObjectType.RECT,
        });

        expect(sidebarService.visible).toBe(false);
    });
});
