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

import { ICommandService, IConfigService, Inject, Injector, merge, Plugin, registerDependencies, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { AddSheetTableCommand } from './commands/commands/add-sheet-table.command';
import { AddTableThemeCommand } from './commands/commands/add-table-theme.command';
import { DeleteSheetTableCommand } from './commands/commands/delete-sheet-table.command';
import { RemoveTableThemeCommand } from './commands/commands/remove-table-theme.command';
import { SetSheetTableCommand } from './commands/commands/set-sheet-table.command';
import { SetSheetTableFilterCommand } from './commands/commands/set-table-filter.command';
import { SheetTableInsertColCommand, SheetTableInsertRowCommand, SheetTableRemoveColCommand, SheetTableRemoveRowCommand } from './commands/commands/sheet-table-row-col.command';
import { AddSheetTableMutation } from './commands/mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from './commands/mutations/delete-sheet-table.mutation';
import { SetSheetTableMutation } from './commands/mutations/set-sheet-table.mutation';
import { SetSheetTableFilterMutation } from './commands/mutations/set-table-filter.mutation';
import { PLUGIN_NAME } from './const';
import { defaultPluginConfig, SHEETS_TABLE_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetTableRangeController } from './controllers/sheet-table-range.controller';
import { SheetTableRefRangeController } from './controllers/sheet-table-ref-range.controller';
import { SheetsTableThemeController } from './controllers/sheet-table-theme.controller';
import { SheetsTableController } from './controllers/sheets-table.controller';
import { TableFilterController } from './controllers/table-filter.controller';
import { TableManager } from './model/table-manager';
import { SheetTableService } from './services/table-service';

export class UniverSheetsTablePlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(SHEETS_TABLE_PLUGIN_CONFIG_KEY, rest);

        this._initRegisterCommand();
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [TableManager],
            [SheetsTableThemeController],
            [SheetsTableController],
            [SheetTableService],
            [TableFilterController],
            [SheetTableRangeController],
            [SheetTableRefRangeController],
        ]);

        touchDependencies(this._injector, [
            [SheetTableRangeController],
            [SheetTableRefRangeController],
            [SheetsTableThemeController],
            [SheetsTableController],
            [SheetTableService],
            [TableFilterController],
        ]);
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [TableManager],
        ]);
    }

    private _initRegisterCommand() {
        [
            AddSheetTableCommand,
            AddSheetTableMutation,
            DeleteSheetTableCommand,
            DeleteSheetTableMutation,
            SetSheetTableFilterMutation,
            SetSheetTableFilterCommand,
            SetSheetTableCommand,
            SetSheetTableMutation,
            AddTableThemeCommand,
            RemoveTableThemeCommand,
            SheetTableInsertRowCommand,
            SheetTableInsertColCommand,
            SheetTableRemoveRowCommand,
            SheetTableRemoveColCommand,
        ].forEach((m) => this._commandService.registerCommand(m));
    }
}
