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
import type {
    IUniverRPCMainThreadConfig,
    IUniverRPCWorkerThreadConfig,
} from './controllers/config.schema';
import { IConfigService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import {
    defaultPluginMainThreadConfig,
    defaultPluginWorkerThreadConfig,
    PLUGIN_CONFIG_KEY_MAIN_THREAD,
    PLUGIN_CONFIG_KEY_WORKER_THREAD,
} from './controllers/config.schema';
import { DataSyncPrimaryController } from './controllers/data-sync/data-sync-primary.controller';
import { DataSyncReplicaController } from './controllers/data-sync/data-sync-replica.controller';
import {
    IRemoteInstanceService,
    IRemoteSyncService,
    RemoteSyncPrimaryService,
    WebWorkerRemoteInstanceService,
} from './services/remote-instance/remote-instance.service';
import { ChannelService, IRPCChannelService } from './services/rpc/channel.service';
import {
    createWebWorkerMessagePortOnMain,
    createWebWorkerMessagePortOnWorker,
} from './services/rpc/implementations/web-worker-rpc.service';

/**
 * This plugin is used to register the RPC services on the main thread. It
 * is also responsible for booting up the Web Worker instance of Univer.
 */
export class UniverRPCMainThreadPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_MAIN_THREAD_PLUGIN';

    private _internalWorker: Worker | null = null;

    constructor(
        private readonly _config: Partial<IUniverRPCMainThreadConfig> = defaultPluginMainThreadConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginMainThreadConfig,
            this._config
        );
        this._configService.setConfig(PLUGIN_CONFIG_KEY_MAIN_THREAD, rest);
    }

    override dispose(): void {
        super.dispose();

        if (this._internalWorker) {
            this._internalWorker.terminate();
            this._internalWorker = null;
        }
    }

    override onStarting(): void {
        const { workerURL } = this._config;
        if (!workerURL) {
            throw new Error('[UniverRPCMainThreadPlugin]: The workerURL is required for the RPC main thread plugin.');
        }

        const worker = workerURL instanceof Worker ? workerURL : new Worker(workerURL);
        this._internalWorker = workerURL instanceof Worker ? null : worker;

        const messageProtocol = createWebWorkerMessagePortOnMain(worker);
        const dependencies: Dependency[] = [
            [
                IRPCChannelService,
                {
                    useFactory: () => new ChannelService(messageProtocol),
                },
            ],
            [DataSyncPrimaryController],
            [IRemoteSyncService, { useClass: RemoteSyncPrimaryService }],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));

        // let DataSyncPrimaryController to be initialized and registering other modules
        this._injector.get(DataSyncPrimaryController);
    }
}

/**
 * This plugin is used to register the RPC services on the worker thread.
 */
export class UniverRPCWorkerThreadPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_WORKER_THREAD_PLUGIN';

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
                        useFactory: () => new ChannelService(createWebWorkerMessagePortOnWorker()),
                    },
                ],
                [IRemoteInstanceService, { useClass: WebWorkerRemoteInstanceService }],
            ] as Dependency[]
        ).forEach((dependency) => this._injector.add(dependency));

        this._injector.get(DataSyncReplicaController);
    }
}
