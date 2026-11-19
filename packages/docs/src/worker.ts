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

import { IConfigService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import type { IUniverDocsWorkerConfig } from './config/config';
import pkg from '../package.json';
import { defaultPluginWorkerConfig, DOCS_WORKER_PLUGIN_CONFIG_KEY } from './config/config';
import { startDocsLayoutWorker } from './layout-worker/worker';

export class UniverDocsWorkerPlugin extends Plugin {
    static override pluginName = 'UNIVER_DOCS_WORKER_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;

    constructor(
        private readonly _config: IUniverDocsWorkerConfig = defaultPluginWorkerConfig,
        @Inject(Injector) protected override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
        const { ...rest } = merge({}, defaultPluginWorkerConfig, this._config);
        this._configService.setConfig(DOCS_WORKER_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this.disposeWithMe(startDocsLayoutWorker());
    }
}
