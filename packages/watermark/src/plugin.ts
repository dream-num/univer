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
import { IConfigService, Inject, Injector, Plugin } from '@univerjs/core';
import { type IUniverWatermarkConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { UniverWatermarkMenuController } from './controllers/watermark.menu.controller';

const PLUGIN_NAME = 'UNIVER_WATERMARK_PLUGIN';

export class UniverWatermarkPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    private _dependencies = [UniverWatermarkMenuController];

    constructor(
        private readonly _config: Partial<IUniverWatermarkConfig> = {},
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
        this._initDependencies();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    private _initDependencies(): void {
        ([this._dependencies] as Dependency[]).forEach((d) => {
            this._injector.add(d);
        });
    }

    override onStarting(): void {
        const injector = this._injector;
        this._dependencies.forEach((d) => injector.get(d));
    }
}
