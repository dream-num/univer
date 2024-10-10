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

import type { IUniverSheetsNumfmtConfig } from './controllers/config.schema';

import { DependentOn, IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { SHEET_NUMFMT_PLUGIN } from './base/const/PLUGIN_NAME';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsNumfmtCellContentController } from './controllers/numfmt.cell-content.controller';
import { NumfmtController } from './controllers/numfmt.controller';
import { NumfmtCurrencyController } from './controllers/numfmt.currency.controller';
import { NumfmtEditorController } from './controllers/numfmt.editor.controller';
import { NumfmtMenuController } from './controllers/numfmt.menu.controller';
import { INumfmtController } from './controllers/type';
import { UserHabitController } from './controllers/user-habit.controller';
import { MenuCurrencyService } from './service/menu.currency.service';

@DependentOn(UniverSheetsPlugin, UniverSheetsUIPlugin)
export class UniverSheetsNumfmtPlugin extends Plugin {
    static override pluginName = SHEET_NUMFMT_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsNumfmtConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._injector.add([INumfmtController, { useClass: NumfmtController, lazy: false }]);
        this._injector.add([NumfmtEditorController]);
        this._injector.add([UserHabitController]);
        this._injector.add([SheetsNumfmtCellContentController]);
        this._injector.add([MenuCurrencyService]);
        this._injector.add([NumfmtCurrencyController]);
        this._injector.add([NumfmtMenuController]);
    }

    override onRendered(): void {
        this._injector.get(INumfmtController);
        this._injector.get(SheetsNumfmtCellContentController);
        this._injector.get(NumfmtCurrencyController);
        this._injector.get(NumfmtEditorController);
        this._injector.get(NumfmtMenuController);
    }
}
