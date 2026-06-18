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
import { ScrollTimer, ScrollTimerType } from '../scroll-timer';

function createViewport() {
    return {
        top: 10,
        left: 20,
        width: 100,
        height: 80,
        scrollByViewportDeltaVal: vi.fn(() => true),
        transScroll2ViewportScrollValue: vi.fn((x: number, y: number) => ({ x: x * 2, y: y * 3 })),
    };
}

describe('ScrollTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('auto-scrolls the active viewport when the pointer moves near the right and bottom edges', () => {
        const viewport = createViewport();
        const scene = {
            findViewportByPosToScene: vi.fn(() => viewport),
        };
        const timer = ScrollTimer.create(scene as never, ScrollTimerType.ALL, { t: 5, b: 10, l: 5, r: 15 });
        const scrollFunction = vi.fn();

        timer.scrolling(130, 95, scrollFunction);
        timer.startScroll(130, 95);
        timer.stopScroll();

        expect(scene.findViewportByPosToScene).toHaveBeenCalled();
        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalledWith({
            viewportScrollX: 25,
            viewportScrollY: 15,
        });
        expect(viewport.transScroll2ViewportScrollValue).toHaveBeenCalledWith(25, 15);
        expect(scrollFunction).toHaveBeenCalledWith(50, 45);
    });

    it('respects axis restrictions and explicit target viewport', () => {
        const viewport = createViewport();
        const scene = {
            findViewportByPosToScene: vi.fn(),
        };
        const timer = ScrollTimer.create(scene as never, ScrollTimerType.Y, { t: 5, b: 10, l: 5, r: 15 });
        const scrollFunction = vi.fn();

        timer.scrolling(130, 95, scrollFunction);
        timer.startScroll(130, 95, viewport);
        timer.stopScroll();

        expect(scene.findViewportByPosToScene).not.toHaveBeenCalled();
        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalledWith({
            viewportScrollX: 0,
            viewportScrollY: 15,
        });
        expect(scrollFunction).toHaveBeenCalledWith(0, 45);
        expect(timer.getActiveViewport()).toBe(viewport);
        expect(timer.offsetX).toBe(130);
        expect(timer.offsetY).toBe(95);
    });

    it('does not invoke the scroll callback with movement when pointer stays inside the safe area', () => {
        const viewport = createViewport();
        const scene = {
            findViewportByPosToScene: vi.fn(() => viewport),
        };
        const timer = new ScrollTimer(scene as never, ScrollTimerType.ALL, { t: 5, b: 10, l: 5, r: 15 });
        const scrollFunction = vi.fn();

        timer.scrolling(60, 50, scrollFunction);
        timer.startScroll(60, 50);
        timer.stopScroll();
        timer.dispose();

        expect(viewport.scrollByViewportDeltaVal).not.toHaveBeenCalled();
        expect(scrollFunction).toHaveBeenCalledWith(0, 0);
        expect(timer.getScene()).toBe(scene);
    });
});
