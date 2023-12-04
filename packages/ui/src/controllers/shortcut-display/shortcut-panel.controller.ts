import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

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
        @IMenuService menuService: IMenuService,
        @ICommandService commandService: ICommandService,
        @Inject(ComponentManager) componentManager: ComponentManager
    ) {
        super();

        // Register the menu item.
        this.disposeWithMe(menuService.addMenuItem(ShortcutPanelMenuItemFactory()));
        // Register the panel.
        this.disposeWithMe(componentManager.register(ShortcutPanelComponentName, ShortcutPanel));
        this.disposeWithMe(commandService.registerCommand(ToggleShortcutPanelOperation));
    }
}
