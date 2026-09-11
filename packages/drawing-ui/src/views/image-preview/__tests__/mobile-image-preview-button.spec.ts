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

import { Injector, ThemeService } from '@univerjs/core';
import { DeviceType, Image, PointerInput, Scene, SceneViewer, Vector2, Viewport } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobileImagePreviewButton } from '../mobile-image-preview-button';

function pointer(type: string, x = 280, y = 30) {
    const event = Object.assign(new MouseEvent(type, { clientX: x, clientY: y }), {
        deviceType: DeviceType.Touch,
        inputIndex: PointerInput.LeftClick,
        currentState: null,
        previousState: null,
    });
    Object.defineProperties(event, { offsetX: { value: x }, offsetY: { value: y } });
    return event;
}

const cleanups: Array<() => void> = [];

function setup() {
    const injector = new Injector([[ThemeService]]);
    const host = new SceneViewer('host');
    const scene = new Scene('preview', host);
    const viewport = new Viewport('main', scene, { left: 0, top: 0, width: 400, height: 600 });
    const image = new Image('image', { image: document.createElement('img'), left: 20, top: 10, width: 280, height: 160 });
    scene.addObject(image);
    const preview = vi.fn();
    const button = new MobileImagePreviewButton(image, scene, injector.get(ThemeService), preview);
    cleanups.push(() => {
        viewport.dispose();
        host.dispose();
        injector.dispose();
    });
    return { scene, image, preview, button };
}

afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
    vi.useRealTimers();
});

describe('MobileImagePreviewButton', () => {
    it('picks the preview button above its image and previews on one tap without moving the image', () => {
        const { scene, image, button, preview } = setup();
        const original = image.getState();
        expect(scene.pick(new Vector2(280, 30))).toBe(button);
        button.triggerPointerDown(pointer('pointerdown'));
        button.triggerPointerUp(pointer('pointerup'));
        expect(preview).toHaveBeenCalledOnce();
        expect(image.getState()).toEqual(original);
    });

    it('allows the host to scroll when a gesture starts on the button without previewing or dragging the image', () => {
        const { scene, image, button, preview } = setup();
        const original = image.getState();
        const down = vi.fn();
        scene.onPointerDown$.subscribeEvent(down);
        button.triggerPointerDown(pointer('pointerdown'));
        scene.onPointerMove$.emitEvent(pointer('pointermove', 280, 70));
        scene.onPointerUp$.emitEvent(pointer('pointerup', 280, 70));
        expect(down).toHaveBeenCalledOnce();
        expect(preview).not.toHaveBeenCalled();
        expect(image.getState()).toEqual(original);
    });

    it('does not preview cancelled, long-press, or multi-pointer gestures', () => {
        vi.useFakeTimers();
        const { scene, button, preview } = setup();
        button.triggerPointerDown(pointer('pointerdown'));
        scene.onPointerCancel$.emitEvent(pointer('pointercancel'));
        button.triggerPointerUp(pointer('pointerup'));
        button.triggerPointerDown(pointer('pointerdown'));
        vi.advanceTimersByTime(600);
        button.triggerPointerUp(pointer('pointerup'));
        button.triggerPointerDown(pointer('pointerdown'));
        scene.onPointerDown$.emitEvent(pointer('pointerdown', 200, 100));
        button.triggerPointerUp(pointer('pointerup'));
        expect(preview).not.toHaveBeenCalled();
    });

    it('hides when selected or cropping, reappears when enabled, and is removed with the image', () => {
        const { scene, image, button } = setup();
        button.setPreviewEnabled(false);
        expect(button.visible).toBe(false);
        expect(scene.pick(new Vector2(280, 30))).toBe(image);
        button.setPreviewEnabled(true);
        expect(button.visible).toBe(true);
        image.dispose();
        expect(scene.getObject(button.oKey)).toBeFalsy();
    });

    it.each([0.5, 1, 2])('keeps the tap area screen-sized and follows the image at zoom %s', (scale) => {
        const { scene, image, button } = setup();
        scene.scale(scale, scale);
        image.translate(60, 80);
        expect(button.width * scale).toBe(44);
        expect(button.height * scale).toBe(44);
        expect(button.left + button.width).toBe(image.left + image.width);
        expect(button.top).toBe(image.top);
    });
});
