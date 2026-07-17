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

export type {
    IDeserializedSheetBlock,
    IGetDeserializedSheetBlockResponse,
} from './other/sheet-block';
export type { IBoardMeta } from './ts/univer/board';
export type {
    IChangeset,
    ICommand,
    IMutation,
} from './ts/univer/changeset';
export { CommentSolvedStatus, CommentUpdateEventType } from './ts/univer/colla-msg';
export type {
    ICollaMsg,
    ICollaMsgErrorEvent,
    ICollaMsgJoin,
    ICollaMsgLeave,
    ICommentUpdate,
    ILiveShareNewHost,
    ILiveShareOperation,
    ILiveShareOperationOperation,
    ILiveShareRequestHost,
    ILiveShareTerminate,
    IShouldCloseConn,
    IUniscriptRun,
    IUpdateCursor,
    IUpdatePermissionObj,
} from './ts/univer/colla-msg';
export { ErrorCode } from './ts/univer/constants/errors';
export type { IError } from './ts/univer/constants/errors';
export { UniverType } from './ts/univer/constants/univer';
export type { IDocumentMeta } from './ts/univer/doc';
export { CellType } from './ts/univer/initial-sheet';
export type { IInitialSheet, IRow, IRowCell } from './ts/univer/initial-sheet';
export type { IPdfAssetRef, IPdfMeta } from './ts/univer/pdf';
export type { IUnitRoleKV } from './ts/univer/permission';
export {
    ObjectScope,
    UnitAction,
    UnitObject,
    UnitRole,
} from './ts/univer/permission';
export type { IRange } from './ts/univer/range';
export type { ISlideMeta } from './ts/univer/slide';
export type {
    ISnapshot,
    ITableInfo,
} from './ts/univer/snapshot';
export type { IUnit } from './ts/univer/univer-file';
export { CellValueType } from './ts/univer/workbook';
export type { ICellData, ISheetBlock, ISheetBlockMeta, IWorkbookMeta, IWorksheetMeta } from './ts/univer/workbook';
export type {
    IRecord,
} from './ts/univercloud/stats/v1/stats';
export {
    IRecordType,
} from './ts/univercloud/stats/v1/stats';
export {
    type IApplyRequest,
    type IApplyResponse,
    type ICreateUnitRequest,
    type ICreateUnitResponse,
    type IDirectWriteRequest,
    type IDirectWriteResponse,
    type IDisposeRequest,
    type IDisposeResponse,
    type IEnsureSnapshotRequest,
    type IEnsureSnapshotResponse,
    type IForkUnitRequest,
    type IForkUnitResponse,
    type IGetUnitRawContentRequest,
    type IGetUnitRawContentResponse,
    type IPreloadUnitRequest,
    type IPreloadUnitResponse,
    type IWorkbookCreateMeta,
} from './ts/univerpro/v1/apply';
export {
    type ICollaborationHelperService,
    type ICreateLatestSnapshotInBackgroundRequest,
    type ICreateLatestSnapshotInBackgroundResponse,
} from './ts/univerpro/v1/helper';
export type {
    IComputeRequest,
    IComputeResponse,
    IGetPreprocessRangesRequest,
    IGetPreprocessRangesResponse,
    IGetValuesRequest,
    IGetValuesResponse,
    ITableInfoList,
} from './ts/univerpro/v1/ssc';
export type {
    IGetSSRRequest,
    IGetSSRResponse,
} from './ts/univerpro/v1/ssr';
export type {
    IAccessKeyService,
} from './ts/universer/v1/access-key';
export type {
    IActionInfo,
    IAllowedRequest,
    IAllowedResponse,
    IAuthzService,
    IBatchAllowedResponse,
    ICollaborator,
    ICreateCollaboratorRequest,
    ICreateRequest,
    ICreateRequestSelectRangeObject,
    ICreateResponse,
    IDeleteCollaboratorRequest,
    IDeleteCollaboratorResponse,
    IListCollaboratorRequest,
    IListCollaboratorResponse,
    IListPermPointRequest,
    IListPermPointResponse,
    IListRolesRequest,
    IListRolesResponse,
    IPermissionPoint,
    IPutCollaboratorsRequest,
    IPutCollaboratorsResponse,
    IUpdateCollaboratorRequest,
    IUpdateCollaboratorResponse,
    IUpdatePermPointRequest,
} from './ts/universer/v1/authz';
export { CmdRspCode, CombCmd } from './ts/universer/v1/comb';
export type {
    ICombJoinRequest,
    ICombJoinResponse,
    ICombLeaveRequest,
    ICombService,
    IMember,
    INewChangesRequest,
    INewChangesResponse,
} from './ts/universer/v1/comb';
export type {
    IAddCommentRequest,
    IAddCommentResponse,
    IDeleteCommentRequest,
    IDeleteCommentResponse,
    IEditCommentRequest,
    IEditCommentResponse,
    IListCommentsRequest,
    IListCommentsResponse,
    IReply,
    IReplyCommentRequest,
    IReplyCommentResponse,
    ISolvedCommentRequest,
    ISolvedCommentResponse,
    IThread,
} from './ts/universer/v1/comment';
export { FileSource } from './ts/universer/v1/file';
export type { IFileService, IFileUploadRequest } from './ts/universer/v1/file';
export type {
    ICreateHistoryRequest,
    ICreateHistoryResponse,
    IGetHistoryCsRequest,
    IGetHistoryCsResponse,
    IHistoryService,
} from './ts/universer/v1/history';
export type {
    IGetUserLicenseResponse,
    ILicenseService,
} from './ts/universer/v1/license';
export {
    type ICopyFileMetaRequest,
    type ICopyFileMetaResponse,
    type IDeleteUnitsRequest,
    type IDeleteUnitsResponse,
    type IFetchMissingChangesetsRequest,
    type IFetchMissingChangesetsResponse,
    type IGetLatestCsReqIdBySidRequest,
    type IGetLatestCsReqIdBySidResponse,
    type IGetResourcesRequest,
    type IGetResourcesResponse,
    type IGetSheetBlockRequest,
    type IGetSheetBlockResponse,
    type IGetUnitOnRevRequest,
    type IGetUnitOnRevResponse,
    type IMGetChangesetsByRevisionRequest,
    type IMGetChangesetsByRevisionResponse,
    type IMGetUnitMetaRequest,
    type IMGetUnitMetaResponse,
    type IRecoverUnitsRequest,
    type IRecoverUnitsResponse,
    type IReportUnitRoutingStatsRequest,
    type IReportUnitRoutingStatsResponse,
    type ISaveChangesetRequest,
    type ISaveChangesetResponse,
    type ISaveSheetBlockRequest,
    type ISaveSheetBlockResponse,
    type ISaveSnapshotRequest,
    type ISaveSnapshotResponse,
    type ISnapshotService,
    type IUnitMeta,
} from './ts/universer/v1/snapshot';
export type {
    IGetSessionTicketResponse,
    IGetUserResponse,
    IListUsersResponse,
    IMigrateRequest,
    IMigrateResponse,
    IUser,
} from './ts/universer/v1/user';
export { isError } from './utils';
