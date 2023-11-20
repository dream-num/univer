import {
    CommandType,
    Disposable,
    ICommandService,
    IMutationInfo,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';

import { IRemoteSyncMutationOptions, IRemoteSyncService } from '../../services/remote-instance/remote-instance.service';

/**
 * This controller is responsible for syncing data from the worker thread to
 * the primary thread.
 */
@OnLifecycle(LifecycleStages.Starting, DataSyncReplicaController)
export class DataSyncReplicaController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IRemoteSyncService private readonly _remoteInstanceService: IRemoteSyncService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this.disposeWithMe(
            // Mutations executed on the main thread should be synced to the worker thread.
            this._commandService.onCommandExecuted((commandInfo, options) => {
                if (commandInfo.type === CommandType.MUTATION && !(options as IRemoteSyncMutationOptions)?.fromSync) {
                    this._remoteInstanceService.syncMutation({
                        mutationInfo: commandInfo as IMutationInfo,
                    });
                }
            })
        );
    }
}
