import { BaseComponentRender, IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { IToolbarItemProps, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { UploadCommand } from '../commands/upload.command';
import { ImportMenuItemFactory } from './menu';

export class ImportXlsxController extends Disposable {
    protected _toolButton: IToolbarItemProps;

    protected _render: BaseComponentRender;

    constructor(
        @Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController,
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        const toolbar = this._sheetContainerUIController.getToolbarController();
        this._initializeContextMenu();
        toolbar.setToolbar();

        [UploadCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initializeContextMenu() {
        [ImportMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
