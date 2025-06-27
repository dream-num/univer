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
import type { IMessageProtocol } from '@univerjs/rpc';
import type { Serializable } from 'node:child_process';
import type { IUniverRPCNodeMainConfig, IUniverRPCNodeWorkerThreadConfig } from './controllers/config.schema';
import { fork } from 'node:child_process';
import process from 'node:process';
import { IConfigService, ILogService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import {
    ChannelService,
    DataSyncPrimaryController,
    DataSyncReplicaController,
    IRemoteInstanceService,
    IRemoteSyncService,
    IRPCChannelService,
    RemoteSyncPrimaryService,
    WebWorkerRemoteInstanceService,
} from '@univerjs/rpc';
import { Observable, shareReplay } from 'rxjs';
import { defaultPluginMainThreadConfig, defaultPluginWorkerThreadConfig, PLUGIN_CONFIG_KEY_MAIN_THREAD, PLUGIN_CONFIG_KEY_WORKER_THREAD } from './controllers/config.schema';

export class UniverRPCNodeMainPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_NODE_MAIN_PLUGIN';

    constructor(
        private readonly _config: Partial<IUniverRPCNodeMainConfig> = defaultPluginMainThreadConfig,
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

    override onStarting(): void {
        const { workerSrc } = this._config;
        if (!workerSrc) {
            throw new Error('[UniverRPCNodeMainPlugin] workerSrc is required for UniverRPCNodeMainPlugin');
        }

        const messageProtocol = createNodeMessagePortOnMain(this._injector, workerSrc);

        const dependencies: Dependency[] = [
            [IRPCChannelService, {
                useFactory: () => new ChannelService(messageProtocol),
            }],
            [DataSyncPrimaryController],
            [IRemoteSyncService, { useClass: RemoteSyncPrimaryService }],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));

        this._injector.get(DataSyncPrimaryController);
    }
}

export class UniverRPCNodeWorkerPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_NODE_WORKER_PLUGIN';

    constructor(
        private readonly _config: Partial<IUniverRPCNodeWorkerThreadConfig> = defaultPluginWorkerThreadConfig,
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
        ([
            [DataSyncReplicaController],
            [IRPCChannelService, {
                useFactory: () => new ChannelService(createNodeWorkerMessageProtocol()),
            }],
            [IRemoteInstanceService, { useClass: WebWorkerRemoteInstanceService }],
        ] as Dependency[]).forEach((d) => this._injector.add(d));

        this._injector.get(DataSyncReplicaController);
    }
}

function createNodeMessagePortOnMain(injector: Injector, path: string): IMessageProtocol {
    const logService = injector.get(ILogService);

    const child = fork(path);
    child.on('spawn', () => logService.log('Child computing process spawned!'));
    child.on('error', (error) => logService.error(error));

    const messageProtocol: IMessageProtocol = {
        send(message: unknown): void {
            child.send(message as Serializable);
        },
        onMessage: new Observable<unknown>((subscriber) => {
            const handler = (message: unknown) => {
                subscriber.next(message);
            };

            child.on('message', handler);
            return () => child.off('message', handler);
        }).pipe(shareReplay(1)),
    };

    return messageProtocol;
}

function createNodeWorkerMessageProtocol(): IMessageProtocol {
    return {
        send(message) {
            process.send!(message as Serializable);
        },
        onMessage: new Observable<unknown>((subscriber) => {
            const handler = (event: unknown) => {
                subscriber.next(event);
            };

            process.on('message', handler);
            return () => process.off('message', handler);
        }).pipe(shareReplay(1)),
    };
}
