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

import type { DocumentDataModel, ITextRange, Nullable } from '@univerjs/core';
import type { Documents, INodePosition, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, Inject, RxDisposable } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { takeUntil } from 'rxjs';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { NodePositionConvertToCursor } from '../../services/selection/convert-text-range';
import { getAnchorBounding } from '../../services/selection/text-range';

const ANCHOR_WIDTH = 1.5;

export class DocBackScrollRenderController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
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

            this._scrollToSelection();
        });
    }

    scrollToRange(range: ITextRange) {
        const skeleton = this._docSkeletonManagerService.getSkeleton();
        if (!skeleton) {
            return;
        }
        const { startOffset } = range;
        const anchorNodePosition = skeleton.findNodePositionByCharIndex(startOffset);

        anchorNodePosition && this.scrollToNode(anchorNodePosition);
    }

    scrollToNode(startNodePosition: Nullable<INodePosition>) {
        const { unitId, scene, mainComponent } = this._context;
        const skeleton = this._docSkeletonManagerService.getSkeleton();

        if (mainComponent == null || skeleton == null) {
            return;
        }

        const documentOffsetConfig = (mainComponent as Documents).getOffsetConfig();
        const { docsLeft, docsTop } = documentOffsetConfig;

        const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);

        const { contentBoxPointGroup } = convertor.getRangePointData(startNodePosition, startNodePosition);

        const { left: aLeft, top: aTop, height } = getAnchorBounding(contentBoxPointGroup);

        const left = aLeft + docsLeft;

        const top = aTop + docsTop;

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        const editor = this._editorService.getEditor(unitId);

        if (viewportMain == null) {
            return;
        }

        const {
            left: boundLeft,
            top: boundTop,
            right: boundRight,
            bottom: boundBottom,
        } = viewportMain.getBounding().viewBound;

        let offsetY = 0;
        let offsetX = 0;

        const delta = editor ? editor.params.backScrollOffset ?? 0 : 100;

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

        const { collapsed, startNodePosition } = activeTextRange;

        if (!collapsed) {
            return;
        }

        this.scrollToNode(startNodePosition);
    }
}
