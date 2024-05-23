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
import { IMenuService } from '@univerjs/ui';
import { SortRangeAscCommand, SortRangeAscInCtxMenuCommand, SortRangeCustomCommand, SortRangeCustomInCtxMenuCommand, SortRangeDescCommand, SortRangeDescInCtxMenuCommand } from '../commands/sheets-sort.command';
import { sortRangeAscCtxMenuFactory, sortRangeAscMenuFactory, sortRangeCtxMenuFactory, sortRangeCustomCtxMenuFactory, sortRangeCustomMenuFactory, sortRangeDescCtxMenuFactory, sortRangeDescMenuFactory, sortRangeMenuFactory } from './sheets-sort.menu';


@OnLifecycle(LifecycleStages.Ready, SheetsSortUIController)
export class SheetsSortUIController extends Disposable {
    constructor(
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
        [
            sortRangeMenuFactory,
            sortRangeAscMenuFactory,
            sortRangeDescMenuFactory,
            sortRangeCustomMenuFactory,
            sortRangeCtxMenuFactory,
            sortRangeAscCtxMenuFactory,
            sortRangeDescCtxMenuFactory,
            sortRangeCustomCtxMenuFactory,
        ].forEach((menu) => {
            this.disposeWithMe(
                this._menuService.addMenuItem(
                    menu(this._injector)
                )
            );
        });
    }

    private _initCommands(): void {
        [
            SortRangeAscCommand,
            SortRangeDescCommand,
            SortRangeCustomCommand,
            SortRangeAscInCtxMenuCommand,
            SortRangeDescInCtxMenuCommand,
            SortRangeCustomInCtxMenuCommand,

        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}

