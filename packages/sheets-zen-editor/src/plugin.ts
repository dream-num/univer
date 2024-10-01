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

import { IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';

import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { ZenEditorController } from './controllers/zen-editor.controller';
import { ZenEditorUIController } from './controllers/zen-editor-ui.controller';
import { IZenEditorManagerService, ZenEditorManagerService } from './services/zen-editor.service';
import type { IUniverSheetsZenEditorConfig } from './controllers/config.schema';

export class UniverSheetsZenEditorPlugin extends Plugin {
    static override pluginName = 'SHEET_ZEN_EDITOR_PLUGIN';
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsZenEditorConfig> = defaultPluginConfig,
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

        this._initializeDependencies(this._injector);
    }

    private _initializeDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            [ZenEditorUIController],
            [ZenEditorController],
            [IZenEditorManagerService, { useClass: ZenEditorManagerService }],
        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
