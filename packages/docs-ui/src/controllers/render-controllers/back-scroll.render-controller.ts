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

export class DocBackScrollRenderController extends RxDisposable implements EngineRender.IRenderModule {
    private _pendingSelectionScrollFrame: number | null = null;

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
        this._textSelectionManagerService.textSelection$.pipe(takeUntil(this.dispose$)).subscribe((params) => {
            if (params == null) {
                return;
            }

            const { isEditing, unitId } = params;

            if (unitId !== this._context.unitId || !isEditing) {
                return;
            }

            if (this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                return;
            }

            this._scheduleScrollToSelection();
        });
    }

    override dispose(): void {
        if (this._pendingSelectionScrollFrame != null && typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(this._pendingSelectionScrollFrame);
        }
        this._pendingSelectionScrollFrame = null;
        super.dispose();
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

    scrollToRange(range: ITextRangeParam) {
        const skeleton = this._docSkeletonManagerService.getSkeleton();
        if (!skeleton) {
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
            const pageIndex = skeleton.findBodyPageIndexByCharIndex(startOffset);
            const page = skeleton.getSkeletonData()?.pages[pageIndex];
            if (page?.isMaterializationPlaceholder) {
                this._scrollToPage(pageIndex);
                this._scheduleScrollToMaterializedRange(range);
            }
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
    }

    private _scheduleScrollToMaterializedRange(range: ITextRangeParam, attempt = 0): void {
        if (typeof requestAnimationFrame === 'undefined' || attempt >= 120) {
            return;
        }
        if (this._pendingSelectionScrollFrame != null) {
            cancelAnimationFrame(this._pendingSelectionScrollFrame);
        }
        this._pendingSelectionScrollFrame = requestAnimationFrame(() => {
            this._pendingSelectionScrollFrame = null;
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            const pageIndex = skeleton.findBodyPageIndexByCharIndex(range.startOffset);
            if (skeleton.getSkeletonData()?.pages[pageIndex]?.isMaterializationPlaceholder) {
                this._scheduleScrollToMaterializedRange(range, attempt + 1);
                return;
            }
            this.scrollToRange(range);
        });
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
