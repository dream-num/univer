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

import { CommandType, type ICommand, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import { ThreadCommentModel } from '../../models/thread-comment.model';
import { AddCommentMutation, DeleteCommentMutation, type IUpdateCommentPayload, ResolveCommentMutation, UpdateCommentMutation } from '../mutations/comment.mutation';
import { IThreadCommentDataSourceService } from '../../services/tc-datasource.service';

export interface IAddCommentCommandParams {
    unitId: string;
    subUnitId: string;
    comment: IThreadComment;
}

export const AddCommentCommand: ICommand<IAddCommentCommandParams> = {
    id: 'thread-comment.command.add-comment',
    type: CommandType.COMMAND,
    async  handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const { unitId, subUnitId, comment: originComment } = params;
        const comment = await dataSourceService.addComment(originComment);
        const redo = {
            id: AddCommentMutation.id,
            params,
        };
        const undo = {
            id: DeleteCommentMutation.id,
            params: {
                unitId,
                subUnitId,
                commentId: comment.id,
            },
        };
        undoRedoService.pushUndoRedo({
            undoMutations: [undo],
            redoMutations: [redo],
            unitID: unitId,
        });
        commandService.executeCommand(redo.id, redo.params);
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
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, payload } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const currentComment = threadCommentModel.getComment(
            unitId,
            subUnitId,
            payload.commentId
        );

        if (!currentComment) {
            return false;
        }

        const success = await dataSourceService.updateComment({
            ...currentComment,
            ...payload,
        });

        if (!success) {
            return false;
        }

        const redo = {
            id: UpdateCommentMutation.id,
            params,
        };
        const undo = {
            id: UpdateCommentMutation.id,
            params: {
                unitId,
                subUnitId,
                payload: {
                    commentId: payload.commentId,
                    text: currentComment.text,
                    attachments: currentComment.attachments,
                    updateT: currentComment.updateT,
                    updated: currentComment.updated,
                },
            },
        };
        undoRedoService.pushUndoRedo({
            undoMutations: [undo],
            redoMutations: [redo],
            unitID: unitId,
        });
        commandService.executeCommand(redo.id, redo.params);
        return true;
    },
};

export interface IUpdateCommentRefPayload {
    commentId: string;
    ref: string;
}

export interface IUpdateCommentRefCommandParams {
    unitId: string;
    subUnitId: string;
    payload: IUpdateCommentRefPayload;
}

export const UpdateCommentRefCommand: ICommand<IUpdateCommentRefCommandParams> = {
    id: 'thread-comment.command.update-comment-ref',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, payload } = params;
        const currentComment = threadCommentModel.getComment(unitId, subUnitId, payload.commentId);

        if (!currentComment) {
            return false;
        }

        const success = await dataSourceService.updateComment({
            ...currentComment,
            ref: payload.ref,
        });
        if (!success) {
            return false;
        }
        const redo = {
            id: UpdateCommentMutation.id,
            params,
        };
        const undo = {
            id: UpdateCommentMutation.id,
            params: {
                unitId,
                subUnitId,
                payload: {
                    commentId: payload.commentId,
                    ref: currentComment.ref,
                },
            },
        };
        undoRedoService.pushUndoRedo({
            undoMutations: [undo],
            redoMutations: [redo],
            unitID: unitId,
        });
        commandService.executeCommand(redo.id, redo.params);
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
    type: CommandType.COMMAND,
    async  handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, resolved, commentId } = params;
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const currentComment = threadCommentModel.getComment(unitId, subUnitId, commentId);

        if (!currentComment) {
            return false;
        }

        const success = await dataSourceService.updateComment({
            ...currentComment,
            resolved,
        });
        if (!success) {
            return false;
        }
        const commandService = accessor.get(ICommandService);

        commandService.executeCommand(
            ResolveCommentMutation.id,
            params
        );
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
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, commentId } = params;

        const comment = threadCommentModel.getComment(unitId, subUnitId, commentId);
        if (!comment) {
            return false;
        }

        if (!(await dataSourceService.deleteComment(commentId))) {
            return false;
        }

        const redo = {
            id: DeleteCommentMutation.id,
            params,
        };
        const undo = {
            id: AddCommentMutation.id,
            params: {
                unitId,
                subUnitId,
                comment,
            },
        };
        undoRedoService.pushUndoRedo({
            undoMutations: [undo],
            redoMutations: [redo],
            unitID: unitId,
        });
        return commandService.executeCommand(redo.id, redo.params);
    },
};

export interface IDeleteCommentTreeCommandParams {
    unitId: string;
    subUnitId: string;
    commentId: string;
}

export const DeleteCommentTreeCommand: ICommand<IDeleteCommentCommandParams> = {
    id: 'thread-comment.command.delete-comment-tree',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const commandService = accessor.get(ICommandService);
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, commentId } = params;

        const commentWithChildren = threadCommentModel.getCommentWithChildren(unitId, subUnitId, commentId);
        if (!commentWithChildren) {
            return false;
        }
        const comments = [commentWithChildren.root, ...commentWithChildren.children];

        if (!(await dataSourceService.deleteCommentBatch(comments.map((comment) => comment.id)))) {
            return false;
        }

        const redos = comments.map((item) => ({
            id: DeleteCommentMutation.id,
            params: {
                unitId,
                subUnitId,
                commentId: item.id,
            },
        }));

        const undos = comments.map((item) => ({
            id: AddCommentMutation.id,
            params: {
                unitId,
                subUnitId,
                comment: item,
            },
        }));

        const result = sequenceExecute(redos, commandService);

        if (result.result) {
            undoRedoService.pushUndoRedo({
                undoMutations: undos,
                redoMutations: redos,
                unitID: unitId,
            });
        }

        return result.result;
    },
};
