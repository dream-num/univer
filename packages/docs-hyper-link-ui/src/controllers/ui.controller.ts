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
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { LinkSingle } from '@univerjs/icons';
import { DocHyperLinkEdit } from '../views/hyper-link-edit';
import { AddDocHyperLinkCommand } from '../commands/commands/add-link.command';
import { UpdateDocHyperLinkCommand } from '../commands/commands/update-link.command';
import { DeleteDocHyperLinkCommand } from '../commands/commands/delete-link.command';
import { ShowDocHyperLinkPopupOperation } from '../commands/operations/popup.operation';
import { AddHyperLinkMenuItemFactory, DOC_LINK_ICON } from './menu';

@OnLifecycle(LifecycleStages.Starting, DocHyperLinkUIController)
export class DocHyperLinkUIController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initComponents();
        this._initCommands();
        this._initMenus();
    }

    private _initComponents() {
        ([
            [DocHyperLinkEdit, DocHyperLinkEdit.componentKey],
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
            ShowDocHyperLinkPopupOperation,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }

    private _initMenus() {
        [AddHyperLinkMenuItemFactory].forEach((menuFactory) => {
            this.disposeWithMe(this._menuService.addMenuItem(menuFactory(this._injector), {}));
        });
    }
}
