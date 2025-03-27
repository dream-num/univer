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

import type { IDisposable, IMutation, IMutationInfo, Workbook } from '@univerjs/core';
import type { IRemoteSyncMutationOptions } from '../../services/remote-instance/remote-instance.service';
import {
    CommandType,
    ICommandService,
    Inject,
    Injector,
    IUniverInstanceService,
    RxDisposable,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { takeUntil } from 'rxjs/operators';
import {
    IRemoteInstanceService,
    IRemoteSyncService,
    RemoteInstanceServiceName,
    RemoteSyncServiceName,
} from '../../services/remote-instance/remote-instance.service';
import { IRPCChannelService } from '../../services/rpc/channel.service';
import { fromModule, toModule } from '../../services/rpc/rpc.service';

/**
 * This controller is responsible for syncing data from the primary thread to
 * the worker thread.
 *
 * Note that only spreadsheets will be synced to the remote calculation instance by default.
 */
export class DataSyncPrimaryController extends RxDisposable {
    private _remoteInstanceService!: IRemoteInstanceService;

    private readonly _syncingUnits = new Set<string>();

    private readonly _syncingMutations = new Set<string>();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRPCChannelService private readonly _rpcChannelService: IRPCChannelService,
        @IRemoteSyncService private readonly _remoteSyncService: IRemoteSyncService
    ) {
        super();

        this._initRPCChannels();
        this._init();
    }

    registerSyncingMutations(mutation: IMutation<object>): void {
        this._syncingMutations.add(mutation.id);
    }

    /**
     * Only spreadsheets would be synced to the web worker in normal situations. If you would like to
     * sync other types of documents, you should manually call this method with that document's id.
     */
    syncUnit(unitId: string): IDisposable {
        this._syncingUnits.add(unitId);
        return toDisposable(() => this._syncingUnits.delete(unitId));
    }

    private _initRPCChannels(): void {
        // for the worker to call
        this._rpcChannelService.registerChannel(RemoteSyncServiceName, fromModule(this._remoteSyncService));

        // to call the worker
        this._injector.add([
            IRemoteInstanceService,
            { useFactory: () => toModule<IRemoteInstanceService>(this._rpcChannelService.requestChannel(RemoteInstanceServiceName)) },
        ]);
        this._remoteInstanceService = this._injector.get(IRemoteInstanceService);
    }

    private _init(): void {
        this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((sheet) => {
            this._syncingUnits.add(sheet.getUnitId());

            // If a sheet is created, it should sync the data to the worker thread.
            this._remoteInstanceService.createInstance({
                unitID: sheet.getUnitId(),
                type: UniverInstanceType.UNIVER_SHEET,
                snapshot: sheet.getSnapshot(),
            });
        });

        this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => {
            this._syncingUnits.delete(workbook.getUnitId());
            // If a sheet is disposed, it should sync the data to the worker thread.
            this._remoteInstanceService.disposeInstance({
                unitID: workbook.getUnitId(),
            });
        });

        // Mutations executed on the main thread should be synced to the worker thread.
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo, options) => {
            const { type, params, id } = commandInfo;
            const unitId = (params as { unitId: string })?.unitId || '';

            if (type === CommandType.MUTATION &&
                // only sync mutations to the worker thread
                (!unitId || this._syncingUnits.has(unitId)) &&
                // do not sync mutations from the web worker back to the web worker
                !(options as IRemoteSyncMutationOptions)?.fromSync &&
                // do not sync mutations those are not meant to be synced
                this._syncingMutations.has(id)
            ) {
                this._remoteInstanceService.syncMutation({ mutationInfo: commandInfo as IMutationInfo });
            }
        }));
    }
}
