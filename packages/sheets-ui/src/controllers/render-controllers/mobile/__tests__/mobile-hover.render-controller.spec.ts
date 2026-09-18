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

import { EventSubject } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileHoverRenderController } from '../mobile-hover.render-controller';

interface IMobilePointerTestEvent {
    isPrimary: boolean;
    offsetX: number;
    offsetY: number;
    pointerId: number;
}

function createController() {
    const onPointerEnter$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerMove$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerDown$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerUp$ = new EventSubject<IMobilePointerTestEvent>();
    const onDblclick$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerLeave$ = new EventSubject<IMobilePointerTestEvent>();
    const onPointerCancel$ = new EventSubject<IMobilePointerTestEvent>();
    const validViewportScrollInfo$ = new Subject<unknown>();
    const contextValues = new Map<string, boolean>();
    const hoverManagerService = {
        triggerMouseMove: vi.fn(),
        triggerPointerDown: vi.fn(),
        triggerPointerUp: vi.fn(),
        triggerClick: vi.fn(),
        triggerDbClick: vi.fn(),
        triggerScroll: vi.fn(),
    };
    const controller = new MobileHoverRenderController(
        {
            mainComponent: {
                onPointerEnter$,
                onPointerMove$,
                onPointerDown$,
                onPointerUp$,
                onDblclick$,
                onPointerLeave$,
            },
            components: new Map(),
            scene: { onPointerCancel$ },
            unitId: 'unit-1',
        } as never,
        hoverManagerService as never,
        {
            getCurrentParam: vi.fn(() => ({})),
            currentSkeleton$: new Subject(),
        } as never,
        { validViewportScrollInfo$ } as never,
        { getContextValue: vi.fn((key: string) => contextValues.get(key) ?? false) } as never
    );

    return {
        controller,
        hoverManagerService,
        onDblclick$,
        onPointerCancel$,
        onPointerDown$,
        onPointerEnter$,
        onPointerLeave$,
        onPointerMove$,
        onPointerUp$,
        validViewportScrollInfo$,
    };
}

function pointer(offsetX: number, offsetY: number, pointerId = 1): IMobilePointerTestEvent {
    return { isPrimary: true, offsetX, offsetY, pointerId };
}

describe('MobileHoverRenderController', () => {
    beforeEach(() => vi.useFakeTimers());

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('recognizes a double tap with the same 10px tolerance before and between taps', () => {
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
        onPointerEnter$.emitEvent(pointer(28, 20));
        onPointerDown$.emitEvent(pointer(28, 20));
        onPointerMove$.emitEvent(pointer(34, 20));
        onPointerUp$.emitEvent(pointer(34, 20));

        expect(hoverManagerService.triggerClick).toHaveBeenCalledTimes(2);
        expect(hoverManagerService.triggerDbClick).toHaveBeenCalledExactlyOnceWith('unit-1', 34, 20);

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
        validViewportScrollInfo$.next({});
        onPointerDown$.emitEvent(pointer(20, 20));
        onPointerUp$.emitEvent(pointer(20, 20));

        expect(hoverManagerService.triggerDbClick).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('keeps an engine double click inside the mobile gesture pipeline', () => {
        const { controller, hoverManagerService, onDblclick$ } = createController();
        const laterObserver = vi.fn();
        onDblclick$.subscribeEvent(laterObserver);

        const result = onDblclick$.emitEvent(pointer(20, 20));

        expect(hoverManagerService.triggerDbClick).toHaveBeenCalledExactlyOnceWith('unit-1', 20, 20);
        expect(laterObserver).not.toHaveBeenCalled();
        expect(result.stopPropagation).toBe(true);

        controller.dispose();
    });
});
