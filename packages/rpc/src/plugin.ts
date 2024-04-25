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

import { Plugin } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

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

export interface IUniverRPCMainThreadConfig {
    workerURL: string | URL | Worker;
}

/**
 * This plugin is used to register the RPC services on the main thread. It
 * is also responsible for booting up the Web Worker instance of Univer.
 */
export class UniverRPCMainThreadPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_MAIN_THREAD_PLUGIN';

    constructor(
        private readonly _config: IUniverRPCMainThreadConfig,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override async onStarting(injector: Injector): Promise<void> {
        const { workerURL } = this._config;
        const worker = workerURL instanceof Worker ? workerURL : new Worker(workerURL);
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

        dependencies.forEach((dependency) => injector.add(dependency));

        // let DataSyncPrimaryController to be initialized and registering other modules
        injector.get(DataSyncPrimaryController);
    }
}

export interface IUniverRPCWorkerThreadPluginConfig {}

/**
 * This plugin is used to register the RPC services on the worker thread.
 */
export class UniverRPCWorkerThreadPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_WORKER_THREAD_PLUGIN';

    constructor(
        private readonly _config: IUniverRPCWorkerThreadPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
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
        ).forEach((dependency) => injector.add(dependency));

        injector.get(DataSyncReplicaController);
    }
}
