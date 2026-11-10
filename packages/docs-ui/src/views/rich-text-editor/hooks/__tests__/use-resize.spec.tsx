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
import {
    DOCS_COMMENT_EDITOR_UNIT_ID_KEY,
    ICommandService,
    LocaleService,
    LocaleType,
    RichTextBuilder,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import {
    CanvasColorService,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    Viewport,
} from '@univerjs/engine-render';
import { DesktopLayoutService, ILayoutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIEWPORT_KEY } from '../../../../basics/docs-view-key';
import { DocSelectionRenderController } from '../../../../controllers/render-controllers/doc-selection-render.controller';
import { EditorService, IEditorService } from '../../../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../../../services/selection/doc-selection-render.service';
import { resizeEditor } from '../use-resize';

function createEditors() {
    const univer = new Univer({ locale: LocaleType.EN_US });
    const injector = univer.__getInjector();
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.get(ICommandService).registerCommand(SetTextSelectionsOperation);
    injector.get(LocaleService).setDirection('ltr');
    const renderManager = injector.get(IRenderManagerService);
    renderManager.registerRenderModule(UniverInstanceType.UNIVER_DOC, [DocSkeletonManagerService]);
    renderManager.registerRenderModule(UniverInstanceType.UNIVER_DOC, [DocSelectionRenderService]);
    renderManager.registerRenderModule(UniverInstanceType.UNIVER_DOC, [DocSelectionRenderController]);
    const root = document.createElement('div');
    document.body.appendChild(root);
    injector.get(ILayoutService).registerRootContainerElement(root);
    const editors = ['PANEL', 'CELL'].map((location) => {
        const id = `${DOCS_COMMENT_EDITOR_UNIT_ID_KEY}_${location}_comment`;
        const container = document.createElement('div');
        root.appendChild(container);
        vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 320, 96));
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            ...RichTextBuilder.create().insertText('Comment draft').getData(),
            id,
            documentStyle: { pageSize: { width: 320, height: Infinity } },
        });
        const render = renderManager.createRender(doc.getUnitId(), { makeCurrent: false });
        const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
        const documents = new Documents('doc-main', skeleton);
        documents.resize(320, 96);
        render.mainComponent = documents;
        render.scene.addObject(documents);
        new Viewport(VIEWPORT_KEY.VIEW_MAIN, render.scene, { left: 0, top: 0, width: 320, height: 96 });
        render.with(DocSelectionRenderController);
        const editorService = injector.get(IEditorService);
        editorService.register({ initialSnapshot: doc.getSnapshot(), cancelDefaultResizeListener: true }, container);
        render.engine.resizeBySize(320, 96);
        return editorService.getAllEditor().get(id)!;
    });
    return { univer, injector, editors };
}

describe('resizeEditor', () => {
    let testBed: ReturnType<typeof createEditors>;

    beforeEach(() => {
        vi.useFakeTimers();
        testBed = createEditors();
    });

    afterEach(() => {
        testBed.univer.dispose();
        document.body.replaceChildren();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('does not access canvas resources after the editor render is disposed', () => {
        const editor = testBed.editors[0];
        testBed.injector.get(IRenderManagerService).removeRender(editor.getEditorId());
        expect(() => resizeEditor(editor, false, { width: 100, height: 20 })).not.toThrow();
    });

    it('preserves engine-owned sizing when no host dimensions are configured', () => {
        const editor = testBed.editors[0];
        editor.render.engine.resizeBySize(400, 120);
        resizeEditor(editor, false);
        expect(editor.render.engine.width).toBe(400);
        expect(editor.getDocumentData().documentStyle.pageSize).toEqual({ width: 320, height: Infinity });
        expect(editor.render.mainComponent?.width).toBe(320);
    });

    it('uses explicit layout dimensions instead of transformed DOM dimensions', () => {
        const editor = testBed.editors[0];
        resizeEditor(editor, false, { width: 480, height: 24 }, 2);
        expect(editor.render.engine.width).toBe(480);
        expect(editor.render.engine.height).toBe(24);
        expect(editor.getDocumentData().documentStyle.pageSize).toEqual({ width: 480, height: Infinity });
        expect(editor.render.engine.getCanvas().getCanvasEle().width).toBe(960);
    });

    it('can oversize the canvas without changing the document reflow width', () => {
        const editor = testBed.editors[0];
        resizeEditor(editor, false, { width: 240, height: 30 }, 1, { width: 204, height: 30 });
        expect(editor.render.engine.width).toBe(240);
        expect(editor.getDocumentData().documentStyle.pageSize).toEqual({ width: 204, height: Infinity });
        expect(editor.render.mainComponent?.width).toBe(204);
    });

    it('does not restore a stale comment caret when a delayed resize runs after switching editors', () => {
        const [sidebar, popup] = testBed.editors;
        const editorService = testBed.injector.get(IEditorService);
        editorService.focus(sidebar.getEditorId());
        sidebar.setSelectionRanges([{ startOffset: 3, endOffset: 3 }]);
        setTimeout(() => resizeEditor(sidebar, false), 500);
        editorService.focus(popup.getEditorId());
        popup.setSelectionRanges([{ startOffset: 5, endOffset: 5 }]);

        vi.advanceTimersByTime(500);

        expect(sidebar.docSelectionRenderService.getAllTextRanges()).toEqual([]);
        expect(popup.docSelectionRenderService.getActiveTextRange()?.getAnchor()?.visible).toBe(true);
        expect(document.activeElement).toBe(popup.docSelectionRenderService.inputElement);
        expect(sidebar.getSelectionRanges()).toMatchObject([{ startOffset: 3, endOffset: 3 }]);
        expect(sidebar.getDocumentData().body?.dataStream).toBe('Comment draft\r\n');

        editorService.focus(sidebar.getEditorId());
        resizeEditor(sidebar, false);
        expect(sidebar.docSelectionRenderService.getActiveTextRange()).toMatchObject({ startOffset: 3, endOffset: 3 });
        expect(sidebar.docSelectionRenderService.getActiveTextRange()?.getAnchor()?.visible).toBe(true);
        expect(popup.docSelectionRenderService.getAllTextRanges()).toEqual([]);
    });

    it.each([[3, 3], [2, 7]])('preserves the visible selection %i:%i when resizing while a toolbar control has focus', (startOffset, endOffset) => {
        const editor = testBed.editors[0];
        testBed.injector.get(IEditorService).focus(editor.getEditorId());
        editor.setSelectionRanges([{ startOffset, endOffset }]);
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.focus();

        resizeEditor(editor, false, { width: 200, height: 96 });

        expect(editor.docSelectionRenderService.getActiveTextRange()).toMatchObject({ startOffset, endOffset });
        expect(editor.getSelectionRanges()).toMatchObject([{ startOffset, endOffset }]);
        expect(document.activeElement).toBe(button);
    });
});
