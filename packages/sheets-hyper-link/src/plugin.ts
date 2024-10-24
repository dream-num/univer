/**
 * Copyright 2023-present DreamNum Inc.
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
import type { IUniverSheetsHyperLinkConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsHyperLinkRefRangeController } from './controllers/ref-range.controller';
import { SheetsHyperLinkController } from './controllers/sheet-hyper-link.controller';
import { SheetsHyperLinkResourceController } from './controllers/sheet-hyper-link-resource.controller';
import { HyperLinkModel } from './models/hyper-link.model';
import { SHEET_HYPER_LINK_PLUGIN } from './types/const';

@DependentOn(UniverSheetsPlugin)
export class UniverSheetsHyperLinkPlugin extends Plugin {
    static override pluginName = SHEET_HYPER_LINK_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsHyperLinkConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = this._config;
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsHyperLinkResourceController],
            [SheetsHyperLinkController],
            [SheetsHyperLinkRefRangeController],
            [HyperLinkModel],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });

        this._injector.get(SheetsHyperLinkRefRangeController);
        this._injector.get(SheetsHyperLinkResourceController);
        this._injector.get(SheetsHyperLinkController);
    }
}
