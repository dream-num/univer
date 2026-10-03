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

/**
 * @vitest-environment jsdom
 */

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import type { Root } from 'react-dom/client';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DocumentFlavor,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    SectionType,
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
    RediContext,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import {
    CloseHeaderFooterCommand,
    CoreHeaderFooterCommand,
} from '../../../../commands/commands/doc-header-footer.command';
import { DocHeaderFooterRibbonOperation } from '../../../../commands/operations/doc-header-footer-ribbon.operation';
import enUS from '../../../../locale/en-US';
import { DocSelectionRenderService } from '../../../../services/selection/doc-selection-render.service';
import { DocHeaderFooterOptions } from '../DocHeaderFooterOptions';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'header-footer-options-doc';

async function renderHeaderFooterOptions() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    injector.add([IRibbonService, { useClass: DesktopRibbonService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([DocStateChangeManagerService]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const first = `A${DataStreamTreeTokenType.PAGE_BREAK}B${DataStreamTreeTokenType.PAGE_BREAK}C\r\n`;
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: UNIT_ID,
        documentStyle: {
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: { width: 300, height: 400 },
            defaultHeaderId: 'default-header',
            defaultFooterId: 'default-footer',
            marginTop: 40,
            marginHeader: 12,
            marginFooter: 18,
        },
        headers: { 'default-header': { headerId: 'default-header', body: {
            dataStream: 'Header\r\n',
            paragraphs: [{ paragraphId: 'header-p', startIndex: 6 }],
            textRuns: [],
        } } },
        body: {
            dataStream: `${first}D\r\n`,
            paragraphs: [
                { paragraphId: 'first-p', startIndex: first.length - 2 },
                { paragraphId: 'second-p', startIndex: first.length + 1 },
            ],
            sectionBreaks: [
                { sectionId: 'first-section', startIndex: first.length - 1 },
                {
                    sectionId: 'section_options',
                    startIndex: first.length + 2,
                    sectionType: SectionType.NEXT_PAGE,
                    pageNumberStart: 1,
                },
            ],
            textRuns: [],
        },
    });
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    const render = injector.get(IRenderManagerService).createRender(UNIT_ID) as RenderUnit;
    render.deactivate();
    render.addRenderDependencies([[DocSkeletonManagerService], [DocSelectionRenderService]]);
    const skeletonManager = render.with(DocSkeletonManagerService);
    skeletonManager.getSkeleton().calculate();
    skeletonManager.getViewModel().setEditArea(DocumentEditArea.HEADER);
    const selection = render.with(DocSelectionRenderService);
    selection.setSegmentPage(3);
    selection.setSegment('default-header');
    const commands = injector.get(ICommandService);
    for (const command of [CoreHeaderFooterCommand, CreateHeaderFooterCommand, RichTextEditingMutation, SetTextSelectionsOperation, CloseHeaderFooterCommand, DocHeaderFooterRibbonOperation]) {
        commands.registerCommand(command);
    }
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <DocHeaderFooterOptions unitId={UNIT_ID} />
            </RediContext.Provider>
        );
    });
    return { univer, model, injector, selection, skeletonManager, container, root };
}

function changeInput(input: HTMLInputElement, value: string) {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('DocHeaderFooterOptions', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;
    let univer: Univer | undefined;

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        univer?.dispose();
        container?.remove();
        root = undefined;
        container = undefined;
        univer = undefined;
    });

    it('creates and selects a first-page header at a restarted section on the fourth physical page', async () => {
        const rendered = await renderHeaderFooterOptions();
        ({ root, container, univer } = rendered);
        expect(rendered.skeletonManager.getSkeleton().getSkeletonData()?.pages.map((page) => page.pageNumber))
            .toEqual([1, 2, 3, 1]);
        const firstPageCheckbox = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1];
        const focus = document.createElement('input');
        container.appendChild(focus);
        const registration = rendered.injector.get(ILayoutService).registerFocusHandler(
            UniverInstanceType.UNIVER_DOC,
            () => focus.focus()
        );
        try {
            await act(async () => firstPageCheckbox.click());
            const section = rendered.model.getSnapshot().body!.sectionBreaks![1];
            expect(section.useFirstPageHeaderFooter).toBe(BooleanNumber.TRUE);
            expect(section.firstPageHeaderId).toBeTruthy();
            expect(rendered.model.getSelfOrHeaderFooterModel(section.firstPageHeaderId)).toBeDefined();
            expect(rendered.selection.getSegment()).toBe(section.firstPageHeaderId);
            expect(document.activeElement).toBe(focus);
        } finally {
            registration.dispose();
        }
    });

    it('persists section margin edits and returns the caret to the body when closed', async () => {
        const rendered = await renderHeaderFooterOptions();
        ({ root, container, univer } = rendered);
        const headerMargin = container.querySelector<HTMLInputElement>('input[type="text"]')!;
        await act(async () => changeInput(headerMargin, '25.5'));
        expect(rendered.model.getSnapshot().body!.sectionBreaks![1].marginHeader).toBe(25.5);
        expect(rendered.model.getSnapshot().documentStyle.marginHeader).toBe(12);
        const closeButton = Array.from(container.querySelectorAll('button')).find((button) => (
            button.textContent?.includes(rendered.injector.get(LocaleService).t('docs-ui.headerFooter.closeHeaderFooter'))
        ))!;
        await act(async () => closeButton.click());
        expect(rendered.skeletonManager.getViewModel().getEditArea()).toBe(DocumentEditArea.BODY);
        expect(rendered.selection.getSegment()).toBe('');
        expect(rendered.selection.getSegmentPage()).toBe(-1);
        expect(rendered.injector.get(DocSelectionManagerService).getActiveTextRange()?.segmentId ?? '').toBe('');
    });
});
