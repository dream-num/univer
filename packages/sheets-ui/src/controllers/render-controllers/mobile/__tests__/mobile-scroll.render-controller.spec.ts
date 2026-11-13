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

// @vitest-environment jsdom

import { ICommandService, RANGE_TYPE } from '@univerjs/core';
import { DeviceType, ObjectType, Rect, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createChartRenderTestBed } from '../../__tests__/chart-render-test-bed';
import { createRenderTestBed } from '../../__tests__/render-test-bed';
import { ScrollCommand, SetScrollRelativeCommand } from '../../../../commands/commands/set-scroll.command';
import { SetZoomRatioCommand } from '../../../../commands/commands/set-zoom-ratio.command';
import { SetScrollOperation } from '../../../../commands/operations/scroll.operation';
import { SetZoomRatioOperation } from '../../../../commands/operations/set-zoom-ratio.operation';
import { SheetScrollManagerService } from '../../../../services/scroll-manager.service';
import { SheetsZoomRenderController } from '../../zoom.render-controller';
import { MobileSheetsScrollRenderController } from '../mobile-scroll.render-controller';

const scrollControllers: MobileSheetsScrollRenderController[] = [];
afterEach(() => {
    scrollControllers.splice(0).forEach((controller) => controller.dispose());
    vi.restoreAllMocks();
});

function dispatchTouchEvent(
    listeners: Map<string, EventListener>,
    type: string,
    touches: Array<{ clientX: number; clientY: number }>,
    preventDefault = vi.fn()
): void {
    const listener = listeners.get(type);
    if (listener == null) {
        throw new Error(`Missing ${type} listener`);
    }

    const event = new Event(type);
    Object.defineProperties(event, {
        preventDefault: { value: preventDefault },
        touches: { value: touches },
    });
    listener(event);
}

function createController() {
    const rawScrollInfo$ = new Subject<any>();
    const validViewportScrollInfo$ = new Subject<any>();
    const transformerChangeStart$ = new Subject<unknown>();
    const transformerChangeEnd$ = new Subject<unknown>();
    let sceneObjectsEvented = true;
    let sceneOverlayOwnsTouch = false;
    const transformer = {
        changeStart$: transformerChangeStart$,
        changeEnd$: transformerChangeEnd$,
        moveOnlyWhenSelected: false,
        resetProps: vi.fn(),
    };
    const scrollStates = new Map<string, any>();
    const scrollManagerService = {
        rawScrollInfo$,
        validViewportScrollInfo$,
        setValidScrollStateToCurrSheet: vi.fn(),
        setSearchParam: vi.fn(),
        getCurrentScrollState: vi.fn(() => ({
            sheetViewStartRow: 1,
            sheetViewStartColumn: 1,
            offsetX: 3,
            offsetY: 4,
        })),
        getScrollStateByParam: vi.fn((param: any) => scrollStates.get(`${param.unitId}:${param.sheetId}`)),
        calcViewportScrollFromRowColOffset: vi.fn((state: any) => state
            ? {
                viewportScrollX: state.sheetViewStartColumn * 100 + state.offsetX,
                viewportScrollY: state.sheetViewStartRow * 20 + state.offsetY,
            }
            : { viewportScrollX: 0, viewportScrollY: 0 }),
    };
    const testBed = createRenderTestBed({
        dependencies: [
            [SheetScrollManagerService, { useValue: scrollManagerService }],
        ],
    });
    const { injector, context, skeleton, viewportMap, sheet, scene, renderManagerService } = testBed;
    const commandService = injector.get(ICommandService);
    const executeCommand = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true as never);
    const syncExecuteCommand = vi.spyOn(commandService, 'syncExecuteCommand').mockReturnValue(true as never);
    const viewportMain = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) as any;
    viewportMain.height = 120;
    viewportMain.width = 250;
    (skeleton as any).getRangeByViewport = vi.fn(() => ({
        startRow: 2,
        startColumn: 2,
        endRow: 6,
        endColumn: 5,
    }));
    const worksheet = sheet.getActiveSheet();
    vi.spyOn(worksheet, 'getFreeze').mockReturnValue({
        startRow: 0,
        startColumn: 0,
        ySplit: 0,
        xSplit: 0,
    } as any);
    const canvasListeners = new Map<string, EventListener>();
    const canvasElement = {
        parentElement: document.createElement('div'),
        addEventListener: vi.fn((type: string, listener: EventListener) => {
            canvasListeners.set(type, listener);
        }),
        removeEventListener: vi.fn(),
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0 })),
    };
    vi.spyOn(scene, 'getEngine').mockReturnValue({
        getCanvasElement: () => canvasElement,
        width: 800,
        height: 600,
    } as any);
    Object.defineProperty(scene, 'getTransformerByCreate', {
        configurable: true,
        value: () => transformer,
    });
    Object.defineProperty(scene, 'objectsEvented', {
        configurable: true,
        get: () => sceneObjectsEvented,
    });
    Object.defineProperty(scene, 'pick', {
        configurable: true,
        value: () => sceneOverlayOwnsTouch ? scene : null,
    });

    injector.add([MobileSheetsScrollRenderController, { useFactory: () => injector.createInstance(MobileSheetsScrollRenderController, context as any) }]);
    const controller = injector.get(MobileSheetsScrollRenderController);
    scrollControllers.push(controller);

    return {
        canvasElement,
        canvasListeners,
        controller,
        executeCommand,
        rawScrollInfo$,
        renderManagerService,
        scene,
        scrollManagerService,
        scrollStates,
        sheet,
        sheetSkeletonManagerService: testBed.sheetSkeletonManagerService,
        syncExecuteCommand,
        setSceneObjectsEvented: (value: boolean) => {
            sceneObjectsEvented = value;
        },
        setSceneOverlayOwnsTouch: (value: boolean) => {
            sceneOverlayOwnsTouch = value;
        },
        testBed,
        transformerChangeEnd$,
        transformerChangeStart$,
        validViewportScrollInfo$,
        viewportMain,
    };
}

