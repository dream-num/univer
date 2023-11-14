import {
    DocumentType,
    ICommandService,
    IExecutionOptions,
    IMutationInfo,
    IUniverInstanceService,
    IWorkbookConfig,
} from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import { type } from 'os';

export interface IRemoteSyncMutationOptions extends IExecutionOptions {
    /** If this mutation is executed after it was sent from the peer univer instance. */
    fromSync?: boolean;
}

export const RemoteSyncServiceName = 'univer.remote-sync-service';
/** This service is provided by the primary Univer.. */
export const IRemoteSyncService = createIdentifier<IRemoteSyncService>(RemoteSyncServiceName);
export interface IRemoteSyncService {
    syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean>;
}

export class RemoteSyncPrimaryService implements IRemoteSyncService {
    constructor(@ICommandService private readonly _commandService: ICommandService) {}

    async syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean> {
        return this._commandService.syncExecuteCommand(params.mutationInfo.id, params.mutationInfo.params, {
            fromSync: true,
        });
    }
}

export const RemoteInstanceServiceName = 'univer.remote-instance-service';
/** This service is provided by the replica Univer. */
export const IRemoteInstanceService = createIdentifier<IRemoteInstanceService>(RemoteInstanceServiceName);
export interface IRemoteInstanceService {
    createInstance(params: { unitID: string; type: DocumentType; snapshot: IWorkbookConfig }): Promise<boolean>;
    disposeInstance(params: { unitID: string }): Promise<boolean>;
    syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean>;
}

/**
 * This service runs on replica Univer and is responsible for syncing data
 * between the replica and the primary Univer.
 */
export class RemoteInstanceReplicaService implements IRemoteInstanceService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {}

    async syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean> {
        return this._commandService.syncExecuteCommand(params.mutationInfo.id, params.mutationInfo.params, {
            fromSync: true,
        });
    }

    async createInstance(params: { unitID: string; type: DocumentType; snapshot: IWorkbookConfig }): Promise<boolean> {
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
