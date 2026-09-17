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
import type { HeaderFooterContentCover } from '../../views/header-footer/content-cover';
import {
    BooleanNumber,
    DocumentFlavor,
    DrawingTypeEnum,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    PositionedObjectLayoutType,
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
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import {
    CanvasColorService,
    DocumentEditArea,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    Rect,
    RenderManagerService,
    Vector2,
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

function createTestBed(documentFlavor = DocumentFlavor.TRADITIONAL, overrides: Partial<IDocumentData> = {}) {
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
        ...overrides,
        documentStyle: {
            documentFlavor,
            pageSize: { width: 300, height: 400 },
            marginTop: 50,
            marginBottom: 50,
            ...overrides.documentStyle,
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

    it('covers only header/footer ink bounds, stays transparent to picking, and is removed on disposal', () => {
        const { render, documents, ctx, paints, manager } = createTestBed(DocumentFlavor.TRADITIONAL, {
            headers: { header: { headerId: 'header', body: { dataStream: 'Logo\r\n', paragraphs: [{ startIndex: 4, paragraphId: 'header-p' }] } } },
            footers: { footer: { footerId: 'footer', body: { dataStream: 'Page\r\n', paragraphs: [{ startIndex: 4, paragraphId: 'footer-p' }] } } },
            documentStyle: { defaultHeaderId: 'header', defaultFooterId: 'footer', marginLeft: 40, marginRight: 40 },
        });
        render.addRenderDependencies([[DocHeaderFooterController]]);
        const controller = render.with(DocHeaderFooterController);
        const cover = render.scene.getObject('header-footer-document-header-footer-cover') as HeaderFooterContentCover;
        const rects = vi.spyOn(ctx, 'rect');
        const fill = vi.spyOn(ctx, 'fill');
        documents.draw(ctx);
        expect(paints.filter(({ text }) => /[LogoPage]/.test(text)).every(({ alpha }) => alpha === 1)).toBe(true);
        rects.mockClear();
        fill.mockClear();
        cover.render(ctx);
        const bounds = rects.mock.calls;
        expect(bounds.length).toBeGreaterThan(0);
        expect(bounds.every(([x, , width]) => x > 0 && width < 150)).toBe(true);
        expect(bounds.some(([, y]) => y < 50)).toBe(true);
        expect(bounds.some(([, y]) => y > 300)).toBe(true);
        expect(fill).toHaveBeenCalledTimes(1);
        expect(cover.evented).toBe(false);
        expect(render.scene.pick(new Vector2(bounds[0][0] + 1, bounds[0][1] + 1))).not.toBe(cover);

        manager.getViewModel().setEditArea(DocumentEditArea.HEADER);
        fill.mockClear();
        cover.render(ctx);
        expect(fill).not.toHaveBeenCalled();
        controller.dispose();
        expect(render.scene.getObject(cover.oKey)).toBeUndefined();
    });

    it('uses live repeated drawing bounds without covering the horizontal gap or painting overlaps twice', () => {
        const drawingDefaults = {
            unitId: 'header-footer-document',
            subUnitId: 'header-footer-document',
            isMultiTransform: BooleanNumber.TRUE,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            layoutType: PositionedObjectLayoutType.INLINE,
            docTransform: {
                size: { width: 30, height: 20 },
                positionH: { relativeFrom: 0, posOffset: 0 },
                positionV: { relativeFrom: 0, posOffset: 0 },
                angle: 0,
            },
        };
        const { render, ctx, documents } = createTestBed(DocumentFlavor.TRADITIONAL, {
            drawings: {
                first: { ...drawingDefaults, drawingId: 'first' },
                second: { ...drawingDefaults, drawingId: 'second' },
            },
        });
        render.addRenderDependencies([[DocHeaderFooterController]]);
        render.with(DocHeaderFooterController);
        const first = new Rect(getDrawingShapeKeyByDrawingSearch({ unitId: documents.oKey, subUnitId: documents.oKey, drawingId: 'first' }, 0), { left: 40, top: 10, width: 30, height: 20 });
        const second = new Rect(getDrawingShapeKeyByDrawingSearch({ unitId: documents.oKey, subUnitId: documents.oKey, drawingId: 'second' }, 0), { left: 220, top: 10, width: 40, height: 20 });
        render.scene.addObjects([first, second], 4);
        const cover = render.scene.getObject('header-footer-document-header-footer-cover') as HeaderFooterContentCover;
        const rects = vi.spyOn(ctx, 'rect');
        const fill = vi.spyOn(ctx, 'fill');
        cover.render(ctx);
        expect(rects.mock.calls).toEqual([[40, 10, 30, 20], [220, 10, 40, 20]]);
        expect(fill).toHaveBeenCalledTimes(1);
        second.transformByState({ left: 50 });
        rects.mockClear();
        fill.mockClear();
        cover.render(ctx);
        expect(rects.mock.calls).toEqual([[40, 10, 30, 20], [50, 10, 40, 20]]);
        expect(fill).toHaveBeenCalledTimes(1);
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
