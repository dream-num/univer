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

interface IEmpty {
}

/** more details: https://c3fgartrp2.feishu.cn/docx/OS47dk8BCo1ZeKxXiNvcDLuZn2g#PymGdupuyoYfvTxv1EBciV7in9b */
export enum CombCmd {
    /** UNKNOWN_CMD - unknown cmd */
    UNKNOWN_CMD = 0,
    /** HELLO - call hello to get comb info, this is essential after you connect to the server */
    HELLO = 1,
    /** JOIN - call join to join couple of rooms */
    JOIN = 2,
    /** LEAVE - call leave to leave a room */
    LEAVE = 3,
    /** INGEST - call ingest to broadcast a message to a room */
    INGEST = 4,
    /** HEARTBEAT - call heartbeat to keep the connection alive */
    HEARTBEAT = 5,
    /**
     * RECV - RECV not a cmd actually, you never call a RECV cmd.
     * when you receive a message from comb(may be created by another user), the cmd will be RECV
     */
    RECV = 6,
    UNRECOGNIZED = -1,
}

export enum CmdRspCode {
    UNKNOWN_CODE = 0,
    OK = 1,
    FAIL = 2,
    /**
     * JOIN_ROOM_FULL - 1000~1999 room related
     * max room member reached
     */
    JOIN_ROOM_FULL = 1001,
    /** JOIN_ROOM_NOT_EXISTS - the specified room does not exists */
    JOIN_ROOM_NOT_EXISTS = 1002,
    /** JOIN_ROOM_PERMISSION_DENIED - has no permission to join the room */
    JOIN_ROOM_PERMISSION_DENIED = 1003,
    /** GLOBAL_ROOMS_CNT_EXCEEDS - global live collaboration rooms count exceeds */
    GLOBAL_ROOMS_CNT_EXCEEDS = 1004,
    UNRECOGNIZED = -1,
}

interface IBroadcastRequest {
    roomID: string;
    message: string;
}

export interface INewChangesRequest {
    unitID: string;
    memberID: string;
    type: UniverType;
    changeset: IChangeset | undefined;
}

export interface INewChangesResponse {
    error: IError | undefined;
}

interface ICombJoinInfo {
    roomID: string;
    /** extra args for joining the room */
    args: string;
}

export interface ICombJoinRequest {
    rooms: ICombJoinInfo[];
}

export interface ICombJoinResponse {
    roomInfos: { [key: string]: ICombJoinResponseRoomInfo };
}

interface ICombJoinResponseRoomInfo {
    roomID: string;
    members: IMember[];
}

export interface ICombLeaveRequest {
    roomID: string;
    /** extra args for leaving the room */
    args: string;
}

export interface IMember {
    memberID: string;
    name: string;
    avatar?: string | undefined;
    userID: string;
}

interface IRule {
    /** exclude member */
    excludeMember: string[];
    /** only member */
    onlyMember: string[];
    tunnel: IRuleTunnel | undefined;
}

interface IRuleTunnel {
    name: string;
    value: string;
}

export interface ICombService {
    NewChanges(request: INewChangesRequest, metadata?: Metadata): Observable<INewChangesResponse>;
    Broadcast(request: IBroadcastRequest, metadata?: Metadata): Observable<IEmpty>;
}
