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
import type { Root } from 'react-dom/client';
import { DrawingTypeEnum, LocaleType, Univer } from '@univerjs/core';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DrawingTransform } from '../panel/DrawingTransform';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const unitId = 'drawing-transform-unit';
const subUnitId = 'drawing-transform-subunit';

interface ITransformObject {
    oKey: string;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    angle?: number;
}

class TestTransformer {
    readonly changeStart$ = new Subject<{ objects: Map<string, ITransformObject> }>();
    readonly changing$ = new Subject<{ objects: Map<string, ITransformObject> }>();
    readonly changeEnd$ = new Subject<{ objects: Map<string, ITransformObject> }>();
    keepRatio = true;
    refreshCount = 0;
    notificationCount = 0;

    refreshControls() {
        this.refreshCount += 1;

        return {
            changeNotification: () => {
                this.notificationCount += 1;
            },
        };
    }
}

class TestScene {
    ancestorLeft = 0;
    ancestorTop = 0;

    constructor(private readonly _transformer: TestTransformer) {}

    getEngine() {
        return {
            activeScene: {
                width: 500,
                height: 400,
            },
        };
    }

    getTransformerByCreate() {
        return this._transformer;
    }
}

class TestRenderManagerService {
    readonly transformer = new TestTransformer();
    readonly scene = new TestScene(this.transformer);

    getRenderById() {
        return {
            scene: this.scene,
        };
    }
}

function createDrawing(drawingId: string): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        transform: {
            left: 10,
            top: 20,
            width: 100,
            height: 50,
            angle: 0,
        },
    };
}

function renderWithRediContext(injector: ReturnType<Univer['__getInjector']>, drawing: IDrawingParam) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <DrawingTransform transformShow drawings={[drawing]} />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function inputInField(container: HTMLElement, text: string) {
    const label = Array.from(container.querySelectorAll('span'))
        .find((span) => span.textContent === text);
    return label?.parentElement?.querySelector('input') as HTMLInputElement;
}

function setInputValue(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function waitForDebouncedInput() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 350));
    });
}

describe('DrawingTransform behavior', () => {
    let univer: Univer;
    let drawingManagerService: IDrawingManagerService;
    let renderManagerService: TestRenderManagerService;
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    beforeEach(() => {
        univer = new Univer({ locales: { [LocaleType.ZH_CN]: {} } });
        const injector = univer.__getInjector();
        injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);

        drawingManagerService = injector.get(IDrawingManagerService);
        renderManagerService = injector.get(IRenderManagerService) as unknown as TestRenderManagerService;
    });

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
        univer.dispose();
    });

    it('resizes the focused drawing proportionally while aspect ratio is locked', async () => {
        const drawing = createDrawing('image-1');
        const updates: IDrawingParam[][] = [];
        drawingManagerService.featurePluginUpdate$.subscribe((update) => updates.push(update));

        const rendered = renderWithRediContext(univer.__getInjector(), drawing);
        root = rendered.root;
        container = rendered.container;

        setInputValue(inputInField(container, 'drawing-ui.image-panel.transform.width'), '120');
        await waitForDebouncedInput();

        expect(updates).toEqual([[
            {
                unitId,
                subUnitId,
                drawingId: 'image-1',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: {
                    width: 120,
                    height: 60,
                },
            },
        ]]);
        expect(renderManagerService.transformer.refreshCount).toBe(1);
        expect(renderManagerService.transformer.notificationCount).toBe(1);
    });

    it('emits the requested rotation for the focused drawing', () => {
        const drawing = createDrawing('image-1');
        const updates: IDrawingParam[][] = [];
        drawingManagerService.featurePluginUpdate$.subscribe((update) => updates.push(update));

        const rendered = renderWithRediContext(univer.__getInjector(), drawing);
        root = rendered.root;
        container = rendered.container;

        act(() => {
            setInputValue(inputInField(container!, 'drawing-ui.image-panel.transform.rotate'), '45');
        });

        expect(updates).toEqual([[
            {
                unitId,
                subUnitId,
                drawingId: 'image-1',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: {
                    angle: 45,
                },
            },
        ]]);
        expect(renderManagerService.transformer.refreshCount).toBe(1);
        expect(renderManagerService.transformer.notificationCount).toBe(1);
    });
});
