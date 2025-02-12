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

import type { MenuConfig } from '@univerjs/ui';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { LinkSingle } from '@univerjs/icons';
import { ComponentManager, IMenuManagerService, IShortcutService } from '@univerjs/ui';
import { AddDocHyperLinkCommand } from '../commands/commands/add-link.command';
import { DeleteDocHyperLinkCommand } from '../commands/commands/delete-link.command';
import { UpdateDocHyperLinkCommand } from '../commands/commands/update-link.command';
import { ClickDocHyperLinkOperation, ShowDocHyperLinkEditPopupOperation, ToggleDocHyperLinkInfoPopupOperation } from '../commands/operations/popup.operation';
import { DocHyperLinkEdit } from '../views/hyper-link-edit';
import { DocLinkPopup } from '../views/hyper-link-popup';
import { addLinkShortcut, DOC_LINK_ICON } from './menu';
import { menuSchema } from './menu.schema';

export interface IDocHyperLinkUIConfig {
    menu: MenuConfig;
}

export class DocHyperLinkUIController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        this._initComponents();
        this._initCommands();
        this._initMenus();
        this._initShortcut();
    }

    private _initComponents() {
        ([
            [DocHyperLinkEdit, DocHyperLinkEdit.componentKey],
            [DocLinkPopup, DocLinkPopup.componentKey],
            [LinkSingle, DOC_LINK_ICON],
        ] as const).forEach(([comp, key]) => {
            this._componentManager.register(key, comp);
        });
    }

    private _initCommands() {
        [
            AddDocHyperLinkCommand,
            UpdateDocHyperLinkCommand,
            DeleteDocHyperLinkCommand,
            ShowDocHyperLinkEditPopupOperation,
            ToggleDocHyperLinkInfoPopupOperation,
            ClickDocHyperLinkOperation,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }

    private _initShortcut() {
        [addLinkShortcut].forEach((shortcut) => {
            this._shortcutService.registerShortcut(shortcut);
        });
    }

    private _initMenus() {
        this._menuManagerService.mergeMenu(menuSchema);
    }
}
