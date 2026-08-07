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
import { Transformer } from '../scene.transformer';
import { Rect } from '../shape/rect';
import { setupRenderTestEnv } from './render-test-utils';

describe('Transformer', () => {
    const env = setupRenderTestEnv();

    afterEach(() => {
        env.restore();
    });

    it('releases hover subscriptions with its object subscription', () => {
        const engine = new Engine('transformer-engine', { elementWidth: 100, elementHeight: 100, dpr: 1 });
        const scene = new Scene('transformer-scene', engine);
        const rect = new Rect('transformer-rect', { width: 10, height: 10 });
        const transformer = new Transformer(scene, {
            hoverEnabled: true,
            hoverEnterFunc: vi.fn(),
            hoverLeaveFunc: vi.fn(),
        });

        transformer.attachTo(rect);

        expect((rect.onPointerEnter$ as any).observers).toHaveLength(1);
        expect((rect.onPointerLeave$ as any).observers).toHaveLength(1);

        transformer.dispose();

        expect((rect.onPointerEnter$ as any).observers).toHaveLength(0);
        expect((rect.onPointerLeave$ as any).observers).toHaveLength(0);

        rect.dispose();
        scene.dispose();
        engine.dispose();
    });

    it('renders controls on the configured layer without moving the selected object', () => {
        const engine = new Engine('transformer-layer-engine', { elementWidth: 100, elementHeight: 100, dpr: 1 });
        const scene = new Scene('transformer-layer-scene', engine);
        const rect = new Rect('transformer-layer-rect', { width: 10, height: 10 });
        scene.addObject(rect, 2);
        const transformer = new Transformer(scene, {
            borderEnabled: true,
            controlLayerIndex: 4,
        });
        let controlLayerIndex: number | undefined;
        const controlSubscription = transformer.createControl$.subscribe((control) => {
            controlLayerIndex = control.getLayerIndex();
        });

        transformer.setSelectedControl(rect);

        expect(rect.getLayerIndex()).toBe(2);
        expect(controlLayerIndex).toBe(4);

        controlSubscription.unsubscribe();
        transformer.dispose();
        scene.dispose();
        engine.dispose();
    });
});
