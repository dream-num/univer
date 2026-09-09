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

import type { IUniverSheetsSortUIConfig } from './config/config';
import {
    DependentOn,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    registerDependencies,
    touchDependencies,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsMobileUIPlugin } from '@univerjs/sheets-ui';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import pkg from '../package.json';
import { defaultPluginConfig, SHEETS_SORT_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { MobileComponentsController } from './controllers/mobile/components.controller';
import { SheetsSortMobileUIController } from './controllers/mobile/ui.controller';
import { SheetsSortUIService } from './services/sheets-sort-ui.service';

@DependentOn(UniverSheetsPlugin, UniverSheetsSortPlugin, UniverSheetsMobileUIPlugin, UniverMobileUIPlugin)
export class UniverSheetsSortMobileUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = 'SHEET_SORT_UI_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;

    constructor(
        private readonly _config: Partial<IUniverSheetsSortUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const { ...rest } = merge({}, defaultPluginConfig, this._config);
        this._configService.setConfig(SHEETS_SORT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [MobileComponentsController],
            [SheetsSortUIService],
            [SheetsSortMobileUIController],
        ]);
        touchDependencies(this._injector, [[MobileComponentsController]]);
    }

    override onRendered(): void {
        touchDependencies(this._injector, [[SheetsSortMobileUIController]]);
    }
}
