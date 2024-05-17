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

import { CommandType, type ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import { ThreadCommentModel } from '../../models/thread-comment.model';
import { AddCommentMutation, DeleteCommentMutation, type IUpdateCommentPayload, ResolveCommentMutation, UpdateCommentMutation } from '../mutations/comment.mutation';

export interface IAddCommentCommandParams {
    unitId: string;
    subUnitId: string;
    comment: IThreadComment;
}

export const AddCommentCommand: ICommand<IAddCommentCommandParams> = {
    id: 'thread-comment.command.add-comment',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, comment } = params;
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
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, payload } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const currentComment = threadCommentModel.getComment(
            unitId,
            subUnitId,
            payload.commentId
        );

        if (!currentComment) {
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
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, payload } = params;
        const currentComment = threadCommentModel.getComment(unitId, subUnitId, payload.commentId);
        if (!currentComment) {
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
    handler(accessor, params) {
        if (!params) {
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
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, commentId } = params;

        const comment = threadCommentModel.getComment(unitId, subUnitId, commentId);
        if (!comment) {
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
        commandService.executeCommand(redo.id, redo.params);
        return true;
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
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, commentId } = params;
        threadCommentModel.deleteComment(unitId, subUnitId, commentId);
        const commentWithChildren = threadCommentModel.getCommentWithChildren(unitId, subUnitId, commentId);
        if (!commentWithChildren) {
            return false;
        }
        const redos = [commentWithChildren.root, ...commentWithChildren.children].map((item) => ({
            id: DeleteCommentMutation.id,
            params: {
                unitId,
                subUnitId,
                commentId: item.id,
            },
        }));

        const undos = [commentWithChildren.root, ...commentWithChildren.children].map((item) => ({
            id: AddCommentMutation.id,
            params: {
                unitId,
                subUnitId,
                comment: item,
            },
        }));

        undoRedoService.pushUndoRedo({
            undoMutations: undos,
            redoMutations: redos,
            unitID: unitId,
        });

        return true;
    },
};
