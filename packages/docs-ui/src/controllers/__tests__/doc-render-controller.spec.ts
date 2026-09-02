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

import type { ICommandInfo, IExecutionOptions } from '@univerjs/core';
import type { IDocLayoutMountIdentity } from '@univerjs/docs';
import { CustomDecorationType, CustomRangeType, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DocumentFlavor, JSONX, PositionedObjectLayoutType } from '@univerjs/core';
import { DocLayoutSessionStatus, RichTextEditingMutation } from '@univerjs/docs';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DOCS_VIEW_KEY } from '../../basics/docs-view-key';
import { DocLayoutInteractionService } from '../../services/doc-layout-interaction.service';
import { DocBackScrollRenderController } from '../render-controllers/back-scroll.render-controller';
import { DocRenderController } from '../render-controllers/doc.render-controller';

const mockScrollBarProps = vi.hoisted(() => [] as unknown[]);

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/engine-render')>();
    const PageLayoutType = {
        VERTICAL: 0,
        HORIZONTAL: 1,
    };

    class MockDocComponent {
        width = 0;
        height = 0;
        pageMarginLeft: number;
        pageMarginTop: number;
        pageLayoutType = PageLayoutType.VERTICAL;
        zIndex = 0;

        fillColors: unknown[] | null = null;

        constructor(_key: string, _skeleton?: unknown, config?: { pageMarginLeft?: number; pageMarginTop?: number; backgroundFillColor?: string; pageFillColor?: string; pageStrokeColor?: string; marginStrokeColor?: string }) {
            this.pageMarginLeft = config?.pageMarginLeft ?? 0;
            this.pageMarginTop = config?.pageMarginTop ?? 0;
            this.fillColors = [
                config?.backgroundFillColor,
                config?.pageFillColor,
                config?.pageStrokeColor,
                config?.marginStrokeColor,
            ];
        }

        changeSkeleton() {
            return this;
        }

        resize(width: number, height: number) {
            this.width = width;
            this.height = height;
            return this;
        }

        makeDirty() {
            return this;
        }

        setFillColors(...colors: unknown[]) {
            this.fillColors = colors;
            return this;
        }

        getOffsetConfig() {
            return {
                docsLeft: 0,
                docsTop: 0,
            };
        }
    }

    return {
        ...actual,
        DOCS_COMPONENT_BACKGROUND_LAYER_INDEX: 0,
        DocBackground: MockDocComponent,
        Documents: MockDocComponent,
        IRenderManagerService: () => undefined,
        Layer: class MockLayer {
            constructor(..._args: unknown[]) { }
        },
        PageLayoutType,
        ScrollBar: class MockScrollBar {
            constructor(...args: unknown[]) {
                mockScrollBarProps.push(args[1]);
            }
        },
        Viewport: class MockViewport {
            onScrollAfter$ = {
                subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })),
            };

            constructor(..._args: unknown[]) { }
            onMouseWheel() { }
        },
    };
});

vi.mock('../../services/selection/convert-text-range', () => ({
    NodePositionConvertToCursor: class MockNodePositionConvertToCursor {
        getRangePointData(position: { page?: number }) {
            const top = (position.page ?? 0) * 900 + 120;
            return {
                borderBoxPointGroup: [],
                contentBoxPointGroup: [[
                    { x: 80, y: top },
                    { x: 80, y: top },
                    { x: 80, y: top + 20 },
                    { x: 80, y: top + 20 },
                ]],
                cursorList: [],
            };
        }
    },
}));

