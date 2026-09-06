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

import type { IDocumentData } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import type { EmbedInteractionBoundaryService } from '../../../services/doc-embed-integration.service';
import {
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentFlavor,
    ICommandService,
    IContextService,
    IUniverInstanceService,
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
    CURSOR_TYPE,
    DocumentEditArea,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
    RenderManagerService,
    Viewport,
} from '@univerjs/engine-render';
import { CanvasPopupService, ContextMenuPosition, DesktopLayoutService, ICanvasPopupService, IContextMenuService, ILayoutService, MOBILE_UI_MODE } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VIEWPORT_KEY } from '../../../basics/docs-view-key';
import { SetDocZoomRatioOperation } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import {
    EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    EmbedRuntimeFocusCoordinator,
    IDocEmbedInteractionBoundaryService,
    IDocEmbedRuntimeFocusCoordinator,
} from '../../../services/doc-embed-integration.service';
import { EditorService, IEditorService } from '../../../services/editor/editor-manager.service';
import { DocMobileElementMenuService } from '../../../services/doc-mobile-element-menu.service';
import { DocCanvasPopManagerService } from '../../../services/doc-popup-manager.service';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { DocSelectionRenderController } from '../doc-selection-render.controller';

const neoGetDocObjectMock = vi.hoisted(() => vi.fn());
const findFirstCursorOffsetMock = vi.hoisted(() => vi.fn<(snapshot: IDocumentData) => number>(() => 3));

vi.mock('../../../basics/component-tools', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../basics/component-tools')>();

    return {
        ...actual,
        neoGetDocObject: neoGetDocObjectMock,
    };
});

vi.mock('../../../basics/selection', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../basics/selection')>();

    return {
        ...actual,
        findFirstCursorOffset: findFirstCursorOffsetMock,
    };
});

function createEventSubject() {
    const handlers = new Set<(evt: any, state?: any) => void>();

    return {
        subscribeEvent: vi.fn((handler: (evt: any, state?: any) => void) => {
            handlers.add(handler);
            const remove = vi.fn(() => handlers.delete(handler));
            return { dispose: remove, unsubscribe: remove };
        }),
        emit: (evt: any, state?: any) => handlers.forEach((handler) => handler(evt, state)),
    };
}

