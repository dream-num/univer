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
import { ICommandService, IUniverInstanceService, LifecycleStages, LocaleService, OnLifecycle, RxDisposable } from '@univerjs/core';

import { Inject, Injector } from '@wendellhu/redi';
import type { MenuConfig } from '@univerjs/ui';
import { ComponentManager, IDialogService, ILayoutService, IMenuService } from '@univerjs/ui';
import { takeUntil } from 'rxjs';
import { SortRangeAscCommand, SortRangeAscExtCommand, SortRangeAscExtInCtxMenuCommand, SortRangeAscInCtxMenuCommand, SortRangeCustomCommand, SortRangeCustomInCtxMenuCommand, SortRangeDescCommand, SortRangeDescExtCommand, SortRangeDescExtInCtxMenuCommand, SortRangeDescInCtxMenuCommand } from '../commands/sheets-sort.command';
import { CustomSortPanel } from '../views/CustomSortPanel';
import { SheetsSortUIService } from '../services/sheets-sort-ui.service';
import { sortRangeAscCtxMenuFactory, sortRangeAscExtCtxMenuFactory, sortRangeAscExtMenuFactory, sortRangeAscMenuFactory, sortRangeCtxMenuFactory, sortRangeCustomCtxMenuFactory, sortRangeCustomMenuFactory, sortRangeDescCtxMenuFactory, sortRangeDescExtCtxMenuFactory, sortRangeDescExtMenuFactory, sortRangeDescMenuFactory, sortRangeMenuFactory } from './sheets-sort.menu';

export interface IUniverSheetsSortUIConfig {
    menu: MenuConfig;
}
export const DefaultSheetsSortUIConfig = {
    menu: {},
};

const CUSTOM_SORT_DIALOG_ID = 'custom-sort-dialog';
const CUSTOM_SORT_PANEL_WIDTH = 560;
const CUSTOM_SORT_PANEL_RIGHT_PADDING = 20;
const CUSTOM_SORT_PANEL_TOP_PADDING = -90;
@OnLifecycle(LifecycleStages.Ready, SheetsSortUIController)
export class SheetsSortUIController extends RxDisposable {
    constructor(
        private readonly _config: Partial<IUniverSheetsSortUIConfig>,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _instanceService: UniverInstanceService,
        @IMenuService private readonly _menuService: IMenuService,
        @IDialogService private readonly _dialogService: IDialogService,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(SheetsSortUIService) private readonly _sheetsSortUIService: SheetsSortUIService,
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();
        this._initCommands();
        this._initMenu();
        this._initUI();
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

    private _initUI(): void {
        this.disposeWithMe(this._componentManager.register('CustomSortPanel', CustomSortPanel));

        // this controller is also responsible for toggling the CustomSortDialog
        this._sheetsSortUIService.customSortState$.pipe(takeUntil(this.dispose$)).subscribe((newState) => {
            if (newState && newState.range) {
                this._openCustomSortPanel();
            }
        });
    }

    private _openCustomSortPanel(): void {
        this._dialogService.open({
            id: CUSTOM_SORT_DIALOG_ID,
            draggable: true,
            width: CUSTOM_SORT_PANEL_WIDTH,
            title: { title: this._localeService.t('sheets-sort.general.sort-custom') },
            children: { label: 'CustomSortPanel' },
            destroyOnClose: true,
            defaultPosition: getCustomSortDialogDefaultPosition(),
            preservePositionOnDestroy: true,
            onClose: () => this.closePanel(),
        });
    }

    closePanel(): void {
        this._dialogService.close(CUSTOM_SORT_DIALOG_ID);

        queueMicrotask(() => this._layoutService.focus());
    }
}

function getCustomSortDialogDefaultPosition(): { x: number; y: number } {
    const { innerWidth } = window;
    const x = (innerWidth - CUSTOM_SORT_PANEL_WIDTH) / 2 - CUSTOM_SORT_PANEL_RIGHT_PADDING;
    const y = CUSTOM_SORT_PANEL_TOP_PADDING;

    return { x, y };
}
