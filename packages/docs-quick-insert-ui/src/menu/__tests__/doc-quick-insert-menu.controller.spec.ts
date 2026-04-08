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

import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocQuickInsertMenuController } from '../doc-quick-insert-menu.controller';

function createParagraph(startIndex: number, paragraphEnd = startIndex) {
    return {
        startIndex,
        paragraphStart: startIndex,
        paragraphEnd,
        firstLine: { left: 1, top: 2, right: 10, bottom: 12 },
    };
}

describe('DocQuickInsertMenuController', () => {
    it('shows the quick insert button for empty paragraphs and hides it when the line is no longer eligible', () => {
        const hoverParagraphLeftRealTime$ = new BehaviorSubject<ReturnType<typeof createParagraph> | null>(null);
        const hoverParagraphRealTime$ = new BehaviorSubject<ReturnType<typeof createParagraph> | null>(null);
        const firstDisposable = { dispose: vi.fn(), canDispose: vi.fn(() => true) };
        const secondDisposable = { dispose: vi.fn(), canDispose: vi.fn(() => true) };
        const attachPopupToRect = vi.fn()
            .mockReturnValueOnce(firstDisposable)
            .mockReturnValueOnce(secondDisposable);

        const controller = new DocQuickInsertMenuController(
            {
                unit: {
                    getDisabled: () => false,
                    getUnitId: () => 'doc-1',
                },
            } as never,
            { hoverParagraphLeftRealTime$, hoverParagraphRealTime$ } as never,
            { editPopup: null } as never,
            { attachPopupToRect } as never
        );

        const emptyParagraph = createParagraph(6);
        hoverParagraphRealTime$.next(emptyParagraph);

        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
        expect(controller.popup).toEqual({ startIndex: 6, disposable: firstDisposable });

        hoverParagraphRealTime$.next(emptyParagraph);
        expect(attachPopupToRect).toHaveBeenCalledTimes(1);

        hoverParagraphRealTime$.next(createParagraph(6, 9));
        expect(firstDisposable.dispose).toHaveBeenCalledTimes(1);
        expect(controller.popup).toBeNull();

        hoverParagraphLeftRealTime$.next(createParagraph(8));
        expect(attachPopupToRect).toHaveBeenCalledTimes(2);
        expect(controller.popup).toEqual({ startIndex: 8, disposable: secondDisposable });

        controller.dispose();
    });

    it('keeps the left-side button mounted while the edit popup itself is active', () => {
        const hoverParagraphLeftRealTime$ = new BehaviorSubject<ReturnType<typeof createParagraph> | null>(createParagraph(3));
        const hoverParagraphRealTime$ = new BehaviorSubject<ReturnType<typeof createParagraph> | null>(null);
        const disposable = { dispose: vi.fn(), canDispose: vi.fn(() => true) };
        const quickInsertPopupService = {
            editPopup: null as { anchor: number } | null,
        };

        const controller = new DocQuickInsertMenuController(
            {
                unit: {
                    getDisabled: () => false,
                    getUnitId: () => 'doc-1',
                },
            } as never,
            { hoverParagraphLeftRealTime$, hoverParagraphRealTime$ } as never,
            quickInsertPopupService as never,
            { attachPopupToRect: vi.fn(() => disposable) } as never
        );

        quickInsertPopupService.editPopup = { anchor: 3 };
        hoverParagraphLeftRealTime$.next(null);
        hoverParagraphRealTime$.next(null);

        expect(disposable.dispose).not.toHaveBeenCalled();
        expect(controller.popup).toEqual({ startIndex: 3, disposable });

        controller.dispose();
    });
});
