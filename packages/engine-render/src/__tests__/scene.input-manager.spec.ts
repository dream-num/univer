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
import { DeviceType } from '../basics/i-events';
import { InputManager } from '../scene.input-manager';

function createScene() {
    return {
        onDblclick$: { emitEvent: vi.fn() },
        onPointerUp$: { emitEvent: vi.fn() },
        onTripleClick$: { emitEvent: vi.fn() },
        pick: vi.fn(() => null),
    };
}

function createPointerUpEvent(clientX: number, deviceType: DeviceType) {
    return {
        button: 0,
        clientX,
        clientY: 20,
        deviceType,
        offsetX: clientX,
        offsetY: 20,
        pointerId: 1,
    };
}

describe('InputManager double click recognition', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('allows natural finger drift between two touch taps', () => {
        vi.useFakeTimers();
        const scene = createScene();
        const inputManager = new InputManager(scene as never);

        inputManager._onPointerUp(createPointerUpEvent(20, DeviceType.Touch) as never);
        inputManager._onPointerUp(createPointerUpEvent(26, DeviceType.Touch) as never);

        expect(scene.onDblclick$.emitEvent).toHaveBeenCalledTimes(1);
    });

    it('keeps the precise double-click threshold for mouse input', () => {
        vi.useFakeTimers();
        const scene = createScene();
        const inputManager = new InputManager(scene as never);

        inputManager._onPointerUp(createPointerUpEvent(20, DeviceType.Mouse) as never);
        inputManager._onPointerUp(createPointerUpEvent(26, DeviceType.Mouse) as never);

        expect(scene.onDblclick$.emitEvent).not.toHaveBeenCalled();
    });
});
