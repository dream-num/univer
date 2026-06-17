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
import { ICommandService, Univer, UniverInstanceType } from '@univerjs/core';
import { BasicShapes, PageElementType, PageType, UniverSlidesPlugin } from '@univerjs/slides';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CanvasView } from '../../../controllers/canvas-view';
import { DeleteSlideElementOperation } from '../delete-element.operation';
import { InsertSlideShapeEllipseOperation, InsertSlideShapeRectangleOperation } from '../insert-shape.operation';
import { SlideAddTextOperation } from '../insert-text.operation';
import { UpdateSlideElementOperation } from '../update-element.operation';

const unitId = 'slide-command-unit';
const pageId = 'page-1';

class TestCanvasView {
    createObjectToPage() {
        return null;
    }

    removeObjectById() {
        // render boundary is not part of the data-model behavior under test
    }
}

function createSlideSnapshot(): Partial<ISlideData> {
    return {
        id: unitId,
        title: 'Command test deck',
        pageSize: { width: 960, height: 540 },
        body: {
            pageOrder: [pageId],
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

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverSlidesPlugin);

        const injector = univer.__getInjector();
        injector.add([CanvasView, { useClass: TestCanvasView as never }]);

        slide = univer.createUnit<ISlideData, SlideDataModel>(UniverInstanceType.UNIVER_SLIDE, createSlideSnapshot());
        commandService = injector.get(ICommandService);
        commandService.registerCommand(SlideAddTextOperation);
        commandService.registerCommand(InsertSlideShapeRectangleOperation);
        commandService.registerCommand(InsertSlideShapeEllipseOperation);
        commandService.registerCommand(UpdateSlideElementOperation);
        commandService.registerCommand(DeleteSlideElementOperation);
    });

    afterEach(() => {
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

        await commandService.executeCommand(InsertSlideShapeRectangleOperation.id, { unitId });
        const rectangle = findElementAddedAfter(page, beforeRectangleIds);

        const beforeEllipseIds = getElementIds(page);
        await commandService.executeCommand(InsertSlideShapeEllipseOperation.id, { unitId });
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
});
