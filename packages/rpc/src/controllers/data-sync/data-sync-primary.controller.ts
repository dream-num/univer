import {
    CommandType,
    DocumentType,
    ICommandService,
    IMutationInfo,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RxDisposable,
} from '@univerjs/core';
import { takeUntil } from 'rxjs/operators';

import {
    IRemoteInstanceService,
    IRemoteSyncMutationOptions,
} from '../../services/remote-instance/remote-instance.service';

/**
 * This controller is responsible for syncing data from the primary thread to
 * the worker thread.
 */
@OnLifecycle(LifecycleStages.Starting, DataSyncPrimaryController)
export class DataSyncPrimaryController extends RxDisposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRemoteInstanceService private readonly _remoteInstanceService: IRemoteInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
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
                if (commandInfo.type === CommandType.MUTATION && !(options as IRemoteSyncMutationOptions)?.fromSync) {
                    this._remoteInstanceService.syncMutation({
                        mutationInfo: commandInfo as IMutationInfo,
                    });
                }
            })
        );
    }
}
