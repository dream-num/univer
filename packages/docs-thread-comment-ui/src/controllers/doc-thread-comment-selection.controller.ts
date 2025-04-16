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

import type { DocumentDataModel, ITextRange } from '@univerjs/core';
import type { ISetTextSelectionsOperationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { Disposable, ICommandService, Inject, isInternalEditorID, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SetTextSelectionsOperation } from '@univerjs/docs';
import { DocBackScrollRenderController } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { SetActiveCommentOperation, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ShowCommentPanelOperation } from '../commands/operations/show-comment-panel.operation';
import { DEFAULT_DOC_SUBUNIT_ID } from '../common/const';
import { DocThreadCommentService } from '../services/doc-thread-comment.service';

export class DocThreadCommentSelectionController extends Disposable {
    constructor(
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocThreadCommentService) private readonly _docThreadCommentService: DocThreadCommentService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel
    ) {
        super();

        this._initSelectionChange();
        this._initActiveCommandChange();
    }

    private _initSelectionChange() {
        let lastSelection: ITextRange | undefined;
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetTextSelectionsOperation.id) {
                    const params = commandInfo.params as ISetTextSelectionsOperationParams;
                    const { unitId, ranges } = params;
                    if (isInternalEditorID(unitId)) return;
                    const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
                    const primary = ranges[0] as ITextRangeWithStyle | undefined;
                    if (lastSelection?.startOffset === primary?.startOffset && lastSelection?.endOffset === primary?.endOffset) {
                        return;
                    }
                    lastSelection = primary;
                    if (primary && doc) {
                        const { startOffset, endOffset, collapsed } = primary;
                        let customRange;

                        if (collapsed) { // cursor
                            customRange = doc.getBody()?.customDecorations?.find((value) => value.startIndex <= startOffset && value.endIndex >= (endOffset - 1));
                        } else { // range
                            customRange = doc.getBody()?.customDecorations?.find((value) => value.startIndex <= startOffset && value.endIndex >= (endOffset - 1));
                        }

                        if (customRange) {
                            const comment = this._threadCommentModel.getComment(unitId, DEFAULT_DOC_SUBUNIT_ID, customRange.id);
                            if (comment && !comment.resolved) {
                                this._commandService.executeCommand(ShowCommentPanelOperation.id, {
                                    activeComment: {
                                        unitId,
                                        subUnitId: DEFAULT_DOC_SUBUNIT_ID,
                                        commentId: customRange.id,
                                    },
                                });
                            }
                            return;
                        }
                    }

                    if (!this._threadCommentPanelService.activeCommentId) {
                        return;
                    }

                    this._commandService.executeCommand(SetActiveCommentOperation.id);
                }
            })
        );
    }

    private _initActiveCommandChange() {
        this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.subscribe((activeComment) => {
            if (activeComment) {
                const doc = this._univerInstanceService.getUnit<DocumentDataModel>(activeComment.unitId);
                if (doc) {
                    const backScrollController = this._renderManagerService.getRenderById(activeComment.unitId)?.with(DocBackScrollRenderController);
                    const customRange = doc.getBody()?.customDecorations?.find((range) => range.id === activeComment.commentId);
                    if (customRange && backScrollController) {
                        backScrollController.scrollToRange({
                            startOffset: customRange.startIndex,
                            endOffset: customRange.endIndex,
                            collapsed: false,
                        });
                    }
                }
            }

            if (!activeComment || activeComment.commentId !== this._docThreadCommentService.addingComment?.id) {
                this._docThreadCommentService.endAdd();
            }
        }));
    }
}
