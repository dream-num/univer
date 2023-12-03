import { Disposable, ICommandService, LifecycleStages, OnLifecycle, RedoCommand, UndoCommand } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { CopyCommand, CutCommand, PasteCommand } from '../services/clipboard/clipboard.command';
import { IMenuService } from '../services/menu/menu.service';
import { KeyCode, MetaKeys } from '../services/shortcut/keycode';
import type { IShortcutItem } from '../services/shortcut/shortcut.service';
import { IShortcutService } from '../services/shortcut/shortcut.service';
import { RedoMenuItemFactory, UndoMenuItemFactory } from './menus/menus';

export const CopyShortcutItem: IShortcutItem = {
    id: CopyCommand.id,
    description: 'shortcut.copy',
    group: '1_common-edit',
    binding: KeyCode.C | MetaKeys.CTRL_COMMAND,
};

export const CutShortcutItem: IShortcutItem = {
    id: CutCommand.id,
    description: 'shortcut.cut',
    group: '1_common-edit',
    binding: KeyCode.X | MetaKeys.CTRL_COMMAND,
};

export const PasteShortcutItem: IShortcutItem = {
    id: PasteCommand.id,
    description: 'shortcut.paste',
    group: '1_common-edit',
    binding: KeyCode.V | MetaKeys.CTRL_COMMAND,
};

export const UndoShortcutItem: IShortcutItem = {
    id: UndoCommand.id,
    description: 'shortcut.undo',
    group: '1_common-edit',
    binding: KeyCode.Z | MetaKeys.CTRL_COMMAND,
};

export const RedoShortcutItem: IShortcutItem = {
    id: RedoCommand.id,
    description: 'shortcut.redo',
    group: '1_common-edit',
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
