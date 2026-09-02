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

import {
    IPermissionService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, setDocumentPermissionValue } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { describe, expect, it, vi } from 'vitest';
import { DocHyperLinkPopupService } from '../hyper-link-popup.service';

class CapturingDocCanvasPopManagerService {
    readonly attached: unknown[] = [];
    readonly disposed: number[] = [];

    attachPopupToRange(range: unknown, popup: unknown, unitId: string) {
        this.attached.push({ range, popup, unitId });
        const order = this.attached.length;
        return { dispose: () => this.disposed.push(order) };
    }
}

const CapturingDocCanvasPopManagerServiceCtor = CapturingDocCanvasPopManagerService as unknown as typeof DocCanvasPopManagerService;

function createService() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([DocCanvasPopManagerService, { useClass: CapturingDocCanvasPopManagerServiceCtor }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocHyperLinkPopupService]);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'doc-1' });
    const selectionManager = injector.get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'doc-1', subUnitId: 'doc-1' });
    const popupManager = injector.get(DocCanvasPopManagerService) as unknown as CapturingDocCanvasPopManagerService;
    const permissionService = injector.get(IPermissionService);
    const renderManagerService = injector.get(IRenderManagerService);

    return {
        service: injector.get(DocHyperLinkPopupService),
        selectionManager,
        attached: popupManager.attached,
        disposed: popupManager.disposed,
        disposeRender: (unitId: string) => {
            renderManagerService.addRender(unitId, {
                unitId,
                type: UniverInstanceType.UNIVER_DOC,
                components: new Map(),
                engine: { dispose: () => {} },
                scene: { dispose: () => {} },
                dispose: () => {},
            } as never);
            renderManagerService.removeRender(unitId);
        },
        permissionService,
    };
}

