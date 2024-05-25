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

import type { UniverInstanceService } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';

import { Inject, Injector } from '@wendellhu/redi';
import type { MenuConfig } from '@univerjs/ui';
import { IMenuService } from '@univerjs/ui';
import { SortRangeAscCommand, SortRangeAscExtCommand, SortRangeAscExtInCtxMenuCommand, SortRangeAscInCtxMenuCommand, SortRangeCustomCommand, SortRangeCustomInCtxMenuCommand, SortRangeDescCommand, SortRangeDescExtCommand, SortRangeDescExtInCtxMenuCommand, SortRangeDescInCtxMenuCommand } from '../commands/sheets-sort.command';
import { sortRangeAscCtxMenuFactory, sortRangeAscExtCtxMenuFactory, sortRangeAscExtMenuFactory, sortRangeAscMenuFactory, sortRangeCtxMenuFactory, sortRangeCustomCtxMenuFactory, sortRangeCustomMenuFactory, sortRangeDescCtxMenuFactory, sortRangeDescExtCtxMenuFactory, sortRangeDescExtMenuFactory, sortRangeDescMenuFactory, sortRangeMenuFactory } from './sheets-sort.menu';

export interface IUniverSheetsSortUIConfig {
    menu: MenuConfig;
}
export const DefaultSheetsSortUIConfig = {
    menu: {},
};

@OnLifecycle(LifecycleStages.Ready, SheetsSortUIController)
export class SheetsSortUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverSheetsSortUIConfig>,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _instanceService: UniverInstanceService,
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._initCommands();
        this._initMenu();
    }

    private _initMenu() {
        const { menu = {} } = this._config;
        [
            sortRangeMenuFactory,
            sortRangeAscMenuFactory,
            sortRangeAscExtMenuFactory,
            sortRangeDescMenuFactory,
            sortRangeDescExtMenuFactory,
            sortRangeCustomMenuFactory,
            sortRangeCtxMenuFactory,
            sortRangeAscCtxMenuFactory,
            sortRangeAscExtCtxMenuFactory,
            sortRangeDescCtxMenuFactory,
            sortRangeDescExtCtxMenuFactory,
            sortRangeCustomCtxMenuFactory,
        ].forEach((factory) => {
            this.disposeWithMe(
                this._menuService.addMenuItem(
                    this._injector.invoke(factory), menu
                )
            );
        });
    }

    private _initCommands(): void {
        [
            SortRangeAscCommand,
            SortRangeAscExtCommand,
            SortRangeDescCommand,
            SortRangeDescExtCommand,
            SortRangeCustomCommand,
            SortRangeAscInCtxMenuCommand,
            SortRangeAscExtInCtxMenuCommand,
            SortRangeDescInCtxMenuCommand,
            SortRangeDescExtInCtxMenuCommand,
            SortRangeCustomInCtxMenuCommand,

        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}

