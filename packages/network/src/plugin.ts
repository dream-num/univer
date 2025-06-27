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

import type { IUniverNetworkConfig } from './controllers/config.schema';
import { IConfigService, ILogService, Inject, Injector, LookUp, merge, mergeOverrideWithDependencies, Plugin, Quantity, registerDependencies } from '@univerjs/core';
import { defaultPluginConfig, NETWORK_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { HTTPService } from './services/http/http.service';
import { FetchHTTPImplementation } from './services/http/implementations/fetch';
import { IHTTPImplementation } from './services/http/implementations/implementation';
import { XHRHTTPImplementation } from './services/http/implementations/xhr';

/**
 * This plugin add network services to the Univer instance.
 */
export class UniverNetworkPlugin extends Plugin {
    static override pluginName = 'UNIVER_NETWORK_PLUGIN';

    constructor(
        private readonly _config: Partial<IUniverNetworkConfig> = defaultPluginConfig,
        @ILogService private readonly _logger: ILogService,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(NETWORK_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const parent = this._injector.get(HTTPService, Quantity.OPTIONAL, LookUp.SKIP_SELF);
        if (parent && !this._config?.forceUseNewInstance) {
            this._logger.warn(
                '[UniverNetworkPlugin]',
                'HTTPService is already registered in an ancestor interceptor. Skipping registration. ' +
                'If you want to force a new instance, set "forceUseNewInstance" to true in the plugin configuration.'
            );
            return;
        }

        const impl = this._config?.useFetchImpl
            ? FetchHTTPImplementation
            : typeof window !== 'undefined'
                ? XHRHTTPImplementation
                : FetchHTTPImplementation;

        registerDependencies(this._injector, mergeOverrideWithDependencies([
            [HTTPService],
            [IHTTPImplementation, { useClass: impl }],
        ], this._config?.override));
    }
}
