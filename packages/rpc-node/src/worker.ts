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
import { IConfigService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import {
    ChannelService,
    DataSyncReplicaController,
    IRemoteInstanceService,
    IRPCChannelService,
    WebWorkerRemoteInstanceService,
} from '@univerjs/rpc';
import process from 'node:process';
import { Observable, shareReplay } from 'rxjs';
import type { IUniverRPCNodeWorkerThreadConfig } from './config/config';
import pkg from '../package.json';
import { defaultPluginWorkerThreadConfig, PLUGIN_CONFIG_KEY_WORKER_THREAD } from './config/config';

export class UniverRPCNodeWorkerPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_NODE_WORKER_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;

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
                useFactory: function createChannelService() {
                    return new ChannelService(createNodeWorkerMessageProtocol());
                },
            }],
            [IRemoteInstanceService, { useClass: WebWorkerRemoteInstanceService }],
        ] as Dependency[]).forEach((d) => this._injector.add(d));

        this._injector.get(DataSyncReplicaController);
    }
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
        }).pipe(shareReplay({ bufferSize: 1, refCount: true })),
    };
}
