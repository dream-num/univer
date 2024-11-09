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

import type { IDocumentBody, IRange, Workbook } from '@univerjs/core';
import type { IBaseComment, IDeleteCommentCommandParams, IResolveCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import { ICommandService, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { FRange } from '@univerjs/sheets/facade';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { DeleteCommentCommand, DeleteCommentTreeCommand, getDT, ResolveCommentCommand, UpdateCommentCommand } from '@univerjs/thread-comment';

export class FThreadComment {
    constructor(
        private readonly _thread: IThreadComment | IBaseComment,
        private readonly _parent: IThreadComment | undefined,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsThreadCommentModel) private readonly _threadCommentModel: SheetsThreadCommentModel
    ) {
    }

    private _getRef(): IRange {
        const ref = this._parent?.ref || (this._thread as IThreadComment).ref;
        const range = deserializeRangeWithSheet(ref);

        return range.range;
    }

    /**
     * Whether the comment is a root comment
     * @returns Whether the comment is a root comment
     */
    getIsRoot(): boolean {
        return !this._parent;
    }

    /**
     * Get the comment data
     * @returns The comment data
     */
    getCommentData(): IBaseComment {
        const { children, ...comment } = this._thread;
        return comment;
    }

    /**
     * Get the replies of the comment
     * @returns the replies of the comment
     */
    getReplies(): FThreadComment[] | undefined {
        const range = this._getRef();
        const comments = this._threadCommentModel.getCommentWithChildren(this._thread.unitId, this._thread.subUnitId, range.startRow, range.startColumn);

        return comments?.children?.map((child) => this._injector.createInstance(FThreadComment, child));
    }

    /**
     * Get the range of the comment
     * @returns The range of the comment
     */
    getRange(): FRange | null {
        const workbook = this._univerInstanceService.getUnit<Workbook>(this._thread.unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }
        const worksheet = workbook.getSheetBySheetId(this._thread.subUnitId);
        if (!worksheet) {
            return null;
        }
        const range = this._getRef();
        return this._injector.createInstance(FRange, workbook, worksheet, range);
    }

    /**
     * Get the content of the comment
     * @returns The content of the comment
     */
    getContent(): IDocumentBody {
        return this._thread.text;
    }

    /**
     * Delete the comment and it's replies
     * @returns success or not
     */
    delete(): Promise<boolean> {
        return this._commandService.executeCommand(
            this.getIsRoot() ? DeleteCommentTreeCommand.id : DeleteCommentCommand.id,
            {
                commentId: this._thread.id,
                unitId: this._thread.unitId,
                subUnitId: this._thread.subUnitId,
            } as IDeleteCommentCommandParams
        );
    }

    /**
     * Update the comment content
     * @param content The new content of the comment
     * @returns success or not
     */
    async update(content: IDocumentBody): Promise<boolean> {
        const dt = getDT();
        const res = await this._commandService.executeCommand(
            UpdateCommentCommand.id,
            {
                unitId: this._thread.unitId,
                subUnitId: this._thread.subUnitId,
                payload: {
                    commentId: this._thread.id,
                    text: content,
                    updated: true,
                    updateT: dt,
                },
            } as IUpdateCommentCommandParams
        );

        return res;
    }

    /**
     * Resolve the comment
     * @param resolved Whether the comment is resolved
     * @returns success or not
     */
    resolve(resolved?: boolean): Promise<boolean> {
        return this._commandService.executeCommand(
            ResolveCommentCommand.id,
            {
                unitId: this._thread.unitId,
                subUnitId: this._thread.subUnitId,
                commentId: this._thread.id,
                resolved: resolved ?? !this._thread.resolved,
            } as IResolveCommentCommandParams
        );
    }
}
