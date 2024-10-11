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

import type { Dependency } from '@univerjs/core';
import type { IMessageProtocol } from '@univerjs/rpc';
import type { Serializable } from 'node:child_process';
import process from 'node:process';
import { IConfigService, Inject, Injector, Plugin } from '@univerjs/core';
import { ChannelService,
    DataSyncPrimaryController,
    DataSyncReplicaController,
    IRemoteInstanceService,
    IRemoteSyncService,
    IRPCChannelService,
    RemoteSyncPrimaryService,
    WebWorkerRemoteInstanceService,
} from '@univerjs/rpc';
import { Observable, shareReplay } from 'rxjs';

export interface IUniverRPCNodeMainConfig {
    messageProtocol: IMessageProtocol;
}

const UNIVER_RPC_NODE_MAIN_PLUGIN_CONFIG_KEY = 'node-rpc.main.config';

export class UniverRPCNodeMainPlugin extends Plugin {
    static override pluginName = 'UNIVER_RPC_NODE_MAIN_PLUGIN';

    constructor(
        private readonly _config: IUniverRPCNodeMainConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        this._configService.setConfig(UNIVER_RPC_NODE_MAIN_PLUGIN_CONFIG_KEY, this._config);
    }

    override onStarting(): void {
        const dependencies: Dependency[] = [
            [IRPCChannelService, {
                useFactory: () => new ChannelService(this._config.messageProtocol),
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
        private readonly _config: undefined,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(_injector?: Injector): void {
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

function createNodeWorkerMessageProtocol(): IMessageProtocol {
    return {
        send(message) {
            process.send!(message as Serializable);
        },
        onMessage: new Observable<any>((subscriber) => {
            const handler = (event: unknown) => {
                subscriber.next(event);
            };

            process.on('message', handler);
            return () => process.off('message', handler);
        }).pipe(shareReplay(1)),
    };
}
