import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';

import { IRemoteInstanceService } from '../../services/remote-instance/remote-instance.service';

/**
 * This controller is responsible for syncing data from the worker thread to
 * the primary thread.
 */
@OnLifecycle(LifecycleStages.Starting, DataSyncReplicaController)
export class DataSyncReplicaController extends Disposable {
    constructor(
        @IRemoteInstanceService private readonly: IRemoteInstanceService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }
}
