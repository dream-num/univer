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
import { DeviceType, PointerInput } from '../basics/i-events';
import { Vector2 } from '../basics/vector2';
import { Engine } from '../engine';
import { Scene } from '../scene';
import { Transformer } from '../scene.transformer';
import { Rect } from '../shape/rect';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

function createPointerEvent(type: string, offsetX: number, offsetY: number) {
    const event = Object.assign(new PointerEvent(type, {
        bubbles: true,
        button: 0,
        clientX: offsetX,
        clientY: offsetY,
        pointerId: 1,
        pointerType: 'touch',
    }), {
        currentState: null,
        deviceType: DeviceType.Touch,
        inputIndex: PointerInput.LeftClick,
        previousState: null,
    });
    Object.defineProperties(event, {
        offsetX: { value: offsetX },
        offsetY: { value: offsetY },
    });
    return event;
}

describe('Transformer', () => {
    const env = setupRenderTestEnv();

    afterEach(() => {
        env.restore();
    });

    it.each([0.5, 1, 2])('keeps all eight crop hit targets usable at scale %s without enlarging their artwork', (scale) => {
        const engine = new Engine('crop-hit-engine', { elementWidth: 800, elementHeight: 800, dpr: 1 });
        const scene = new Scene('crop-hit-scene', engine);
        const viewport = new Viewport('crop-hit-viewport', scene, { left: 0, top: 0, width: 800, height: 800 });
        scene.scale(scale, scale);
        const crop = new Rect('crop-frame', { left: 100, top: 100, width: 400, height: 300, angle: 30 });
        crop.transformerConfig = { isCropper: true, anchorSize: 24, cropAnchorHitSize: 44 };
        const image = new Rect('underlying-image', crop.getState());
        scene.addObject(image, 1);
        scene.addObject(crop, 2);
        const transformer = new Transformer(scene);
        try {
            transformer.createControlForCopper(crop);
            transformer.setSelectedControl(image);
            const anchors = scene.getAllObjectsByOrderForPick().filter((object) =>
                object.getLayerIndex() === crop.getLayerIndex() && object.oKey.includes('TransformerResize'));
            expect(anchors).toHaveLength(8);
            for (const anchor of anchors) {
                expect(Math.max(anchor.width, anchor.height)).toBe(24);
                const halfWidth = Math.max(anchor.width, 44 / scale) / 2;
                const halfHeight = Math.max(anchor.height, 44 / scale) / 2;
                const hit = (x: number, y: number) => anchor.isHit(anchor.ancestorTransform.applyPoint(new Vector2(
                    anchor.width / 2 + x,
                    anchor.height / 2 + y
                )));
                expect(hit(halfWidth - 1 / scale, halfHeight - 1 / scale)).toBe(true);
                expect(hit(-halfWidth + 1 / scale, -halfHeight + 1 / scale)).toBe(true);
                expect(hit(halfWidth + 1 / scale, 0)).toBe(false);
                const point = anchor.ancestorTransform.applyPoint(new Vector2(anchor.width / 2, anchor.height / 2));
                expect(scene.pick(new Vector2(point.x * scale, point.y * scale))).toBe(anchor);
            }
        } finally {
            viewport.dispose();
            transformer.dispose();
            scene.dispose();
            engine.dispose();
        }
    });

    it('keeps desktop crop handles using their precise painted hit areas', () => {
        const engine = new Engine('desktop-crop-engine', { elementWidth: 800, elementHeight: 800, dpr: 1 });
        const scene = new Scene('desktop-crop-scene', engine);
        const crop = new Rect('desktop-crop-frame', { width: 400, height: 300 });
        crop.transformerConfig = { isCropper: true, anchorSize: 24 };
        scene.addObject(crop);
        const transformer = new Transformer(scene);
        try {
            transformer.createControlForCopper(crop);
            const anchors = scene.getAllObjectsByOrderForPick().filter((object) => object.oKey.includes('TransformerResize'));
            expect(anchors).toHaveLength(8);
            for (const anchor of anchors) {
                expect(anchor.isHit(anchor.ancestorTransform.applyPoint(new Vector2(anchor.width + 4, anchor.height / 2)))).toBe(false);
            }
        } finally {
            transformer.dispose();
            scene.dispose();
            engine.dispose();
        }
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

    it('restores a missing control when an already selected object is activated again', () => {
        const engine = new Engine('transformer-restore-engine', { elementWidth: 100, elementHeight: 100, dpr: 1 });
        const scene = new Scene('transformer-restore-scene', engine);
        const rect = new Rect('transformer-restore-rect', { width: 10, height: 10 });
        scene.addObject(rect);
        const transformer = new Transformer(scene);
        const createControl = vi.fn();
        const subscription = transformer.createControl$.subscribe(createControl);

        transformer.setSelectedControl(rect);
        transformer.clearControls();
        transformer.activeAnObject(rect);

        expect(transformer.getSelectedObjectMap().get(rect.oKey)).toBe(rect);
        expect(createControl).toHaveBeenCalledTimes(2);

        subscription.unsubscribe();
        transformer.dispose();
        scene.dispose();
        engine.dispose();
    });

    it('keeps read-only objects selectable without starting a move gesture', () => {
        const engine = new Engine('transformer-readonly-engine', { elementWidth: 100, elementHeight: 100, dpr: 1 });
        const scene = new Scene('transformer-readonly-scene', engine);
        const rect = new Rect('transformer-readonly-rect', { width: 10, height: 10 });
        rect.transformerConfig = {
            moveEnabled: false,
            resizeEnabled: false,
            rotateEnabled: false,
        };
        const transformer = new Transformer(scene);
        const changeStart = vi.fn();
        const subscription = transformer.changeStart$.subscribe(changeStart);

        transformer.attachTo(rect);
        rect.onPointerDown$.emitEvent({ offsetX: 5, offsetY: 5 } as never);

        expect(transformer.getSelectedObjectMap().get(rect.oKey)).toBe(rect);
        expect(changeStart).not.toHaveBeenCalled();

        subscription.unsubscribe();
        transformer.dispose();
        rect.dispose();
        scene.dispose();
        engine.dispose();
    });

    it('moves an object only on a gesture that starts after selection', () => {
        const engine = new Engine('transformer-selection-engine', { elementWidth: 100, elementHeight: 100, dpr: 1 });
        const scene = new Scene('transformer-selection-scene', engine);
        const rect = new Rect('transformer-selection-rect', { width: 10, height: 10 });
        scene.addObject(rect);
        const transformer = new Transformer(scene, { moveOnlyWhenSelected: true });
        const changeStart = vi.fn();
        const changeStartSubscription = transformer.changeStart$.subscribe(changeStart);
        const reattachSubscription = transformer.createControl$.subscribe(() => transformer.attachTo(rect));

        transformer.attachTo(rect);
        rect.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 5, 5));
        scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 25, 25));
        scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 25, 25));

        expect(transformer.getSelectedObjectMap().has(rect.oKey)).toBe(false);
        expect(changeStart).not.toHaveBeenCalled();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(0);

        rect.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 5, 5));
        scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 5, 5));

        expect(transformer.getSelectedObjectMap().get(rect.oKey)).toBe(rect);

        rect.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 5, 5));
        scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 25, 25));
        scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 25, 25));

        expect(changeStart).toHaveBeenCalledTimes(1);
        expect(rect.left).toBe(20);
        expect(rect.top).toBe(20);

        reattachSubscription.unsubscribe();
        changeStartSubscription.unsubscribe();
        transformer.dispose();
        scene.dispose();
        engine.dispose();
    });
});
