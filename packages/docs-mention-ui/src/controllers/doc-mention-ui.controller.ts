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

import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { ComponentManager } from '@univerjs/ui';
import { AddDocMentionCommand, DeleteDocMentionCommand } from '../commands/commands/doc-mention.command';
import { CloseMentionEditPopupOperation, CloseMentionInfoPopupOperation, ShowMentionEditPopupOperation, ShowMentionInfoPopupOperation } from '../commands/operations/mention-popup.operation';
import { MentionEditPopup } from '../views/mention-edit-popup';

export class DocMentionUIController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initCommands();
        this._initComponents();
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

    private _initComponents() {
        const components = [[MentionEditPopup.componentKey, MentionEditPopup]] as const;

        components.forEach(([key, comp]) => {
            this.disposeWithMe(this._componentManager.register(key, comp));
        });
    }
}
