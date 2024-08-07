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

import { Disposable, ICommandService, Inject, Injector, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { DeleteSingle, DownloadSingle, LockSingle, PivotTableSingle, PrintSingle, ShareSingle, ZenSingle } from '@univerjs/icons';
import type { IMenuItemFactory, MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { DisposeUnitOperation } from '../commands/operations/uni.operation';
import { UniToolbarService } from '../services/toolbar/uni-toolbar-service';
import { DeleteMenuItemFactory, DownloadMenuItemFactory, FakeBackgroundColorSelectorMenuItemFactory, FakeFontFamilySelectorMenuItemFactory, FakeFontGroupMenuItemFactory, FakeFontSizeSelectorMenuItemFactory, FakeImageMenuFactory, FakeOrderListMenuItemFactory, FakePivotTableMenuItemFactory, FakeTextColorSelectorMenuItemFactory, FakeUnorderListMenuItemFactory, FontGroupMenuItemFactory, LockMenuItemFactory, PrintMenuItemFactory, ShareMenuItemFactory, ZenMenuItemFactory } from './menu';

export interface IUniuiToolbarConfig {
    menu: MenuConfig;
}

export const DefaultUniuiToolbarConfig = {};

@OnLifecycle(LifecycleStages.Ready, UniuiToolbarController)
export class UniuiToolbarController extends Disposable {
    constructor(
        @IMenuService protected readonly _menuService: IMenuService,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager,
        @ICommandService protected readonly _commandService: ICommandService,
        @Inject(UniToolbarService) protected readonly _toolbarService: UniToolbarService
    ) {
        super();
        this._initComponent();
        this._initMenus();
        this._initCommands();
    }

    private _initComponent(): void {
        const componentManager = this._componentManager;
        const iconList: Record<string, React.ForwardRefExoticComponent<any>> = {
            DownloadSingle,
            ShareSingle,
            LockSingle,
            PrintSingle,
            ZenSingle,
            DeleteSingle,
            PivotTableSingle,
        };
        for (const k in iconList) {
            this.disposeWithMe(componentManager.register(k, iconList[k]));
        }
    }

    private _initMenus(): void {
        // register menu factories
        (
            [
                DownloadMenuItemFactory,
                ShareMenuItemFactory,
                LockMenuItemFactory,
                PrintMenuItemFactory,
                ZenMenuItemFactory,
                DeleteMenuItemFactory,
                FontGroupMenuItemFactory,
                FakeFontFamilySelectorMenuItemFactory,
                FakeTextColorSelectorMenuItemFactory,
                FakeFontSizeSelectorMenuItemFactory,
                FakeBackgroundColorSelectorMenuItemFactory,
                FakeImageMenuFactory,
                FakeFontGroupMenuItemFactory,
                FakePivotTableMenuItemFactory,
                FakeOrderListMenuItemFactory,
                FakeUnorderListMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), {}));
        });
    }

    private _initCommands(): void {
        [
            DisposeUnitOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }
}

