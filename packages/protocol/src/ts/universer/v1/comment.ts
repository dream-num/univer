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

import type { CommentSolvedStatus } from '../../univer/colla-msg';
import type { IError } from '../../univer/constants/errors';
import type { IUser } from '../../univer/permission';

export interface IReply {
    threadId: string;
    replyId: string;
    content: string;
    userId: string;
    createTimestamp: number;
}

export interface IThread {
    threadId: string;
    solved: CommentSolvedStatus;
    replies: IReply[];
}

export interface IAddCommentRequest {
    memberId: string;
    unitId: string;
    content: string;
    mention: string[];
}

export interface IAddCommentResponse {
    error: IError | undefined;
    comment: IThread | undefined;
}

export interface IListCommentsRequest {
    unitId: string;
    threadId: string[];
}

export interface IListCommentsResponse {
    error: IError | undefined;
    comments: { [key: string]: IThread };
    users: { [key: string]: IUser };
}

export interface IReplyCommentRequest {
    memberId: string;
    unitId: string;
    threadId: string;
    content: string;
    mention: string[];
}

export interface IReplyCommentResponse {
    error: IError | undefined;
    reply: IReply | undefined;
}

export interface ISolvedCommentRequest {
    memberId: string;
    unitId: string;
    threadId: string;
    solved: CommentSolvedStatus;
}

export interface ISolvedCommentResponse {
    error: IError | undefined;
}

export interface IEditCommentRequest {
    memberId: string;
    unitId: string;
    threadId: string;
    replyId: string;
    content: string;
    mention: string[];
}

export interface IEditCommentResponse {
    error: IError | undefined;
}

export interface IDeleteCommentRequest {
    memberId: string;
    unitId: string;
    threadId: string;
    replyId?: string | undefined;
}

export interface IDeleteCommentResponse {
    error: IError | undefined;
}
