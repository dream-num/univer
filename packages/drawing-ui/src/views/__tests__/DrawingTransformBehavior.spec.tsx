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
import { DrawingManagerService, getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
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

function getNumberInput(container: HTMLElement, index: number): HTMLInputElement {
    return container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input')[index];
}

function getLockRatioInput(container: HTMLElement): HTMLInputElement {
    return container.querySelector<HTMLInputElement>('[data-u-comp="checkbox"] input')!;
}

function setInputValue(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function inputNumberValue(container: HTMLElement, index: number) {
    return Number(getNumberInput(container, index).value);
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

        setInputValue(getNumberInput(container, 0), '120');
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

    it('resizes only the edited dimension after aspect ratio is unlocked', async () => {
        const drawing = createDrawing('image-1');
        const updates: IDrawingParam[][] = [];
        drawingManagerService.featurePluginUpdate$.subscribe((update) => updates.push(update));

        const rendered = renderWithRediContext(univer.__getInjector(), drawing);
        root = rendered.root;
        container = rendered.container;

        act(() => {
            getLockRatioInput(container!).click();
        });

        expect(renderManagerService.transformer.keepRatio).toBe(false);

        setInputValue(getNumberInput(container, 0), '120');
        await waitForDebouncedInput();

        expect(updates).toEqual([[
            {
                unitId,
                subUnitId,
                drawingId: 'image-1',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: {
                    width: 120,
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
            setInputValue(getNumberInput(container!, 4), '45');
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

    it('disables rotation input for chart drawings', () => {
        const drawing = {
            ...createDrawing('chart-1'),
            drawingType: DrawingTypeEnum.DRAWING_CHART,
        };

        const rendered = renderWithRediContext(univer.__getInjector(), drawing);
        root = rendered.root;
        container = rendered.container;

        expect(getNumberInput(container, 4).disabled).toBe(true);
    });

    it('disables rotation input for groups containing chart drawings', () => {
        const group = {
            ...createDrawing('group-1'),
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
        };
        const chart = {
            ...createDrawing('chart-child'),
            drawingType: DrawingTypeEnum.DRAWING_CHART,
            groupId: 'group-1',
        };
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    [group.drawingId]: group,
                    [chart.drawingId]: chart,
                },
                order: [group.drawingId, chart.drawingId],
            },
        });

        const rendered = renderWithRediContext(univer.__getInjector(), group);
        root = rendered.root;
        container = rendered.container;

        expect(getNumberInput(container, 4).disabled).toBe(true);
    });

    it('clamps negative position inputs to the canvas origin', async () => {
        const drawing = createDrawing('image-1');
        const updates: IDrawingParam[][] = [];
        drawingManagerService.featurePluginUpdate$.subscribe((update) => updates.push(update));

        const rendered = renderWithRediContext(univer.__getInjector(), drawing);
        root = rendered.root;
        container = rendered.container;

        act(() => {
            setInputValue(getNumberInput(container!, 2), '-30');
        });
        await waitForDebouncedInput();
        act(() => {
            setInputValue(getNumberInput(container!, 3), '-40');
        });
        await waitForDebouncedInput();

        expect(updates).toHaveLength(2);
        expect(updates[0][0]).toMatchObject({
            unitId,
            subUnitId,
            drawingId: 'image-1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            transform: {
                left: expect.closeTo(0),
            },
        });
        expect(updates[1][0]).toMatchObject({
            unitId,
            subUnitId,
            drawingId: 'image-1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            transform: {
                top: expect.closeTo(0),
            },
        });
    });

    it('syncs transform fields from canvas transformer updates', () => {
        const drawing = createDrawing('image-1');
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    [drawing.drawingId]: drawing,
                },
                order: [drawing.drawingId],
            },
        });

        const rendered = renderWithRediContext(univer.__getInjector(), drawing);
        root = rendered.root;
        container = rendered.container;

        const oKey = getDrawingShapeKeyByDrawingSearch({
            unitId,
            subUnitId,
            drawingId: drawing.drawingId,
        });

        act(() => {
            renderManagerService.transformer.changeEnd$.next({
                objects: new Map([[
                    oKey,
                    {
                        oKey,
                        left: 44,
                        top: 66,
                        width: 180,
                        height: 90,
                        angle: 15,
                    },
                ]]),
            });
        });

        expect(inputNumberValue(container, 0)).toBe(180);
        expect(inputNumberValue(container, 1)).toBe(90);
        expect(inputNumberValue(container, 2)).toBe(44);
        expect(inputNumberValue(container, 3)).toBe(66);
        expect(inputNumberValue(container, 4)).toBe(15);
    });
});
