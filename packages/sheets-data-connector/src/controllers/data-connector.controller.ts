import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { DataConnectorSidebarOperation } from '../commands/operations/data-connector-sidebar.operation';
import { DataConnectorSidebar } from '../views/DataConnectorSidebar/DataConnectorSidebar';
import { DATA_CONNECTOR_SIDEBAR_COMPONENT } from '../views/DataConnectorSidebar/interface';
import { DataConnectorSidebarMenuItemFactory } from './menu';

@OnLifecycle(LifecycleStages.Ready, DataConnectorController)
export class DataConnectorController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerCommands();
        this._registerMenus();
        this._registerComponents();
    }

    private _registerMenus(): void {
        [DataConnectorSidebarMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _registerCommands(): void {
        [DataConnectorSidebarOperation].forEach((command) =>
            this.disposeWithMe(this._commandService.registerCommand(command))
        );
    }

    private _registerComponents(): void {
        this._componentManager.register(DATA_CONNECTOR_SIDEBAR_COMPONENT, DataConnectorSidebar);
    }
}
