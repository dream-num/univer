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
import { ComponentManager, IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DrawingImageClipService } from '../../services/drawing-image-clip.service';
import { DrawingCommonPanel } from '../panel/DrawingCommonPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const unitId = 'drawing-common-panel-unit';
const subUnitId = 'drawing-common-panel-subunit';

class TestTransformer {
    readonly clearControl$ = new Subject<boolean>();
    readonly changeStart$ = new Subject<{ objects: Map<string, { oKey: string }> }>();
    readonly changing$ = new Subject<{ objects: Map<string, { oKey: string }> }>();
    readonly changeEnd$ = new Subject<{ objects: Map<string, { oKey: string }> }>();
    keepRatio = true;

    refreshControls() {
        return {
            changeNotification: () => undefined,
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

function createDrawing(drawingId: string, left: number): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        transform: {
            left,
            top: 20,
            width: 100,
            height: 50,
            angle: 0,
        },
    };
}

function renderWithRediContext(injector: ReturnType<Univer['__getInjector']>, drawings: IDrawingParam[]) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <DrawingCommonPanel drawings={drawings} />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function textIsAvailable(container: HTMLElement, text: string) {
    const element = Array.from(container.querySelectorAll<HTMLElement>('button,div,span'))
        .find((item) => item.textContent === text);

    if (!element) {
        return false;
    }

    let current: HTMLElement | null = element;
    while (current && current !== container) {
        if (current.classList.contains('univer-hidden')) {
            return false;
        }

        current = current.parentElement;
    }

    return true;
}

describe('DrawingCommonPanel behavior', () => {
    let univer: Univer;
    let drawingManagerService: IDrawingManagerService;
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    beforeEach(() => {
        univer = new Univer({ locales: { [LocaleType.ZH_CN]: {} } });
        const injector = univer.__getInjector();
        injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([IconManager]);
        injector.add([ComponentManager]);
        injector.add([DrawingImageClipService]);

        drawingManagerService = injector.get(IDrawingManagerService);
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

    it('starts in multi-select mode when multiple drawings are already focused', () => {
        const drawings = [createDrawing('image-1', 10), createDrawing('image-2', 140)];
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    'image-1': drawings[0],
                    'image-2': drawings[1],
                },
                order: ['image-1', 'image-2'],
            },
        });
        drawingManagerService.focusDrawing(drawings.map(({ unitId, subUnitId, drawingId }) => ({ unitId, subUnitId, drawingId })));

        const rendered = renderWithRediContext(univer.__getInjector(), drawings);
        root = rendered.root;
        container = rendered.container;

        expect(textIsAvailable(container, 'drawing-ui.image-panel.align.title')).toBe(true);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.transform.title')).toBe(false);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.crop.title')).toBe(false);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.arrange.title')).toBe(true);
    });

    it('switches from single-image controls to multi-select controls when drawing focus changes', () => {
        const drawings = [createDrawing('image-1', 10), createDrawing('image-2', 140)];
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    'image-1': drawings[0],
                    'image-2': drawings[1],
                },
                order: ['image-1', 'image-2'],
            },
        });
        drawingManagerService.focusDrawing([{ unitId, subUnitId, drawingId: 'image-1' }]);

        const rendered = renderWithRediContext(univer.__getInjector(), [drawings[0]]);
        root = rendered.root;
        container = rendered.container;

        expect(textIsAvailable(container, 'drawing-ui.image-panel.align.title')).toBe(false);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.transform.title')).toBe(true);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.crop.title')).toBe(true);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.arrange.title')).toBe(true);

        act(() => {
            drawingManagerService.focusDrawing(drawings.map(({ unitId, subUnitId, drawingId }) => ({ unitId, subUnitId, drawingId })));
        });

        expect(textIsAvailable(container, 'drawing-ui.image-panel.align.title')).toBe(true);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.transform.title')).toBe(false);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.crop.title')).toBe(false);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.arrange.title')).toBe(true);
    });

    it('returns to the empty panel when the active transformer clears its controls', () => {
        const drawing = createDrawing('image-1', 10);
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    'image-1': drawing,
                },
                order: ['image-1'],
            },
        });
        drawingManagerService.focusDrawing([{ unitId, subUnitId, drawingId: 'image-1' }]);

        const rendered = renderWithRediContext(univer.__getInjector(), [drawing]);
        root = rendered.root;
        container = rendered.container;

        expect(textIsAvailable(container, 'drawing-ui.image-panel.null')).toBe(false);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.transform.title')).toBe(true);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.crop.title')).toBe(true);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.arrange.title')).toBe(true);

        act(() => {
            (univer.__getInjector().get(IRenderManagerService) as unknown as TestRenderManagerService)
                .transformer
                .clearControl$
                .next(true);
        });

        expect(textIsAvailable(container, 'drawing-ui.image-panel.null')).toBe(true);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.transform.title')).toBe(false);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.crop.title')).toBe(false);
        expect(textIsAvailable(container, 'drawing-ui.image-panel.arrange.title')).toBe(false);
    });
});
