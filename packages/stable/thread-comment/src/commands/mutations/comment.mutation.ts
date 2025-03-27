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

import type { ICommand, IDocumentBody } from '@univerjs/core';
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import { CommandType } from '@univerjs/core';
import { ThreadCommentModel } from '../../models/thread-comment.model';

export interface IAddCommentMutationParams {
    unitId: string;
    subUnitId: string;
    comment: IThreadComment;
    sync?: boolean;
}

export const AddCommentMutation: ICommand<IAddCommentMutationParams> = {
    id: 'thread-comment.mutation.add-comment',
    type: CommandType.MUTATION,
    handler(accessor, params, options) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, comment, sync } = params;
        const shouldSync = sync || ((options?.fromChangeset) && !comment.parentId);
        return threadCommentModel.addComment(unitId, subUnitId, comment, shouldSync);
    },
};

export interface IUpdateCommentPayload {
    commentId: string;
    text: IDocumentBody;
    attachments?: string[];
    updated?: boolean;
    updateT?: string;
}

export interface IUpdateCommentMutationParams {
    unitId: string;
    subUnitId: string;
    payload: IUpdateCommentPayload;
    silent?: boolean;
}

export const UpdateCommentMutation: ICommand<IUpdateCommentMutationParams> = {
    id: 'thread-comment.mutation.update-comment',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, payload, silent } = params;
        return threadCommentModel.updateComment(unitId, subUnitId, payload, silent);
    },
};

export interface IUpdateCommentRefPayload {
    commentId: string;
    ref: string;
}

export interface IUpdateCommentRefMutationParams {
    unitId: string;
    subUnitId: string;
    payload: IUpdateCommentRefPayload;
    silent?: boolean;
}

export const UpdateCommentRefMutation: ICommand<IUpdateCommentRefMutationParams> = {
    id: 'thread-comment.mutation.update-comment-ref',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, payload, silent } = params;
        return threadCommentModel.updateCommentRef(unitId, subUnitId, payload, silent);
    },
};

export interface IResolveCommentMutationParams {
    unitId: string;
    subUnitId: string;
    commentId: string;
    resolved: boolean;
}

export const ResolveCommentMutation: ICommand<IResolveCommentMutationParams> = {
    id: 'thread-comment.mutation.resolve-comment',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, resolved, commentId } = params;
        return threadCommentModel.resolveComment(unitId, subUnitId, commentId, resolved);
    },
};

export interface IDeleteCommentMutationParams {
    unitId: string;
    subUnitId: string;
    commentId: string;
}

export const DeleteCommentMutation: ICommand<IDeleteCommentMutationParams> = {
    id: 'thread-comment.mutation.delete-comment',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const { unitId, subUnitId, commentId } = params;
        return threadCommentModel.deleteComment(unitId, subUnitId, commentId);
    },
};