function createController(options: { readonly?: boolean; hasEditor?: boolean; preserveHostFocus?: boolean; embedRecentInteraction?: boolean; embedContains?: boolean; mobile?: boolean; editing?: boolean; mobileEditMode?: boolean; focusing?: boolean; activeOffset?: number; nextActiveOffset?: number; documentFlavor?: DocumentFlavor; scale?: number; unitId?: string; currentSelectionUnitId?: string; embedRuntimeFocusCoordinator?: EmbedRuntimeFocusCoordinator } = {}) {
    const refreshSelection$ = new Subject<any>();
    const textSelectionInner$ = new Subject<any>();
    const currentSkeleton$ = new Subject<any>();
    const commandHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
    const documentTransform = {
        clone: vi.fn(() => ({
            invert: vi.fn(() => ({
                applyPoint: vi.fn(() => ({ x: 10, y: 20 })),
            })),
        })),
    };
    const document = {
        cursor: CURSOR_TYPE.DEFAULT,
        onPointerEnter$: createEventSubject(),
        onPointerLeave$: createEventSubject(),
        onPointerDown$: createEventSubject(),
        onDblclick$: createEventSubject(),
        onTripleClick$: createEventSubject(),
        getOffsetConfig: vi.fn(() => ({
            documentTransform,
            pageLayoutType: 0,
            pageMarginLeft: 12,
            pageMarginTop: 16,
        })),
    };
    const pointerDown$ = createEventSubject();
    const pointerMove$ = createEventSubject();
    const pointerUp$ = createEventSubject();
    const viewport = {
        transformVector2SceneCoord: vi.fn(() => ({ x: 1, y: 2 })),
        scrollByViewportDeltaVal: vi.fn(),
    };
    const canvas = window.document.createElement('canvas');
    canvas.getBoundingClientRect = () => ({
        bottom: 700,
        height: 500,
        left: 100,
        right: 530,
        top: 200,
        width: 430,
        x: 100,
        y: 200,
        toJSON: () => ({}),
    } as DOMRect);
    const engine = {
        width: 430,
        height: 500,
        getCanvasElement: vi.fn(() => canvas),
    };
    const transformer = { clearSelectedObjects: vi.fn() };
    const scene = {
        scaleX: options.scale ?? 1,
        scaleY: options.scale ?? 1,
        getTransformer: () => transformer,
        resetCursor: vi.fn(),
        getEngine: vi.fn(() => engine),
        getViewport: vi.fn(() => viewport),
        getViewports: vi.fn(() => [viewport]),
        onPointerDown$: pointerDown$,
        onPointerMove$: pointerMove$,
        onPointerUp$: pointerUp$,
        onPointerCancel$: createEventSubject(),
    };
    neoGetDocObjectMock.mockReturnValue({ document, scene });
    const skeleton = {
        findEditAreaByCoord: vi.fn(() => ({ editArea: DocumentEditArea.HEADER })),
    };
    const viewModel = {
        getEditArea: vi.fn(() => DocumentEditArea.FOOTER),
        setEditArea: vi.fn(),
    };
    let activeOffset = options.activeOffset ?? 3;
    const docSelectionRenderService = {
        removeAllRanges: vi.fn(),
        addDocRanges: vi.fn(),
        replaceDocRanges: vi.fn(),
        textSelectionInner$,
        focus: vi.fn(),
        __onPointDown: vi.fn(),
        __handleDblClick: vi.fn(),
        __handleTripleClick: vi.fn(),
        setCursorManually: vi.fn(() => {
            activeOffset = options.nextActiveOffset ?? activeOffset;
        }),
        getActiveTextRange: vi.fn(() => ({ collapsed: true, startOffset: activeOffset, endOffset: activeOffset })),
        enterMobileEditMode: vi.fn(),
        exitMobileEditMode: vi.fn(),
        suspendMobileEditingInput: vi.fn(),
        exitEditing: vi.fn(),
        isOnPointerEvent: false,
        isFocusing: options.focusing ?? false,
        isEditing: options.editing ?? false,
        isMobileEditMode: options.mobileEditMode ?? options.editing ?? false,
    };
    const docSelectionManagerService = {
        refreshSelection$,
        __replaceTextRangesWithNoRefresh: vi.fn(),
        __getCurrentSelection: vi.fn(() => ({ unitId: options.currentSelectionUnitId ?? options.unitId ?? 'doc-1' })),
        refreshSelection: vi.fn(),
        replaceDocRanges: vi.fn(),
        replaceSelectionInfoWithoutRefresh: vi.fn(),
    };
    const editor = options.hasEditor
        ? { isReadOnly: vi.fn(() => options.readonly ?? false) }
        : null;
    const editorService = {
        getEditor: vi.fn(() => editor),
        getEditorRenderConfig: vi.fn(() => ({ preserveHostFocus: options.preserveHostFocus })),
        focus: vi.fn(),
        getFocusId: vi.fn(() => null),
    };
    const embedInteractionBoundaryService = {
        contains: vi.fn(() => options.embedContains ?? false),
        hasRecentInteraction: vi.fn(() => options.embedRecentInteraction ?? false),
        hasRecentInteractionFor: vi.fn(() => options.embedRecentInteraction ?? false),
    };
    const instanceService = {
        getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'other-doc' })),
        setCurrentUnitForType: vi.fn(),
        focusUnit: vi.fn(),
    };
    const contextMenuService = {
        visible: false,
        triggerContextMenu: vi.fn(),
        hideContextMenu: vi.fn(),
    };
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.get(IContextService).setContextValue(MOBILE_UI_MODE, options.mobile ?? false);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
    injector.add([DocCanvasPopManagerService]);
    injector.add([DocMobileElementMenuService]);
    const child = injector.createChild([
        [ICommandService, { useValue: {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
        } }],
        [IEditorService, { useValue: editorService }],
        [IUniverInstanceService, { useValue: instanceService }],
        [DocSelectionRenderService, { useValue: docSelectionRenderService }],
        [DocSkeletonManagerService, { useValue: {
            getSkeleton: vi.fn(() => skeleton),
            getViewModel: vi.fn(() => viewModel),
            currentSkeleton$,
        } }],
        [DocSelectionManagerService, { useValue: docSelectionManagerService }],
        [IContextService, { useValue: {
            getContextValue: vi.fn((key) => key === MOBILE_UI_MODE && (options.mobile ?? false)),
        } }],
        [IContextMenuService, { useValue: contextMenuService }],
        [IDocEmbedInteractionBoundaryService, { useValue: embedInteractionBoundaryService }],
    ]);
    if (options.embedRuntimeFocusCoordinator) {
        child.add([IDocEmbedRuntimeFocusCoordinator, { useValue: options.embedRuntimeFocusCoordinator }]);
    }
    const controller = child.createInstance(DocSelectionRenderController, {
        unitId: options.unitId ?? 'doc-1',
        unit: {
            getSnapshot: vi.fn(() => ({
                body: { dataStream: 'abc\r\n' },
                documentStyle: { documentFlavor: options.documentFlavor ?? DocumentFlavor.UNSPECIFIED },
            })),
        },
        scene,
        engine,
    } as never);
    controller.disposeWithMe(() => univer.dispose());

    return {
        elementMenu: injector.get(DocMobileElementMenuService),
        controller,
        transformer,
        document,
        scene,
        canvas,
        pointerDown$,
        pointerMove$,
        pointerUp$,
        viewport,
        skeleton,
        viewModel,
        refreshSelection$,
        textSelectionInner$,
        currentSkeleton$,
        commandHandlers,
        docSelectionRenderService,
        docSelectionManagerService,
        editorService,
        instanceService,
        contextMenuService,
        embedInteractionBoundaryService,
    };
}

