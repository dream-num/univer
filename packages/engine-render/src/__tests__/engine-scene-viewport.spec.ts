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

import { Injector, Tools } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CURSOR_TYPE } from '../basics/const';
import { DeviceType, PointerInput } from '../basics/i-events';
import { Vector2 } from '../basics/vector2';
import { Engine } from '../engine';
import { Group } from '../group';
import { MAIN_VIEW_PORT_KEY, Scene } from '../scene';
import { DumbCanvasColorService, ICanvasColorService } from '../services/canvas-color.service';
import { Rect } from '../shape/rect';
import { ScrollBar } from '../shape/scroll-bar';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

let injector: Injector;

interface IFixture {
    engine: Engine;
    scene: Scene;
    viewport: Viewport;
    container: HTMLDivElement;
}

function createInputEvent(type: string, extra: Record<string, unknown> = {}) {
    return {
        type,
        pointerId: 1,
        pointerType: 'mouse',
        button: 0,
        inputIndex: PointerInput.LeftClick,
        deviceType: DeviceType.Mouse,
        clientX: 18,
        clientY: 20,
        offsetX: 18,
        offsetY: 20,
        movementX: 2,
        movementY: 1,
        deltaX: 0,
        deltaY: 0,
        deltaZ: 0,
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        ...extra,
    } as any;
}

function createFixture(): IFixture {
    const container = document.createElement('div');
    container.style.width = '420px';
    container.style.height = '260px';
    container.style.border = '1px solid transparent';
    document.body.appendChild(container);

    const engine = injector.createChild([[Engine, { useFactory: function createTestInstance() {
        return injector.createInstance(Engine, 'unit-a', { elementWidth: 320, elementHeight: 180, dpr: 1 });
    } }]]).get(Engine);
    engine.mount(container, false);

    const scene = injector.createInstance(Scene, 'scene-a', engine);
    scene.transformByState({
        width: 700,
        height: 500,
        scaleX: 1,
        scaleY: 1,
    });

    const viewport = injector.createInstance(Viewport, MAIN_VIEW_PORT_KEY, scene, {
        left: 0,
        top: 0,
        width: 300,
        height: 180,
        active: true,
        allowCache: true,
        bufferEdgeX: 8,
        bufferEdgeY: 6,
    });

    injector.createInstance(ScrollBar, viewport, {
        mainScene: scene,
        barSize: 12,
        thumbMargin: 2,
    });

    const rect = injector.createInstance(Rect, 'rect-main', {
        left: 10,
        top: 10,
        width: 100,
        height: 60,
        fill: '#44aa66',
        stroke: '#112233',
        strokeWidth: 1,
    });
    rect.zIndex = 1;
    scene.addObject(rect, 1);

    const child = injector.createInstance(Rect, 'rect-child', {
        left: 120,
        top: 40,
        width: 60,
        height: 40,
        fill: '#3366ff',
        stroke: '#111111',
        strokeWidth: 1,
    });
    const group = injector.createInstance(Group, 'group-main', child);
    group.transformByState({ left: 40, top: 20 });
    scene.addObject(group, 2);

    return {
        engine,
        scene,
        viewport,
        container,
    };
}

function createViewportCacheFixture(bottom = 40, dpr = 1) {
    const engine = injector.createChild([[Engine, { useFactory: function createTestInstance() {
        return injector.createInstance(Engine, 'viewport-cache-engine', { elementWidth: 320, elementHeight: 180, dpr });
    } }]]).get(Engine);
    const scene = injector.createInstance(Scene, 'viewport-cache-scene', engine);
    scene.transformByState({ width: 700, height: 500, scaleX: 1, scaleY: 1 });
    const top = injector.createInstance(Viewport, 'viewMainTop', scene, { left: 0, top: 0, width: 300, height: bottom, active: true, allowCache: true });
    const main = injector.createInstance(Viewport, MAIN_VIEW_PORT_KEY, scene, { left: 0, top: bottom, width: 300, height: 180 - bottom, active: true, allowCache: true });
    const object = injector.createInstance(Rect, 'viewport-cache-rect', { left: 5, top: 5, width: 40, height: 20, fill: '#44aa66' });
    object.viewportCacheReusable = true;
    scene.addObject(object, 1);
    scene.enableLayerCache(1);
    scene.setViewportCacheReuseKey(MAIN_VIEW_PORT_KEY);
    engine.resizeBySize(320, 180);
    scene.render();
    const retained = vi.spyOn(top, 'reuseCachedRender');
    const painted = vi.spyOn(top, 'render');
    const rootClear = vi.spyOn(engine, 'clearCanvas');
    const scroll = (x = 0, y = 20) => {
        main.viewportScrollX += x;
        main.viewportScrollY += y;
        scene.makeDirtyForViewportScroll(main);
    };
    const dispose = () => {
        scene.dispose();
    };
    return { engine, scene, top, main, object, retained, painted, rootClear, scroll, dispose };
}

