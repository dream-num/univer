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
import type { IShortcutItem } from '../../services/shortcut/shortcut.service';
import { IShortcutService } from '../../services/shortcut/shortcut.service';
import { KeyCode, MetaKeys } from '../../services/shortcut/keycode';
import type { IUniverUIConfig } from '../ui/ui.controller';
import { ShortcutPanelMenuItemFactory } from './menu';

const ToggleShortcutPanelShortcut: IShortcutItem = {
    id: ToggleShortcutPanelOperation.id,
    binding: MetaKeys.CTRL_COMMAND | KeyCode.BACK_SLASH,
    description: 'shortcut.shortcut-panel',
    group: '10_global-shortcut',
};

/**
 * This controller add a side panel to the application to display the shortcuts.
 */
@OnLifecycle(LifecycleStages.Steady, ShortcutPanelController)
export class ShortcutPanelController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverUIConfig>,
        @Inject(Injector) injector: Injector,
        @Inject(ComponentManager) componentManager: ComponentManager,
        @IShortcutService shortcutService: IShortcutService,
        @IMenuService menuService: IMenuService,
        @ICommandService commandService: ICommandService
    ) {
        super();

        const { menu = {} } = this._config;

        // register the menu item
        this.disposeWithMe(menuService.addMenuItem(injector.invoke(ShortcutPanelMenuItemFactory), menu));

        // register the panel
        this.disposeWithMe(componentManager.register(ShortcutPanelComponentName, ShortcutPanel));
        this.disposeWithMe(commandService.registerCommand(ToggleShortcutPanelOperation));

        // register the shortcut
        this.disposeWithMe(shortcutService.registerShortcut(ToggleShortcutPanelShortcut));
    }
}
