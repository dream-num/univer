/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { MenuConfig } from '@univerjs/ui';
import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { DeleteSingle, DownloadSingle, LockSingle, PivotTableSingle, PrintSingle, ShareSingle, ZenSingle } from '@univerjs/icons';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { DisposeUnitOperation } from '../commands/operations/uni.operation';
import { UniToolbarService } from '../services/toolbar/uni-toolbar-service';
import { menuSchema } from './menu.schema';

export interface IUniuiToolbarConfig {
    menu: MenuConfig;
}

export const DefaultUniuiToolbarConfig = {};

export class UniuiToolbarController extends Disposable {
    constructor(
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
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
        this._menuManagerService.appendRootMenu(menuSchema);
    }

    private _initCommands(): void {
        [
            DisposeUnitOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }
}
