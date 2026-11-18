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

import type { ICommandInfo } from '@univerjs/core';
import type {
    IAddCommentCommandParams,
    IDeleteCommentCommandParams,
    IDeleteCommentTreeCommandParams,
    IResolveCommentCommandParams,
    IUpdateCommentCommandParams,
    ThreadCommentWriteAction,
} from '@univerjs/thread-comment';
import { CustomCommandExecutionError, Disposable, ErrorService, ICommandService, Inject } from '@univerjs/core';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    IThreadCommentAuthzService,
    ResolveCommentCommand,
    ThreadCommentModel,
    UpdateCommentCommand,
} from '@univerjs/thread-comment';

/**
 * Enforces comment permissions for docs in the base package. The generic
 * permission-denied notification is rendered by `@univerjs/ui`.
 */
export class DocsThreadCommentPermissionController extends Disposable {
    constructor(
        @Inject(ErrorService) private readonly _errorService: ErrorService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel,
        @Inject(IThreadCommentAuthzService) private readonly _authzService: IThreadCommentAuthzService
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                const { id } = command;
                if (!command.params) {
                    return;
                }

                if (id === AddCommentCommand.id) {
                    const { unitId, subUnitId, comment } = command.params as IAddCommentCommandParams;
                    this._checkWrite(comment.parentId ? 'reply' : 'add', unitId, subUnitId, comment.ref, comment.personId);
                } else if (id === UpdateCommentCommand.id) {
                    const { unitId, subUnitId, payload } = command.params as IUpdateCommentCommandParams;
                    const comment = this._threadCommentModel.getComment(unitId, subUnitId, payload.commentId);

                    if (comment) {
                        this._checkWrite('update', unitId, subUnitId, comment.ref, comment.personId);
                    }
                } else if (id === ResolveCommentCommand.id || id === DeleteCommentCommand.id || id === DeleteCommentTreeCommand.id) {
                    const params = command.params as IResolveCommentCommandParams | IDeleteCommentCommandParams | IDeleteCommentTreeCommandParams;
                    const { unitId, subUnitId, commentId } = params;
                    const action = id === ResolveCommentCommand.id ? 'resolve' : 'delete';
                    const comment = action === 'delete' && id === DeleteCommentTreeCommand.id
                        ? this._threadCommentModel.getCommentWithChildren(unitId, subUnitId, commentId)?.root
                        : this._threadCommentModel.getComment(unitId, subUnitId, commentId);

                    if (comment) {
                        this._checkWrite(action, unitId, subUnitId, comment.ref, comment.personId);
                    }
                }
            })
        );
    }

    private _checkWrite(
        action: ThreadCommentWriteAction,
        unitId: string,
        subUnitId: string,
        ref: string,
        personId: string
    ) {
        if (this._authzService.canWrite(action, { unitId, subUnitId, ref, personId })) {
            return;
        }

        this._errorService.emitPermissionDenied(unitId);
        throw new CustomCommandExecutionError(`Thread comment ${action} permission denied.`);
    }
}
