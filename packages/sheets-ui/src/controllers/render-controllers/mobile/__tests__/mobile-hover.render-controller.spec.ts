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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import { EventSubject, IContextService, LocaleType } from '@univerjs/core';
import { DeviceType, IRenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    MOBILE_EXPANDING_SELECTION,
    MOBILE_PINCH_ZOOMING,
    MOBILE_TRIGGER_CONTEXT_MENU,
} from '../../../../consts/mobile-context';
import { HoverManagerService } from '../../../../services/hover-manager.service';
import { SheetScrollManagerService } from '../../../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../../../services/sheet-skeleton-manager.service';
import { createTestBed } from '../../../editor/__tests__/create-test-bed';
import { MobileHoverRenderController } from '../mobile-hover.render-controller';

interface IMobilePointerTestEvent {
    clientX: number;
    clientY: number;
    isPrimary: boolean;
    offsetX: number;
    offsetY: number;
    pointerId: number;
    deviceType: DeviceType;
    timeStamp: number;
}

const testBeds: ReturnType<typeof createTestBed>[] = [];

function createController(merged = false) {
    const testBed = createTestBed({
        id: 'unit-1',
        appVersion: '1.0.0',
        locale: LocaleType.EN_US,
        name: '',
        styles: {},
        sheetOrder: ['sheet-1'],
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                rowCount: 20,
                columnCount: 20,
                defaultColumnWidth: 100,
                defaultRowHeight: 100,
                rowHeader: { width: 0 },
                columnHeader: { height: 0 },
                mergeData: merged ? [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }] : [],
                cellData: {},
            },
        },
    }, [[SheetSkeletonService], [HoverManagerService]]);
    testBeds.push(testBed);
    const injector = testBed.univer.__getInjector();
    const onPointerEnter$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerMove$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerDown$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerUp$ = new EventSubject<IMobilePointerTestEvent>();
    const onDblclick$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerLeave$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerCancel$ = new EventSubject<IMobilePointerTestEvent>();
    const context = {
        mainComponent: {
            onPointerEnter$,
            onPointerMove$,
            onPointerDown$,
            onPointerUp$,
            onDblclick$,
            onPointerLeave$,
        },
        components: new Map(),
        scene: {
            onPointerCancel$,
            onTransformChange$: new EventSubject(),
            getActiveViewportByCoord: () => ({ viewportScrollX: 0, viewportScrollY: 0 }),
            getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
            getViewports: () => [],
            makeDirty: () => {},
        },
        unit: testBed.sheet,
        unitId: testBed.sheet.getUnitId(),
    } as unknown as IRenderContext<Workbook>;
    injector.add([IRenderManagerService, { useValue: {
        getRenderUnitById: () => ({ ...context, with: injector.get.bind(injector), isDisposed: () => false }),
    } as unknown as IRenderManagerService }]);
    function createSkeletonManager() {
        return injector.createInstance(SheetSkeletonManagerService, context);
    }
    function createScrollManager() {
        return injector.createInstance(SheetScrollManagerService, context);
    }
    function createMobileHoverController() {
        return injector.createInstance(MobileHoverRenderController, context);
    }
    injector.add([SheetSkeletonManagerService, { useFactory: createSkeletonManager }]);
    injector.add([SheetScrollManagerService, { useFactory: createScrollManager }]);
    injector.add([MobileHoverRenderController, { useFactory: createMobileHoverController }]);
    const skeletonManager = injector.get(SheetSkeletonManagerService);
    skeletonManager.setCurrent({ sheetId: 'sheet-1' });
    const hoverManagerService = injector.get(HoverManagerService);
    vi.spyOn(hoverManagerService, 'triggerClick');
    vi.spyOn(hoverManagerService, 'triggerDbClick');
    const controller = injector.get(MobileHoverRenderController);
    return {
        controller,
        contextService: injector.get(IContextService),
        skeletonManager,
        hoverManagerService,
        onDblclick$,
        onPointerCancel$,
        onPointerDown$,
        onPointerEnter$,
        onPointerLeave$,
        onPointerMove$,
        onPointerUp$,
        validViewportScrollInfo$: injector.get(SheetScrollManagerService).validViewportScrollInfo$,
    };
}

