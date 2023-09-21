import { ComponentManager, Icon, IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { IDisposable, Inject, Injector } from '@wendellhu/redi';

import { HideModalOperation, ShowModalOperation } from '../commands/operations/show-modal.operation';
import { FindModalController } from './FindModalController';
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
        this._componentManager.register('SearchIcon', Icon.SearchIcon);

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
