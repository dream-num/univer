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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';
import type { IInsertCommandParams } from '@univerjs/docs';
import { DeleteLeftCommand, InsertCommand, MoveCursorOperation, TextSelectionManagerService } from '@univerjs/docs';
import { DocMentionService } from '@univerjs/docs-mention';
import { Inject } from '@wendellhu/redi';
import { DocMentionPopupService } from '../services/doc-mention-popup.service';

@OnLifecycle(LifecycleStages.Rendered, DocMentionTriggerController)
export class DocMentionTriggerController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocMentionService) private readonly _docMentionService: DocMentionService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(DocMentionPopupService) private readonly _docMentionPopupService: DocMentionPopupService
    ) {
        super();

        this._initTrigger();
    }

    private _initTrigger() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === InsertCommand.id) {
                    const params = commandInfo.params as IInsertCommandParams;
                    const activeRange = this._textSelectionManagerService.getActiveRange();
                    if (params.body.dataStream === '@' && activeRange && !Tools.isDefine(this._docMentionService.editing)) {
                        this._docMentionService.startEditing(activeRange.startOffset - 1);
                    }
                }

                if (commandInfo.id === MoveCursorOperation.id) {
                    this._docMentionService.endEditing();
                }

                if (commandInfo.id === DeleteLeftCommand.id) {
                    if (this._docMentionPopupService.editPopup == null) {
                        return;
                    }
                    const activeRange = this._textSelectionManagerService.getActiveRange();
                    if (activeRange && activeRange.endOffset <= this._docMentionPopupService.editPopup.anchor) {
                        this._docMentionService.endEditing();
                    }
                }
            })
        );
    }
}
