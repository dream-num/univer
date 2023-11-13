import { Plugin, PluginType } from '@univerjs/core';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import {
    createWebWorkerMessagePortOnMain,
    createWebWorkerMessagePortOnWorker,
} from './services/implementations/web-worker-message-port';
import { ChannelClient, ChannelServer, fromModule, toModule } from './services/rpc/rpc.service';

export interface IUniverRPCMainThreadPluginConfig {
    workerURL: string | URL;
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

        // Register services / controllers here over RPC.
        injector.add([ITestService, { useValue: toModule<ITestService>(client.getChannel('test')) }]);
        const name = await this._injector.get<ITestService>(ITestService).getName();
        console.log('debug', name);
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

    override onStarting(): void {
        const messageProtocol = createWebWorkerMessagePortOnWorker();
        const server = new ChannelServer(messageProtocol);

        server.registerChannel(
            'test',
            fromModule({
                getName(): Promise<string> {
                    return Promise.resolve('Univer');
                },
            })
        );
    }
}
