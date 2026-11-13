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

import { Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IViewportInfo } from '../basics/vector2';
import { BaseObject } from '../base-object';
import { RENDER_CLASS_TYPE } from '../basics/const';
import { Engine } from '../engine';
import { Layer } from '../layer';
import { MAIN_VIEW_PORT_KEY, Scene } from '../scene';
import { SceneViewer } from '../scene-viewer';
import { DumbCanvasColorService, ICanvasColorService } from '../services/canvas-color.service';
import { Rect } from '../shape/rect';
import { Viewport } from '../viewport';

let injector: Injector;

class TestObject extends BaseObject {
    constructor(id: string, zIndex = 1) {
        super(id);
        this.zIndex = zIndex;
    }

    override render(_ctx: any, _bounds?: IViewportInfo) {
        return this;
    }
}

class TestGroup extends TestObject {
    constructor(id: string, private readonly _children: BaseObject[]) {
        super(id, 100);
    }

    override get classType() {
        return RENDER_CLASS_TYPE.GROUP;
    }

    override getObjects() {
        return this._children;
    }
}

function createScene() {
    injector.add([Engine, {
        useFactory: function createTestInstance() {
            return injector.createInstance(Engine, 'layer-engine', { elementWidth: 160, elementHeight: 90, dpr: 1 });
        },
    }]);
    const engine = injector.get(Engine);
    const rootScene = injector.createInstance(Scene, 'root-layer-scene', engine);
    const viewer = injector.createInstance(SceneViewer, 'layer-viewer', { width: 320, height: 180 });
    rootScene.addObject(viewer);
    const scene = injector.createInstance(Scene, 'layer-scene', viewer);
    scene.transformByState({ width: 320, height: 180, scaleX: 1, scaleY: 1 });
    const viewport = injector.createInstance(Viewport, 'viewport', scene, {
        left: 0,
        top: 0,
        width: 160,
        height: 90,
        active: true,
    });
    vi.spyOn(scene, 'setObjectBehavior');
    vi.spyOn(viewer, 'makeDirty');
    vi.spyOn(viewport, 'render');
    return Object.assign(scene, {
        __viewport: viewport,
        __sceneViewer: viewer,
        __resizeCache: () => {
            engine.resizeBySize(161, 91);
            engine.resizeBySize(160, 90);
        },
    });
}

function createCtx() {
    const ctx = injector.get(Engine).getCanvas().getContext();
    for (const method of ['save', 'restore', 'beginPath', 'rect', 'clip', 'clearRect', 'setTransform', 'getTransform', 'drawImage'] as const) {
        vi.spyOn(ctx, method);
    }
    return ctx;
}

