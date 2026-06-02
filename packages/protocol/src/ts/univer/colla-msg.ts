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

import type { IChangeset } from './changeset';
import type { IUnitPermissionStrategy, IUser, ObjectScope, UnitRole, UnitShareScope } from './permission';

export interface ICollaMsg {
    eventID: string;
    joinEvent?: ICollaMsgJoin | undefined;
    leaveEvent?: ICollaMsgLeave | undefined;
    newCsEvent?: INewChangesets | undefined;
    csAckEvent?: IChangesetAck | undefined;
    csRejEvent?: IChangesetRej | undefined;
    updateCursorEvent?: IUpdateCursor | undefined;
    liveShareRequestHost?: ILiveShareRequestHost | undefined;
    liveShareNewHost?: ILiveShareNewHost | undefined;
    liveShareOperation?: ILiveShareOperation | undefined;
    liveShareTerminate?: ILiveShareTerminate | undefined;
    errorEvent?: ICollaMsgErrorEvent | undefined;
    permissionRejEvent?:
    | IPermissionRej
    | undefined;
    /** eventID: "should_close_conn" */
    shouldCloseConn?: IShouldCloseConn | undefined;
    commentUpdateEvent?:
    | ICommentUpdate
    | undefined;
    /** envntID: "update_collaborator" */
    updateCollaboratorEvent?:
    | IUpdateCollaborator
    | undefined;
    /** eventID: "update_permission_obj" */
    updatePermissionObjEvent?:
    | IUpdatePermissionObj
    | undefined;
    /** eventID: "changeset_should_retry" */
    csShouldRetryEvent?:
    | IChangesetShouldRetry
    | undefined;
    /** eventID: "uniscript.run" */
    uniscriptRunEvent?: IUniscriptRun | undefined;
}

export interface ICollaMsgJoin {
    memberID: string;
    name: string;
    avatar: string;
    userID: string;
}

export interface ICollaMsgLeave {
    memberID: string;
    name: string;
}

interface INewChangesets {
    cs: IChangeset | undefined;
}

interface IChangesetAck {
    cs: IChangeset | undefined;
}

interface IChangesetRej {
    cs: IChangeset | undefined;
}

interface IChangesetShouldRetry {
    cs: IChangeset | undefined;
}

export interface IUpdateCursor {
    unitID: string;
    /**
     * IMember ID of the user in the collaboration session.
     * If a user open a document multi times, there will be different memberIDs.
     */
    memberID: string;
    selection: string;
}

export interface ILiveShareRequestHost {
    unitID: string;
    userID: string;
}

export interface ILiveShareNewHost {
    presenter: string;
    unitID: string;
    userID: string;
}

export interface ILiveShareOperation {
    unitID: string;
    presenter: string;
    /** key is Operation.id */
    operations: { [key: string]: ILiveShareOperationOperation };
}

export interface ILiveShareOperationOperation {
    id: string;
    params?: string | undefined;
}

export interface ILiveShareTerminate {
    unitID: string;
}

/** define msg for errors */
export interface ICollaMsgErrorEvent {
    code: number;
    reason: string;
}

interface IPermissionRej {
    cs: IChangeset | undefined;
}

export interface ICommentUpdate {
    memberId: string;
    userId: string;
    unitId: string;
    threadId: string;
    type: CommentUpdateEventType;
    replyId?:
    | string
    | undefined;
    /** Set when solve or reopen  Otherwise, it will be null */
    solved?:
    | CommentSolvedStatus
    | undefined;
    /** Set when edit or new comment reply. Otherwise, it will be null */
    content?:
    | string
    | undefined;
    /** Set true when Create or Edit comment. Otherwise, it will be null */
    createTimestamp?: string | undefined;
    user?: IUser | undefined;
}

export enum CommentSolvedStatus {
    OpenOrReOpen = 0,
    Solved = 1,
    UNRECOGNIZED = -1,
}

export enum CommentUpdateEventType {
    Unknown = 0,
    Add = 1,
    Reply = 2,
    Edit = 3,
    Delete = 4,
    Solve = 5,
    UNRECOGNIZED = -1,
}

export interface IShouldCloseConn {
    /** enum, ["logout", "roleChange"] */
    reason: string;
}

interface IUpdateCollaborator {
    role: UnitRole;
    /** enum, ["update", "delete"] */
    operation: string;
    userId: string;
}

export interface IUpdatePermissionObj {
    objectId: string;
    strategies: IUnitPermissionStrategy[];
    share: IUpdatePermissionObjShare | undefined;
    scope: IUpdatePermissionObjScope | undefined;
}

interface IUpdatePermissionObjShare {
    scope: UnitShareScope;
    role: UnitRole;
}

interface IUpdatePermissionObjScope {
    edit: ObjectScope;
    read: ObjectScope;
}

export interface IUniscriptRun {
    /** name of uniscript */
    name: string;
    /** content of uniscirpt */
    script: string;
    /** id of uniscript */
    scriptId: string;
    function: string;
    /**
     * argsOfFunction is a json string, it should be a list of arguments
     * e.g. '[123, "hello", true, {"a": 1, "b": 2}]'
     */
    argsOfFunction?:
    | string
    | undefined;
    /** executionId for script logs record. */
    executionId: string;
    compiledScript: string;
}
