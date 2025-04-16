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

import { Disposable, Inject } from '@univerjs/core';
import { CommentSingle } from '@univerjs/icons';
import { THREAD_COMMENT_PANEL } from '@univerjs/thread-comment-ui';
import { ComponentManager, IMenuManagerService, IShortcutService } from '@univerjs/ui';
import { COMMENT_SINGLE_ICON, SHEETS_THREAD_COMMENT_MODAL } from '../types/const';
import { SheetsThreadCommentCell } from '../views/sheets-thread-comment-cell';
import { SheetsThreadCommentPanel } from '../views/sheets-thread-comment-panel';
import { AddCommentShortcut } from './menu';
import { menuSchema } from './menu.schema';

export class SheetsThreadCommentController extends Disposable {
    constructor(
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();
        this._initMenu();
        this._initShortcut();
        this._initComponent();
    }

    private _initShortcut() {
        this._shortcutService.registerShortcut(AddCommentShortcut);
    }

    private _initMenu() {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initComponent() {
        ([
            [SHEETS_THREAD_COMMENT_MODAL, SheetsThreadCommentCell],
            [THREAD_COMMENT_PANEL, SheetsThreadCommentPanel],
            [COMMENT_SINGLE_ICON, CommentSingle],
        ] as const).forEach(([key, comp]) => {
            this._componentManager.register(key, comp);
        });
    }
}
