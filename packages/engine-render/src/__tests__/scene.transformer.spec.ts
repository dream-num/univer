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
import { Control } from '../shape/control';
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

    it.each([0.35, 1, 2])('keeps resize and rotation touch targets in screen pixels at scale %s', (scale) => {
        const engine = new Engine('touch-controls-engine', { elementWidth: 1600, elementHeight: 1600, dpr: 1 });
        const scene = new Scene('touch-controls-scene', engine);
        const viewport = new Viewport('touch-controls-viewport', scene, { left: 0, top: 0, width: 1600, height: 1600 });
        scene.scale(scale, scale);
        const rect = new Rect('touch-object', { left: 200, top: 200, width: 400, height: 300 });
        scene.addObject(rect);
        const transformer = new Transformer(scene, { rotateEnabled: true });
        try {
            transformer.setSelectedControl(rect);
            for (const key of ['ResizeRB', 'Rotate__']) {
                const anchor = scene.getAllObjectsByOrderForPick().find((object) => object.oKey.includes(key));
                if (!(anchor instanceof Control)) {
                    throw new TypeError(`Missing ${key} control`);
                }
                const artwork = anchor.getState();
                const center = anchor.ancestorTransform.applyPoint(new Vector2(anchor.width / 2, anchor.height / 2));
                const point = new Vector2(center.x * scale + 20, center.y * scale);
                expect(scene.pick(point, DeviceType.Touch)).toBe(anchor);
                expect(scene.pick(point, DeviceType.Mouse)).not.toBe(anchor);
                expect(anchor.getState()).toEqual(artwork);
            }
        } finally {
            transformer.dispose();
            viewport.dispose();
            scene.dispose();
            engine.dispose();
        }
    });

    it('chooses the nearest touch control and leaves mouse, hidden controls and overlays precise', () => {
        const engine = new Engine('adjust-hit-engine', { elementWidth: 800, elementHeight: 800, dpr: 1 });
        const scene = new Scene('adjust-hit-scene', engine);
        const viewport = new Viewport('adjust-hit-viewport', scene, { left: 0, top: 0, width: 800, height: 800 });
        const object = new Rect('object', { left: 0, top: 0, width: 400, height: 300 });
        const a = new Control('adjust-a', { left: 100, top: 100, width: 8, height: 8, angle: 45 });
        const b = new Control('adjust-b', { left: 120, top: 100, width: 8, height: 8 });
        scene.addObject(object, 1);
        scene.addObjects([a, b], 2);
        scene.attachControl();
        const down = vi.fn();
        const subscription = a.onPointerDown$.subscribeEvent(down);
        try {
            const point = new Vector2(112, 110);
            expect(scene.pick(point, DeviceType.Touch)).toBe(a);
            expect(scene.pick(point, DeviceType.Mouse)).toBe(object);
            engine.getCanvasElement().dispatchEvent(createPointerEvent('pointerdown', point.x, point.y));
            expect(down).toHaveBeenCalledTimes(1);
            engine.getCanvasElement().dispatchEvent(createPointerEvent('pointerup', point.x, point.y));
            a.hide();
            expect(scene.pick(point, DeviceType.Touch)).toBe(b);
            b.evented = false;
            expect(scene.pick(point, DeviceType.Touch)).toBe(object);
            b.evented = true;
            const overlay = new Rect('overlay', { left: 100, top: 100, width: 40, height: 40 });
            scene.addObject(overlay, 3);
            expect(scene.pick(point, DeviceType.Touch)).toBe(overlay);
        } finally {
            subscription.unsubscribe();
            viewport.dispose();
            scene.dispose();
            engine.dispose();
        }
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
                expect(scene.pick(new Vector2(point.x * scale, point.y * scale), DeviceType.Touch)).toBe(anchor);
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

    it.each(['takeover', 'pointercancel'])('finishes a move once on %s and releases the scene for viewport gestures', (reason) => {
        const engine = new Engine('gesture-engine', { elementWidth: 800, elementHeight: 800, dpr: 1 });
        const scene = new Scene('gesture-scene', engine, { width: 800, height: 800 });
        const viewport = new Viewport('gesture-viewport', scene, { left: 0, top: 0, width: 800, height: 800 });
        const rect = new Rect('gesture-object', { left: 100, top: 100, width: 100, height: 100 });
        scene.addObject(rect);
        const transformer = new Transformer(scene);
        const ended = vi.fn();
        const subscription = transformer.changeEnd$.subscribe(ended);
        try {
            transformer.attachTo(rect);
            transformer.setSelectedControl(rect);
            rect.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 120, 120));
            scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 160, 150));
            if (reason === 'takeover') {
                transformer.finishTransform();
            } else {
                scene.onPointerCancel$.emitEvent(createPointerEvent('pointercancel', 0, 0));
            }
            expect(ended).toHaveBeenCalledTimes(1);
            expect(ended.mock.calls[0][0]).toMatchObject({ offsetX: 160, offsetY: 150 });
            expect(rect.left).toBe(140);
            expect(rect.top).toBe(130);
            scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 300, 300));
            scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 300, 300));
            transformer.finishTransform();
            expect(ended).toHaveBeenCalledTimes(1);
            expect(rect.left).toBe(140);
            expect(scene.pick(new Vector2(170, 160))).toBe(rect);
        } finally {
            subscription.unsubscribe();
            transformer.dispose();
            viewport.dispose();
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

    it.each(['ResizeRB', 'Rotate__'])('releases %s controls when a pinch takes ownership', (controlKey) => {
        const engine = new Engine('control-gesture-engine', { elementWidth: 800, elementHeight: 800, dpr: 1 });
        const scene = new Scene('control-gesture-scene', engine, { width: 800, height: 800 });
        const viewport = new Viewport('control-gesture-viewport', scene, { left: 0, top: 0, width: 800, height: 800 });
        const rect = new Rect('control-gesture-object', { left: 100, top: 100, width: 100, height: 100 });
        scene.addObject(rect);
        const transformer = new Transformer(scene, { rotateEnabled: true });
        const ended = vi.fn();
        const subscription = transformer.changeEnd$.subscribe(ended);
        try {
            transformer.setSelectedControl(rect);
            const anchor = scene.getAllObjectsByOrderForPick().find((object) => object.oKey.includes(controlKey));
            if (!anchor) {
                throw new Error(`Missing ${controlKey} control`);
            }
            const initial = rect.getState();
            const point = anchor.ancestorTransform.applyPoint(new Vector2(anchor.width / 2, anchor.height / 2));
            anchor.onPointerDown$.emitEvent(createPointerEvent('pointerdown', point.x, point.y));
            scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', point.x + 60, point.y + 40));
            transformer.finishTransform();
            expect(ended).toHaveBeenCalledTimes(1);
            const transformed = rect.getState();
            expect(transformed).not.toEqual(initial);
            scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 500, 500));
            scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 500, 500));
            expect(ended).toHaveBeenCalledTimes(1);
            expect(rect.getState()).toEqual(transformed);
        } finally {
            subscription.unsubscribe();
            transformer.dispose();
            viewport.dispose();
            scene.dispose();
            engine.dispose();
        }
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

    it.each(['move', 'resize'])('only transforms eligible objects during mixed selection %s and preserves selection events', (gesture) => {
        const engine = new Engine('locked-selection-engine', { elementWidth: 800, elementHeight: 800, dpr: 1 });
        const scene = new Scene('locked-selection-scene', engine, { width: 800, height: 800 });
        const viewport = new Viewport('locked-selection-viewport', scene, { left: 0, top: 0, width: 800, height: 800 });
        const locked = new Rect('locked', { left: 0, top: 0, width: 400, height: 300 });
        locked.transformerConfig = { moveEnabled: false, resizeEnabled: false };
        const editable = new Rect('editable', { left: 100, top: 100, width: 100, height: 100 });
        editable.transformerConfig = gesture === 'move' ? { resizeEnabled: false } : { moveEnabled: false };
        scene.addObject(locked);
        scene.addObject(editable);
        const transformer = new Transformer(scene);
        const started = vi.fn();
        const subscription = transformer.changeStart$.subscribe(started);
        const ended = vi.fn();
        const endSubscription = transformer.changeEnd$.subscribe(ended);
        try {
            transformer.attachTo(editable);
            transformer.setSelectedControl(locked);
            transformer.setSelectedControl(editable);
            const previousLocked = locked.getState();
            const previousEditable = { left: editable.left, width: editable.width, height: editable.height };
            if (gesture === 'move') {
                editable.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 120, 120));
            } else {
                const anchor = scene.getAllObjectsByOrderForPick().find((object) => object.oKey.includes('ResizeRB'))!;
                const point = anchor.ancestorTransform.applyPoint(new Vector2(anchor.width / 2, anchor.height / 2));
                anchor.onPointerDown$.emitEvent(createPointerEvent('pointerdown', point.x, point.y));
            }
            scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 300, 300));
            scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 300, 300));
            expect(locked.getState()).toEqual(previousLocked);
            if (gesture === 'move') {
                expect(editable.left).toBeGreaterThan(previousEditable.left);
                // The locked object touches the boundary; it must not constrain the editable one.
                editable.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 300, 300));
                scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 40, 40));
                scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 40, 40));
                expect(editable.left).toBeLessThan(previousEditable.left);
            } else {
                expect(editable.width).toBeGreaterThan(previousEditable.width);
                expect(editable.height).toBeGreaterThan(previousEditable.height);
            }
            expect(started.mock.calls[0][0].objects.size).toBe(2);
            expect(ended.mock.calls[0][0].objects.size).toBe(2);
            expect(transformer.getSelectedObjectMap().size).toBe(2);
            expect(locked.getState()).toEqual(previousLocked);
        } finally {
            subscription.unsubscribe();
            endSubscription.unsubscribe();
            transformer.dispose();
            viewport.dispose();
            scene.dispose();
            engine.dispose();
        }
    });

    it.each(['move', 'resize'])('does not start a %s gesture when every selected object is locked', (gesture) => {
        const engine = new Engine('all-locked-engine', { elementWidth: 800, elementHeight: 800, dpr: 1 });
        const scene = new Scene('all-locked-scene', engine, { width: 800, height: 800 });
        const rect = new Rect('all-locked-rect', { left: 100, top: 100, width: 100, height: 100 });
        scene.addObject(rect);
        const transformer = new Transformer(scene);
        const started = vi.fn();
        const subscription = transformer.changeStart$.subscribe(started);
        try {
            transformer.attachTo(rect);
            transformer.setSelectedControl(rect);
            const anchor = scene.getAllObjectsByOrderForPick().find((object) => object.oKey.includes('ResizeRB'))!;
            rect.transformerConfig = { moveEnabled: false, resizeEnabled: false };
            const previous = rect.getState();
            if (gesture === 'move') {
                rect.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 120, 120));
            } else {
                anchor.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 200, 200));
            }
            scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 300, 300));
            scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 300, 300));
            expect(rect.getState()).toEqual(previous);
            expect(started).not.toHaveBeenCalled();
            expect(transformer.getSelectedObjectMap().get(rect.oKey)).toBe(rect);
        } finally {
            subscription.unsubscribe();
            transformer.dispose();
            scene.dispose();
            engine.dispose();
        }
    });

    it.each(['move', 'resize'])('preserves the independent crop %s path outside the ordinary selection', (gesture) => {
        const engine = new Engine('crop-lock-engine', { elementWidth: 800, elementHeight: 800, dpr: 1 });
        const scene = new Scene('crop-lock-scene', engine, { width: 800, height: 800 });
        const viewport = new Viewport('crop-lock-viewport', scene, { width: 800, height: 800 });
        const crop = new Rect('crop-lock-frame', { left: 100, top: 100, width: 100, height: 100 });
        crop.transformerConfig = { isCropper: true, moveEnabled: false };
        scene.addObject(crop);
        const transformer = new Transformer(scene);
        try {
            transformer.attachTo(crop);
            transformer.createControlForCopper(crop);
            if (gesture === 'move') {
                crop.onPointerDown$.emitEvent(createPointerEvent('pointerdown', 120, 120));
                scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', 160, 160));
                scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', 160, 160));
                expect(crop.left).toBe(140);
            } else {
                const anchor = scene.getAllObjectsByOrderForPick().find((object) => object.oKey.includes('ResizeRB'))!;
                const point = anchor.ancestorTransform.applyPoint(new Vector2(anchor.width / 2, anchor.height / 2));
                anchor.onPointerDown$.emitEvent(createPointerEvent('pointerdown', point.x, point.y));
                scene.onPointerMove$.emitEvent(createPointerEvent('pointermove', point.x + 40, point.y + 40));
                scene.onPointerUp$.emitEvent(createPointerEvent('pointerup', point.x + 40, point.y + 40));
                expect(crop.width).toBeGreaterThan(100);
            }
        } finally {
            transformer.dispose();
            viewport.dispose();
            scene.dispose();
            engine.dispose();
        }
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
