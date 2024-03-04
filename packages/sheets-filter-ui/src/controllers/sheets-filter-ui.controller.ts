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

import type { Nullable } from '@univerjs/core';
import { Disposable, ICommandService, IContextService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IDialogService, IMenuService, IShortcutService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { distinctUntilChanged } from 'rxjs';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterConditionsCommand, SetSheetsFilterCriteriaCommand, SmartToggleSheetsFilterCommand } from '../commands/sheets-filter.command';
import { FilterPanel } from '../views/components/SheetsFilterPanel';
import { CloseFilterPanelOperation, FILTER_PANEL_OPENED_KEY, OpenFilterPanelOperation } from '../commands/sheets-filter.operation';
import { SmartToggleFilterShortcut } from './sheets-filter.shortcut';
import { ClearFilterConditionsMenuItemFactory, ReCalcFilterMenuItemFactory, SmartToggleFilterMenuItemFactory } from './sheets-filter.menu';

const FILTER_PANEL_COMPONENT = 'FILTER_PANEL';
const FILTER_DIALOG_KEY = 'FILTER_DIALOG';

/**
 * This controller controls the UI of "filter" features. Menus, commands and filter panel etc. Except for the rendering.
 */
@OnLifecycle(LifecycleStages.Steady, SheetsFilterUIController)
export class SheetsFilterUIController extends Disposable {
    constructor(
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService,
        @IContextService private readonly _contextService: IContextService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initCommands();
        this._initShortcuts();
        this._initMenuItems();
        this._initUI();
    }

    override dispose(): void {
        this._closeFilterPanel();
    }

    private _initShortcuts(): void {
        this.disposeWithMe(this._shortcutService.registerShortcut(SmartToggleFilterShortcut));
    }

    private _initCommands(): void {
        [
            SmartToggleSheetsFilterCommand,
            SetSheetsFilterCriteriaCommand,
            ClearSheetsFilterCriteriaCommand,
            ReCalcSheetsFilterConditionsCommand,
            OpenFilterPanelOperation,
            CloseFilterPanelOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initMenuItems(): void {
        ([
            SmartToggleFilterMenuItemFactory,
            ClearFilterConditionsMenuItemFactory,
            ReCalcFilterMenuItemFactory,
        ] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _initUI(): void {
        this.disposeWithMe(this._componentManager.register(FILTER_PANEL_COMPONENT, FilterPanel));
        this._contextService.subscribeContextValue$(FILTER_PANEL_OPENED_KEY)
            .pipe(distinctUntilChanged())
            .subscribe((open) => {
                if (open) {
                    this._openFilterPanel();
                } else {
                    this._closeFilterPanel();
                }
            });

        // TODO: when active sheet changes, the filter panel should be closed
    }

    private _closePanelListener?: Nullable<IDisposable>;
    private _openFilterPanel(): void {
        // TODO@wzhudev: later we are going to integrate a service provided by @weird94
        // DialogService is not very good for this kind of use case.

        this._dialogService.open({
            id: FILTER_DIALOG_KEY,
            width: 350,
            children: { label: FILTER_PANEL_COMPONENT },
            destroyOnClose: true,
            onClose: () => this._closeFilterPanel(),
        });

        this._setupClosePanelListener();
    }

    private _closeFilterPanel(): void {
        this._closePanelListener?.dispose();
        this._closePanelListener = null;

        this._dialogService.close(FILTER_DIALOG_KEY);
    }

    /**
     * When some mutation happens, we may need to close the filter panel.
     */
    private _setupClosePanelListener(): IDisposable {
        // TODO@wzhudev: implement these kind of listeners.
        return toDisposable(() => {});
    }
}
