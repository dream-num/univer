import type { IMutationInfo } from '@univerjs/core';
import { CommandType, Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

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
 * This controller is responsible for syncing data from the worker thread to
 * the primary thread.
 */
@OnLifecycle(LifecycleStages.Starting, DataSyncReplicaController)
export class DataSyncReplicaController extends Disposable {
    private _remoteSyncService: IRemoteSyncService;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IRemoteInstanceService private readonly _remoteInstanceService: IRemoteInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRPChannelService private readonly _rpcChannelService: IRPChannelService
    ) {
        super();

        this._initRPCChannels();
        this._init();
    }

    private _initRPCChannels(): void {
        this._rpcChannelService.registerChannel(RemoteInstanceServiceName, fromModule(this._remoteInstanceService));

        this._injector.add([
            IRemoteSyncService,
            {
                useFactory: () =>
                    toModule<IRemoteSyncService>(this._rpcChannelService.requestChannel(RemoteSyncServiceName)),
            },
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
