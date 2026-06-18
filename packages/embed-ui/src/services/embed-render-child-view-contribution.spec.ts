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

/**
 * @vitest-environment jsdom
 */

import type { IEmbedChildContainerContext } from '../types/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { mountEmbedRenderChildUnit } from './embed-render-child-view-contribution';

class RenderManagerToken {}

describe('mountEmbedRenderChildUnit', () => {
    it('mounts render children into the runtime canvas root by default', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const canvas = document.createElement('div');
        const overlay = document.createElement('div');
        const render = createRender();
        const context = createContext(root, content, canvas, overlay, render);

        const disposable = mountEmbedRenderChildUnit(context, RenderManagerToken as never);

        expect(render.engine.mount).toHaveBeenCalledWith(canvas);
        expect(canvas.dataset.embedChildRenderUnitId).toBe('child-1');
        expect(root.dataset.embedChildRenderUnitId).toBeUndefined();

        disposable?.dispose();

        expect(render.engine.unmount).toHaveBeenCalled();
        expect(canvas.dataset.embedChildRenderUnitId).toBeUndefined();
    });

    it('falls back to the content root when no canvas root exists', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const overlay = document.createElement('div');
        const render = createRender();
        const context = createContext(root, content, undefined, overlay, render);

        const disposable = mountEmbedRenderChildUnit(context, RenderManagerToken as never);

        expect(render.engine.mount).toHaveBeenCalledWith(content);

        disposable?.dispose();
    });

    it('can mount a render child without activating it', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const canvas = document.createElement('div');
        const overlay = document.createElement('div');
        const render = createRender();
        const context = createContext(root, content, canvas, overlay, render);

        const disposable = mountEmbedRenderChildUnit(context, RenderManagerToken as never, canvas, { activate: false });

        expect(render.engine.mount).toHaveBeenCalledWith(canvas);
        expect(render.activate).not.toHaveBeenCalled();

        disposable?.dispose();
    });
});

function createRender() {
    return {
        engine: {
            mount: vi.fn(),
            unmount: vi.fn(),
            resize: vi.fn(),
        },
        components: {
            forEach: vi.fn(),
        },
        mainComponent: {
            makeDirty: vi.fn(),
        },
        scene: {
            makeDirty: vi.fn(),
            render: vi.fn(),
        },
        activate: vi.fn(),
    };
}

function createContext(
    root: HTMLElement,
    content: HTMLElement,
    canvas: HTMLElement | undefined,
    overlay: HTMLElement,
    render: ReturnType<typeof createRender>
): IEmbedChildContainerContext {
    const renderManager = {
        getRenderById: vi.fn(() => undefined),
        createRender: vi.fn(() => render),
        removeRender: vi.fn(),
    };
    const injector = {
        get: () => renderManager,
    } as never;

    return {
        descriptor: {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            hostAnchorId: 'anchor-1',
            source: {
                kind: 'empty',
                unitType: UniverInstanceType.UNIVER_DOC,
            },
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_DOC,
        },
        layout: 'tab-peer',
        injector,
        hostElement: root,
        container: root,
        hostUnitId: 'host-1',
        embedId: 'embed-1',
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_DOC,
        renderScope: {
            hostUnitId: 'host-1',
            hostAnchorId: 'anchor-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_DOC,
            layout: 'tab-peer',
            mode: 'tab',
            rootElement: root,
            contentRoot: content,
            canvasRoot: canvas,
            overlayRoot: overlay,
            active$: of(true),
        },
        runtimeScope: {
            descriptor: {
                embedId: 'embed-1',
                hostUnitId: 'host-1',
                hostType: UniverInstanceType.UNIVER_SHEET,
                entry: 'sheets-sheet-tab',
                hostAnchorId: 'anchor-1',
                source: {
                    kind: 'empty',
                    unitType: UniverInstanceType.UNIVER_DOC,
                },
                childUnitId: 'child-1',
                childType: UniverInstanceType.UNIVER_DOC,
            },
            host: {
                unitId: 'host-1',
                type: UniverInstanceType.UNIVER_SHEET,
                anchorId: 'anchor-1',
                entry: 'sheets-sheet-tab',
                layout: 'tab-peer',
            },
            child: {
                unitId: 'child-1',
                type: UniverInstanceType.UNIVER_DOC,
            },
            injector,
            roots: {
                root,
                content,
                canvas,
                overlay,
                popup: overlay,
            },
            activate: () => {},
            deactivate: () => {},
            dispose: () => {},
        },
    };
}
