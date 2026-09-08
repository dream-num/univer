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

import type { LocaleKey } from '../../locale/types';
import { ICommandService, Inject, LocaleService, RxDisposable } from '@univerjs/core';
import { serializeRange } from '@univerjs/engine-formula';
import { SortRangeCommand } from '@univerjs/sheets-sort';
import { SheetsRenderService } from '@univerjs/sheets-ui';
import { IDialogService, IMenuManagerService } from '@univerjs/ui';
import { takeUntil } from 'rxjs';
import {
    SortRangeAscCommand,
    SortRangeAscExtCommand,
    SortRangeAscExtInCtxMenuCommand,
    SortRangeAscInCtxMenuCommand,
    SortRangeCustomCommand,
    SortRangeCustomInCtxMenuCommand,
    SortRangeDescCommand,
    SortRangeDescExtCommand,
    SortRangeDescExtInCtxMenuCommand,
    SortRangeDescInCtxMenuCommand,
} from '../../commands/commands/sheets-sort.command';
import { mobileMenuSchema } from '../../menu/mobile-schema';
import { SheetsSortUIService } from '../../services/sheets-sort-ui.service';
import { MOBILE_CUSTOM_SORT_PANEL } from './components.controller';

const MOBILE_CUSTOM_SORT_DIALOG_ID = 'mobile-custom-sort-dialog';

export class SheetsSortMobileUIController extends RxDisposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(SheetsRenderService) private readonly _sheetRenderService: SheetsRenderService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(SheetsSortUIService) private readonly _sheetsSortUIService: SheetsSortUIService
    ) {
        super();

        this._initCommands();
        this._menuManagerService.mergeMenu(mobileMenuSchema);
        this._initCustomSortPanel();
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

    private _initCustomSortPanel(): void {
        this._sheetsSortUIService.customSortState$.pipe(takeUntil(this.dispose$)).subscribe((state) => {
            if (state?.show && state.location) {
                this._dialogService.open({
                    id: MOBILE_CUSTOM_SORT_DIALOG_ID,
                    title: {
                        title: `${this._localeService.t<LocaleKey>('sheets-sort-ui.general.sort-custom')}: ${serializeRange(state.location.range)}`,
                    },
                    children: { label: MOBILE_CUSTOM_SORT_PANEL },
                    mask: true,
                    onClose: () => this._sheetsSortUIService.closeCustomSortPanel(),
                });
                return;
            }

            if (state && !state.show) {
                this._dialogService.close(MOBILE_CUSTOM_SORT_DIALOG_ID);
            }
        });
    }
}
