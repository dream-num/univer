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

import type { IViewportInfo } from '../basics/vector2';
import { describe, expect, it, vi } from 'vitest';
import { BaseObject } from '../base-object';
import { RENDER_CLASS_TYPE } from '../basics/const';
import { Layer } from '../layer';

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
    let transformCallback: (() => void) | undefined;
    const sceneViewer = {
        classType: RENDER_CLASS_TYPE.SCENE_VIEWER,
        makeDirty: vi.fn(),
    };
    const viewport = {
        shouldIntoRender: vi.fn(() => true),
        render: vi.fn(),
    };
    const engine = {
        width: 160,
        height: 90,
        canvasColorService: undefined,
        onTransformChange$: {
            subscribeEvent: vi.fn((callback: () => void) => {
                transformCallback = callback;
                return { dispose: vi.fn() };
            }),
        },
    };
    const scene = {
        getParent: vi.fn(() => sceneViewer),
        getEngine: vi.fn(() => engine),
        getObject: vi.fn(() => null),
        setObjectBehavior: vi.fn(),
        getViewports: vi.fn(() => [viewport]),
        __viewport: viewport,
        __sceneViewer: sceneViewer,
        __resizeCache: () => transformCallback?.(),
    };

    return scene as any;
}

function createCtx() {
    const transform = document.createElement('canvas').getContext('2d')!.getTransform();
    return {
        save: vi.fn(),
        restore: vi.fn(),
        setTransform: vi.fn(),
        getTransform: vi.fn(() => transform),
        drawImage: vi.fn(),
    } as any;
}

describe('layer', () => {
    it('adds, orders, filters and removes regular objects', () => {
        const scene = createScene();
        const visible = new TestObject('visible', 2);
        const hidden = new TestObject('hidden', 1);
        const eventless = new TestObject('eventless', 3);
        hidden.hide();
        eventless.evented = false;

        const layer = new Layer(scene, [visible, hidden, eventless], 4);

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
        const child = new TestObject('child', 1);
        const duplicateChild = new TestObject('duplicate-child', 2);
        scene.getObject = vi.fn((key: string) => key === 'duplicate-child' ? duplicateChild : null);
        const group = new TestGroup('group', [child, duplicateChild]);
        const layer = new Layer(scene, [], 1);

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
        expect(scene.__viewport.render).toHaveBeenCalledWith(ctx, [child, group], true);
        expect(layer.isDirty()).toBe(false);

        child.onTransformChange$.emitEvent({} as any);
        expect(layer.isDirty()).toBe(true);

        layer.clear();
        expect(layer.getObjects()).toEqual([]);
        layer.dispose();
    });

    it('uses cache canvas rendering, resizing and disposal paths', () => {
        const scene = createScene();
        const object = new TestObject('cached', 1);
        const layer = new Layer(scene, [object], 1, true);
        const ctx = createCtx();

        expect(layer.isAllowCache()).toBe(true);
        layer.render(ctx);
        expect(ctx.drawImage).not.toHaveBeenCalled();

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