function createControllerFixture(options?: {
    documentFlavor?: DocumentFlavor;
    fitToWidth?: {
        align?: 'center' | 'start';
        mode?: 'none' | 'fit-width';
        target?: 'viewport' | 'container';
    };
    pendingEditorBackgroundColor?: string | null;
    pages?: Array<Record<string, unknown>>;
    viewBound?: { bottom: number; left: number; right: number; top: number };
    layoutProgress?: Array<{
        complete: boolean;
        anchorReady: boolean;
        didPublishAnchor?: boolean;
        interactionWindowComplete?: boolean;
        elapsedTime: number;
        estimatedHeight?: number;
        estimatedPageCount?: number;
        laidOutThrough?: number;
        stableLaidOutThrough?: number;
        mode?: 'paginated' | 'continuous';
        pageCount?: number;
        publishedPageCount?: number;
        processedBlockCount?: number;
        totalBlockCount?: number;
    }>;
    anchorPageType?: number;
    anchorPage?: number;
    anchorPageAfterPublication?: number;
    activeRange?: {
        startOffset: number;
        endOffset: number;
        isActive: boolean;
    };
    selectionIsEditing?: boolean;
    drawings?: Record<string, {
        layoutType: PositionedObjectLayoutType;
    }>;
    hasCompleteLayout?: boolean;
    initialSkeletonDataMissing?: boolean;
    useWorker?: boolean;
    workerCompletes?: boolean;
    workerCompletionPromise?: Promise<void>;
    workerReplacesProtectedPages?: boolean;
    focusedUnitId?: string;
    unitId?: string;
    supportsIncrementalLayout?: boolean;
    engineBeginFrame$?: Subject<number>;
    sceneParent?: { width: number; height: number };
    onWorkerStart?: (layoutInteractionService: DocLayoutInteractionService) => void;
}) {
    mockScrollBarProps.length = 0;
    const commandCallbacks: Array<(command: ICommandInfo, options?: IExecutionOptions) => void> = [];
    const darkMode$ = new BehaviorSubject<boolean>(false);
    const currentTheme$ = new BehaviorSubject<unknown>({});
    const compositionStart$ = new Subject<Record<string, unknown> | null>();
    const compositionEnd$ = new Subject<Record<string, unknown> | null>();
    const canvasElement = { style: {} as Record<string, string> };
    const canvasColorService = {
        getRenderColor: vi.fn((color: string) => color),
    };
    const layoutProgress = [...(options?.layoutProgress ?? [{
        complete: true,
        anchorReady: true,
        elapsedTime: 1,
    }])];
    let didPublishAnchor = false;
    let skeletonDataReadCount = 0;
    let publicationApplied = false;
    const skeleton = {
        calculate: vi.fn(),
        startIncrementalLayout: vi.fn(() => 1),
        stepIncrementalLayout: vi.fn(() => {
            const progress = layoutProgress.shift() ?? {
                complete: true,
                anchorReady: true,
                elapsedTime: 1,
            };
            const publishesAnchor = progress.didPublishAnchor ??
                (!didPublishAnchor && !progress.complete && progress.anchorReady);
            didPublishAnchor ||= publishesAnchor;
            return {
                generation: 1,
                publicationRevision: progress.complete ? 2 : 1,
                didPublish: progress.anchorReady,
                didPublishAnchor: publishesAnchor,
                publishedPageCount: progress.publishedPageCount ?? 1,
                reason: 'edit',
                mode: (options?.documentFlavor ?? DocumentFlavor.TRADITIONAL) === DocumentFlavor.MODERN
                    ? 'continuous'
                    : 'paginated',
                cancelled: false,
                laidOutThrough: 1,
                stableLaidOutThrough: 1,
                pageCount: progress.pageCount ?? 1,
                processedBlockCount: 1,
                totalBlockCount: 1,
                estimatedPageCount: 1,
                estimatedHeight: 900,
                maxBlockDuration: 1,
                interactionWindowComplete: false,
                ...progress,
            };
        }),
        cancelIncrementalLayout: vi.fn(),
        beginExternalLayout: vi.fn(),
        cancelExternalLayout: vi.fn(),
        applyLayoutPublication: vi.fn(() => {
            publicationApplied = true;
            return { didReplaceProtectedPages: options?.workerReplacesProtectedPages ?? false };
        }),
        getLayoutProgress: vi.fn(() => null),
        hasCompleteLayout: vi.fn(() => options?.hasCompleteLayout ?? true),
        findNodePositionByCharIndex: vi.fn(() => ({
            page: publicationApplied
                ? options?.anchorPageAfterPublication ?? options?.anchorPage ?? 0
                : options?.anchorPage ?? 0,
            pageType: options?.anchorPageType ?? 0,
        })),
        getSkeletonData: vi.fn(() => {
            if (options?.initialSkeletonDataMissing && skeletonDataReadCount++ === 0) {
                return null;
            }
            return {
                pages: options?.pages ?? [{
                    marginTop: 0,
                    pageWidth: 640,
                    pageHeight: 900,
                    sections: [],
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                }],
            };
        }),
        getViewModel: vi.fn(() => ({
            getDataModel: vi.fn(() => ({
                getSnapshot: vi.fn(() => ({ disabled: false })),
            })),
        })),
    };
    const unitId = options?.unitId ?? 'doc-unit';
    const skeletonManager = {
        currentSkeletonBefore$: new Subject(),
        getSkeleton: vi.fn(() => skeleton),
        supportsIncrementalLayout: vi.fn(() =>
            options?.supportsIncrementalLayout ?? (
                unitId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY &&
                (options?.documentFlavor ?? DocumentFlavor.TRADITIONAL) !== DocumentFlavor.UNSPECIFIED
            )),
        recalculate: vi.fn(() => {
            skeleton.calculate();
            return skeleton;
        }),
    };
    const viewport = {
        scrollX: 24,
        scrollY: 6_400,
        viewportScrollX: 48,
        viewportScrollY: 12_800,
        scrollByViewportDeltaVal: vi.fn(),
        calcViewportInfo: vi.fn(() => ({
            viewBound: options?.viewBound ?? {
                bottom: 1_000,
                left: 0,
                right: 1_500,
                top: 0,
            },
        })),
    };
    const context = {
        unitId,
        unit: {
            documentStyle: {
                documentFlavor: options?.documentFlavor ?? DocumentFlavor.TRADITIONAL,
            },
            getUnitId: vi.fn(() => unitId),
            getSnapshot: vi.fn(() => ({
                documentStyle: {
                    documentFlavor: options?.documentFlavor ?? DocumentFlavor.TRADITIONAL,
                },
                drawings: options?.drawings,
            })),
        },
        scene: {
            width: 1_500,
            height: 1_000,
            attachControl: vi.fn(),
            onMouseWheel$: { subscribeEvent: vi.fn() },
            addLayer: vi.fn(),
            addObjects: vi.fn(),
            enableLayerCache: vi.fn(),
            transformByState: vi.fn(),
            getViewport: vi.fn(() => viewport),
            getParent: vi.fn(() => options?.sceneParent),
        },
        engine: {
            beginFrame$: options?.engineBeginFrame$,
            canvasColorService,
            runRenderLoop: vi.fn(),
            stopRenderLoop: vi.fn(),
            getCanvas: vi.fn(() => ({
                getCanvasEle: vi.fn(() => canvasElement),
            })),
        },
        mainComponent: undefined as { width: number; height: number } | undefined,
        components: new Map(),
        activated$: new Subject<boolean>(),
    };
    const commandService = {
        onCommandExecuted: vi.fn((callback) => {
            commandCallbacks.push(callback);
            return { dispose: vi.fn() };
        }),
    };
    const pendingEditorRenderConfig = options?.pendingEditorBackgroundColor === undefined
        ? null
        : {
            canvasStyle: options.pendingEditorBackgroundColor == null
                ? {}
                : { backgroundColor: options.pendingEditorBackgroundColor },
        };
    const editorRenderConfig = pendingEditorRenderConfig;
    const pageLayoutService = {
        calculatePagePosition: vi.fn(),
    };
    const selectionManager = {
        refreshSelection: vi.fn(),
        getActiveTextRange: vi.fn(() => options?.activeRange),
        getSelectionInfo: vi.fn(() => ({
            isEditing: options?.selectionIsEditing ?? (options?.activeRange != null),
            rectRanges: [],
            textRanges: options?.activeRange == null ? [] : [options.activeRange],
        })),
    };
    const selectionRenderService = {
        __attachScrollEvent: vi.fn(),
        isOnPointerEvent: false,
        onCompositionstart$: compositionStart$,
        onCompositionend$: compositionEnd$,
    };
    const backScrollController = {
        scrollToRange: vi.fn(),
    };
    const renderManagerService = {
        getRenderUnitById: vi.fn(() => ({
            with: vi.fn((token) => token === DocBackScrollRenderController
                ? backScrollController
                : skeletonManager),
        })),
    };
    const layoutInteractionService = new DocLayoutInteractionService();
    const layoutExecutorService = {
        getExecutor: vi.fn(() => options?.useWorker ? {} : null),
        getExecutorStatus: vi.fn(() => ({ state: 'active' })),
        recoverExecutor: vi.fn(() => Promise.resolve()),
        completeRecovery: vi.fn(),
        recordHydrationDuration: vi.fn(),
        startLayout: vi.fn((identity: IDocLayoutMountIdentity, _options: unknown, _budgetMs: number) => {
            options?.onWorkerStart?.(layoutInteractionService);
            if (!options?.workerCompletes) {
                return new Promise(() => {});
            }

            const result = {
                status: DocLayoutSessionStatus.ACCEPTED,
                step: {
                    ...identity,
                    modelRevision: 1,
                    metricsRevision: 1,
                    publication: { pages: [] },
                    progress: {
                        generation: 2,
                        publicationRevision: 1,
                        didPublish: true,
                        didPublishAnchor: true,
                        publishedPageCount: 20,
                        reason: 'edit',
                        mode: 'paginated',
                        complete: true,
                        cancelled: false,
                        anchorReady: true,
                        laidOutThrough: 20_000,
                        stableLaidOutThrough: 20_000,
                        pageCount: 20,
                        processedBlockCount: 100,
                        totalBlockCount: 100,
                        estimatedPageCount: 20,
                        estimatedHeight: 18_000,
                        elapsedTime: 20,
                        maxBlockDuration: 3,
                        interactionWindowComplete: false,
                    },
                },
            };
            return options.workerCompletionPromise
                ? options.workerCompletionPromise.then(() => result)
                : Promise.resolve(result);
        }),
        stepLayout: vi.fn(),
        publishBacklog: vi.fn(),
        cancelLayout: vi.fn(() => Promise.resolve()),
        disposeLayoutMount: vi.fn(() => Promise.resolve()),
    };
    const Controller = DocRenderController as unknown as new (...args: unknown[]) => DocRenderController;
    const controller = new Controller(
        context,
        commandService,
        selectionRenderService,
        skeletonManager,
        {
            isEditor: vi.fn(() => editorRenderConfig != null),
            getEditor: vi.fn(() => null),
            getEditorRenderConfig: vi.fn(() => editorRenderConfig),
        },
        renderManagerService,
        {
            getCurrentUnitOfType: vi.fn(() => ({
                getUnitId: vi.fn(() => unitId),
            })),
            getFocusedUnit: vi.fn(() => ({
                getUnitId: vi.fn(() => options?.focusedUnitId ?? unitId),
            })),
        },
        pageLayoutService,
        selectionManager,
        {
            getOptions: vi.fn(() => ({
                mode: options?.fitToWidth?.mode ?? 'none',
                target: options?.fitToWidth?.target ?? 'viewport',
                align: options?.fitToWidth?.align ?? 'center',
            })),
        },
        { currentTheme$, darkMode$ },
        layoutExecutorService,
        layoutInteractionService,
        { error: vi.fn(), warn: vi.fn() }
    );

    return {
        commandCallbacks,
        controller,
        context,
        canvasElement,
        canvasColorService,
        currentTheme$,
        darkMode$,
        skeletonManager,
        viewport,
        backScrollController,
        pageLayoutService,
        selectionManager,
        selectionRenderService,
        compositionStart$,
        compositionEnd$,
        layoutExecutorService,
        layoutInteractionService,
    };
}

