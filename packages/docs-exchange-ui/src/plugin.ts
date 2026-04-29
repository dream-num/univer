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
import type { IUniverDocsExchangeUIConfig } from './config/config';
import {
    DependentOn,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import pkg from '../package.json';
import { defaultPluginConfig, DOCS_EXCHANGE_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { DocsExchangeUIController } from './controllers/docs-exchange-ui.controller';

@DependentOn(UniverUIPlugin, UniverDocsUIPlugin)
export class UniverDocsExchangeUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_DOC;
    static override pluginName = 'DOCS_EXCHANGE_UI_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;

    constructor(
        private readonly _config: Partial<IUniverDocsExchangeUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(DOCS_EXCHANGE_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const dependencies: Dependency[] = [
            [DocsExchangeUIController],
        ];
        dependencies.forEach((dependency) => this._injector.add(dependency));

        this._injector.get(DocsExchangeUIController);
    }
}
