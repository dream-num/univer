import type { IExecutionOptions, IMutationInfo, IWorkbookData } from '@univerjs/core';
import { DocumentType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

export interface IRemoteSyncMutationOptions extends IExecutionOptions {
    /** If this mutation is executed after it was sent from the peer univer instance. */
    fromSync?: boolean;
}

export const RemoteSyncServiceName = 'univer.remote-sync-service';
/**
 * This service is provided by the primary Univer.
 *
 * Replica Univer could call this service to update mutations back to the primary Univer.
 */
export const IRemoteSyncService = createIdentifier<IRemoteSyncService>(RemoteSyncServiceName);
export interface IRemoteSyncService {
    syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean>;
}
export class RemoteSyncPrimaryService implements IRemoteSyncService {
    constructor(@ICommandService private readonly _commandService: ICommandService) {}

    async syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean> {
        return this._commandService.syncExecuteCommand(params.mutationInfo.id, params.mutationInfo.params, {
            local: true,
            fromSync: true,
        });
    }
}

export const RemoteInstanceServiceName = 'univer.remote-instance-service';
/**
 * This service is provided by the replica Univer.
 *
 * Primary univer could call this service to init and dispose univer business instances
 * and sync mutations to replica univer.
 */
export const IRemoteInstanceService = createIdentifier<IRemoteInstanceService>(RemoteInstanceServiceName);
export interface IRemoteInstanceService {
    createInstance(params: { unitID: string; type: DocumentType; snapshot: IWorkbookData }): Promise<boolean>;
    disposeInstance(params: { unitID: string }): Promise<boolean>;
    syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean>;
}
export class RemoteInstanceReplicaService implements IRemoteInstanceService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {}

    async syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean> {
        return this._commandService.syncExecuteCommand(params.mutationInfo.id, params.mutationInfo.params, {
            local: true,
            fromSync: true,
        });
    }

    async createInstance(params: { unitID: string; type: DocumentType; snapshot: IWorkbookData }): Promise<boolean> {
        const { type, snapshot } = params;
        try {
            switch (type) {
                case DocumentType.SHEET:
                    return !!this._univerInstanceService.createSheet(snapshot);
                default:
                    throw new Error(
                        `[RemoteInstanceReplicaService]: cannot create replica for document type: ${type}.`
                    );
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                throw err;
            } else {
                throw new Error(`${err}`);
            }
        }
    }

    async disposeInstance(params: { unitID: string }): Promise<boolean> {
        return this._univerInstanceService.disposeDocument(params.unitID);
    }
}
