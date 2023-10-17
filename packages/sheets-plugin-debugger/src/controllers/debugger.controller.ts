import { IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { I18nOperation } from '../commands/operations/i18n.operation';
import { DebuggerMenuItemFactory } from './menu';

export class DebuggerController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initializeContextMenu();

        [I18nOperation].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initializeContextMenu() {
        [DebuggerMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
