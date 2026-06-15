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
import { FLOAT_TOOLBAR_MENU_POSITION } from '@univerjs/docs-ui';
import { IMenuManagerService } from '@univerjs/ui';
import { AddDocCommentComment } from '../commands/commands/add-doc-comment.command';
import { DeleteDocCommentComment } from '../commands/commands/delete-doc-comment.command';
import {
    ShowCommentPanelOperation,
    StartAddCommentOperation,
    ToggleCommentPanelOperation,
} from '../commands/operations/show-comment-panel.operation';
import { menuSchema } from '../menu/schema';

export class DocThreadCommentUIController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService
    ) {
        super();
        this._initCommands();
        this._initMenus();
    }

    private _initCommands() {
        [
            AddDocCommentComment,
            DeleteDocCommentComment,
            ShowCommentPanelOperation,
            StartAddCommentOperation,
            ToggleCommentPanelOperation,
        ].forEach((command) => {
            this.disposeWithMe(this._commandService.registerCommand(command));
        });
    }

    private _initMenus() {
        this._menuManagerService.appendRootMenu({ [FLOAT_TOOLBAR_MENU_POSITION]: {} });
        this._menuManagerService.mergeMenu(menuSchema);
    }
}
