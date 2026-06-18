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

import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetsThreadCommentHoverController } from '../sheets-thread-comment-hover.controller';

afterEach(() => {
    vi.useRealTimers();
});

function createController(options?: { activePopup?: unknown; canView?: boolean; resolved?: boolean }) {
    const currentCell$ = new Subject<any>();
    const popupService = {
        activePopup: options?.activePopup ?? null,
        showPopup: vi.fn(),
        hidePopup: vi.fn(),
    };
    const controller = new SheetsThreadCommentHoverController(
        { currentCell$ } as never,
        popupService as never,
        {
            getByLocation: vi.fn(() => 'comment-1'),
            getComment: vi.fn(() => ({ id: 'comment-1', resolved: options?.resolved ?? false })),
        } as never,
        { permissionCheckWithRanges: vi.fn(() => options?.canView ?? true) } as never
    );

    return { controller, currentCell$, popupService };
}

describe('SheetsThreadCommentHoverController', () => {
    it('shows a temporary popup when hovering an unresolved visible comment marker', async () => {
        vi.useFakeTimers();
        const { controller, currentCell$, popupService } = createController();

        currentCell$.next({
            location: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                row: 2,
                col: 3,
            },
        });
        await vi.advanceTimersByTimeAsync(120);

        expect(popupService.showPopup).toHaveBeenCalledWith({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 2,
            col: 3,
            commentId: 'comment-1',
            temp: true,
        });

        controller.dispose();
    });

    it('does not replace a persistent popup and hides an existing temp popup when no marker exists', async () => {
        vi.useFakeTimers();
        const { controller, currentCell$, popupService } = createController({ activePopup: { temp: false } });
        currentCell$.next({
            location: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                row: 2,
                col: 3,
            },
        });
        await vi.advanceTimersByTimeAsync(120);

        expect(popupService.showPopup).not.toHaveBeenCalled();
        controller.dispose();

        const noMarkerCell$ = new Subject<any>();
        const tempPopupService = {
            activePopup: { temp: true },
            showPopup: vi.fn(),
            hidePopup: vi.fn(),
        };
        const noMarkerController = new SheetsThreadCommentHoverController(
            { currentCell$: noMarkerCell$ } as never,
            tempPopupService as never,
            { getByLocation: vi.fn(() => null), getComment: vi.fn() } as never,
            { permissionCheckWithRanges: vi.fn(() => true) } as never
        );

        noMarkerCell$.next({ location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 } });
        await vi.advanceTimersByTimeAsync(120);

        expect(tempPopupService.hidePopup).toHaveBeenCalled();
        noMarkerController.dispose();
    });
});
