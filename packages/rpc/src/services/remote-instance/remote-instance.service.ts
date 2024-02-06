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

import type { IExecutionOptions, IMutationInfo, IWorkbookData } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

export interface IRemoteSyncMutationOptions extends IExecutionOptions {
    /** If this mutation is executed after it was sent from the peer univer instance (e.g. in a web worker). */
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
            onlyLocal: true,
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
    /** Tell other modules if the `IRemoteInstanceService` is ready to load files. */
    whenReady(): Promise<true>;

    createInstance(params: { unitID: string; type: UniverInstanceType; snapshot: IWorkbookData }): Promise<boolean>;
    disposeInstance(params: { unitID: string }): Promise<boolean>;
    syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean>;
}
export class RemoteInstanceReplicaService implements IRemoteInstanceService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {}

    whenReady(): Promise<true> {
        return Promise.resolve(true);
    }

    async syncMutation(params: { mutationInfo: IMutationInfo }): Promise<boolean> {
        return this._commandService.syncExecuteCommand(params.mutationInfo.id, params.mutationInfo.params, {
            onlyLocal: true,
            fromSync: true,
        });
    }

    async createInstance(params: {
        unitID: string;
        type: UniverInstanceType;
        snapshot: IWorkbookData;
    }): Promise<boolean> {
        const { type, snapshot } = params;
        try {
            switch (type) {
                case UniverInstanceType.SHEET:
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
                throw new TypeError(`${err}`);
            }
        }
    }

    async disposeInstance(params: { unitID: string }): Promise<boolean> {
        return this._univerInstanceService.disposeDocument(params.unitID);
    }
}
