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
import { Engine } from '../engine';
import { Scene } from '../scene';
import { ScrollBar } from '../shape/scroll-bar';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

describe('Viewport', () => {
    let env: ReturnType<typeof setupRenderTestEnv>;

    beforeEach(() => {
        env = setupRenderTestEnv();
    });

    afterEach(() => {
        env.restore();
    });

    it('keeps a centered non-overflowing axis fixed while the other axis scrolls', () => {
        const engine = new Engine('centered-viewport-engine', { elementWidth: 320, elementHeight: 180, dpr: 1 });
        const scene = new Scene('centered-viewport-scene', engine);
        scene.transformByState({ width: 300, height: 360 });
        const viewport = new Viewport('centered-viewport', scene, { width: 300, height: 180 });
        new ScrollBar(viewport);
        try {
            viewport.setPadding({ startX: -200, startY: -20, endX: 0, endY: 0 });
            viewport.scrollToViewportPos({ viewportScrollX: 10000, viewportScrollY: 10000 });
            expect(viewport.viewportScrollX).toBe(-200);
            expect(viewport.viewportScrollY).toBeGreaterThan(-20);
        } finally {
            scene.dispose();
            engine.dispose();
        }
    });

    it('stops invalidating a disposed viewport when the engine changes', () => {
        const engine = new Engine('viewport-engine', { elementWidth: 100, elementHeight: 100, dpr: 1 });
        const scene = new Scene('viewport-scene', engine);
        const viewport = new Viewport('viewport', scene, { width: 100, height: 100 });
        try {
            viewport.markForceDirty(false);
            engine.resizeBySize(120, 120);
            expect(viewport.isForceDirty).toBe(true);
            viewport.dispose();
            viewport.markForceDirty(false);
            engine.resizeBySize(140, 140);
            expect(viewport.isForceDirty).toBe(false);
        } finally {
            scene.dispose();
            engine.dispose();
        }
    });
});
