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
import {
    DocumentFlavor,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    ThemeService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateEmitService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import {
    CanvasColorService,
    DocumentEditArea,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import { DesktopLayoutService, DesktopSidebarService, ILayoutService, ISidebarService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloseHeaderFooterCommand } from '../../commands/commands/doc-header-footer.command';
import { SidebarDocHeaderFooterPanelOperation } from '../../commands/operations/doc-header-footer-panel.operation';
import enUS from '../../locale/en-US';
import { EditorService, IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { DocHeaderFooterController } from '../doc-header-footer.controller';

const cleanups: Array<() => void> = [];

function createTestBed(documentFlavor = DocumentFlavor.TRADITIONAL) {
    vi.useFakeTimers();
    const univer = new Univer();
    const root = document.createElement('div');
    document.body.appendChild(root);
    cleanups.push(() => {
        univer.dispose();
        root.remove();
    });
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.get(ILayoutService).registerRootContainerElement(root);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    root.dir = locale.getDirection();
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'header-footer-document',
        body: {
            dataStream: 'D\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'body-p' }],
            sectionBreaks: [{ startIndex: 2, sectionId: 'body-section' }],
        },
        documentStyle: {
            documentFlavor,
            pageSize: { width: 300, height: 400 },
            marginTop: 50,
            marginBottom: 50,
        },
    });
    injector.get(IUniverInstanceService).setCurrentUnitForType(model.getUnitId());
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
    render.deactivate();
    render.engine.resizeBySize(300, 400);
    render.addRenderDependencies([[DocSkeletonManagerService]]);
    const manager = render.with(DocSkeletonManagerService);
    const documents = new Documents(model.getUnitId(), manager.getSkeleton());
    render.mainComponent = documents;
    render.scene.addObject(documents);
    render.addRenderDependencies([[DocSelectionRenderService]]);
    const ctx = render.engine.getCanvas().getContext();
    const paints: Array<{ text: string; alpha: number }> = [];
    vi.spyOn(ctx, 'fillText').mockImplementation((text) => {
        paints.push({ text: String(text), alpha: ctx.globalAlpha });
    });
    return { univer, injector, model, render, documents, manager, ctx, paints };
}

describe('DocHeaderFooterController', () => {
    afterEach(() => {
        cleanups.splice(0).reverse().forEach((dispose) => dispose());
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('keeps body content in page margins at full opacity without painting a covering rectangle', () => {
        const { render, documents, ctx, paints } = createTestBed();
        render.addRenderDependencies([[DocHeaderFooterController]]);
        render.with(DocHeaderFooterController);
        const fill = vi.spyOn(ctx, 'fill');
        documents.draw(ctx);
        expect(paints).toContainEqual({ text: 'D', alpha: 1 });
        expect(fill).not.toHaveBeenCalled();
    });

    it('dims the body during header editing, redraws on edit-area changes, and restores opacity on disposal', () => {
        const { render, documents, manager, ctx, paints } = createTestBed();
        render.addRenderDependencies([[DocHeaderFooterController]]);
        const controller = render.with(DocHeaderFooterController);
        documents.makeDirty(false);
        manager.getViewModel().setEditArea(DocumentEditArea.HEADER);
        expect(documents.isDirty()).toBe(true);
        documents.draw(ctx);
        expect(paints).toContainEqual({ text: 'D', alpha: 0.5 });

        controller.dispose();
        paints.length = 0;
        const stroke = vi.spyOn(ctx, 'stroke');
        documents.draw(ctx);
        expect(paints.filter(({ text }) => text.trim())).toEqual([{ text: 'D', alpha: 1 }]);
        expect(stroke).not.toHaveBeenCalled();
    });

    it('draws localized guides using current theme tokens without resolving colors per page', () => {
        const { injector, render, documents, manager, ctx, paints } = createTestBed();
        render.addRenderDependencies([[DocHeaderFooterController]]);
        render.with(DocHeaderFooterController);
        manager.getViewModel().setEditArea(DocumentEditArea.HEADER);
        const themeService = injector.get(ThemeService);
        const theme = themeService.getCurrentTheme();
        themeService.setTheme({ ...theme, primary: { ...theme.primary, 600: '#123456' } });
        const colors = vi.spyOn(themeService, 'getColorFromTheme');
        const strokes: Array<string | CanvasGradient | CanvasPattern> = [];
        vi.spyOn(ctx, 'stroke').mockImplementation(() => {
            strokes.push(ctx.strokeStyle);
        });
        documents.draw(ctx);
        documents.draw(ctx);
        expect(colors).not.toHaveBeenCalled();
        expect(strokes.filter((color) => color === '#123456')).toHaveLength(4);
        expect(paints).toContainEqual({ text: enUS['docs-ui'].headerFooter.header, alpha: 1 });
        expect(paints).toContainEqual({ text: enUS['docs-ui'].headerFooter.footer, alpha: 1 });
    });

    it('does not apply editing emphasis or guides to modern documents', () => {
        const { render, documents, manager, ctx, paints } = createTestBed(DocumentFlavor.MODERN);
        render.addRenderDependencies([[DocHeaderFooterController]]);
        render.with(DocHeaderFooterController);
        manager.getViewModel().setEditArea(DocumentEditArea.HEADER);
        documents.draw(ctx);
        expect(paints.filter(({ text }) => text.trim())).toEqual([{ text: 'D', alpha: 1 }]);
    });

    it('closes header/footer editing after rich-text changes in modern document mode', async () => {
        const { injector, render, manager, model } = createTestBed(DocumentFlavor.MODERN);
        const commands = injector.get(ICommandService);
        commands.registerCommand(RichTextEditingMutation);
        commands.registerCommand(CloseHeaderFooterCommand);
        commands.registerCommand(SidebarDocHeaderFooterPanelOperation);
        render.addRenderDependencies([[DocHeaderFooterController]]);
        render.with(DocHeaderFooterController);
        manager.getViewModel().setEditArea(DocumentEditArea.HEADER);
        await commands.executeCommand(RichTextEditingMutation.id, { unitId: model.getUnitId(), actions: [], textRanges: [] });
        expect(manager.getViewModel().getEditArea()).toBe(DocumentEditArea.BODY);
    });
});
