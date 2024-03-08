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

import {
    ErrorCode,
    UniverType,
} from '@univerjs/protocol';
import type {
    IFetchMissingChangesetsRequest,
    IFetchMissingChangesetsResponse,
    IGetResourcesRequest,
    IGetResourcesResponse,
    IGetSheetBlockRequest,
    IGetSheetBlockResponse,
    IGetUnitOnRevRequest,
    IGetUnitOnRevResponse,
    ISaveChangesetRequest,
    ISaveChangesetResponse,
    ISaveSheetBlockRequest,
    ISaveSheetBlockResponse,
    ISaveSnapshotRequest,
    ISaveSnapshotResponse,
    ISheetBlock,
} from '@univerjs/protocol';
import { createIdentifier } from '@wendellhu/redi';

import type { ILogContext } from '../log/context';

/**
 * It provides implementations for server side controllers to load or save
 * or load snapshots. This service should be implemented by the host environment.
 * And it shouldn't contain any business logic.
 */
export const ISnapshotServerService = createIdentifier<ISnapshotServerService>(
    'univer.snapshot-server-service'
);
export interface ISnapshotServerService {
    /** Load snapshot from a database. */
    getUnitOnRev: (context: ILogContext, params: IGetUnitOnRevRequest) => Promise<IGetUnitOnRevResponse>;
    /** Load sheet block from a database.  */
    getSheetBlock: (context: ILogContext, params: IGetSheetBlockRequest) => Promise<IGetSheetBlockResponse>;
    /** Fetch missing changeset */
    fetchMissingChangesets: (
        context: ILogContext,
        params: IFetchMissingChangesetsRequest
    ) => Promise<IFetchMissingChangesetsResponse>;

    getResourcesRequest: (context: ILogContext, params: IGetResourcesRequest) => Promise<IGetResourcesResponse>;
    // #region - server only methods

    // These methods should not be implemented by client code because snapshot
    // saving is completed by the Apply microservice running on Node.js.

    /** Save snapshot to a database. */
    saveSnapshot: (context: ILogContext, params: ISaveSnapshotRequest) => Promise<ISaveSnapshotResponse>;
    /** Save sheet block to a database. */
    saveSheetBlock: (context: ILogContext, params: ISaveSheetBlockRequest) => Promise<ISaveSheetBlockResponse>;
    /** Save changeset to a database. */
    saveChangeset: (context: ILogContext, params: ISaveChangesetRequest) => Promise<ISaveChangesetResponse>;

    // #endregion - server only methods
}

/**
 * The server needs to fully implement all interfaces, but when used by the client, use saveSheetBlock to cache the sheet block locally, and use getSheetBlock to obtain the sheet block.
 */
export class ClientSnapshotServerService implements ISnapshotServerService {
    private _sheetBlockCache: Map<string, ISheetBlock> = new Map();

    /** Load snapshot from a database. */
    getUnitOnRev(context: ILogContext, params: IGetUnitOnRevRequest): Promise<IGetUnitOnRevResponse> {
        return Promise.resolve({
            snapshot: {
                unitID: '',
                type: UniverType.UNIVER_SHEET,
                rev: 0,
                workbook: undefined,
                doc: undefined,
            },
            changesets: [],
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    }

    /** Load sheet block from a database.  */
    getSheetBlock(context: ILogContext, params: IGetSheetBlockRequest): Promise<IGetSheetBlockResponse> {
        // get block from cache
        const block = this._sheetBlockCache.get(params.blockID);

        return Promise.resolve({
            block,
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    }

    /** Fetch missing changeset */
    fetchMissingChangesets(
        context: ILogContext,
        params: IFetchMissingChangesetsRequest
    ): Promise<IFetchMissingChangesetsResponse> {
        return Promise.resolve({
            changesets: [],
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    }

    getResourcesRequest(context: ILogContext, params: IGetResourcesRequest): Promise<IGetResourcesResponse> {
        return Promise.resolve({
            resources: {},
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    }

    /** Save snapshot to a database. */
    saveSnapshot(context: ILogContext, params: ISaveSnapshotRequest): Promise<ISaveSnapshotResponse> {
        return Promise.resolve({
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    };

    /** Save sheet block to a database. */
    saveSheetBlock(context: ILogContext, params: ISaveSheetBlockRequest): Promise<ISaveSheetBlockResponse> {
        const { block } = params;

        if (!block) {
            return Promise.resolve({
                error: {
                    code: ErrorCode.UNDEFINED,
                    message: 'block is required',
                },
                blockID: '',
            });
        }

        // save block to cache
        this._sheetBlockCache.set(block.id, block);

        return Promise.resolve({
            error: {
                code: ErrorCode.OK,
                message: '',
            },
            blockID: block.id,
        });
    };

    /** Save changeset to a database. */
    saveChangeset(context: ILogContext, params: ISaveChangesetRequest): Promise<ISaveChangesetResponse> {
        return Promise.resolve({
            error: {
                code: ErrorCode.OK,
                message: '',
            },
            concurrent: [],
        });
    };
}
