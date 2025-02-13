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
import type { IUniverSheetsSortUIConfig } from './controllers/config.schema';
import {
    DependentOn,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { defaultPluginConfig, SHEETS_SORT_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsSortUIController } from './controllers/sheets-sort-ui.controller';
import { SheetsSortUIService } from './services/sheets-sort-ui.service';

const NAME = 'SHEET_SORT_UI_PLUGIN';

@DependentOn(UniverSheetsSortPlugin)
export class UniverSheetsSortUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = NAME;

    constructor(
        private readonly _config: Partial<IUniverSheetsSortUIConfig> = defaultPluginConfig,
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
        this._configService.setConfig(SHEETS_SORT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsSortUIService],
            [SheetsSortUIController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onRendered(): void {
        this._injector.get(SheetsSortUIController);
    }
}
