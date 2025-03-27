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

import type { IMutationInfo } from '@univerjs/core';
import type { IRemoteSyncMutationOptions } from '../../services/remote-instance/remote-instance.service';
import { CommandType, Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import {
    IRemoteInstanceService,
    IRemoteSyncService,
    RemoteInstanceServiceName,
    RemoteSyncServiceName,
} from '../../services/remote-instance/remote-instance.service';
import { IRPCChannelService } from '../../services/rpc/channel.service';
import { fromModule, toModule } from '../../services/rpc/rpc.service';

/**
 * This controller is responsible for syncing data from the worker thread to
 * the primary thread.
 */
export class DataSyncReplicaController extends Disposable {
    private _remoteSyncService!: IRemoteSyncService;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IRemoteInstanceService private readonly _remoteInstanceService: IRemoteInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRPCChannelService private readonly _rpcChannelService: IRPCChannelService
    ) {
        super();

        this._initRPCChannels();
        this._init();
    }

    private _initRPCChannels(): void {
        this._rpcChannelService.registerChannel(RemoteInstanceServiceName, fromModule(this._remoteInstanceService));

        this._injector.add([
            IRemoteSyncService,
            { useFactory: () => toModule<IRemoteSyncService>(this._rpcChannelService.requestChannel(RemoteSyncServiceName)) },
        ]);
        this._remoteSyncService = this._injector.get(IRemoteSyncService);
    }

    private _init(): void {
        this.disposeWithMe(
            // Mutations executed on the main thread should be synced to the worker thread.
            this._commandService.onCommandExecuted((commandInfo, options) => {
                if (commandInfo.type === CommandType.MUTATION && !(options as IRemoteSyncMutationOptions)?.fromSync) {
                    this._remoteSyncService.syncMutation({
                        mutationInfo: commandInfo as IMutationInfo,
                    });
                }
            })
        );
    }
}
