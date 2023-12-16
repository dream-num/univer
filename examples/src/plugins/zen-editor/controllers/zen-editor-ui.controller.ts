/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IDesktopUIController, IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IMenuService, IShortcutService, IUIController } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { ZenEditorMenuItemFactory } from '../views/menu';
import { ZEN_EDITOR_COMPONENT, ZenEditor } from '../views/zen-editor';

@OnLifecycle(LifecycleStages.Ready, ZenEditorUIController)
export class ZenEditorUIController extends Disposable {
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

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(ZEN_EDITOR_COMPONENT, ZenEditor));
    }

    private _initCommands(): void {
        [].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initMenus(): void {
        (
            [
                // context menu
                ZenEditorMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _init(): void {
        this._initCustomComponents();
        this._initCommands();
        this._initMenus();
    }
}
