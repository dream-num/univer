import { IMenuService } from '@univerjs/ui';
import { Disposable, ICommandService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { UploadOperation } from '../commands/operations/upload.operation';
import { ImportMenuItemFactory } from './menu';

export class ImportXlsxController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initializeContextMenu();

        [UploadOperation].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initializeContextMenu() {
        [ImportMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
