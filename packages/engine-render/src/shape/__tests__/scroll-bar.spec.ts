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
import { setupRenderTestEnv } from '../../__tests__/render-test-utils';
import { Engine } from '../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../scene';
import { Viewport } from '../../viewport';
import { ScrollBar } from '../scroll-bar';

function createRenderContext() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        transform: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        rect: vi.fn(),
        roundRect: vi.fn(),
        setLineDash: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
    } as any;
}

describe('ScrollBar', () => {
    let restoreEnv: () => void;
    let container: HTMLDivElement;
    let engine: Engine;
    let scene: Scene;
    let viewport: Viewport;

    beforeEach(() => {
        restoreEnv = setupRenderTestEnv().restore;
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '260px';
        document.body.appendChild(container);

        engine = new Engine('scrollbar-engine', { elementWidth: 400, elementHeight: 260, dpr: 1 });
        engine.mount(container, false);
        scene = new Scene('scrollbar-scene', engine);
        scene.transformByState({ width: 1000, height: 800, scaleX: 1, scaleY: 1 });
        viewport = new Viewport(MAIN_VIEW_PORT_KEY, scene, {
            left: 0,
            top: 0,
            width: 160,
            height: 120,
            active: true,
            allowCache: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        viewport?.dispose();
        scene?.dispose();
        engine?.dispose();
        restoreEnv?.();
        container?.remove();
    });

    it('resizes visible thumbs, maps scroll ratios and renders both axes', () => {
        const scrollBar = new ScrollBar(viewport, {
            mainScene: scene,
            barSize: 12,
            barBorder: 2,
            thumbMargin: 2,
            minThumbSizeH: 20,
            minThumbSizeV: 18,
        });
        const ctx = createRenderContext();

        scrollBar.resize(160, 120, 640, 480);
        viewport.scrollToBarPos({ x: 12, y: 10 });
        scrollBar.render(ctx, 4, 6);

        expect(scrollBar.hasHorizonThumb()).toBe(true);
        expect(scrollBar.hasVerticalThumb()).toBe(true);
        expect(scrollBar.limitX).toBeGreaterThan(0);
        expect(scrollBar.limitY).toBeGreaterThan(0);
        expect(scrollBar.ratioScrollX).toBeGreaterThan(0);
        expect(scrollBar.ratioScrollY).toBeGreaterThan(0);
        expect(scrollBar.scrollHorizonThumbThickness).toBe(8);
        expect(scrollBar.scrollVerticalThumbThickness).toBe(8);
        expect(ctx.transform).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();

        scrollBar.dispose();
        expect(viewport.getScrollBar()).toBeNull();
    });

    it('hides thumbs when content fits inside the viewport', () => {
        const scrollBar = ScrollBar.attachTo(viewport, {
            enableHorizontal: true,
            enableVertical: true,
        });

        scrollBar.resize(160, 120, 100, 80);

        expect(scrollBar.hasHorizonThumb()).toBe(false);
        expect(scrollBar.hasVerticalThumb()).toBe(false);
        expect(scrollBar.limitX).toBe(0);
        expect(scrollBar.limitY).toBe(0);

        scrollBar.dispose();
    });

    it('uses track clicks and thumb dragging to update viewport scroll', () => {
        const scrollBar = new ScrollBar(viewport, { mainScene: scene });
        const scrollToBarPos = vi.spyOn(viewport, 'scrollToBarPos');
        const scrollByBarDeltaValue = vi.spyOn(viewport, 'scrollByBarDeltaValue');
        const setCapture = vi.spyOn(engine, 'setCapture').mockImplementation(() => {});

        scrollBar.resize(160, 120, 640, 480);
        scrollBar.horizonScrollTrack!.onPointerDown$.emitEvent({ offsetX: 80, offsetY: 115 } as any);
        scrollBar.verticalScrollTrack!.onPointerDown$.emitEvent({ offsetX: 155, offsetY: 70 } as any);

        scrollBar.horizonThumbRect!.onPointerEnter$.emitEvent({} as any);
        scrollBar.horizonThumbRect!.onPointerDown$.emitEvent({ offsetX: 20, offsetY: 112 } as any);
        scene.onPointerMove$.emitEvent({ offsetX: 36, offsetY: 112 } as any);
        scene.onPointerUp$.emitEvent({ offsetX: 36, offsetY: 112 } as any);
        scrollBar.horizonThumbRect!.onPointerLeave$.emitEvent({} as any);

        scrollBar.verticalThumbRect!.onPointerEnter$.emitEvent({} as any);
        scrollBar.verticalThumbRect!.onPointerDown$.emitEvent({ offsetX: 154, offsetY: 24 } as any);
        scene.onPointerMove$.emitEvent({ offsetX: 154, offsetY: 48 } as any);
        scene.onPointerUp$.emitEvent({ offsetX: 154, offsetY: 48 } as any);
        scrollBar.verticalThumbRect!.onPointerLeave$.emitEvent({} as any);

        expect(scrollToBarPos).toHaveBeenCalledWith({ x: expect.any(Number) });
        expect(scrollToBarPos).toHaveBeenCalledWith({ y: expect.any(Number) });
        expect(scrollByBarDeltaValue).toHaveBeenCalledWith({ x: 16 }, true, { isBarDragEnd: true });
        expect(scrollByBarDeltaValue).toHaveBeenCalledWith({ y: 24 }, true, { isBarDragEnd: true });
        expect(setCapture).toHaveBeenCalled();

        scrollBar.dispose();
    });

    it('coalesces rapid thumb drag deltas before scrolling the viewport', () => {
        const scrollBar = new ScrollBar(viewport, { mainScene: scene });
        const scrollByBarDeltaValue = vi.spyOn(viewport, 'scrollByBarDeltaValue');
        const rafCallbacks: FrameRequestCallback[] = [];
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            rafCallbacks.push(callback);
            return rafCallbacks.length;
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

        scrollBar.resize(160, 120, 640, 480);
        scrollBar.verticalThumbRect!.onPointerDown$.emitEvent({ offsetX: 154, offsetY: 24 } as any);
        scene.onPointerMove$.emitEvent({ offsetX: 154, offsetY: 36 } as any);
        scene.onPointerMove$.emitEvent({ offsetX: 154, offsetY: 48 } as any);

        expect(scrollByBarDeltaValue).not.toHaveBeenCalled();
        expect(rafCallbacks).toHaveLength(1);

        rafCallbacks[0](16);

        expect(scrollByBarDeltaValue).toHaveBeenCalledOnce();
        expect(scrollByBarDeltaValue).toHaveBeenCalledWith({ y: 24 }, true, { isBarDragging: true });

        scrollBar.dispose();
    });

    it('throttles continued thumb drag scrolling while preserving the latest delta', () => {
        vi.useFakeTimers();
        try {
            const scrollBar = new ScrollBar(viewport, { mainScene: scene });
            const scrollByBarDeltaValue = vi.spyOn(viewport, 'scrollByBarDeltaValue');
            const rafCallbacks: FrameRequestCallback[] = [];
            vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
                rafCallbacks.push(callback);
                return rafCallbacks.length;
            });
            vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

            scrollBar.resize(160, 120, 640, 480);
            scrollBar.verticalThumbRect!.onPointerDown$.emitEvent({ offsetX: 154, offsetY: 24 } as any);
            scene.onPointerMove$.emitEvent({ offsetX: 154, offsetY: 36 } as any);
            scene.onPointerMove$.emitEvent({ offsetX: 154, offsetY: 48 } as any);

            rafCallbacks[0](16);
            expect(scrollByBarDeltaValue).toHaveBeenCalledOnce();
            expect(scrollByBarDeltaValue).toHaveBeenLastCalledWith({ y: 24 }, true, { isBarDragging: true });

            scene.onPointerMove$.emitEvent({ offsetX: 154, offsetY: 60 } as any);
            scene.onPointerMove$.emitEvent({ offsetX: 154, offsetY: 72 } as any);

            expect(rafCallbacks).toHaveLength(1);
            expect(scrollByBarDeltaValue).toHaveBeenCalledOnce();

            vi.advanceTimersByTime(32);
            expect(rafCallbacks).toHaveLength(2);

            rafCallbacks[1](48);
            expect(scrollByBarDeltaValue).toHaveBeenCalledTimes(2);
            expect(scrollByBarDeltaValue).toHaveBeenLastCalledWith({ y: 24 }, true, { isBarDragging: true });

            scene.onPointerUp$.emitEvent({ offsetX: 154, offsetY: 72 } as any);
            expect(scrollByBarDeltaValue).toHaveBeenCalledTimes(3);
            expect(scrollByBarDeltaValue).toHaveBeenLastCalledWith({ y: 0 }, true, { isBarDragEnd: true });

            scrollBar.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('supports single-axis scrollbars and no-op resize guards', () => {
        const horizontalOnly = new ScrollBar(viewport, {
            enableHorizontal: true,
            enableVertical: false,
            barSize: 10,
        });

        horizontalOnly.resize();
        expect(horizontalOnly.verticalThumbRect).toBeUndefined();
        expect(horizontalOnly.placeholderBarRect).toBeUndefined();
        expect(horizontalOnly.enableVertical).toBe(false);
        expect(horizontalOnly.ratioScrollY).toBe(1);

        horizontalOnly.resize(120, 80, 400, 80);
        expect(horizontalOnly.hasHorizonThumb()).toBe(true);
        horizontalOnly.dispose();

        const verticalOnly = new ScrollBar(viewport, {
            enableHorizontal: false,
            enableVertical: true,
        });
        verticalOnly.resize(120, 80, 80, 400);
        expect(verticalOnly.horizonThumbRect).toBeUndefined();
        expect(verticalOnly.enableHorizontal).toBe(false);
        expect(verticalOnly.ratioScrollX).toBe(1);
        expect(verticalOnly.hasVerticalThumb()).toBe(true);
        verticalOnly.dispose();
    });
});
