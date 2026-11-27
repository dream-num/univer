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
import { Disposable, ICommandService, Inject, LocaleService } from '@univerjs/core';
import { SheetPermissionCheckController } from '@univerjs/sheets';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    IThreadCommentAuthzService,
    ResolveCommentCommand,
    ThreadCommentModel,
    UpdateCommentCommand,
} from '@univerjs/thread-comment';
import type { LocaleKey } from '../locale/types';

/**
 * Blocks comment writes for sheets in the base package, so headless integrations
 * get the same permission denial as the UI. The UI toast is rendered by
 * `@univerjs/sheets-ui`, which subscribes to the permission event.
 */
export class SheetsThreadCommentPermissionController extends Disposable {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController,
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

        this._sheetPermissionCheckController.blockExecuteWithoutPermission(
            this._localeService.t<LocaleKey>('sheets-thread-comment.permission.commentErr')
        );
    }
}
