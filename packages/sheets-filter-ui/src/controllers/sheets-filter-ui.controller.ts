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
import { ICommandService, IContextService, LifecycleStages, OnLifecycle, RxDisposable, toDisposable } from '@univerjs/core';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IMenuService, IShortcutService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { distinctUntilChanged } from 'rxjs';
import { ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation } from '@univerjs/sheets-filter';
import { SheetCanvasPopManagerService, SheetRenderController } from '@univerjs/sheets-ui';
import { FilterSingle } from '@univerjs/icons';

import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterCommand, SetSheetsFilterCriteriaCommand, SmartToggleSheetsFilterCommand } from '../commands/sheets-filter.command';
import { FilterPanel } from '../views/components/SheetsFilterPanel';
import { ChangeFilterByOperation, CloseFilterPanelOperation, FILTER_PANEL_OPENED_KEY, OpenFilterPanelOperation } from '../commands/sheets-filter.operation';
import { SheetsFilterPanelService } from '../services/sheets-filter-panel.service';
import { SmartToggleFilterShortcut } from './sheets-filter.shortcut';
import { ClearFilterCriteriaMenuItemFactory, ReCalcFilterMenuItemFactory, SmartToggleFilterMenuItemFactory } from './sheets-filter.menu';

export const FILTER_PANEL_POPUP_KEY = 'FILTER_PANEL_POPUP';

/**
 * This controller controls the UI of "filter" features. Menus, commands and filter panel etc. Except for the rendering.
 */
@OnLifecycle(LifecycleStages.Rendered, SheetsFilterUIController)
export class SheetsFilterUIController extends RxDisposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(SheetsFilterPanelService) private readonly _sheetsFilterPanelService: SheetsFilterPanelService,
        @Inject(SheetCanvasPopManagerService) private _sheetCanvasPopupService: SheetCanvasPopManagerService,
        @Inject(SheetRenderController) private _sheetRenderController: SheetRenderController,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();

        this._initCommands();
        this._initShortcuts();
        this._initMenuItems();
        this._initUI();
    }

    override dispose(): void {
        super.dispose();

        this._closeFilterPopup();
    }

    private _initShortcuts(): void {
        [
            SmartToggleFilterShortcut,
        ].forEach((shortcut) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(shortcut));
        });
    }

    private _initCommands(): void {
        [
            SmartToggleSheetsFilterCommand,
            SetSheetsFilterCriteriaCommand,
            ClearSheetsFilterCriteriaCommand,
            ReCalcSheetsFilterCommand,
            ChangeFilterByOperation,
            OpenFilterPanelOperation,
            CloseFilterPanelOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });

        [
            SetSheetsFilterRangeMutation,
            SetSheetsFilterCriteriaMutation,
            RemoveSheetsFilterMutation,
            ReCalcSheetsFilterMutation,
        ].forEach((m) => {
            this.disposeWithMe(this._sheetRenderController.registerSkeletonChangingMutations(m.id));
        });
    }

    private _initMenuItems(): void {
        ([
            SmartToggleFilterMenuItemFactory,
            ClearFilterCriteriaMenuItemFactory,
            ReCalcFilterMenuItemFactory,
        ] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _initUI(): void {
        this.disposeWithMe(this._componentManager.register(FILTER_PANEL_POPUP_KEY, FilterPanel));
        this.disposeWithMe(this._componentManager.register('FilterSingle', FilterSingle));
        this.disposeWithMe(this._contextService.subscribeContextValue$(FILTER_PANEL_OPENED_KEY)
            .pipe(distinctUntilChanged())
            .subscribe((open) => {
                if (open) {
                    this._openFilterPopup();
                } else {
                    this._closeFilterPopup();
                }
            }));
    }

    private _popupDisposable?: Nullable<IDisposable>;
    private _openFilterPopup(): void {
        const currentFilterModel = this._sheetsFilterPanelService.filterModel;
        if (!currentFilterModel) {
            throw new Error('[SheetsFilterUIController]: no filter model when opening filter popup!');
        }

        const range = currentFilterModel.getRange();
        const col = this._sheetsFilterPanelService.col;
        const { startRow } = range;
        this._popupDisposable = this._sheetCanvasPopupService.attachPopupToCell(startRow, col, {
            componentKey: FILTER_PANEL_POPUP_KEY,
            direction: 'horizontal',
            closeOnSelfTarget: true,
            onClickOutside: () => this._commandService.syncExecuteCommand(CloseFilterPanelOperation.id),
        });

        this._setupClosePanelListener();
    }

    private _closeFilterPopup(): void {
        this._popupDisposable?.dispose();
        this._popupDisposable = null;
    }

    /**
     * When some mutation happens, we may need to close the filter panel.
     */
    private _setupClosePanelListener(): IDisposable {
        // TODO@wzhudev: when the `col` changes, the filter panel should
        // TODO@wzhudev: implement these kind of listeners.
        return toDisposable(() => { });
    }
}