function createRealMobileFixture(zoomRatio = 1) {
    const fixture = createChartRenderTestBed([
        [SheetScrollManagerService],
        [SheetsZoomRenderController],
        [MobileSheetsScrollRenderController],
    ], false, { rowCount: 1000, columnCount: 100, zoomRatio, freeze: { startRow: 0, startColumn: 0, xSplit: 0, ySplit: 0 } });
    for (const command of [ScrollCommand, SetScrollRelativeCommand, SetScrollOperation, SetZoomRatioCommand, SetZoomRatioOperation]) {
        fixture.commands.registerCommand(command);
    }
    const execute = vi.spyOn(fixture.commands, 'executeCommand');
    let time = 1000;
    const clock = vi.spyOn(performance, 'now').mockImplementation(() => time);
    const canvas = fixture.render.engine.getCanvasElement();
    const pointerCaptures = new Set<number>();
    Object.defineProperties(canvas, {
        setPointerCapture: { value: (id: number) => pointerCaptures.add(id) },
        hasPointerCapture: { value: (id: number) => pointerCaptures.has(id) },
        releasePointerCapture: { value: (id: number) => pointerCaptures.delete(id) },
    });
    const touch = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
        const event = new Event(type, { cancelable: true });
        Object.defineProperty(event, 'touches', { value: touches });
        canvas.dispatchEvent(event);
        return event;
    };
    const pointer = (type: string, id: number, x: number, y: number, pointerType = 'touch', isPrimary = false, target: EventTarget = canvas) => {
        const event = new MouseEvent(type, { clientX: x, clientY: y, cancelable: true });
        Object.defineProperties(event, {
            pointerType: { value: pointerType },
            pointerId: { value: id },
            isPrimary: { value: isPrimary },
        });
        target.dispatchEvent(event);
        return event;
    };
    const advance = (milliseconds = 16) => {
        time += milliseconds;
    };
    const settle = () => Promise.all(execute.mock.results.filter((result) => result.type === 'return').map((result) => result.value));
    const scrollCalls = () => execute.mock.calls.filter(([id]) => id === SetScrollRelativeCommand.id);
    const swipe = async () => {
        touch('touchstart', [{ clientX: 180, clientY: 300 }]);
        for (let i = 1; i <= 6; i++) {
            advance();
            touch('touchmove', [{ clientX: 180, clientY: 300 - i * 20 }]);
            await settle();
        }
        advance();
        touch('touchend', []);
        execute.mockClear();
    };
    const frame = (milliseconds = 16) => {
        advance(milliseconds);
        fixture.render.engine._beginFrame(time);
    };
    const addDrawing = (type: ObjectType) => {
        const injector = fixture.render.getInjector!();
        injector.add([Rect, {
            useFactory: () => injector.createInstance(Rect, 'gesture-drawing', {
                left: 0,
                top: 0,
                width: 1000,
                height: 1000,
                fill: '#ffffff',
            }),
        }]);
        const drawing = injector.get(Rect);
        drawing.setObjectType(type);
        fixture.render.scene.addObject(drawing, 10);
        return drawing;
    };
    const dispose = () => {
        fixture.univer.dispose();
        clock.mockRestore();
    };
    return {
        ...fixture,
        advance,
        addDrawing,
        canvas,
        dispose,
        execute,
        touch,
        pointer,
        settle,
        scrollCalls,
        swipe,
        frame,
        controller: fixture.render.with(MobileSheetsScrollRenderController),
        viewport: fixture.render.scene.getMainViewport(),
    };
}

