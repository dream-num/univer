import { Disposable, ICommandService, LifecycleStages, OnLifecycle, RedoCommand, UndoCommand } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { CopyCommand, CutCommand, PasteCommand } from '../services/clipboard/clipboard.command';
import { CopyShortcutItem, CutShortcutItem, PasteShortcutItem } from '../services/clipboard/clipboard.shortcut';
import { IMenuService } from '../services/menu/menu.service';
import { KeyCode, MetaKeys } from '../services/shortcut/keycode';
import { IShortcutItem, IShortcutService } from '../services/shortcut/shortcut.service';
import { RedoMenuItemFactory, UndoMenuItemFactory } from './menus/menu';

export const UndoShortcutItem: IShortcutItem = {
    id: UndoCommand.id,
    binding: KeyCode.Z | MetaKeys.CTRL_COMMAND,
};

export const RedoShortcutItem: IShortcutItem = {
    id: RedoCommand.id,
    binding: KeyCode.Y | MetaKeys.CTRL_COMMAND,
};

/**
 * Define shared UI behavior across Univer business.
 */
@OnLifecycle(LifecycleStages.Ready, SharedController)
export class SharedController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this.initialize();
    }

    initialize(): void {
        this._registerCommands();
        this._registerShortcuts();
        this._registerMenus();
    }

    private _registerMenus(): void {
        [UndoMenuItemFactory, RedoMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _registerCommands(): void {
        [CutCommand, CopyCommand, PasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerAsMultipleCommand(command))
        );
    }

    private _registerShortcuts(): void {
        [UndoShortcutItem, RedoShortcutItem, CutShortcutItem, CopyShortcutItem, PasteShortcutItem].forEach((shortcut) =>
            this.disposeWithMe(this._shortcutService.registerShortcut(shortcut))
        );
    }
}
