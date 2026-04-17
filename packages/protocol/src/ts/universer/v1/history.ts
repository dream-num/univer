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

import type { Metadata } from '@grpc/grpc-js';
import type { Observable } from 'rxjs';
import type { IChangeset } from '../../univer/changeset';
import type { IError } from '../../univer/constants/errors';
import type { UniverType } from '../../univer/constants/univer';
import type { IUser } from '../../univer/permission';

enum IHistoryOrigin {
    HISTORY_ORIGIN_UNSPECIFIED = 0,
    HISTORY_ORIGIN_USER = 1,
    HISTORY_ORIGIN_CHARACTER = 2,
    UNRECOGNIZED = -1,
}

export interface ICreateHistoryRequest {
    unitId: string;
    subUnitId: string;
    type: UniverType;
    revision: number;
    additionalFields?: string | undefined;
}

export interface ICreateHistoryResponse {
    error: IError | undefined;
}

interface IHistory {
    /** @deprecated */
    userId: string;
    unitId: string;
    command: string[];
    createTime: string;
    recoverTime: string;
    startRevision: number;
    endRevision: number;
    /** additionalFields is a reserved field for future use */
    additionalFields?: string | undefined;
    origin?: IHistoryOrigin | undefined;
    startRevCreateTime: number;
    endRevCreateTime: number;
    userIds: string[];
}

interface IHistoryListRequest {
    length: number;
    lastLabel: string;
    unitId: string;
    origin?:
    | IHistoryOrigin
    | undefined;
    /** @deprecated */
    userId?: string | undefined;
    userIds: string[];
}

interface IHistoryEntities {
    datas: { [key: string]: IHistory };
    users: { [key: string]: IUser };
}

interface IHistoryListResponse {
    error: IError | undefined;
    hasMore: boolean;
    lastLabel: string;
    entities: IHistoryEntities | undefined;
    historyIds: string[];
}

interface IListHistoryCreatorsRequest {
    unitId: string;
}

interface IListHistoryCreatorsResponse {
    error: IError | undefined;
    creators: IListHistoryCreatorsResponseCreator[];
}

interface IListHistoryCreatorsResponseCreator {
    userId: string;
    name: string;
    avatar: string;
    origins: IHistoryOrigin[];
}

export interface IGetHistoryCsRequest {
    unitId: string;
    startRevision: number;
    endRevision: number;
}

export interface IGetHistoryCsResponse {
    error: IError | undefined;
    changesets: IChangeset[];
    users: { [key: string]: IUser };
}

export interface IHistoryService {
    GetHistoryList(request: IHistoryListRequest, metadata?: Metadata): Observable<IHistoryListResponse>;
    CreateHistory(request: ICreateHistoryRequest, metadata?: Metadata): Observable<ICreateHistoryResponse>;
    ListHistoryCreators(
        request: IListHistoryCreatorsRequest,
        metadata?: Metadata,
    ): Observable<IListHistoryCreatorsResponse>;
    GetHistoryCs(request: IGetHistoryCsRequest, metadata?: Metadata): Observable<IGetHistoryCsResponse>;
}
