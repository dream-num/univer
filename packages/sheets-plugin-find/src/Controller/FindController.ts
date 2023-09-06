import { ComponentManager, Icon, IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { IToolbarItemProps, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { IDisposable, Inject, Injector } from '@wendellhu/redi';

import { HideModalCommand, ShowModalCommand } from '../commands/show-modal.command';
import { FIND_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { FindModalController } from './FindModalController';
import { FindMenuItemFactory } from './menu';

export class FindController extends Disposable implements IDisposable {
    private _findList: IToolbarItemProps;

    constructor(
        @Inject(FindModalController) private _findModalController: FindModalController,
        @Inject(SheetContainerUIController) private _uiController: SheetContainerUIController,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._findList = {
            name: FIND_PLUGIN_NAME,
            toolbarType: 1,
            tooltip: 'find.findLabel',
            label: {
                name: 'SearchIcon',
            },
            show: true,
            onClick: () => {
                this._findModalController.showModal(true);
            },
        };
        this._componentManager.register('SearchIcon', Icon.SearchIcon);
        const toolbar = this._uiController.getToolbarController();
        // toolbar.addToolbarConfig(this._findList);
        this._initializeContextMenu();

        // TODO@Dushusir maybe trigger once in ui-plugin-sheets?
        toolbar.setToolbar();

        [ShowModalCommand, HideModalCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    getFindList() {
        return this._findList;
    }

    private _initializeContextMenu() {
        [FindMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
