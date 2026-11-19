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
import { IConfigService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import type { IUniverRPCWorkerThreadConfig } from './config/config';
import pkg from '../package.json';
import { defaultPluginWorkerThreadConfig, PLUGIN_CONFIG_KEY_WORKER_THREAD } from './config/config';
import { DataSyncReplicaController } from './controllers/data-sync/data-sync-replica.controller';
import {
    IRemoteInstanceService,
    WebWorkerRemoteInstanceService,
} from './services/remote-instance/remote-instance.service';
import { ChannelService, IRPCChannelService } from './services/rpc/channel.service';
import { createWebWorkerMessagePortOnWorker } from './services/rpc/implementations/web-worker-rpc.service';

/**
 * This plugin is used to register the RPC services on the worker thread.
 */
export class UniverRPCWorkerThreadPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_WORKER_THREAD_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;

    constructor(
        private readonly _config: Partial<IUniverRPCWorkerThreadConfig> = defaultPluginWorkerThreadConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginWorkerThreadConfig,
            this._config
        );
        this._configService.setConfig(PLUGIN_CONFIG_KEY_WORKER_THREAD, rest);
    }

    override onStarting(): void {
        (
            [
                [DataSyncReplicaController],
                [
                    IRPCChannelService,
                    {
                        useFactory: function createChannelService() {
                            return new ChannelService(createWebWorkerMessagePortOnWorker());
                        },
                    },
                ],
                [IRemoteInstanceService, { useClass: WebWorkerRemoteInstanceService }],
            ] as Dependency[]
        ).forEach((dependency) => this._injector.add(dependency));

        this._injector.get(DataSyncReplicaController);
    }
}
