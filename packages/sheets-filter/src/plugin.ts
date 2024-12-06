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

import type { Dependency } from '@univerjs/core';
import type { IUniverSheetsFilterConfig } from './controllers/config.schema';

import { IConfigService, Inject, Injector, merge, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { defaultPluginConfig, SHEETS_FILTER_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsFilterController } from './controllers/sheets-filter.controller';
import { SheetsFilterFormulaService } from './services/sheet-filter-formula.service';
import { SHEET_FILTER_SNAPSHOT_ID, SheetsFilterService } from './services/sheet-filter.service';

export class UniverSheetsFilterPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = SHEET_FILTER_SNAPSHOT_ID;

    constructor(
        private readonly _config: Partial<IUniverSheetsFilterConfig> = defaultPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(SHEETS_FILTER_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsFilterFormulaService],
            [SheetsFilterService],
            [SheetsFilterController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [SheetsFilterFormulaService],
            [SheetsFilterController],
        ]);
    }
}
