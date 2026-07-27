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

import type { IUniverDocsFindReplaceConfig } from './config/config';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import pkg from '../package.json';
import { defaultPluginConfig, DOCS_FIND_REPLACE_PLUGIN_CONFIG_KEY } from './config/config';
import { DocsFindReplaceController } from './controllers/docs-find-replace.controller';
import { DocsFindReplaceProvider } from './services/docs-find-replace.provider';

@DependentOn(UniverDocsPlugin, UniverRenderEnginePlugin, UniverDocsUIPlugin, UniverFindReplacePlugin)
export class UniverDocsFindReplacePlugin extends Plugin {
    static override pluginName = 'DOCS_FIND_REPLACE_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsFindReplaceConfig> = defaultPluginConfig,
        @Inject(Injector) protected override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(DOCS_FIND_REPLACE_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._injector.add([DocsFindReplaceProvider]);
        this._injector.add([DocsFindReplaceController]);
    }

    override onSteady(): void {
        this._injector.get(DocsFindReplaceController);
    }
}
