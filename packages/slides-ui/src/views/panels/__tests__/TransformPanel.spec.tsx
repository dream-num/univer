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
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UpdateSlideElementOperation } from '../../../commands/operations/update-element.operation';
import { CanvasView } from '../../../controllers/canvas-view';
import locale from '../../../locale/en-US';
import TransformPanel from '../TransformPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'transform-panel-unit';
const PAGE_ID = 'page-1';
const SELECTED_ID = 'selected-shape';

class TestSlideObject {
    public refreshCount = 0;

    constructor(
        readonly oKey: string,
        public width: number,
        public height: number,
        public left: number,
        public top: number,
        public angle: number
    ) {}

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    translate(left: number, top: number) {
        this.left = left;
        this.top = top;
    }

    transformByState(state: { angle?: number }) {
        if (typeof state.angle === 'number') {
            this.angle = state.angle;
        }
    }
}

class TestTransformer {
    readonly changeStart$ = new Subject<{ objects: Map<string, TestSlideObject> }>();
    readonly changing$ = new Subject<{ objects: Map<string, TestSlideObject> }>();

    constructor(private readonly _object: TestSlideObject) {}

    getSelectedObjectMap() {
        return new Map([[this._object.oKey, this._object]]);
    }

    refreshControls() {
        this._object.refreshCount += 1;
    }
}

class TestScene {
    private readonly _transformer: TestTransformer;

    constructor(selectedObject: TestSlideObject) {
        this._transformer = new TestTransformer(selectedObject);
    }

    getTransformer() {
        return this._transformer;
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
        title: 'Transform panel deck',
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
                            top: 120,
                            width: 160,
                            height: 90,
                            angle: 15,
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

function createRenderScene() {
    const selectedObject = new TestSlideObject(SELECTED_ID, 160, 90, 100, 120, 15);
    TestCanvasView.scene = new TestScene(selectedObject);

    return selectedObject;
}

function renderTransformPanel(root: Root, testBed: ReturnType<typeof createPanelTestBed>) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <TransformPanel pageId={PAGE_ID} unitId={UNIT_ID} />
            </RediContext.Provider>
        );
    });
}

function setInputValue(input: HTMLInputElement, value: number) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

    act(() => {
        valueSetter?.call(input, String(value));
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

function getInputs(container: HTMLElement) {
    const inputs = Array.from(container.querySelectorAll('input'));
    if (inputs.length !== 5) {
        throw new Error(`Expected five transform inputs, received ${inputs.length}`);
    }

    return inputs;
}

describe('TransformPanel', () => {
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

    it('updates the selected slide element when dimension controls change', () => {
        currentTestBed = createPanelTestBed();
        const selectedObject = createRenderScene();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderTransformPanel(root, currentTestBed);

        const [widthInput, heightInput] = getInputs(container);
        setInputValue(widthInput, 240);
        setInputValue(heightInput, 135);

        expect(selectedObject).toMatchObject({
            width: 240,
            height: 135,
            refreshCount: 2,
        });
    });

    it('updates the selected slide element when position and rotation controls change', () => {
        currentTestBed = createPanelTestBed();
        const selectedObject = createRenderScene();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderTransformPanel(root, currentTestBed);

        const [, , xInput, yInput, rotationInput] = getInputs(container);
        setInputValue(xInput, 210);
        setInputValue(yInput, 180);
        setInputValue(rotationInput, 45);

        expect(selectedObject).toMatchObject({
            left: 210,
            top: 180,
            angle: 45,
            refreshCount: 3,
        });
    });
});
