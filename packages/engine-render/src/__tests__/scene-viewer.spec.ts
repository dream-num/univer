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

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Vector2 } from '../basics/vector2';
import { Canvas } from '../canvas';
import { Engine } from '../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../scene';
import { SceneViewer } from '../scene-viewer';
import { Rect } from '../shape/rect';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

function createSubScene(engine: Engine, key: string) {
    const scene = new Scene(key, engine);
    scene.transformByState({
        width: 600,
        height: 320,
        scaleX: 1,
        scaleY: 1,
    });
    new Viewport(MAIN_VIEW_PORT_KEY, scene, {
        left: 0,
        top: 0,
        width: 420,
        height: 220,
        active: true,
        allowCache: true,
        bufferEdgeX: 8,
        bufferEdgeY: 6,
    });
    scene.addObject(new Rect(`${key}-rect`, {
        left: 12,
        top: 16,
        width: 120,
        height: 60,
        fill: '#66aa88',
        stroke: '#222222',
    }), 1);
    return scene;
}

describe('scene viewer', () => {
    let restoreEnv: () => void;
    let container: HTMLDivElement;
    let engine: Engine;
    let mainCanvas: Canvas;

    beforeEach(() => {
        restoreEnv = setupRenderTestEnv().restore;
        container = document.createElement('div');
        container.style.width = '720px';
        container.style.height = '420px';
        document.body.appendChild(container);
        engine = new Engine('scene-viewer-engine', { elementWidth: 700, elementHeight: 400, dpr: 1 });
        engine.mount(container, false);
        mainCanvas = new Canvas({ width: 720, height: 420, pixelRatio: 1 });
    });

    afterEach(() => {
        mainCanvas.dispose();
        engine.dispose();
        restoreEnv();
        container.remove();
        document.body.innerHTML = '';
    });

    it('manages sub-scenes, render bounds and pick lifecycle', () => {
        const sceneA = createSubScene(engine, 'sub-a');
        const sceneB = createSubScene(engine, 'sub-b');

        const viewer = new SceneViewer('viewer', {
            left: 20,
            top: 10,
            width: 420,
            height: 220,
        });
        viewer.addSubScene(sceneA);
        viewer.addSubScene(sceneB);
        expect(viewer.getSubScenes().size).toBe(2);

        viewer.activeSubScene('sub-a');
        expect(viewer.getActiveSubScene()?.sceneKey).toBe('sub-a');
        expect(viewer.getSubScene('sub-b')?.sceneKey).toBe('sub-b');

        viewer.enableSelectedClipElement();
        expect(viewer.allowSelectedClipElement()).toBe(true);
        viewer.disableSelectedClipElement();
        expect(viewer.allowSelectedClipElement()).toBe(false);

        const ctx = mainCanvas.getContext();
        const outsideBounds = {
            viewBound: { left: 1000, top: 1000, right: 1200, bottom: 1200 },
            cacheBound: { left: 1000, top: 1000, right: 1200, bottom: 1200 },
        } as any;
        const insideBounds = {
            viewBound: { left: 0, top: 0, right: 500, bottom: 300 },
            cacheBound: { left: 0, top: 0, right: 500, bottom: 300 },
        } as any;

        expect(viewer.render(ctx, outsideBounds)).toBe(viewer);
        expect(viewer.render(ctx, insideBounds)).toBe(viewer);

        const picked = viewer.pick(Vector2.FromArray([60, 50]));
        expect(picked).toBeTruthy();

        viewer.removeSubScene('sub-a');
        expect(viewer.getSubScenes().size).toBe(1);
        expect(viewer.getActiveSubScene()?.sceneKey).toBe('sub-b');

        viewer.activeSubScene(null);
        viewer.dispose();
    });
});