function pointer(offsetX: number, offsetY: number, pointerId = 1): IMobilePointerTestEvent {
    return {
        isPrimary: true,
        offsetX,
        offsetY,
        clientX: offsetX + 100,
        clientY: offsetY + 200,
        pointerId,
        deviceType: DeviceType.Touch,
        timeStamp: performance.now(),
    };
}

describe('MobileHoverRenderController', () => {
    beforeEach(() => vi.useFakeTimers());

    afterEach(() => {
        testBeds.splice(0).forEach((bed) => bed.univer.dispose());
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('allows small finger movements and a wider gap between two taps', () => {
        const {
            controller,
            hoverManagerService,
            onPointerDown$,
            onPointerEnter$,
            onPointerLeave$,
            onPointerMove$,
            onPointerUp$,
        } = createController();

        onPointerDown$.emitEvent(pointer(20, 20));
        onPointerMove$.emitEvent(pointer(26, 20));
        onPointerUp$.emitEvent(pointer(26, 20));
        onPointerLeave$.emitEvent(pointer(26, 20));
        onPointerEnter$.emitEvent(pointer(40, 20));
        onPointerDown$.emitEvent(pointer(40, 20, 2));
        onPointerMove$.emitEvent(pointer(46, 20, 2));
        onPointerUp$.emitEvent(pointer(46, 20, 2));

        expect(hoverManagerService.triggerClick).toHaveBeenCalledTimes(2);
        expect(hoverManagerService.triggerDbClick).toHaveBeenCalledExactlyOnceWith('unit-1', pointer(46, 20, 2));

        controller.dispose();
    });

    it('clears the completed tap after a cancelled or scrolled gesture', () => {
        const {
            controller,
            hoverManagerService,
            onPointerCancel$,
            onPointerDown$,
            onPointerUp$,
            validViewportScrollInfo$,
        } = createController();

        onPointerDown$.emitEvent(pointer(20, 20));
        onPointerUp$.emitEvent(pointer(20, 20));
        onPointerCancel$.emitEvent(pointer(20, 20));
        onPointerDown$.emitEvent(pointer(20, 20));
        onPointerUp$.emitEvent(pointer(20, 20));
        validViewportScrollInfo$.next(null);
        onPointerDown$.emitEvent(pointer(20, 20));
        onPointerUp$.emitEvent(pointer(20, 20));

        expect(hoverManagerService.triggerDbClick).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('keeps a mouse engine double click inside the mobile gesture pipeline', () => {
        const { controller, hoverManagerService, onDblclick$ } = createController();
        const laterObserver = vi.fn();
        onDblclick$.subscribeEvent(laterObserver);

        const event = { ...pointer(20, 20), deviceType: DeviceType.Mouse };
        const result = onDblclick$.emitEvent(event);

        expect(hoverManagerService.triggerDbClick).toHaveBeenCalledExactlyOnceWith('unit-1', event);
        expect(laterObserver).not.toHaveBeenCalled();
        expect(result.stopPropagation).toBe(true);

        controller.dispose();
    });

    it.each([false, true])('does not treat a slide as a tap even when it returns to its origin (returns=%s)', (returns) => {
        const bed = createController();
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerMove$.emitEvent(pointer(31, 20));
        bed.onPointerUp$.emitEvent(pointer(returns ? 20 : 31, 20));
        bed.onDblclick$.emitEvent(pointer(20, 20));

        expect(bed.hoverManagerService.triggerDbClick).not.toHaveBeenCalled();
        expect(bed.hoverManagerService.triggerClick).toHaveBeenCalledTimes(1);
        bed.controller.dispose();
    });

    it.each([20, 21])('checks the independent inter-tap distance boundary (%spx)', (gap) => {
        const bed = createController();
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        bed.onPointerDown$.emitEvent(pointer(20 + gap, 20));
        bed.onPointerUp$.emitEvent(pointer(20 + gap, 20));

        expect(bed.hoverManagerService.triggerDbClick).toHaveBeenCalledTimes(gap === 20 ? 1 : 0);
        bed.controller.dispose();
    });

    it.each([false, true])('requires the same cell, treating a merged region as one cell (merged=%s)', (merged) => {
        const bed = createController(merged);
        const boundary = bed.skeletonManager.getCurrentSkeleton()!.getNoMergeCellWithCoordByIndex(0, 0).endX;
        bed.onPointerDown$.emitEvent(pointer(boundary - 1, 50));
        bed.onPointerUp$.emitEvent(pointer(boundary - 1, 50));
        bed.onPointerDown$.emitEvent(pointer(boundary + 1, 50));
        bed.onPointerUp$.emitEvent(pointer(boundary + 1, 50));
        bed.onDblclick$.emitEvent(pointer(boundary + 1, 50));

        expect(bed.hoverManagerService.triggerDbClick).toHaveBeenCalledTimes(merged ? 1 : 0);
        bed.controller.dispose();
    });

    it.each([500, 501, -1])('uses event timestamps even when expiry timers have not run (interval=%sms)', (interval) => {
        const bed = createController();
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent({ ...pointer(20, 20), timeStamp: 100 });
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent({ ...pointer(20, 20), timeStamp: 100 + interval });
        bed.onDblclick$.emitEvent(pointer(20, 20));

        expect(bed.hoverManagerService.triggerDbClick).toHaveBeenCalledTimes(interval === 500 ? 1 : 0);
        bed.controller.dispose();
    });

    it('expires a completed tap after the time window', () => {
        const bed = createController();
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        vi.advanceTimersByTime(501);
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));

        expect(bed.hoverManagerService.triggerDbClick).not.toHaveBeenCalled();
        bed.controller.dispose();
    });

    it.each([MOBILE_PINCH_ZOOMING, MOBILE_EXPANDING_SELECTION, MOBILE_TRIGGER_CONTEXT_MENU])('rejects taps interrupted by %s', (contextKey) => {
        const bed = createController();
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.contextService.setContextValue(contextKey, true);
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        bed.onDblclick$.emitEvent(pointer(20, 20));

        expect(bed.hoverManagerService.triggerDbClick).not.toHaveBeenCalled();
        bed.controller.dispose();
    });

    it('does not emit twice when the engine reports the same touch double click', () => {
        const bed = createController();
        for (let index = 0; index < 2; index += 1) {
            bed.onPointerDown$.emitEvent(pointer(20, 20));
            bed.onPointerUp$.emitEvent(pointer(20, 20));
        }
        const laterObserver = vi.fn();
        bed.onDblclick$.subscribeEvent(laterObserver);
        bed.onDblclick$.emitEvent(pointer(20, 20));

        expect(bed.hoverManagerService.triggerDbClick).toHaveBeenCalledTimes(1);
        expect(laterObserver).not.toHaveBeenCalled();
        bed.controller.dispose();
    });

    it('measures movement in screen pixels while resolving cells from canvas coordinates', () => {
        const bed = createController();
        const first = pointer(20, 20);
        const second = { ...pointer(70, 20), clientX: first.clientX + 16 };
        bed.onPointerDown$.emitEvent(first);
        bed.onPointerUp$.emitEvent(first);
        bed.onPointerDown$.emitEvent(second);
        bed.onPointerUp$.emitEvent(second);

        expect(bed.hoverManagerService.triggerDbClick).toHaveBeenCalledTimes(1);
        bed.controller.dispose();
    });

    it('clears a tap when its cell can no longer be resolved', () => {
        const bed = createController();
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        bed.skeletonManager.setCurrent({ sheetId: 'missing-sheet' });
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        bed.skeletonManager.setCurrent({ sheetId: 'sheet-1' });
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));

        expect(bed.hoverManagerService.triggerDbClick).not.toHaveBeenCalled();
        bed.controller.dispose();
    });

    it('clears the sequence when another finger joins the gesture', () => {
        const bed = createController();
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        bed.onPointerDown$.emitEvent(pointer(20, 20));
        bed.onPointerDown$.emitEvent({ ...pointer(22, 20, 2), isPrimary: false });
        bed.onPointerUp$.emitEvent(pointer(20, 20));
        bed.onDblclick$.emitEvent(pointer(20, 20));

        expect(bed.hoverManagerService.triggerDbClick).not.toHaveBeenCalled();
        bed.controller.dispose();
    });
});
