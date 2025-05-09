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

import type { IDisposable, Nullable } from '@univerjs/core';
import { ICommandService, IContextService, Inject, Injector, LocaleService } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { FilterSingle } from '@univerjs/icons';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterCommand, RemoveSheetFilterCommand, SetSheetFilterRangeCommand, SetSheetsFilterCriteriaCommand, SheetsFilterService, SmartToggleSheetsFilterCommand } from '@univerjs/sheets-filter';
import { SheetCanvasPopManagerService, SheetsRenderService } from '@univerjs/sheets-ui';
import { ComponentManager, IMenuManagerService, IMessageService, IShortcutService } from '@univerjs/ui';
import { distinctUntilChanged } from 'rxjs';
import { ChangeFilterByOperation, CloseFilterPanelOperation, FILTER_PANEL_OPENED_KEY, OpenFilterPanelOperation } from '../commands/operations/sheets-filter.operation';
import { SheetsFilterPanelService } from '../services/sheets-filter-panel.service';
import { FilterPanel } from '../views/components/SheetsFilterPanel';
import { menuSchema } from './menu.schema';
import { SheetsFilterUIMobileController } from './sheets-filter-ui-mobile.controller';
import { SmartToggleFilterShortcut } from './sheets-filter.shortcut';

export const FILTER_PANEL_POPUP_KEY = 'FILTER_PANEL_POPUP';

/**
 * This controller controls the UI of "filter" features. Menus, commands and filter panel etc. Except for the rendering.
 */
export class SheetsFilterUIDesktopController extends SheetsFilterUIMobileController {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(SheetsFilterPanelService) private readonly _sheetsFilterPanelService: SheetsFilterPanelService,
        @Inject(SheetCanvasPopManagerService) private _sheetCanvasPopupService: SheetCanvasPopManagerService,
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(SheetsRenderService) sheetsRenderService: SheetsRenderService,
        @IRenderManagerService renderManagerService: IRenderManagerService
    ) {
        super(renderManagerService, sheetsRenderService);

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
            RemoveSheetFilterCommand,
            SetSheetFilterRangeCommand,
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
        this._menuManagerService.mergeMenu(menuSchema);
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
            onClickOutside: () => this._commandService.syncExecuteCommand(CloseFilterPanelOperation.id),
            offset: [5, 0],
        });
    }

    private _closeFilterPopup(): void {
        this._popupDisposable?.dispose();
        this._popupDisposable = null;
    }
}
