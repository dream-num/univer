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

import { Disposable, ICommandService, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService, IShortcutService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { LinkSingle } from '@univerjs/icons';
import { CellLinkPopup } from '../views/CellLinkPopup';
import { CellLinkEdit } from '../views/CellLinkEdit';
import { CloseHyperLinkSidebarOperation, InsertHyperLinkOperation, InsertHyperLinkToolbarOperation, OpenHyperLinkSidebarOperation } from '../commands/operations/sidebar.operations';
import { insertLinkMenuFactory, insertLinkMenuToolbarFactory, InsertLinkShortcut } from './menu';

export interface IUniverSheetsHyperLinkUIConfig {
    menu?: MenuConfig;
}

@OnLifecycle(LifecycleStages.Ready, SheetsHyperLinkUIController)
export class SheetsHyperLinkUIController extends Disposable {
    constructor(
        private _config: IUniverSheetsHyperLinkUIConfig | undefined,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @ICommandService private _commandService: ICommandService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @IMenuService private _menuService: IMenuService,
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
            OpenHyperLinkSidebarOperation,
            CloseHyperLinkSidebarOperation,
            InsertHyperLinkOperation,
            InsertHyperLinkToolbarOperation,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }

    private _initMenus() {
        this._menuService.addMenuItem(insertLinkMenuFactory(this._injector), this._config?.menu ?? {});
        this._menuService.addMenuItem(insertLinkMenuToolbarFactory(this._injector), this._config?.menu ?? {});
    }

    private _initShortCut() {
        this._shortcutService.registerShortcut(InsertLinkShortcut);
    }
}
