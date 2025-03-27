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

import type { UIPartsService } from '@univerjs/ui';

import type { ISheetSortLocation } from '../services/sheets-sort-ui.service';
import { ICommandService, Inject, Injector, LocaleService, RxDisposable } from '@univerjs/core';
import { serializeRange } from '@univerjs/engine-formula';
import { AscendingSingle, CustomSortSingle, DescendingSingle, ExpandAscendingSingle, ExpandDescendingSingle } from '@univerjs/icons';
import { SortRangeCommand } from '@univerjs/sheets-sort';
import { SheetsRenderService, SheetsUIPart } from '@univerjs/sheets-ui';
import { ComponentManager, connectInjector, IDialogService, ILayoutService, IMenuManagerService, IUIPartsService } from '@univerjs/ui';
import { takeUntil } from 'rxjs';
import { SortRangeAscCommand, SortRangeAscExtCommand, SortRangeAscExtInCtxMenuCommand, SortRangeAscInCtxMenuCommand, SortRangeCustomCommand, SortRangeCustomInCtxMenuCommand, SortRangeDescCommand, SortRangeDescExtCommand, SortRangeDescExtInCtxMenuCommand, SortRangeDescInCtxMenuCommand } from '../commands/commands/sheets-sort.command';
import { SheetsSortUIService } from '../services/sheets-sort-ui.service';
import { CustomSortPanel } from '../views/CustomSortPanel';
import EmbedSortBtn from '../views/EmbedSortBtn';
import { menuSchema } from './menu.schema';
import { SHEETS_SORT_ASC_EXT_ICON, SHEETS_SORT_ASC_ICON, SHEETS_SORT_CUSTOM_ICON, SHEETS_SORT_DESC_EXT_ICON, SHEETS_SORT_DESC_ICON } from './sheets-sort.menu';

const CUSTOM_SORT_DIALOG_ID = 'custom-sort-dialog';
const CUSTOM_SORT_PANEL_WIDTH = 560;

export class SheetsSortUIController extends RxDisposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IDialogService private readonly _dialogService: IDialogService,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IUIPartsService private readonly _uiPartsService: UIPartsService,
        @Inject(SheetsRenderService) private _sheetRenderService: SheetsRenderService,
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
        this._menuManagerService.mergeMenu(menuSchema);
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

        this.disposeWithMe(this._sheetRenderService.registerSkeletonChangingMutations(SortRangeCommand.id));
    }

    private _initUI(): void {
        this.disposeWithMe(this._componentManager.register('CustomSortPanel', CustomSortPanel));
        this.disposeWithMe(this._uiPartsService.registerComponent(SheetsUIPart.FILTER_PANEL_EMBED_POINT, () => connectInjector(EmbedSortBtn, this._injector)));
        this.disposeWithMe(this._componentManager.register(SHEETS_SORT_ASC_ICON, AscendingSingle));
        this.disposeWithMe(this._componentManager.register(SHEETS_SORT_ASC_EXT_ICON, ExpandAscendingSingle));
        this.disposeWithMe(this._componentManager.register(SHEETS_SORT_DESC_ICON, DescendingSingle));
        this.disposeWithMe(this._componentManager.register(SHEETS_SORT_DESC_EXT_ICON, ExpandDescendingSingle));
        this.disposeWithMe(this._componentManager.register(SHEETS_SORT_CUSTOM_ICON, CustomSortSingle));

        // this controller is also responsible for toggling the CustomSortDialog
        this._sheetsSortUIService.customSortState$.pipe(takeUntil(this.dispose$)).subscribe((newState) => {
            if (newState && newState.show && newState.location) {
                this._openCustomSortPanel(newState.location);
            } else if (newState && !newState?.show) {
                this._closePanel();
            }
        });
    }

    private _openCustomSortPanel(location: ISheetSortLocation): void {
        this._dialogService.open({
            id: CUSTOM_SORT_DIALOG_ID,
            draggable: true,
            width: CUSTOM_SORT_PANEL_WIDTH,
            title: { title: `${this._localeService.t('sheets-sort.general.sort-custom')}: ${serializeRange(location.range)}` },
            children: { label: 'CustomSortPanel' },
            destroyOnClose: true,
            defaultPosition: getCustomSortDialogDefaultPosition(),
            preservePositionOnDestroy: false,
            onClose: () => this._closePanel(),
            mask: true,
        });
    }

    private _closePanel(): void {
        this._dialogService.close(CUSTOM_SORT_DIALOG_ID);

        queueMicrotask(() => this._layoutService.focus());
    }
}

function getCustomSortDialogDefaultPosition(): { x: number; y: number } {
    const x = 0;
    const y = 0;

    return { x, y };
}
