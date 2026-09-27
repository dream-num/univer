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

/** @vitest-environment jsdom */

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import { IPermissionService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    setDocumentPermissionValue,
} from '@univerjs/docs';
import { DocCanvasPopManagerService, registerEditorRuntimeConfig } from '@univerjs/docs-ui';
import { Documents, FontCache, IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import {
    CanvasPopupService,
    DesktopDialogService,
    ICanvasPopupService,
    IDialogService,
    IUIPartsService,
    UIPartsService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../locale/en-US';
import { DocHyperLinkPopupService } from '../hyper-link-popup.service';

const instances = new Set<Univer>();
afterEach(() => {
    for (const univer of instances) {
        univer.dispose();
    }
    instances.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
});

function createService() {
    // Canvas is the unavailable platform boundary; document and popup services stay real.
    const context = new Proxy({ webkitBackingStorePixelRatio: 1, measureText: (text: string) => ({ width: text.length * 8, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 2, fontBoundingBoxAscent: 10, fontBoundingBoxDescent: 2 }) }, {
        get: (target, key) => key in target ? Reflect.get(target, key) : () => {},
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    Reflect.set(FontCache, '_context', null);
    FontCache.invalidateMetrics(() => true);
    const univer = new Univer();
    instances.add(univer);
    univer.registerPlugin(UniverRenderEnginePlugin);
    const injector = univer.__getInjector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IDialogService, { useClass: DesktopDialogService }]);
    injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
    injector.add([DocCanvasPopManagerService]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocHyperLinkPopupService]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'doc-1',
        body: { dataStream: 'first link and second link\r\n', paragraphs: [{ startIndex: 26, paragraphId: 'paragraph' }], sectionBreaks: [{ startIndex: 27, sectionId: 'section' }] },
        documentStyle: { pageSize: { width: 400, height: 300 } },
    });
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'doc-2' });
    const manager = injector.get(IRenderManagerService);
    const render = manager.createRender('doc-1') as RenderUnit;
    render.deactivate();
    render.engine.resizeBySize(500, 500);
    vi.spyOn(render.engine.getCanvasElement(), 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 500, 500));
    render.addRenderDependencies([[DocSkeletonManagerService]]);
    const documents = new Documents('doc-1', render.with(DocSkeletonManagerService).getSkeleton());
    render.mainComponent = documents;
    render.scene.addObject(documents);
    manager.createRender('doc-2').deactivate();
    const selectionManager = injector.get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'doc-1', subUnitId: 'doc-1' });
    const attach = vi.spyOn(injector.get(DocCanvasPopManagerService), 'attachPopupToRange');
    const canvasPopup = injector.get(ICanvasPopupService);
    const add = vi.spyOn(canvasPopup, 'addPopup');
    const remove = vi.spyOn(canvasPopup, 'removePopup');
    return {
        injector,
        registerCustomHyperLinkUI: () => registerEditorRuntimeConfig(model, { customHyperLinkUI: true }),
        dispose: () => univer.dispose(),
        selectionManager,
        attached: () => attach.mock.calls.map(([range, popup, unitId]) => ({ range, popup, unitId })),
        disposed: () => remove.mock.calls.map(([id]) => add.mock.results.findIndex((result) => result.value === id) + 1),
        disposeRender: (unitId: string) => manager.removeRender(unitId),
        permissionService: injector.get(IPermissionService),
    };
}

