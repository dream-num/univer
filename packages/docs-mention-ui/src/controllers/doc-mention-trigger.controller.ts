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

import type { IInsertCommandParams } from '@univerjs/docs-ui';
import { Disposable, ICommandService, Inject, Tools } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DeleteLeftCommand, InsertCommand, MoveCursorOperation } from '@univerjs/docs-ui';
import { CloseMentionEditPopupOperation, ShowMentionEditPopupOperation } from '../commands/operations/mention-popup.operation';
import { DocMentionPopupService } from '../services/doc-mention-popup.service';
import { DocMentionService } from '../services/doc-mention.service';

export class DocMentionTriggerController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocMentionService) private readonly _docMentionService: DocMentionService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
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
                    const activeRange = this._textSelectionManagerService.getActiveTextRange();
                    if (params.body.dataStream === '@' && activeRange && !Tools.isDefine(this._docMentionService.editing)) {
                        setTimeout(() => {
                            this._commandService.executeCommand(ShowMentionEditPopupOperation.id, {
                                startIndex: activeRange.startOffset - 1,
                                unitId: params.unitId,
                            });
                        }, 100);
                    }
                }

                if (commandInfo.id === MoveCursorOperation.id) {
                    this._commandService.executeCommand(CloseMentionEditPopupOperation.id);
                }

                if (commandInfo.id === DeleteLeftCommand.id) {
                    if (this._docMentionPopupService.editPopup == null) {
                        return;
                    }
                    const activeRange = this._textSelectionManagerService.getActiveTextRange();
                    if (activeRange && activeRange.endOffset <= this._docMentionPopupService.editPopup.anchor) {
                        this._commandService.executeCommand(CloseMentionEditPopupOperation.id);
                    }
                }
            })
        );
    }
}
