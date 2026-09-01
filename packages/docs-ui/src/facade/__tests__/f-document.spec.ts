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

// @vitest-environment jsdom

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { IPointerEvent, RenderUnit } from '@univerjs/engine-render';
import { BooleanNumber, DocumentFlavor, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService, DocStateEmitService, SetTextSelectionsOperation } from '@univerjs/docs';
import { CanvasColorService, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { ILayoutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocBackScrollRenderController } from '../../controllers/render-controllers/back-scroll.render-controller';
import { DocSelectionRenderController } from '../../controllers/render-controllers/doc-selection-render.controller';
import { DocRenderController } from '../../controllers/render-controllers/doc.render-controller';
import { DocLayoutInteractionService } from '../../services/doc-layout-interaction.service';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';
import { DocViewScaleService } from '../../services/doc-view-scale';
import { EditorService, IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import '@univerjs/docs/facade';
import '../f-document';

function createEditor() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const root = document.createElement('div');
    document.body.appendChild(root);
    injector.add([ILayoutService, { useValue: {
        rootContainerElement: root,
        registerContainerElement: () => ({ dispose() {} }),
    } as unknown as ILayoutService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([DocMenuStyleService]);
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.get(ICommandService).registerCommand(SetTextSelectionsOperation);
    const dataStream = `${'This paragraph contains enough words to occupy several physical pages.\r'.repeat(100)}\n`;
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'facade-selection',
        body: {
            dataStream,
            paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index!, paragraphId: `paragraph-${index}` })),
            sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'body' }],
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.TRADITIONAL,
            autoHyphenation: BooleanNumber.FALSE,
            pageSize: { width: 300, height: 400 },
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
        },
    });
    const unitId = model.getUnitId();
    const instances = injector.get(IUniverInstanceService);
    instances.setCurrentUnitForType(unitId);
    instances.focusUnit(unitId);
    const render = injector.get(IRenderManagerService).createRender(unitId) as RenderUnit;
    render.engine.resizeBySize(800, 600);
    render.deactivate();
    render.addRenderDependencies([
        [DocSkeletonManagerService],
        [DocSelectionRenderService],
        [DocViewScaleService],
        [DocPageLayoutService],
        [DocLayoutInteractionService],
        [DocRenderController],
        [DocBackScrollRenderController],
        [DocSelectionRenderController],
    ]);
    const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
    const pages = skeleton.getSkeletonData()!.pages;
    const page = pages[6];
    expect(page).toBeDefined();
    return {
        doc: FUniver.newAPI(injector).getActiveDocument()!,
        model,
        render,
        selections: injector.get(DocSelectionManagerService),
        selection: render.with(DocSelectionRenderService),
        offset: page.st + 3,
        makeOffscreen(): void {
            pages[6] = { ...page, isMaterializationPlaceholder: true, sections: [], skeTables: new Map() };
        },
        materialize(): void {
            pages[6] = page;
        },
        dispose(): void {
            univer.dispose();
            root.remove();
        },
    };
}

describe('docs-ui document facade', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        const context = new Proxy({
            font: '',
            webkitBackingStorePixelRatio: 1,
            measureText: (text: string) => ({
                width: text.length * 8,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 2,
                fontBoundingBoxAscent: 8,
                fontBoundingBoxDescent: 2,
            }),
        }, { get: (target, key) => key in target ? Reflect.get(target, key) : () => {} });
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    });
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('replaces the text selection with the requested document offsets', () => {
        const editor = createEditor();
        try {
            editor.doc.setSelection(2, 7);
            expect(editor.selections.getActiveTextRange()).toMatchObject({ startOffset: 2, endOffset: 7 });
        } finally {
            editor.dispose();
        }
    });

    it.each([0, 3])('resolves an offscreen SDK selection of length %i after page materialization', async (length) => {
        const editor = createEditor();
        try {
            editor.doc.setSelection(2, 2);
            editor.makeOffscreen();
            editor.doc.setSelection(editor.offset, editor.offset + length);
            expect(editor.selections.getActiveTextRange()?.startOffset).not.toBe(2);
            editor.materialize();
            await vi.advanceTimersByTimeAsync(40);
            expect(editor.selections.getActiveTextRange()).toMatchObject({ startOffset: editor.offset, endOffset: editor.offset + length });
            expect(editor.selection.getActiveTextRange()?.startOffset).toBe(editor.offset);
        } finally {
            editor.dispose();
        }
    });

    it.each(['selection', 'pointer', 'text-change'])('does not restore an old SDK target after a newer %s', async (action) => {
        const editor = createEditor();
        try {
            editor.makeOffscreen();
            editor.doc.setSelection(editor.offset, editor.offset);
            if (action === 'selection') {
                editor.doc.setSelection(4, 4);
            } else if (action === 'pointer') {
                editor.render.scene.onPointerDown$.emitEvent({ offsetX: 30, offsetY: 30, button: 0 } as IPointerEvent);
            } else {
                editor.model.getBody()!.dataStream = `X${editor.model.getBody()!.dataStream}`;
            }
            editor.materialize();
            await vi.advanceTimersByTimeAsync(40);
            expect(editor.selections.getActiveTextRange()?.startOffset).not.toBe(editor.offset);
            if (action === 'selection') {
                expect(editor.selections.getActiveTextRange()?.startOffset).toBe(4);
            }
        } finally {
            editor.dispose();
        }
    });
});
