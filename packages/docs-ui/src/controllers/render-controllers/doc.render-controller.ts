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

import type {
    DocumentDataModel,
    EventState,
    ICommandInfo,
    IDocDrawingBase,
    IExecutionOptions,
    JSONXActions,
    Nullable,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type {
    DocumentSkeleton,
    IDocumentLayoutInvalidation,
    IDocumentLayoutPageRange,
    IDocumentLayoutProgress,
    IDocumentLayoutProtectedRange,
    IDocumentSkeletonPage,
    IRenderContext,
    IRenderModule,
    IWheelEvent,
} from '@univerjs/engine-render';
import {
    CustomDecorationType,
    CustomRangeType,
    DocumentFlavor,
    ICommandService,
    ILogService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
    JSON1,
    PositionedObjectLayoutType,
    RxDisposable,
    TextX,
    TextXActionType,
    ThemeService,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import {
    DocBackground,
    Documents,
    IRenderManagerService,
    Layer,
    PageLayoutType,
    ScrollBar,
    Viewport,
} from '@univerjs/engine-render';
import { combineLatest, fromEvent, merge, take, takeUntil } from 'rxjs';
import {
    DOCS_COMPONENT_BACKGROUND_LAYER_INDEX,
    DOCS_COMPONENT_DEFAULT_Z_INDEX,
    DOCS_COMPONENT_HEADER_LAYER_INDEX,
    DOCS_COMPONENT_MAIN_LAYER_INDEX,
    DOCS_VIEW_KEY,
    VIEWPORT_KEY,
} from '../../basics/docs-view-key';
import { DocLayoutCoordinatorService } from '../../services/doc-layout-coordinator.service';
import { DocLayoutInteractionService } from '../../services/doc-layout-interaction.service';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';
import { resolveDocRenderBackground } from '../../services/doc-render-background';
import { DocViewScaleService } from '../../services/doc-view-scale';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { NodePositionConvertToCursor } from '../../services/selection/convert-text-range';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { getAnchorBounding } from '../../services/selection/text-range';

function getBodyTextXActions(actions: JSONXActions, segmentId?: string): unknown[] | undefined {
    if (segmentId || actions == null || actions.length !== 2 || actions[0] !== 'body') {
        return undefined;
    }

    const editComponent = actions[1];
    if (
        typeof editComponent !== 'object' ||
        editComponent == null ||
        !('et' in editComponent) ||
        editComponent.et !== TextX.name ||
        !('e' in editComponent) ||
        !Array.isArray(editComponent.e)
    ) {
        return undefined;
    }

    return editComponent.e;
}

function getTextXActionLength(action: unknown): number | undefined {
    if (typeof action !== 'object' || action == null || !('t' in action) || !('len' in action)) {
        return undefined;
    }
    return typeof action.len === 'number' && Number.isFinite(action.len) && action.len >= 0
        ? action.len
        : undefined;
}

function isPlainTextXRetain(action: object & { t: unknown }): boolean {
    return action.t === TextXActionType.RETAIN &&
        !('body' in action) &&
        !('oldBody' in action) &&
        !('coverType' in action);
}

function isHyperlinkCustomRange(value: unknown): boolean {
    return typeof value === 'object' && value != null &&
        'rangeType' in value && value.rangeType === CustomRangeType.HYPERLINK;
}

function isLayoutOnlyCustomDecoration(value: unknown): boolean {
    return typeof value === 'object' && value != null && 'type' in value &&
        (value.type === CustomDecorationType.COMMENT || value.type === CustomDecorationType.DELETED);
}

function getLayoutMetadataCount(value: Record<string, unknown>): number | null {
    const ranges = value.customRanges;
    const decorations = value.customDecorations;
    if (
        (ranges != null && (!Array.isArray(ranges) || !ranges.every(isHyperlinkCustomRange))) ||
        (decorations != null && (!Array.isArray(decorations) || !decorations.every(isLayoutOnlyCustomDecoration)))
    ) {
        return null;
    }
    return (Array.isArray(ranges) ? ranges.length : 0) +
        (Array.isArray(decorations) ? decorations.length : 0);
}

function omitLayoutMetadata(value: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(value).filter(([key]) =>
        key !== 'customRanges' && key !== 'customDecorations'
    ));
}

function isLayoutMetadataOnlyMutation(actions: JSONXActions, segmentId?: string): boolean {
    const textActions = getBodyTextXActions(actions, segmentId);
    return textActions != null && textActions.length > 0 && textActions.every((action) => {
        if (typeof action !== 'object' || action == null || !('t' in action) || action.t !== TextXActionType.RETAIN) {
            return false;
        }
        if (isPlainTextXRetain(action)) {
            return true;
        }
        if (!('body' in action) || typeof action.body !== 'object' || action.body == null) {
            return false;
        }
        const body = action.body as Record<string, unknown>;
        const bodyMetadataCount = getLayoutMetadataCount(body);
        if (
            body.dataStream === '' &&
            bodyMetadataCount != null && bodyMetadataCount > 0 &&
            Object.keys(body).every((key) =>
                key === 'dataStream' || key === 'customRanges' || key === 'customDecorations'
            )
        ) {
            return true;
        }
        if (!('oldBody' in action) || typeof action.oldBody !== 'object' || action.oldBody == null) {
            return false;
        }
        const oldBody = action.oldBody as Record<string, unknown>;
        const oldBodyMetadataCount = getLayoutMetadataCount(oldBody);
        return body.dataStream === '' && oldBody.dataStream === '' &&
            bodyMetadataCount != null && oldBodyMetadataCount != null &&
            bodyMetadataCount + oldBodyMetadataCount > 0 &&
            Tools.diffValue(omitLayoutMetadata(body), omitLayoutMetadata(oldBody));
    });
}

function getBodyMutationInvalidation(
    actions: JSONXActions,
    segmentId?: string
): IDocumentLayoutInvalidation | undefined {
    const textActions = getBodyTextXActions(actions, segmentId);
    if (textActions == null) {
        return undefined;
    }

    let oldOffset = 0;
    let newOffset = 0;
    let invalidation: IDocumentLayoutInvalidation | undefined;
    let sawTrailingRetain = false;
    for (const action of textActions) {
        const length = getTextXActionLength(action);
        if (length == null || typeof action !== 'object' || action == null || !('t' in action)) {
            return undefined;
        }

        if (isPlainTextXRetain(action)) {
            oldOffset += length;
            newOffset += length;
            sawTrailingRetain ||= invalidation != null;
            continue;
        }
        if (sawTrailingRetain) {
            // Multiple disjoint edits need more than one offset transform. Fall
            // back to ordinary suffix pagination instead of reusing a wrong tail.
            return undefined;
        }

        invalidation ??= {
            oldStart: oldOffset,
            oldEnd: oldOffset,
            newEnd: newOffset,
        };
        switch (action.t) {
            case TextXActionType.RETAIN:
                oldOffset += length;
                newOffset += length;
                break;
            case TextXActionType.INSERT:
                newOffset += length;
                break;
            case TextXActionType.DELETE:
                oldOffset += length;
                break;
            default:
                return undefined;
        }
        invalidation.oldEnd = oldOffset;
        invalidation.newEnd = newOffset;
    }

    return invalidation;
}

interface IDrawingLayoutTransition {
    before?: PositionedObjectLayoutType;
    after?: PositionedObjectLayoutType;
}

function isPositionedObjectLayoutType(value: unknown): value is PositionedObjectLayoutType {
    switch (value) {
        case PositionedObjectLayoutType.INLINE:
        case PositionedObjectLayoutType.WRAP_NONE:
        case PositionedObjectLayoutType.WRAP_POLYGON:
        case PositionedObjectLayoutType.WRAP_SQUARE:
        case PositionedObjectLayoutType.WRAP_THROUGH:
        case PositionedObjectLayoutType.WRAP_TIGHT:
        case PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM:
            return true;
        default:
            return false;
    }
}

function getDrawingLayoutType(value: unknown): PositionedObjectLayoutType | undefined {
    if (typeof value !== 'object' || value == null || !('layoutType' in value)) {
        return undefined;
    }

    const layoutType = value.layoutType;
    return isPositionedObjectLayoutType(layoutType) ? layoutType : undefined;
}

function isRichTextEditingMutationParams(value: unknown): value is IRichTextEditingMutationParams {
    return typeof value === 'object' && value != null &&
        'unitId' in value && typeof value.unitId === 'string' &&
        'actions' in value && (value.actions == null || Array.isArray(value.actions));
}

function doesMutationScheduleLocalSelectionUpdate(
    params: IRichTextEditingMutationParams,
    isRemoteMutation: boolean
): boolean {
    return !isRemoteMutation &&
        params.isSync !== true &&
        params.noNeedSetTextRange !== true &&
        params.trigger != null &&
        params.textRanges != null;
}

const EDIT_WORKER_RESUME_DELAY_MS = 150;
const MATERIALIZED_PAGE_WINDOW_SIZE = 5;

function resolveMaterializedPageAxis(
    docsComponent: unknown,
    viewport: Nullable<Viewport>
): { pageGap: number; vertical: boolean; viewportCenter: number } | null {
    if (!(docsComponent instanceof Documents) || viewport == null) {
        return null;
    }
    const viewBound = viewport.calcViewportInfo().viewBound;
    const {
        docsLeft,
        docsTop,
        pageLayoutType = PageLayoutType.VERTICAL,
        pageMarginLeft,
        pageMarginTop,
    } = docsComponent.getOffsetConfig();
    const vertical = pageLayoutType !== PageLayoutType.HORIZONTAL;
    return {
        pageGap: vertical ? pageMarginTop : pageMarginLeft,
        vertical,
        viewportCenter: vertical
            ? (viewBound.top + viewBound.bottom) / 2 - docsTop
            : (viewBound.left + viewBound.right) / 2 - docsLeft,
    };
}

interface IDocLayoutViewportAnchor {
    offset: number;
    relativeLeft: number;
    relativeTop: number;
}

interface IDocLayoutWorkerHandoff {
    layoutRequestId: number;
    run: () => void;
    waitForInteractionEnd: boolean;
}

interface IDocLayoutWorkerEditBatch {
    anchor: number | undefined;
    invalidation: IDocumentLayoutInvalidation | undefined;
}

interface IDocLayoutScheduleOptions {
    deferForeground?: boolean;
    reuseMainBaseline?: boolean;
    allowMetadataOnlyStructuralTailReuse?: boolean;
    reason: 'initial' | 'edit';
    anchor?: number;
    priorityAnchor?: number;
    invalidation?: IDocumentLayoutInvalidation;
}

function mapPreviousOffsetToCurrent(
    offset: number,
    invalidation: IDocumentLayoutInvalidation | undefined
): number {
    if (invalidation == null || offset < invalidation.oldStart) {
        return offset;
    }
    if (offset >= invalidation.oldEnd) {
        return offset + invalidation.newEnd - invalidation.oldEnd;
    }
    return invalidation.newEnd;
}

function mergeDocumentLayoutInvalidations(
    previous: IDocumentLayoutInvalidation | undefined,
    current: IDocumentLayoutInvalidation | undefined
): IDocumentLayoutInvalidation | undefined {
    if (previous == null || current == null) {
        return undefined;
    }

    const previousDelta = previous.newEnd - previous.oldEnd;
    const mapCurrentToPrevious = (offset: number): number => {
        if (offset < previous.oldStart) {
            return offset;
        }
        if (offset < previous.newEnd) {
            return previous.oldStart;
        }
        return offset - previousDelta;
    };
    const oldStart = Math.min(previous.oldStart, mapCurrentToPrevious(current.oldStart));
    const oldEnd = Math.max(previous.oldEnd, mapCurrentToPrevious(current.oldEnd));
    const currentDelta = current.newEnd - current.oldEnd;
    return {
        oldStart,
        oldEnd,
        newEnd: oldEnd + previousDelta + currentDelta,
    };
}

function findContinuousLayoutEndOffset(
    page: IDocumentSkeletonPage,
    documentTop: number,
    viewportTop: number,
    viewportBottom: number
): number | undefined {
    const protectedBottom = viewportBottom + Math.max(0, viewportBottom - viewportTop);
    let endOffset: number | undefined;

    for (const section of page.sections) {
        for (const column of section.columns) {
            const localBottom = protectedBottom - documentTop - page.marginTop - section.top;
            let low = 0;
            let high = column.lines.length;
            while (low < high) {
                const middle = low + Math.floor((high - low) / 2);
                if (column.lines[middle].top <= localBottom) {
                    low = middle + 1;
                } else {
                    high = middle;
                }
            }
            const lastVisibleLine = column.lines[low - 1];
            if (lastVisibleLine != null) {
                endOffset = Math.max(endOffset ?? lastVisibleLine.ed, lastVisibleLine.ed);
            }
        }
    }

    return endOffset;
}

type DocLayoutCoordinatorCallbacks = Parameters<DocLayoutCoordinatorService['schedule']>[2];

/**
 * Returns false only when a mutation is proven to touch overlay-only drawings.
 *
 * WRAP_NONE drawings are positioned independently from text, so moving, resizing,
 * rotating, or switching them between front/behind text must refresh drawing
 * geometry without starting a document layout generation. Every uncertain case
 * remains conservative and reflows.
 */
export function doesDocMutationRequireLayout(
    actions: JSONXActions,
    drawings: Record<string, IDocDrawingBase> | undefined
): boolean {
    if (actions == null || !Array.isArray(actions) || actions.length === 0) {
        return true;
    }

    const transitions = new Map<string, IDrawingLayoutTransition>();
    let sawComponent = false;
    let drawingOnly = true;

    try {
        const cursor = JSON1.type.readCursor(actions);
        cursor.traverse(null, (component) => {
            sawComponent = true;
            const path = cursor.getPath();
            const drawingId = path[1];
            if (path[0] !== 'drawings' || typeof drawingId !== 'string') {
                drawingOnly = false;
                return;
            }

            const transition = transitions.get(drawingId) ?? {};
            if (path.length === 2) {
                transition.before = getDrawingLayoutType(component.r);
                transition.after = getDrawingLayoutType(component.i);
            } else if (path.length === 3 && path[2] === 'layoutType') {
                transition.before = isPositionedObjectLayoutType(component.r)
                    ? component.r
                    : transition.before;
                transition.after = isPositionedObjectLayoutType(component.i)
                    ? component.i
                    : transition.after;
            }
            transitions.set(drawingId, transition);
        });
    } catch {
        return true;
    }

    if (!sawComponent || !drawingOnly || transitions.size === 0) {
        return true;
    }

    for (const [drawingId, transition] of transitions) {
        const currentLayoutType = drawings?.[drawingId]?.layoutType;
        const before = transition.before ?? currentLayoutType;
        const after = transition.after ?? currentLayoutType;
        if (
            before == null ||
            after == null ||
            before !== PositionedObjectLayoutType.WRAP_NONE ||
            after !== PositionedObjectLayoutType.WRAP_NONE
        ) {
            return true;
        }
    }

    return false;
}

export class DocRenderController extends RxDisposable implements IRenderModule {
    private _changesetRenderScheduled = false;
    private readonly _layoutCoordinator: DocLayoutCoordinatorService;
    private _layoutRequestId = 0;
    private _workerHandoffTimer: ReturnType<typeof setTimeout> | null = null;
    private _workerPresentationResumeTimer: ReturnType<typeof setTimeout> | null = null;
    private _pendingWorkerHandoff: IDocLayoutWorkerHandoff | null = null;
    private _pendingWorkerEditBatch: IDocLayoutWorkerEditBatch | null = null;
    private _latestLayoutRestart: (() => void) | null = null;
    private _pendingImeLayoutRestart: (() => void) | null = null;
    private _isImeComposing = false;
    private _recoveryViewportAnchor: IDocLayoutViewportAnchor | null = null;
    private _pendingMaterializedPageRange: IDocumentLayoutPageRange | null = null;
    private _isMaterializingPages = false;
    private _reservedLayoutWidth = 0;
    private _reservedLayoutHeight = 0;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @Inject(DocViewScaleService) private readonly _docViewScaleService: DocViewScaleService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(DocLayoutExecutorService) private readonly _docLayoutExecutorService: DocLayoutExecutorService,
        @Inject(DocLayoutInteractionService) private readonly _docLayoutInteractionService: DocLayoutInteractionService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this._layoutCoordinator = new DocLayoutCoordinatorService((callback) =>
            this._scheduleVisualFrame(callback));
        this.disposeWithMe(this._layoutCoordinator);

        this._addNewRender();
        this._initRenderRefresh();
        this._initCommandListener();
        this._initInteractionLayoutProtection();
        this._initThemeListener();
    }

    private _scheduleVisualFrame(callback: () => void): () => void {
        const beginFrame$ = this._context.engine.beginFrame$;
        if (beginFrame$ == null) {
            const frameId = requestAnimationFrame(callback);
            return () => cancelAnimationFrame(frameId);
        }

        let disposed = false;
        let unsubscribe: (() => void) | null = null;
        const schedule = () => {
            const subscription = beginFrame$.pipe(take(1)).subscribe(() => {
                if (disposed) {
                    return;
                }

                const parent = this._context.scene.getParent();
                if (parent == null || parent.width <= 1 || parent.height <= 1) {
                    schedule();
                    return;
                }
                callback();
            });
            unsubscribe = () => subscription.unsubscribe();
        };
        schedule();

        return () => {
            disposed = true;
            unsubscribe?.();
        };
    }

    reRender(
        unitId: string,
        anchor?: number,
        invalidation?: IDocumentLayoutInvalidation,
        priorityAnchor?: number,
        refreshMainSelection = true,
        preserveInactiveViewportAnchor = false,
        deferForeground = false
    ) {
        const docSkeletonManagerService = this._renderManagerService.getRenderUnitById(unitId)?.with(DocSkeletonManagerService);
        if (!docSkeletonManagerService) {
            return;
        }

        const skeleton = docSkeletonManagerService.getSkeleton();
        if (!skeleton) {
            return;
        }

        // TODO: `disabled` is only used for read only demo, and will be removed in the future.
        const disabled = !!skeleton.getViewModel().getDataModel().getSnapshot().disabled;
        if (disabled) {
            return;
        }

        if (!docSkeletonManagerService.supportsIncrementalLayout()) {
            docSkeletonManagerService.recalculate();
            return;
        }

        const hasExplicitEditAnchor = anchor != null || priorityAnchor != null || invalidation != null;
        const layoutOptions: IDocLayoutScheduleOptions = !skeleton.hasCompleteLayout() && !hasExplicitEditAnchor
            ? { reason: 'initial' }
            : {
                reason: 'edit',
                anchor: anchor ?? 0,
                priorityAnchor,
                invalidation,
                ...(deferForeground ? { deferForeground: true } : {}),
            };
        this._scheduleLayout(
            unitId,
            skeleton,
            layoutOptions,
            refreshMainSelection,
            preserveInactiveViewportAnchor
        );
    }

    override dispose(): void {
        this._layoutRequestId++;
        if (this._workerHandoffTimer != null) {
            clearTimeout(this._workerHandoffTimer);
            this._workerHandoffTimer = null;
        }
        if (this._workerPresentationResumeTimer != null) {
            clearTimeout(this._workerPresentationResumeTimer);
            this._workerPresentationResumeTimer = null;
        }
        this._pendingWorkerHandoff = null;
        this._pendingWorkerEditBatch = null;
        this._latestLayoutRestart = null;
        this._pendingImeLayoutRestart = null;
        this._pendingMaterializedPageRange = null;
        this._recoveryViewportAnchor = null;
        super.dispose();
    }

    refreshCustomBlockPresentation(unitId: string): boolean {
        const skeleton = this._renderManagerService.getRenderUnitById(unitId)?.with(DocSkeletonManagerService)?.getSkeleton();
        if (skeleton == null) {
            return false;
        }

        const result = skeleton.refreshCustomBlockPresentationViewports();
        if (result.didRefresh) {
            this._context.mainComponent?.makeDirty(true);
            this._context.components.get(DOCS_VIEW_KEY.BACKGROUND)?.makeDirty(true);
        }

        return !result.requiresLayout;
    }

    private _scheduleLayout(
        unitId: string,
        skeleton: DocumentSkeleton,
        options: IDocLayoutScheduleOptions,
        refreshMainSelection = true,
        preserveInactiveViewportAnchor = false
    ) {
        this._latestLayoutRestart = () => this._scheduleLayout(
            unitId,
            skeleton,
            options,
            refreshMainSelection,
            preserveInactiveViewportAnchor
        );
        if (this._isImeComposing) {
            // A mutation scheduled during composition already supersedes the
            // generation cancelled by compositionstart. Let that newer request
            // continue instead of replaying the stale pre-composition request.
            this._pendingImeLayoutRestart = null;
        }
        const layoutRequestId = ++this._layoutRequestId;
        this._cancelWorkerHandoff();
        const isInitialLayout = options.reason === 'initial';
        const docsComponent = this._context.mainComponent;
        if (!(docsComponent instanceof Documents)) {
            return;
        }
        this._prepareReservedLayoutExtent(skeleton, docsComponent);

        const mainThreadCallbacks = this._createLayoutCallbacks(
            unitId,
            skeleton,
            options,
            refreshMainSelection,
            true,
            preserveInactiveViewportAnchor,
            undefined,
            false
        );
        if (options.reuseMainBaseline) {
            // Offset-preserving render metadata does not change Worker geometry.
            // Keep any older pending batch intact, but do not create a false
            // background-layout task for this Main-only publication.
            this._layoutCoordinator.schedule(skeleton, options, mainThreadCallbacks);
            return;
        }
        if (this._docLayoutExecutorService.getExecutor() == null) {
            this._pendingWorkerEditBatch = null;
            this._layoutCoordinator.schedule(skeleton, options, mainThreadCallbacks);
            return;
        }
        const workerOptions = isInitialLayout
            ? options
            : this._accumulateWorkerEditBatch(options);
        if (isInitialLayout) {
            this._pendingWorkerEditBatch = null;
            this._scheduleInitialInteractionWindow(
                layoutRequestId,
                unitId,
                skeleton,
                options,
                workerOptions,
                mainThreadCallbacks,
                preserveInactiveViewportAnchor
            );
            return;
        }

        this._scheduleMainInteractionWindow(
            layoutRequestId,
            unitId,
            skeleton,
            options,
            workerOptions,
            mainThreadCallbacks,
            refreshMainSelection,
            preserveInactiveViewportAnchor
        );
    }

    private _scheduleInitialInteractionWindow(
        layoutRequestId: number,
        unitId: string,
        skeleton: DocumentSkeleton,
        options: IDocLayoutScheduleOptions,
        workerOptions: IDocLayoutScheduleOptions,
        mainThreadCallbacks: DocLayoutCoordinatorCallbacks,
        preserveInactiveViewportAnchor: boolean
    ): void {
        // Initial layout has no mutation anchor. Give its foreground window an
        // explicit viewport anchor so it can hand off before Main finishes the
        // whole document; only a stable physical page can publish this anchor.
        this._layoutCoordinator.schedule(skeleton, { ...options, priorityAnchor: options.priorityAnchor ?? 0 }, {
            onProgress: mainThreadCallbacks.onProgress,
            onForegroundReady: (progress) => {
                if (progress.complete) {
                    return;
                }

                const protectedRange = this._resolveProtectedRange(skeleton, 0, progress);
                this._queueWorkerHandoff(layoutRequestId, () => {
                    this._scheduleWorkerLayout(
                        layoutRequestId,
                        unitId,
                        skeleton,
                        options,
                        workerOptions,
                        protectedRange,
                        mainThreadCallbacks,
                        preserveInactiveViewportAnchor
                    );
                });
            },
        });
    }

    private _prepareReservedLayoutExtent(skeleton: DocumentSkeleton, docsComponent: Documents): void {
        if (skeleton.hasCompleteLayout()) {
            // Editing keeps the previous complete document extent along the flow
            // axis. The scene is a viewport and may still have its 1500px default,
            // so it must never seed document geometry.
            this._reservedLayoutWidth = Math.max(this._reservedLayoutWidth, docsComponent.width || 0);
            this._reservedLayoutHeight = Math.max(this._reservedLayoutHeight, docsComponent.height || 0);
        } else {
            // First-open layout has no stable extent to preserve. Let the first
            // published page establish its real cross-axis size immediately.
            this._reservedLayoutWidth = 0;
            this._reservedLayoutHeight = 0;
        }
    }

    private _scheduleMainInteractionWindow(
        layoutRequestId: number,
        unitId: string,
        skeleton: DocumentSkeleton,
        options: IDocLayoutScheduleOptions,
        workerOptions: IDocLayoutScheduleOptions,
        mainThreadCallbacks: DocLayoutCoordinatorCallbacks,
        refreshMainSelection: boolean,
        preserveInactiveViewportAnchor: boolean
    ): void {
        // A local post-edit caret stays inside the mutation's new range, so Main
        // must rebuild from the mutation start (notably when Enter splits a
        // paragraph). A transformed local caret outside that range identifies a
        // remote edit; keep protecting the local interaction page in that case.
        const priorityAnchorBelongsToMutation = options.priorityAnchor != null &&
            options.invalidation != null &&
            options.priorityAnchor >= options.invalidation.oldStart &&
            options.priorityAnchor <= options.invalidation.newEnd;
        const interactionAnchor = priorityAnchorBelongsToMutation
            ? options.anchor
            : options.priorityAnchor ?? options.anchor;
        let interactionViewportAnchor = priorityAnchorBelongsToMutation
            ? null
            : this._captureViewportAnchor(
                skeleton,
                options.priorityAnchor,
                options.invalidation
            );
        const foregroundEndOffset = this._resolveContinuousForegroundEndOffset(
            skeleton,
            options.invalidation
        );
        this._layoutCoordinator.schedule(skeleton, {
            ...options,
            anchor: interactionAnchor,
            ...(foregroundEndOffset == null ? {} : { foregroundEndOffset }),
            preserveInteractionWindow: interactionAnchor != null && interactionAnchor !== options.anchor,
            // The authoritative Worker recomputes the suffix after the protected
            // interaction window. Deep-cloning and shifting the complete previous
            // tail on Main would duplicate that work in the input task and turns a
            // one-page edit into an O(document pages) operation.
            reuseUnaffectedTail: false,
        }, {
            onProgress: (progress, publication) => {
                mainThreadCallbacks.onProgress(progress, publication);
                if (
                    interactionViewportAnchor != null &&
                    (progress.didPublishAnchor || progress.complete)
                ) {
                    this._restoreViewportAnchor(skeleton, interactionViewportAnchor);
                    interactionViewportAnchor = null;
                }
            },
            onForegroundReady: (progress) => {
                this._refreshSelectionAfterForegroundLayout(unitId, refreshMainSelection);
                const protectedRange = this._resolveProtectedRange(
                    skeleton,
                    options.priorityAnchor ?? options.anchor,
                    progress
                );
                this._queueWorkerHandoff(layoutRequestId, () => {
                    this._scheduleWorkerLayout(
                        layoutRequestId,
                        unitId,
                        skeleton,
                        options,
                        workerOptions,
                        protectedRange,
                        mainThreadCallbacks,
                        preserveInactiveViewportAnchor
                    );
                });
            },
        });
    }

    private _refreshSelectionAfterForegroundLayout(unitId: string, refreshMainSelection: boolean): void {
        if (refreshMainSelection) {
            return;
        }

        // The mutation defers visual selection refresh to a microtask. The
        // foreground window can replace its adjacent page afterwards, so rebuild
        // the caret before handing the remaining suffix to the Worker.
        this._refreshPagePositionAndSelection(this._getActiveEditingRange(unitId) != null);
    }

    private _resolveContinuousForegroundEndOffset(
        skeleton: DocumentSkeleton,
        invalidation: IDocumentLayoutInvalidation | undefined
    ): number | undefined {
        if (this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.MODERN) {
            return undefined;
        }

        const page = skeleton.getSkeletonData()?.pages[0];
        const docsComponent = this._context.mainComponent;
        const viewport = this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (page == null || !(docsComponent instanceof Documents) || viewport == null) {
            return undefined;
        }

        const viewBound = viewport.calcViewportInfo().viewBound;
        if (!Number.isFinite(viewBound.top) || !Number.isFinite(viewBound.bottom)) {
            return undefined;
        }

        const previousEndOffset = findContinuousLayoutEndOffset(
            page,
            docsComponent.getOffsetConfig().docsTop,
            viewBound.top,
            viewBound.bottom
        );
        return previousEndOffset == null
            ? undefined
            : mapPreviousOffsetToCurrent(previousEndOffset, invalidation);
    }

    private _createLayoutCallbacks(
        unitId: string,
        skeleton: DocumentSkeleton,
        options: IDocLayoutScheduleOptions,
        refreshIncompleteAnchorSelection: boolean,
        refreshCompleteSelection: boolean,
        preserveInactiveViewportAnchor: boolean,
        layoutRequestId: number | undefined,
        deferCompleteDuringInteraction: boolean
    ): DocLayoutCoordinatorCallbacks {
        const isInitialLayout = options.reason === 'initial';
        return {
            onProgress: (progress, publication) => this._handleLayoutProgress(
                unitId,
                skeleton,
                options,
                progress,
                publication,
                isInitialLayout,
                refreshIncompleteAnchorSelection,
                refreshCompleteSelection,
                preserveInactiveViewportAnchor,
                layoutRequestId,
                deferCompleteDuringInteraction
            ),
        };
    }

    private _handleLayoutProgress(
        unitId: string,
        skeleton: DocumentSkeleton,
        options: IDocLayoutScheduleOptions,
        progress: IDocumentLayoutProgress,
        publication: Parameters<DocumentSkeleton['applyLayoutPublication']>[0] | null | undefined,
        isInitialLayout: boolean,
        refreshIncompleteAnchorSelection: boolean,
        refreshCompleteSelection: boolean,
        preserveInactiveViewportAnchor: boolean,
        layoutRequestId: number | undefined,
        deferCompleteDuringInteraction: boolean
    ): void {
        if (!progress.didPublish) {
            return;
        }
        if (
            deferCompleteDuringInteraction &&
            progress.complete &&
            publication != null &&
            layoutRequestId != null &&
            this._docLayoutInteractionService.isActive
        ) {
            this._queueWorkerHandoff(
                layoutRequestId,
                () => this._handleLayoutProgress(
                    unitId,
                    skeleton,
                    options,
                    progress,
                    publication,
                    isInitialLayout,
                    refreshIncompleteAnchorSelection,
                    refreshCompleteSelection,
                    preserveInactiveViewportAnchor,
                    layoutRequestId,
                    false
                ),
                true
            );
            return;
        }
        const completionViewportAnchor = this._captureCompletionViewportAnchor(
            unitId,
            skeleton,
            publication != null && progress.complete && !isInitialLayout,
            preserveInactiveViewportAnchor
        );
        const applyResult = this._applyLayoutPublication(unitId, skeleton, publication, progress);

        const editorRenderConfig = this._editorService.getEditorRenderConfig(unitId);
        if (editorRenderConfig && !editorRenderConfig.scrollBar) {
            this._markDocumentRenderDirty();
            return;
        }

        this._recalculateSizeBySkeleton(skeleton, progress);
        if (progress.complete) {
            this._completeLayoutPresentation(
                unitId,
                skeleton,
                completionViewportAnchor,
                refreshCompleteSelection,
                refreshIncompleteAnchorSelection,
                applyResult?.didReplaceProtectedPages === true
            );
        } else if (isInitialLayout) {
            this._refreshPagePosition();
        } else if (progress.didPublishAnchor && (
            refreshIncompleteAnchorSelection || this._docSelectionRenderService.hasPendingSelection
        )) {
            // The foreground pass replaces edited line and glyph objects. Rebuild
            // the caret from stable document offsets without moving the viewport.
            this._textSelectionManagerService.refreshSelection(
                { unitId, subUnitId: unitId },
                this._getActiveEditingRange(unitId) != null
            );
        }

        // Size, translation and content belong to one visual publication.
        this._markDocumentRenderDirty();
    }

    private _applyLayoutPublication(
        unitId: string,
        skeleton: DocumentSkeleton,
        publication: Parameters<DocumentSkeleton['applyLayoutPublication']>[0] | null | undefined,
        progress: IDocumentLayoutProgress
    ): ReturnType<DocumentSkeleton['applyLayoutPublication']> | null {
        if (publication == null) {
            return null;
        }

        const hydrationStartedAt = Tools.now();
        try {
            const materializedPageRange = progress.mode === 'paginated'
                ? this._resolveMaterializedPageRange(skeleton, progress.publishedPageCount)
                : undefined;
            return skeleton.applyLayoutPublication(publication, progress, materializedPageRange);
        } finally {
            this._docLayoutExecutorService.recordHydrationDuration(
                unitId,
                Tools.now() - hydrationStartedAt
            );
        }
    }

    private _completeLayoutPresentation(
        unitId: string,
        skeleton: DocumentSkeleton,
        completionViewportAnchor: IDocLayoutViewportAnchor | null,
        refreshCompleteSelection: boolean,
        preserveEditingSelection: boolean,
        didReplaceProtectedPages: boolean
    ): void {
        this._docLayoutExecutorService.completeRecovery(unitId);
        if (refreshCompleteSelection || didReplaceProtectedPages || this._docSelectionRenderService.hasPendingSelection) {
            const isEditing = preserveEditingSelection ||
                didReplaceProtectedPages ||
                this._getActiveEditingRange(unitId) != null;
            this._refreshPagePositionAndSelection(isEditing);
        } else {
            this._refreshPagePosition();
        }
        this._restoreViewportAnchor(skeleton, completionViewportAnchor);
        this._restoreRecoveryViewportAnchor(skeleton);
    }

    private _scheduleWorkerLayout(
        layoutRequestId: number,
        unitId: string,
        skeleton: DocumentSkeleton,
        options: IDocLayoutScheduleOptions,
        workerOptions: IDocLayoutScheduleOptions,
        protectedRange: IDocumentLayoutProtectedRange | undefined,
        mainThreadCallbacks: DocLayoutCoordinatorCallbacks,
        preserveInactiveViewportAnchor: boolean,
        allowRecovery = true
    ): void {
        if (layoutRequestId !== this._layoutRequestId) {
            return;
        }

        this._layoutCoordinator.scheduleWorker(
            unitId,
            skeleton,
            this._docLayoutExecutorService,
            workerOptions,
            protectedRange,
            {
                ...this._createLayoutCallbacks(
                    unitId,
                    skeleton,
                    options,
                    false,
                    false,
                    preserveInactiveViewportAnchor,
                    layoutRequestId,
                    true
                ),
                onComplete: () => {
                    if (layoutRequestId === this._layoutRequestId) {
                        this._pendingWorkerEditBatch = null;
                    }
                },
            },
            (error) => this._handleWorkerLayoutFailure(
                layoutRequestId,
                unitId,
                skeleton,
                options,
                workerOptions,
                protectedRange,
                mainThreadCallbacks,
                preserveInactiveViewportAnchor,
                allowRecovery,
                error
            )
        );
    }

    private _handleWorkerLayoutFailure(
        layoutRequestId: number,
        unitId: string,
        skeleton: DocumentSkeleton,
        options: IDocLayoutScheduleOptions,
        workerOptions: IDocLayoutScheduleOptions,
        protectedRange: IDocumentLayoutProtectedRange | undefined,
        mainThreadCallbacks: DocLayoutCoordinatorCallbacks,
        preserveInactiveViewportAnchor: boolean,
        allowRecovery: boolean,
        error: unknown
    ): void {
        if (!allowRecovery) {
            this._logService.error('[DocRenderController]: Worker layout failed; using main-thread layout.', error);
            this._layoutCoordinator.schedule(skeleton, options, mainThreadCallbacks);
            return;
        }

        this._recoveryViewportAnchor = this._captureViewportAnchor(
            skeleton,
            options.priorityAnchor ?? options.anchor,
            options.invalidation
        );
        const diagnostic = error instanceof Error ? error.message : String(error);
        this._logService.warn('[DocRenderController]: restarting the document layout Worker after a fatal layout failure.', error);
        this._docLayoutExecutorService.recoverExecutor(unitId, diagnostic).then(() => {
            this._scheduleWorkerLayout(
                layoutRequestId,
                unitId,
                skeleton,
                options,
                workerOptions,
                protectedRange,
                mainThreadCallbacks,
                preserveInactiveViewportAnchor,
                false
            );
        }).catch((recoveryError: unknown) => {
            this._logService.error('[DocRenderController]: document layout Worker recovery failed; using main-thread layout.', recoveryError);
            this._layoutCoordinator.schedule(skeleton, options, mainThreadCallbacks);
        });
    }

    private _accumulateWorkerEditBatch(options: {
        reason: 'initial' | 'edit';
        anchor?: number;
        priorityAnchor?: number;
        invalidation?: IDocumentLayoutInvalidation;
    }): typeof options {
        const pending = this._pendingWorkerEditBatch;
        this._pendingWorkerEditBatch = pending == null
            ? {
                anchor: options.anchor,
                invalidation: options.invalidation,
            }
            : {
                anchor: pending.anchor == null || options.anchor == null
                    ? undefined
                    : Math.min(pending.anchor, options.anchor),
                // The Worker is still based on the preceding complete model. Compose
                // every pending scalar edit into one conservative changed span so
                // IME commits and continued typing retain an exact tail offset delta.
                // A structurally ambiguous mutation remains undefined and therefore
                // keeps the canonical full-suffix fallback.
                invalidation: mergeDocumentLayoutInvalidations(
                    pending.invalidation,
                    options.invalidation
                ),
            };

        return {
            ...options,
            anchor: this._pendingWorkerEditBatch.anchor,
            priorityAnchor: this._pendingWorkerEditBatch.anchor,
            invalidation: this._pendingWorkerEditBatch.invalidation,
        };
    }

    private _initInteractionLayoutProtection(): void {
        this._docLayoutInteractionService.active$
            .pipe(takeUntil(this.dispose$))
            .subscribe((active) => {
                if (active) {
                    if (this._workerPresentationResumeTimer != null) {
                        clearTimeout(this._workerPresentationResumeTimer);
                        this._workerPresentationResumeTimer = null;
                    }
                    this._layoutCoordinator.setWorkerPresentationPaused(true);
                    if (this._pendingWorkerHandoff?.waitForInteractionEnd && this._workerHandoffTimer != null) {
                        clearTimeout(this._workerHandoffTimer);
                        this._workerHandoffTimer = null;
                    }
                    return;
                }

                this._workerPresentationResumeTimer = setTimeout(() => {
                    this._workerPresentationResumeTimer = null;
                    if (!this._docLayoutInteractionService.isActive) {
                        this._layoutCoordinator.setWorkerPresentationPaused(false);
                    }
                }, EDIT_WORKER_RESUME_DELAY_MS);
                this._startWorkerHandoffTimer();
            });
        this._docSelectionRenderService.onCompositionstart$
            .pipe(takeUntil(this.dispose$))
            .subscribe((config) => {
                if (config == null) {
                    return;
                }

                this._isImeComposing = true;
                if (this._workerHandoffTimer != null) {
                    clearTimeout(this._workerHandoffTimer);
                    this._workerHandoffTimer = null;
                }
                if (
                    this._pendingWorkerHandoff == null &&
                    this._layoutCoordinator.hasScheduledLayout()
                ) {
                    this._pendingImeLayoutRestart = this._latestLayoutRestart;
                }
                this._layoutCoordinator.cancel();
            });
        this._docSelectionRenderService.onCompositionend$
            .pipe(takeUntil(this.dispose$))
            .subscribe((config) => {
                if (config == null) {
                    return;
                }

                this._isImeComposing = false;
                const restartLayout = this._pendingImeLayoutRestart;
                this._pendingImeLayoutRestart = null;
                if (restartLayout != null) {
                    restartLayout();
                    return;
                }
                this._startWorkerHandoffTimer();
            });
    }

    private _queueWorkerHandoff(layoutRequestId: number, run: () => void, waitForInteractionEnd = false): void {
        this._cancelWorkerHandoff();
        this._pendingWorkerHandoff = { layoutRequestId, run, waitForInteractionEnd };
        this._startWorkerHandoffTimer();
    }

    private _startWorkerHandoffTimer(): void {
        if (
            this._pendingWorkerHandoff == null ||
            this._workerHandoffTimer != null ||
            this._isImeComposing ||
            (this._pendingWorkerHandoff.waitForInteractionEnd && this._docLayoutInteractionService.isActive)
        ) {
            return;
        }

        this._workerHandoffTimer = setTimeout(() => {
            this._workerHandoffTimer = null;
            const handoff = this._pendingWorkerHandoff;
            if (handoff == null) {
                return;
            }
            if (handoff.layoutRequestId !== this._layoutRequestId) {
                this._pendingWorkerHandoff = null;
                return;
            }
            if (
                this._isImeComposing ||
                (handoff.waitForInteractionEnd && this._docLayoutInteractionService.isActive) ||
                this._docSelectionRenderService.isOnPointerEvent
            ) {
                this._startWorkerHandoffTimer();
                return;
            }

            this._pendingWorkerHandoff = null;
            handoff.run();
        }, EDIT_WORKER_RESUME_DELAY_MS);
    }

    private _deferWorkerHandoff(): void {
        if (this._pendingWorkerHandoff == null) {
            return;
        }
        if (this._workerHandoffTimer != null) {
            clearTimeout(this._workerHandoffTimer);
            this._workerHandoffTimer = null;
        }
        this._startWorkerHandoffTimer();
    }

    private _cancelWorkerHandoff(): void {
        if (this._workerHandoffTimer != null) {
            clearTimeout(this._workerHandoffTimer);
            this._workerHandoffTimer = null;
        }
        this._pendingWorkerHandoff = null;
    }

    private _resolveProtectedRange(
        skeleton: DocumentSkeleton,
        anchor: number | undefined,
        progress: IDocumentLayoutProgress
    ): IDocumentLayoutProtectedRange | undefined {
        if (progress.mode === 'continuous') {
            if (progress.stableLaidOutThrough < 0) {
                return undefined;
            }

            return {
                mode: 'continuous',
                startOffset: Math.max(0, Math.min(anchor ?? progress.stableLaidOutThrough, progress.stableLaidOutThrough)),
                endOffset: progress.stableLaidOutThrough,
            };
        }

        const pages = skeleton.getSkeletonData()?.pages;
        if (pages == null || pages.length === 0 || progress.publishedPageCount <= 0) {
            return undefined;
        }

        const publishedEndPageIndex = Math.min(progress.publishedPageCount, pages.length) - 1;
        let startPageIndex = anchor == null
            ? Math.max(0, publishedEndPageIndex - 4)
            : skeleton.findNodePositionByCharIndex(anchor)?.page ?? -1;
        if (startPageIndex < 0 || startPageIndex > publishedEndPageIndex) {
            startPageIndex = Math.max(0, publishedEndPageIndex - 4);
        }

        while (
            startPageIndex <= publishedEndPageIndex &&
            (pages[startPageIndex]?.isLayoutPlaceholder || pages[startPageIndex]?.isMaterializationPlaceholder)
        ) {
            startPageIndex++;
        }
        if (startPageIndex > publishedEndPageIndex) {
            return undefined;
        }

        let endPageIndex = publishedEndPageIndex;
        const maximumProtectedEndPageIndex = Math.min(
            pages.length - 1,
            startPageIndex + MATERIALIZED_PAGE_WINDOW_SIZE - 1
        );
        while (endPageIndex < maximumProtectedEndPageIndex) {
            const nextPage = pages[endPageIndex + 1];
            if (nextPage == null || nextPage.isLayoutPlaceholder || nextPage.isMaterializationPlaceholder) {
                break;
            }
            endPageIndex++;
        }

        return {
            mode: 'paginated',
            startPageIndex,
            endPageIndex,
        };
    }

    private _resolveMaterializedPageRange(
        skeleton: DocumentSkeleton,
        publishedPageCount?: number
    ): IDocumentLayoutPageRange | undefined {
        if (this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL) {
            return undefined;
        }
        const pages = skeleton.getSkeletonData()?.pages;
        const docsComponent = this._context.mainComponent;
        const viewport = this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        const pageAxis = resolveMaterializedPageAxis(docsComponent, viewport);
        if (pages == null || pages.length === 0 || pageAxis == null) {
            return undefined;
        }
        const { pageGap, vertical, viewportCenter } = pageAxis;
        let pageStart = 0;
        let pageIndex = 0;
        for (; pageIndex < pages.length; pageIndex++) {
            const page = pages[pageIndex];
            const pageExtent = vertical ? page.pageHeight : page.pageWidth;
            if (viewportCenter <= pageStart + pageExtent) {
                break;
            }
            pageStart += pageExtent + pageGap;
        }
        const availablePageCount = Math.max(pages.length, publishedPageCount ?? 0);
        if (pageIndex >= pages.length && availablePageCount > pages.length) {
            const lastPage = pages.at(-1);
            const estimatedExtent = vertical ? lastPage?.pageHeight : lastPage?.pageWidth;
            if (estimatedExtent != null && estimatedExtent + pageGap > 0) {
                pageIndex += Math.floor(Math.max(0, viewportCenter - pageStart) / (estimatedExtent + pageGap));
            }
        }
        pageIndex = Math.max(0, Math.min(pageIndex, availablePageCount - 1));
        const preferredStart = Math.max(0, pageIndex - 1);
        const endPageIndex = Math.min(
            availablePageCount - 1,
            preferredStart + MATERIALIZED_PAGE_WINDOW_SIZE - 1
        );
        return {
            startPageIndex: Math.max(0, endPageIndex - MATERIALIZED_PAGE_WINDOW_SIZE + 1),
            endPageIndex,
        };
    }

    private _queueMaterializedPageRange(range: IDocumentLayoutPageRange): void {
        this._pendingMaterializedPageRange = range;
        if (this._isMaterializingPages) {
            return;
        }
        this._isMaterializingPages = true;
        this._materializePendingPageRanges().catch((error: unknown) => {
            this._logService.warn('[DocRenderController]: failed to materialize a document page.', error);
        }).finally(() => {
            this._isMaterializingPages = false;
            if (this._pendingMaterializedPageRange != null) {
                this._queueMaterializedPageRange(this._pendingMaterializedPageRange);
            }
        });
    }

    private async _materializePendingPageRanges(): Promise<void> {
        while (this._pendingMaterializedPageRange != null) {
            const range = this._pendingMaterializedPageRange;
            this._pendingMaterializedPageRange = null;
            const requestId = this._layoutRequestId;
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            if (skeleton == null) {
                return;
            }
            for (let pageIndex = range.startPageIndex; pageIndex <= range.endPageIndex; pageIndex++) {
                if (!skeleton.getSkeletonData()?.pages[pageIndex]?.isMaterializationPlaceholder) {
                    continue;
                }
                const result = await this._layoutCoordinator.getWorkerPage(pageIndex);
                if (requestId !== this._layoutRequestId || result == null) {
                    return;
                }
                if (result.page == null) {
                    continue;
                }
                const hydrationStartedAt = Tools.now();
                try {
                    skeleton.applyLayoutPagePublication(result.page, range);
                } finally {
                    this._docLayoutExecutorService.recordHydrationDuration(
                        this._context.unitId,
                        Tools.now() - hydrationStartedAt
                    );
                }
                this._markDocumentRenderDirty();
            }
        }
    }

    private _captureViewportAnchor(
        skeleton: DocumentSkeleton,
        offset: number | undefined,
        invalidation: IDocumentLayoutInvalidation | undefined
    ): IDocLayoutViewportAnchor | null {
        if (offset == null) {
            return null;
        }
        const previousOffset = invalidation == null || offset < invalidation.oldStart
            ? offset
            : offset < invalidation.newEnd
                ? invalidation.oldStart
                : offset - (invalidation.newEnd - invalidation.oldEnd);
        const position = skeleton.findNodePositionByCharIndex(previousOffset);
        const docsComponent = this._context.mainComponent;
        const viewport = this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (position == null || !(docsComponent instanceof Documents) || viewport == null) {
            return null;
        }

        const offsetConfig = docsComponent.getOffsetConfig();
        const convertor = new NodePositionConvertToCursor(offsetConfig, skeleton);
        const { contentBoxPointGroup } = convertor.getRangePointData(position, position);
        const anchor = getAnchorBounding(contentBoxPointGroup);
        const viewBound = viewport.calcViewportInfo().viewBound;
        return {
            offset,
            relativeLeft: anchor.left + offsetConfig.docsLeft - viewBound.left,
            relativeTop: anchor.top + offsetConfig.docsTop - viewBound.top,
        };
    }

    private _restoreRecoveryViewportAnchor(skeleton: DocumentSkeleton): void {
        const captured = this._recoveryViewportAnchor;
        if (captured == null) {
            return;
        }
        this._recoveryViewportAnchor = null;

        this._restoreViewportAnchor(skeleton, captured);
    }

    private _restoreViewportAnchor(
        skeleton: DocumentSkeleton,
        captured: IDocLayoutViewportAnchor | null
    ): void {
        if (captured == null) {
            return;
        }

        const position = skeleton.findNodePositionByCharIndex(captured.offset);
        const docsComponent = this._context.mainComponent;
        const viewport = this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (position == null || !(docsComponent instanceof Documents) || viewport == null) {
            return;
        }

        const offsetConfig = docsComponent.getOffsetConfig();
        const convertor = new NodePositionConvertToCursor(offsetConfig, skeleton);
        const { contentBoxPointGroup } = convertor.getRangePointData(position, position);
        const anchor = getAnchorBounding(contentBoxPointGroup);
        const viewBound = viewport.calcViewportInfo().viewBound;
        viewport.scrollByViewportDeltaVal({
            viewportScrollX: anchor.left + offsetConfig.docsLeft - viewBound.left - captured.relativeLeft,
            viewportScrollY: anchor.top + offsetConfig.docsTop - viewBound.top - captured.relativeTop,
        });
    }

    private _addNewRender() {
        const { scene, engine } = this._context;

        const viewMain = new Viewport(VIEWPORT_KEY.VIEW_MAIN, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });

        scene.attachControl();
        this._initViewportInteraction(viewMain);

        // TODO@wzhudev: this shouldn't be a config, because we may render different units at the same time.
        // @jikkai: hasScroll has never been set before, so I commented it out.
        // const hasScroll = this._configService.getConfig('hasScroll') as Nullable<boolean>;
        // if (hasScroll !== false) {
        const _scrollBar = new ScrollBar(viewMain, {
            enableHorizontal: this._shouldEnableHorizontalScrollBar(),
        });
        // }

        scene.addLayer(
            new Layer(scene, [], DOCS_COMPONENT_MAIN_LAYER_INDEX),
            new Layer(scene, [], DOCS_COMPONENT_HEADER_LAYER_INDEX)
        );

        this._addComponent();

        const frameFn = () => scene.render();
        this.disposeWithMe(this._context.activated$.subscribe((activated) => {
            if (activated) {
                // TODO: we should attach the context object to the RenderContext object on scene.canvas.
                engine.runRenderLoop(frameFn);
            } else {
                // Stop the render loop when the render unit is deactivated.
                engine.stopRenderLoop(frameFn);
            }
        }));

        // Attach scroll event after main viewport created.
        this._docSelectionRenderService.__attachScrollEvent();
    }

    private _initViewportInteraction(viewMain: Viewport): void {
        const { scene } = this._context;

        const pointerDownSubscription = scene.onPointerDown$?.subscribeEvent(() => {
            this._deferWorkerHandoff();
            this._layoutCoordinator.deferBackgroundWork();
        });
        if (pointerDownSubscription != null) {
            this.disposeWithMe(pointerDownSubscription);
        }
        this.disposeWithMe(viewMain.onScrollAfter$.subscribeEvent(() => {
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            const range = skeleton == null ? undefined : this._resolveMaterializedPageRange(skeleton);
            if (range != null) {
                this._queueMaterializedPageRange(range);
            }
        }));
        if (typeof document !== 'undefined') {
            this.disposeWithMe(merge(
                fromEvent(document, 'keydown', { capture: true }),
                fromEvent(document, 'beforeinput', { capture: true })
            ).pipe(
                takeUntil(this.dispose$)
            ).subscribe(() => {
                const currentDocUnit = this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
                if (currentDocUnit?.getUnitId() === this._context.unitId) {
                    this._deferWorkerHandoff();
                    this._layoutCoordinator.deferBackgroundWork();
                }
            }));
        }

        scene.onMouseWheel$.subscribeEvent((event: IWheelEvent, state: EventState) => {
            const currentDocUnit = this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
            if (currentDocUnit?.getUnitId() !== this._context.unitId) {
                return;
            }

            this._deferWorkerHandoff();
            this._layoutCoordinator.deferBackgroundWork();
            if (event.ctrlKey) {
                const deltaFactor = Math.abs(event.deltaX);
                let scrollNum = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                scrollNum *= event.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    scrollNum /= 2;
                }

                if (scene.scaleX + scrollNum > 4) {
                    scene.scale(4, 4);
                } else if (scene.scaleX + scrollNum < 0.1) {
                    scene.scale(0.1, 0.1);
                } else {
                    // const value = e.deltaY > 0 ? 0.1 : -0.1;
                    // scene.scaleBy(scrollNum, scrollNum);
                    event.preventDefault();
                }
            } else {
                viewMain.onMouseWheel(event, state);
            }
        });
    }

    private _shouldEnableHorizontalScrollBar(): boolean {
        const options = this._docViewScaleService.getOptions();
        return !(options.mode === 'fit-width' && options.target === 'container' && options.align === 'start');
    }

    private _addComponent() {
        const { scene, unit: documentModel, components } = this._context;
        const DEFAULT_PAGE_MARGIN_LEFT = 20;
        const DEFAULT_PAGE_MARGIN_TOP = 20;
        const config = {
            pageMarginLeft: DEFAULT_PAGE_MARGIN_LEFT,
            pageMarginTop: DEFAULT_PAGE_MARGIN_TOP,
            ...this._getEditorBackgroundConfig(),
        };

        const documents = new Documents(DOCS_VIEW_KEY.MAIN, undefined, config);
        documents.zIndex = DOCS_COMPONENT_DEFAULT_Z_INDEX;
        const docBackground = new DocBackground(DOCS_VIEW_KEY.BACKGROUND, undefined, config);
        docBackground.zIndex = DOCS_COMPONENT_DEFAULT_Z_INDEX;

        this._context.mainComponent = documents;
        components.set(DOCS_VIEW_KEY.MAIN, documents);
        components.set(DOCS_VIEW_KEY.BACKGROUND, docBackground);

        scene.addObjects([documents], DOCS_COMPONENT_MAIN_LAYER_INDEX);
        scene.addObjects([docBackground], DOCS_COMPONENT_BACKGROUND_LAYER_INDEX);

        if (!this._isEditorRenderUnit(documentModel.getUnitId())) {
            scene.enableLayerCache(DOCS_COMPONENT_MAIN_LAYER_INDEX);
        }
    }

    private _initRenderRefresh() {
        this._docSkeletonManagerService.currentSkeletonBefore$.pipe(takeUntil(this.dispose$)).subscribe((param) => {
            this._create(param);
        });
    }

    private _create(skeleton: Nullable<DocumentSkeleton>) {
        if (!skeleton) {
            return;
        }

        const { mainComponent, components } = this._context;

        const docsComponent = mainComponent as Documents;
        const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;

        docsComponent.changeSkeleton(skeleton);
        docBackground.changeSkeleton(skeleton);
        this._syncCanvasBackground();

        const { unitId } = this._context;

        if (skeleton.getSkeletonData() == null) {
            this._scheduleLayout(unitId, skeleton, { reason: 'initial' });
            return;
        }

        // REFACTOR: @Jocs, should not use scroll bar to indicate a Zen Editor. refactor after support modern doc.
        const editorRenderConfig = this._editorService.getEditorRenderConfig(unitId);
        if (editorRenderConfig && !editorRenderConfig.scrollBar) {
            this._context.mainComponent?.makeDirty();

            return;
        }

        this._recalculateSizeBySkeleton(skeleton);
        this._refreshPagePositionAndSelection();
    }

    private _initCommandListener() {
        const updateCommandList = [RichTextEditingMutation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo, executionOptions?: IExecutionOptions) => {
            if (!updateCommandList.includes(command.id)) {
                return;
            }

            const params = command.params;
            if (!isRichTextEditingMutationParams(params)) {
                return;
            }
            const { unitId, textRanges } = params;
            if (unitId !== this._context.unitId) {
                return;
            }

            if (executionOptions?.fromChangeset) {
                this._scheduleChangesetRender();
                return;
            }

            if (!doesDocMutationRequireLayout(params.actions, this._context.unit.getSnapshot().drawings)) {
                return;
            }
            const bodyRanges = textRanges?.filter((range) => !range.segmentId) ?? [];
            const invalidation = getBodyMutationInvalidation(params.actions, params.segmentId);
            const anchor = invalidation?.oldStart ?? (bodyRanges.length > 0
                ? Math.min(...bodyRanges.map((range) => range.startOffset))
                : undefined);
            const activeRange = this._getActiveEditingRange(unitId);
            const isRemoteMutation = params.isSync === true || executionOptions?.fromCollab === true;
            // Local mutations carry the post-edit selection. Prefer it over the
            // selection manager to keep the requested edit anchor explicit.
            // A collaboration payload can still carry the
            // remote author's ranges, so execution options—not range presence—decide
            // whether the transformed local caret remains authoritative.
            const mutationActiveRange = isRemoteMutation
                ? undefined
                : bodyRanges.find((range) => range.isActive) ??
                    (bodyRanges.length === 1 ? bodyRanges[0] : undefined);
            const priorityAnchor = mutationActiveRange?.endOffset ?? activeRange?.endOffset;
            // RichTextEditingMutation preserves the original Main input
            // contract by refreshing its local post-edit range in a microtask,
            // once the synchronous layout prefix has finished. Do not publish
            // intermediate selection geometry during that prefix.
            // Remote/direct mutations do not schedule this local range update
            // and therefore still need the render controller refresh.
            const hasPendingLocalSelectionUpdate = doesMutationScheduleLocalSelectionUpdate(
                params,
                isRemoteMutation
            );

            if (invalidation != null && isLayoutMetadataOnlyMutation(params.actions, params.segmentId)) {
                const manager = this._renderManagerService.getRenderUnitById(unitId)?.with(DocSkeletonManagerService);
                const skeleton = manager?.getSkeleton();
                const pages = skeleton?.getSkeletonData()?.pages;
                const affectedOffsets = [invalidation.oldStart, Math.max(invalidation.oldStart, invalidation.oldEnd - 1)];
                const affectedPagesAreMaterialized = skeleton != null && pages != null && affectedOffsets.every((offset) => {
                    const pageIndex = skeleton.findNodePositionByCharIndex(offset)?.page ?? -1;
                    const page = pages[pageIndex];
                    return page != null && !page.isLayoutPlaceholder && !page.isMaterializationPlaceholder;
                });
                if (
                    manager?.supportsIncrementalLayout() &&
                    this._context.unit.documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL &&
                    !this._context.unit.getSnapshot().disabled &&
                    skeleton?.hasCompleteLayout() &&
                    skeleton.getLayoutProgress() == null &&
                    pages != null && pages.length > 0 &&
                    pages.every((page) => !page.isLayoutPlaceholder) &&
                    affectedPagesAreMaterialized
                ) {
                    // Initial pagination may have completed entirely on Main, before
                    // a Worker mount exists. Reuse that complete baseline for range
                    // metadata instead of computing the first Worker layout from zero.
                    // The Worker needs no handoff because the mutation preserves
                    // character offsets and layout geometry.
                    this._scheduleLayout(unitId, skeleton, {
                        reason: 'edit',
                        anchor,
                        priorityAnchor,
                        invalidation,
                        reuseMainBaseline: true,
                        allowMetadataOnlyStructuralTailReuse: true,
                    }, !hasPendingLocalSelectionUpdate, isRemoteMutation);
                    return;
                }
            }

            this.reRender(
                unitId,
                anchor,
                invalidation,
                priorityAnchor,
                !hasPendingLocalSelectionUpdate,
                isRemoteMutation,
                Array.isArray(params.actions) && params.actions.length > 0 && bodyRanges.length === 0 && invalidation == null
            );
        }));
    }

    private _scheduleChangesetRender(): void {
        if (this._changesetRenderScheduled) {
            return;
        }

        this._changesetRenderScheduled = true;
        queueMicrotask(() => {
            this._changesetRenderScheduled = false;
            if (this._disposed) {
                return;
            }

            this.reRender(this._context.unitId);
        });
    }

    private _initThemeListener() {
        this.disposeWithMe(combineLatest([this._themeService.currentTheme$, this._themeService.darkMode$]).pipe(takeUntil(this.dispose$)).subscribe(() => {
            this._syncCanvasBackground();
            this._markDocumentRenderDirty();
        }));
    }

    private _markDocumentRenderDirty(): void {
        this._context.mainComponent?.makeDirty(true);
        this._context.components.get(DOCS_VIEW_KEY.BACKGROUND)?.makeDirty(true);
    }

    private _refreshPagePositionAndSelection(isEditing = false) {
        this._refreshPagePosition();
        if (this._isEditorRenderUnit()) {
            return;
        }

        const unitId = this._context.unitId;
        const activeRange = this._getActiveEditingRange(unitId);
        this._textSelectionManagerService.refreshSelection(
            { unitId, subUnitId: unitId },
            isEditing && activeRange != null
        );
    }

    private _getFocusedSelectionInfo(unitId: string) {
        if (this._univerInstanceService.getFocusedUnit()?.getUnitId() !== unitId) {
            return;
        }

        return this._textSelectionManagerService.getSelectionInfo({
            unitId,
            subUnitId: unitId,
        });
    }

    private _getActiveEditingRange(unitId: string) {
        const selectionInfo = this._getFocusedSelectionInfo(unitId);
        if (selectionInfo?.isEditing !== true) {
            return;
        }

        return selectionInfo.textRanges.find((range) => range.isActive);
    }

    private _getActiveRange(unitId: string) {
        const selectionInfo = this._getFocusedSelectionInfo(unitId);
        return selectionInfo?.textRanges.find((range) => range.isActive);
    }

    private _captureCompletionViewportAnchor(
        unitId: string,
        skeleton: DocumentSkeleton,
        shouldCapture: boolean,
        preserveInactiveViewportAnchor: boolean
    ): IDocLayoutViewportAnchor | null {
        if (!shouldCapture || this._recoveryViewportAnchor != null) {
            return null;
        }

        const selectionInfo = this._getFocusedSelectionInfo(unitId);
        if (selectionInfo?.isEditing !== true && !preserveInactiveViewportAnchor) {
            return null;
        }

        const activeRange = selectionInfo?.textRanges.find((range) => range.isActive);
        if (activeRange == null || activeRange.segmentId) {
            return null;
        }

        return this._captureViewportAnchor(skeleton, activeRange.endOffset, undefined);
    }

    private _refreshPagePosition() {
        if (this._isEditorRenderUnit()) {
            return;
        }

        this._docPageLayoutService.calculatePagePosition();
    }

    private _recalculateSizeBySkeleton(skeleton: DocumentSkeleton, progress?: IDocumentLayoutProgress | null) {
        const { mainComponent, scene, unitId, components } = this._context;
        const docsComponent = mainComponent as Documents;
        const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;
        const pages = skeleton.getSkeletonData()?.pages;
        if (pages == null) {
            return;
        }

        const documentFlavor = this._context.unit.getSnapshot().documentStyle.documentFlavor;
        this._syncCanvasBackground(documentFlavor);
        const measured = this._measureDocumentExtent(pages, docsComponent, documentFlavor);
        const layoutProgress = progress ?? skeleton.getLayoutProgress?.() ?? null;
        const { width, height } = this._reserveDocumentExtent(
            measured,
            pages,
            docsComponent,
            documentFlavor,
            layoutProgress
        );

        docsComponent.resize(width, height);
        docBackground.resize(width, height);

        const editorRenderConfig = this._editorService.getEditorRenderConfig(unitId);
        if (
            (!editorRenderConfig || editorRenderConfig.scrollBar) &&
            (scene.width !== width || scene.height !== height)
        ) {
            scene.transformByState({ width, height });
        }
    }

    private _measureDocumentExtent(
        pages: IDocumentSkeletonPage[],
        docsComponent: Documents,
        documentFlavor: DocumentFlavor | undefined
    ): { width: number; height: number } {
        let width = 0;
        let height = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            let { pageWidth, pageHeight } = page;

            // Mainly for modern mode, because pageHeight will be INFINITY in modern mode.
            if (documentFlavor === DocumentFlavor.MODERN) {
                const modernPageSize = getPageSizeInModernMode(page);

                pageWidth = modernPageSize.pageWidth;
                pageHeight = modernPageSize.pageHeight;
            }

            if (docsComponent.pageLayoutType === PageLayoutType.VERTICAL) {
                height += pageHeight;

                height += docsComponent.pageMarginTop;

                if (i === len - 1) {
                    height += docsComponent.pageMarginTop;
                }

                width = Math.max(width, pageWidth);
            } else if (docsComponent.pageLayoutType === PageLayoutType.HORIZONTAL) {
                width += pageWidth;

                if (i !== len - 1) {
                    width += docsComponent.pageMarginLeft;
                }
                height = Math.max(height, pageHeight);
            }
        }
        return { width, height };
    }

    private _reserveDocumentExtent(
        measured: { width: number; height: number },
        pages: IDocumentSkeletonPage[],
        docsComponent: Documents,
        documentFlavor: DocumentFlavor | undefined,
        layoutProgress: IDocumentLayoutProgress | null
    ): { width: number; height: number } {
        let { width, height } = measured;
        if (layoutProgress != null && !layoutProgress.complete && pages.length > 0) {
            const firstPage = pages[0];
            if (documentFlavor === DocumentFlavor.MODERN) {
                this._reservedLayoutHeight = Math.max(
                    this._reservedLayoutHeight,
                    layoutProgress.estimatedHeight + docsComponent.pageMarginTop * 2
                );
            } else if (docsComponent.pageLayoutType === PageLayoutType.VERTICAL) {
                const estimatedHeight = layoutProgress.estimatedPageCount *
                    (firstPage.pageHeight + docsComponent.pageMarginTop) + docsComponent.pageMarginTop;
                this._reservedLayoutHeight = Math.max(this._reservedLayoutHeight, estimatedHeight);
            } else {
                const estimatedWidth = layoutProgress.estimatedPageCount *
                    (firstPage.pageWidth + docsComponent.pageMarginLeft);
                this._reservedLayoutWidth = Math.max(this._reservedLayoutWidth, estimatedWidth);
            }

            if (documentFlavor === DocumentFlavor.MODERN || docsComponent.pageLayoutType === PageLayoutType.VERTICAL) {
                height = Math.max(height, this._reservedLayoutHeight);
            } else {
                width = Math.max(width, this._reservedLayoutWidth);
            }
        } else {
            this._reservedLayoutWidth = width;
            this._reservedLayoutHeight = height;
        }
        return { width, height };
    }

    private _syncCanvasBackground(documentFlavor = this._context.unit.getSnapshot().documentStyle.documentFlavor) {
        const editorRenderConfig = this._editorService.getEditorRenderConfig(this._context.unitId);
        const editorBackgroundColor = editorRenderConfig?.canvasStyle.backgroundColor;
        const resolvedBackground = resolveDocRenderBackground({
            documentFlavor,
            canvasColorService: this._context.engine.canvasColorService,
            editorBackgroundColor,
            isEditor: this._isEditorRenderUnit(),
        });
        this._context.engine.getCanvas().getCanvasEle().style.backgroundColor = resolvedBackground.canvasElementBackgroundColor;
        const docBackground = this._context.components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground | undefined;
        docBackground?.setFillColors?.(
            resolvedBackground.docBackgroundFillColor,
            resolvedBackground.docBackgroundFillColor,
            resolvedBackground.docBackgroundFillColor,
            resolvedBackground.docBackgroundFillColor
        );
    }

    private _getEditorBackgroundConfig() {
        if (!this._isEditorRenderUnit()) {
            return {};
        }

        const editorBackgroundColor = 'transparent';
        return {
            backgroundFillColor: editorBackgroundColor,
            pageFillColor: editorBackgroundColor,
            pageStrokeColor: editorBackgroundColor,
            marginStrokeColor: editorBackgroundColor,
        };
    }

    private _isEditorRenderUnit(unitId = this._context.unitId) {
        return this._editorService.isEditor(unitId) || isInternalEditorID(unitId);
    }
}

function getPageSizeInModernMode(page: IDocumentSkeletonPage) {
    let { pageWidth, pageHeight } = page;
    const { marginLeft, marginRight, marginTop, marginBottom, skeDrawings, skeTables } = page;

    if (pageWidth === Number.POSITIVE_INFINITY) {
        pageWidth = page.width + marginLeft + marginRight;
    }

    if (pageHeight === Number.POSITIVE_INFINITY) {
        pageHeight = page.height + marginTop + marginBottom;
    }

    // Keep the modern page horizontally anchored to its configured width.
    // Overflow drawings and tables may extend its height, but must not recenter the document.
    for (const drawing of skeDrawings.values()) {
        pageHeight = Math.max(pageHeight, drawing.aTop + drawing.height + marginTop + marginBottom);
    }

    for (const table of skeTables.values()) {
        pageHeight = Math.max(pageHeight, table.top + table.height + marginTop + marginBottom);
    }

    return { pageWidth, pageHeight };
}
