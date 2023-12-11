/**
 * Copyright 2023 DreamNum Inc.
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
import { ComponentManager, IMenuService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { HideModalOperation, ShowModalOperation } from '../commands/operations/show-modal.operation';
import { FindModalController } from './find-modal-controller';
import { FindMenuItemFactory } from './menu';

export class FindController extends Disposable implements IDisposable {
    constructor(
        @Inject(FindModalController) private _findModalController: FindModalController,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        // this._componentManager.register('SearchIcon', Icon.SearchIcon);

        this._initializeContextMenu();

        [ShowModalOperation, HideModalOperation].forEach((command) =>
            this.disposeWithMe(this._commandService.registerCommand(command))
        );
    }

    private _initializeContextMenu() {
        [FindMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
