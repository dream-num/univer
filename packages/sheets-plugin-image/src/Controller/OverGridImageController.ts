import { ComponentManager, IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { IOverGridImageProperty } from '../Basics';
import { UploadOperation } from '../commands/operations/upload.operation';
import { IImagePluginData } from '../Symbol';
import { ImportImageMenuItemFactory } from './menu';

export class OverGridImageController extends Disposable {
    constructor(
        @Inject(Injector) readonly _injector: Injector,
        @Inject(IImagePluginData) _imagePluginData: Map<string, IOverGridImageProperty>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();

        // this._componentManager.register('ImageIcon', Icon.View.ImageIcon);
        this._initializeContextMenu();

        [UploadOperation].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initializeContextMenu() {
        [ImportImageMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