describe('DocHyperLinkPopupService', () => {
    it('leaves hyperlink menus to the host editor and restores default behavior after unregistering', () => {
        const { injector, attached, registerCustomHyperLinkUI, dispose } = createService();
        const service = injector.get(DocHyperLinkPopupService);
        const ownership = registerCustomHyperLinkUI();
        const link = { unitId: 'doc-1', linkId: 'link-1', startIndex: 0, endIndex: 3 };
        try {
            service.showInfoPopup(link);
            service.showInfoPopupFromHover(link);
            service.showInfoPopup(link, { pinned: true });
            service.showEditPopup('doc-1', link);
            expect(attached()).toHaveLength(0);
            expect(service.showing).toBeNull();
            expect(service.editing).toBeNull();
            ownership.dispose();
            service.showInfoPopup(link);
            expect(attached()).toHaveLength(1);
            expect(service.showing?.linkId).toBe('link-1');
        } finally {
            ownership.dispose();
            dispose();
        }
    });

    it('closes link popups only when their owning Render is disposed', () => {
        const { injector, disposed, disposeRender } = createService();
        const service = injector.get(DocHyperLinkPopupService);
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        service.showEditPopup('doc-1', link);
        service.showInfoPopup(link);
        disposeRender('doc-2');
        expect(disposed()).toEqual([]);

        disposeRender('doc-1');
        expect(disposed()).toEqual([1, 2]);
    });

    it('releases owned link popups when the service is disposed', () => {
        const { injector, disposed } = createService();
        const service = injector.get(DocHyperLinkPopupService);
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        service.showEditPopup('doc-1', link);
        service.showInfoPopup(link);
        service.dispose();

        expect(disposed()).toEqual([1, 2]);
    });

    it('opens edit and info popups around the selected document link and disposes previous popups', () => {
        const { injector, selectionManager, attached, disposed } = createService();
        const service = injector.get(DocHyperLinkPopupService);
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
        expect(attached()).toMatchObject([{
            range: { startOffset: 4, endOffset: 9, collapsed: false },
            popup: { offset: [0, 10] },
            unitId: 'doc-1',
        }]);

        service.showInfoPopup(link);
        expect(service.showing).toEqual(link);
        expect(attached().at(-1)).toMatchObject({
            range: { startOffset: 4, endOffset: 9, collapsed: false },
            popup: { offset: [0, 10] },
            unitId: 'doc-1',
        });

        service.hideEditPopup();
        service.hideInfoPopup();
        expect(service.editing).toBeNull();
        expect(service.showing).toBeNull();
        expect(disposed()).toEqual([1, 2]);

        refreshSub.unsubscribe();
    });

    it('opens the edit popup from the current text selection when creating a new hyperlink', () => {
        const { injector, selectionManager, attached, disposed } = createService();
        const service = injector.get(DocHyperLinkPopupService);
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
        expect(attached()).toMatchObject([
            { range: { startOffset: 1, endOffset: 5, collapsed: false }, unitId: 'doc-1' },
            { range: { startOffset: 1, endOffset: 5, collapsed: false }, unitId: 'doc-1' },
        ]);
        expect(disposed()).toEqual([1]);
    });

    it('reuses an already visible link popup and replaces it only when the hovered link changes', () => {
        const { injector, attached, disposed } = createService();
        const service = injector.get(DocHyperLinkPopupService);
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
        expect(attached()).toHaveLength(2);
        expect(service.showing).toEqual(secondLink);
        expect(disposed()).toEqual([1]);
    });

    it('keeps a click-pinned popup pinned until another link replaces it or it closes', () => {
        const { injector } = createService();
        const service = injector.get(DocHyperLinkPopupService);
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
        const { injector, disposed } = createService();
        const service = injector.get(DocHyperLinkPopupService);
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
            expect(disposed()).toEqual([1]);
        } finally {
            service.dispose();
            vi.useRealTimers();
        }
    });

    it('keeps the current popup while the pointer crosses adjacent links', () => {
        const { injector, attached, disposed } = createService();
        const service = injector.get(DocHyperLinkPopupService);
        const firstLink = { unitId: 'doc-1', linkId: 'link-1', startIndex: 4, endIndex: 8 };
        const secondLink = { unitId: 'doc-1', linkId: 'link-2', startIndex: 9, endIndex: 13 };

        service.showInfoPopup(firstLink);
        service.showInfoPopupFromHover(secondLink);

        expect(service.showing).toEqual(firstLink);
        expect(attached()).toHaveLength(1);
        expect(disposed()).toEqual([]);

        service.hideInfoPopup();
        service.showInfoPopupFromHover(secondLink);
        expect(service.showing).toEqual(secondLink);
        expect(attached()).toHaveLength(2);
        expect(disposed()).toEqual([1]);

        service.dispose();
    });

    it('does not show link information when the target document is not loaded', () => {
        const { injector, attached } = createService();
        const service = injector.get(DocHyperLinkPopupService);

        const popup = service.showInfoPopup({
            unitId: 'missing-doc',
            linkId: 'link-1',
            startIndex: 0,
            endIndex: 4,
        });

        expect(popup).toBeUndefined();
        expect(service.showing).toBeNull();
        expect(attached()).toEqual([]);
    });

    it('hides the link information popup when the user clicks outside it', () => {
        const { injector, attached, disposed } = createService();
        const service = injector.get(DocHyperLinkPopupService);
        const link = {
            unitId: 'doc-1',
            linkId: 'link-1',
            startIndex: 4,
            endIndex: 8,
        };

        service.showInfoPopup(link);
        attached()[0].popup.onClickOutside?.(new MouseEvent('click'));

        expect(service.showing).toBeNull();
        expect(disposed()).toEqual([1]);
    });

    it('prevents a stale selection refresh from restoring a popup closed on pointer down', async () => {
        const { injector, attached, disposed } = createService();
        const service = injector.get(DocHyperLinkPopupService);
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
        expect(attached()).toHaveLength(1);
        expect(disposed()).toEqual([1]);

        await new Promise((resolve) => setTimeout(resolve, 0));
        service.showInfoPopup(link);

        expect(service.showing).toEqual(link);
        expect(attached()).toHaveLength(2);
    });

    it('does not open an edit popup without document edit permission', () => {
        const { injector, attached, permissionService } = createService();
        const service = injector.get(DocHyperLinkPopupService);
        setDocumentPermissionValue(
            permissionService,
            'doc-1',
            'doc-1',
            UnitAction.Edit,
            false
        );

        expect(service.showEditPopup('doc-1', null)).toBeNull();
        expect(attached()).toEqual([]);
    });
});
