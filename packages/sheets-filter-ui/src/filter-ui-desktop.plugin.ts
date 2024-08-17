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

import { DependentOn, Inject, Injector, Optional, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { IRPCChannelService, toModule } from '@univerjs/rpc';
import type { IUniverSheetsFilterUIConfig } from './controllers/sheets-filter-ui-desktop.controller';
import { DefaultSheetFilterUiConfig, SheetsFilterUIDesktopController } from './controllers/sheets-filter-ui-desktop.controller';
import { SheetsFilterPanelService } from './services/sheets-filter-panel.service';
import { SheetsFilterPermissionController } from './controllers/sheets-filter-permission.controller';
import { ISheetsGenerateFilterValuesService, SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME } from './worker/generate-filter-values.service';

const NAME = 'SHEET_FILTER_UI_PLUGIN';

@DependentOn(UniverSheetsFilterPlugin)
export class UniverSheetsFilterUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = NAME;

    constructor(
        private readonly _config: Partial<IUniverSheetsFilterUIConfig> = {},
        @Inject(Injector) protected readonly _injector: Injector,
        @Optional(IRPCChannelService) private readonly _rpcChannelService?: IRPCChannelService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultSheetFilterUiConfig, this._config);
    }

    override onStarting(): void {
        ([
            [SheetsFilterPanelService],
            [SheetsFilterPermissionController],
            [SheetsFilterUIDesktopController, {
                useFactory: () => this._injector.createInstance(SheetsFilterUIDesktopController, this._config),
            }],
        ] as Dependency[]).forEach((d) => this._injector.add(d));

        if (this._config.useRemoteFilterValuesGenerator && this._rpcChannelService) {
            this._injector.add([ISheetsGenerateFilterValuesService, {
                useFactory: () => toModule<ISheetsGenerateFilterValuesService>(
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
