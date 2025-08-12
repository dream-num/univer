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

import type { ITableDefaultThemeStyle, IUniverSheetsTableConfig } from './config.schema';

import { Disposable, IConfigService, Inject } from '@univerjs/core';

import { RangeThemeStyle, SheetRangeThemeModel, SheetRangeThemeService } from '@univerjs/sheets';
import { TableManager } from '../model/table-manager';
import { SHEETS_TABLE_PLUGIN_CONFIG_KEY } from './config.schema';
import { tableThemeConfig } from './table-theme.factory';

export class SheetsTableThemeController extends Disposable {
    private _defaultThemeIndex: number = 0;
    private _allThemes: ITableDefaultThemeStyle[] = [];

    constructor(
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(SheetRangeThemeService) private _sheetRangeThemeService: SheetRangeThemeService,
        @Inject(SheetRangeThemeModel) private _sheetRangeThemeModel: SheetRangeThemeModel,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
        this._initUserTableTheme();
        this.registerTableChangeEvent();
        this._initDefaultTableTheme();
    }

    registerTableChangeEvent() {
        this.disposeWithMe(
            this._tableManager.tableAdd$.subscribe((event) => {
                const { range, tableId, unitId, subUnitId } = event;
                const table = this._tableManager.getTable(unitId, tableId)!;
                const tableStyleId = this._allThemes[this._defaultThemeIndex].name;
                table.setTableStyleId(tableStyleId);
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
                let tableStyleId = table.getTableStyleId();
                if (!tableStyleId) {
                    tableStyleId = this._allThemes[this._defaultThemeIndex].name;
                    table.setTableStyleId(tableStyleId);
                }
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
                const { range, unitId, subUnitId, tableStyleId = this._allThemes[this._defaultThemeIndex].name } = event;
                this._sheetRangeThemeService.removeRangeThemeRule(tableStyleId, {
                    unitId,
                    subUnitId,
                    range: { ...range },
                });
            })
        );
    }

    private _initUserTableTheme() {
        const tableConfig: IUniverSheetsTableConfig = this._configService.getConfig(SHEETS_TABLE_PLUGIN_CONFIG_KEY) || {};

        const defaultThemeIndex = tableConfig.defaultThemeIndex || 0;
        const userThemes = tableConfig.userThemes || [];

        this._defaultThemeIndex = defaultThemeIndex;
        this._allThemes = userThemes.concat(tableThemeConfig);
    }

    private _initDefaultTableTheme() {
        for (let i = 0; i < this._allThemes.length; i++) {
            const { name, style } = this._allThemes[i];
            const rangeThemeStyle = new RangeThemeStyle(name, style);
            this._sheetRangeThemeModel.registerDefaultRangeTheme(rangeThemeStyle);
        }
    }

    override dispose() {
        super.dispose();
        this._allThemes = [];
        this._defaultThemeIndex = 0;
    }
}
