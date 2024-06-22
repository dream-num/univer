/**
 * Copyright 2023-present DreamNum Inc.
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

import type { DocumentDataModel } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { ISetTextSelectionsOperationParams } from '@univerjs/docs';
import { SetTextSelectionsOperation } from '@univerjs/docs';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { Inject } from '@wendellhu/redi';
import { DEFAULT_DOC_SUBUNIT_ID } from '../common/const';

@OnLifecycle(LifecycleStages.Rendered, DocThreadCommentSelectionController)
export class DocThreadCommentSelectionController extends Disposable {
    constructor(
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initSelectionChange();
    }

    private _initSelectionChange() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetTextSelectionsOperation.id) {
                    const params = commandInfo.params as ISetTextSelectionsOperationParams;
                    const { unitId, ranges } = params;
                    const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
                    const primary = ranges[0];
                    if (primary && doc) {
                        const { startOffset, endOffset, collapsed } = primary;
                        let customRange;

                        if (collapsed) { // cursor
                            customRange = doc.getBody()?.customRanges?.find((value) => value.startIndex <= startOffset - 2 && value.endIndex >= (endOffset + 1));
                        } else { // range
                            customRange = doc.getBody()?.customRanges?.find((value) => value.startIndex <= startOffset && value.endIndex >= (endOffset - 1));
                        }

                        if (customRange) {
                            this._threadCommentPanelService.setActiveComment({
                                unitId,
                                subUnitId: DEFAULT_DOC_SUBUNIT_ID,
                                commentId: customRange?.rangeId,
                            });
                            return;
                        }
                    }

                    this._threadCommentPanelService.setActiveComment(null);
                }
            })
        );
    }
}
