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

import { Disposable, Inject, Injector, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { DownloadSingle, LockSingle, PrintSingle, ShareSingle, ZenSingle } from '@univerjs/icons';
import type { IMenuItemFactory, MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { DownloadMenuItemFactory, LockMenuItemFactory, PrintMenuItemFactory, ShareMenuItemFactory, ZenMenuItemFactory } from './menu';

export interface IUniuiToolbarConfig {
    menu: MenuConfig;
}

export const DefaultUniuiToolbarConfig = {};

@OnLifecycle(LifecycleStages.Steady, UniuiToolbarController)
export class UniuiToolbarController extends Disposable {
    constructor(
        @IMenuService protected readonly _menuService: IMenuService,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager
    ) {
        super();
        this._initComponent();
        this._initMenus();
    }

    private _initComponent(): void {
        const componentManager = this._componentManager;
        const iconList: Record<string, React.ForwardRefExoticComponent<any>> = {
            DownloadSingle,
            ShareSingle,
            LockSingle,
            PrintSingle,
            ZenSingle,
        };
        for (const k in iconList) {
            this.disposeWithMe(componentManager.register(k, iconList[k]));
        }
    }

    private _initMenus(): void {
        (
            [
                DownloadMenuItemFactory,
                ShareMenuItemFactory,
                LockMenuItemFactory,
                PrintMenuItemFactory,
                ZenMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), {}));
        });
    }
}

