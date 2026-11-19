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

import type { RenderUnit } from '@univerjs/engine-render';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, IUndoRedoService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import { DocSelectionRenderService, Editor } from '@univerjs/docs-ui';
import { CanvasColorService, Documents, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { DesktopLayoutService, ILayoutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { syncCounterpartFormulaEditorSelection } from '../sync-counterpart-formula-editor-selection';

describe('formula editor counterpart selection', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        const context = new Proxy({
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

    it.each([
        [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY],
        [DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY],
    ])('keeps only the active caret when %s picks a formula reference', (editorId, counterpartId) => {
        const univer = new Univer();
        const root = document.createElement('div');
        document.body.appendChild(root);
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([DocLayoutExecutorService]);
        injector.add([DocSelectionManagerService]);
        injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
        injector.get(ILayoutService).registerRootContainerElement(root);
        const editors = new Map<string, Editor>();
        const selectionManager = injector.get(DocSelectionManagerService);
        const commandService = injector.get(ICommandService);
        commandService.registerCommand(SetTextSelectionsOperation);
        const service = { getEditor: (id: string) => editors.get(id) };
        try {
            for (const id of [editorId, counterpartId]) {
                univer.createUnit(UniverInstanceType.UNIVER_DOC, {
                    id,
                    body: {
                        dataStream: '=SUM(A1:A2,3)\r\n',
                        paragraphs: [{ startIndex: 13, paragraphId: 'formula' }],
                    },
                    documentStyle: { pageSize: { width: 400, height: 100 } },
                });
                const render = injector.get(IRenderManagerService).createRender(id) as RenderUnit;
                render.deactivate();
                render.addRenderDependencies([[DocSkeletonManagerService], [DocSelectionRenderService]]);
                const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
                const documents = new Documents(id, skeleton);
                render.mainComponent = documents;
                render.scene.addObject(documents);
                const selectionRender = render.with(DocSelectionRenderService);
                render.disposeWithMe(selectionManager.refreshSelection$.subscribe((params) => {
                    if (params?.unitId === id) {
                        selectionRender.replaceDocRanges(params.docRanges, params.isEditing, params.options);
                    }
                }));
                render.disposeWithMe(selectionRender.textSelectionInner$.subscribe((params) => {
                    if (params) {
                        selectionManager.__replaceTextRangesWithNoRefresh(params, { unitId: id, subUnitId: id });
                    }
                }));
                const editor = injector.createInstance(
                    Editor,
                    { initialSnapshot: { id, documentStyle: {} }, render, editorDom: root },
                    injector.get(IUniverInstanceService),
                    selectionManager,
                    commandService,
                    injector.get(IUndoRedoService),
                    injector
                );
                render.disposeWithMe(editor);
                editors.set(id, editor);
            }
            const active = service.getEditor(editorId)!;
            const counterpart = service.getEditor(counterpartId)!;
            active.docSelectionRenderService.focus();
            for (const offset of [10, 11, 13]) {
                const selections = [{ startOffset: offset, endOffset: offset, collapsed: true }];
                active.setSelectionRanges(selections, false);
                syncCounterpartFormulaEditorSelection(service, editorId, selections);

                expect(active.docSelectionRenderService.isFocusing).toBe(true);
                expect(active.docSelectionRenderService.getActiveTextRange()?.startOffset).toBe(offset);
                expect(counterpart.getSelectionRanges()).toMatchObject([
                    { startOffset: offset, endOffset: offset },
                ]);
                counterpart.docSelectionRenderService.refreshRanges();
                expect(counterpart.docSelectionRenderService.getAllTextRanges()).toEqual([]);
            }

            // Switching editors must restore a usable caret at the mirrored position.
            const selections = counterpart.getSelectionRanges();
            counterpart.docSelectionRenderService.focus();
            counterpart.setSelectionRanges(selections, false);
            expect(counterpart.docSelectionRenderService.isFocusing).toBe(true);
            expect(counterpart.docSelectionRenderService.getActiveTextRange()?.startOffset).toBe(13);
        } finally {
            univer.dispose();
            root.remove();
        }
    });
});
