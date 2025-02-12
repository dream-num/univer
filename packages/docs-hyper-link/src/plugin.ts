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
import type { IUniverDocsHyperLinkConfig } from './controllers/config.schema';
import { ICommandService, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { AddHyperLinkMuatation, DeleteHyperLinkMuatation, UpdateHyperLinkMuatation } from './commands/mutations/hyper-link.mutation';
import { defaultPluginConfig, DOCS_HYPER_LINK_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DOC_HYPER_LINK_PLUGIN, DocHyperLinkResourceController } from './controllers/resource.controller';

export class UniverDocsHyperLinkPlugin extends Plugin {
    static override pluginName = DOC_HYPER_LINK_PLUGIN;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsHyperLinkConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(DOCS_HYPER_LINK_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const deps: Dependency[] = [[DocHyperLinkResourceController]];
        deps.forEach((dep) => this._injector.add(dep));

        [AddHyperLinkMuatation, DeleteHyperLinkMuatation, UpdateHyperLinkMuatation].forEach((mutation) => {
            this.disposeWithMe(this._commandService.registerCommand(mutation));
        });

        this._injector.get(DocHyperLinkResourceController);
    }
}
