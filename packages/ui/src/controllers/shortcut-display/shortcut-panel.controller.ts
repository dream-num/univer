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
import { Inject, Injector } from '@wendellhu/redi';

import {
    ShortcutPanelComponentName,
    ToggleShortcutPanelOperation,
} from '../../commands/operations/toggle-shortcut-panel.operation';
import { ComponentManager } from '../../common/component-manager';
import { IMenuService } from '../../services/menu/menu.service';
import { ShortcutPanel } from '../../views/components/shortcut-panel/ShortcutPanel';
import { ShortcutPanelMenuItemFactory } from './menu';

/**
 * This controller add a side panel to the application to display the shortcuts.
 */
@OnLifecycle(LifecycleStages.Steady, ShortcutPanelController)
export class ShortcutPanelController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService menuService: IMenuService,
        @ICommandService commandService: ICommandService,
        @Inject(ComponentManager) componentManager: ComponentManager
    ) {
        super();

        // Register the menu item.
        this.disposeWithMe(menuService.addMenuItem(this._injector.invoke(ShortcutPanelMenuItemFactory)));
        // Register the panel.
        this.disposeWithMe(componentManager.register(ShortcutPanelComponentName, ShortcutPanel));
        this.disposeWithMe(commandService.registerCommand(ToggleShortcutPanelOperation));
    }
}
