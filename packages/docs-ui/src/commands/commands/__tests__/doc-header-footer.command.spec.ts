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
import type { ISuccinctDocRangeParam, RenderUnit } from '@univerjs/engine-render';
import {
    DocumentFlavor,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    CreateHeaderFooterCommand,
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateChangeManagerService,
    DocStateEmitService,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import {
    CanvasColorService,
    DocumentEditArea,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import {
    DesktopLayoutService,
    DesktopRibbonService,
    ILayoutService,
    IMenuManagerService,
    IRibbonService,
    MenuManagerService,
} from '@univerjs/ui';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { headerFooterRibbonSchema } from '../../../menu/header-footer-ribbon';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { DOC_HEADER_FOOTER_RIBBON_TAB } from '../../../views/header-footer/panel/component-name';
import { DocHeaderFooterRibbonOperation } from '../../operations/doc-header-footer-ribbon.operation';
import {
    CloseHeaderFooterCommand,
    CoreHeaderFooterCommand,
    OpenHeaderFooterPanelCommand,
} from '../doc-header-footer.command';

const cleanups: Array<() => void> = [];
afterEach(() => cleanups.splice(0).reverse().forEach((dispose) => dispose()));

function createTestBed(existingHeader = true, flavor = DocumentFlavor.TRADITIONAL) {
    const univer = new Univer();
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    injector.add([IRibbonService, { useClass: DesktopRibbonService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocStateEmitService]);
    injector.add([DocStateChangeManagerService]);
    injector.get(IMenuManagerService).mergeMenu(headerFooterRibbonSchema);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'open-header-doc',
        body: {
            dataStream: 'Body\r\n',
            textRuns: [],
            paragraphs: [{ paragraphId: 'body', startIndex: 4 }],
        },
        headers: existingHeader
            ? { header: { headerId: 'header', body: {
                dataStream: 'Page \r\n',
                textRuns: [],
                paragraphs: [{ paragraphId: 'header-p', startIndex: 5 }],
            } } }
            : {},
        documentStyle: {
            documentFlavor: flavor,
            defaultHeaderId: existingHeader ? 'header' : undefined,
            pageSize: { width: 300, height: 400 },
            marginTop: 40,
        },
    });
    injector.get(IUniverInstanceService).focusUnit(model.getUnitId());
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
    render.deactivate();
    render.addRenderDependencies([[DocSkeletonManagerService], [DocSelectionRenderService]]);
    const skeletonManager = render.with(DocSkeletonManagerService);
    skeletonManager.getSkeleton().calculate();
    const commands = injector.get(ICommandService);
    for (const command of [OpenHeaderFooterPanelCommand, CoreHeaderFooterCommand, CreateHeaderFooterCommand, RichTextEditingMutation, SetTextSelectionsOperation, CloseHeaderFooterCommand, DocHeaderFooterRibbonOperation]) {
        commands.registerCommand(command);
    }
    const state = { ranges: [] as ISuccinctDocRangeParam[] };
    const subscription = injector.get(DocSelectionManagerService).refreshSelection$.subscribe((event) => {
        if (event) {
            state.ranges = event.docRanges;
        }
    });
    cleanups.push(() => subscription.unsubscribe());
    return { model, commands, render, skeletonManager, injector, state };
}

describe('header/footer editing commands', () => {
    it.each([true, false])('opens the contextual ribbon and selects the header (existing=%s)', async (existing) => {
        const { model, commands, render, skeletonManager, injector, state } = createTestBed(existing);
        expect(await commands.executeCommand(OpenHeaderFooterPanelCommand.id)).toBe(true);
        const segmentId = model.getSnapshot().documentStyle.defaultHeaderId;
        expect(segmentId).toBeTruthy();
        expect(model.getSelfOrHeaderFooterModel(segmentId)).toBeDefined();
        expect(render.with(DocSelectionRenderService).getSegment()).toBe(segmentId);
        expect(render.with(DocSelectionRenderService).getSegmentPage()).toBe(0);
        expect(skeletonManager.getViewModel().getEditArea()).toBe(DocumentEditArea.HEADER);
        expect(state.ranges).toEqual([expect.objectContaining({
            startOffset: 0,
            endOffset: 0,
            segmentId,
            segmentPage: 0,
        })]);
        expect((await firstValueFrom(injector.get(IRibbonService).ribbon$)).map((tab) => tab.key))
            .toContain(DOC_HEADER_FOOTER_RIBBON_TAB);
    });

    it('rolls back header editing when a modern document refuses header creation', async () => {
        const { commands, render, skeletonManager } = createTestBed(false, DocumentFlavor.MODERN);
        expect(await commands.executeCommand(OpenHeaderFooterPanelCommand.id)).toBe(false);
        expect(render.with(DocSelectionRenderService).getSegment()).toBe('');
        expect(render.with(DocSelectionRenderService).getSegmentPage()).toBe(-1);
        expect(skeletonManager.getViewModel().getEditArea()).toBe(DocumentEditArea.BODY);
    });

    it('returns to the body without repaginating already-published pages', async () => {
        const { commands, skeletonManager, injector, state } = createTestBed();
        expect(await commands.executeCommand(OpenHeaderFooterPanelCommand.id)).toBe(true);
        const skeleton = skeletonManager.getSkeleton();
        const pages = skeleton.getSkeletonData()!.pages;
        const calculate = vi.spyOn(skeleton, 'calculate');
        expect(await commands.executeCommand(CloseHeaderFooterCommand.id)).toBe(true);
        expect(skeletonManager.getViewModel().getEditArea()).toBe(DocumentEditArea.BODY);
        expect(skeleton.getSkeletonData()!.pages).toBe(pages);
        expect(calculate).not.toHaveBeenCalled();
        expect((await firstValueFrom(injector.get(IRibbonService).ribbon$)).map((tab) => tab.key))
            .not
            .toContain(DOC_HEADER_FOOTER_RIBBON_TAB);
        expect(state.ranges).toEqual([expect.objectContaining({ startOffset: 0, endOffset: 0 })]);
    });
});
