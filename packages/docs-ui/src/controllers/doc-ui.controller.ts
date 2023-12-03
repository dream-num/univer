import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IDesktopUIController, IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IMenuService, IShortcutService, IUIController } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import {
    BoldMenuItemFactory,
    ItalicMenuItemFactory,
    StrikeThroughMenuItemFactory,
    UnderlineMenuItemFactory,
} from './menu/menu';

// FIXME: LifecycleStages.Rendered must be used, otherwise the menu cannot be added to the DOM, but the sheet ui plug-in can be added in LifecycleStages.Ready
@OnLifecycle(LifecycleStages.Rendered, DocUIController)
export class DocUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IMenuService private readonly _menuService: IMenuService,
        @IUIController private readonly _uiController: IDesktopUIController
    ) {
        super();

        this._init();
    }

    private _init(): void {
        // init menus
        (
            [
                BoldMenuItemFactory,
                ItalicMenuItemFactory,
                UnderlineMenuItemFactory,
                StrikeThroughMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
