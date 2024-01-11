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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { SearchSingle16 } from '@univerjs/icons';
import { ComponentManager, IMenuService, IShortcutService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import {
    CloseFRDialogOperation,
    OpenFindDialogOperation,
    OpenReplaceDialogOperation,
    ToggleFindReplaceDialogOperation,
} from '../commands/operations/find-replace.operation';
import { FindReplaceDialog } from '../views/dialog/Dialog';
import { FindReplaceMenuItemFactory } from './find-replace.menu';
import {
    CloseFRDialogShortcutItem,
    OpenFindDialogShortcutItem,
    OpenReplaceDialogShortcutItem,
} from './find-replace.shortcut';

@OnLifecycle(LifecycleStages.Rendered, FindReplaceController)
export class FindReplaceController extends Disposable {
    constructor(
        @IMenuService private readonly _menuService: IMenuService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initOperations();
        this._initUI();
        this._initShortcuts();
    }

    private _initOperations(): void {
        [
            OpenFindDialogOperation,
            OpenReplaceDialogOperation,
            CloseFRDialogOperation,
            ToggleFindReplaceDialogOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initUI(): void {
        [FindReplaceMenuItemFactory].forEach((f) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(f)));
        });

        this.disposeWithMe(this._componentManager.register('FindReplaceDialog', FindReplaceDialog));
        this.disposeWithMe(this._componentManager.register('SearchIcon', SearchSingle16));
    }

    private _initShortcuts(): void {
        [OpenReplaceDialogShortcutItem, OpenFindDialogShortcutItem, CloseFRDialogShortcutItem].forEach((s) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(s));
        });
    }
}
