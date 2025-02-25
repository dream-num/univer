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

import type { IUniverFindReplaceConfig } from './controllers/config.schema';
import { IConfigService, merge, Plugin } from '@univerjs/core';

import { type Dependency, Inject, Injector } from '@univerjs/core';
import { defaultPluginConfig, FIND_REPLACE_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { FindReplaceController } from './controllers/find-replace.controller';
import { FindReplaceService, IFindReplaceService } from './services/find-replace.service';

const PLUGIN_NAME = 'UNIVER_FIND_REPLACE_PLUGIN';

export class UniverFindReplacePlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverFindReplaceConfig> = defaultPluginConfig,
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
        this._configService.setConfig(FIND_REPLACE_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [FindReplaceController],
            [IFindReplaceService, { useClass: FindReplaceService }],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onRendered(): void {
        this._injector.get(FindReplaceController);
    }
}
