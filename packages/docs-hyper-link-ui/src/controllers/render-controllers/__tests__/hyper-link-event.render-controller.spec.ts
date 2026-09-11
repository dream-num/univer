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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import { CustomRangeType, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, Univer } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocEventManagerService } from '@univerjs/docs-ui';
import { config, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DeleteDocHyperLinkCommand } from '../../../commands/commands/delete-link.command';
import { ClickDocHyperLinkOperation } from '../../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../../services/hyper-link-popup.service';
import { DocHyperLinkEventRenderController } from '../hyper-link-event.render-controller';
import { MobileDocHyperLinkEventRenderController } from '../mobile/hyper-link-event.render-controller';

function createController(
    context: IRenderContext<DocumentDataModel>,
    events: DocEventManagerService,
    commands: ICommandService,
    popup: DocHyperLinkPopupService,
    skeleton: DocSkeletonManagerService,
    selection: DocSelectionManagerService
) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([DocEventManagerService, { useValue: events }]);
    injector.add([DocHyperLinkPopupService, { useValue: popup }]);
    injector.add([DocSkeletonManagerService, { useValue: skeleton }]);
    injector.add([DocSelectionManagerService, { useValue: selection }]);
    const child = injector.createChild([[ICommandService, { useValue: commands }]]);
    const controller = child.createInstance(DocHyperLinkEventRenderController, context);
    controller.disposeWithMe(() => univer.dispose());
    return controller;
}

