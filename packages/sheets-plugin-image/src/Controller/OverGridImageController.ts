import { BaseComponentRender, ComponentManager, Icon, IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { IOverGridImageProperty } from '../Basics';
import { UploadCommand } from '../commands/upload.command';
import { IImagePluginData } from '../Symbol';
import { ImportImageMenuItemFactory } from './menu';

export class OverGridImageController extends Disposable {
    protected _render: BaseComponentRender;

    constructor(
        @Inject(Injector) readonly _injector: Injector,
        @Inject(IImagePluginData) _imagePluginData: Map<string, IOverGridImageProperty>,
        @Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();

        this._componentManager.register('ImageIcon', Icon.View.ImageIcon);
        const toolbar = this._sheetContainerUIController.getToolbarController();
        this._initializeContextMenu();
        toolbar.setToolbar();

        [UploadCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initializeContextMenu() {
        [ImportImageMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
