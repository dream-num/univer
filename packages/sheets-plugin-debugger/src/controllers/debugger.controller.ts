import { IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { LocaleOperation } from '../commands/operations/locale.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import { UIComponentOperation } from '../commands/operations/ui-component.operation';
import { LocaleMenuItemFactory, ThemeMenuItemFactory, UIComponentMenuItemFactory } from './menu';

export class DebuggerController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initializeContextMenu();

        [LocaleOperation, ThemeOperation, UIComponentOperation].forEach((command) =>
            this.disposeWithMe(this._commandService.registerCommand(command))
        );
    }

    private _initializeContextMenu() {
        [LocaleMenuItemFactory, ThemeMenuItemFactory, UIComponentMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
