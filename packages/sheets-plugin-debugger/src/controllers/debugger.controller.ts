import { IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import {
    ConfirmMenuItemFactory,
    DialogMenuItemFactory,
    LocaleMenuItemFactory,
    MessageMenuItemFactory,
    NotificationMenuItemFactory,
    SidebarMenuItemFactory,
    ThemeMenuItemFactory,
} from './menu';

export class DebuggerController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initializeContextMenu();

        [
            LocaleOperation,
            ThemeOperation,
            NotificationOperation,
            DialogOperation,
            ConfirmOperation,
            MessageOperation,
            SidebarOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initializeContextMenu() {
        [
            LocaleMenuItemFactory,
            ThemeMenuItemFactory,
            NotificationMenuItemFactory,
            MessageMenuItemFactory,

            DialogMenuItemFactory,
            ConfirmMenuItemFactory,
            SidebarMenuItemFactory,
        ].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