describe('DocHyperLinkPopupService', () => {
    it('closes link popups only when their owning Render is disposed', () => {
        const { service, disposed, disposeRender } = createService();
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        service.showEditPopup('doc-1', link);
        service.showInfoPopup(link);
        disposeRender('doc-2');
        expect(disposed).toEqual([]);

        disposeRender('doc-1');
        expect(disposed).toEqual([1, 2]);
    });

    it('releases owned link popups when the service is disposed', () => {
        const { service, disposed } = createService();
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        service.showEditPopup('doc-1', link);
        service.showInfoPopup(link);
        service.dispose();

        expect(disposed).toEqual([1, 2]);
    });

    it('opens edit and info popups around the selected document link and disposes previous popups', () => {
        const { service, selectionManager, attached, disposed } = createService();
        const refreshes: unknown[] = [];
        const refreshSub = selectionManager.refreshSelection$.subscribe((value) => refreshes.push(value));
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        service.showEditPopup('doc-1', link);
        expect(service.editing).toEqual(link);
        expect(refreshes.at(-1)).toMatchObject({ docRanges: [{ startOffset: 4, endOffset: 9 }] });
        expect(attached).toMatchObject([{
            range: { startOffset: 4, endOffset: 9, collapsed: false },
            popup: { offset: [0, 10] },
            unitId: 'doc-1',
        }]);

        service.showInfoPopup(link);
        expect(service.showing).toEqual(link);
        expect(attached.at(-1)).toMatchObject({
            range: { startOffset: 4, endOffset: 9, collapsed: false },
            popup: { offset: [0, 10] },
            unitId: 'doc-1',
        });

        service.hideEditPopup();
        service.hideInfoPopup();
        expect(service.editing).toBeNull();
        expect(service.showing).toBeNull();
        expect(disposed).toEqual([1, 2]);

        refreshSub.unsubscribe();
    });

    it('opens the edit popup from the current text selection when creating a new hyperlink', () => {
        const { service, selectionManager, attached, disposed } = createService();
        selectionManager.__TEST_ONLY_add([{
            startOffset: 1,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
        }]);

        const firstPopup = service.showEditPopup('doc-1', null);
        const secondPopup = service.showEditPopup('doc-1', null);

        expect(firstPopup).not.toBeNull();
        expect(secondPopup).not.toBeNull();
        expect(service.editing).toBeNull();
        expect(attached).toMatchObject([
            { range: { startOffset: 1, endOffset: 5, collapsed: false }, unitId: 'doc-1' },
            { range: { startOffset: 1, endOffset: 5, collapsed: false }, unitId: 'doc-1' },
        ]);
        expect(disposed).toEqual([1]);
    });

    it('reuses an already visible link popup and replaces it only when the hovered link changes', () => {
        const { service, attached, disposed } = createService();
        const firstLink = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };
        const secondLink = {
            unitId: 'doc-1',
            linkId: 'link-2',
            startIndex: 0,
            endIndex: 3,
        };

        const firstPopup = service.showInfoPopup(firstLink);
        const duplicatePopup = service.showInfoPopup(firstLink);
        const secondPopup = service.showInfoPopup(secondLink);

        expect(firstPopup).not.toBeNull();
        expect(duplicatePopup).toBeUndefined();
        expect(secondPopup).not.toBeNull();
        expect(attached).toHaveLength(2);
        expect(service.showing).toEqual(secondLink);
        expect(disposed).toEqual([1]);
    });

    it('keeps a click-pinned popup pinned until another link replaces it or it closes', () => {
        const { service } = createService();
        const firstLink = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };
        const secondLink = {
            unitId: 'doc-1',
            linkId: 'link-2',
            startIndex: 0,
            endIndex: 3,
        };

        service.showInfoPopup(firstLink, { pinned: true });
        expect(service.infoPopupPinned).toBe(true);

        service.showInfoPopup({ ...firstLink, segmentId: '' });
        expect(service.infoPopupPinned).toBe(true);
        expect(service.showing).toEqual(firstLink);

        service.showInfoPopup(secondLink);
        expect(service.infoPopupPinned).toBe(false);

        service.hideInfoPopup();
        expect(service.infoPopupPinned).toBe(false);
    });

    it('keeps a hovered popup visible while the pointer crosses to it and closes after the handoff delay', () => {
        vi.useFakeTimers();
        const { service, disposed } = createService();
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        try {
            service.showInfoPopup(link);
            service.scheduleHideInfoPopup();
            vi.advanceTimersByTime(149);
            expect(service.showing).toEqual(link);

            service.cancelScheduledHideInfoPopup();
            vi.advanceTimersByTime(1);
            expect(service.showing).toEqual(link);

            service.scheduleHideInfoPopup();
            vi.advanceTimersByTime(150);
            expect(service.showing).toBeNull();
            expect(disposed).toEqual([1]);
        } finally {
            service.dispose();
            vi.useRealTimers();
        }
    });

    it('does not show link information when the target document is not loaded', () => {
        const { service, attached } = createService();

        const popup = service.showInfoPopup({
            unitId: 'missing-doc',
            linkId: 'link-1',
            startIndex: 0,
            endIndex: 4,
        });

        expect(popup).toBeUndefined();
        expect(service.showing).toBeNull();
        expect(attached).toEqual([]);
    });

    it('hides the link information popup when the user clicks outside it', () => {
        const { service, attached, disposed } = createService();
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        service.showInfoPopup(link);
        const popupConfig = (attached[0] as { popup: { onClickOutside: () => void } }).popup;
        popupConfig.onClickOutside();

        expect(service.showing).toBeNull();
        expect(disposed).toEqual([1]);
    });

    it('prevents a stale selection refresh from restoring a popup closed on pointer down', async () => {
        const { service, attached, disposed } = createService();
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        service.showInfoPopup(link);
        service.hideInfoPopupOnPointerDown();
        service.showInfoPopup(link);

        expect(service.showing).toBeNull();
        expect(attached).toHaveLength(1);
        expect(disposed).toEqual([1]);

        await new Promise((resolve) => setTimeout(resolve, 0));
        service.showInfoPopup(link);

        expect(service.showing).toEqual(link);
        expect(attached).toHaveLength(2);
    });

    it('does not open an edit popup without document edit permission', () => {
        const { service, attached, permissionService } = createService();
        setDocumentPermissionValue(
            permissionService,
            'doc-1',
            'doc-1',
            UnitAction.Edit,
            false
        );

        expect(service.showEditPopup('doc-1', null)).toBeNull();
        expect(attached).toEqual([]);
    });
});
