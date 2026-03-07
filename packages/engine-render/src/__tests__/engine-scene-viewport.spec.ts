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
import { CURSOR_TYPE } from '../basics/const';
import { DeviceType, PointerInput } from '../basics/i-events';
import { Vector2 } from '../basics/vector2';
import { Engine } from '../engine';
import { Group } from '../group';
import { MAIN_VIEW_PORT_KEY, Scene } from '../scene';
import { Transformer } from '../scene.transformer';
import { Rect } from '../shape/rect';
import { ScrollBar } from '../shape/scroll-bar';
import { Viewport } from '../viewport';
import { setupRenderTestEnv } from './render-test-utils';

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

    const engine = new Engine('unit-a', { elementWidth: 320, elementHeight: 180, dpr: 1 });
    engine.mount(container, false);

    const scene = new Scene('scene-a', engine);
    scene.transformByState({
        width: 700,
        height: 500,
        scaleX: 1,
        scaleY: 1,
    });

    const viewport = new Viewport(MAIN_VIEW_PORT_KEY, scene, {
        left: 0,
        top: 0,
        width: 300,
        height: 180,
        active: true,
        allowCache: true,
        bufferEdgeX: 8,
        bufferEdgeY: 6,
    });

    new ScrollBar(viewport, {
        mainScene: scene,
        barSize: 12,
        thumbMargin: 2,
    });

    const rect = new Rect('rect-main', {
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

    const child = new Rect('rect-child', {
        left: 120,
        top: 40,
        width: 60,
        height: 40,
        fill: '#3366ff',
        stroke: '#111111',
        strokeWidth: 1,
    });
    const group = new Group('group-main', child);
    group.transformByState({ left: 40, top: 20 });
    scene.addObject(group, 2);

    return {
        engine,
        scene,
        viewport,
        container,
    };
}

describe('engine scene viewport extra', () => {
    let env: ReturnType<typeof setupRenderTestEnv>;

    beforeEach(() => {
        env = setupRenderTestEnv();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        env.restore();
        vi.restoreAllMocks();
        document.body.innerHTML = '';
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

        scene.resize(720, 520);
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
        engine.dispose();
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
        engine.dispose();
    });

    it('throws when subscribing clientRect$ without mounting container', () => {
        const engine = new Engine('unit-b', { elementWidth: 1, elementHeight: 1, dpr: 1 });
        const onError = vi.fn();
        engine.clientRect$.subscribe({
            error: onError,
        });
        expect(onError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: '[Engine]: cannot subscribe to rect changes when container is not set!',
            })
        );
        engine.dispose();
    });

    it('covers transformer geometry and state helper branches', () => {
        const sceneMock = {
            ancestorScaleX: 2,
            ancestorScaleY: 4,
            ancestorLeft: 6,
            ancestorTop: 8,
            getEngine: () => ({ activeScene: null }),
        } as any;

        const transformer = new Transformer(sceneMock, {
            anchorSize: 12,
            borderSpacing: 2,
            rotateAnchorOffset: 20,
            rotateSize: 10,
        });

        const changingSpy = vi.fn();
        transformer.changing$.subscribe(changingSpy);
        (transformer as any)._selectedObjectMap.set('s1', { oKey: 's1', dispose: vi.fn() });
        transformer.changeNotification();
        expect(changingSpy).toHaveBeenCalled();

        transformer.updateZeroPoint(1, 2);
        expect(transformer.zeroLeft).toBe(1);
        expect(transformer.zeroTop).toBe(2);

        const moveBoundary = (transformer as any)._checkMoveBoundary(
            { left: 5, top: 5, width: 20, height: 10 },
            -100,
            -100,
            0,
            0,
            200,
            100
        );
        expect(moveBoundary.moveLeft).toBeLessThanOrEqual(0);
        expect(moveBoundary.moveTop).toBeLessThanOrEqual(0);

        (transformer as any)._startOffsetX = 10;
        (transformer as any)._startOffsetY = 10;
        expect((transformer as any)._moveBufferBlocker(11, 11)).toBe(true);
        expect((transformer as any)._moveBufferBlocker(30, 30)).toBe(false);

        const movePoint = (transformer as any)._getMovePoint(40, 60, {
            left: 10,
            top: 20,
            width: 80,
            height: 40,
            angle: 30,
        });
        expect(Number.isFinite(movePoint.moveLeft)).toBe(true);
        expect(Number.isFinite(movePoint.moveTop)).toBe(true);

        const rotateFixed = (transformer as any)._applyRotationForResult(
            { left: 10, top: 20, width: 50, height: 30 },
            { left: 0, top: 0, width: 40, height: 20 },
            25
        );
        expect(rotateFixed.width).toBeGreaterThan(0);
        expect(rotateFixed.height).toBeGreaterThan(0);

        const noRotate = (transformer as any)._applyRotationForResult(
            { left: 1, top: 2, width: 3, height: 4 },
            { left: 0, top: 0, width: 0, height: 0 },
            0
        );
        expect(noRotate).toEqual({ left: 1, top: 2, width: 3, height: 4 });

        const ltState = (transformer as any)._updateCloseKeepRatioState('__SpreadsheetTransformerResizeLT__', 10, 10, 60, 40, 55, 30);
        const rbState = (transformer as any)._updateCloseKeepRatioState('__SpreadsheetTransformerResizeRB__', 10, 10, 60, 40, -100, -100);
        expect(ltState.width).toBeGreaterThanOrEqual(20);
        expect(rbState.height).toBeGreaterThanOrEqual(20);

        const limited = (transformer as any)._getLimitedSize(120, 60);
        expect(limited.limitWidth).toBeGreaterThan(20);
        expect(limited.limitHeight).toBe(20);

        const ltFix = (transformer as any)._fixMoveLtRb(10, 2, 100, 50, 2);
        const lbFix = (transformer as any)._fixMoveLbRt(10, 2, 100, 50, 2);
        expect(Number.isFinite(ltFix.moveLeft)).toBe(true);
        expect(Number.isFinite(lbFix.moveTop)).toBe(true);

        const moveObject = {
            left: 10,
            top: 20,
            width: 100,
            height: 60,
            getState: () => ({ left: 10, top: 20, width: 100, height: 60 }),
        } as any;
        expect((transformer as any)._resizeLeftTop(moveObject, 5, 3, { width: 100, height: 60 }).width).toBeGreaterThan(0);
        expect((transformer as any)._resizeRightTop(moveObject, 5, 3, { width: 100, height: 60 }).height).toBeGreaterThan(0);
        expect((transformer as any)._resizeLeftBottom(moveObject, 5, 3, { width: 100, height: 60 }).width).toBeGreaterThan(0);
        expect((transformer as any)._resizeRightBottom(moveObject, 5, 3, { width: 100, height: 60 }).height).toBeGreaterThan(0);

        const recoveryTarget = {
            left: -4,
            top: -3,
            width: 20,
            height: 10,
            transformByState: vi.fn(),
        };
        (transformer as any)._recoverySizeBoundary([recoveryTarget], 0, 0, 100, 80);
        expect(recoveryTarget.transformByState).toHaveBeenCalled();

        expect((transformer as any)._getRotateAnchorCursor('__SpreadsheetTransformerResizeLM__')).toBe(CURSOR_TYPE.WEST_RESIZE);
        expect((transformer as any)._getRotateAnchorCursor('__SpreadsheetTransformerResizeCB__')).toBe(CURSOR_TYPE.SOUTH_RESIZE);
        expect((transformer as any)._getRotateAnchorCursor('__SpreadsheetTransformerRotate__')).toBe(CURSOR_TYPE.MOVE);
        expect((transformer as any)._checkTransformerType('__SpreadsheetTransformerResizeRT__123')).toBe('__SpreadsheetTransformerResizeRT__');
        expect((transformer as any)._getNorthEastPoints(10, 4)[0]).toHaveLength(6);
        expect((transformer as any)._getNorthWestPoints(10, 4)[0]).toHaveLength(6);
        expect((transformer as any)._getSouthEastPoints(10, 4)[0]).toHaveLength(7);
        expect((transformer as any)._getSouthWestPoints(10, 4)[0]).toHaveLength(7);
        expect((transformer as any)._smoothAccuracy(1.23456)).toBe(1.2);
        expect((transformer as any)._smoothAccuracy(1.23456, true)).toBe(1.235);

        transformer.dispose();
    });

    it('covers transformer attach, controls, resize and rotate flows', () => {
        const { engine, scene } = createFixture();
        engine.setActiveScene(scene.sceneKey);

        const rect = scene.getObject('rect-main') as Rect;
        const transformer = new Transformer(scene, {
            rotateEnabled: true,
            resizeEnabled: true,
            enabledAnchors: [1, 1, 1, 1, 1, 1, 1, 1],
            borderEnabled: true,
        });

        const startSpy = vi.fn();
        const changingSpy = vi.fn();
        const endSpy = vi.fn();
        transformer.changeStart$.subscribe(startSpy);
        transformer.changing$.subscribe(changingSpy);
        transformer.changeEnd$.subscribe(endSpy);

        transformer.attachTo(rect);
        (rect.onPointerDown$ as any).emitEvent(
            createInputEvent('pointerdown', { offsetX: 20, offsetY: 20 }),
            { stopPropagation: vi.fn() }
        );
        scene.onPointerMove$.emitEvent(createInputEvent('pointermove', { offsetX: 80, offsetY: 60 }));
        scene.onPointerUp$.emitEvent(createInputEvent('pointerup', { offsetX: 80, offsetY: 60 }));
        expect(startSpy).toHaveBeenCalled();
        expect(changingSpy).toHaveBeenCalled();
        expect(endSpy).toHaveBeenCalled();

        transformer.setSelectedControl(rect);
        const control = (transformer as any)._transformerControlMap.get(rect.oKey) as Group;
        expect(control).toBeTruthy();
        const allControlObjects = control.getObjects();

        const resizeAnchor = allControlObjects.find((o) => o.oKey.includes('__SpreadsheetTransformerResizeRB__')) as Rect;
        (resizeAnchor.onPointerDown$ as any).emitEvent(
            createInputEvent('pointerdown', { offsetX: 26, offsetY: 26 }),
            { stopPropagation: vi.fn() }
        );
        scene.onPointerMove$.emitEvent(createInputEvent('pointermove', { offsetX: 96, offsetY: 92 }));
        scene.onPointerUp$.emitEvent(createInputEvent('pointerup', { offsetX: 96, offsetY: 92 }));

        const rotateAnchor = allControlObjects.find(
            (o) => o.oKey.includes('__SpreadsheetTransformerRotate__') && !o.oKey.includes('LINE')
        ) as Rect | undefined;
        if (rotateAnchor) {
            (rotateAnchor.onPointerDown$ as any).emitEvent(
                createInputEvent('pointerdown', { offsetX: 30, offsetY: 8 }),
                { stopPropagation: vi.fn() }
            );
            scene.onPointerMove$.emitEvent(createInputEvent('pointermove', { offsetX: 120, offsetY: 90 }));
            scene.onPointerUp$.emitEvent(createInputEvent('pointerup', { offsetX: 120, offsetY: 90 }));
        } else {
            (transformer as any)._moveBufferSkip = true;
            (transformer as any)._startOffsetX = 30;
            (transformer as any)._startOffsetY = 8;
            (transformer as any)._viewportScrollX = 0;
            (transformer as any)._viewportScrollY = 0;
            (transformer as any)._rotateMoving(120, 90, 60, 40, 0);
        }

        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
        expect(rect.angle).toBeGreaterThanOrEqual(0);

        transformer.clearControlByIds([rect.oKey]);
        rect.transformerConfig = {
            isCropper: true,
            resizeEnabled: true,
            enabledAnchors: [1, 1, 1, 1, 1, 1, 1, 1],
        } as any;
        transformer.createControlForCopper(rect);
        expect((transformer as any)._copperControl).toBeTruthy();
        transformer.clearCopperControl();

        transformer.clearSelectedObjects();
        transformer.dispose();
        scene.dispose();
        engine.dispose();
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

        const extraRect = new Rect('rect-extra', {
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

        const orphan = new Rect('orphan', { left: 0, top: 0, width: 2, height: 2 });
        const emitSpy = vi.spyOn(orphan.onIsAddedToParent$, 'emitEvent');
        scene.setObjectBehavior(orphan);
        expect(orphan.parent).toBe(scene);
        expect(emitSpy).toHaveBeenCalled();

        const tempViewport = new Viewport('temp-vp', scene, {
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

        expect(scene.getVpScrollXYInfoByPosToVp(Vector2.FromArray([1, 1]), viewport)).toEqual({
            x: expect.any(Number),
            y: expect.any(Number),
        });
        expect(scene.getRelativeToViewportCoord(Vector2.FromArray([2, 3]))).toEqual(expect.any(Object));
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

        const viewportNoScrollBar = new Viewport('temp-vp-2', scene, {
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
        engine.dispose();
    });
});
