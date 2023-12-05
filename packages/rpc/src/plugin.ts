import { Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import { DataSyncPrimaryController } from './controllers/data-sync/data-sync-primary.controller';
import { DataSyncReplicaController } from './controllers/data-sync/data-sync-replica.controller';
import {
    createWebWorkerMessagePortOnMain,
    createWebWorkerMessagePortOnWorker,
} from './services/rpc/implementations/web-worker-rpc.service';
import {
    IRemoteInstanceService,
    IRemoteSyncService,
    RemoteInstanceReplicaService,
    RemoteInstanceServiceName,
    RemoteSyncPrimaryService,
    RemoteSyncServiceName,
} from './services/remote-instance/remote-instance.service';
import { fromModule, toModule } from './services/rpc/rpc.service';
import { IRPChannelService } from '.';
import { ChannelService } from './services/rpc/channel.service';

export interface IUniverRPCMainThreadPluginConfig {
    workerURL: string | URL;
    unsyncMutations?: Set<string>;
}

/**
 * This plugin is used to register the RPC services on the main thread. It
 * is also responsible for booting up the Web Worker instance of Univer.
 */
export class UniverRPCMainThreadPlugin extends Plugin {
    static override type = PluginType.Univer;

    constructor(
        private readonly _config: IUniverRPCMainThreadPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super('UNIVER_RPC_MAIN_THREAD_PLUGIN');
    }

    override async onStarting(injector: Injector): Promise<void> {
        const worker = new Worker(this._config.workerURL);
        const messageProtocol = createWebWorkerMessagePortOnMain(worker);
        const dependencies: Dependency[] = [
            [
                IRPChannelService,
                {
                    useFactory: () => new ChannelService(messageProtocol),
                },
            ],
            [
                DataSyncPrimaryController,
                {
                    useFactory: () =>
                        injector.createInstance(DataSyncPrimaryController, this._config?.unsyncMutations ?? new Set()),
                },
            ],
            [IRemoteSyncService, { useClass: RemoteSyncPrimaryService }],
        ];
        dependencies.forEach((dependency) => injector.add(dependency));
    }
}

export interface IUniverRPCWorkerThreadPluginConfig {}

/**
 * This plugin is used to register the RPC services on the worker thread.
 */
export class UniverRPCWorkerThreadPlugin extends Plugin {
    static override type = PluginType.Univer;

    constructor(
        private readonly _config: UniverRPCWorkerThreadPlugin,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super('UNIVER_RPC_WORKER_THREAD_PLUGIN');
    }

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = [
            [DataSyncReplicaController],
            [
                IRPChannelService,
                {
                    useFactory: () => new ChannelService(createWebWorkerMessagePortOnWorker()),
                },
            ],
            [IRemoteInstanceService, { useClass: RemoteInstanceReplicaService }],
        ];
        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
