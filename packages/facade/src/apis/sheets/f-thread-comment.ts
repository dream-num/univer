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

import type { IDocumentBody } from '@univerjs/core';
import { ICommandService, Inject, Injector } from '@univerjs/core';
import type { IBaseComment, IDeleteCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import { DeleteCommentCommand, DeleteCommentTreeCommand, UpdateCommentCommand } from '@univerjs/thread-comment';
import { getDT } from '@univerjs/thread-comment-ui';

export class FThreadComment {
    constructor(
        private readonly _thread: IThreadComment | IBaseComment,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {
    }

    getIsRoot(): boolean {
        return !this._thread.parentId;
    }

    getCommentData(): IBaseComment {
        const { children, ...comment } = this._thread;
        return comment;
    }

    getChildren(): FThreadComment[] | undefined {
        return this._thread.children?.map((child) => this._injector.createInstance(FThreadComment, child));
    }

    delete(): boolean {
        return this._commandService.syncExecuteCommand(
            this.getIsRoot() ? DeleteCommentTreeCommand.id : DeleteCommentCommand.id,
            {
                commentId: this._thread.id,
                unitId: this._thread.unitId,
                subUnitId: this._thread.subUnitId,
            } as IDeleteCommentCommandParams
        );
    }

    update(content: IDocumentBody): boolean {
        return this._commandService.syncExecuteCommand(
            UpdateCommentCommand.id,
            {
                unitId: this._thread.unitId,
                subUnitId: this._thread.subUnitId,
                payload: {
                    commentId: this._thread.id,
                    text: content,
                    updated: true,
                    updateT: getDT(),
                },
            } as IUpdateCommentCommandParams
        );
    }
}
