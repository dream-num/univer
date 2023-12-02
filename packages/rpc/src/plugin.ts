import { Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import { DataSyncPrimaryController } from './controllers/data-sync/data-sync-primary.controller';
import { DataSyncReplicaController } from './controllers/data-sync/data-sync-replica.controller';
import {
    createWebWorkerMessagePortOnMain,
    createWebWorkerMessagePortOnWorker,
} from './services/implementations/web-worker-rpc.service';
import {
    IRemoteInstanceService,
    IRemoteSyncService,
    RemoteInstanceReplicaService,
    RemoteInstanceServiceName,
    RemoteSyncPrimaryService,
    RemoteSyncServiceName,
} from './services/remote-instance/remote-instance.service';
import { ChannelClient, ChannelServer, fromModule, toModule } from './services/rpc/rpc.service';

export interface IUniverRPCMainThreadPluginConfig {
    workerURL: string | URL;
    unsyncMutations?: Set<string>;
}

interface ITestService {
    getName(): Promise<string>;
}
const ITestService = createIdentifier<ITestService>('ITestService');

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
        const client = new ChannelClient(messageProtocol);
        const server = new ChannelServer(messageProtocol);

        const dependencies: Dependency[] = [
            [
                DataSyncPrimaryController,
                {
                    useFactory: () =>
                        injector.createInstance(DataSyncPrimaryController, this._config?.unsyncMutations ?? new Set()),
                },
            ],
            [
                IRemoteInstanceService,
                { useFactory: () => toModule<IRemoteInstanceService>(client.getChannel(RemoteInstanceServiceName)) },
            ],
            [IRemoteSyncService, { useClass: RemoteSyncPrimaryService }],
        ];
        dependencies.forEach((dependency) => injector.add(dependency));

        server.registerChannel(RemoteSyncServiceName, fromModule(injector.get(IRemoteSyncService)));
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
        const messageProtocol = createWebWorkerMessagePortOnWorker();
        const client = new ChannelClient(messageProtocol);
        const server = new ChannelServer(messageProtocol);

        const dependencies: Dependency[] = [
            [DataSyncReplicaController],
            [
                IRemoteSyncService,
                { useFactory: () => toModule<IRemoteSyncService>(client.getChannel(RemoteSyncServiceName)) },
            ],
            [IRemoteInstanceService, { useClass: RemoteInstanceReplicaService }],
        ];
        dependencies.forEach((dependency) => injector.add(dependency));

        server.registerChannel(RemoteInstanceServiceName, fromModule(injector.get(IRemoteInstanceService)));
    }
}
