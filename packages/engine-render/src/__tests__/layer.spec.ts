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
import type { Layer } from '../layer';
import { Engine } from '../engine';
import { Group } from '../group';
import { Scene } from '../scene';
import { DumbCanvasColorService, ICanvasColorService } from '../services/canvas-color.service';
import { Rect } from '../shape/rect';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

function retainedRegistrations(layer: Layer): number {
    // Closed subscriptions are absent from Subject.observers but can still be retained by the Layer.
    const collection = Reflect.get(layer, '_collection') as { _disposables: Set<unknown> };
    return collection._disposables.size;
}

describe('layer', () => {
    let env: ReturnType<typeof setupRenderTestEnv>;
    const injectors: Injector[] = [];

    function createFixture() {
        const injector = new Injector([[ICanvasColorService, { useClass: DumbCanvasColorService }]]);
        injectors.push(injector);
        const createEngine = () => injector.createInstance(Engine, 'layer-test', { elementWidth: 160, elementHeight: 90, dpr: 1 });
        injector.add([Engine, { useFactory: createEngine }]);
        const engine = injector.get(Engine);
        const scene = new Scene('scene', engine, { width: 160, height: 90 });
        const viewport = new Viewport('viewport', scene, { left: 0, top: 0, width: 160, height: 90 });
        const layer = scene.getLayer(1);
        const ctx = engine.getCanvas().getContext();
        return { engine, scene, viewport, layer, ctx };
    }

    beforeEach(() => {
        env = setupRenderTestEnv();
        vi.useFakeTimers();
    });

    afterEach(() => {
        injectors.splice(0).forEach((injector) => injector.dispose());
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        env.restore();
        vi.restoreAllMocks();
    });

    it('orders visible objects and removes objects by identity or key', () => {
        const { layer } = createFixture();
        const visible = new Rect('visible');
        const hidden = new Rect('hidden');
        const eventless = new Rect('eventless');
        visible.zIndex = 2;
        hidden.zIndex = 1;
        eventless.zIndex = 3;
        hidden.hide();
        eventless.evented = false;
        layer.addObjects([visible, hidden, eventless]);

        expect(layer.getObjectsByOrder().map((object) => object.oKey)).toEqual(['visible', 'eventless']);
        expect(layer.getObjectsByOrderForPick().map((object) => object.oKey)).toEqual(['visible']);

        layer.removeObject(visible);
        layer.removeObject('hidden');
        layer.removeObjects(['eventless']);
        expect(layer.getObjects()).toEqual([]);
        for (const object of [visible, hidden, eventless]) {
            expect(object.layer).toBeNull();
            expect(object.onTransformChange$.observed).toBe(false);
            object.dispose();
        }
    });

    it('moves grouped children into their rendering layer and repaints their transforms', () => {
        const { scene, layer, ctx, viewport } = createFixture();
        const child = new Rect('child', { width: 10, height: 10 });
        const existingChild = new Rect('existing-child');
        scene.addObject(existingChild, 2);
        const group = new Group('group', child, existingChild);
        layer.addObject(group);
        expect(layer.getObjects()).toEqual([child, existingChild, group]);
        expect(child.layer).toBe(layer);
        expect(existingChild.layer).toBe(layer);
        expect(scene.getLayer(2).getObjects()).toEqual([]);

        const render = vi.spyOn(viewport, 'render');
        layer.render(ctx, true);
        expect(render).toHaveBeenCalledWith(ctx, [group], true, undefined);
        expect(layer.isDirty()).toBe(false);
        child.translate(10, 20);
        expect(layer.isDirty()).toBe(true);
        layer.makeDirty(false);
        existingChild.translate(20, 30);
        expect(layer.isDirty()).toBe(true);

        layer.clear();
        expect(layer.getObjects()).toEqual([]);
        expect(child.onTransformChange$.observed).toBe(false);
        expect(group.onTransformChange$.observed).toBe(false);
        group.dispose();
    });

    it('clips a scroll repaint and refreshes the stale cache before reusing it', () => {
        const { engine, layer, ctx, viewport } = createFixture();
        layer.addObject(new Rect('cached', { width: 20, height: 20 }));
        layer.enableCache();
        engine.resizeBySize(200, 100);
        const render = vi.spyOn(viewport, 'render');
        const rect = vi.spyOn(ctx, 'rect');
        const drawImage = vi.spyOn(ctx, 'drawImage');
        const viewportInfo = viewport.calcViewportInfo();
        layer.render(ctx, false, {
            dirtyBounds: [{ left: 140, top: 0, right: 160, bottom: 90 }],
            preserveCache: true,
            viewportInfos: new Map([['viewport', viewportInfo]]),
        });
        expect(render).toHaveBeenCalledWith(ctx, layer.getObjects(), false, viewportInfo);
        expect(rect).toHaveBeenCalledWith(140, 0, 20, 90);
        expect(drawImage).not.toHaveBeenCalled();

        render.mockClear();
        layer.render(ctx);
        expect(render).toHaveBeenCalledWith(expect.anything(), layer.getObjects(), false, undefined);
        expect(drawImage).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 0, 0, 200, 100);
    });

    it('supports disabling and re-enabling the resized cache', () => {
        const { engine, layer, ctx } = createFixture();
        layer.addObject(new Rect('cached', { width: 20, height: 20 }));
        layer.enableCache();
        engine.resizeBySize(200, 100);
        const drawImage = vi.spyOn(ctx, 'drawImage');
        layer.render(ctx);
        expect(drawImage).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 0, 0, 200, 100);

        layer.disableCache();
        drawImage.mockClear();
        layer.render(ctx);
        expect(drawImage).not.toHaveBeenCalled();
        layer.enableCache();
        engine.resizeBySize(220, 110);
        layer.render(ctx);
        expect(drawImage).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 0, 0, 220, 110);
    });

    it('releases completed subscriptions after repeatedly destroying selection objects', () => {
        const { layer } = createFixture();
        const initialRegistrations = retainedRegistrations(layer);
        for (let i = 0; i < 100; i++) {
            const object = new Rect(`selection-${i}`);
            layer.addObject(object);
            object.dispose();
        }
        expect(layer.getObjects()).toEqual([]);
        expect(retainedRegistrations(layer)).toBe(initialRegistrations);
    });

    it.each(['identity', 'key'] as const)('stops observing a removed object by %s and supports reattachment', (method) => {
        const { layer } = createFixture();
        const object = new Rect('object');
        const initialRegistrations = retainedRegistrations(layer);
        layer.addObject(object);
        layer.removeObject(method === 'key' ? object.oKey : object);
        vi.runOnlyPendingTimers();
        layer.makeDirty(false);
        object.translate(10, 20);
        vi.runOnlyPendingTimers();
        expect(layer.isDirty()).toBe(false);
        expect(object.layer).toBeNull();
        expect(retainedRegistrations(layer)).toBe(initialRegistrations);

        layer.addObject(object);
        layer.makeDirty(false);
        object.translate(20, 30);
        expect(layer.isDirty()).toBe(true);
        object.dispose();
        expect(retainedRegistrations(layer)).toBe(initialRegistrations);
    });

    it('releases bulk removals and cleared objects without disposing reusable objects', () => {
        const { layer } = createFixture();
        const objects = [new Rect('first'), new Rect('second'), new Rect('third')];
        const initialRegistrations = retainedRegistrations(layer);
        layer.addObjects(objects);
        layer.removeObjects(objects.slice(0, 2));
        layer.clear();
        expect(retainedRegistrations(layer)).toBe(initialRegistrations);
        for (const object of objects) {
            expect(object.onTransformChange$.observed).toBe(false);
            expect(object.layer).toBeNull();
        }
        layer.addObjects(objects);
        layer.makeDirty(false);
        objects[0].translate(10, 20);
        expect(layer.isDirty()).toBe(true);
    });

    it('keeps a single registration when adding again or moving between layers', () => {
        const { scene, layer } = createFixture();
        const other = scene.getLayer(2);
        const object = new Rect('moving');
        const initialRegistrations = retainedRegistrations(layer);
        layer.addObject(object);
        const attachedRegistrations = retainedRegistrations(layer);
        layer.addObject(object);
        expect(layer.getObjects()).toEqual([object]);
        expect(retainedRegistrations(layer)).toBe(attachedRegistrations);

        other.addObject(object);
        expect(layer.getObjects()).toEqual([]);
        expect(retainedRegistrations(layer)).toBe(initialRegistrations);
        vi.runOnlyPendingTimers();
        layer.makeDirty(false);
        other.makeDirty(false);
        object.translate(10, 20);
        vi.runOnlyPendingTimers();
        expect(layer.isDirty()).toBe(false);
        expect(other.isDirty()).toBe(true);
        expect(object.layer).toBe(other);
    });

    it('disposes remaining objects and releases their registrations with the layer', () => {
        const { layer } = createFixture();
        const object = new Rect('remaining');
        const onDispose = vi.fn();
        object.onDispose$.subscribeEvent(onDispose);
        layer.addObject(object);
        layer.dispose();
        layer.dispose();
        expect(onDispose).toHaveBeenCalledTimes(1);
        expect(layer.getObjects()).toEqual([]);
        expect(retainedRegistrations(layer)).toBe(0);
        expect(object.onTransformChange$.observed).toBe(false);
    });
});
