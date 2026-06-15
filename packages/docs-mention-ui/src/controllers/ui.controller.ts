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

import { Disposable, ICommandService } from '@univerjs/core';
import { AddDocMentionCommand, DeleteDocMentionCommand } from '../commands/commands/doc-mention.command';
import {
    CloseMentionEditPopupOperation,
    CloseMentionInfoPopupOperation,
    ShowMentionEditPopupOperation,
    ShowMentionInfoPopupOperation,
} from '../commands/operations/mention-popup.operation';

export class DocMentionUIController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initCommands();
    }

    private _initCommands() {
        [
            ShowMentionInfoPopupOperation,
            CloseMentionInfoPopupOperation,
            ShowMentionEditPopupOperation,
            CloseMentionEditPopupOperation,
            AddDocMentionCommand,
            DeleteDocMentionCommand,
        ].forEach((operation) => {
            this.disposeWithMe(this._commandService.registerCommand(operation));
        });
    }
}
