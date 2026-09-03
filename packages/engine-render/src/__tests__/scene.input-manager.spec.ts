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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceType, PointerInput } from '../basics/i-events';
import { Engine } from '../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../scene';
import { InputManager } from '../scene.input-manager';
import { Rect } from '../shape/rect';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

describe('InputManager click gestures', () => {
    let env: ReturnType<typeof setupRenderTestEnv>;
    let engine: Engine;
    let scene: Scene;
    let doubleClick: ReturnType<typeof vi.fn<() => void>>;
    let tripleClick: ReturnType<typeof vi.fn<() => void>>;

    function pointer(type: string, x = 20, y = 20, button = 0) {
        engine.onInputChanged$.emitEvent(Object.assign(new MouseEvent(type, { clientX: x, clientY: y, button }), {
            deviceType: DeviceType.Mouse,
            inputIndex: PointerInput.LeftClick + button,
            previousState: null,
            currentState: null,
            pointerId: 1,
        }));
    }

    function click(x = 20, y = 20, button = 0) {
        pointer('pointerdown', x, y, button);
        pointer('pointerup', x, y, button);
    }

    beforeEach(() => {
        env = setupRenderTestEnv();
        vi.useFakeTimers();
        engine = new Engine('click-unit', { elementWidth: 300, elementHeight: 200, dpr: 1 });
        scene = new Scene('click-scene', engine);
        new Viewport(MAIN_VIEW_PORT_KEY, scene, { left: 0, top: 0, width: 300, height: 200 });
        const rect = new Rect('target', { left: 0, top: 0, width: 200, height: 150 });
        scene.addObject(rect);
        doubleClick = vi.fn();
        tripleClick = vi.fn();
        rect.onDblclick$.subscribeEvent(doubleClick);
        rect.onTripleClick$.subscribeEvent(tripleClick);
        scene.attachControl();
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        env.restore();
        vi.restoreAllMocks();
    });

    it('recognizes primary-button double and triple clicks', () => {
        click();
        click();
        expect(doubleClick).toHaveBeenCalledTimes(1);
        click();
        expect(tripleClick).toHaveBeenCalledTimes(1);
    });

    it('does not turn a drag ending at the last clicked cell into a double click', () => {
        click();
        pointer('pointerdown', 100, 80);
        pointer('pointermove', 60, 50);
        pointer('pointerup');
        expect(doubleClick).not.toHaveBeenCalled();
        click();
        expect(doubleClick).not.toHaveBeenCalled();
        click();
        expect(doubleClick).toHaveBeenCalledTimes(1);
    });

    it('does not treat a drag returning to its origin as a click', () => {
        click();
        pointer('pointerdown');
        pointer('pointermove', 100, 80);
        pointer('pointermove');
        pointer('pointerup');
        expect(doubleClick).not.toHaveBeenCalled();
    });

    it.each([1, 2])('does not include button %s in a primary click sequence', (button) => {
        click();
        click(20, 20, button);
        expect(doubleClick).not.toHaveBeenCalled();
        click();
        expect(doubleClick).not.toHaveBeenCalled();
        click();
        expect(doubleClick).toHaveBeenCalledTimes(1);
        click(20, 20, button);
        expect(tripleClick).not.toHaveBeenCalled();
    });

    it('does not recognize a triple click at a different position', () => {
        click();
        click();
        click(100, 80);
        expect(tripleClick).not.toHaveBeenCalled();
    });

    it('starts a fresh sequence after pointer cancellation', () => {
        click();
        pointer('pointerdown');
        pointer('pointercancel');
        pointer('pointerup');
        click();
        expect(doubleClick).not.toHaveBeenCalled();
        click();
        expect(doubleClick).toHaveBeenCalledTimes(1);
    });

    it('expires double and triple click sequences', () => {
        click();
        vi.advanceTimersByTime(InputManager.DoubleClickDelay + 1);
        click();
        expect(doubleClick).not.toHaveBeenCalled();
        click();
        vi.advanceTimersByTime(InputManager.TripleClickDelay + 1);
        click();
        expect(tripleClick).not.toHaveBeenCalled();
    });

    it('allows a small movement within the click tolerance', () => {
        click();
        pointer('pointerdown');
        pointer('pointermove', 21, 21);
        pointer('pointerup', 21, 21);
        expect(doubleClick).toHaveBeenCalledTimes(1);
    });
});
