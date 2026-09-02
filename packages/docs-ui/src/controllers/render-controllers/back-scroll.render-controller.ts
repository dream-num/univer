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

import type { DocumentDataModel, ITextRangeParam, Nullable } from '@univerjs/core';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, Inject, RxDisposable } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import * as EngineRender from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { NodePositionConvertToCursor } from '../../services/selection/convert-text-range';
import { getAnchorBounding } from '../../services/selection/text-range';

const ANCHOR_WIDTH = 1.5;
// Large imported documents can take tens of seconds to publish an offset's
// aggregate page. The request remains cancellable by real user ownership.
const MAX_SELECTION_SCROLL_RETRY_FRAMES = 6000;

export class DocBackScrollRenderController extends RxDisposable implements EngineRender.IRenderModule {
    private _pendingSelectionScrollFrame: number | null = null;
    private _suppressedSelection: Nullable<ITextRangeParam> = null;
    private _pendingExplicitRange: Nullable<ITextRangeParam> = null;
    private _selectionBeforeExplicitRange: Nullable<ITextRangeParam> = null;
    private _scrollingToRange = false;

    constructor(
        private readonly _context: EngineRender.IRenderContext<DocumentDataModel>,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService
    ) {
        super();

        this._init();
    }

    private _init() {
        const viewport = this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewport != null) {
            let scrollX = viewport.viewportScrollX;
            let scrollY = viewport.viewportScrollY;
            this.disposeWithMe(viewport.onScrollAfter$.subscribeEvent((event) => {
                const changed = event.viewportScrollX !== scrollX || event.viewportScrollY !== scrollY;
                scrollX = event.viewportScrollX;
                scrollY = event.viewportScrollY;
                if (changed && !this._scrollingToRange) {
                    this._suspendSelectionScroll();
                }
            }));
        }
        this.disposeWithMe(this._context.scene.onPointerDown$.subscribeEvent(() => this._suspendSelectionScroll()));
        this._textSelectionManagerService.textSelection$.pipe(takeUntil(this.dispose$)).subscribe((params) => {
            if (params == null) {
                return;
            }

            const { isEditing, unitId } = params;
            const range = params.textRanges.find((item) => item.isActive);

            if (unitId !== this._context.unitId) {
                return;
            }

            if (!isEditing) {
                if (this._ownsPendingExplicitRange(range)) {
                    return;
                }
                this._suspendSelectionScroll();
                return;
            }

            if (this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                return;
            }

            if (this._ownsPendingExplicitRange(range)) {
                return;
            }
            this._clearExplicitRangeOwnership();
            const suppressed = this._suppressedSelection;
            if (range != null && suppressed != null &&
                range.startOffset === suppressed.startOffset && range.endOffset === suppressed.endOffset &&
                (range.segmentId ?? '') === (suppressed.segmentId ?? '') &&
                (range.segmentPage ?? -1) === (suppressed.segmentPage ?? -1)) {
                return;
            }
            this._suppressedSelection = null;
            this._scheduleScrollToSelection();
        });
    }

    override dispose(): void {
        this._cancelPendingSelectionScroll();
        this._suppressedSelection = null;
        this._clearExplicitRangeOwnership();
        super.dispose();
    }

    private _suspendSelectionScroll(): void {
        this._cancelPendingSelectionScroll();
        this._clearExplicitRangeOwnership();
        const range = this._textSelectionManagerService.getActiveTextRange();
        // A later layout publication can refresh the same logical caret. It must
        // not reclaim a viewport the user has since scrolled or selected in.
        this._suppressedSelection = range == null
            ? null
            : {
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                collapsed: range.collapsed,
                segmentId: range.segmentId,
                segmentPage: range.segmentPage,
            };
    }

    private _cancelPendingSelectionScroll(): void {
        if (this._pendingSelectionScrollFrame != null && typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(this._pendingSelectionScrollFrame);
        }
        this._pendingSelectionScrollFrame = null;
    }

    private _scheduleScrollToSelection(): void {
        if (typeof requestAnimationFrame === 'undefined') {
            this._scrollToSelection();
            return;
        }

        if (this._pendingSelectionScrollFrame != null) {
            cancelAnimationFrame(this._pendingSelectionScrollFrame);
        }
        this._pendingSelectionScrollFrame = requestAnimationFrame(() => {
            this._pendingSelectionScrollFrame = null;
            this._scrollToSelection();
        });
    }

    scrollToRange(range: ITextRangeParam, onResolved?: () => void): void {
        this._cancelPendingSelectionScroll();
        if (this._pendingExplicitRange == null) {
            this._selectionBeforeExplicitRange = this._textSelectionManagerService.getActiveTextRange();
        }
        this._pendingExplicitRange = range;
        this._scrollingToRange = true;
        try {
            this._scrollToRange(range, onResolved);
        } finally {
            this._scrollingToRange = false;
            if (this._pendingSelectionScrollFrame == null) {
                this._clearExplicitRangeOwnership();
            }
        }
    }

    private _isSameRange(left: Nullable<ITextRangeParam>, right: Nullable<ITextRangeParam>): boolean {
        return left != null && right != null &&
            left.startOffset === right.startOffset && left.endOffset === right.endOffset &&
            (left.segmentId ?? '') === (right.segmentId ?? '') &&
            (left.segmentPage ?? -1) === (right.segmentPage ?? -1);
    }

    private _ownsPendingExplicitRange(range: Nullable<ITextRangeParam>): boolean {
        return this._pendingExplicitRange != null &&
            (range == null || this._isSameRange(range, this._pendingExplicitRange) || this._isSameRange(range, this._selectionBeforeExplicitRange));
    }

    private _clearExplicitRangeOwnership(): void {
        this._pendingExplicitRange = null;
        this._selectionBeforeExplicitRange = null;
    }

    private _scrollToRange(range: ITextRangeParam, onResolved?: () => void): void {
        const skeleton = this._docSkeletonManagerService.getSkeleton();
        if (!skeleton) {
            return;
        }
        if (!this.isViewportReady()) {
            this._scheduleScrollToReadyRange(range, 0, onResolved);
            return;
        }
        const { startOffset, segmentId, segmentPage } = range;
        const anchorNodePosition = skeleton.findNodePositionByCharIndex(
            startOffset,
            true,
            segmentId ?? '',
            segmentPage ?? -1
        );
        if (anchorNodePosition == null) {
            this._deferUnresolvedRange(skeleton, range, onResolved);
            return;
        }

        const pages = skeleton.getSkeletonData()?.pages;
        const rootPageIndex = anchorNodePosition.pageType === EngineRender.DocumentSkeletonPageType.HEADER ||
            anchorNodePosition.pageType === EngineRender.DocumentSkeletonPageType.FOOTER ||
            (anchorNodePosition.pageType === EngineRender.DocumentSkeletonPageType.CELL && pages?.[anchorNodePosition.page] == null)
            ? anchorNodePosition.segmentPage
            : anchorNodePosition.page;
        const rootPage = pages?.[rootPageIndex];
        if (rootPage == null || rootPage.isLayoutPlaceholder) {
            return;
        }

        this.scrollToNode(anchorNodePosition);
        onResolved?.();
    }

    private _deferUnresolvedRange(
        skeleton: ReturnType<DocSkeletonManagerService['getSkeleton']>,
        range: ITextRangeParam,
        onResolved?: () => void
    ): void {
        const pageIndex = skeleton.findBodyPageIndexByCharIndex(range.startOffset);
        const page = skeleton.getSkeletonData()?.pages[pageIndex];
        if (page?.isMaterializationPlaceholder) {
            this._scrollToPage(pageIndex);
            this._scheduleScrollToReadyRange(range, 0, onResolved);
        } else if (pageIndex < 0 && this._isValidBodyOffset(skeleton, range.startOffset)) {
            this._scheduleScrollToReadyRange(range, 0, onResolved);
        }
    }

    private _scheduleScrollToReadyRange(range: ITextRangeParam, attempt = 0, onResolved?: () => void): void {
        if (typeof requestAnimationFrame === 'undefined' || attempt >= MAX_SELECTION_SCROLL_RETRY_FRAMES) {
            return;
        }
        if (this._pendingSelectionScrollFrame != null) {
            cancelAnimationFrame(this._pendingSelectionScrollFrame);
        }
        this._pendingSelectionScrollFrame = requestAnimationFrame(() => {
            this._pendingSelectionScrollFrame = null;
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            const pageIndex = skeleton.findBodyPageIndexByCharIndex(range.startOffset);
            if (!this.isViewportReady() || (pageIndex < 0 && this._isValidBodyOffset(skeleton, range.startOffset))) {
                this._scheduleScrollToReadyRange(range, attempt + 1, onResolved);
                return;
            }
            this.scrollToRange(range, onResolved);
        });
    }

    private _isValidBodyOffset(skeleton: ReturnType<DocSkeletonManagerService['getSkeleton']>, offset: number): boolean {
        const length = skeleton.getViewModel().getDataModel().getBody()?.dataStream.length ?? 0;
        return offset >= 0 && offset < length;
    }

    isViewportReady(): boolean {
        const { mainComponent, scene } = this._context;
        if (!(mainComponent instanceof EngineRender.Documents)) {
            return true;
        }
        const { docsLeft, docsTop } = mainComponent.getOffsetConfig();
        if (docsLeft <= -10000 || docsTop <= -10000) {
            return false;
        }
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewport == null) {
            return true;
        }
        const viewBound = viewport.calcViewportInfo().viewBound;
        return viewBound.right - viewBound.left > 1 && viewBound.bottom - viewBound.top > 1;
    }

    private _scrollToPage(pageIndex: number): void {
        const { mainComponent, scene } = this._context;
        const skeleton = this._docSkeletonManagerService.getSkeleton();
        const pages = skeleton.getSkeletonData()?.pages;
        if (!(mainComponent instanceof EngineRender.Documents) || pages == null || pages[pageIndex] == null) {
            return;
        }
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewportMain == null) {
            return;
        }
        const {
            docsLeft,
            docsTop,
            pageLayoutType = EngineRender.PageLayoutType.VERTICAL,
            pageMarginLeft,
            pageMarginTop,
        } = mainComponent.getOffsetConfig();
        let pageLeft = docsLeft;
        let pageTop = docsTop;
        for (let index = 0; index < pageIndex; index++) {
            if (pageLayoutType === EngineRender.PageLayoutType.HORIZONTAL) {
                pageLeft += pages[index].pageWidth + pageMarginLeft;
            } else {
                pageTop += pages[index].pageHeight + pageMarginTop;
            }
        }
        const viewBound = viewportMain.calcViewportInfo().viewBound;
        const offsetX = pageLayoutType === EngineRender.PageLayoutType.HORIZONTAL
            ? pageLeft - viewBound.left
            : 0;
        const offsetY = pageLayoutType === EngineRender.PageLayoutType.HORIZONTAL
            ? 0
            : pageTop - viewBound.top;
        viewportMain.scrollByBarDeltaValue(
            viewportMain.transViewportScroll2ScrollValue(offsetX, offsetY)
        );
    }

    scrollToNode(startNodePosition: Nullable<EngineRender.INodePosition>) {
        const { unitId, scene, mainComponent } = this._context;
        const skeleton = this._docSkeletonManagerService.getSkeleton();

        if (!(mainComponent instanceof EngineRender.Documents) || skeleton == null) {
            return;
        }

        const documentOffsetConfig = mainComponent.getOffsetConfig();
        const { docsLeft, docsTop } = documentOffsetConfig;

        const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);

        const { contentBoxPointGroup } = convertor.getRangePointData(startNodePosition, startNodePosition);
        if (contentBoxPointGroup.length === 0) {
            return;
        }

        const { left: aLeft, top: aTop, height } = getAnchorBounding(contentBoxPointGroup);

        const left = aLeft + docsLeft;

        const top = aTop + docsTop;

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        if (viewportMain == null) {
            return;
        }

        const {
            left: boundLeft,
            top: boundTop,
            right: boundRight,
            bottom: boundBottom,
        } = viewportMain.calcViewportInfo().viewBound;

        let offsetY = 0;
        let offsetX = 0;

        const editorRenderConfig = this._editorService.getEditorRenderConfig(unitId);
        const delta = editorRenderConfig ? editorRenderConfig.backScrollOffset ?? 0 : 100;

        if (top < boundTop) {
            offsetY = top - boundTop - delta;
        } else if (top > boundBottom - height) {
            offsetY = top - boundBottom + height + delta;
        }

        if (left < boundLeft) {
            offsetX = left - boundLeft;
        } else if (left > boundRight - ANCHOR_WIDTH) {
            offsetX = left - boundRight + ANCHOR_WIDTH;
        }

        const config = viewportMain.transViewportScroll2ScrollValue(offsetX, offsetY);
        viewportMain.scrollByBarDeltaValue(config);
    }

    // Let the selection show on the current screen.
    private _scrollToSelection() {
        const activeTextRange = this._textSelectionManagerService.getActiveTextRange();
        if (activeTextRange == null) {
            return;
        }

        const { collapsed } = activeTextRange;

        if (!collapsed) {
            return;
        }

        // Incremental publication replaces page and line objects. Resolve the
        // current position from stable document offsets instead of reusing a
        // cached node path from an older skeleton generation.
        this.scrollToRange(activeTextRange);
    }
}
