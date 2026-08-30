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
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ScrollCommand, SetScrollRelativeCommand } from '../../../../commands/commands/set-scroll.command';
import { SetZoomRatioCommand } from '../../../../commands/commands/set-zoom-ratio.command';
import { SheetScrollManagerService } from '../../../../services/scroll-manager.service';
import { createRenderTestBed } from '../../__tests__/render-test-bed';
import { MobileSheetsScrollRenderController } from '../mobile-scroll.render-controller';

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
        value: () => ({
            changeStart$: transformerChangeStart$,
            changeEnd$: transformerChangeEnd$,
        }),
    });
    Object.defineProperty(scene, 'objectsEvented', {
        configurable: true,
        get: () => sceneObjectsEvented,
    });
    Object.defineProperty(scene, 'pick', {
        configurable: true,
        value: () => sceneOverlayOwnsTouch ? scene : null,
    });

    const controller = injector.createInstance(MobileSheetsScrollRenderController, context as any);

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

describe('MobileSheetsScrollRenderController', () => {
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
