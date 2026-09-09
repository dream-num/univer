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
import type { SheetTableMenuAction } from '../../views/components/SheetTableMenu';
import { toDisposable } from '@univerjs/core';
import { SHEET_TABLE_MOBILE_MENU } from '../../const';
import { SheetTableControlsRenderController } from '../sheet-table-controls-render.controller';

const SHEET_TABLE_MOBILE_MENU_DIALOG_ID = 'sheet-table-mobile-menu';

export class SheetTableControlsMobileRenderController extends SheetTableControlsRenderController {
    protected override _toggleTableMenu(unitId: string, subUnitId: string, tableId: string): void {
        if (this._shape.getOpenedMenuTableId() === tableId) {
            this._closeFloatingControls();
            return;
        }

        const table = this._tableManager.getTableById(unitId, tableId);
        const anchor = this._shape.getAnchorRegion(tableId);
        if (!table || !anchor) {
            return;
        }

        this._closeFloatingControls();
        this._shape.setOpenedMenuTableId(tableId);
        const extraProps = {
            anchorWidth: anchor.width,
            tableName: table.getDisplayName(),
            labels: {
                rename: this._localeService.t<LocaleKey>('sheets-table-ui.rename'),
                'update-range': this._localeService.t<LocaleKey>('sheets-table-ui.updateRange'),
                'set-theme': this._localeService.t<LocaleKey>('sheets-table-ui.setTheme'),
                delete: this._localeService.t<LocaleKey>('sheets-table-ui.removeTable'),
            },
            onSelect: (action: SheetTableMenuAction) => this._handleTableMenuAction(action, unitId, subUnitId, tableId),
            onClose: () => this._closeFloatingControls(),
        };

        this._dialogService.open({
            id: SHEET_TABLE_MOBILE_MENU_DIALOG_ID,
            title: { title: table.getDisplayName() },
            children: {
                label: {
                    name: SHEET_TABLE_MOBILE_MENU,
                    props: { menu: extraProps },
                },
            },
            onClose: () => this._closeFloatingControls(),
        });
        this._menuPopup = toDisposable(() => this._dialogService.close(SHEET_TABLE_MOBILE_MENU_DIALOG_ID));
    }
}
