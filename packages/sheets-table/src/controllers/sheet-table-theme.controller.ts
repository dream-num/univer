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

import { Disposable, Inject } from '@univerjs/core';

import { RangeThemeStyle, SheetRangeThemeModel, SheetRangeThemeService } from '@univerjs/sheets';

import { TableManager } from '../model/table-manager';
import { tableThemeConfig } from './table-theme.factory';

export class SheetsTableThemeController extends Disposable {
    constructor(
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(SheetRangeThemeService) private _sheetRangeThemeService: SheetRangeThemeService,
        @Inject(SheetRangeThemeModel) private _sheetRangeThemeModel: SheetRangeThemeModel
    ) {
        super();
        this.registerTableChangeEvent();
        this._initDefaultTableTheme();
    }

    registerTableChangeEvent() {
        this.disposeWithMe(
            this._tableManager.tableAdd$.subscribe((event) => {
                const { range, tableId, unitId, subUnitId } = event;
                const table = this._tableManager.getTable(unitId, tableId)!;
                const tableStyleId = table.getTableStyleId() || tableThemeConfig[0].name;
                this._sheetRangeThemeService.registerRangeThemeStyle(tableStyleId, {
                    unitId,
                    subUnitId,
                    range: { ...range },
                });
            })
        );

        this.disposeWithMe(
            this._tableManager.tableRangeChanged$.subscribe((event) => {
                const { range, oldRange, tableId, unitId, subUnitId } = event;
                const table = this._tableManager.getTable(unitId, tableId)!;
                const tableStyleId = table.getTableStyleId() || tableThemeConfig[0].name;
                this._sheetRangeThemeService.removeRangeThemeRule(tableStyleId, {
                    unitId,
                    subUnitId,
                    range: { ...oldRange },
                });
                this._sheetRangeThemeService.registerRangeThemeStyle(tableStyleId, {
                    unitId,
                    subUnitId,
                    range: { ...range },
                });
            })
        );

        this.disposeWithMe(
            this._tableManager.tableThemeChanged$.subscribe((event) => {
                const { theme, oldTheme, tableId, unitId, subUnitId } = event;
                const table = this._tableManager.getTable(unitId, tableId)!;
                const range = table.getRange();
                this._sheetRangeThemeService.removeRangeThemeRule(oldTheme, {
                    unitId,
                    subUnitId,
                    range: { ...range },
                });
                this._sheetRangeThemeService.registerRangeThemeStyle(theme, {
                    unitId,
                    subUnitId,
                    range: { ...range },
                });
            })
        );

        this.disposeWithMe(
            this._tableManager.tableDelete$.subscribe((event) => {
                const { range, unitId, subUnitId, tableStyleId = tableThemeConfig[0].name } = event;
                this._sheetRangeThemeService.removeRangeThemeRule(tableStyleId, {
                    unitId,
                    subUnitId,
                    range: { ...range },
                });
            })
        );
    }

    private _initDefaultTableTheme() {
        for (let i = 0; i < tableThemeConfig.length; i++) {
            const { name, style } = tableThemeConfig[i];
            const rangeThemeStyle = new RangeThemeStyle(name, style);
            this._sheetRangeThemeModel.registerDefaultRangeTheme(rangeThemeStyle);
        }
    }

    override dispose() {
        super.dispose();
    }
}
