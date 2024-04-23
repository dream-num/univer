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

import { CommandType, type ICommand } from '@univerjs/core';
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import { ThreadCommentModel } from '../../models/thread-comment.model';
import type { IUpdateCommentPayload } from '../mutations/comment.mutation';

export interface IAddCommentCommandParams {
    unitId: string;
    subUnitId: string;
    comment: IThreadComment;
}

export const AddCommentCommand: ICommand<IAddCommentCommandParams> = {
    id: 'thread-comment.command.add-comment',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, comment } = params;
        threadCommentModel.addComment(unitId, subUnitId, comment);
        return true;
    },
};


export interface IUpdateCommentCommandParams {
    unitId: string;
    subUnitId: string;
    payload: IUpdateCommentPayload;
}


export const UpdateCommentCommand: ICommand<IUpdateCommentCommandParams> = {
    id: 'thread-comment.command.update-comment',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, payload } = params;
        threadCommentModel.updateComment(unitId, subUnitId, payload);
        return true;
    },
};

export interface IUpdateCommentRefPayload {
    commentId: string;
    ref: string;
}

export interface IUpdateCommentPositionCommandParams {
    unitId: string;
    subUnitId: string;
    payload: IUpdateCommentRefPayload;
}

export const UpdateCommentPositionCommand: ICommand<IUpdateCommentPositionCommandParams> = {
    id: 'thread-comment.command.update-comment',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, payload } = params;
        threadCommentModel.updateCommentRef(unitId, subUnitId, payload);
        return true;
    },
};


export interface IResolveCommentCommandParams {
    unitId: string;
    subUnitId: string;
    commentId: string;
    resolved: boolean;
}

export const ResolveCommentCommand: ICommand<IResolveCommentCommandParams> = {
    id: 'thread-comment.command.resolve-comment',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, resolved, commentId } = params;
        threadCommentModel.resolveComment(unitId, subUnitId, commentId, resolved);
        return true;
    },
};


export interface IDeleteCommentCommandParams {
    unitId: string;
    subUnitId: string;
    commentId: string;
}

export const DeleteCommentCommand: ICommand<IDeleteCommentCommandParams> = {
    id: 'thread-comment.command.delete-comment',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, commentId } = params;
        threadCommentModel.deleteComment(unitId, subUnitId, commentId);
        return true;
    },
};
