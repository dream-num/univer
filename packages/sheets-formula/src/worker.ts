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

import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula/worker';
import { fromModule, IRPCChannelService } from '@univerjs/rpc';
import type { IUniverSheetsFormulaRemoteConfig } from './config/config';
import pkg from '../package.json';
import { defaultPluginRemoteConfig, PLUGIN_CONFIG_KEY_REMOTE } from './config/config';
import {
    RemoteRegisterFunctionService,
    RemoteRegisterFunctionServiceName,
} from './services/remote/remote-register-function.service';

@DependentOn(UniverFormulaEnginePlugin)
export class UniverRemoteSheetsFormulaPlugin extends Plugin {
    static override pluginName = 'SHEET_FORMULA_REMOTE_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsFormulaRemoteConfig> = defaultPluginRemoteConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginRemoteConfig,
            this._config
        );
        this._configService.setConfig(PLUGIN_CONFIG_KEY_REMOTE, rest);
    }

    override onStarting(): void {
        this._injector.add([RemoteRegisterFunctionService]);
        this._injector.get(IRPCChannelService).registerChannel(
            RemoteRegisterFunctionServiceName,
            fromModule(this._injector.get(RemoteRegisterFunctionService))
        );
    }
}
