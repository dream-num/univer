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

import { describe, expect, it, vi } from 'vitest';
import { attachObjectHover } from '../quick-event';

function createEventSubject() {
    let listener: ((evt: unknown) => void) | undefined;
    return {
        subscribeEvent: vi.fn((callback: (evt: unknown) => void) => {
            listener = callback;
        }),
        emit: (evt: unknown) => listener?.(evt),
    };
}

describe('quick event helpers', () => {
    it('binds pointer enter and leave events to hover callbacks with the target object', () => {
        const enter = createEventSubject();
        const leave = createEventSubject();
        const object = {
            onPointerEnter$: enter,
            onPointerLeave$: leave,
        };
        const hoverIn = vi.fn();
        const hoverOut = vi.fn();

        attachObjectHover(object as never, hoverIn, hoverOut);

        const enterEvent = { offsetX: 10, offsetY: 20 };
        const leaveEvent = { offsetX: 30, offsetY: 40 };
        enter.emit(enterEvent);
        leave.emit(leaveEvent);

        expect(enter.subscribeEvent).toHaveBeenCalledTimes(1);
        expect(leave.subscribeEvent).toHaveBeenCalledTimes(1);
        expect(hoverIn).toHaveBeenCalledWith(object, enterEvent);
        expect(hoverOut).toHaveBeenCalledWith(object, leaveEvent);
    });
});
