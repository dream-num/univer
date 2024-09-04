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

import { Disposable, ICommandService, Inject, Injector, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuManagerService, IShortcutService } from '@univerjs/ui';
import { LinkSingle } from '@univerjs/icons';
import { CellLinkPopup } from '../views/CellLinkPopup';
import { CellLinkEdit } from '../views/CellLinkEdit';
import { CloseHyperLinkPopupOperation, InsertHyperLinkOperation, InsertHyperLinkToolbarOperation, OpenHyperLinkEditPanelOperation } from '../commands/operations/popup.operations';
import { AddHyperLinkCommand, AddRichHyperLinkCommand } from '../commands/commands/add-hyper-link.command';
import { UpdateHyperLinkCommand, UpdateRichHyperLinkCommand } from '../commands/commands/update-hyper-link.command';
import { CancelHyperLinkCommand, CancelRichHyperLinkCommand } from '../commands/commands/remove-hyper-link.command';
import { menuSchema } from './menu.schema';
import { InsertLinkShortcut } from './menu';

@OnLifecycle(LifecycleStages.Ready, SheetsHyperLinkUIController)
export class SheetsHyperLinkUIController extends Disposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @ICommandService private _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @Inject(Injector) private _injector: Injector,
        @Inject(IShortcutService) private _shortcutService: IShortcutService
    ) {
        super();

        this._initComponents();
        this._initCommands();
        this._initMenus();
        this._initShortCut();
    }

    private _initComponents() {
        ([
            [CellLinkPopup, CellLinkPopup.componentKey],
            [CellLinkEdit, CellLinkEdit.componentKey],
            [LinkSingle, 'LinkSingle'],
        ] as const).forEach(([comp, key]) => {
            this._componentManager.register(key, comp);
        });
    }

    private _initCommands() {
        [
            OpenHyperLinkEditPanelOperation,
            CloseHyperLinkPopupOperation,
            InsertHyperLinkOperation,
            InsertHyperLinkToolbarOperation,

            AddHyperLinkCommand,
            UpdateHyperLinkCommand,
            CancelHyperLinkCommand,
            UpdateRichHyperLinkCommand,
            CancelRichHyperLinkCommand,
            AddRichHyperLinkCommand,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }

    private _initMenus() {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initShortCut() {
        this._shortcutService.registerShortcut(InsertLinkShortcut);
    }
}
