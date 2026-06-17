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

import type { IDocumentData, Injector, ITextStyle, Univer } from '@univerjs/core';
import { CustomRangeType, DocumentFlavor, IUniverInstanceService, PresetListType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocumentEditArea } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import { DocAutoFormatService } from '../doc-auto-format.service';
import { getListMarkerFallbackBound, getListMarkerFallbackHit, getListParagraphContextMenuHit, isChecklistListType } from '../doc-event-manager.service';
import { DocMenuStyleService } from '../doc-menu-style.service';
import { DocPrintInterceptorService } from '../doc-print-interceptor.service';
import { resolveDocRenderBackground } from '../doc-render-background';
import { DocsRenderService, getDocsCanvasBackgroundColor } from '../docs-render.service';

function createDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello world\rSecond line\r\n',
            textRuns: [{
                st: 0,
                ed: 22,
                ts: {},
            }],
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_44', startIndex: 11 }, { paragraphId: 'para_docs_ui_fixture_45', startIndex: 23 }],
            sectionBreaks: [{
                startIndex: 24,
            }],
            customRanges: [{
                startIndex: 6,
                endIndex: 10,
                rangeId: 'range-world',
                rangeType: CustomRangeType.HYPERLINK,
                wholeEntity: true,
            }],
            customBlocks: [],
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

