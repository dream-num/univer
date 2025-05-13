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
import type { IUniverSheetsFilterUIConfig } from './controllers/config.schema';
import {
    DependentOn,
    IConfigService,
    Inject,
    Injector,
    merge,
    Optional,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { IRPCChannelService, toModule } from '@univerjs/rpc';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { defaultPluginConfig, SHEETS_FILTER_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsFilterPermissionController } from './controllers/sheets-filter-permission.controller';
import { SheetsFilterUIDesktopController } from './controllers/sheets-filter-ui-desktop.controller';
import { SheetsFilterPanelService } from './services/sheets-filter-panel.service';
import { ISheetsGenerateFilterValuesService, SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME } from './worker/generate-filter-values.service';

const NAME = 'SHEET_FILTER_UI_PLUGIN';

/**
 * The plugin for the desktop version of the sheets filter UI. Its type is {@link UniverInstanceType.UNIVER_SHEET}.
 */
@DependentOn(UniverSheetsFilterPlugin)
export class UniverSheetsFilterUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = NAME;

    constructor(
        private readonly _config: Partial<IUniverSheetsFilterUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @Optional(IRPCChannelService) private readonly _rpcChannelService?: IRPCChannelService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(SHEETS_FILTER_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsFilterPanelService],
            [SheetsFilterPermissionController],
            [SheetsFilterUIDesktopController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));

        if (this._config.useRemoteFilterValuesGenerator && this._rpcChannelService) {
            this._injector.add([ISheetsGenerateFilterValuesService, {
                useFactory: (): ISheetsGenerateFilterValuesService =>
                    toModule<ISheetsGenerateFilterValuesService>(
                        this._rpcChannelService!.requestChannel(SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME)
                    ),
            }]);
        }
    }

    override onReady(): void {
        this._injector.get(SheetsFilterPermissionController);
    }

    override onRendered(): void {
        this._injector.get(SheetsFilterUIDesktopController);
    }
}