describe('doc render controller', () => {
    it.each([
        [DocumentFlavor.TRADITIONAL, 'gray.100'],
        [DocumentFlavor.MODERN, 'gray.0'],
    ])('resolves the %s workspace background again when dark mode changes', (documentFlavor, backgroundToken) => {
        const { canvasColorService, canvasElement, darkMode$ } = createControllerFixture({ documentFlavor });
        canvasColorService.getRenderColor.mockImplementation((color: string) => `dark:${color}`);

        darkMode$.next(true);

        expect(canvasColorService.getRenderColor).toHaveBeenLastCalledWith(backgroundToken);
        expect(canvasElement.style.backgroundColor).toBe(`dark:${backgroundToken}`);
    });

    it('keeps the unspecified workspace background unchanged when dark mode changes', () => {
        const { canvasColorService, canvasElement, darkMode$ } = createControllerFixture({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
        });
        canvasColorService.getRenderColor.mockImplementation((color: string) => `dark:${color}`);

        darkMode$.next(true);

        expect(canvasColorService.getRenderColor).not.toHaveBeenCalled();
        expect(canvasElement.style.backgroundColor).toBe('var(--univer-gray-100)');
    });

    it('resolves the workspace background again when the theme changes', () => {
        const { canvasColorService, canvasElement, currentTheme$ } = createControllerFixture({
            documentFlavor: DocumentFlavor.TRADITIONAL,
        });
        canvasColorService.getRenderColor.mockImplementation((color: string) => `theme:${color}`);

        currentTheme$.next({});

        expect(canvasColorService.getRenderColor).toHaveBeenLastCalledWith('gray.100');
        expect(canvasElement.style.backgroundColor).toBe('theme:gray.100');
    });

    it('disables only the horizontal scrollbar for container-fitted embedded docs', () => {
        createControllerFixture({
            fitToWidth: {
                mode: 'fit-width',
                target: 'container',
                align: 'start',
            },
        });

        expect(mockScrollBarProps[0]).toMatchObject({
            enableHorizontal: false,
        });
    });

    it('keeps the horizontal scrollbar for normal docs', () => {
        createControllerFixture();

        expect(mockScrollBarProps[0]).toMatchObject({
            enableHorizontal: true,
        });
    });

    it('treats a layout rerender without an explicit anchor as invalidated from the document start', () => {
        const { controller, skeletonManager } = createControllerFixture();
        const skeleton = skeletonManager.getSkeleton();

        controller.reRender('doc-unit');

        expect(skeleton.startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            anchor: 0,
            reason: 'edit',
        }));

        controller.dispose();
    });

    it('restarts an incomplete initial layout when a non-interactive rerender has no anchor', () => {
        const { controller, skeletonManager } = createControllerFixture({ hasCompleteLayout: false });
        const skeleton = skeletonManager.getSkeleton();

        controller.reRender('doc-unit');

        expect(skeleton.startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            reason: 'initial',
        }));
        expect(skeleton.startIncrementalLayout).not.toHaveBeenCalledWith(expect.objectContaining({
            anchor: 0,
        }));

        controller.dispose();
    });

    it('publishes the initial interaction window on Main before handing the tail to the Worker', async () => {
        const { controller, layoutExecutorService, skeletonManager } = createControllerFixture({
            useWorker: true,
            hasCompleteLayout: false,
            initialSkeletonDataMissing: true,
            pages: Array.from({ length: 5 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: Array.from({ length: 5 }, (_, pageIndex) => ({
                complete: false,
                anchorReady: true,
                didPublishAnchor: pageIndex === 0,
                interactionWindowComplete: pageIndex === 4,
                elapsedTime: 1,
                pageCount: 20,
                publishedPageCount: pageIndex + 1,
            })),
        });
        const skeleton = skeletonManager.getSkeleton();

        skeletonManager.currentSkeletonBefore$.next(skeleton);

        expect(skeleton.startIncrementalLayout).toHaveBeenCalledTimes(1);
        expect(skeleton.startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            reason: 'initial',
        }));
        expect(skeleton.beginExternalLayout).not.toHaveBeenCalled();

        for (let pageIndex = 0; pageIndex < 5; pageIndex++) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        }

        await vi.waitFor(() => {
            expect(skeleton.beginExternalLayout).toHaveBeenCalledWith({
                reason: 'initial',
                protectedRange: {
                    mode: 'paginated',
                    startPageIndex: 0,
                    endPageIndex: 4,
                },
            });
        });
        expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);

        controller.dispose();
    });

    it('refreshes page layout and selection after rich text mutations resize the document', async () => {
        const { commandCallbacks, pageLayoutService, selectionManager } = createControllerFixture();

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        expect(pageLayoutService.calculatePagePosition).toHaveBeenCalledTimes(1);
        expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(1);
    });

    it('coalesces synchronous changeset mutations into one incremental document layout', async () => {
        const { commandCallbacks, skeletonManager } = createControllerFixture();
        const mutation = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo;

        commandCallbacks[0](mutation, { fromChangeset: true });
        commandCallbacks[0](mutation, { fromChangeset: true });
        commandCallbacks[0](mutation, { fromChangeset: true });

        expect(skeletonManager.getSkeleton().calculate).not.toHaveBeenCalled();
        expect(skeletonManager.getSkeleton().startIncrementalLayout).not.toHaveBeenCalled();

        await Promise.resolve();

        expect(skeletonManager.getSkeleton().calculate).not.toHaveBeenCalled();
        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledTimes(1);
    });

    it('does not start document layout when an overlay-only drawing moves', () => {
        const { commandCallbacks, skeletonManager } = createControllerFixture({
            drawings: {
                'drawing-1': {
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                },
            },
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: JSONX.getInstance().replaceOp(
                    ['drawings', 'drawing-1', 'docTransform', 'positionH'],
                    { posOffset: 10 },
                    { posOffset: 20 }
                ),
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.getSkeleton().startIncrementalLayout).not.toHaveBeenCalled();
        expect(skeletonManager.recalculate).not.toHaveBeenCalled();
    });

    it.each([
        PositionedObjectLayoutType.INLINE,
        PositionedObjectLayoutType.WRAP_SQUARE,
        PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
    ])('reflows when a layout-participating drawing moves (layout type %s)', (layoutType) => {
        const { commandCallbacks, skeletonManager } = createControllerFixture({
            drawings: {
                'drawing-1': { layoutType },
            },
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: JSONX.getInstance().replaceOp(
                    ['drawings', 'drawing-1', 'docTransform', 'positionV'],
                    { posOffset: 10 },
                    { posOffset: 20 }
                ),
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledTimes(1);
        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            deferForeground: true,
        }));
    });

    it('reflows when a drawing switches between wrapping and overlay layout', () => {
        const { commandCallbacks, skeletonManager } = createControllerFixture({
            drawings: {
                'drawing-1': {
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                },
            },
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: JSONX.getInstance().replaceOp(
                    ['drawings', 'drawing-1', 'layoutType'],
                    PositionedObjectLayoutType.WRAP_SQUARE,
                    PositionedObjectLayoutType.WRAP_NONE
                ),
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledTimes(1);
    });

    it('does not recompute global page positions while synchronously reaching the edit anchor', () => {
        const { commandCallbacks, pageLayoutService, selectionManager } = createControllerFixture({
            layoutProgress: [
                {
                    complete: false,
                    anchorReady: false,
                    elapsedTime: 1,
                },
                {
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    elapsedTime: 2,
                },
            ],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);

        expect(pageLayoutService.calculatePagePosition).not.toHaveBeenCalled();
        expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(1);
    });

    it('refreshes selection without repositioning the document from a stable incomplete anchor page', async () => {
        const { commandCallbacks, pageLayoutService, selectionManager } = createControllerFixture({
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                elapsedTime: 1,
            }],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        expect(pageLayoutService.calculatePagePosition).not.toHaveBeenCalled();
        expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(1);
    });

    it('publishes the edited page on the main thread before handing the tail to the Worker', async () => {
        const { commandCallbacks, controller, layoutExecutorService, selectionManager, skeletonManager } = createControllerFixture({
            useWorker: true,
            pages: Array.from({ length: 5 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: Array.from({ length: 5 }, (_, pageIndex) => ({
                complete: false,
                anchorReady: true,
                didPublishAnchor: pageIndex === 0,
                elapsedTime: 1,
                pageCount: 20,
                publishedPageCount: pageIndex + 1,
            })),
        });
        const skeleton = skeletonManager.getSkeleton();

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);

        expect(skeleton.startIncrementalLayout).toHaveBeenCalledTimes(1);
        expect(skeleton.startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            reuseUnaffectedTail: false,
        }));
        expect(skeleton.beginExternalLayout).not.toHaveBeenCalled();

        for (let pageIndex = 0; pageIndex < 5; pageIndex++) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        }

        expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(1);
        expect(skeleton.beginExternalLayout).not.toHaveBeenCalled();

        await vi.waitFor(() => {
            expect(skeleton.beginExternalLayout).toHaveBeenCalledWith({
                reason: 'edit',
                protectedRange: {
                    mode: 'paginated',
                    startPageIndex: 0,
                    endPageIndex: 4,
                },
            });
        });
        expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);

        controller.dispose();
    });

    it('protects retained interaction pages when Main publishes only the edited page', async () => {
        const { commandCallbacks, controller, skeletonManager } = createControllerFixture({
            useWorker: true,
            pages: Array.from({ length: 8 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                sections: [{}],
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                didPublishAnchor: true,
                interactionWindowComplete: true,
                elapsedTime: 1,
                pageCount: 20,
                publishedPageCount: 1,
            }],
        });
        const skeleton = skeletonManager.getSkeleton();

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);

        await vi.waitFor(() => {
            expect(skeleton.beginExternalLayout).toHaveBeenCalledWith({
                reason: 'edit',
                protectedRange: {
                    mode: 'paginated',
                    startPageIndex: 0,
                    endPageIndex: 4,
                },
            });
        });

        controller.dispose();
    });

    it('does not rebuild the active Main selection when the Worker only publishes the unprotected tail', async () => {
        const { commandCallbacks, controller, selectionManager } = createControllerFixture({
            useWorker: true,
            workerCompletes: true,
            pages: Array.from({ length: 5 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: Array.from({ length: 5 }, (_, pageIndex) => ({
                complete: false,
                anchorReady: true,
                didPublishAnchor: pageIndex === 0,
                elapsedTime: 1,
                pageCount: 20,
                publishedPageCount: pageIndex + 1,
            })),
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);

        await vi.waitFor(() => {
            expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(1);
        });
        await new Promise<void>((resolve) => setTimeout(resolve, 180));
        await vi.waitFor(() => {
            expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(1);
        });

        controller.dispose();
    });

    it('defers the final Worker publication while a document menu interaction is active', async () => {
        vi.useFakeTimers();
        let releaseInteraction: (() => void) | undefined;
        let completeWorker: (() => void) | undefined;
        try {
            const workerCompletionPromise = new Promise<void>((resolve) => {
                completeWorker = resolve;
            });
            const { commandCallbacks, controller, skeletonManager } = createControllerFixture({
                useWorker: true,
                workerCompletes: true,
                workerCompletionPromise,
                onWorkerStart: (layoutInteractionService) => {
                    const interaction = layoutInteractionService.beginInteraction();
                    releaseInteraction = () => interaction.dispose();
                },
                pages: Array.from({ length: 5 }, () => ({
                    pageWidth: 640,
                    pageHeight: 900,
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                })),
                layoutProgress: [{
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    interactionWindowComplete: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 5,
                }],
            });
            const skeleton = skeletonManager.getSkeleton();

            commandCallbacks[0]({
                id: RichTextEditingMutation.id,
                params: {
                    unitId: 'doc-unit',
                    actions: [],
                },
            } satisfies ICommandInfo);

            await vi.advanceTimersByTimeAsync(150);
            completeWorker?.();
            await vi.advanceTimersByTimeAsync(1_000);

            expect(skeleton.applyLayoutPublication).not.toHaveBeenCalled();

            releaseInteraction?.();
            await vi.advanceTimersByTimeAsync(100);
            expect(skeleton.applyLayoutPublication).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(50);
            await vi.advanceTimersByTimeAsync(16);
            expect(skeleton.applyLayoutPublication).toHaveBeenCalledTimes(1);

            controller.dispose();
        } finally {
            releaseInteraction?.();
            vi.useRealTimers();
        }
    });

    it('rebuilds a divergent protected selection as an active editing selection', async () => {
        const { commandCallbacks, controller, selectionManager } = createControllerFixture({
            useWorker: true,
            workerCompletes: true,
            workerReplacesProtectedPages: true,
            activeRange: {
                startOffset: 2_630,
                endOffset: 2_630,
                isActive: true,
            },
            pages: Array.from({ length: 5 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: Array.from({ length: 5 }, (_, pageIndex) => ({
                complete: false,
                anchorReady: true,
                didPublishAnchor: pageIndex === 0,
                elapsedTime: 1,
                pageCount: 20,
                publishedPageCount: pageIndex + 1,
            })),
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);

        await new Promise<void>((resolve) => setTimeout(resolve, 180));
        await vi.waitFor(() => {
            expect(selectionManager.refreshSelection).toHaveBeenLastCalledWith({
                unitId: 'doc-unit',
                subUnitId: 'doc-unit',
            }, true);
        });

        controller.dispose();
    });

    it('does not scroll a programmatic Worker mutation without an active editing selection', async () => {
        const { commandCallbacks, controller, selectionManager, viewport } = createControllerFixture({
            useWorker: true,
            workerCompletes: true,
            workerReplacesProtectedPages: true,
            activeRange: {
                startOffset: 2_630,
                endOffset: 2_630,
                isActive: true,
            },
            selectionIsEditing: false,
            anchorPage: 0,
            anchorPageAfterPublication: 1,
            pages: Array.from({ length: 5 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                didPublishAnchor: true,
                elapsedTime: 1,
                pageCount: 5,
                publishedPageCount: 1,
            }],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: null,
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 10 },
                        { t: 'i', len: 1, body: { dataStream: 'B' } },
                    ],
                }],
            },
        } satisfies ICommandInfo);

        await new Promise<void>((resolve) => setTimeout(resolve, 180));

        expect(viewport.scrollByViewportDeltaVal).not.toHaveBeenCalled();
        expect(selectionManager.refreshSelection).toHaveBeenLastCalledWith({
            unitId: 'doc-unit',
            subUnitId: 'doc-unit',
        }, false);

        controller.dispose();
    });

    it('protects the Main continuous block window before handing a Modern tail to the Worker', async () => {
        const { commandCallbacks, controller, layoutExecutorService, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.MODERN,
            useWorker: true,
            activeRange: {
                startOffset: 300,
                endOffset: 300,
                isActive: true,
            },
            layoutProgress: [20, 21, 22, 24].map((processedBlockCount, index) => ({
                complete: false,
                anchorReady: true,
                didPublishAnchor: index === 0,
                elapsedTime: 1,
                laidOutThrough: 500,
                stableLaidOutThrough: 480,
                mode: 'continuous',
                pageCount: 1,
                publishedPageCount: 1,
                processedBlockCount,
                totalBlockCount: 100,
            })),
        });
        const skeleton = skeletonManager.getSkeleton();

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);

        expect(skeleton.startIncrementalLayout).toHaveBeenCalledTimes(1);
        await vi.waitFor(() => {
            expect(skeleton.beginExternalLayout).toHaveBeenCalledWith({
                reason: 'edit',
                protectedRange: {
                    mode: 'continuous',
                    startOffset: 300,
                    endOffset: 480,
                },
            });
        });
        expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);

        controller.dispose();
    });

    it('uses a sole post-edit range as the foreground caret anchor without requiring isActive', () => {
        const { commandCallbacks, controller, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.MODERN,
            useWorker: true,
            activeRange: {
                startOffset: 300,
                endOffset: 300,
                isActive: true,
            },
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                didPublishAnchor: true,
                elapsedTime: 1,
                laidOutThrough: 301,
                stableLaidOutThrough: 300,
                mode: 'continuous',
                pageCount: 1,
                publishedPageCount: 1,
                processedBlockCount: 20,
                totalBlockCount: 100,
            }],
        });
        const skeleton = skeletonManager.getSkeleton();

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
                textRanges: [{
                    startOffset: 301,
                    endOffset: 301,
                    collapsed: true,
                }],
            },
        } satisfies ICommandInfo);

        expect(skeleton.startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            anchor: 301,
            priorityAnchor: 301,
        }));

        controller.dispose();
    });

    it('protects the visible Modern continuous suffix instead of a fixed block count', () => {
        const { commandCallbacks, controller, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.MODERN,
            useWorker: true,
            viewBound: { bottom: 400, left: 0, right: 1_000, top: 0 },
            pages: [{
                marginTop: 20,
                pageWidth: 640,
                pageHeight: Number.POSITIVE_INFINITY,
                sections: [{
                    top: 0,
                    columns: [{
                        lines: [
                            { ed: 120, top: 100 },
                            { ed: 360, top: 380 },
                            { ed: 900, top: 760 },
                            { ed: 1_200, top: 900 },
                        ],
                    }],
                }],
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
            activeRange: {
                startOffset: 300,
                endOffset: 300,
                isActive: true,
            },
        });
        const skeleton = skeletonManager.getSkeleton();

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: [{
                    startOffset: 301,
                    endOffset: 301,
                    collapsed: true,
                }],
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 300 },
                        { t: 'i', len: 1, body: { dataStream: 'A' } },
                    ],
                }],
            },
        } satisfies ICommandInfo);

        expect(skeleton.startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            reason: 'edit',
            foregroundEndOffset: 901,
        }));
        controller.dispose();
    });

    it('does not hand the interaction window to the Worker during IME composition', async () => {
        vi.useFakeTimers();
        try {
            const { commandCallbacks, compositionEnd$, compositionStart$, controller, layoutExecutorService } = createControllerFixture({
                useWorker: true,
                pages: Array.from({ length: 5 }, () => ({
                    pageWidth: 640,
                    pageHeight: 900,
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                })),
                layoutProgress: [{
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 1,
                }, {
                    complete: false,
                    anchorReady: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 5,
                }],
            });

            commandCallbacks[0]({
                id: RichTextEditingMutation.id,
                params: {
                    unitId: 'doc-unit',
                    actions: [],
                },
            } satisfies ICommandInfo);
            await vi.advanceTimersByTimeAsync(0);
            compositionStart$.next({});
            await vi.advanceTimersByTimeAsync(1_000);

            expect(layoutExecutorService.startLayout).not.toHaveBeenCalled();

            compositionEnd$.next({});
            await vi.advanceTimersByTimeAsync(149);
            expect(layoutExecutorService.startLayout).not.toHaveBeenCalled();
            await vi.advanceTimersByTimeAsync(17);
            expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);

            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('restarts a deferred interaction window when IME begins before the Worker handoff is queued', async () => {
        vi.useFakeTimers();
        try {
            const { compositionEnd$, compositionStart$, controller, layoutExecutorService } = createControllerFixture({
                useWorker: true,
                pages: Array.from({ length: 5 }, () => ({
                    pageWidth: 640,
                    pageHeight: 900,
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                })),
                layoutProgress: [{
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 1,
                }],
            });

            controller.reRender('doc-unit', undefined, undefined, undefined, true, false, true);
            compositionStart$.next({});
            await vi.advanceTimersByTimeAsync(1_000);
            expect(layoutExecutorService.startLayout).not.toHaveBeenCalled();

            compositionEnd$.next({});
            await vi.advanceTimersByTimeAsync(1_000);

            expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);
            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('does not restart a completed layout when IME composition makes no changes', async () => {
        vi.useFakeTimers();
        try {
            const { compositionEnd$, compositionStart$, controller, skeletonManager } = createControllerFixture({
                useWorker: true,
                workerCompletes: true,
                layoutProgress: [{
                    complete: true,
                    anchorReady: true,
                    didPublishAnchor: true,
                    elapsedTime: 1,
                    pageCount: 5,
                    publishedPageCount: 5,
                }],
            });
            const skeleton = skeletonManager.getSkeleton();

            controller.reRender('doc-unit', undefined, undefined, undefined, true, false, true);
            await vi.advanceTimersByTimeAsync(1_000);
            expect(skeleton.startIncrementalLayout).toHaveBeenCalledTimes(1);

            compositionStart$.next({});
            compositionEnd$.next({});
            await vi.advanceTimersByTimeAsync(1_000);

            expect(skeleton.startIncrementalLayout).toHaveBeenCalledTimes(1);
            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('keeps a newer layout scheduled during IME instead of replaying the cancelled request', async () => {
        vi.useFakeTimers();
        try {
            const { compositionEnd$, compositionStart$, controller, skeletonManager } = createControllerFixture({
                useWorker: true,
                layoutProgress: [{
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 1,
                }],
            });
            const skeleton = skeletonManager.getSkeleton();

            controller.reRender('doc-unit', 1, undefined, undefined, true, false, true);
            compositionStart$.next({});
            controller.reRender('doc-unit', 7, undefined, undefined, true, false, true);
            compositionEnd$.next({});
            await vi.advanceTimersByTimeAsync(1_000);

            expect(skeleton.startIncrementalLayout).toHaveBeenCalledTimes(2);
            expect(skeleton.startIncrementalLayout).toHaveBeenLastCalledWith(expect.objectContaining({
                anchor: 7,
            }));
            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('does not hand the interaction window to the Worker during pointer selection', async () => {
        vi.useFakeTimers();
        try {
            const { commandCallbacks, controller, layoutExecutorService, selectionRenderService } = createControllerFixture({
                useWorker: true,
                pages: Array.from({ length: 5 }, () => ({
                    pageWidth: 640,
                    pageHeight: 900,
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                })),
                layoutProgress: [{
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 1,
                }, {
                    complete: false,
                    anchorReady: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 5,
                }],
            });

            commandCallbacks[0]({
                id: RichTextEditingMutation.id,
                params: {
                    unitId: 'doc-unit',
                    actions: [],
                },
            } satisfies ICommandInfo);
            selectionRenderService.isOnPointerEvent = true;
            await vi.advanceTimersByTimeAsync(600);

            expect(layoutExecutorService.startLayout).not.toHaveBeenCalled();

            selectionRenderService.isOnPointerEvent = false;
            await vi.advanceTimersByTimeAsync(150);
            expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);

            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('continues starting Worker tail computation while a document menu interaction is active', async () => {
        vi.useFakeTimers();
        try {
            const { commandCallbacks, controller, layoutExecutorService, layoutInteractionService } = createControllerFixture({
                useWorker: true,
                pages: Array.from({ length: 5 }, () => ({
                    pageWidth: 640,
                    pageHeight: 900,
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                })),
                layoutProgress: [{
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    interactionWindowComplete: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 5,
                }],
            });

            commandCallbacks[0]({
                id: RichTextEditingMutation.id,
                params: {
                    unitId: 'doc-unit',
                    actions: [],
                },
            } satisfies ICommandInfo);
            const interaction = layoutInteractionService.beginInteraction();

            await vi.advanceTimersByTimeAsync(150);

            expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);

            interaction.dispose();
            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('discards a pending Worker handoff when a newer local edit arrives', async () => {
        vi.useFakeTimers();
        try {
            const { commandCallbacks, controller, layoutExecutorService } = createControllerFixture({
                useWorker: true,
                pages: Array.from({ length: 5 }, () => ({
                    pageWidth: 640,
                    pageHeight: 900,
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                })),
                layoutProgress: Array.from({ length: 4 }, (_, index) => ({
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: index % 2 === 0,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: index % 2 === 0 ? 1 : 5,
                })),
            });
            const mutation = {
                id: RichTextEditingMutation.id,
                params: {
                    unitId: 'doc-unit',
                    actions: [],
                },
            } satisfies ICommandInfo;

            commandCallbacks[0](mutation);
            await vi.advanceTimersByTimeAsync(100);
            commandCallbacks[0](mutation);
            await vi.advanceTimersByTimeAsync(149);
            expect(layoutExecutorService.startLayout).not.toHaveBeenCalled();
            await vi.advanceTimersByTimeAsync(17);

            expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);

            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('composes a Worker edit batch from its earliest dirty anchor', async () => {
        vi.useFakeTimers();
        try {
            const { commandCallbacks, controller, layoutExecutorService } = createControllerFixture({
                useWorker: true,
                pages: Array.from({ length: 12 }, () => ({
                    pageWidth: 640,
                    pageHeight: 900,
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                })),
                layoutProgress: Array.from({ length: 3 }, () => ({
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    interactionWindowComplete: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 5,
                })),
            });
            const mutations = [{
                retain: 2_630,
                text: '现在',
                range: 2_632,
            }, {
                retain: 2_632,
                text: '\r',
                range: 2_633,
            }, {
                retain: 2_633,
                text: 'ISSUE-ENTER',
                range: 2_644,
            }];

            for (const mutation of mutations) {
                commandCallbacks[0]({
                    id: RichTextEditingMutation.id,
                    params: {
                        unitId: 'doc-unit',
                        textRanges: [{
                            startOffset: mutation.range,
                            endOffset: mutation.range,
                            collapsed: true,
                            isActive: true,
                        }],
                        actions: ['body', {
                            et: 'text-x',
                            e: [
                                { t: 'r', len: mutation.retain },
                                { t: 'i', len: mutation.text.length, body: { dataStream: mutation.text } },
                            ],
                        }],
                    },
                } satisfies ICommandInfo);
            }

            await vi.advanceTimersByTimeAsync(150);

            expect(layoutExecutorService.startLayout).toHaveBeenCalledTimes(1);
            expect(layoutExecutorService.startLayout.mock.calls[0][1]).toEqual({
                reason: 'edit',
                anchor: 2_630,
                priorityAnchor: 2_630,
                invalidation: {
                    oldStart: 2_630,
                    oldEnd: 2_630,
                    newEnd: 2_644,
                },
            });

            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('restarts the Worker handoff quiet window when the user keeps interacting', async () => {
        vi.useFakeTimers();
        try {
            const { commandCallbacks, controller, layoutExecutorService } = createControllerFixture({
                useWorker: true,
                pages: Array.from({ length: 12 }, () => ({
                    pageWidth: 640,
                    pageHeight: 900,
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                })),
                layoutProgress: [{
                    complete: false,
                    anchorReady: true,
                    didPublishAnchor: true,
                    interactionWindowComplete: true,
                    elapsedTime: 1,
                    pageCount: 20,
                    publishedPageCount: 5,
                }],
            });

            commandCallbacks[0]({
                id: RichTextEditingMutation.id,
                params: {
                    unitId: 'doc-unit',
                    textRanges: [{
                        startOffset: 2_631,
                        endOffset: 2_631,
                        collapsed: true,
                        isActive: true,
                    }],
                    actions: ['body', {
                        et: 'text-x',
                        e: [
                            { t: 'r', len: 2_630 },
                            { t: 'i', len: 1, body: { dataStream: 'A' } },
                        ],
                    }],
                },
            } satisfies ICommandInfo);

            await vi.advanceTimersByTimeAsync(100);
            document.dispatchEvent(new KeyboardEvent('keydown'));
            await vi.advanceTimersByTimeAsync(149);
            expect(layoutExecutorService.startLayout).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(1);
            expect(layoutExecutorService.startLayout).toHaveBeenCalledOnce();

            controller.dispose();
        } finally {
            vi.useRealTimers();
        }
    });

    it('derives the incremental anchor from a body TextX edit when text ranges are absent', async () => {
        const { backScrollController, commandCallbacks, selectionManager, skeletonManager, viewport } = createControllerFixture();
        document.dispatchEvent(new KeyboardEvent('keydown'));
        viewport.scrollX = 0;
        viewport.scrollY = 900;
        viewport.viewportScrollX = 0;
        viewport.viewportScrollY = 1_800;
        document.dispatchEvent(new Event('beforeinput'));
        selectionManager.refreshSelection.mockImplementation(() => {
            viewport.scrollX = 0;
            viewport.scrollY = 1_200;
            viewport.viewportScrollX = 0;
            viewport.viewportScrollY = 2_400;
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: null,
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 1_792 },
                        { t: 'i', len: 1, body: { dataStream: 'Z' } },
                    ],
                }],
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledWith({
            reason: 'edit',
            anchor: 1_792,
            priorityAnchor: undefined,
            invalidation: {
                oldStart: 1_792,
                oldEnd: 1_792,
                newEnd: 1_793,
            },
            waitForHyphenationPatterns: true,
        });
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        expect(viewport.scrollByViewportDeltaVal).not.toHaveBeenCalled();
        // The foreground skeleton is sufficient to paint the edited glyph, but its
        // page coordinates are not stable until the background pass reaches a page
        // boundary. Never back-scroll with those transient coordinates.
        expect(backScrollController.scrollToRange).not.toHaveBeenCalled();
    });

    it('marks layout-metadata-only mutations as safe for structural tail reuse', () => {
        const { commandCallbacks, controller, skeletonManager } = createControllerFixture({
            pages: [
                {
                    marginTop: 0,
                    pageWidth: 640,
                    pageHeight: 900,
                    sections: [],
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                },
                {
                    isMaterializationPlaceholder: true,
                    marginTop: 0,
                    pageWidth: 640,
                    pageHeight: 900,
                    sections: [],
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                },
            ],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: [{ startOffset: 104, endOffset: 104, collapsed: true, isActive: true }],
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 100 },
                        {
                            t: 'r',
                            len: 4,
                            body: {
                                dataStream: '',
                                customRanges: [{
                                    startIndex: 0,
                                    endIndex: 3,
                                    rangeId: 'link',
                                    rangeType: CustomRangeType.HYPERLINK,
                                }],
                            },
                            oldBody: {
                                dataStream: '',
                                textRuns: [{ st: 0, ed: 4, ts: { ff: 'Arial', fs: 12 } }],
                                sectionBreaks: [],
                                customDecorations: [{ id: 'comment', type: 0, startIndex: 0, endIndex: 3 }],
                                customRanges: [],
                            },
                            coverType: 1,
                        },
                    ],
                }],
                segmentId: '',
                trigger: 'docs.command.add-hyper-link',
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            reason: 'edit',
            anchor: 100,
            priorityAnchor: 104,
            invalidation: { oldStart: 100, oldEnd: 104, newEnd: 104 },
            allowMetadataOnlyStructuralTailReuse: true,
        }));
        expect((controller as unknown as { _pendingWorkerEditBatch: unknown })._pendingWorkerEditBatch).toBeNull();

        skeletonManager.getSkeleton().startIncrementalLayout.mockClear();
        const undoCommand = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: [{ startOffset: 104, endOffset: 104, collapsed: true, isActive: true }],
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 100 },
                        {
                            t: 'r',
                            len: 4,
                            body: {
                                dataStream: '',
                                textRuns: [{ st: 0, ed: 4, ts: { ff: 'Arial', fs: 12 } }],
                                sectionBreaks: [],
                                customDecorations: [{ id: 'comment', type: 0, startIndex: 0, endIndex: 3 }],
                                customRanges: [],
                            },
                            oldBody: {
                                dataStream: '',
                                textRuns: [{ st: 0, ed: 4, ts: { ff: 'Arial', fs: 12 } }],
                                sectionBreaks: [],
                                customDecorations: [{ id: 'comment', type: 0, startIndex: 0, endIndex: 3 }],
                                customRanges: [{
                                    startIndex: 0,
                                    endIndex: 3,
                                    rangeId: 'link',
                                    rangeType: CustomRangeType.HYPERLINK,
                                }],
                            },
                            coverType: 1,
                        },
                    ],
                }],
                segmentId: '',
                trigger: 'univer.command.undo',
            },
        } satisfies ICommandInfo;
        commandCallbacks[0](undoCommand);

        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            allowMetadataOnlyStructuralTailReuse: true,
        }));
        expect((controller as unknown as { _pendingWorkerEditBatch: unknown })._pendingWorkerEditBatch).toBeNull();

        skeletonManager.getSkeleton().startIncrementalLayout.mockClear();
        const formattingCommand = structuredClone(undoCommand);
        const formattingAction = (formattingCommand.params.actions[1] as {
            e: Array<{ oldBody?: { textRuns?: Array<{ ts: { fs?: number } }> } }>;
        }).e[1];
        formattingAction.oldBody!.textRuns![0].ts.fs = 14;
        commandCallbacks[0](formattingCommand);
        expect(skeletonManager.getSkeleton().startIncrementalLayout).not.toHaveBeenCalledWith(expect.objectContaining({
            allowMetadataOnlyStructuralTailReuse: true,
        }));

        skeletonManager.getSkeleton().startIncrementalLayout.mockClear();
        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: null,
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 100 },
                        {
                            t: 'r',
                            len: 4,
                            body: {
                                dataStream: '',
                                customDecorations: [{
                                    id: 'comment',
                                    type: CustomDecorationType.COMMENT,
                                    startIndex: 0,
                                    endIndex: 3,
                                }],
                            },
                            oldBody: {
                                dataStream: '',
                                textRuns: [{ st: 0, ed: 4, ts: { ff: 'Arial', fs: 12 } }],
                                sectionBreaks: [],
                                customDecorations: [],
                                customRanges: [],
                            },
                        },
                    ],
                }],
                noNeedSetTextRange: true,
                trigger: 'docs.command.add-comment',
            },
        } satisfies ICommandInfo);
        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledWith(expect.objectContaining({
            allowMetadataOnlyStructuralTailReuse: true,
        }));

        controller.dispose();
    });

    it('uses the pretransformed local caret when a remote edit still carries sender ranges', () => {
        const { commandCallbacks, controller, skeletonManager } = createControllerFixture({
            useWorker: true,
            activeRange: {
                startOffset: 9_001,
                endOffset: 9_001,
                isActive: true,
            },
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: [{
                    startOffset: 11,
                    endOffset: 11,
                    isActive: true,
                }],
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 10 },
                        { t: 'i', len: 1, body: { dataStream: 'B' } },
                    ],
                }],
            },
        } satisfies ICommandInfo, { fromCollab: true });

        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledWith({
            reason: 'edit',
            anchor: 9_001,
            priorityAnchor: 9_001,
            invalidation: {
                oldStart: 10,
                oldEnd: 10,
                newEnd: 11,
            },
            preserveInteractionWindow: true,
            reuseUnaffectedTail: false,
            waitForHyphenationPatterns: true,
        });

        controller.dispose();
    });

    it('uses the post-edit text range before the selection-manager microtask runs', () => {
        const { commandCallbacks, controller, skeletonManager } = createControllerFixture({
            useWorker: true,
            activeRange: {
                startOffset: 100,
                endOffset: 100,
                isActive: true,
            },
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: [{
                    startOffset: 101,
                    endOffset: 101,
                    isActive: true,
                }],
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 100 },
                        { t: 'i', len: 1, body: { dataStream: 'A' } },
                    ],
                }],
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.getSkeleton().startIncrementalLayout).toHaveBeenCalledWith({
            reason: 'edit',
            anchor: 100,
            priorityAnchor: 101,
            invalidation: {
                oldStart: 100,
                oldEnd: 100,
                newEnd: 101,
            },
            preserveInteractionWindow: false,
            reuseUnaffectedTail: false,
            waitForHyphenationPatterns: true,
        });

        controller.dispose();
    });

    it('leaves a local post-edit caret to the original mutation microtask', () => {
        const { commandCallbacks, controller, selectionManager } = createControllerFixture({
            useWorker: true,
            activeRange: {
                startOffset: 100,
                endOffset: 100,
                isActive: true,
            },
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                didPublishAnchor: true,
                elapsedTime: 1,
            }],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                trigger: 'keyboard',
                textRanges: [{
                    startOffset: 101,
                    endOffset: 101,
                    isActive: true,
                }],
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 100 },
                        { t: 'i', len: 1, body: { dataStream: 'A' } },
                    ],
                }],
            },
        } satisfies ICommandInfo);

        expect(selectionManager.refreshSelection).not.toHaveBeenCalled();
        controller.dispose();
    });

    it('keeps the local caret editing after the foreground layout completes across a page', async () => {
        const { commandCallbacks, controller, selectionManager } = createControllerFixture({
            useWorker: true,
            workerCompletes: true,
            activeRange: {
                startOffset: 100,
                endOffset: 100,
                isActive: true,
            },
            pages: Array.from({ length: 5 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                didPublishAnchor: true,
                interactionWindowComplete: true,
                elapsedTime: 1,
                pageCount: 20,
                publishedPageCount: 5,
            }],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                trigger: 'keyboard',
                textRanges: [{
                    startOffset: 101,
                    endOffset: 101,
                    isActive: true,
                }],
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 100 },
                        { t: 'i', len: 1, body: { dataStream: 'A' } },
                    ],
                }],
            },
        } satisfies ICommandInfo);
        await new Promise<void>((resolve) => setTimeout(resolve, 180));
        await vi.waitFor(() => {
            expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(1);
        });

        expect(selectionManager.refreshSelection).toHaveBeenCalledWith({
            unitId: 'doc-unit',
            subUnitId: 'doc-unit',
        }, true);
        controller.dispose();
    });

    it('refreshes the transformed local caret for a remote mutation', () => {
        const { commandCallbacks, controller, selectionManager } = createControllerFixture({
            useWorker: true,
            activeRange: {
                startOffset: 9_000,
                endOffset: 9_000,
                isActive: true,
            },
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                didPublishAnchor: true,
                elapsedTime: 1,
            }],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                trigger: 'collaboration',
                textRanges: [{
                    startOffset: 11,
                    endOffset: 11,
                    isActive: true,
                }],
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 10 },
                        { t: 'i', len: 1, body: { dataStream: 'B' } },
                    ],
                }],
            },
        } satisfies ICommandInfo, { fromCollab: true });

        expect(selectionManager.refreshSelection).toHaveBeenCalledWith({
            unitId: 'doc-unit',
            subUnitId: 'doc-unit',
        }, true);
        controller.dispose();
    });

    it('keeps the caret at the same viewport offset after editing state ends while a remote edit moves it to a later page', async () => {
        const { commandCallbacks, controller, viewport } = createControllerFixture({
            useWorker: true,
            workerCompletes: true,
            anchorPage: 1,
            anchorPageAfterPublication: 3,
            selectionIsEditing: false,
            activeRange: {
                startOffset: 9_000,
                endOffset: 9_000,
                isActive: true,
            },
            pages: Array.from({ length: 20 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: Array.from({ length: 5 }, (_, pageIndex) => ({
                complete: false,
                anchorReady: true,
                didPublishAnchor: pageIndex === 0,
                elapsedTime: 1,
                pageCount: 20,
                publishedPageCount: pageIndex + 2,
            })),
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                isSync: true,
                textRanges: null,
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 10 },
                        { t: 'i', len: 1, body: { dataStream: 'B' } },
                    ],
                }],
            },
        } satisfies ICommandInfo);

        for (let pageIndex = 0; pageIndex < 5; pageIndex++) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 180));

        expect(viewport.scrollByViewportDeltaVal).toHaveBeenCalledWith({
            viewportScrollX: 0,
            viewportScrollY: 1_800,
        });

        controller.dispose();
    });

    it('keeps UNSPECIFIED editor mutations on the synchronous layout path', () => {
        const { commandCallbacks, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                actions: [],
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.recalculate).toHaveBeenCalledTimes(1);
        expect(skeletonManager.getSkeleton().startIncrementalLayout).not.toHaveBeenCalled();
    });

    it('keeps document mutations on the historical synchronous path without an incremental executor', () => {
        const { commandCallbacks, skeletonManager } = createControllerFixture({
            supportsIncrementalLayout: false,
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.recalculate).toHaveBeenCalledTimes(1);
        expect(skeletonManager.getSkeleton().startIncrementalLayout).not.toHaveBeenCalled();
    });

    it('does not back-scroll a nested table anchor from a partial layout', async () => {
        const { backScrollController, commandCallbacks } = createControllerFixture({
            anchorPage: -1,
            anchorPageType: 3,
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                textRanges: null,
                actions: ['body', {
                    et: 'text-x',
                    e: [
                        { t: 'r', len: 1_688 },
                        { t: 'i', len: 1, body: { dataStream: 'T' } },
                    ],
                }],
            },
        } satisfies ICommandInfo);

        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        expect(backScrollController.scrollToRange).not.toHaveBeenCalled();
    });

    it('keeps non-editor UNSPECIFIED mutations on the synchronous layout path', () => {
        const { commandCallbacks, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);

        expect(skeletonManager.recalculate).toHaveBeenCalledTimes(1);
        expect(skeletonManager.getSkeleton().startIncrementalLayout).not.toHaveBeenCalled();
    });

    it('reserves estimated traditional tail height while background layout is incomplete', async () => {
        const { commandCallbacks, context } = createControllerFixture({
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                elapsedTime: 8,
                estimatedPageCount: 20,
                estimatedHeight: 18_000,
                processedBlockCount: 10,
                totalBlockCount: 200,
            }],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        expect(context.mainComponent?.height).toBe(18_420);
        expect(context.scene.transformByState).toHaveBeenCalledWith(expect.objectContaining({ height: 18_420 }));
    });

    it('uses the first published page width instead of the default scene width on first open', async () => {
        const { context, skeletonManager } = createControllerFixture({
            hasCompleteLayout: false,
            initialSkeletonDataMissing: true,
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                elapsedTime: 8,
                estimatedPageCount: 20,
                estimatedHeight: 18_000,
            }],
        });
        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        expect(context.mainComponent?.width).toBe(640);
        expect(context.mainComponent?.height).toBe(18_420);
        expect(context.scene.transformByState).toHaveBeenCalledWith({ width: 640, height: 18_420 });
    });

    it('does not publish Worker geometry before the render container can commit an interactive frame', async () => {
        const engineBeginFrame$ = new Subject<number>();
        const sceneParent = { width: 1, height: 1 };
        const { pageLayoutService, skeletonManager } = createControllerFixture({
            engineBeginFrame$,
            sceneParent,
            useWorker: true,
            workerCompletes: true,
            hasCompleteLayout: false,
            initialSkeletonDataMissing: true,
            pages: Array.from({ length: 5 }, () => ({
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            })),
            layoutProgress: Array.from({ length: 5 }, (_, pageIndex) => ({
                complete: false,
                anchorReady: true,
                didPublishAnchor: pageIndex === 0,
                interactionWindowComplete: pageIndex === 4,
                elapsedTime: 1,
                pageCount: 20,
                publishedPageCount: pageIndex + 1,
            })),
        });

        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());
        engineBeginFrame$.next(1);

        expect(skeletonManager.getSkeleton().applyLayoutPublication).not.toHaveBeenCalled();
        expect(pageLayoutService.calculatePagePosition).not.toHaveBeenCalled();
        expect(skeletonManager.getSkeleton().beginExternalLayout).not.toHaveBeenCalled();

        sceneParent.width = 1_280;
        sceneParent.height = 900;
        for (let frame = 2; frame <= 6; frame++) {
            engineBeginFrame$.next(frame);
        }
        await vi.waitFor(() => {
            expect(skeletonManager.getSkeleton().beginExternalLayout).toHaveBeenCalledTimes(1);
        });
        engineBeginFrame$.next(7);

        expect(skeletonManager.getSkeleton().applyLayoutPublication).toHaveBeenCalledTimes(1);
        expect(pageLayoutService.calculatePagePosition).toHaveBeenCalled();
    });

    it('preserves only the vertical flow extent from the last complete layout', async () => {
        const { commandCallbacks, context } = createControllerFixture({
            layoutProgress: [{
                complete: false,
                anchorReady: true,
                elapsedTime: 8,
                estimatedPageCount: 20,
                estimatedHeight: 18_000,
            }],
        });
        if (context.mainComponent != null) {
            context.mainComponent.width = 1_500;
            context.mainComponent.height = 20_000;
        }

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        expect(context.mainComponent?.width).toBe(640);
        expect(context.mainComponent?.height).toBe(20_000);
    });

    it('refreshes selection for the foreground anchor and final layout only', () => {
        vi.useFakeTimers();
        vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => setTimeout(() => callback({
            didTimeout: false,
            timeRemaining: () => 12,
        }), 0));
        vi.stubGlobal('cancelIdleCallback', (id: number) => clearTimeout(id));
        const { commandCallbacks, pageLayoutService, selectionManager } = createControllerFixture({
            layoutProgress: [
                { complete: false, anchorReady: true, elapsedTime: 8 },
                { complete: false, anchorReady: true, elapsedTime: 16 },
                { complete: true, anchorReady: true, elapsedTime: 24 },
            ],
        });

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } satisfies ICommandInfo);
        vi.runAllTimers();

        expect(pageLayoutService.calculatePagePosition).toHaveBeenCalledTimes(1);
        expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(2);
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('keeps modern doc width anchored to page width when a table grows wider than the text column', () => {
        const { context, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.MODERN,
            pages: [{
                pageWidth: 960,
                pageHeight: Number.POSITIVE_INFINITY,
                width: 960,
                height: 640,
                marginLeft: 66.66666666666667,
                marginRight: 66.66666666666667,
                marginTop: 72,
                marginBottom: 72,
                skeDrawings: new Map(),
                skeTables: new Map([['table-1', {
                    left: 0,
                    top: 180,
                    width: 1254,
                    height: 240,
                }]]),
            }],
        });

        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());

        expect(context.mainComponent?.width).toBe(960);
        expect((context.components.get(DOCS_VIEW_KEY.BACKGROUND) as { width: number }).width).toBe(960);
    });

    it('keeps modern doc width anchored to page width when a floating drawing extends past the page', () => {
        const { context, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.MODERN,
            pages: [{
                pageWidth: 960,
                pageHeight: Number.POSITIVE_INFINITY,
                width: 826.6666666666667,
                height: 640,
                marginLeft: 66.66666666666667,
                marginRight: 66.66666666666667,
                marginTop: 72,
                marginBottom: 72,
                skeDrawings: new Map([['drawing-1', {
                    aLeft: 1051.6084250425697,
                    aTop: 82.39,
                    width: 160,
                    height: 96,
                }]]),
                skeTables: new Map(),
            }],
        });

        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());

        expect(context.mainComponent?.width).toBe(960);
        expect((context.components.get(DOCS_VIEW_KEY.BACKGROUND) as { width: number }).width).toBe(960);
    });

    it('keeps internal editor doc background transparent before the render config is registered', () => {
        const { canvasElement, context, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            pages: [{
                pageWidth: 300,
                pageHeight: 80,
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
        });

        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());

        expect(canvasElement.style.backgroundColor).toBe('transparent');
        expect((context.components.get(DOCS_VIEW_KEY.BACKGROUND) as { fillColors: unknown[] }).fillColors).toEqual([
            'transparent',
            'transparent',
            'transparent',
            'transparent',
        ]);
    });

    it('keeps editor doc background transparent when the host provides a surface color', () => {
        const { canvasElement, context, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            pendingEditorBackgroundColor: '#fff',
            pages: [{
                pageWidth: 300,
                pageHeight: 80,
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
        });

        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());

        expect(canvasElement.style.backgroundColor).toBe('#fff');
        expect((context.components.get(DOCS_VIEW_KEY.BACKGROUND) as { fillColors: unknown[] }).fillColors).toEqual([
            'transparent',
            'transparent',
            'transparent',
            'transparent',
        ]);
    });
});
