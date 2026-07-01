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

import type { Injector } from '@univerjs/core';
import type { IEmbedChildContainerContext } from '../../types/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    createEmbedChildRender,
    createEmbedRenderChildViewContribution,
    ensureEmbedChildRender,
    mountEmbedRenderChildUnit,
    refreshEmbedChildRender,
} from '../embed-render-child-view-contribution';

class RenderManagerToken {}

let resizeObserverInstances: TestResizeObserver[] = [];

afterEach(() => {
    resizeObserverInstances = [];
    vi.unstubAllGlobals();
});

describe('mountEmbedRenderChildUnit', () => {
    it('creates child view contributions from render manager tokens', () => {
        const contribution = createEmbedRenderChildViewContribution({
            childType: UniverInstanceType.UNIVER_DOC,
            renderManagerService: RenderManagerToken as never,
            supportedLayouts: ['tab-peer', 'doc-width-scale'] as never,
        });

        expect(contribution).toMatchObject({
            childType: UniverInstanceType.UNIVER_DOC,
            supportedLayouts: ['tab-peer', 'doc-width-scale'],
        });
    });

    it('mounts render children into the runtime canvas root by default', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const canvas = document.createElement('div');
        const overlay = document.createElement('div');
        const render = createRender();
        const embedMount = createEmbedMount(root, content, canvas, overlay, render);

        const disposable = mountEmbedRenderChildUnit(embedMount, RenderManagerToken as never);

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
        const embedMount = createEmbedMount(root, content, undefined, overlay, render);

        const disposable = mountEmbedRenderChildUnit(embedMount, RenderManagerToken as never);

        expect(render.engine.mount).toHaveBeenCalledWith(content);

        disposable?.dispose();
    });

    it('can mount a render child without activating it', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const canvas = document.createElement('div');
        const overlay = document.createElement('div');
        const render = createRender();
        const embedMount = createEmbedMount(root, content, canvas, overlay, render);

        const disposable = mountEmbedRenderChildUnit(embedMount, RenderManagerToken as never, canvas, { activate: false });

        expect(render.engine.mount).toHaveBeenCalledWith(canvas);
        expect(render.activate).not.toHaveBeenCalled();

        disposable?.dispose();
    });

    it('attaches an existing canvas and tolerates stale unmount errors', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const canvas = document.createElement('div');
        const overlay = document.createElement('div');
        const childCanvas = document.createElement('canvas');
        const render = createRender({
            getCanvasElement: () => childCanvas,
            unmount: vi.fn(() => {
                throw new Error('already detached');
            }),
        });
        const embedMount = createEmbedMount(root, content, canvas, overlay, render);

        const disposable = mountEmbedRenderChildUnit(embedMount, RenderManagerToken as never);

        expect(canvas.contains(childCanvas)).toBe(true);
        disposable?.dispose();
        expect(canvas.dataset.embedChildRenderUnitId).toBeUndefined();
    });

    it('refreshes the child render when the mounted target resizes', () => {
        vi.stubGlobal('ResizeObserver', TestResizeObserver);
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 1;
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        const root = document.createElement('div');
        const content = document.createElement('div');
        const canvas = document.createElement('div');
        const overlay = document.createElement('div');
        const render = createRender();
        const embedMount = createEmbedMount(root, content, canvas, overlay, render);

        const disposable = mountEmbedRenderChildUnit(embedMount, RenderManagerToken as never);

        expect(resizeObserverInstances).toHaveLength(1);
        expect(resizeObserverInstances[0].observed).toContain(canvas);
        render.engine.resize.mockClear();
        render.scene.render.mockClear();

        resizeObserverInstances[0].emit();

        expect(render.engine.resize).toHaveBeenCalledTimes(1);
        expect(render.scene.render).toHaveBeenCalledTimes(1);

        disposable?.dispose();

        expect(resizeObserverInstances[0].disconnected).toBe(true);
    });

    it('reuses, recreates, and cleans failed child renders', () => {
        const parentA = {} as Injector;
        const parentB = {} as Injector;
        const existing = createRender({
            with: vi.fn(() => parentA),
        });
        const replacement = createRender({
            with: vi.fn(() => parentB),
        });
        const renderManager = {
            createRender: vi.fn(() => replacement),
            getRenderById: vi.fn(() => existing),
            removeRender: vi.fn(),
        };

        expect(ensureEmbedChildRender(renderManager as never, 'child-1')).toBe(existing);
        expect(ensureEmbedChildRender(renderManager as never, 'child-1', parentA)).toBe(existing);
        expect(ensureEmbedChildRender(renderManager as never, 'child-1', parentB)).toBe(replacement);
        expect(createEmbedChildRender(renderManager as never, 'child-1', parentA)).toBe(existing);
        expect(createEmbedChildRender(renderManager as never, 'child-1', parentB)).toBe(replacement);
        expect(renderManager.removeRender).toHaveBeenCalledWith('child-1');

        const failingRenderManager = {
            createRender: vi.fn(() => {
                throw new Error('render failed');
            }),
            getRenderById: vi.fn(() => undefined),
            removeRender: vi.fn(),
        };
        expect(ensureEmbedChildRender(failingRenderManager, 'child-2')).toBeUndefined();
        expect(createEmbedChildRender(failingRenderManager, 'child-2')).toBeUndefined();
        expect(failingRenderManager.removeRender).toHaveBeenCalledWith('child-2');
    });

    it('refreshes child renders and marks all components dirty', () => {
        const dirtyComponent = {
            makeDirty: vi.fn(),
            makeForceDirty: vi.fn(),
        };
        const render = createRender();
        render.components.forEach.mockImplementation((callback) => callback(dirtyComponent));

        refreshEmbedChildRender(render as never, { activate: true });

        expect(render.activate).toHaveBeenCalled();
        expect(render.engine.resize).toHaveBeenCalled();
        expect(dirtyComponent.makeForceDirty).toHaveBeenCalledWith(true);
        expect(dirtyComponent.makeDirty).toHaveBeenCalledWith(true);
        expect(render.mainComponent.makeDirty).toHaveBeenCalledWith(true);
        expect(render.scene.makeDirty).toHaveBeenCalled();
        expect(render.scene.render).toHaveBeenCalled();
    });
});

class TestResizeObserver {
    observed: Element[] = [];
    disconnected = false;

    constructor(private readonly _callback: ResizeObserverCallback) {
        resizeObserverInstances.push(this);
    }

    observe(element: Element): void {
        this.observed.push(element);
    }

    unobserve(element: Element): void {
        this.observed = this.observed.filter((item) => item !== element);
    }

    disconnect(): void {
        this.disconnected = true;
    }

    emit(): void {
        this._callback([], this as unknown as ResizeObserver);
    }
}

function createRender(overrides: {
    getCanvasElement?: () => HTMLCanvasElement | undefined;
    unmount?: () => void;
    with?: (token: unknown) => unknown;
} = {}) {
    return {
        engine: {
            mount: vi.fn(),
            unmount: overrides.unmount ?? vi.fn(),
            resize: vi.fn(),
            getCanvasElement: overrides.getCanvasElement,
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
        with: overrides.with,
    };
}

function createEmbedMount(
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
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-1', type: 'doc' },
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
                ref: {
                    file: { kind: 'self' },
                    unit: { selector: 'child-1', type: 'doc' },
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
