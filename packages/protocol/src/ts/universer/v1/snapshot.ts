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
import type { IChangeset, ICommand, IMutation } from '../../univer/changeset';
import type { IError } from '../../univer/constants/errors';
import type { UniverType } from '../../univer/constants/univer';
import type { IInitialSheet } from '../../univer/initial-sheet';
import type { IResource } from '../../univer/resource';
import type { ISnapshot, ITableInfo } from '../../univer/snapshot';
import type { ICustomCellTemplate } from '../../univer/unit-template';
import type { IUnit } from '../../univer/univer-file';
import type { ISheetBlock, ISheetBlockMeta } from '../../univer/workbook';

interface IGetSnapshotMetaWithPreCalculatedRequest {
    /** The id of the unit to be computed. */
    workbookId: string;
    /**
     * The revision of the unit to be computed. If not specified or set to 0, the SSC service
     * will fetch the latest version at the request time.
     */
    revision: number;
}

interface IGetSnapshotMetaWithPreCalculatedResponse {
    error:
    | IError
    | undefined;
    /** Of which revision the unit is processed on. */
    revision: number;
    sscBlock: { [key: string]: ISheetBlockMeta };
}

interface IGetUnitMetaRequest {
    unitId: string;
}

interface IGetUnitMetaResponse {
    error: IError | undefined;
    unitId: string;
    name: string;
    creator: string;
    type: UniverType;
    createTime: string;
    updateTime: string;
}

export interface IMGetUnitMetaRequest {
    unitIds: string[];
}

export interface IMGetUnitMetaResponse {
    error: IError | undefined;
    metas: { [key: string]: IUnitMeta };
}

export interface IUnitMeta {
    unitId: string;
    name: string;
    creator: string;
    type: UniverType;
    createTime: string;
    updateTime: string;
}

interface IGetSheetTableInfoRequest {
    unitID: string;
    type: UniverType;
}

interface IGetSheetTableInfoResponse {
    error: IError | undefined;
    unitName: string;
    table: ISheetTable | undefined;
}

interface IGetSheetTableRequest {
    unitID: string;
    type: UniverType;
    tableId: string;
}

interface IGetSheetTableResponse {
    error: IError | undefined;
    tableData: Uint8Array;
}

export interface IForkUnitRequest {
    unitId: string;
    type: UniverType;
}

export interface IForkUnitResponse {
    error: IError | undefined;
    unitId: string;
}

export interface ICopyFileMetaRequest {
    fileMetaId: string;
    assign: string;
}

export interface ICopyFileMetaResponse {
    error: IError | undefined;
    fileMetaId: string;
}

export interface IDirectWriteRequest {
    unitID: string;
    type: UniverType;
    commands: ICommand[];
    mutations: IMutation[];
}

export interface IDirectWriteResponse {
    error: IError | undefined;
    revision: number;
}

export interface IEnsureSnapshotRequest {
    unitID: string;
    type: UniverType;
    revision: number;
}

export interface IEnsureSnapshotResponse {
    error: IError | undefined;
    snapshot: ISnapshot | undefined;
}

interface IUpdateUnitRequest {
    type: UniverType;
    unitId: string;
    name: string;
    memberId: string;
}

interface IUpdateUnitResponse {
    error: IError | undefined;
}

export interface ICreateUnitRequest {
    type: UniverType;
    name: string;
    creator: string;
    locale: string;
    snapshot: ISnapshot | undefined;
    templateID: string;
    customCell?: ICustomCellTemplate | undefined;
    initialSheets: IInitialSheet[];
    docContent: string;
    preCreateUnitId: string;
    workbookDataJson: string;
    /** univer ai for exchange */
    table?:
    | ISheetTable
    | undefined;
    /** two types: traditional and modern, default is modern */
    docType?: string | undefined;
    /** used for integration with customer system */
    idempotencyKey?:
    | string
    | undefined;
    /** used for integration with customer system, just store and pass through */
    metaData?: string | undefined;
}

export interface ICreateUnitResponse {
    error: IError | undefined;
    unitID: string;
    sheetOrder: string[];
}

export interface ISaveChangesetRequest {
    changeset: IChangeset | undefined;
    type: UniverType;
    originChangeset: IChangeset | undefined;
}

