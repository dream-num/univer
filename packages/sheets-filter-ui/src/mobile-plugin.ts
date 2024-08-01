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

import { DependentOn, Inject, Injector, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';

import type { IUniverSheetsFilterUIConfig } from './controllers/sheets-filter-ui.controller';
import { DefaultSheetFilterUiConfig } from './controllers/sheets-filter-ui.controller';
import { SheetsFilterPermissionController } from './controllers/sheets-filter-permission.controller';
import { SheetsFilterMobileUIController } from './controllers/sheets-filter-mobile-ui.controller';

const NAME = 'SHEET_FILTER_UI_PLUGIN';

@DependentOn(UniverSheetsFilterPlugin)
export class UniverSheetsFilterMobileUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = NAME;

    constructor(
        private readonly _config: Partial<IUniverSheetsFilterUIConfig> = {},
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultSheetFilterUiConfig, this._config);
    }

    override onStarting(): void {
        ([
            [SheetsFilterPermissionController],
            [SheetsFilterMobileUIController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }
}
