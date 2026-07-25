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

import { afterEach, describe, expect, it } from 'vitest';
import { Engine } from '../engine';
import { Scene } from '../scene';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

describe('Viewport', () => {
    const env = setupRenderTestEnv();

    afterEach(() => {
        env.restore();
    });

    it('releases its engine transform subscription on disposal', () => {
        const engine = new Engine('viewport-engine', { elementWidth: 100, elementHeight: 100, dpr: 1 });
        const scene = new Scene('viewport-scene', engine);
        const initialObserverCount = (engine.onTransformChange$ as any).observers.length;
        const viewport = new Viewport('viewport', scene, { width: 100, height: 100 });

        expect((engine.onTransformChange$ as any).observers).toHaveLength(initialObserverCount + 1);

        viewport.dispose();

        expect((engine.onTransformChange$ as any).observers).toHaveLength(initialObserverCount);

        scene.dispose();
        engine.dispose();
    });
});
