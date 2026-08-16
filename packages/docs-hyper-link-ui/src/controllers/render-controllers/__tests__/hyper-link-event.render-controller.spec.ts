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

import { CustomRangeType } from '@univerjs/core';
import { config, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ClickDocHyperLinkOperation } from '../../../commands/operations/popup.operation';
import { DocHyperLinkEventRenderController } from '../hyper-link-event.render-controller';

describe('DocHyperLinkEventRenderController', () => {
    it('ignores hover ranges when the current selection has no text ranges', async () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const pointerDownCustomRanges$ = new Subject<unknown[]>();
        const onUnhandledError = vi.fn();
        const previousUnhandledError = config.onUnhandledError;
        const commandService = {
            executeCommand: vi.fn(),
        };
        config.onUnhandledError = onUnhandledError;

        try {
            const controller = new DocHyperLinkEventRenderController(
                { unitId: 'doc-unit' } as never,
                { hoverCustomRanges$, clickCustomRanges$, pointerDownCustomRanges$ } as never,
                commandService as never,
                { showing: false } as never,
                { getSkeleton: vi.fn() } as never,
                { getTextRanges: () => [] } as never
            );

            hoverCustomRanges$.next([]);
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(onUnhandledError).not.toHaveBeenCalled();
            expect(commandService.executeCommand).not.toHaveBeenCalled();

            controller.dispose();
        } finally {
            config.onUnhandledError = previousUnhandledError;
        }
    });

    it('opens document hyperlinks only with Ctrl or Command click', () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const pointerDownCustomRanges$ = new Subject<unknown[]>();
        const commandService = {
            executeCommand: vi.fn(),
        };
        const controller = new DocHyperLinkEventRenderController(
            { unitId: 'doc-unit' } as never,
            { hoverCustomRanges$, clickCustomRanges$, pointerDownCustomRanges$ } as never,
            commandService as never,
            { showing: false } as never,
            { getSkeleton: vi.fn() } as never,
            { getTextRanges: () => [] } as never
        );
        const clickedRange = {
            range: {
                rangeId: 'link-1',
                rangeType: CustomRangeType.HYPERLINK,
            },
            segmentId: 'header-1',
            segmentPageIndex: 0,
            rects: [],
        };

        clickCustomRanges$.next({ ...clickedRange, ctrlKey: false, metaKey: false });
        expect(commandService.executeCommand).not.toHaveBeenCalled();

        clickCustomRanges$.next({ ...clickedRange, ctrlKey: true, metaKey: false });
        expect(commandService.executeCommand).toHaveBeenLastCalledWith(ClickDocHyperLinkOperation.id, {
            unitId: 'doc-unit',
            linkId: 'link-1',
            segmentId: 'header-1',
        });

        commandService.executeCommand.mockClear();
        clickCustomRanges$.next({ ...clickedRange, ctrlKey: false, metaKey: true });
        expect(commandService.executeCommand).toHaveBeenCalledWith(ClickDocHyperLinkOperation.id, {
            unitId: 'doc-unit',
            linkId: 'link-1',
            segmentId: 'header-1',
        });

        controller.dispose();
    });

    it('hides the hyperlink popup immediately when pointer down is outside a hyperlink', () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const pointerDownCustomRanges$ = new Subject<unknown[]>();
        const commandService = {
            executeCommand: vi.fn(),
        };
        const hyperLinkPopupService = {
            showing: { linkId: 'link-1' },
            hideInfoPopupOnPointerDown: vi.fn(),
        };
        const controller = new DocHyperLinkEventRenderController(
            { unitId: 'doc-unit' } as never,
            { hoverCustomRanges$, clickCustomRanges$, pointerDownCustomRanges$ } as never,
            commandService as never,
            hyperLinkPopupService as never,
            { getSkeleton: vi.fn() } as never,
            { getTextRanges: () => [] } as never
        );

        pointerDownCustomRanges$.next([]);

        expect(hyperLinkPopupService.hideInfoPopupOnPointerDown).toHaveBeenCalledTimes(1);

        controller.dispose();
    });
});
