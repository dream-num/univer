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

import { SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, UNIVER_SHEET_TABLE_FILTER_PANEL_ID } from '../../const';
import { SheetsTableComponentController } from '../sheet-table-component.controller';

export class SheetsTableMobileComponentController extends SheetsTableComponentController {
    protected override _openFilterPopup(): void {
        if (!this.getCurrentTableFilterInfo()) {
            throw new Error('[SheetsFilterUIController]: no filter model when opening filter popup!');
        }

        this._dialogService.open({
            id: UNIVER_SHEET_TABLE_FILTER_PANEL_ID,
            title: { title: 'sheets-table-ui.filter.title' },
            children: { label: SHEETS_TABLE_FILTER_PANEL_OPENED_KEY },
            onClose: () => {
                this._contextService.setContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
            },
        });
    }
}
