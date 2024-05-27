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
import { ICommandService, IContextService, LifecycleStages, LocaleService, OnLifecycle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { ComponentManager, IMenuService, IMessageService, IShortcutService } from '@univerjs/ui';
import type { IMenuItemFactory, MenuConfig } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { distinctUntilChanged } from 'rxjs';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { FilterSingle } from '@univerjs/icons';

import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import { MessageType } from '@univerjs/design';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterCommand, SetSheetsFilterCriteriaCommand, SmartToggleSheetsFilterCommand } from '../commands/sheets-filter.command';
import { FilterPanel } from '../views/components/SheetsFilterPanel';
import { ChangeFilterByOperation, CloseFilterPanelOperation, FILTER_PANEL_OPENED_KEY, OpenFilterPanelOperation } from '../commands/sheets-filter.operation';
import { SheetsFilterPanelService } from '../services/sheets-filter-panel.service';
import { SmartToggleFilterShortcut } from './sheets-filter.shortcut';
import { ClearFilterCriteriaMenuItemFactory, ReCalcFilterMenuItemFactory, SmartToggleFilterMenuItemFactory } from './sheets-filter.menu';
import { SheetsFilterRenderController } from './sheets-filter-render.controller';

export interface IUniverSheetsFilterUIConfig {
    menu: MenuConfig;
}

export const DefaultSheetFilterUiConfig = {};

export const FILTER_PANEL_POPUP_KEY = 'FILTER_PANEL_POPUP';

/**
 * This controller controls the UI of "filter" features. Menus, commands and filter panel etc. Except for the rendering.
 */
@OnLifecycle(LifecycleStages.Ready, SheetsFilterUIController)
export class SheetsFilterUIController extends RxDisposable {
    constructor(
        private readonly _config: Partial<IUniverSheetsFilterUIConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(SheetsFilterPanelService) private readonly _sheetsFilterPanelService: SheetsFilterPanelService,
        @Inject(SheetCanvasPopManagerService) private _sheetCanvasPopupService: SheetCanvasPopManagerService,
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService,
        @IContextService private readonly _contextService: IContextService,
        @IMessageService private readonly _messageService: IMessageService
    ) {
        super();

        this._initCommands();
        this._initShortcuts();
        this._initMenuItems();
        this._initUI();
        this._initRenderControllers();
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
    }

    private _initMenuItems(): void {
        const { menu = {} } = this._config;

        ([
            SmartToggleFilterMenuItemFactory,
            ClearFilterCriteriaMenuItemFactory,
            ReCalcFilterMenuItemFactory,
        ] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), menu));
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
        this.disposeWithMe(this._sheetsFilterService.errorMsg$.subscribe((content) => {
            if (content) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t(content),
                });
            }
        }));
    }

    private _initRenderControllers(): void {
        this.disposeWithMe(this._renderManagerService.registerRenderController(UniverInstanceType.UNIVER_SHEET, SheetsFilterRenderController));
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
            offset: [5, 0],
        });
    }

    private _closeFilterPopup(): void {
        this._popupDisposable?.dispose();
        this._popupDisposable = null;
    }
}