describe('engine scene viewport extra', () => {
    let env: ReturnType<typeof setupRenderTestEnv>;

    beforeEach(() => {
        injector = new Injector([[ICanvasColorService, { useClass: DumbCanvasColorService }]]);
        env = setupRenderTestEnv();
        vi.useFakeTimers();
    });

    afterEach(() => {
        injector.dispose();
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        env.restore();
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('retains the frozen cache band across consecutive vertical scrolls and still clears the root', () => {
        const fixture = createViewportCacheFixture();
        const bookkeeping = vi.spyOn(fixture.object, 'onViewportCacheReuse');
        try {
            fixture.scroll();
            fixture.scroll();
            expect(fixture.scene.isViewportCacheReusePending()).toBe(true);
            fixture.scene.render();
            expect(fixture.retained).toHaveBeenCalledOnce();
            expect(fixture.painted).not.toHaveBeenCalled();
            expect(bookkeeping).toHaveBeenCalledOnce();
            expect(fixture.rootClear).toHaveBeenCalledOnce();
            expect(fixture.top.isDirty).toBe(false);
            expect(fixture.top.isForceDirty).toBe(false);
            fixture.scroll();
            fixture.scene.render();
            expect(fixture.retained).toHaveBeenCalledTimes(2);
        } finally {
            fixture.dispose();
        }
    });

    it.each(['scene', 'unknown-command', 'object', 'hide', 'remove', 'clear', 'viewport', 'force-viewport', 'resize', 'horizontal', 'unsupported'] as const)(
        'falls back when %s invalidates a pending frozen cache',
        (reason) => {
            const fixture = createViewportCacheFixture();
            try {
                fixture.scroll();
                expect(fixture.scene.isViewportCacheReusePending()).toBe(true);
                switch (reason) {
                    case 'scene':
                        fixture.scene.makeDirty(true);
                        break;
                    case 'unknown-command':
                        fixture.scene.invalidateViewportCacheReuse();
                        break;
                    case 'object':
                        fixture.object.makeDirty(true);
                        break;
                    case 'hide':
                        fixture.object.hide();
                        break;
                    case 'remove':
                        fixture.scene.removeObject(fixture.object);
                        break;
                    case 'clear':
                        fixture.scene.getLayer(1).clear();
                        break;
                    case 'viewport':
                        fixture.top.markDirty(true);
                        break;
                    case 'force-viewport':
                        fixture.top.markForceDirty(true);
                        break;
                    case 'resize':
                        fixture.engine.resizeBySize(330, 180);
                        break;
                    case 'horizontal':
                        fixture.main.viewportScrollX = 1;
                        break;
                    case 'unsupported':
                        fixture.object.viewportCacheReusable = false;
                        break;
                }
                fixture.scene.render();
                expect(fixture.retained).not.toHaveBeenCalled();
                expect(fixture.painted).toHaveBeenCalledOnce();
            } finally {
                fixture.dispose();
            }
        }
    );

    it('does not resurrect invalidated intent when another relative scroll arrives before paint', () => {
        const fixture = createViewportCacheFixture();
        try {
            fixture.scroll();
            fixture.scene.invalidateViewportCacheReuse();
            fixture.scroll();
            fixture.scene.render();
            expect(fixture.retained).not.toHaveBeenCalled();
            fixture.scroll();
            fixture.scene.render();
            expect(fixture.retained).toHaveBeenCalledOnce();
        } finally {
            fixture.dispose();
        }
    });

    it.each([20.5, 21])('rejects fractional cache pixels at boundary %s', (bottom) => {
        Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1.25 });
        const fixture = createViewportCacheFixture(bottom, 2);
        try {
            fixture.scroll();
            fixture.scene.render();
            expect(fixture.retained).not.toHaveBeenCalled();
            expect(fixture.painted).toHaveBeenCalledOnce();
        } finally {
            fixture.dispose();
            Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
        }
    });

    it('keeps before-render subscribers on the full rendering path', () => {
        const fixture = createViewportCacheFixture();
        const subscription = fixture.scene.beforeRender$.subscribe(() => {});
        try {
            fixture.scroll();
            fixture.scene.render();
            expect(fixture.retained).not.toHaveBeenCalled();
            expect(fixture.painted).toHaveBeenCalledOnce();
        } finally {
            subscription.unsubscribe();
            fixture.dispose();
        }
    });

    it('keeps wheel scrolling visually consistent when the scene is scaled', () => {
        const getViewportWheelDelta = (scale: number) => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            const engine = injector.createChild([[Engine, { useFactory: function createTestInstance() {
                return injector.createInstance(Engine, 'unit-wheel', { elementWidth: 320, elementHeight: 180, dpr: 1 });
            } }]]).get(Engine);
            engine.mount(container, false);

            const scene = injector.createInstance(Scene, 'scene-wheel', engine);
            scene.transformByState({
                width: 700,
                height: 500,
                scaleX: 1,
                scaleY: 1,
            });

            const viewport = injector.createInstance(Viewport, 'doc-like-vp', scene, {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                active: true,
            });

            injector.createInstance(ScrollBar, viewport);
            scene.scale(scale, scale);
            viewport.resetCanvasSizeAndUpdateScroll();

            viewport.onMouseWheel(
                createInputEvent('wheel', { deltaY: 60 }),
                { stopPropagation: vi.fn() } as any
            );

            const delta = viewport.viewportScrollY;
            scene.dispose();
            container.remove();

            return delta;
        };

        const normalScaleDelta = getViewportWheelDelta(1);
        const doubleScaleDelta = getViewportWheelDelta(2);

        expect(doubleScaleDelta * 2).toBeCloseTo(normalScaleDelta, 3);
    });

    it('keeps clamped scroll notifications without repainting an unchanged clean viewport', () => {
        const { engine, scene, viewport, container } = createFixture();
        viewport.scrollToViewportPos({ viewportScrollX: 0, viewportScrollY: 0 });
        viewport.markDirty(false);
        viewport.markForceDirty(false);
        const dirty = vi.spyOn(viewport.getScrollBar()!, 'makeDirty');
        const notified = vi.fn();
        const subscription = viewport.onScrollAfter$.subscribeEvent(notified);

        viewport.scrollToViewportPos({ viewportScrollX: 0, viewportScrollY: -20 });
        expect(viewport.viewportScrollY).toBe(0);
        expect(dirty).not.toHaveBeenCalled();
        expect(notified).toHaveBeenCalledTimes(1);

        viewport.markForceDirty(true);
        viewport.scrollToViewportPos({ viewportScrollX: 0, viewportScrollY: -20 });
        expect(dirty).toHaveBeenCalledExactlyOnceWith(true, true);
        expect(notified).toHaveBeenCalledTimes(2);

        subscription.unsubscribe();
        scene.dispose();
        container.remove();
    });

    it('locks out minor cross-axis wheel jitter in viewport scrolling', () => {
        const { engine, scene, viewport, container } = createFixture();
        viewport.scrollToViewportPos({ viewportScrollX: 20, viewportScrollY: 20 });

        viewport.onMouseWheel(
            createInputEvent('wheel', { deltaX: 8, deltaY: 20 }),
            { stopPropagation: vi.fn() } as any
        );
        expect(viewport.viewportScrollX).toBeCloseTo(20, 3);
        expect(viewport.viewportScrollY).toBeGreaterThan(20);

        viewport.onMouseWheel(
            createInputEvent('wheel', { deltaX: 20, deltaY: 8 }),
            { stopPropagation: vi.fn() } as any
        );
        expect(viewport.viewportScrollX).toBeGreaterThan(20);

        scene.dispose();
        container.remove();
    });

    it('locks vertical wheel jitter by raw delta before doc scrollbar scaling', () => {
        const { engine, scene, viewport, container } = createFixture();
        scene.transformByState({
            width: 700,
            height: 2400,
            scaleX: 1,
            scaleY: 1,
        });
        viewport.resetCanvasSizeAndUpdateScroll();
        viewport.scrollToViewportPos({ viewportScrollX: 20, viewportScrollY: 20 });

        viewport.onMouseWheel(
            createInputEvent('wheel', { deltaX: 8, deltaY: 20 }),
            { stopPropagation: vi.fn() } as any
        );

        expect(viewport.viewportScrollX).toBeCloseTo(20, 3);
        expect(viewport.viewportScrollY).toBeGreaterThan(20);

        scene.dispose();
        container.remove();
    });

    it('covers scene, viewport, layer and render loop flows', () => {
        const { engine, scene, viewport, container } = createFixture();

        expect(engine.getScene('scene-a')).toBe(scene);
        expect(scene.getMainViewport()).toBe(viewport);
        expect(engine.getCanvasElement().parentElement).toBe(container);

        scene.setCursor(CURSOR_TYPE.POINTER);
        expect(engine.getCanvasElement().style.cursor).toBe(CURSOR_TYPE.POINTER);
        scene.setDefaultCursor(CURSOR_TYPE.CELL);
        expect(scene.getCursor()).toBe(CURSOR_TYPE.CELL);

        scene.transformByState({ width: 720, height: 520 });
        scene.scale(1.3, 1.2);
        scene.scaleBy(0.2, 0.2);

        viewport.setPadding({ startX: 6, startY: 4, endX: 3, endY: 2 });
        viewport.scrollToBarPos({ x: 12, y: 8 });
        viewport.scrollByBarDeltaValue({ x: 8, y: 4 });
        viewport.scrollToViewportPos({ viewportScrollX: 20, viewportScrollY: 16 });
        viewport.scrollByViewportDeltaVal({ viewportScrollX: 6, viewportScrollY: 5 });
        viewport.resizeWhenFreezeChange({ left: 0, top: 0, width: 250, height: 150 });
        viewport.resetPadding();

        expect(scene.pick(Vector2.FromArray([20, 20]))).toBeTruthy();
        expect(scene.findViewportByPosToScene(Vector2.FromArray([20, 20]))).toBeTruthy();
        expect(scene.getScrollXYInfoByViewport(Vector2.FromArray([20, 20]))).toEqual({
            x: expect.any(Number),
            y: expect.any(Number),
        });
        expect(scene.getAllObjects().length).toBeGreaterThan(0);
        expect(scene.getAllObjectsByOrder().length).toBeGreaterThan(0);
        expect(scene.getAllObjectsByDescOrder(true).length).toBeGreaterThan(0);
        expect(scene.getAllObjectsByOrderForPick().length).toBeGreaterThan(0);
        expect(scene.getObjectIncludeInGroup('rect-child')).toBeTruthy();
        expect(scene.fuzzyMathObjects('rect').length).toBeGreaterThan(0);

        scene.render();
        viewport.onMouseWheel(
            createInputEvent('wheel', { deltaX: 4, deltaY: 12 }),
            { stopPropagation: vi.fn() } as any
        );

        viewport.disable();
        expect(viewport.shouldIntoRender()).toBe(false);
        viewport.enable();
        expect(viewport.shouldIntoRender()).toBe(true);

        const task = vi.fn();
        const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 88);
        const cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        engine.runRenderLoop(task);
        (engine as any)._renderFunction(16);
        expect(task).toHaveBeenCalled();
        engine.stopRenderLoop(task);
        expect(cafSpy).toHaveBeenCalled();
        rafSpy.mockRestore();
        cafSpy.mockRestore();

        engine.resizeBySize(500, 300);
        expect(engine.width).toBe(500);
        expect(engine.height).toBe(300);

        engine.unmount();
        expect(engine.getCanvasElement().parentElement).toBeNull();
        engine.mount(container, false);
        expect(engine.getCanvasElement().parentElement).toBe(container);

        scene.dispose();
    });

    it('preserves engine and layer caches only for a pending scroll render', () => {
        const { engine, scene } = createFixture();
        const layer = scene.getLayer(1);
        const renderSpy = vi.spyOn(layer, 'render');
        scene.render();
        renderSpy.mockClear();

        scene.makeDirtyForScrolling();
        expect(scene.isScrollRenderPending()).toBe(true);
        scene.render();
        expect(scene.isScrollRenderPending()).toBe(false);
        expect(renderSpy).toHaveBeenLastCalledWith(undefined, false, expect.objectContaining({
            preserveCache: true,
        }));

        scene.makeDirtyForScrolling();
        scene.makeDirty(true);
        scene.render();
        expect(renderSpy).toHaveBeenLastCalledWith(undefined, false, undefined);

        scene.dispose();
    });

    it('keeps shared viewport boundary pixels out of incremental scroll copies', () => {
        const { engine, scene, viewport } = createFixture();
        viewport.setViewportSize({ left: 46, top: 20, width: 260, height: 160 });
        const rowHeaderViewport = injector.createInstance(Viewport, 'viewRowBottom', scene, {
            left: 0,
            top: 20,
            width: 47,
            height: 160,
            active: true,
            allowCache: true,
        });
        injector.createInstance(Viewport, 'viewColumnRight', scene, {
            left: 46,
            top: 0,
            width: 260,
            height: 21,
            active: true,
            allowCache: true,
        });

        viewport.updateScrollVal({ scrollX: 0, scrollY: 35, viewportScrollX: 0, viewportScrollY: 35 });
        rowHeaderViewport.updateScrollVal({ scrollX: 0, scrollY: 35, viewportScrollX: 0, viewportScrollY: 35 });
        scene.render();

        const ctx = engine.getCanvas().getContext();
        const drawImageSpy = vi.spyOn(ctx, 'drawImage');
        const clearRectSpy = vi.spyOn(ctx, 'clearRect');

        viewport.updateScrollVal({ scrollX: 0, scrollY: 0, viewportScrollX: 0, viewportScrollY: 0 });
        rowHeaderViewport.updateScrollVal({ scrollX: 0, scrollY: 0, viewportScrollX: 0, viewportScrollY: 0 });
        scene.makeDirtyForScrolling();
        scene.render();

        const engineScrollCopies = drawImageSpy.mock.calls.filter(([source]) => source === ctx.canvas);
        const mainCopy = engineScrollCopies.find(([, sourceX, sourceY, sourceWidth]) =>
            sourceX === 47 && sourceY === 21 && Number(sourceWidth) > 200
        );
        expect(mainCopy).toBeDefined();
        expect(mainCopy?.[5]).toBe(47);
        expect(Number(mainCopy?.[6])).toBeGreaterThan(Number(mainCopy?.[2]));
        const copiedOffsetY = Number(mainCopy?.[6]) - Number(mainCopy?.[2]);
        expect(clearRectSpy.mock.calls).toContainEqual([47, 21, expect.any(Number), copiedOffsetY]);

        scene.dispose();
    });

    it('uses a full render after an after-render observer mutates the engine canvas', () => {
        const { engine, scene, viewport } = createFixture();
        const layer = scene.getLayer(1);
        let shouldDrawOverlay = true;
        const subscription = scene.afterRender$.subscribe((canvas) => {
            if (canvas && shouldDrawOverlay) {
                canvas.getContext().fillText('viewport overlay', 10, 10);
            }
        });

        scene.render();
        const renderSpy = vi.spyOn(layer, 'render');
        const clearCanvasSpy = vi.spyOn(engine, 'clearCanvas');

        viewport.scrollToViewportPos({ viewportScrollY: 16 });
        scene.makeDirtyForScrolling();
        scene.render();

        expect(clearCanvasSpy).toHaveBeenCalledTimes(1);
        expect(renderSpy).toHaveBeenLastCalledWith(undefined, false, undefined);

        shouldDrawOverlay = false;
        renderSpy.mockClear();
        clearCanvasSpy.mockClear();
        viewport.scrollToViewportPos({ viewportScrollY: 32 });
        scene.makeDirtyForScrolling();
        scene.render();
        expect(clearCanvasSpy).toHaveBeenCalledTimes(1);

        renderSpy.mockClear();
        clearCanvasSpy.mockClear();
        viewport.scrollToViewportPos({ viewportScrollY: 48 });
        scene.makeDirtyForScrolling();
        scene.render();
        expect(clearCanvasSpy).not.toHaveBeenCalled();
        expect(renderSpy).toHaveBeenLastCalledWith(undefined, false, expect.objectContaining({
            preserveCache: true,
        }));

        subscription.unsubscribe();
        scene.dispose();
    });

    it('keeps cheap content live during a large scrollbar seek', () => {
        const { engine, scene, viewport } = createFixture();
        const layer = scene.getLayer(1);
        const renderSpy = vi.spyOn(layer, 'render');
        const nowSpy = vi.spyOn(Tools, 'now');
        const scrollbarRenderSpy = vi.spyOn(viewport, 'renderScrollbarOnly');
        vi.spyOn(engine, 'getEstimatedFrameInterval').mockReturnValue(1000 / 120);

        nowSpy
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(4)
            .mockReturnValueOnce(10)
            .mockReturnValueOnce(10)
            .mockReturnValueOnce(46)
            .mockReturnValueOnce(50)
            .mockReturnValueOnce(50)
            .mockReturnValueOnce(54)
            .mockReturnValueOnce(60)
            .mockReturnValueOnce(60)
            .mockReturnValueOnce(64);
        scene.render();
        renderSpy.mockClear();

        scene.beginScrollbarDrag(viewport);
        viewport.scrollToViewportPos({ viewportScrollY: 240 });
        scene.updateScrollbarDrag(viewport);
        scene.render();
        expect(renderSpy).toHaveBeenCalledTimes(1);
        expect(scrollbarRenderSpy).toHaveBeenCalled();

        renderSpy.mockClear();
        viewport.scrollToViewportPos({ viewportScrollY: 300 });
        scene.updateScrollbarDrag(viewport);
        scene.render();
        expect(renderSpy).toHaveBeenCalledTimes(1);

        viewport.scrollToViewportPos({ viewportScrollY: 320 });
        scene.updateScrollbarDrag(viewport);
        scene.endScrollbarDrag(viewport);
        scene.render();
        expect(renderSpy).toHaveBeenCalledTimes(2);

        scene.dispose();
    });

    it('keeps content live while its render cost stays within the seek budget', () => {
        const { engine, scene, viewport } = createFixture();
        const layer = scene.getLayer(1);
        const renderSpy = vi.spyOn(layer, 'render');
        const nowSpy = vi.spyOn(Tools, 'now');
        vi.spyOn(engine, 'getEstimatedFrameInterval').mockReturnValue(1000 / 120);

        nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(12);
        scene.render();
        renderSpy.mockClear();

        let now = 20;
        nowSpy.mockImplementation(() => now);
        scene.beginScrollbarDrag(viewport);
        viewport.scrollToViewportPos({ viewportScrollY: 240 });
        scene.updateScrollbarDrag(viewport);
        scene.render();
        expect(renderSpy).toHaveBeenCalledTimes(1);

        now = 28;
        viewport.scrollToViewportPos({ viewportScrollY: 300 });
        scene.updateScrollbarDrag(viewport);
        scene.render();
        expect(renderSpy).toHaveBeenCalledTimes(2);

        scene.dispose();
    });

    it('keeps expensive content stable until a large scrollbar seek settles', () => {
        const { engine, scene, viewport } = createFixture();
        const layer = scene.getLayer(1);
        const renderSpy = vi.spyOn(layer, 'render');
        const nowSpy = vi.spyOn(Tools, 'now');
        vi.spyOn(engine, 'getEstimatedFrameInterval').mockReturnValue(1000 / 120);

        nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(40);
        scene.render();
        renderSpy.mockClear();

        let now = 50;
        nowSpy.mockImplementation(() => now);
        scene.beginScrollbarDrag(viewport);
        viewport.scrollToViewportPos({ viewportScrollY: 240 });
        scene.updateScrollbarDrag(viewport);
        scene.render();
        expect(renderSpy).not.toHaveBeenCalled();

        now = 220;
        viewport.scrollToViewportPos({ viewportScrollY: 300 });
        scene.updateScrollbarDrag(viewport);
        scene.render();
        expect(renderSpy).not.toHaveBeenCalled();

        now = 284;
        scene.render();
        expect(renderSpy).toHaveBeenCalledTimes(1);

        scene.dispose();
    });

    it('scrolls independent viewport regions for a frozen sheet render', () => {
        const { engine, scene, viewport, container } = createFixture();
        viewport.setViewportSize({ left: 100, width: 200 });
        const frozenViewport = injector.createInstance(Viewport, 'viewMainLeft', scene, {
            left: 0,
            top: 0,
            width: 100,
            height: 180,
            active: true,
            allowCache: true,
        });

        scene.render();
        const engineCtx = engine.getCanvas().getContext();
        const drawImageSpy = vi.spyOn(engineCtx, 'drawImage');
        const clearCanvasSpy = vi.spyOn(engine, 'clearCanvas');
        drawImageSpy.mockClear();

        viewport.scrollToViewportPos({ viewportScrollX: 20, viewportScrollY: 16 });
        frozenViewport.updateScrollVal({
            scrollX: 0,
            scrollY: 16,
            viewportScrollX: 0,
            viewportScrollY: 16,
        });
        scene.makeDirtyForScrolling();
        scene.render();

        const engineScrollCopies = drawImageSpy.mock.calls.filter(([source]) => source === engineCtx.canvas);
        expect(engineScrollCopies).toHaveLength(2);
        expect(clearCanvasSpy).not.toHaveBeenCalled();

        scene.dispose();
        container.remove();
    });

    it('covers engine pointer handlers and input manager dispatch', () => {
        const { engine, scene } = createFixture();
        scene.attachControl();

        const scenePointerMove = vi.fn();
        const scenePointerDown = vi.fn();
        const sceneWheel = vi.fn();
        const sceneDragOver = vi.fn();
        scene.onPointerMove$.subscribeEvent(scenePointerMove);
        scene.onPointerDown$.subscribeEvent(scenePointerDown);
        scene.onMouseWheel$.subscribeEvent(sceneWheel);
        scene.onDragOver$.subscribeEvent(sceneDragOver);

        const engineEventTypes: string[] = [];
        engine.onInputChanged$.subscribeEvent((evt) => engineEventTypes.push(evt.type));

        (engine as any)._pointerClickEvent(createInputEvent('click'));
        (engine as any)._pointerDblClickEvent(createInputEvent('dblclick'));
        (engine as any)._pointerEnterEvent(createInputEvent('pointerenter'));
        (engine as any)._pointerLeaveEvent(createInputEvent('pointerleave'));
        (engine as any)._pointerMoveEvent(createInputEvent('pointermove'));
        (engine as any)._pointerDownEvent(createInputEvent('pointerdown'));
        (engine as any)._pointerUpEvent(createInputEvent('pointerup'));
        (engine as any)._pointerOutEvent(createInputEvent('pointerout'));
        (engine as any)._pointerCancelEvent(createInputEvent('pointercancel'));
        (engine as any)._pointerWheelEvent(createInputEvent('wheel', { deltaX: 1, deltaY: 4, deltaZ: 2 }));
        (engine as any)._pointerBlurEvent(createInputEvent('blur'));

        const dragOverEvent = createInputEvent('dragover', {
            dataTransfer: {},
            preventDefault: vi.fn(),
        });
        (engine as any)._dragEnterEvent(createInputEvent('dragenter', { dataTransfer: {} }));
        (engine as any)._dragLeaveEvent(createInputEvent('dragleave', { dataTransfer: {} }));
        (engine as any)._dragOverEvent(dragOverEvent);
        (engine as any)._dropEvent(createInputEvent('drop', { dataTransfer: {} }));

        engine.onInputChanged$.emitEvent(createInputEvent('keydown', {
            deviceType: DeviceType.Keyboard,
            keyCode: 13,
        }));
        engine.onInputChanged$.emitEvent(createInputEvent('keyup', {
            deviceType: DeviceType.Keyboard,
            keyCode: 27,
        }));
        engine.onInputChanged$.emitEvent(createInputEvent('pointermove', {
            inputIndex: PointerInput.Horizontal,
        }));
        engine.onInputChanged$.emitEvent(createInputEvent('pointerdown', {
            inputIndex: PointerInput.LeftClick,
        }));
        engine.onInputChanged$.emitEvent(createInputEvent('pointerup', {
            inputIndex: PointerInput.LeftClick,
        }));
        engine.onInputChanged$.emitEvent(createInputEvent('click'));
        engine.onInputChanged$.emitEvent(createInputEvent('dblclick'));
        engine.onInputChanged$.emitEvent(createInputEvent('wheel'));
        engine.onInputChanged$.emitEvent(createInputEvent('pointerleave'));
        engine.onInputChanged$.emitEvent(createInputEvent('pointerout'));
        engine.onInputChanged$.emitEvent(createInputEvent('pointercancel'));
        engine.onInputChanged$.emitEvent(createInputEvent('dragenter', {
            dataTransfer: {},
        }));
        engine.onInputChanged$.emitEvent(createInputEvent('dragover', {
            dataTransfer: {},
            inputIndex: PointerInput.DeltaVertical,
        }));
        engine.onInputChanged$.emitEvent(createInputEvent('dragleave', {
            dataTransfer: {},
        }));
        engine.onInputChanged$.emitEvent(createInputEvent('drop', {
            dataTransfer: {},
        }));

        vi.advanceTimersByTime(1000);

        expect(engineEventTypes.length).toBeGreaterThan(10);
        expect(scenePointerMove).toHaveBeenCalled();
        expect(scenePointerDown).toHaveBeenCalled();
        expect(sceneWheel).toHaveBeenCalled();
        expect(sceneDragOver).toHaveBeenCalled();
        expect(dragOverEvent.preventDefault).toHaveBeenCalled();

        scene.detachControl();
        scene.dispose();
    });

    it('uses canvas-relative client coordinates to pick touch targets', () => {
        const { engine, scene } = createFixture();
        scene.attachControl();
        engine.getCanvasElement().getBoundingClientRect = () => ({
            bottom: 560,
            height: 360,
            left: 100,
            right: 740,
            top: 200,
            width: 640,
            x: 100,
            y: 200,
            toJSON: () => ({}),
        } as DOMRect);
        const pick = vi.spyOn(scene, 'pick');

        engine.onInputChanged$.emitEvent(createInputEvent('pointerdown', {
            clientX: 136,
            clientY: 240,
            deviceType: DeviceType.Touch,
            offsetX: 18,
            offsetY: -160,
            pointerType: 'touch',
        }));

        expect(pick).toHaveBeenCalledWith(expect.objectContaining({ x: 18, y: 20 }), DeviceType.Touch);

        scene.dispose();
    });

    it('throws when subscribing clientRect$ without mounting container', () => {
        const engine = injector.createChild([[Engine, { useFactory: function createTestInstance() {
            return injector.createInstance(Engine, 'unit-b', { elementWidth: 1, elementHeight: 1, dpr: 1 });
        } }]]).get(Engine);
        const onError = vi.fn();
        engine.clientRect$.subscribe({
            error: onError,
        });
        expect(onError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: '[Engine]: cannot subscribe to rect changes when container is not set!',
            })
        );
    });

    it('estimates the display frame interval without following isolated long frames', () => {
        const engine = injector.createChild([[Engine, { useFactory: function createTestInstance() {
            return injector.createInstance(Engine, 'unit-frame-interval', { elementWidth: 1, elementHeight: 1, dpr: 1 });
        } }]]).get(Engine);
        let timestamp = 0;
        engine._endFrame(timestamp);
        for (const interval of [8, 8, 8, 16]) {
            timestamp += interval;
            engine._endFrame(timestamp);
        }

        expect(engine.getEstimatedFrameInterval()).toBe(8);
    });

    it('covers scene/viewport utility and early-return branches', () => {
        const { engine, scene, viewport } = createFixture();

        scene.transformByState({});
        scene.makeDirtyNoParent(true);
        scene.enableLayerCache(1);
        scene.disableLayerCache(1);
        expect(scene.getAncestorScale()).toEqual({
            scaleX: expect.any(Number),
            scaleY: expect.any(Number),
        });
        expect(scene.ancestorLeft).toBeGreaterThanOrEqual(0);
        expect(scene.ancestorTop).toBeGreaterThanOrEqual(0);
        expect(scene.getLayerMaxZIndex()).toBeGreaterThanOrEqual(1);
        expect(scene.findLayerByZIndex(999)).toBeUndefined();

        const extraRect = injector.createInstance(Rect, 'rect-extra', {
            left: 1,
            top: 1,
            width: 5,
            height: 5,
        });
        scene.addObjects([extraRect], 3);
        expect(scene.getObject('rect-extra')).toBeTruthy();
        expect(scene.getObjectIncludeInGroup('rect-extra')).toBeTruthy();
        expect(scene.fuzzyMathObjects('rect', true).length).toBeGreaterThan(0);
        expect(scene.getObjectsByLayer(3).length).toBeGreaterThan(0);

        expect(scene.removeObject()).toBeUndefined();
        expect(scene.removeObjects()).toBeUndefined();
        expect(scene.removeObject('rect-extra')).toBe(scene);
        expect(scene.removeObjects(['rect-main'] as any)).toBe(scene);

        const orphan = injector.createInstance(Rect, 'orphan', { left: 0, top: 0, width: 2, height: 2 });
        const emitSpy = vi.spyOn(orphan.onIsAddedToParent$, 'emitEvent');
        scene.setObjectBehavior(orphan);
        expect(orphan.parent).toBe(scene);
        expect(emitSpy).toHaveBeenCalled();

        const tempViewport = injector.createInstance(Viewport, 'temp-vp', scene, {
            left: 1,
            top: 1,
            width: 20,
            height: 10,
            active: false,
        });
        expect(scene.getViewport('temp-vp')).toBe(tempViewport);
        expect(scene.getViewports().some((vp) => vp.viewportKey === 'temp-vp')).toBe(true);
        expect(scene.removeViewport('temp-vp')).toBe(tempViewport);
        expect(scene.getViewport('temp-vp')).toBeUndefined();

        expect(scene.getScrollXYInfoByViewport(Vector2.FromArray([1, 1]), viewport)).toEqual({
            x: expect.any(Number),
            y: expect.any(Number),
        });
        expect(scene.getCoordRelativeToViewport(Vector2.FromArray([2, 3]))).toEqual(expect.any(Object));
        expect(scene.getPrecisionScale().scaleX).toBeGreaterThan(0);
        expect(scene.getPrecisionScale().scaleY).toBeGreaterThan(0);

        viewport.height = 9999;
        viewport.top = 2;
        viewport.left = 3;
        viewport.bottom = 4;
        viewport.right = 5;
        viewport.preCacheBound = { left: 0, top: 0, right: 1, bottom: 1 };
        viewport.cacheBound = { left: 0, top: 0, right: 2, bottom: 2 };
        viewport.updateScrollVal({ scrollX: 5, scrollY: 6, viewportScrollX: 7, viewportScrollY: 8 });
        expect(viewport.topOrigin).toBe(2);
        expect(viewport.leftOrigin).toBe(3);
        expect(viewport.bottomOrigin).toBe(4);
        expect(viewport.rightOrigin).toBe(5);
        expect(viewport.bottom).toBeGreaterThanOrEqual(0);
        expect(viewport.right).toBeGreaterThanOrEqual(0);
        expect(viewport.isWheelPreventDefaultX).toBeDefined();
        expect(viewport.isWheelPreventDefaultY).toBeDefined();
        expect(viewport.viewBound).toBeTruthy();
        expect(viewport.cacheBound).toBeTruthy();
        expect(viewport.preCacheBound).toBeTruthy();
        expect((viewport as any)._deltaScrollX).toBeDefined();
        expect((viewport as any)._deltaScrollY).toBeDefined();
        expect((viewport as any)._deltaViewportScrollX).toBeDefined();
        expect((viewport as any)._deltaViewportScrollY).toBeDefined();
        expect(viewport.getScrollBar()).toBeTruthy();
        expect(viewport.getViewportScrollByScrollXY()).toEqual(expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
        }));

        expect(viewport.resizeWhenFreezeChange({} as any)).toBeUndefined();
        viewport.disable();
        expect(viewport.scrollToViewportPos({ viewportScrollX: 1, viewportScrollY: 1 })).toBeUndefined();
        expect(viewport.scrollByViewportDeltaVal({ viewportScrollX: 1, viewportScrollY: 1 })).toBeUndefined();
        viewport.enable();

        const viewportNoScrollBar = injector.createInstance(Viewport, 'temp-vp-2', scene, {
            left: 0,
            top: 0,
            width: 20,
            height: 10,
            active: true,
        });
        viewportNoScrollBar.scrollX = 11;
        viewportNoScrollBar.scrollY = 12;
        expect(viewportNoScrollBar.transViewportScroll2ScrollValue(2, 3)).toEqual({ x: 11, y: 12 });
        viewportNoScrollBar.viewportScrollX = 13;
        viewportNoScrollBar.viewportScrollY = 14;
        const transNoBar = viewportNoScrollBar.transScroll2ViewportScrollValue(1, 2);
        expect(transNoBar.x).toBeGreaterThan(0);
        expect(transNoBar.y).toBeGreaterThan(0);
        viewportNoScrollBar.disable();
        const defaultInfo = viewportNoScrollBar.calcViewportInfo();
        expect(defaultInfo.viewportKey).toBe('temp-vp-2');
        viewportNoScrollBar.render(undefined, []);
        viewportNoScrollBar.dispose();

        scene.dispose();
    });

    it('does not bridge non-overlapping cache bounds when calculating cache diff', () => {
        const { engine, scene, viewport } = createFixture();
        const currentBound = { left: 0, top: 10000, right: 460, bottom: 10280 };
        const diffBounds = (viewport as any)._calcDiffCacheBound(
            { left: 0, top: 0, right: 460, bottom: 280 },
            currentBound
        );

        expect(diffBounds).toEqual([currentBound]);

        scene.dispose();
    });

    it('expands cache diff strips only toward retained cache content', () => {
        const { engine, scene, viewport } = createFixture();
        viewport.bufferEdgeX = 10;
        viewport.bufferEdgeY = 20;

        const downwardDiff = (viewport as any)._calcDiffCacheBound(
            { left: 0, top: 0, right: 100, bottom: 100 },
            { left: 0, top: 50, right: 100, bottom: 150 }
        );
        expect(downwardDiff).toEqual([
            { left: 0, top: 80, right: 100, bottom: 150 },
        ]);

        const upwardDiff = (viewport as any)._calcDiffCacheBound(
            { left: 0, top: 50, right: 100, bottom: 150 },
            { left: 0, top: 0, right: 100, bottom: 100 }
        );
        expect(upwardDiff).toEqual([
            { left: 0, top: 0, right: 100, bottom: 70 },
        ]);

        const rightwardDiff = (viewport as any)._calcDiffCacheBound(
            { left: 0, top: 0, right: 100, bottom: 100 },
            { left: 50, top: 0, right: 150, bottom: 100 }
        );
        expect(rightwardDiff).toEqual([
            { left: 90, top: 0, right: 150, bottom: 100 },
        ]);

        const leftwardDiff = (viewport as any)._calcDiffCacheBound(
            { left: 50, top: 0, right: 150, bottom: 100 },
            { left: 0, top: 0, right: 100, bottom: 100 }
        );
        expect(leftwardDiff).toEqual([
            { left: 0, top: 0, right: 60, bottom: 100 },
        ]);

        const diagonalDiff = (viewport as any)._calcDiffCacheBound(
            { left: 0, top: 0, right: 100, bottom: 100 },
            { left: 50, top: 50, right: 150, bottom: 150 }
        );
        expect(diagonalDiff).toEqual([
            { left: 90, top: 50, right: 150, bottom: 150 },
            { left: 50, top: 80, right: 100, bottom: 150 },
        ]);

        scene.dispose();
    });
});
