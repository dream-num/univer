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

import type { IMutationInfo } from '@univerjs/core';
import {
    CommandType,
    DocumentType,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RxDisposable,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { takeUntil } from 'rxjs/operators';

import type { IRemoteSyncMutationOptions } from '../../services/remote-instance/remote-instance.service';
import {
    IRemoteInstanceService,
    IRemoteSyncService,
    RemoteInstanceServiceName,
    RemoteSyncServiceName,
} from '../../services/remote-instance/remote-instance.service';
import { IRPChannelService } from '../../services/rpc/channel.service';
import { fromModule, toModule } from '../../services/rpc/rpc.service';

/**
 * This controller is responsible for syncing data from the primary thread to
 * the worker thread.
 */
@OnLifecycle(LifecycleStages.Starting, DataSyncPrimaryController)
export class DataSyncPrimaryController extends RxDisposable {
    private _remoteInstanceService!: IRemoteInstanceService;

    constructor(
        private readonly _unsyncMutations: Set<string>,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRPChannelService private readonly _rpcChannelService: IRPChannelService,
        @IRemoteSyncService private readonly _remoteSyncService: IRemoteSyncService
    ) {
        super();

        this._initRPCChannels();
        this._init();
    }

    private _initRPCChannels(): void {
        this._rpcChannelService.registerChannel(RemoteSyncServiceName, fromModule(this._remoteSyncService));

        this._injector.add([
            IRemoteInstanceService,
            {
                useFactory: () =>
                    toModule<IRemoteInstanceService>(this._rpcChannelService.requestChannel(RemoteInstanceServiceName)),
            },
        ]);

        this._remoteInstanceService = this._injector.get(IRemoteInstanceService);
    }

    private _init(): void {
        this._univerInstanceService.sheetAdded$.pipe(takeUntil(this.dispose$)).subscribe((sheet) => {
            // If a sheet is created, it should sync the data to the worker thread.
            this._remoteInstanceService.createInstance({
                unitID: sheet.getUnitId(),
                type: DocumentType.SHEET,
                snapshot: sheet.getSnapshot(),
            });
        });

        this._univerInstanceService.sheetDisposed$.pipe(takeUntil(this.dispose$)).subscribe((workbook) => {
            // If a sheet is disposed, it should sync the data to the worker thread.
            this._remoteInstanceService.disposeInstance({
                unitID: workbook.getUnitId(),
            });
        });

        this.disposeWithMe(
            // Mutations executed on the main thread should be synced to the worker thread.
            this._commandService.onCommandExecuted((commandInfo, options) => {
                if (
                    commandInfo.type === CommandType.MUTATION &&
                    !(options as IRemoteSyncMutationOptions)?.fromSync &&
                    !this._unsyncMutations.has(commandInfo.id)
                ) {
                    this._remoteInstanceService.syncMutation({
                        mutationInfo: commandInfo as IMutationInfo,
                    });
                }
            })
        );
    }
}
