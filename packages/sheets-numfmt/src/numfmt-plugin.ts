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

import type { IUniverSheetsNumfmtConfig } from './controllers/config.schema';
import { DependentOn, ICommandService, IConfigService, Inject, Injector, merge, Plugin, registerDependencies, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { SHEET_NUMFMT_PLUGIN } from './base/const/plugin-name';
import { AddDecimalCommand } from './commands/commands/add-decimal.command';
import { SetCurrencyCommand } from './commands/commands/set-currency.command';
import { SetNumfmtCommand } from './commands/commands/set-numfmt.command';
import { SetPercentCommand } from './commands/commands/set-percent.command';
import { SubtractDecimalCommand } from './commands/commands/subtract-decimal.command';
import { defaultPluginConfig, SHEETS_NUMFMT_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsNumfmtCellContentController } from './controllers/numfmt-cell-content.controller';
import { NumfmtCurrencyController } from './controllers/numfmt-currency.controller';
import { MenuCurrencyService } from './service/menu.currency.service';

@DependentOn(UniverSheetsPlugin)
export class UniverSheetsNumfmtPlugin extends Plugin {
    static override pluginName = SHEET_NUMFMT_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsNumfmtConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );

        this._configService.setConfig(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [SheetsNumfmtCellContentController],
            [MenuCurrencyService],
            [NumfmtCurrencyController],
        ]);

        touchDependencies(this._injector, [
            [SheetsNumfmtCellContentController],
        ]);
    }

    override onRendered(): void {
        touchDependencies(this._injector, [
            [NumfmtCurrencyController],
        ]);

        [
            AddDecimalCommand,
            SubtractDecimalCommand,
            SetCurrencyCommand,
            SetPercentCommand,
            SetNumfmtCommand,
        ].forEach((config) => {
            this.disposeWithMe(this._commandService.registerCommand(config));
        });
    }
}
