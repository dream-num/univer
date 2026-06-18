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
import { normalizePassiveWheelDelta, scrollSceneViewportPassive } from './embed-scene-passive-wheel';

describe('embed scene passive wheel helpers', () => {
    it('normalizes dominant touchpad axes and shift-wheel horizontal scroll', () => {
        expect(normalizePassiveWheelDelta(new WheelEvent('wheel', { deltaX: 1, deltaY: 40 }))).toEqual({
            offsetX: 0,
            offsetY: 40,
        });
        expect(normalizePassiveWheelDelta(new WheelEvent('wheel', { deltaX: 12, deltaY: 1 }))).toEqual({
            offsetX: 12,
            offsetY: 0,
        });
        expect(normalizePassiveWheelDelta(new WheelEvent('wheel', { deltaX: 0, deltaY: 10, shiftKey: true }))).toEqual({
            offsetX: 30,
            offsetY: 0,
        });
    });

    it('scrolls a scene viewport and marks the scene dirty only when position changes', () => {
        const makeDirty = vi.fn();
        const viewport = {
            viewportScrollX: 0,
            viewportScrollY: 10,
            scrollByViewportDeltaVal: vi.fn(({ viewportScrollX, viewportScrollY }) => {
                viewport.viewportScrollX += viewportScrollX;
                viewport.viewportScrollY += viewportScrollY;
            }),
        };

        const handled = scrollSceneViewportPassive(
            { event: new WheelEvent('wheel', { deltaY: 12 }) } as any,
            viewport,
            { makeDirty }
        );

        expect(handled).toBe(true);
        expect(viewport.viewportScrollY).toBe(22);
        expect(makeDirty).toHaveBeenCalledWith(true);
    });

    it('does not consume wheel events when the viewport cannot move', () => {
        const makeDirty = vi.fn();
        const viewport = {
            viewportScrollX: 0,
            viewportScrollY: 0,
            scrollByViewportDeltaVal: vi.fn(),
        };

        const handled = scrollSceneViewportPassive(
            { event: new WheelEvent('wheel', { deltaY: -12 }) } as any,
            viewport,
            { makeDirty }
        );

        expect(handled).toBe(false);
        expect(makeDirty).not.toHaveBeenCalled();
    });
});
