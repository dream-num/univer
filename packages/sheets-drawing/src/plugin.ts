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
import type { IUniverSheetsDrawingConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { defaultPluginConfig, SHEETS_DRAWING_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SHEET_DRAWING_PLUGIN, SheetsDrawingLoadController } from './controllers/sheet-drawing.controller';
import { ISheetDrawingService, SheetDrawingService } from './services/sheet-drawing.service';

@DependentOn(UniverDrawingPlugin)
export class UniverSheetsDrawingPlugin extends Plugin {
    static override pluginName = SHEET_DRAWING_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsDrawingConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(SHEETS_DRAWING_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsDrawingLoadController],
            [ISheetDrawingService, { useClass: SheetDrawingService }],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

        this._injector.get(SheetsDrawingLoadController);
    }
}
