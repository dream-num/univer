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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Engine } from '../engine';
import { Scene } from '../scene';
import { Rect } from '../shape/rect';
import { ScrollBar } from '../shape/scroll-bar';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

describe('Scene', () => {
    const env = setupRenderTestEnv();
    afterEach(() => env.restore());

    it('preserves backgrounds painted by beforeRender subscribers after clearing the canvas', () => {
        const engine = new Engine('background', { elementWidth: 300, elementHeight: 200, dpr: 1 });
        const scene = new Scene('background', engine);
        const viewport = new Viewport('main', scene, { left: 0, top: 0, width: 300, height: 200 });
        scene.addObject(new Rect('object', { left: 100, top: 100, width: 20, height: 20 }));
        const context = engine.getCanvas().getContext();
        const clear = vi.spyOn(context, 'clearRect');
        const fill = vi.spyOn(context, 'fillRect');
        const subscription = scene.beforeRender$.subscribe((canvas) => {
            if (canvas) {
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, 300, 200);
            }
        });
        try {
            scene.render();
            expect(clear).toHaveBeenCalledWith(0, 0, 300, 200);
            expect(fill).toHaveBeenCalledWith(0, 0, 300, 200);
            expect(clear.mock.invocationCallOrder[0]).toBeLessThan(fill.mock.invocationCallOrder[0]);
        } finally {
            subscription.unsubscribe();
            clear.mockRestore();
            fill.mockRestore();
            viewport.dispose();
            scene.dispose();
            engine.dispose();
        }
    });

    it('clears the whole canvas when a prepare-render layout change invalidates a preserved scroll frame', () => {
        const engine = new Engine('scene', { elementWidth: 500, elementHeight: 400, dpr: 1 });
        const scene = new Scene('scene', engine, { width: 1000, height: 1000 });
        const viewport = new Viewport('main', scene, { left: 0, top: 0, width: 500, height: 400, allowCache: true });
        const scrollbar = new ScrollBar(viewport);
        const rect = new Rect('marker', { left: 100, top: 100, width: 30, height: 30 });
        scene.addObject(rect);
        scene.render();
        let relayout = false;
        const subscription = scene.prepareRender$.subscribe(() => {
            if (relayout) {
                rect.translate(150, 100);
                scene.makeDirty();
            }
        });
        const clear = vi.spyOn(engine.getCanvas().getContext(), 'clearRect');
        try {
            viewport.scrollToViewportPos({ viewportScrollY: 20 });
            scene.makeDirtyForScrolling();
            relayout = true;
            scene.render();
            expect(clear).toHaveBeenCalledWith(0, 0, 500, 400);
        } finally {
            clear.mockRestore();
            subscription.unsubscribe();
            scrollbar.dispose();
            scene.dispose();
            engine.dispose();
        }
    });
});
