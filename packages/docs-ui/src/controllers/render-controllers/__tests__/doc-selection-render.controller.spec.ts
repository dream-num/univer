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

import { CURSOR_TYPE, DocumentEditArea } from '@univerjs/engine-render';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EmbedInteractionBoundaryService } from '@univerjs/embed-ui';
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

function createController(options: { readonly?: boolean; hasEditor?: boolean; embedRecentInteraction?: boolean; embedContains?: boolean } = {}) {
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
        __getCurrentSelection: vi.fn(() => ({ unitId: 'doc-1' })),
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
    };
    const controller = new DocSelectionRenderController(
        {
            unitId: 'doc-1',
            unit: { getSnapshot: vi.fn(() => ({ body: { dataStream: 'abc\r\n' } })) },
        } as never,
        {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
        } as never,
        editorService as never,
        {
            getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'other-doc' })),
            setCurrentUnitForType: vi.fn(),
        } as never,
        docSelectionRenderService as never,
        {
            getSkeleton: vi.fn(() => skeleton),
            getViewModel: vi.fn(() => viewModel),
            currentSkeleton$,
        } as never,
        docSelectionManagerService as never,
        embedInteractionBoundaryService as unknown as EmbedInteractionBoundaryService
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

    it('does not refresh host document selection during recent embed interaction zoom refreshes', () => {
        const { controller, commandHandlers, docSelectionManagerService } = createController({ embedRecentInteraction: true });

        commandHandlers[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'doc-1' } });

        expect(docSelectionManagerService.refreshSelection).not.toHaveBeenCalled();

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

    it('asks the embed interaction boundary service before treating host-canvas gestures as document selection', () => {
        const {
            controller,
            document,
            docSelectionRenderService,
            embedInteractionBoundaryService,
        } = createController({ hasEditor: true, embedContains: true });
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

        expect(embedInteractionBoundaryService.contains).toHaveBeenCalledWith(undefined, hostCanvas, expect.objectContaining({
            clientX: 150,
            clientY: 320,
        }));
        expect(docSelectionRenderService.__onPointDown).not.toHaveBeenCalled();
        expect(docSelectionRenderService.__handleDblClick).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();

        Object.defineProperty(window.document, 'elementFromPoint', {
            configurable: true,
            value: previousElementFromPoint,
        });
        controller.dispose();
    });
});