export interface ISaveChangesetResponse {
    error:
    | IError
    | undefined;
    /** concurrent is the changesets need to follow up. */
    concurrent: IChangeset[];
}

export interface IGetLatestCsReqIdBySidRequest {
    sid: string;
    unitID: string;
    userID: string;
}

export interface IGetLatestCsReqIdBySidResponse {
    /** set to default -1 if has no sid yet */
    latestReqID: number;
    error: IError | undefined;
}

export interface IFetchMissingChangesetsRequest {
    /** unitID of the Univer document */
    unitID: string;
    type: UniverType;
    /** exclude from revision, will return (from, latest] */
    from: number;
    /** include to revision, if to == 0 , will return (from, +inf] */
    to: number;
}

export interface IFetchMissingChangesetsResponse {
    error: IError | undefined;
    changesets: IChangeset[];
    latestRevision?: number | undefined;
}

export interface IMGetChangesetsByRevisionRequest {
    unitId: string;
    revisions: number[];
}

export interface IMGetChangesetsByRevisionResponse {
    error: IError | undefined;
    changesets: IChangeset[];
}

export interface ISaveSnapshotRequest {
    unitID: string;
    type: UniverType;
    snapshot: ISnapshot | undefined;
}

export interface ISaveSnapshotResponse {
    error: IError | undefined;
}

interface IGetSnapshotRequest {
    unitID: string;
    type: UniverType;
    revision: number;
}

interface IGetSnapshotResponse {
    error: IError | undefined;
    snapshot: ISnapshot | undefined;
}

interface IGetLatestSnapshotRevisionRequest {
    unitID: string;
    type: UniverType;
}

interface IGetLatestSnapshotRevisionResponse {
    error: IError | undefined;
    latestRevision: number;
}

export interface IGetUnitOnRevRequest {
    unitID: string;
    type: UniverType;
    revision: number;
}

export interface IGetUnitOnRevResponse {
    error:
    | IError
    | undefined;
    /** the snapshot closest to revision */
    snapshot:
    | ISnapshot
    | undefined;
    /** the changesets need to follow up */
    changesets: IChangeset[];
}

export interface ISaveSheetBlockRequest {
    unitID: string;
    type: UniverType;
    /** no data */
    block: ISheetBlock | undefined;
    fileID?: string | undefined;
}

export interface ISaveSheetBlockResponse {
    error: IError | undefined;
    blockID: string;
}

export interface IGetSheetBlockRequest {
    unitID: string;
    type: UniverType;
    /** string sheetID = 3; */
    blockID: string;
}

export interface IGetSheetBlockResponse {
    error: IError | undefined;
    block: ISheetBlock | undefined;
}

export interface IGetResourcesRequest {
    unitID: string;
    type: UniverType;
    resourceIDs: string[];
}

export interface IGetResourcesResponse {
    error:
    | IError
    | undefined;
    /** key is resource id */
    resources: { [key: string]: IResource };
}

interface IListUnitsRequest {
    type: UniverType;
    nextCursor: string;
}

interface IListUnitsResponse {
    error: IError | undefined;
    units: IUnit[];
    nextCursor: string;
}

export interface IDeleteUnitsRequest {
    unitIds: string[];
    /** if true, delete the unit permanently, otherwise just mark as deleted */
    hardDelete: boolean;
}

export interface IDeleteUnitsResponse {
    error: IError | undefined;
}

export interface IRecoverUnitsRequest {
    unitIds: string[];
}

export interface IRecoverUnitsResponse {
    error: IError | undefined;
}

interface ISheetTable {
    /** key: table-id */
    tables: { [key: string]: ITableInfo };
}

export interface IReportUnitRoutingStatsRequest {
    unitId: string;
    estimatedCells?:
    | number
    | undefined;
    /** precision: seconds */
    snapshotTime?:
    | number
    | undefined;
    /** precision: seconds, report in import scene. */
    importTime?: number | undefined;
}

export interface IReportUnitRoutingStatsResponse {
    error: IError | undefined;
}

