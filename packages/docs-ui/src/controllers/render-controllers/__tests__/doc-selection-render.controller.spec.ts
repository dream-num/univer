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

import type { EmbedInteractionBoundaryService } from '../../../services/doc-embed-integration.service';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EmbedRuntimeFocusCoordinator } from '../../../services/doc-embed-integration.service';
import { CURSOR_TYPE, DocumentEditArea } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SetDocZoomRatioOperation } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import { DocSelectionRenderController } from '../doc-selection-render.controller';

const neoGetDocObjectMock = vi.hoisted(() => vi.fn());
const findFirstCursorOffsetMock = vi.hoisted(() => vi.fn(() => 3));

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
            return { dispose: vi.fn(() => handlers.delete(handler)) };
        }),
        emit: (evt: any, state?: any) => handlers.forEach((handler) => handler(evt, state)),
    };
}

function createController(options: { readonly?: boolean; hasEditor?: boolean; embedRecentInteraction?: boolean; embedContains?: boolean; unitId?: string; currentSelectionUnitId?: string; embedRuntimeFocusCoordinator?: EmbedRuntimeFocusCoordinator } = {}) {
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
    const scene = {
        resetCursor: vi.fn(),
        getViewports: vi.fn(() => [{
            transformVector2SceneCoord: vi.fn(() => ({ x: 1, y: 2 })),
        }]),
    };
    neoGetDocObjectMock.mockReturnValue({ document, scene });
    const skeleton = {
        findEditAreaByCoord: vi.fn(() => ({ editArea: DocumentEditArea.HEADER })),
    };
    const viewModel = {
        getEditArea: vi.fn(() => DocumentEditArea.FOOTER),
        setEditArea: vi.fn(),
    };
    const docSelectionRenderService = {
        removeAllRanges: vi.fn(),
        addDocRanges: vi.fn(),
        textSelectionInner$,
        focus: vi.fn(),
        __onPointDown: vi.fn(),
        __handleDblClick: vi.fn(),
        __handleTripleClick: vi.fn(),
        setCursorManually: vi.fn(),
        isOnPointerEvent: false,
    };
    const docSelectionManagerService = {
        refreshSelection$,
        __replaceTextRangesWithNoRefresh: vi.fn(),
        __getCurrentSelection: vi.fn(() => ({ unitId: options.currentSelectionUnitId ?? options.unitId ?? 'doc-1' })),
        refreshSelection: vi.fn(),
        replaceDocRanges: vi.fn(),
    };
    const editor = options.hasEditor
        ? { isReadOnly: vi.fn(() => options.readonly ?? false) }
        : null;
    const editorService = {
        getEditor: vi.fn(() => editor),
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
    const controller = new DocSelectionRenderController(
        {
            unitId: options.unitId ?? 'doc-1',
            unit: { getSnapshot: vi.fn(() => ({ body: { dataStream: 'abc\r\n' } })) },
        } as never,
        {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
        } as never,
        editorService as never,
        instanceService as never,
        docSelectionRenderService as never,
        {
            getSkeleton: vi.fn(() => skeleton),
            getViewModel: vi.fn(() => viewModel),
            currentSkeleton$,
        } as never,
        docSelectionManagerService as never,
        embedInteractionBoundaryService as unknown as EmbedInteractionBoundaryService,
        options.embedRuntimeFocusCoordinator as never
    );

    return {
        controller,
        document,
        scene,
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
        embedInteractionBoundaryService,
    };
}

describe('DocSelectionRenderController', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        neoGetDocObjectMock.mockReset();
        findFirstCursorOffsetMock.mockClear();
    });

    it('syncs selection manager refreshes and inner render selections', () => {
        const { controller, refreshSelection$, textSelectionInner$, docSelectionRenderService, docSelectionManagerService } = createController();
        const docRanges = [{ startOffset: 1, endOffset: 2 }];

        refreshSelection$.next({ unitId: 'other-doc', docRanges });
        refreshSelection$.next({ unitId: 'doc-1', docRanges, isEditing: true, options: { segmentId: 'header' } });
        textSelectionInner$.next([{ startOffset: 3, endOffset: 4 }]);

        expect(docSelectionRenderService.removeAllRanges).toHaveBeenCalledTimes(1);
        expect(docSelectionRenderService.addDocRanges).toHaveBeenCalledWith(docRanges, true, { segmentId: 'header' });
        expect(docSelectionManagerService.__replaceTextRangesWithNoRefresh).toHaveBeenCalledWith(
            [{ startOffset: 3, endOffset: 4 }],
            { unitId: 'doc-1', subUnitId: 'doc-1' }
        );

        controller.dispose();
    });

    it('initializes the visible document selection when skeleton becomes available and refreshes on zoom', () => {
        const { controller, currentSkeleton$, commandHandlers, docSelectionRenderService, docSelectionManagerService } = createController();

        currentSkeleton$.next({ id: 'skeleton' });
        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'other-doc' } });
        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'doc-1' } });

        expect(docSelectionRenderService.focus).toHaveBeenCalled();
        expect(docSelectionManagerService.replaceDocRanges).toHaveBeenCalledWith(
            [{ startOffset: 3, endOffset: 3 }],
            { unitId: 'doc-1', subUnitId: 'doc-1' },
            false
        );
        expect(docSelectionManagerService.refreshSelection).toHaveBeenCalledTimes(1);

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