describe('docs ui services', () => {
    let univer: Univer;
    let get: Injector['get'];

    afterEach(() => {
        univer?.dispose();
    });

    it('detects a list marker fallback hit from paragraph bounds without treating body text as marker', () => {
        const paragraph = {
            startIndex: 12,
            bullet: {
                listId: 'list-1',
                listType: 'bulletList',
                nestingLevel: 0,
            },
        };
        const paragraphBound = {
            firstLine: { bottom: 124, left: 160, right: 460, top: 104 },
            pageIndex: 0,
            rect: { bottom: 128, left: 160, right: 460, top: 100 },
            segmentId: undefined,
        };

        expect(getListMarkerFallbackBound(paragraphBound, paragraph)).toEqual({
            paragraph,
            rect: { bottom: 124, left: 160, right: 196, top: 104 },
            segmentId: undefined,
            segmentPageIndex: 0,
        });
        expect(getListMarkerFallbackHit(paragraphBound, paragraph, { x: 168, y: 112 })).toEqual({
            paragraph,
            rect: { bottom: 124, left: 160, right: 196, top: 104 },
            segmentId: undefined,
            segmentPageIndex: 0,
        });
        expect(getListMarkerFallbackHit(paragraphBound, paragraph, { x: 240, y: 112 })).toBeNull();
        expect(getListMarkerFallbackHit(paragraphBound, { startIndex: 12 }, { x: 168, y: 112 })).toBeNull();
    });

    it('does not treat list paragraph body hits as list marker context menu hits', () => {
        const paragraph = {
            startIndex: 12,
            bullet: {
                listId: 'list-1',
                listType: 'bulletList',
                nestingLevel: 0,
            },
        };
        const paragraphBound = {
            firstLine: { bottom: 124, left: 160, right: 460, top: 104 },
            pageIndex: 0,
            rect: { bottom: 128, left: 160, right: 460, top: 100 },
            segmentId: undefined,
        };

        expect(getListMarkerFallbackHit(paragraphBound, paragraph, { x: 260, y: 112 })).toBeNull();
        expect(getListParagraphContextMenuHit(paragraphBound, paragraph, { x: 260, y: 112 })).toBeNull();
        expect(getListParagraphContextMenuHit(paragraphBound, paragraph, { x: 260, y: 180 })).toBeNull();
        expect(getListParagraphContextMenuHit(paragraphBound, { startIndex: 12 }, { x: 260, y: 112 })).toBeNull();
    });

    it('identifies checklist list types separately from interactive list markers', () => {
        expect(isChecklistListType(PresetListType.CHECK_LIST)).toBe(true);
        expect(isChecklistListType(PresetListType.CHECK_LIST_CHECKED)).toBe(true);
        expect(isChecklistListType(PresetListType.BULLET_LIST)).toBe(false);
        expect(isChecklistListType(PresetListType.ORDER_LIST)).toBe(false);
    });

    it('matches auto-format handlers by priority and builds context from the current selection', () => {
        ({ univer, get } = createCommandTestBed(createDocData()));
        const selectionManager = get(DocSelectionManagerService);
        const univerInstanceService = get(IUniverInstanceService);
        const service = new DocAutoFormatService(univerInstanceService, selectionManager);
        let highPriorityContext: Record<string, unknown> | null = null;

        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 12,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        const lowPriority = service.registerAutoFormat({
            id: 'doc.command.tab',
            priority: 1,
            match: () => true,
            getMutations: () => [{ id: 'low-priority' }],
        });
        const highPriority = service.registerAutoFormat({
            id: 'doc.command.tab',
            priority: 10,
            match: (context) => {
                highPriorityContext = {
                    isBody: context.isBody,
                    paragraphCount: context.paragraphs.length,
                    customRangeCount: context.customRanges.length,
                    commandParams: context.commandParams,
                };
                return true;
            },
            getMutations: () => [{ id: 'high-priority' }],
        });

        expect(service.onAutoFormat('doc.command.tab', { shift: false })).toEqual([{ id: 'high-priority' }]);
        expect(highPriorityContext).toEqual({
            isBody: true,
            paragraphCount: 2,
            customRangeCount: 1,
            commandParams: { shift: false },
        });

        highPriority.dispose();
        expect(service.onAutoFormat('doc.command.tab', null)).toEqual([{ id: 'low-priority' }]);

        lowPriority.dispose();
        expect(service.onAutoFormat('doc.command.tab', null)).toEqual([]);
    });

    it('returns no auto-format mutations when the current selection is unavailable', () => {
        ({ univer, get } = createCommandTestBed(createDocData()));
        const service = new DocAutoFormatService(get(IUniverInstanceService), get(DocSelectionManagerService));

        expect(service.onAutoFormat('doc.command.tab', null)).toEqual([]);
    });

    it('merges cached menu styles, clears them on selection changes, and derives body/header defaults', () => {
        ({ univer, get } = createCommandTestBed(createDocData()));
        const selectionManager = get(DocSelectionManagerService);
        const univerInstanceService = get(IUniverInstanceService);
        const bodyRenderManagerService = {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => ({
                    getViewModel: () => ({
                        getEditArea: () => DocumentEditArea.BODY,
                    }),
                })),
            })),
        };
        const headerRenderManagerService = {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => ({
                    getViewModel: () => ({
                        getEditArea: () => DocumentEditArea.HEADER,
                    }),
                })),
            })),
        };
        const bodyService = new DocMenuStyleService(
            selectionManager,
            univerInstanceService,
            bodyRenderManagerService as never
        );
        const headerService = new DocMenuStyleService(
            selectionManager,
            univerInstanceService,
            headerRenderManagerService as never
        );
        const fallbackService = new DocMenuStyleService(
            selectionManager,
            {
                getCurrentUnitOfType: () => null,
            } as never,
            {
                getRenderById: vi.fn(() => null),
            } as never
        );

        bodyService.setStyleCache({ bl: 1 } as ITextStyle);
        bodyService.setStyleCache({ it: 1 } as ITextStyle);

        expect(bodyService.getStyleCache()).toEqual({ bl: 1, it: 1 });
        expect(bodyService.getDefaultStyle()).toEqual({ ff: 'Arial', fs: 11 });
        expect(headerService.getDefaultStyle()).toEqual({ ff: 'Arial', fs: 9 });
        expect(fallbackService.getDefaultStyle()).toEqual({ ff: 'Arial', fs: 11 });

        (selectionManager as unknown as { _textSelection$: { next: (value: unknown) => void } })._textSelection$.next({});

        expect(bodyService.getStyleCache()).toBeNull();
    });

    it('creates and disposes renderers for current, added, and removed docs', () => {
        const createRender$ = new Subject<string>();
        const created$ = new Subject<Record<string, unknown>>();
        const added$ = new Subject<{ unit: Record<string, unknown> }>();
        const disposed$ = new Subject<Record<string, unknown>>();
        const existingDoc = {
            getUnitId: () => 'doc-1',
            getSnapshot: () => ({ documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL } }),
        };
        const addedDoc = {
            getUnitId: () => 'doc-2',
            getSnapshot: () => ({ documentStyle: { documentFlavor: DocumentFlavor.MODERN } }),
        };
        const removedDoc = { getUnitId: () => 'doc-3' };
        const canvasElement = { style: {} as Record<string, string> };
        const canvas = { setId: vi.fn(), getCanvasEle: vi.fn(() => canvasElement) };
        const modernCanvasElement = { style: {} as Record<string, string> };
        const modernCanvas = { setId: vi.fn(), getCanvasEle: vi.fn(() => modernCanvasElement) };
        const context = { setId: vi.fn() };
        const renderManagerService = {
            createRender$,
            created$,
            has: vi.fn(() => false),
            createRender: vi.fn(),
            removeRender: vi.fn(),
        };
        const instanceService = {
            getAllUnitsForType: vi.fn(() => [existingDoc]),
            getCurrentUnitOfType: vi.fn(() => existingDoc),
            getTypeOfUnitAdded$: vi.fn(() => added$),
            getTypeOfUnitDisposed$: vi.fn(() => disposed$),
        };

        const service = new DocsRenderService(instanceService as never, renderManagerService as never);

        expect(service).toBeInstanceOf(DocsRenderService);
        expect(renderManagerService.createRender).toHaveBeenCalledWith('doc-1');

        created$.next({
            unitId: 'doc-1',
            engine: {
                getCanvas: () => ({
                    ...canvas,
                    getContext: () => context,
                }),
            },
        });

        expect(canvas.setId).toHaveBeenCalledWith('univer-doc-main-canvas');
        expect(context.setId).toHaveBeenCalledWith('univer-doc-main-canvas');
        expect(canvasElement.style.backgroundColor).toBe('#fafafa');

        added$.next({ unit: addedDoc });
        created$.next({
            unitId: 'doc-2',
            engine: {
                getCanvas: () => ({
                    ...modernCanvas,
                    getContext: () => context,
                }),
            },
        });

        expect(modernCanvas.setId).toHaveBeenCalledWith('univer-doc-main-canvas');
        expect(modernCanvasElement.style.backgroundColor).toBe('#fff');

        createRender$.next('doc-4');
        disposed$.next(removedDoc);

        expect(renderManagerService.createRender).toHaveBeenCalledWith('doc-2');
        expect(renderManagerService.createRender).toHaveBeenCalledWith('doc-4');
        expect(renderManagerService.removeRender).toHaveBeenCalledWith('doc-3');
    });

    it('resolves doc render backgrounds by render role', () => {
        const canvasColorService = {
            getRenderColor: vi.fn((color: string) => `rendered:${color}`),
        };

        expect(getDocsCanvasBackgroundColor(DocumentFlavor.MODERN, canvasColorService as never)).toBe('rendered:#fff');
        expect(getDocsCanvasBackgroundColor(DocumentFlavor.TRADITIONAL, canvasColorService as never)).toBe('rendered:#fafafa');
        expect(resolveDocRenderBackground({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            canvasColorService: canvasColorService as never,
            editorBackgroundColor: '#fff',
            isEditor: true,
        })).toEqual({
            canvasElementBackgroundColor: '#fff',
            docBackgroundFillColor: 'transparent',
        });
        expect(resolveDocRenderBackground({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            canvasColorService: canvasColorService as never,
            isEditor: true,
        })).toEqual({
            canvasElementBackgroundColor: 'transparent',
            docBackgroundFillColor: 'transparent',
        });
    });

    it('keeps print interceptor defaults as pass-through and stores component mappings', () => {
        const service = new DocPrintInterceptorService();
        const interceptPoints = service.interceptor.getInterceptPoints();
        const domCollection = { dispose: vi.fn() };

        service.registerPrintComponent('doc-component', 'print-doc-component');

        const collectComponents = service.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_COMPONENT_COLLECT);
        const collectDom = service.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_DOM_COLLECT);

        expect(service.getPrintComponent('doc-component')).toBe('print-doc-component');
        expect(collectComponents(undefined, {
            unitId: 'test-doc',
        } as never)).toBeUndefined();
        expect(collectDom(domCollection as never, {
            unitId: 'test-doc',
        } as never)).toBe(domCollection);
    });
});