export interface ISnapshotService {
    ICreateUnit(request: ICreateUnitRequest, metadata?: Metadata): Observable<ICreateUnitResponse>;
    UpdateUnit(request: IUpdateUnitRequest, metadata?: Metadata): Observable<IUpdateUnitResponse>;
    ListUnits(request: IListUnitsRequest, metadata?: Metadata): Observable<IListUnitsResponse>;
    DeleteUnits(request: IDeleteUnitsRequest, metadata?: Metadata): Observable<IDeleteUnitsResponse>;
    RecoverUnits(request: IRecoverUnitsRequest, metadata?: Metadata): Observable<IRecoverUnitsResponse>;
    SaveChangeset(request: ISaveChangesetRequest, metadata?: Metadata): Observable<ISaveChangesetResponse>;
    GetLatestCsReqIdBySid(
        request: IGetLatestCsReqIdBySidRequest,
        metadata?: Metadata,
    ): Observable<IGetLatestCsReqIdBySidResponse>;
    FetchMissingChangesets(
        request: IFetchMissingChangesetsRequest,
        metadata?: Metadata,
    ): Observable<IFetchMissingChangesetsResponse>;
    /**
     * Save a snapshot to the database. If the snapshot of the unit at a given revision is already
     * saved, the request will be ignored.
     */
    SaveSnapshot(request: ISaveSnapshotRequest, metadata?: Metadata): Observable<ISaveSnapshotResponse>;
    /** Update a snapshot to the database. */
    UpdateSnapshot(request: ISaveSnapshotRequest, metadata?: Metadata): Observable<ISaveSnapshotResponse>;
    GetSnapshot(request: IGetSnapshotRequest, metadata?: Metadata): Observable<IGetSnapshotResponse>;
    GetLatestSnapshotRevision(
        request: IGetLatestSnapshotRevisionRequest,
        metadata?: Metadata,
    ): Observable<IGetLatestSnapshotRevisionResponse>;
    SaveSheetBlock(request: ISaveSheetBlockRequest, metadata?: Metadata): Observable<ISaveSheetBlockResponse>;
    GetSheetBlock(request: IGetSheetBlockRequest, metadata?: Metadata): Observable<IGetSheetBlockResponse>;
    GetUnitOnRev(request: IGetUnitOnRevRequest, metadata?: Metadata): Observable<IGetUnitOnRevResponse>;
    GetResources(request: IGetResourcesRequest, metadata?: Metadata): Observable<IGetResourcesResponse>;
    EnsureSnapshot(request: IEnsureSnapshotRequest, metadata?: Metadata): Observable<IEnsureSnapshotResponse>;
    /** Directly write a changeset with a user's identification to the document. */
    DirectWrite(request: IDirectWriteRequest, metadata?: Metadata): Observable<IDirectWriteResponse>;
    CopyFileMeta(request: ICopyFileMetaRequest, metadata?: Metadata): Observable<ICopyFileMetaResponse>;
    ForkUnit(request: IForkUnitRequest, metadata?: Metadata): Observable<IForkUnitResponse>;
    /** get table info */
    GetSheetTableInfo(request: IGetSheetTableInfoRequest, metadata?: Metadata): Observable<IGetSheetTableInfoResponse>;
    /** get table data */
    GetSheetTable(request: IGetSheetTableRequest, metadata?: Metadata): Observable<IGetSheetTableResponse>;
    /** get unit meta */
    GetUnitMeta(request: IGetUnitMetaRequest, metadata?: Metadata): Observable<IGetUnitMetaResponse>;
    /** Get formula calculation results */
    GetSnapshotMetaWithPreCalculated(
        request: IGetSnapshotMetaWithPreCalculatedRequest,
        metadata?: Metadata,
    ): Observable<IGetSnapshotMetaWithPreCalculatedResponse>;
    ReportUnitRoutingStats(
        request: IReportUnitRoutingStatsRequest,
        metadata?: Metadata,
    ): Observable<IReportUnitRoutingStatsResponse>;
    MGetChangesetsByRevision(
        request: IMGetChangesetsByRevisionRequest,
        metadata?: Metadata,
    ): Observable<IMGetChangesetsByRevisionResponse>;
    MGetUnitMeta(
        request: IMGetUnitMetaRequest,
        metadata?: Metadata,
    ): Observable<IMGetUnitMetaResponse>;
}