describe('layer', () => {
    beforeEach(() => {
        injector = new Injector([[ICanvasColorService, { useClass: DumbCanvasColorService }]]);
    });

    afterEach(() => injector.dispose());

    it('paints a cache enabled after engine sizing and invalidates it for edits and resize', () => {
        const injector = new Injector([
            [ICanvasColorService, { useClass: DumbCanvasColorService }],
            [Engine, {
                useFactory: (container: Injector) => container.createInstance(Engine, 'cache-ready', { elementWidth: 160, elementHeight: 90, dpr: 1 }),
                deps: [Injector],
            }],
            [Scene, {
                useFactory: (container: Injector) => container.createInstance(Scene, 'cache-ready', container.get(Engine)),
                deps: [Injector],
            }],
            [Layer, {
                useFactory: (container: Injector) => container.createInstance(Layer, container.get(Scene), [], 1),
                deps: [Injector],
            }],
            [Rect, {
                useFactory: (container: Injector) => container.createInstance(Rect, 'cache-ready', { width: 20, height: 10, fill: '#123456' }),
                deps: [Injector],
            }],
            [Viewport, {
                useFactory: (container: Injector) => container.createInstance(Viewport, MAIN_VIEW_PORT_KEY, container.get(Scene), { left: 0, top: 0, width: 160, height: 90, active: true }),
                deps: [Injector],
            }],
        ]);
        const engine = injector.get(Engine);
        const scene = injector.get(Scene);
        const layer = injector.get(Layer);
        const rect = injector.get(Rect);
        injector.get(Viewport);
        scene.transformByState({ width: 160, height: 90, scaleX: 1, scaleY: 1 });
        scene.addLayer(layer);
        scene.addObject(rect, 1);
        const context = engine.getCanvas().getContext();
        const blit = vi.spyOn(context, 'drawImage');
        const paint = vi.spyOn(rect, 'render');
        try {
            layer.enableCache();
            layer.render(context);
            expect(blit).toHaveBeenLastCalledWith(expect.any(HTMLCanvasElement), 0, 0, 160, 90);
            const initialPaints = paint.mock.calls.length;
            expect(initialPaints).toBeGreaterThan(0);
            layer.render(context);
            expect(paint).toHaveBeenCalledTimes(initialPaints);

            rect.setProps({ fill: '#654321' });
            layer.render(context);
            expect(paint.mock.calls.length).toBeGreaterThan(initialPaints);
            engine.resizeBySize(240, 120);
            layer.render(context);
            expect(blit).toHaveBeenLastCalledWith(expect.any(HTMLCanvasElement), 0, 0, 240, 120);
        } finally {
            paint.mockRestore();
            blit.mockRestore();
            injector.dispose();
        }
    });

    it('adds, orders, filters and removes regular objects', () => {
        const scene = createScene();
        const visible = injector.createChild([[TestObject, { useFactory: function createTestInstance() {
            return injector.createInstance(TestObject, 'visible', 2);
        } }]]).get(TestObject);
        const hidden = injector.createChild([[TestObject, { useFactory: function createTestInstance() {
            return injector.createInstance(TestObject, 'hidden', 1);
        } }]]).get(TestObject);
        const eventless = injector.createChild([[TestObject, { useFactory: function createTestInstance() {
            return injector.createInstance(TestObject, 'eventless', 3);
        } }]]).get(TestObject);
        hidden.hide();
        eventless.evented = false;

        const layer = injector.createChild([[Layer, { useFactory: function createTestInstance() {
            return injector.createInstance(Layer, scene, [visible, hidden, eventless], 4);
        } }]]).get(Layer);

        expect(layer.scene).toBe(scene);
        expect(layer.zIndex).toBe(4);
        expect(layer.getObjectsByOrder().map((object) => object.oKey)).toEqual(['visible', 'eventless']);
        expect(layer.getObjectsByOrderForPick().map((object) => object.oKey)).toEqual(['visible']);
        expect(scene.setObjectBehavior).toHaveBeenCalledTimes(3);
        expect(scene.__sceneViewer.makeDirty).toHaveBeenCalledWith(true);

        layer.removeObject(visible);
        expect(layer.getObjects().map((object) => object.oKey)).not.toContain('visible');
        layer.removeObject('hidden');
        expect(layer.getObjects().map((object) => object.oKey)).not.toContain('hidden');
        layer.removeObjects(['eventless']);
        expect(layer.getObjects()).toEqual([]);

        layer.dispose();
    });

    it('expands groups, renders through viewports and updates dirty state', async () => {
        const scene = createScene();
        const child = injector.createChild([[TestObject, { useFactory: function createTestInstance() {
            return injector.createInstance(TestObject, 'child', 1);
        } }]]).get(TestObject);
        const duplicateChild = injector.createChild([[TestObject, { useFactory: function createTestInstance() {
            return injector.createInstance(TestObject, 'duplicate-child', 2);
        } }]]).get(TestObject);
        scene.addObject(duplicateChild, 2);
        const group = injector.createChild([[TestGroup, { useFactory: function createTestInstance() {
            return injector.createInstance(TestGroup, 'group', [child, duplicateChild]);
        } }]]).get(TestGroup);
        const layer = injector.createChild([[Layer, { useFactory: function createTestInstance() {
            return injector.createInstance(Layer, scene, [], 1);
        } }]]).get(Layer);

        layer.addObject(group);
        expect(layer.getObjects().map((object) => object.oKey)).toEqual(['child', 'group']);
        expect(child.layer).toBe(layer);
        expect(group.layer).toBe(layer);

        layer.makeDirtyWithDebounce(true);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(layer.isDirty()).toBe(true);

        const ctx = createCtx();
        layer.render(ctx, true);
        expect(ctx.save).toHaveBeenCalled();
        expect(scene.__viewport.render).toHaveBeenCalledWith(ctx, [child, group], true, undefined);
        expect(layer.isDirty()).toBe(false);

        child.onTransformChange$.emitEvent({} as any);
        expect(layer.isDirty()).toBe(true);

        layer.clear();
        expect(layer.getObjects()).toEqual([]);
        layer.dispose();
    });

    it('clips scroll repaint and refreshes the stale layer cache before reuse', () => {
        const scene = createScene();
        const object = injector.createChild([[TestObject, { useFactory: function createTestInstance() {
            return injector.createInstance(TestObject, 'cached', 1);
        } }]]).get(TestObject);
        const layer = injector.createChild([[Layer, { useFactory: function createTestInstance() {
            return injector.createInstance(Layer, scene, [object], 1, true);
        } }]]).get(Layer);
        const ctx = createCtx();
        const viewportInfo = scene.__viewport.calcViewportInfo();
        const dirtyBounds = [{ left: 140, top: 0, right: 160, bottom: 90 }];

        scene.__resizeCache();
        layer.render(ctx, false, {
            dirtyBounds,
            preserveCache: true,
            viewportInfos: new Map([['viewport', viewportInfo]]),
        });
        expect(scene.__viewport.render).toHaveBeenLastCalledWith(expect.anything(), [object], false, viewportInfo);
        expect(ctx.rect).toHaveBeenCalledWith(140, 0, 20, 90);
        expect(ctx.drawImage).not.toHaveBeenCalled();

        vi.mocked(scene.__viewport.render).mockClear();
        layer.render(ctx);
        expect(scene.__viewport.render).toHaveBeenCalledWith(expect.anything(), [object], false, undefined);
        expect(ctx.drawImage).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 0, 0, 160, 90);

        layer.dispose();
    });

    it('uses cache canvas rendering, resizing and disposal paths', () => {
        const scene = createScene();
        const object = injector.createChild([[TestObject, { useFactory: function createTestInstance() {
            return injector.createInstance(TestObject, 'cached', 1);
        } }]]).get(TestObject);
        const layer = injector.createChild([[Layer, { useFactory: function createTestInstance() {
            return injector.createInstance(Layer, scene, [object], 1, true);
        } }]]).get(Layer);
        const ctx = createCtx();

        expect(layer.isAllowCache()).toBe(true);
        layer.render(ctx);
        expect(ctx.drawImage).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 0, 0, 160, 90);

        scene.__resizeCache();
        layer.render(ctx);
        expect(ctx.drawImage).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 0, 0, 160, 90);

        layer.disableCache();
        expect(layer.isAllowCache()).toBe(false);
        layer.enableCache();
        expect(layer.isAllowCache()).toBe(true);

        layer.dispose();
        expect(layer.getObjects()).toEqual([]);
    });
});
