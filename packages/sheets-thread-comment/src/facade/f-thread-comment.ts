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
import type { IAddCommentCommandParams, IBaseComment, IDeleteCommentCommandParams, IResolveCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import { generateRandomId, ICommandService, Inject, Injector, IUniverInstanceService, RichTextBuilder, RichTextValue, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { FRange } from '@univerjs/sheets/facade';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, getDT, ResolveCommentCommand, UpdateCommentCommand } from '@univerjs/thread-comment';

export class FTheadCommentBuilder {
    private _comment: IThreadComment = {
        id: generateRandomId(),
        ref: '',
        threadId: '',
        dT: '',
        personId: '',
        text: RichTextBuilder.newEmptyData().body!,
        attachments: [],
        unitId: '',
        subUnitId: '',
    };

    create(): FTheadCommentBuilder {
        return new FTheadCommentBuilder();
    }

    setContent(content: IDocumentBody | RichTextValue): FTheadCommentBuilder {
        if (content instanceof RichTextValue) {
            this._comment.text = content.getData().body!;
        } else {
            this._comment.text = content;
        }
        return this;
    }

    setPersonId(userId: string): FTheadCommentBuilder {
        this._comment.personId = userId;
        return this;
    }

    setDT(date: Date): FTheadCommentBuilder {
        this._comment.dT = getDT(date);
        return this;
    }

    setId(id: string): FTheadCommentBuilder {
        this._comment.id = id;
        return this;
    }

    setThreadId(threadId: string): FTheadCommentBuilder {
        this._comment.threadId = threadId;
        return this;
    }

    get personId(): string {
        return this._comment.personId;
    }

    get dT(): string {
        return this._comment.dT;
    }

    get content(): RichTextValue {
        return RichTextValue.createByBody(this._comment.text);
    }

    get id(): string {
        return this._comment.id;
    }

    get threadId(): string {
        return this._comment.threadId;
    }

    build(): IThreadComment {
        return this._comment;
    }
}

export class FThreadComment {
    constructor(
        private readonly _thread: IThreadComment | IBaseComment,
        private readonly _parent: IThreadComment | undefined,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsThreadCommentModel) private readonly _threadCommentModel: SheetsThreadCommentModel,
        @Inject(UserManagerService) private readonly _userManagerService: UserManagerService
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
     * @deprecated use `getRichText` as instead
     */
    getContent(): IDocumentBody {
        return this._thread.text;
    }

    getRichText(): RichTextValue {
        const body = this._thread.text;
        return RichTextValue.create({ body, documentStyle: {}, id: 'd' });
    }

    /**
     * Delete the comment and it's replies
     * @returns success or not
     */
    deleteAsync(): Promise<boolean> {
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
     * @deprecated use `deleteAsync` as instead.
     */
    delete(): Promise<boolean> {
        return this.deleteAsync();
    }

    /**
     * @deprecated use `updateAsync` as instead
     */
    async update(content: IDocumentBody): Promise<boolean> {
        return this.updateAsync(content);
    }

    /**
     * Update the comment content
     * @param content The new content of the comment
     * @returns success or not
     */
    async updateAsync(content: IDocumentBody): Promise<boolean> {
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
     * @deprecated use `resolveAsync` as instead
     */
    resolve(resolved?: boolean): Promise<boolean> {
        return this.resolveAsync(resolved);
    }

     /**
      * Resolve the comment
      * @param resolved Whether the comment is resolved
      * @returns success or not
      */
    resolveAsync(resolved?: boolean): Promise<boolean> {
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

    /**
     * Reply to the comment
     * @param comment The comment to reply to
     * @returns success or not
     */
    async replyAsync(comment: FTheadCommentBuilder): Promise<boolean> {
        const commentData = comment.build();
        return this._commandService.executeCommand(
            AddCommentCommand.id,
            {
                unitId: this._thread.unitId,
                subUnitId: this._thread.subUnitId,
                comment: {

                    id: generateRandomId(),
                    parentId: this._thread.id,
                    threadId: this._thread.threadId,
                    ref: this._parent?.ref,
                    unitId: this._thread.unitId,
                    subUnitId: this._thread.subUnitId,
                    text: commentData.text,
                    attachments: commentData.attachments,
                    dT: commentData.dT || getDT(),
                    personId: commentData.personId || this._userManagerService.getCurrentUser().userID,
                },
            } as IAddCommentCommandParams
        );
    }
}