describe('DocSelectionRenderController', () => {
    it.each([
        { mobile: true, focusing: true, button: 0, prevented: true },
        { mobile: true, focusing: false, button: 0, prevented: false },
        { mobile: false, focusing: true, button: 0, prevented: false },
        { mobile: true, focusing: true, button: 2, prevented: false },
    ])('preserves input focus only for mobile primary canvas clicks: %j', ({ mobile, focusing, button, prevented }) => {
        const { controller, canvas, docSelectionRenderService } = createController({ mobile, focusing });
        const event = new MouseEvent('mousedown', { button, cancelable: true });

        canvas.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(prevented);
        expect(docSelectionRenderService.focus).not.toHaveBeenCalled();

        controller.dispose();
        const afterDispose = new MouseEvent('mousedown', { button, cancelable: true });
        canvas.dispatchEvent(afterDispose);
        expect(afterDispose.defaultPrevented).toBe(false);
    });

    it.each(['swipe', 'cancel', 'long press'])('does not open an element menu after a %s', (gesture) => {
        vi.useFakeTimers();
        const { controller, elementMenu, document, scene, pointerMove$, pointerUp$ } = createController({ mobile: true });
        const show = vi.spyOn(elementMenu, 'show');
        elementMenu.capture({
            unitId: 'doc-1',
            rect: { left: 10, top: 10, right: 100, bottom: 40 },
            onEdit: vi.fn(),
            onDelete: vi.fn(),
        });
        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        if (gesture === 'swipe') {
            pointerMove$.emit({ offsetX: 20, offsetY: 100 });
        } else if (gesture === 'cancel') {
            scene.onPointerCancel$.emit({});
        } else {
            vi.advanceTimersByTime(430);
        }
        pointerUp$.emit({ offsetX: 20, offsetY: 100 });
        expect(show).not.toHaveBeenCalled();
        expect(elementMenu.takeTarget('doc-1')).toBeNull();
        controller.dispose();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        neoGetDocObjectMock.mockReset();
        findFirstCursorOffsetMock.mockClear();
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('preserves the editing selection across synchronous layout publications (flavor %s)', async (documentFlavor) => {
        const componentTools = await vi.importActual<typeof import('../../../basics/component-tools')>('../../../basics/component-tools');
        const selectionTools = await vi.importActual<typeof import('../../../basics/selection')>('../../../basics/selection');
        neoGetDocObjectMock.mockImplementation(componentTools.neoGetDocObject);
        findFirstCursorOffsetMock.mockImplementation(selectionTools.findFirstCursorOffset);
        vi.useFakeTimers();
        const univer = new Univer();
        const root = document.createElement('div');
        document.body.appendChild(root);
        try {
            const injector = univer.__getInjector();
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([DocLayoutExecutorService]);
            injector.add([DocSelectionManagerService]);
            injector.add([IEditorService, { useClass: EditorService }]);
            injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
            injector.get(ILayoutService).registerRootContainerElement(root);
            injector.get(ICommandService).registerCommand(SetTextSelectionsOperation);
            const dataStream = 'First paragraph\r\r\rLast paragraph\r\n';
            const unit = univer.createUnit(UniverInstanceType.UNIVER_DOC, {
                id: 'selection-layout-test',
                body: {
                    dataStream,
                    paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({
                        startIndex: match.index!,
                        paragraphId: `paragraph-${index}`,
                    })),
                    sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'body' }],
                },
                documentStyle: {
                    documentFlavor,
                    pageSize: { width: 400, height: 600 },
                    marginLeft: 20,
                    marginRight: 20,
                    marginTop: 20,
                    marginBottom: 20,
                },
            });
            const unitId = unit.getUnitId();
            injector.get(IUniverInstanceService).setCurrentUnitForType(unitId);
            const render = injector.get(IRenderManagerService).createRender(unitId) as RenderUnit;
            render.deactivate();
            render.engine.resizeBySize(400, 600);
            render.addRenderDependencies([[DocSkeletonManagerService]]);
            const skeletonManager = render.with(DocSkeletonManagerService);
            expect(skeletonManager.supportsIncrementalLayout()).toBe(false);
            const documents = new Documents('doc-main', skeletonManager.getSkeleton(), { pageMarginTop: 20, pageMarginLeft: 0 });
            documents.resize(400, 600);
            render.mainComponent = documents;
            render.scene.addObject(documents);
            const viewport = new Viewport(VIEWPORT_KEY.VIEW_MAIN, render.scene, { left: 0, top: 0, width: 400, height: 600, active: true });
            viewport.resetCanvasSizeAndUpdateScroll();
            render.addRenderDependencies([[DocSelectionRenderService], [DocSelectionRenderController]]);
            render.with(DocSelectionRenderController);
            const selections = injector.get(DocSelectionManagerService);
            expect(selections.getActiveTextRange()?.startOffset).toBe(0);

            for (const [startOffset, endOffset] of [[1, 1], [2, 2], [3, 3], [5, 9]]) {
                selections.replaceSelectionInfoWithoutRefresh({
                    ...selections.getSelectionInfo()!,
                    textRanges: [{ startOffset, endOffset, collapsed: startOffset === endOffset, isActive: true }],
                    isEditing: true,
                }, { unitId, subUnitId: unitId });
                skeletonManager.recalculate();
                expect(selections.getActiveTextRange()).toMatchObject({ startOffset, endOffset });
                expect(selections.getSelectionInfo()?.isEditing).toBe(true);
            }
        } finally {
            univer.dispose();
            root.remove();
            findFirstCursorOffsetMock.mockImplementation(() => 3);
        }
    });

    it('syncs selection manager refreshes and inner render selections', () => {
        const { controller, refreshSelection$, textSelectionInner$, docSelectionRenderService, docSelectionManagerService } = createController();
        const docRanges = [{ startOffset: 1, endOffset: 2 }];

        refreshSelection$.next({ unitId: 'other-doc', docRanges });
        refreshSelection$.next({ unitId: 'doc-1', docRanges, isEditing: true, options: { segmentId: 'header' } });
        textSelectionInner$.next([{ startOffset: 3, endOffset: 4 }]);

        expect(docSelectionRenderService.replaceDocRanges).toHaveBeenCalledWith(docRanges, true, { segmentId: 'header' });
        expect(docSelectionManagerService.__replaceTextRangesWithNoRefresh).toHaveBeenCalledWith(
            [{ startOffset: 3, endOffset: 4 }],
            { unitId: 'doc-1', subUnitId: 'doc-1' }
        );

        controller.dispose();
    });

    it('initializes the visible document selection when skeleton becomes available and refreshes on zoom', () => {
        const { controller, currentSkeleton$, commandHandlers, docSelectionRenderService, docSelectionManagerService } = createController();

        currentSkeleton$.next({ id: 'skeleton' });
        currentSkeleton$.next({ id: 'republished-skeleton' });
        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'other-doc' } });
        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'doc-1' } });

        expect(docSelectionRenderService.focus).toHaveBeenCalledOnce();
        expect(docSelectionManagerService.replaceSelectionInfoWithoutRefresh).toHaveBeenCalledOnce();
        expect(docSelectionManagerService.replaceSelectionInfoWithoutRefresh).toHaveBeenCalledWith(
            {
                textRanges: [{
                    startOffset: 3,
                    endOffset: 3,
                    collapsed: true,
                    isActive: true,
                }],
                rectRanges: [],
                segmentId: '',
                segmentPage: -1,
                isEditing: false,
                style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            },
            { unitId: 'doc-1', subUnitId: 'doc-1' }
        );
        expect(docSelectionManagerService.refreshSelection).toHaveBeenNthCalledWith(
            1,
            { unitId: 'doc-1', subUnitId: 'doc-1' },
            false
        );
        expect(docSelectionManagerService.refreshSelection).toHaveBeenNthCalledWith(2);

        controller.dispose();
    });

    it('does not refresh host document selection while a child session owns focus during zoom refreshes', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'doc-1',
        });
        const { controller, commandHandlers, docSelectionManagerService } = createController({
            embedRuntimeFocusCoordinator: focusCoordinator,
        });

        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'doc-1' } });

        expect(docSelectionManagerService.refreshSelection).not.toHaveBeenCalled();

        controller.dispose();
        lease.dispose();
    });

    it('does not refresh host document selection while an embedded child editor owns focus', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'sheet-cell-editor',
        });
        const { controller, commandHandlers, docSelectionManagerService } = createController({
            embedRecentInteraction: false,
            embedRuntimeFocusCoordinator: focusCoordinator,
        });

        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'doc-1' } });

        expect(docSelectionManagerService.refreshSelection).not.toHaveBeenCalled();

        lease.dispose();
        controller.dispose();
    });

    it('does not refresh host document selection while an embedded child session owns interaction', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
        });
        const { controller, commandHandlers, docSelectionManagerService } = createController({
            embedRecentInteraction: false,
            embedRuntimeFocusCoordinator: focusCoordinator,
        });

        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'doc-1' } });

        expect(docSelectionManagerService.refreshSelection).not.toHaveBeenCalled();

        lease.dispose();
        controller.dispose();
    });

    it('does not sync host document inner selections while an embedded child session owns interaction', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'doc-block-stage2-runtime',
            hostUnitId: 'doc-1',
            childUnitId: 'child-base',
        });
        const { controller, textSelectionInner$, docSelectionManagerService } = createController({
            embedRuntimeFocusCoordinator: focusCoordinator,
        });

        textSelectionInner$.next([{ startOffset: 1, endOffset: 1 }]);

        expect(docSelectionManagerService.__replaceTextRangesWithNoRefresh).not.toHaveBeenCalled();

        lease.dispose();
        controller.dispose();
    });

    it('still syncs embedded internal editor selections while a child session owns interaction', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'doc-block-stage2-runtime',
            hostUnitId: 'doc-1',
            childUnitId: 'child-sheet',
        });
        const { controller, textSelectionInner$, docSelectionManagerService } = createController({
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            embedRuntimeFocusCoordinator: focusCoordinator,
        });

        textSelectionInner$.next([{ startOffset: 1, endOffset: 3 }]);

        expect(docSelectionManagerService.__replaceTextRangesWithNoRefresh).toHaveBeenCalledWith(
            [{ startOffset: 1, endOffset: 3 }],
            { unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY, subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY }
        );

        lease.dispose();
        controller.dispose();
    });

    it('does not initialize host hidden editor selection when a child session owns the host document', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'doc-1',
            childUnitId: 'child-sheet',
        });
        const {
            controller,
            currentSkeleton$,
            docSelectionRenderService,
            docSelectionManagerService,
        } = createController({
            embedRuntimeFocusCoordinator: focusCoordinator,
        });

        currentSkeleton$.next({ id: 'skeleton' });

        expect(docSelectionRenderService.focus).not.toHaveBeenCalled();
        expect(docSelectionManagerService.replaceDocRanges).not.toHaveBeenCalled();
        expect(docSelectionManagerService.replaceSelectionInfoWithoutRefresh).not.toHaveBeenCalled();

        lease.dispose();
        controller.dispose();
    });

    it('does not let a host-scoped child session suppress unrelated host document selection refreshes', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
        });
        const { controller, commandHandlers, docSelectionManagerService } = createController({
            unitId: 'other-host-doc',
            currentSelectionUnitId: 'other-host-doc',
            embedRecentInteraction: false,
            embedRuntimeFocusCoordinator: focusCoordinator,
        });

        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'other-host-doc' } });

        expect(docSelectionManagerService.refreshSelection).toHaveBeenCalledTimes(1);

        lease.dispose();
        controller.dispose();
    });

    it('maps document pointer gestures to selection rendering and editor focus', () => {
        vi.useFakeTimers();
        const {
            controller,
            document,
            scene,
            viewModel,
            docSelectionRenderService,
            editorService,
            instanceService,
        } = createController({ hasEditor: true });
        const stopPropagation = vi.fn();

        document.onPointerEnter$.emit({});
        expect(document.cursor).toBe(CURSOR_TYPE.TEXT);
        document.onPointerLeave$.emit({});
        expect(document.cursor).toBe(CURSOR_TYPE.DEFAULT);
        expect(scene.resetCursor).toHaveBeenCalled();

        document.onPointerDown$.emit({ offsetX: 11, offsetY: 22, button: 0 }, { stopPropagation });
        vi.runOnlyPendingTimers();
        document.onDblclick$.emit({ offsetX: 11, offsetY: 22 });
        document.onTripleClick$.emit({ offsetX: 11, offsetY: 22 });

        expect(viewModel.setEditArea).toHaveBeenCalledWith(DocumentEditArea.HEADER);
        expect(docSelectionRenderService.__onPointDown).toHaveBeenCalled();
        expect(editorService.focus).toHaveBeenCalledWith('doc-1');
        expect(instanceService.focusUnit).toHaveBeenCalledWith('doc-1');
        expect(stopPropagation).toHaveBeenCalled();
        expect(docSelectionRenderService.__handleDblClick).toHaveBeenCalled();
        expect(docSelectionRenderService.__handleTripleClick).toHaveBeenCalled();

        controller.dispose();
    });

    it('keeps mobile text selection in reading mode until a tolerant double tap enters editing', () => {
        vi.useFakeTimers();
        const { controller, currentSkeleton$, document, pointerUp$, docSelectionRenderService, editorService } = createController({
            hasEditor: true,
            mobile: true,
        });

        currentSkeleton$.next({});
        expect(docSelectionRenderService.focus).not.toHaveBeenCalled();
        expect(docSelectionRenderService.exitMobileEditMode).toHaveBeenCalledOnce();

        const preventDefault = vi.fn();
        document.onPointerDown$.emit(
            { offsetX: 11, offsetY: 22, button: 0, cancelable: true, preventDefault },
            { stopPropagation: vi.fn() }
        );
        pointerUp$.emit({ offsetX: 11, offsetY: 22 });

        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(docSelectionRenderService.setCursorManually).not.toHaveBeenCalled();
        expect(docSelectionRenderService.exitMobileEditMode).toHaveBeenCalledOnce();
        expect(editorService.focus).not.toHaveBeenCalled();
        expect(preventDefault).toHaveBeenCalledOnce();

        vi.advanceTimersByTime(250);
        document.onPointerDown$.emit(
            { offsetX: 19, offsetY: 27, button: 0 },
            { stopPropagation: vi.fn() }
        );
        pointerUp$.emit({ offsetX: 19, offsetY: 27 });

        expect(editorService.focus).toHaveBeenCalledWith('doc-1');
        expect(docSelectionRenderService.enterMobileEditMode).toHaveBeenCalledOnce();
        expect(docSelectionRenderService.setCursorManually).toHaveBeenLastCalledWith(19, 27, true, true, { strict: false });

        document.onDblclick$.emit({ offsetX: 19, offsetY: 27 });
        document.onTripleClick$.emit({ offsetX: 19, offsetY: 27 });
        expect(docSelectionRenderService.enterMobileEditMode).toHaveBeenCalledOnce();
        expect(docSelectionRenderService.setCursorManually).toHaveBeenCalledOnce();
        expect(docSelectionRenderService.__handleTripleClick).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('scrolls a modern mobile document vertically without creating a caret', () => {
        const { controller, document, pointerMove$, pointerUp$, viewport, docSelectionRenderService, transformer } = createController({
            hasEditor: true,
            mobile: true,
            documentFlavor: DocumentFlavor.MODERN,
        });

        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 24, offsetY: 48 });
        pointerUp$.emit({ offsetX: 24, offsetY: 48 });

        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalledWith({
            viewportScrollX: 0,
            viewportScrollY: -18,
        });
        expect(docSelectionRenderService.setCursorManually).not.toHaveBeenCalled();
        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(transformer.clearSelectedObjects).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('keeps touch scrolling at screen-pixel speed after zooming a traditional document', () => {
        const { controller, document, pointerMove$, pointerUp$, viewport } = createController({
            mobile: true,
            documentFlavor: DocumentFlavor.TRADITIONAL,
            scale: 2,
        });

        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 24, offsetY: 48 });
        pointerUp$.emit({ offsetX: 24, offsetY: 48 });

        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalledWith({
            viewportScrollX: -2,
            viewportScrollY: -9,
        });

        controller.dispose();
    });

    it('lets a mobile element handle a confirmed tap without opening the generic menu', () => {
        vi.useFakeTimers();
        const { controller, document, elementMenu, pointerUp$, docSelectionRenderService } = createController({ mobile: true });
        const onTap = vi.fn();
        const show = vi.spyOn(elementMenu, 'show');
        elementMenu.capture({
            unitId: 'doc-1',
            rect: { left: 10, top: 10, right: 100, bottom: 40 },
            onTap,
            onEdit: vi.fn(),
            onDelete: vi.fn(),
        });

        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        vi.advanceTimersByTime(500);
        expect(docSelectionRenderService.__handleDblClick).not.toHaveBeenCalled();
        pointerUp$.emit({ offsetX: 20, offsetY: 30 });

        expect(onTap).toHaveBeenCalledOnce();
        expect(onTap).toHaveBeenCalledWith({ offsetX: 20, offsetY: 30 });
        expect(show).not.toHaveBeenCalled();
        controller.dispose();
    });

    it('routes a focused element drag to its selection without scrolling the document', () => {
        const { controller, document, elementMenu, pointerMove$, pointerUp$, viewport } = createController({ mobile: true });
        const onTap = vi.fn();
        const onDrag = vi.fn();
        elementMenu.capture({
            unitId: 'doc-1',
            rect: { left: 10, top: 10, right: 100, bottom: 80 },
            onTap,
            onDrag,
            onEdit: vi.fn(),
            onDelete: vi.fn(),
        });

        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 60, offsetY: 60 });
        pointerUp$.emit({ offsetX: 60, offsetY: 60 });

        expect(onDrag).toHaveBeenCalledWith({ offsetX: 60, offsetY: 60 });
        expect(onTap).not.toHaveBeenCalled();
        expect(viewport.scrollByViewportDeltaVal).not.toHaveBeenCalled();

        document.onPointerDown$.emit({ offsetX: 20, offsetY: 90, button: 0 }, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 20, offsetY: 120 });
        pointerUp$.emit({ offsetX: 20, offsetY: 120 });
        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalled();
        controller.dispose();
    });

    it('scrolls a mobile document when a gesture starts on an unhandled floating object', () => {
        const { controller, pointerDown$, pointerMove$, pointerUp$, viewport, docSelectionRenderService, transformer } = createController({
            hasEditor: true,
            mobile: true,
            documentFlavor: DocumentFlavor.MODERN,
        });
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();

        pointerDown$.emit(
            { offsetX: 20, offsetY: 30, button: 0, cancelable: true, preventDefault },
            { stopPropagation }
        );
        pointerMove$.emit({ offsetX: 24, offsetY: 48 });
        pointerUp$.emit({ offsetX: 24, offsetY: 48 });

        expect(preventDefault).toHaveBeenCalledOnce();
        expect(stopPropagation).toHaveBeenCalledOnce();
        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalledWith({
            viewportScrollX: 0,
            viewportScrollY: -18,
        });
        expect(docSelectionRenderService.setCursorManually).not.toHaveBeenCalled();
        expect(docSelectionRenderService.__handleDblClick).not.toHaveBeenCalled();
        expect(transformer.clearSelectedObjects).not.toHaveBeenCalled();

        controller.dispose();
    });

    it.each([false, true])('deselects drawings after a body tap in mobile edit mode %s', (editing) => {
        const { controller, document, pointerUp$, transformer } = createController({ mobile: true, editing });
        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        expect(transformer.clearSelectedObjects).not.toHaveBeenCalled();
        pointerUp$.emit({ offsetX: 20, offsetY: 30 });
        expect(transformer.clearSelectedObjects).toHaveBeenCalledOnce();
        controller.dispose();
    });

    it('deselects drawings when a mobile body long press starts selecting text', () => {
        vi.useFakeTimers();
        const { controller, document, transformer, docSelectionRenderService } = createController({ mobile: true });
        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        vi.advanceTimersByTime(500);
        expect(transformer.clearSelectedObjects).toHaveBeenCalledOnce();
        expect(docSelectionRenderService.__handleDblClick).toHaveBeenCalled();
        controller.dispose();
    });

    it('retains horizontal scrolling for a traditional mobile document', () => {
        const { controller, document, pointerMove$, pointerUp$, viewport } = createController({
            mobile: true,
            documentFlavor: DocumentFlavor.TRADITIONAL,
        });

        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 24, offsetY: 48 });
        pointerUp$.emit({ offsetX: 24, offsetY: 48 });

        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalledWith({
            viewportScrollX: -4,
            viewportScrollY: -18,
        });

        controller.dispose();
    });

    it('continues a mobile document flick with decelerating inertia and stops it on the next touch', () => {
        let pendingFrame: FrameRequestCallback | undefined;
        const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
            pendingFrame = callback;
            return requestAnimationFrame.mock.calls.length;
        });
        const cancelAnimationFrame = vi.fn();
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
        vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
        vi.spyOn(performance, 'now')
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(16)
            .mockReturnValueOnce(32)
            .mockReturnValueOnce(48);
        const { controller, document, pointerMove$, pointerUp$, viewport } = createController({
            mobile: true,
            documentFlavor: DocumentFlavor.MODERN,
        });

        document.onPointerDown$.emit({ offsetX: 20, offsetY: 130, button: 0 }, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 20, offsetY: 80 });
        pointerMove$.emit({ offsetX: 20, offsetY: 30 });
        pointerUp$.emit({ offsetX: 20, offsetY: 30 });

        expect(requestAnimationFrame).toHaveBeenCalledOnce();
        const firstFrame = pendingFrame;
        firstFrame?.(64);
        const secondFrame = pendingFrame;
        secondFrame?.(80);

        expect(viewport.scrollByViewportDeltaVal).toHaveBeenLastCalledWith({
            viewportScrollX: 0,
            viewportScrollY: expect.any(Number),
        });
        expect(viewport.scrollByViewportDeltaVal.mock.lastCall?.[0].viewportScrollY).toBeGreaterThan(0);

        const activeAnimationId = requestAnimationFrame.mock.results.at(-1)?.value;
        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        expect(cancelAnimationFrame).toHaveBeenCalledWith(activeAnimationId);

        controller.dispose();
    });

    it('moves the mobile caret on tap while preserving editing', () => {
        const { controller, document, pointerUp$, docSelectionRenderService } = createController({
            hasEditor: true,
            mobile: true,
            editing: true,
        });

        document.onPointerDown$.emit({ offsetX: 32, offsetY: 44, button: 0 }, { stopPropagation: vi.fn() });
        pointerUp$.emit({ offsetX: 32, offsetY: 44 });

        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(docSelectionRenderService.setCursorManually).toHaveBeenCalledWith(32, 44, true, true, { strict: false });

        controller.dispose();
    });

    it('uses canvas-relative client coordinates when iOS reports stale offsets after keyboard changes', () => {
        const { controller, document, pointerUp$, docSelectionRenderService } = createController({
            hasEditor: true,
            mobile: true,
            editing: true,
        });
        const event = {
            offsetX: 32,
            offsetY: -136,
            clientX: 132,
            clientY: 244,
            button: 0,
        };

        document.onPointerDown$.emit(event, { stopPropagation: vi.fn() });
        pointerUp$.emit(event);

        expect(docSelectionRenderService.setCursorManually).toHaveBeenCalledWith(32, 44, true, true, { strict: false });

        controller.dispose();
    });

    it('opens the mobile caret menu when the focused caret is tapped again', () => {
        const { controller, document, pointerUp$, contextMenuService } = createController({
            hasEditor: true,
            mobile: true,
            mobileEditMode: true,
            focusing: true,
            activeOffset: 7,
        });
        const event = { offsetX: 32, offsetY: 44, clientX: 132, clientY: 244, button: 0 };

        document.onPointerDown$.emit(event, { stopPropagation: vi.fn() });
        pointerUp$.emit(event);

        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(
            expect.objectContaining({ clientX: 132, clientY: 244 }),
            ContextMenuPosition.DOC_CARET,
            { unitId: 'doc-1', subUnitId: 'doc-1' }
        );

        controller.dispose();
    });

    it('moves a focused caret without opening the menu when the target offset changes', () => {
        const { controller, document, pointerUp$, contextMenuService } = createController({
            mobile: true,
            mobileEditMode: true,
            focusing: true,
            activeOffset: 7,
            nextActiveOffset: 9,
        });
        const event = { offsetX: 32, offsetY: 44, button: 0 };

        document.onPointerDown$.emit(event, { stopPropagation: vi.fn() });
        pointerUp$.emit(event);

        expect(contextMenuService.triggerContextMenu).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('treats small touch jitter as an editing tap', () => {
        const { controller, document, pointerMove$, pointerUp$, viewport, docSelectionRenderService } = createController({
            mobile: true,
            editing: true,
        });

        document.onPointerDown$.emit({ offsetX: 32, offsetY: 44, button: 0 }, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 40, offsetY: 47 });
        pointerUp$.emit({ offsetX: 40, offsetY: 47 });

        expect(viewport.scrollByViewportDeltaVal).not.toHaveBeenCalled();
        expect(docSelectionRenderService.setCursorManually).toHaveBeenCalledWith(32, 44, true, true, { strict: false });

        controller.dispose();
    });

    it('does not treat a canvas offset change during an iOS viewport resize as a drag', () => {
        const { controller, document, pointerMove$, pointerUp$, viewport, docSelectionRenderService } = createController({
            mobile: true,
            editing: true,
        });
        const pointerDownEvent = { offsetX: 32, offsetY: 44, clientX: 132, clientY: 244, button: 0 };

        document.onPointerDown$.emit(pointerDownEvent, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 32, offsetY: 104, clientX: 135, clientY: 247 });
        pointerUp$.emit({ offsetX: 32, offsetY: 104, clientX: 135, clientY: 247 });

        expect(viewport.scrollByViewportDeltaVal).not.toHaveBeenCalled();
        expect(docSelectionRenderService.suspendMobileEditingInput).not.toHaveBeenCalled();
        expect(docSelectionRenderService.setCursorManually).toHaveBeenCalledWith(32, 44, true, true, { strict: false });

        controller.dispose();
    });

    it('scrolls instead of selecting when dragging in mobile editing mode', () => {
        const { controller, document, pointerMove$, pointerUp$, viewport, docSelectionRenderService } = createController({
            mobile: true,
            editing: true,
            documentFlavor: DocumentFlavor.MODERN,
        });

        document.onPointerDown$.emit({ offsetX: 20, offsetY: 30, button: 0 }, { stopPropagation: vi.fn() });
        pointerMove$.emit({ offsetX: 23, offsetY: 50 });

        expect(docSelectionRenderService.suspendMobileEditingInput).not.toHaveBeenCalled();

        pointerUp$.emit({ offsetX: 23, offsetY: 50 });

        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalledWith({
            viewportScrollX: 0,
            viewportScrollY: -20,
        });
        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(docSelectionRenderService.setCursorManually).not.toHaveBeenCalled();
        expect(docSelectionRenderService.suspendMobileEditingInput).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('selects a mobile word on long press without entering editing', () => {
        vi.useFakeTimers();
        const { controller, document, pointerUp$, docSelectionRenderService, editorService } = createController({
            hasEditor: true,
            mobile: true,
        });
        const event = { offsetX: 20, offsetY: 30, button: 0 };

        document.onPointerDown$.emit(event, { stopPropagation: vi.fn() });
        vi.advanceTimersByTime(420);
        pointerUp$.emit(event);

        expect(docSelectionRenderService.__handleDblClick).toHaveBeenCalledWith(event, false, false);
        expect(docSelectionRenderService.setCursorManually).not.toHaveBeenCalled();
        expect(editorService.focus).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('selects on long press and keeps mobile edit mode active', () => {
        vi.useFakeTimers();
        const { controller, document, pointerUp$, docSelectionRenderService } = createController({
            mobile: true,
            editing: true,
        });
        const event = { offsetX: 20, offsetY: 30, button: 0 };

        document.onPointerDown$.emit(event, { stopPropagation: vi.fn() });
        vi.advanceTimersByTime(420);
        pointerUp$.emit(event);

        expect(docSelectionRenderService.__handleDblClick).toHaveBeenCalledWith(event, false, false);
        expect(docSelectionRenderService.suspendMobileEditingInput).toHaveBeenCalledOnce();
        expect(docSelectionRenderService.exitMobileEditMode).toHaveBeenCalledOnce();
        expect(docSelectionRenderService.setCursorManually).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('cancels deferred editor focus when the render controller is disposed', () => {
        vi.useFakeTimers();
        const { controller, document, docSelectionRenderService, editorService } = createController({ hasEditor: true });

        document.onPointerDown$.emit(
            { offsetX: 11, offsetY: 22, button: 0 },
            { stopPropagation: vi.fn() }
        );
        controller.dispose();
        vi.runOnlyPendingTimers();

        expect(editorService.focus).toHaveBeenCalledTimes(1);
        expect(docSelectionRenderService.setCursorManually).not.toHaveBeenCalled();
    });

    it('preserves the host unit focus for configured editors', () => {
        const { controller, document, editorService, instanceService } = createController({
            hasEditor: true,
            preserveHostFocus: true,
        });

        document.onPointerDown$.emit({ offsetX: 11, offsetY: 22, button: 0 }, { stopPropagation: vi.fn() });

        expect(editorService.focus).toHaveBeenCalledWith('doc-1');
        expect(instanceService.focusUnit).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('ignores pointer gestures that originate inside an embed interaction boundary', () => {
        const {
            controller,
            document,
            docSelectionRenderService,
        } = createController({ hasEditor: true });
        const stopPropagation = vi.fn();
        const embedTarget = window.document.createElement('div');
        embedTarget.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');

        document.onPointerDown$.emit({ offsetX: 11, offsetY: 22, button: 0, target: embedTarget }, { stopPropagation });
        document.onDblclick$.emit({ offsetX: 11, offsetY: 22, target: embedTarget });
        document.onTripleClick$.emit({ offsetX: 11, offsetY: 22, target: embedTarget });

        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(docSelectionRenderService.__handleDblClick).not.toHaveBeenCalled();
        expect(docSelectionRenderService.__handleTripleClick).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('ignores host canvas pointer gestures while a child runtime session owns the host document', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'doc-1',
            childUnitId: 'child-sheet',
        });
        const {
            controller,
            document,
            docSelectionRenderService,
            instanceService,
        } = createController({
            hasEditor: true,
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        const stopPropagation = vi.fn();
        const hostCanvas = window.document.createElement('canvas');

        document.onPointerDown$.emit({ offsetX: 11, offsetY: 22, button: 0, target: hostCanvas }, { stopPropagation });
        document.onDblclick$.emit({ offsetX: 11, offsetY: 22, target: hostCanvas });
        document.onTripleClick$.emit({ offsetX: 11, offsetY: 22, target: hostCanvas });

        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(docSelectionRenderService.__handleDblClick).not.toHaveBeenCalled();
        expect(docSelectionRenderService.__handleTripleClick).not.toHaveBeenCalled();
        expect(instanceService.focusUnit).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();

        lease.dispose();
        controller.dispose();
    });

    it('keeps embedded internal editors interactive inside their own embed boundary', () => {
        const {
            controller,
            document,
            docSelectionRenderService,
        } = createController({ hasEditor: true, unitId: '__INTERNAL_EDITOR__DOCS_NORMAL' });
        const stopPropagation = vi.fn();
        const embedTarget = window.document.createElement('canvas');
        embedTarget.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');

        document.onPointerDown$.emit({ offsetX: 11, offsetY: 22, button: 0, target: embedTarget }, { stopPropagation });
        document.onDblclick$.emit({ offsetX: 11, offsetY: 22, target: embedTarget });

        expect(docSelectionRenderService.__onPointDown).toHaveBeenCalled();
        expect(docSelectionRenderService.__handleDblClick).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();

        controller.dispose();
    });

    it('ignores pointer gestures when the event target is host canvas but the screen point is inside an embed boundary', () => {
        const {
            controller,
            document,
            docSelectionRenderService,
        } = createController({ hasEditor: true });
        const stopPropagation = vi.fn();
        const hostCanvas = window.document.createElement('canvas');
        const embedTarget = window.document.createElement('div');
        embedTarget.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        const previousElementFromPoint = window.document.elementFromPoint;
        Object.defineProperty(window.document, 'elementFromPoint', {
            configurable: true,
            value: vi.fn(() => embedTarget),
        });

        document.onPointerDown$.emit({ offsetX: 11, offsetY: 22, clientX: 100, clientY: 200, button: 0, target: hostCanvas }, { stopPropagation });

        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();

        Object.defineProperty(window.document, 'elementFromPoint', {
            configurable: true,
            value: previousElementFromPoint,
        });
        controller.dispose();
    });

    it('uses target canvas bounds and offset coordinates to detect embed boundary gestures', () => {
        const {
            controller,
            document,
            docSelectionRenderService,
        } = createController({ hasEditor: true });
        const stopPropagation = vi.fn();
        const hostCanvas = window.document.createElement('canvas');
        hostCanvas.getBoundingClientRect = () => ({
            bottom: 900,
            height: 800,
            left: 50,
            right: 1250,
            top: 100,
            width: 1200,
            x: 50,
            y: 100,
            toJSON: () => ({}),
        } as DOMRect);
        const embedTarget = window.document.createElement('div');
        embedTarget.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        const previousElementFromPoint = window.document.elementFromPoint;
        Object.defineProperty(window.document, 'elementFromPoint', {
            configurable: true,
            value: vi.fn((x: number, y: number) => x === 150 && y === 320 ? embedTarget : null),
        });

        document.onPointerDown$.emit({ offsetX: 100, offsetY: 220, button: 0, target: hostCanvas } as never, { stopPropagation });

        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();

        Object.defineProperty(window.document, 'elementFromPoint', {
            configurable: true,
            value: previousElementFromPoint,
        });
        controller.dispose();
    });

    it('suppresses host-canvas gestures while a child session owns focus', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'doc-1',
        });
        const {
            controller,
            document,
            docSelectionRenderService,
            embedInteractionBoundaryService,
        } = createController({ hasEditor: true, embedRuntimeFocusCoordinator: focusCoordinator });
        const stopPropagation = vi.fn();
        const hostCanvas = window.document.createElement('canvas');
        const previousElementFromPoint = window.document.elementFromPoint;
        Object.defineProperty(window.document, 'elementFromPoint', {
            configurable: true,
            value: vi.fn(() => null),
        });

        document.onPointerDown$.emit({
            offsetX: 100,
            offsetY: 220,
            clientX: 150,
            clientY: 320,
            button: 0,
            target: hostCanvas,
        } as never, { stopPropagation });
        document.onDblclick$.emit({
            offsetX: 100,
            offsetY: 220,
            clientX: 150,
            clientY: 320,
            target: hostCanvas,
        } as never);

        expect(embedInteractionBoundaryService.contains).not.toHaveBeenCalledWith(undefined, hostCanvas, expect.anything());
        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(docSelectionRenderService.__handleDblClick).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();

        Object.defineProperty(window.document, 'elementFromPoint', {
            configurable: true,
            value: previousElementFromPoint,
        });
        controller.dispose();
        lease.dispose();
    });
});
