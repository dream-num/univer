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

import type { IShortcutItem } from '../../services/shortcut/shortcut.service';
import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import {
    ShortcutPanelComponentName,
    ToggleShortcutPanelOperation,
} from '../../commands/operations/toggle-shortcut-panel.operation';
import { ComponentManager } from '../../common/component-manager';
import { IMenuManagerService } from '../../services/menu/menu-manager.service';
import { KeyCode, MetaKeys } from '../../services/shortcut/keycode';
import { IShortcutService } from '../../services/shortcut/shortcut.service';
import { ShortcutPanel } from '../../views/components/shortcut-panel/ShortcutPanel';

const ToggleShortcutPanelShortcut: IShortcutItem = {
    id: ToggleShortcutPanelOperation.id,
    binding: MetaKeys.CTRL_COMMAND | KeyCode.BACK_SLASH,
    description: 'shortcut.shortcut-panel',
    group: '10_global-shortcut',
};

/**
 * This controller add a side panel to the application to display the shortcuts.
 */
export class ShortcutPanelController extends Disposable {
    constructor(
        @Inject(Injector) injector: Injector,
        @Inject(ComponentManager) componentManager: ComponentManager,
        @IShortcutService shortcutService: IShortcutService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @ICommandService commandService: ICommandService
    ) {
        super();

        // register the panel
        this.disposeWithMe(componentManager.register(ShortcutPanelComponentName, ShortcutPanel));
        this.disposeWithMe(commandService.registerCommand(ToggleShortcutPanelOperation));

        // register the shortcut
        this.disposeWithMe(shortcutService.registerShortcut(ToggleShortcutPanelShortcut));
    }
}
