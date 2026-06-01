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

import type { IError } from '../../univer/constants/errors';

export interface IUser {
    userID: string;
    name: string;
    avatar: string;
    anonymous: boolean;
    canBindAnonymous: boolean;
    phone: string;
    email: string;
    createTimestamp: number;
}

interface IWechatUserInfo {
    nickName: string;
    avatarUrl: string;
}

export interface IGetUserResponse {
    error: IError | undefined;
    user:
    | IUser
    | undefined;
    /** wechat data */
    wechat: IWechatUserInfo | undefined;
}

export interface IListUsersResponse {
    error: IError | undefined;
    users: IUser[];
}

export interface IGetSessionTicketResponse {
    error: IError | undefined;
    ticket: string;
}

export interface IMigrateRequest {
    fromUserId: string;
    toUserId: string;
}

export interface IMigrateResponse {
    error: IError | undefined;
}
