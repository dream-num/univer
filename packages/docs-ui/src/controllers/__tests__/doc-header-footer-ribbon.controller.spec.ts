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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import { DocumentFlavor, IUniverInstanceService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { CanvasColorService, DocumentEditArea, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { DesktopRibbonService, IMenuManagerService, IRibbonService, MenuManagerPosition, MenuManagerService, RibbonPosition } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../locale/en-US';
import { headerFooterRibbonSchema } from '../../menu/header-footer-ribbon';
import { DOC_HEADER_FOOTER_RIBBON_TAB } from '../../views/header-footer/panel/component-name';
import { DocHeaderFooterRibbonController } from '../doc-header-footer-ribbon.controller';

const cleanups: Array<() => void> = [];
afterEach(() => {
    cleanups.splice(0).reverse().forEach((dispose) => dispose());
    vi.useRealTimers();
});

function createTestBed() {
    vi.useFakeTimers();
    const univer = new Univer();
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    injector.add([IRibbonService, { useClass: DesktopRibbonService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const menus = injector.get(IMenuManagerService);
    menus.mergeMenu(headerFooterRibbonSchema);
    for (const tab of [RibbonPosition.START, RibbonPosition.INSERT]) {
        menus.mergeMenu({ [MenuManagerPosition.RIBBON]: { [tab]: { group: { item: { menuItemFactory: () => ({ id: tab, type: 0 }) } } } } });
    }
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'ribbon-doc',
        body: { dataStream: 'A\r\n', paragraphs: [{ paragraphId: 'ribbon-paragraph', startIndex: 1 }] },
        documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 300, height: 400 } },
    });
    const instances = injector.get(IUniverInstanceService);
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
    render.deactivate();
    render.addRenderDependencies([[DocSkeletonManagerService], [DocHeaderFooterRibbonController]]);
    const controller = render.with(DocHeaderFooterRibbonController);
    const view = render.with(DocSkeletonManagerService).getViewModel();
    const ribbon = injector.get(IRibbonService);
    const state = { active: '', tabs: [] as string[] };
    const active = ribbon.activatedTab$.subscribe((tab) => state.active = tab);
    const visible = ribbon.ribbon$.subscribe((tabs) => state.tabs = tabs.map((tab) => tab.key));
    cleanups.push(() => {
        active.unsubscribe();
        visible.unsubscribe();
    });
    instances.focusUnit(model.getUnitId());
    return { univer, injector, instances, view, ribbon, state, controller };
}

describe('DocHeaderFooterRibbonController', () => {
    it('keeps the tab visible when focus moves between editing documents in either registration order', () => {
        const { univer, injector, instances, view, state } = createTestBed();
        const second = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: 'second-ribbon-doc',
            body: { dataStream: 'B\r\n', paragraphs: [{ paragraphId: 'second-paragraph', startIndex: 1 }] },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const render = injector.get(IRenderManagerService).createRender(second.getUnitId()) as RenderUnit;
        render.deactivate();
        render.addRenderDependencies([[DocSkeletonManagerService], [DocHeaderFooterRibbonController]]);
        render.with(DocHeaderFooterRibbonController);
        const secondView = render.with(DocSkeletonManagerService).getViewModel();
        view.setEditArea(DocumentEditArea.HEADER);
        secondView.setEditArea(DocumentEditArea.FOOTER);
        instances.focusUnit(second.getUnitId());
        expect(state.tabs).toContain(DOC_HEADER_FOOTER_RIBBON_TAB);
        instances.focusUnit('ribbon-doc');
        expect(state.tabs).toContain(DOC_HEADER_FOOTER_RIBBON_TAB);
        expect(state.active).toBe(DOC_HEADER_FOOTER_RIBBON_TAB);
        secondView.setEditArea(DocumentEditArea.BODY);
        instances.focusUnit(second.getUnitId());
        expect(state.tabs).not.toContain(DOC_HEADER_FOOTER_RIBBON_TAB);
    });

    it('activates on entry, preserves a manual tab while editing and restores it on exit', () => {
        const { view, ribbon, state, controller } = createTestBed();
        ribbon.setActivatedTab(RibbonPosition.INSERT);
        view.setEditArea(DocumentEditArea.HEADER);
        expect(state.active).toBe(DOC_HEADER_FOOTER_RIBBON_TAB);
        expect(state.tabs).toContain(DOC_HEADER_FOOTER_RIBBON_TAB);
        ribbon.setActivatedTab(RibbonPosition.START);
        view.setEditArea(DocumentEditArea.FOOTER);
        expect(state.active).toBe(RibbonPosition.START);
        view.setEditArea(DocumentEditArea.BODY);
        expect(state.tabs).not.toContain(DOC_HEADER_FOOTER_RIBBON_TAB);
        view.setEditArea(DocumentEditArea.HEADER);
        controller.dispose();
        expect(state.tabs).not.toContain(DOC_HEADER_FOOTER_RIBBON_TAB);
        expect(state.active).toBe(RibbonPosition.START);
    });
});