describe('DocHyperLinkEventRenderController', () => {
    it('keeps the mobile event controller independent from the desktop controller', () => {
        expect(MobileDocHyperLinkEventRenderController.prototype).not.toBeInstanceOf(DocHyperLinkEventRenderController);
    });

    it('handles hyperlink menus and clicks in the standalone mobile controller', async () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const pointerDownCustomRanges$ = new Subject<unknown[]>();
        const commandService = { executeCommand: vi.fn() };
        const popupService = {
            canEditLink: vi.fn(() => true),
            hideInfoPopupOnPointerDown: vi.fn(),
            showEditPopup: vi.fn(),
            showInfoPopup: vi.fn(),
        };
        const capture = vi.fn<(target: { onEdit: () => unknown; onDelete: () => unknown }) => boolean>(() => true);
        const controller = new MobileDocHyperLinkEventRenderController(
            { unitId: 'doc-unit' } as never,
            { hoverCustomRanges$, clickCustomRanges$, pointerDownCustomRanges$ } as never,
            commandService as never,
            popupService as never,
            { getSkeleton: vi.fn() } as never,
            { capture } as never
        );
        const linkRange = {
            range: {
                rangeId: 'link-1',
                rangeType: CustomRangeType.HYPERLINK,
                startIndex: 4,
                endIndex: 10,
            },
            segmentId: 'header-1',
            segmentPageIndex: 0,
            rects: [{ left: 10, top: 20, right: 50, bottom: 40 }],
        };

        pointerDownCustomRanges$.next([linkRange]);
        const target = capture.mock.calls[0][0];
        await target.onEdit();
        await target.onDelete();

        expect(popupService.showEditPopup).toHaveBeenCalledWith('doc-unit', {
            unitId: 'doc-unit',
            linkId: 'link-1',
            segmentId: 'header-1',
            segmentPage: 0,
            startIndex: 4,
            endIndex: 10,
        });
        expect(commandService.executeCommand).toHaveBeenCalledWith(DeleteDocHyperLinkCommand.id, {
            unitId: 'doc-unit',
            linkId: 'link-1',
            segmentId: 'header-1',
            segmentPage: 0,
            startIndex: 4,
            endIndex: 10,
        });

        clickCustomRanges$.next({ ...linkRange, ctrlKey: false, metaKey: false });
        expect(popupService.showInfoPopup).toHaveBeenCalledWith(
            expect.objectContaining({ unitId: 'doc-unit', linkId: 'link-1' }),
            { pinned: true }
        );

        commandService.executeCommand.mockClear();
        clickCustomRanges$.next({ ...linkRange, ctrlKey: true, metaKey: false });
        expect(commandService.executeCommand).toHaveBeenCalledWith(ClickDocHyperLinkOperation.id, {
            unitId: 'doc-unit',
            linkId: 'link-1',
            segmentId: 'header-1',
        });

        pointerDownCustomRanges$.next([]);
        expect(popupService.hideInfoPopupOnPointerDown).toHaveBeenCalledOnce();
        controller.dispose();

        capture.mockClear();
        popupService.showInfoPopup.mockClear();
        pointerDownCustomRanges$.next([linkRange]);
        clickCustomRanges$.next({ ...linkRange, ctrlKey: false, metaKey: false });
        expect(capture).not.toHaveBeenCalled();
        expect(popupService.showInfoPopup).not.toHaveBeenCalled();
    });

    it('does not register mobile hyperlink events for the normal internal editor', () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const pointerDownCustomRanges$ = new Subject<unknown[]>();
        const capture = vi.fn();
        const showInfoPopup = vi.fn();
        const controller = new MobileDocHyperLinkEventRenderController(
            { unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY } as never,
            { hoverCustomRanges$, clickCustomRanges$, pointerDownCustomRanges$ } as never,
            { executeCommand: vi.fn() } as never,
            { showInfoPopup } as never,
            { getSkeleton: vi.fn() } as never,
            { capture } as never
        );

        pointerDownCustomRanges$.next([{
            range: { rangeType: CustomRangeType.HYPERLINK },
            rects: [{ left: 0, top: 0, right: 1, bottom: 1 }],
        }]);
        clickCustomRanges$.next({
            range: { rangeType: CustomRangeType.HYPERLINK },
            ctrlKey: false,
            metaKey: false,
        });

        expect(capture).not.toHaveBeenCalled();
        expect(showInfoPopup).not.toHaveBeenCalled();
        controller.dispose();
    });

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
            const controller = createController(
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

    it('shows hyperlink details on click and opens only with Ctrl or Command click', () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const pointerDownCustomRanges$ = new Subject<unknown[]>();
        const commandService = {
            executeCommand: vi.fn(),
        };
        const hyperLinkPopupService = {
            showing: false,
            showInfoPopup: vi.fn(),
        };
        const controller = createController(
            { unitId: 'doc-unit' } as never,
            { hoverCustomRanges$, clickCustomRanges$, pointerDownCustomRanges$ } as never,
            commandService as never,
            hyperLinkPopupService as never,
            { getSkeleton: vi.fn() } as never,
            { getTextRanges: () => [] } as never
        );
        const clickedRange = {
            range: {
                rangeId: 'link-1',
                rangeType: CustomRangeType.HYPERLINK,
                startIndex: 4,
                endIndex: 10,
            },
            segmentId: 'header-1',
            segmentPageIndex: 0,
            rects: [],
        };

        clickCustomRanges$.next({ ...clickedRange, ctrlKey: false, metaKey: false });
        expect(commandService.executeCommand).not.toHaveBeenCalled();
        expect(hyperLinkPopupService.showInfoPopup).toHaveBeenCalledWith(
            {
                unitId: 'doc-unit',
                linkId: 'link-1',
                segmentId: 'header-1',
                segmentPage: 0,
                startIndex: 4,
                endIndex: 10,
            },
            { pinned: true }
        );

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

    it('keeps click-pinned hyperlink details visible when the pointer leaves the link', () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const pointerDownCustomRanges$ = new Subject<unknown[]>();
        const commandService = {
            executeCommand: vi.fn(),
        };
        const hyperLinkPopupService = {
            showing: false as false | { linkId: string },
            infoPopupPinned: false,
            showInfoPopup: vi.fn(function (this: { showing: false | { linkId: string }; infoPopupPinned: boolean }, _info, options?: { pinned?: boolean }) {
                this.showing = { linkId: 'link-1' };
                this.infoPopupPinned = options?.pinned ?? false;
            }),
        };
        const controller = createController(
            { unitId: 'doc-unit' } as never,
            { hoverCustomRanges$, clickCustomRanges$, pointerDownCustomRanges$ } as never,
            commandService as never,
            hyperLinkPopupService as never,
            { getSkeleton: vi.fn() } as never,
            { getTextRanges: () => [] } as never
        );
        const clickedRange = {
            range: {
                rangeId: 'link-1',
                rangeType: CustomRangeType.HYPERLINK,
                startIndex: 4,
                endIndex: 10,
            },
            segmentId: '',
            segmentPageIndex: 0,
            rects: [],
            ctrlKey: false,
            metaKey: false,
        };

        clickCustomRanges$.next(clickedRange);
        hoverCustomRanges$.next([]);

        expect(hyperLinkPopupService.infoPopupPinned).toBe(true);
        expect(commandService.executeCommand).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('schedules hover-opened hyperlink details to close when the pointer leaves the link', () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const pointerDownCustomRanges$ = new Subject<unknown[]>();
        const commandService = {
            executeCommand: vi.fn(),
        };
        const hyperLinkPopupService = {
            showing: { linkId: 'link-1' },
            infoPopupPinned: false,
            scheduleHideInfoPopup: vi.fn(),
        };
        const controller = createController(
            { unitId: 'doc-unit' } as never,
            { hoverCustomRanges$, clickCustomRanges$, pointerDownCustomRanges$ } as never,
            commandService as never,
            hyperLinkPopupService as never,
            { getSkeleton: vi.fn() } as never,
            { getTextRanges: () => [] } as never
        );

        hoverCustomRanges$.next([]);

        expect(hyperLinkPopupService.scheduleHideInfoPopup).toHaveBeenCalledTimes(1);
        expect(commandService.executeCommand).not.toHaveBeenCalled();

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
        const controller = createController(
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
