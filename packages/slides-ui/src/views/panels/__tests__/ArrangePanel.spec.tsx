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

import type { ISlideData, SlideDataModel } from '@univerjs/slides';
import type { Root } from 'react-dom/client';
import { ICommandService, IUniverInstanceService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { BasicShapes, PageElementType, PageType, UniverSlidesPlugin } from '@univerjs/slides';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UpdateSlideElementOperation } from '../../../commands/operations/update-element.operation';
import { CanvasView } from '../../../controllers/canvas-view';
import locale from '../../../locale/en-US';
import ArrangePanel from '../ArrangePanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'arrange-panel-unit';
const PAGE_ID = 'page-1';
const SELECTED_ID = 'selected-shape';

class TestSlideObject {
    constructor(
        readonly oKey: string,
        public zIndex: number
    ) {}

    setProps(props: { zIndex?: number }) {
        if (typeof props.zIndex === 'number') {
            this.zIndex = props.zIndex;
        }
    }
}

class TestTransformer {
    constructor(private readonly _object: TestSlideObject) {}

    getSelectedObjectMap() {
        return new Map([[this._object.oKey, this._object]]);
    }
}

class TestScene {
    private readonly _transformer: TestTransformer;

    constructor(private readonly _objects: TestSlideObject[], selectedObject: TestSlideObject) {
        this._transformer = new TestTransformer(selectedObject);
    }

    getTransformer() {
        return this._transformer;
    }

    getAllObjects() {
        return this._objects;
    }
}

class TestCanvasView {
    static scene: TestScene | null = null;

    static reset() {
        this.scene = null;
    }

    getRenderUnitByPageId() {
        return TestCanvasView.scene
            ? { scene: TestCanvasView.scene }
            : null;
    }
}

function createSlideSnapshot(): Partial<ISlideData> {
    return {
        id: UNIT_ID,
        title: 'Arrange panel deck',
        pageSize: { width: 960, height: 540 },
        body: {
            pageOrder: [PAGE_ID],
            pages: {
                [PAGE_ID]: {
                    id: PAGE_ID,
                    pageType: PageType.SLIDE,
                    zIndex: 1,
                    title: 'Slide',
                    description: '',
                    pageBackgroundFill: { rgb: '#ffffff' },
                    pageElements: {
                        [SELECTED_ID]: {
                            id: SELECTED_ID,
                            zIndex: 2,
                            left: 100,
                            top: 100,
                            width: 120,
                            height: 80,
                            title: 'Selected shape',
                            description: '',
                            type: PageElementType.SHAPE,
                            shape: {
                                shapeType: BasicShapes.Rect,
                                text: '',
                                shapeProperties: {
                                    shapeBackgroundFill: { rgb: '#4472c4' },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
}

function createPanelTestBed() {
    const univer = new Univer();
    univer.registerPlugin(UniverSlidesPlugin);

    const injector = univer.__getInjector();
    injector.add([CanvasView, { useClass: TestCanvasView as never }]);

    const slide = univer.createUnit<ISlideData, SlideDataModel>(UniverInstanceType.UNIVER_SLIDE, createSlideSnapshot());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(UpdateSlideElementOperation);
    injector.get(LocaleService).load({
        [LocaleType.EN_US]: locale,
    });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    return { univer, injector, slide };
}

function createRenderScene(selectedZIndex: number, otherZIndexes: number[]) {
    const selectedObject = new TestSlideObject(SELECTED_ID, selectedZIndex);
    const objects = [
        selectedObject,
        ...otherZIndexes.map((zIndex, index) => new TestSlideObject(`object-${index}`, zIndex)),
    ];
    TestCanvasView.scene = new TestScene(objects, selectedObject);

    return selectedObject;
}

function renderPanel(root: Root, testBed: ReturnType<typeof createPanelTestBed>) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <ArrangePanel pageId={PAGE_ID} unitId={UNIT_ID} />
            </RediContext.Provider>
        );
    });
}

function clickButton(container: HTMLElement, text: string) {
    const button = Array.from(container.querySelectorAll('button'))
        .find((button) => button.textContent?.includes(text));
    if (!button) {
        throw new Error(`Button not found: ${text}`);
    }

    act(() => {
        button.click();
    });
}

describe('ArrangePanel', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createPanelTestBed> | undefined;

    beforeEach(() => {
        TestCanvasView.reset();
    });

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('moves the selected slide element above every rendered object', () => {
        currentTestBed = createPanelTestBed();
        const selectedObject = createRenderScene(2, [1, 4]);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        clickButton(container, 'Bring to Front');

        expect(selectedObject.zIndex).toBe(5);
        expect(currentTestBed.slide.getElement(PAGE_ID, SELECTED_ID)).toMatchObject({
            zIndex: 5,
        });
    });

    it('moves the selected slide element one layer forward', () => {
        currentTestBed = createPanelTestBed();
        const selectedObject = createRenderScene(2, [1, 4]);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        clickButton(container, 'Bring Forward');

        expect(selectedObject.zIndex).toBe(3);
        expect(currentTestBed.slide.getElement(PAGE_ID, SELECTED_ID)).toMatchObject({
            zIndex: 3,
        });
    });

    it('moves the selected slide element behind every rendered object', () => {
        currentTestBed = createPanelTestBed();
        const selectedObject = createRenderScene(2, [3, 5]);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        clickButton(container, 'Send to Back');

        expect(selectedObject.zIndex).toBe(-1);
        expect(currentTestBed.slide.getElement(PAGE_ID, SELECTED_ID)).toMatchObject({
            zIndex: -1,
        });
    });
});
