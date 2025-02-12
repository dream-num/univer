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
import type { IUniverSheetsFindReplaceConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { defaultPluginConfig, SHEETS_FIND_REPLACE_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsFindReplaceController } from './controllers/sheet-find-replace.controller';

const NAME = 'SHEET_FIND_REPLACE_PLUGIN';

@DependentOn(UniverSheetsPlugin, UniverSheetsPlugin, UniverFindReplacePlugin)
export class UniverSheetsFindReplacePlugin extends Plugin {
    static override pluginName = NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsFindReplaceConfig> = defaultPluginConfig,
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
        this._configService.setConfig(SHEETS_FIND_REPLACE_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([[SheetsFindReplaceController]] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onSteady(): void {
        this._injector.get(SheetsFindReplaceController);
    }
}