describe('MobileSheetsScrollRenderController', () => {
    it.each([0.5, 1, 2])('filters cross-axis touch drift before applying zoom %s and allows turns and diagonals', async (zoom) => {
        const { advance, execute, scrollCalls, touch, settle, viewport } = createRealMobileFixture(zoom);
        touch('touchstart', [{ clientX: 180, clientY: 180 }]);
        advance();
        touch('touchmove', [{ clientX: 179, clientY: 160 }]);
        await settle();
        expect(scrollCalls().at(-1)?.[1]).toEqual({ offsetX: 0, offsetY: 20 / zoom });
        expect(viewport.viewportScrollX).toBe(0);
        expect(viewport.viewportScrollY).toBeCloseTo(20 / zoom);

        advance();
        touch('touchmove', [{ clientX: 159, clientY: 161 }]);
        await settle();
        expect(scrollCalls().at(-1)?.[1]).toEqual({ offsetX: 20 / zoom, offsetY: 0 });
        expect(viewport.viewportScrollX).toBeCloseTo(20 / zoom);
        expect(viewport.viewportScrollY).toBeCloseTo(20 / zoom);

        advance();
        touch('touchmove', [{ clientX: 139, clientY: 141 }]);
        await settle();
        expect(scrollCalls().at(-1)?.[1]).toEqual({ offsetX: 20 / zoom, offsetY: 20 / zoom });
        expect(viewport.viewportScrollX).toBeCloseTo(40 / zoom);
        expect(viewport.viewportScrollY).toBeCloseTo(40 / zoom);

        touch('touchcancel', []);
        execute.mockClear();
        advance();
        touch('touchmove', [{ clientX: 119, clientY: 121 }]);
        expect(execute).not.toHaveBeenCalled();
    });

    it.each([
        { name: 'horizontal turn', moves: [[-1, -20], [-20, 1]], axis: 'x' },
        { name: 'vertical turn', moves: [[-20, -1], [1, -20]], axis: 'y' },
        { name: 'diagonal with horizontal intent', moves: [[-24, -20], [-24, -20]], axis: 'x' },
        { name: 'diagonal with vertical intent', moves: [[-20, -24], [-20, -24]], axis: 'y' },
        { name: 'balanced diagonal', moves: [[-20, -20], [-20, -20]], axis: 'y' },
        { name: 'small horizontal release jitter', moves: [[0, -20], [0, -20], [-1, 0]], axis: 'y' },
        { name: 'small vertical release jitter', moves: [[-20, 0], [-20, 0], [0, -1]], axis: 'x' },
    ])('keeps inertia on one recent dominant axis after $name', async ({ moves, axis }) => {
        const { advance, execute, frame, scrollCalls, settle, touch, viewport } = createRealMobileFixture();
        const point = { clientX: 180, clientY: 180 };
        touch('touchstart', [{ ...point }]);
        for (const [x, y] of moves) {
            advance();
            point.clientX += x;
            point.clientY += y;
            touch('touchmove', [{ ...point }]);
            await settle();
        }
        advance();
        touch('touchend', []);
        const released = { x: viewport.viewportScrollX, y: viewport.viewportScrollY };
        execute.mockClear();
        frame();
        await settle();
        const inertia = scrollCalls().at(-1)!;
        const offsets = inertia[1] as { offsetX: number; offsetY: number };
        expect(inertia[2]).toEqual({ fromMobileInertia: true });
        expect(axis === 'x' ? offsets.offsetY : offsets.offsetX).toBe(0);
        expect(axis === 'x' ? offsets.offsetX : offsets.offsetY).toBeGreaterThan(0);
        expect(axis === 'x' ? viewport.viewportScrollY : viewport.viewportScrollX).toBe(axis === 'x' ? released.y : released.x);
        expect(axis === 'x' ? viewport.viewportScrollX : viewport.viewportScrollY).toBeGreaterThan(axis === 'x' ? released.x : released.y);
        touch('touchcancel', []);
    });

    it('navigates DOM drawings through forwarded touch pointers without changing mouse gestures', async () => {
        const { addDrawing, advance, execute, pointer, render, settle, viewport, workbook } = createRealMobileFixture();
        const drawing = addDrawing(ObjectType.CHART);
        expect(render.scene.pick(Vector2.FromArray([120, 120]), DeviceType.Touch)).toBe(drawing);
        pointer('pointerdown', 1, 120, 120, 'mouse');
        advance();
        pointer('pointermove', 1, 90, 80, 'mouse');
        pointer('pointerup', 1, 90, 80, 'mouse');
        expect(execute).not.toHaveBeenCalledWith(SetScrollRelativeCommand.id, expect.anything());
        expect(viewport.viewportScrollY).toBe(0);

        pointer('pointerdown', 1, 120, 120);
        advance();
        pointer('pointermove', 1, 90, 80);
        await settle();
        expect(execute).toHaveBeenCalledWith(SetScrollRelativeCommand.id, { offsetX: 30, offsetY: 40 });
        expect(viewport.viewportScrollY).toBe(40);
        advance();
        pointer('pointermove', 1, 89, 60);
        await settle();
        expect(execute).toHaveBeenCalledWith(SetScrollRelativeCommand.id, { offsetX: 0, offsetY: 20 });
        expect(viewport.viewportScrollY).toBe(60);
        pointer('pointercancel', 1, 89, 60);
        execute.mockClear();
        pointer('pointermove', 1, 60, 40);
        expect(execute).not.toHaveBeenCalled();

        drawing.setObjectType(ObjectType.DRAWING_DOM);
        pointer('pointerdown', 1, 120, 120);
        advance();
        pointer('pointermove', 1, 120, 100);
        expect(execute).not.toHaveBeenCalledWith(SetScrollRelativeCommand.id, expect.anything());
        expect(viewport.viewportScrollY).toBe(60);
        pointer('pointerdown', 2, 220, 120);
        pointer('pointermove', 2, 260, 120);
        await settle();
        expect(execute).toHaveBeenCalledWith(SetZoomRatioCommand.id, expect.objectContaining({ zoomRatio: 1.4 }));
        expect(workbook.getActiveSheet().getZoomRatio()).toBe(1.4);
        pointer('pointerup', 2, 260, 120);
        pointer('pointerup', 1, 120, 120);
    });

    it.each(['captured-up', 'missing-up'])('does not interpret a new single chart touch as pinch after %s', async (release) => {
        const addListener = vi.spyOn(HTMLCanvasElement.prototype, 'addEventListener');
        const { addDrawing, advance, canvas, execute, pointer, render, settle, viewport } = createRealMobileFixture();
        const drawing = addDrawing(ObjectType.CHART);
        expect(render.scene.pick(Vector2.FromArray([120, 120]), DeviceType.Touch)).toBe(drawing);
        pointer('pointerdown', 1, 120, 120, 'touch', true);
        advance();
        pointer('pointermove', 1, 120, 100);
        await settle();
        if (release === 'captured-up') {
            // Native capture can deliver the up directly to the host canvas, without a DOM clone.
            const canvasPointerUp = addListener.mock.calls.findLast(([type], index) => (
                type === 'pointerup' && addListener.mock.contexts[index] === canvas
            ))![1] as EventListener;
            // DOM dispatch cannot create trusted events; supply the native capture boundary directly.
            canvasPointerUp({
                type: 'pointerup',
                pointerType: 'touch',
                pointerId: 1,
                isTrusted: true,
                preventDefault: vi.fn(),
            } as unknown as Event);
            execute.mockClear();
            advance(8);
            pointer('pointermove', 1, 120, 80);
            expect(execute).not.toHaveBeenCalled();
        }
        execute.mockClear();
        advance();
        pointer('pointerdown', 2, 220, 220, 'touch', true);
        advance();
        const released = viewport.viewportScrollY;
        pointer('pointermove', 2, 220, 200);
        await settle();
        expect(execute).not.toHaveBeenCalledWith(SetZoomRatioCommand.id, expect.anything());
        expect(execute).toHaveBeenCalledWith(SetScrollRelativeCommand.id, { offsetX: 0, offsetY: 20 });
        expect(viewport.viewportScrollY).toBe(released + 20);
        pointer('pointercancel', 2, 220, 100);
    });

    it.each(['pointerup', 'pointercancel'])('cleans forwarded chart touches when %s occurs outside the canvas', async (type) => {
        const removeListener = vi.spyOn(document, 'removeEventListener');
        const { addDrawing, advance, controller, execute, pointer, render, settle, viewport } = createRealMobileFixture();
        const drawing = addDrawing(ObjectType.CHART);
        expect(render.scene.pick(Vector2.FromArray([120, 120]), DeviceType.Touch)).toBe(drawing);
        pointer('pointerdown', 1, 120, 120);
        advance();
        pointer('pointermove', 1, 120, 100);
        await settle();
        pointer(type, 1, 120, 100, 'touch', false, document);
        execute.mockClear();
        advance();
        pointer('pointermove', 1, 120, 80);
        expect(execute).not.toHaveBeenCalled();
        expect(viewport.viewportScrollY).toBe(20);
        controller.dispose();
        expect(removeListener).toHaveBeenCalledWith('pointerup', expect.any(Function), true);
        expect(removeListener).toHaveBeenCalledWith('pointercancel', expect.any(Function), true);
    });

    it.each([ObjectType.IMAGE, ObjectType.SHAPE, ObjectType.CHART, ObjectType.DRAWING_DOM])('scrolls over unselected drawings of type %s but yields after they are selected', async (type) => {
        const { addDrawing, advance, execute, render, settle, touch, viewport } = createRealMobileFixture();
        const drawing = addDrawing(type);
        const transformer = render.scene.getTransformerByCreate();
        expect(render.scene.pick(Vector2.FromArray([120, 120]), DeviceType.Touch)).toBe(drawing);
        expect(transformer.moveOnlyWhenSelected).toBe(true);
        touch('touchstart', [{ clientX: 120, clientY: 120 }]);
        advance();
        touch('touchmove', [{ clientX: 90, clientY: 80 }]);
        await settle();
        expect(execute).toHaveBeenCalledWith(SetScrollRelativeCommand.id, { offsetX: 30, offsetY: 40 });
        expect(viewport.viewportScrollY).toBe(40);

        touch('touchend', []);
        execute.mockClear();
        transformer.setSelectedControl(drawing);
        expect(transformer.getSelectedObjectMap().has(drawing.oKey)).toBe(true);
        touch('touchstart', [{ clientX: 120, clientY: 120 }]);
        advance();
        touch('touchmove', [{ clientX: 90, clientY: 80 }]);
        expect(execute).not.toHaveBeenCalledWith(SetScrollRelativeCommand.id, expect.anything());
        expect(viewport.viewportScrollY).toBe(40);
    });

    it('scrolls the selected range into view based on the current viewport bounds', () => {
        const { controller, syncExecuteCommand, testBed } = createController();

        expect(controller.scrollToRange({
            startRow: 1,
            endRow: 10,
            startColumn: 1,
            endColumn: 8,
        })).toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith(ScrollCommand.id, {
            sheetViewStartRow: 5,
            sheetViewStartColumn: 7,
            offsetX: 0,
            offsetY: 0,
        });

        syncExecuteCommand.mockClear();
        controller.scrollToRange({
            startRow: 8,
            endRow: 12,
            startColumn: 3,
            endColumn: 9,
            rangeType: RANGE_TYPE.ROW,
        });
        expect(syncExecuteCommand).toHaveBeenCalledWith(ScrollCommand.id, expect.objectContaining({
            sheetViewStartRow: 7,
        }));

        testBed.univer.dispose();
    });

    it('syncs stored scroll state into the main viewport and emits valid scroll state after viewport scrolling', () => {
        const { rawScrollInfo$, scrollManagerService, testBed, validViewportScrollInfo$, viewportMain } = createController();
        const validStates: any[] = [];
        validViewportScrollInfo$.subscribe((state) => validStates.push(state));

        rawScrollInfo$.next({
            sheetViewStartRow: 3,
            sheetViewStartColumn: 2,
            offsetX: 7,
            offsetY: 9,
        });
        expect(viewportMain.viewportScrollX).toBe(207);
        expect(viewportMain.viewportScrollY).toBe(69);

        rawScrollInfo$.next(null);
        expect(viewportMain.viewportScrollX).toBe(0);
        expect(viewportMain.viewportScrollY).toBe(0);

        viewportMain.onScrollAfter$.emit({
            viewportScrollX: 245,
            viewportScrollY: 78,
            scrollX: 11,
            scrollY: 22,
        });
        expect(scrollManagerService.setValidScrollStateToCurrSheet).toHaveBeenCalledWith({
            sheetViewStartRow: 3,
            sheetViewStartColumn: 2,
            offsetX: 45,
            offsetY: 18,
            viewportScrollX: 245,
            viewportScrollY: 78,
            scrollX: 11,
            scrollY: 22,
        });
        expect(validStates.at(-1)).toEqual(expect.objectContaining({
            sheetViewStartRow: 3,
            sheetViewStartColumn: 2,
            viewportScrollX: 245,
            viewportScrollY: 78,
        }));

        testBed.univer.dispose();
    });

    it('turns scrollbar movement into a sheet scroll command and restores scroll on skeleton switch', () => {
        const { executeCommand, scene, scrollManagerService, scrollStates, sheet, sheetSkeletonManagerService, testBed, viewportMain } = createController();
        const unitId = sheet.getUnitId();
        scrollStates.set(`${unitId}:sheet1`, {
            sheetViewStartRow: 4,
            sheetViewStartColumn: 3,
            offsetX: 8,
            offsetY: 6,
        });

        viewportMain.onScrollByBar$.emit({
            isTrigger: true,
            viewportScrollX: 330,
            viewportScrollY: 95,
        });
        expect(executeCommand).toHaveBeenCalledWith(ScrollCommand.id, {
            sheetViewStartRow: 4,
            sheetViewStartColumn: 3,
            offsetX: 30,
            offsetY: 15,
        });

        sheetSkeletonManagerService.emitCurrentSkeletonBefore({ unitId, sheetId: 'sheet1', skeleton: sheetSkeletonManagerService.getCurrentSkeleton() });
        expect(scrollManagerService.setSearchParam).toHaveBeenCalledWith({ unitId, sheetId: 'sheet1' });
        expect(viewportMain.viewportScrollX).toBe(308);
        expect(viewportMain.viewportScrollY).toBe(86);
        expect(scene.width).toBe(5046);
        expect(scene.height).toBe(4020);

        testBed.univer.dispose();
    });

    it('registers mobile touch listeners and cancels native propagation from sheet pointer down', () => {
        const { canvasElement, testBed } = createController();

        expect(canvasElement.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
        expect(canvasElement.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
        expect(canvasElement.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: false });
        expect(canvasElement.addEventListener).toHaveBeenCalledWith('touchcancel', expect.any(Function), { passive: false });

        const pointerDown$ = testBed.context.mainComponent?.onPointerDown$ as any;
        pointerDown$.emit({}, { stopPropagation: vi.fn() });
        expect(pointerDown$.emit).toBeDefined();

        testBed.univer.dispose();
    });

    it('translates touch drag and pinch gestures into scroll and zoom commands', () => {
        const { canvasElement, executeCommand, sheet, testBed } = createController();
        const listeners = new Map<string, EventListener>();
        canvasElement.addEventListener.mock.calls.forEach(([type, handler]) => {
            listeners.set(type, handler as EventListener);
        });
        const worksheet = sheet.getActiveSheet();
        vi.spyOn(worksheet, 'getZoomRatio').mockReturnValue(1);
        const now = vi.spyOn(performance, 'now');
        now.mockReturnValueOnce(0).mockReturnValueOnce(16);

        const preventDefault = vi.fn();
        listeners.get('touchstart')!({
            touches: [{ clientX: 120, clientY: 120 }],
            preventDefault,
        } as unknown as Event);
        listeners.get('touchmove')!({
            touches: [{ clientX: 90, clientY: 80 }],
            preventDefault,
        } as unknown as Event);

        expect(preventDefault).toHaveBeenCalled();
        expect(executeCommand).toHaveBeenCalledWith(SetScrollRelativeCommand.id, {
            offsetX: 30,
            offsetY: 40,
        });

        executeCommand.mockClear();
        const pinchStart = vi.fn();
        listeners.get('touchstart')!({
            touches: [
                { clientX: 100, clientY: 100 },
                { clientX: 200, clientY: 100 },
            ],
            preventDefault: pinchStart,
        } as unknown as Event);
        expect(pinchStart).toHaveBeenCalled();

        listeners.get('touchmove')!({
            touches: [
                { clientX: 75, clientY: 100 },
                { clientX: 225, clientY: 100 },
            ],
            preventDefault: vi.fn(),
        } as unknown as Event);

        expect(executeCommand).toHaveBeenCalledWith(SetZoomRatioCommand.id, {
            zoomRatio: 1.5,
            unitId: sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
        });
        expect(executeCommand).toHaveBeenCalledWith(ScrollCommand.id, expect.objectContaining({
            sheetViewStartRow: expect.any(Number),
            sheetViewStartColumn: expect.any(Number),
        }));
        expect(canvasElement.parentElement.textContent).toContain('150%');

        now.mockRestore();
        testBed.univer.dispose();
    });

    it('does not pan the sheet when a canvas overlay owns the touch gesture', () => {
        const { canvasListeners, executeCommand, setSceneOverlayOwnsTouch, testBed } = createController();
        setSceneOverlayOwnsTouch(true);

        dispatchTouchEvent(canvasListeners, 'touchstart', [{ clientX: 120, clientY: 120 }]);
        dispatchTouchEvent(canvasListeners, 'touchmove', [{ clientX: 90, clientY: 80 }]);

        expect(executeCommand).not.toHaveBeenCalledWith(SetScrollRelativeCommand.id, expect.anything());
        testBed.univer.dispose();
    });

    it('yields an active touch gesture to the drawing transformer', () => {
        const { canvasListeners, executeCommand, testBed, transformerChangeEnd$, transformerChangeStart$ } = createController();
        const preventDefault = vi.fn();
        const now = vi.spyOn(performance, 'now');
        now.mockReturnValueOnce(0).mockReturnValueOnce(16).mockReturnValueOnce(32);

        dispatchTouchEvent(canvasListeners, 'touchstart', [{ clientX: 120, clientY: 120 }], preventDefault);
        transformerChangeStart$.next({});
        dispatchTouchEvent(canvasListeners, 'touchmove', [{ clientX: 90, clientY: 80 }], preventDefault);

        expect(preventDefault).toHaveBeenCalled();
        expect(executeCommand).not.toHaveBeenCalledWith(SetScrollRelativeCommand.id, expect.anything());

        dispatchTouchEvent(canvasListeners, 'touchend', []);
        transformerChangeEnd$.next({});
        dispatchTouchEvent(canvasListeners, 'touchstart', [{ clientX: 120, clientY: 120 }], preventDefault);
        dispatchTouchEvent(canvasListeners, 'touchmove', [{ clientX: 90, clientY: 80 }], preventDefault);

        expect(executeCommand).toHaveBeenCalledWith(SetScrollRelativeCommand.id, {
            offsetX: 30,
            offsetY: 40,
        });

        now.mockRestore();
        testBed.univer.dispose();
    });

    it.each([0.5, 1, 2])('keeps the same fling endpoint across refresh rates and dropped frames at zoom %s', async (zoom) => {
        const distances: number[] = [];
        for (const intervals of [[1000 / 60], [1000 / 30], [1000 / 120], [8, 40, 15, 100, 5]]) {
            const { controller, dispose, execute, frame, scrollCalls, settle, swipe, viewport } = createRealMobileFixture(zoom);
            await swipe();
            const releaseY = viewport.viewportScrollY;
            for (let i = 0; i < 150; i++) {
                frame(intervals[i % intervals.length]);
                await settle();
            }
            distances.push(viewport.viewportScrollY - releaseY);
            expect(distances.at(-1)).toBeGreaterThan(0);
            const completedCalls = scrollCalls().length;
            expect(completedCalls).toBeGreaterThan(0);
            execute.mockClear();
            frame();
            await settle();
            expect(execute).not.toHaveBeenCalled();
            controller.dispose();
            dispose();
        }
        for (const distance of distances) {
            expect(distance).toBeCloseTo(distances[0], 9);
        }
    });

    it.each([false, true])('stops at a blocked viewport after pending geometry work=%s', async (pendingGeometry) => {
        const { advance, commands, execute, frame, scrollCalls, settle, touch, viewport } = createRealMobileFixture();
        await commands.executeCommand(ScrollCommand.id, { sheetViewStartRow: 999, offsetY: 0 });
        const edge = viewport.viewportScrollY;
        expect(edge).toBeGreaterThan(0);
        touch('touchstart', [{ clientX: 180, clientY: 180 }]);
        advance();
        touch('touchmove', [{ clientX: 180, clientY: 140 }]);
        await settle();
        advance();
        touch('touchend', []);
        execute.mockClear();
        viewport.markDirty(pendingGeometry);
        viewport.markForceDirty(false);
        for (let i = 0; i < 10; i++) {
            frame();
            await settle();
            viewport.markDirty(false);
        }
        expect(scrollCalls()).toHaveLength(pendingGeometry ? 2 : 1);
        expect(viewport.viewportScrollY).toBe(edge);
        execute.mockClear();
        frame();
        await settle();
        expect(execute).not.toHaveBeenCalled();
    });

    it('commits inertia before paint and waits for an asynchronous command without overlapping updates', async () => {
        const { swipe, frame, settle, execute, viewport, controller } = createRealMobileFixture();
        await swipe();
        const released = viewport.viewportScrollY;
        expect(released).toBeGreaterThan(0);
        frame();
        frame();
        expect(execute.mock.calls.filter(([id]) => id === SetScrollRelativeCommand.id)).toHaveLength(1);
        await settle();
        expect(viewport.viewportScrollY).toBeGreaterThan(released);
        const beforeDispose = viewport.viewportScrollY;
        controller.dispose();
        frame();
        await settle();
        expect(viewport.viewportScrollY).toBe(beforeDispose);
        expect(execute.mock.calls.filter(([id]) => id === SetScrollRelativeCommand.id)).toHaveLength(1);
    });

    it.each(['touchcancel', 'touchstart', 'pinch', 'drawing', 'deactivate'])('cancels a pending inertia frame on %s', async (action) => {
        const { swipe, frame, settle, execute, render, touch, viewport, controller } = createRealMobileFixture();
        await swipe();
        const released = viewport.viewportScrollY;
        if (action === 'drawing') {
            const injector = render.getInjector!();
            injector.add([Rect, { useFactory: () => injector.createInstance(Rect, 'inertia-drawing', { left: 10, top: 10, width: 40, height: 40 }) }]);
            const drawing = injector.get(Rect);
            render.scene.addObject(drawing);
            render.scene.getTransformerByCreate().activeAnObject(drawing);
        } else if (action === 'deactivate') {
            render.deactivate();
        } else if (action === 'pinch') {
            touch('touchstart', [{ clientX: 120, clientY: 140 }, { clientX: 180, clientY: 140 }]);
        } else {
            touch(action, action === 'touchstart' ? [{ clientX: 180, clientY: 140 }] : []);
        }
        execute.mockClear();
        frame();
        await settle();
        expect(execute).not.toHaveBeenCalled();
        expect(viewport.viewportScrollY).toBe(released);
        controller.dispose();
    });

    it('yields an active touch gesture to shape adjustment controls', () => {
        const { canvasListeners, executeCommand, setSceneObjectsEvented, testBed } = createController();
        const preventDefault = vi.fn();

        dispatchTouchEvent(canvasListeners, 'touchstart', [{ clientX: 120, clientY: 120 }], preventDefault);
        setSceneObjectsEvented(false);
        dispatchTouchEvent(canvasListeners, 'touchmove', [{ clientX: 90, clientY: 80 }], preventDefault);

        expect(preventDefault).toHaveBeenCalled();
        expect(executeCommand).not.toHaveBeenCalledWith(SetScrollRelativeCommand.id, expect.anything());

        setSceneObjectsEvented(true);
        testBed.univer.dispose();
    });
});
