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
import { generateRandomId, ICommandService, Inject, Injector, IUniverInstanceService, RichTextBuilder, RichTextValue, Tools, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { FRange } from '@univerjs/sheets/facade';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, getDT, ResolveCommentCommand, UpdateCommentCommand } from '@univerjs/thread-comment';

export class FTheadCommentItem {
    protected _comment: IThreadComment = {
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

    /**
     * Create a new FTheadCommentItem
     * @param {IThreadComment|undefined} comment The comment
     * @returns {FTheadCommentItem} A new instance of FTheadCommentItem
     * @example
     * ```ts
     * const comment = univerAPI.newTheadComment();
     * ```
     */
    static create(comment?: IThreadComment): FTheadCommentItem {
        return new FTheadCommentItem(comment);
    }

    constructor(comment?: IThreadComment) {
        if (comment) {
            this._comment = comment;
        }
    }

    /**
     * Get the person id of the comment
     * @returns {string} The person id of the comment
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const personId = comment.personId;
     * ```
     */
    get personId(): string {
        return this._comment.personId;
    }

    /**
     * Get the date time of the comment
     * @returns {string} The date time of the comment
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const dateTime = comment.dateTime;
     * ```
     */
    get dateTime(): string {
        return this._comment.dT;
    }

    /**
     * Get the content of the comment
     * @returns {RichTextValue} The content of the comment
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const content = comment.content;
     * ```
     */
    get content(): RichTextValue {
        return RichTextValue.createByBody(this._comment.text);
    }

    /**
     * Get the id of the comment
     * @returns {string} The id of the comment
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const id = comment.id;
     * ```
     */
    get id(): string {
        return this._comment.id;
    }

    /**
     * Get the thread id of the comment
     * @returns {string} The thread id of the comment
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const threadId = comment.threadId;
     * ```
     */
    get threadId(): string {
        return this._comment.threadId;
    }

    /**
     * Copy the comment
     * @returns {FTheadCommentBuilder} The comment builder
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const newComment = comment.copy();
     * ```
     */
    copy(): FTheadCommentBuilder {
        return FTheadCommentBuilder.create(Tools.deepClone(this._comment));
    }
}

export class FTheadCommentBuilder extends FTheadCommentItem {
    static override create(comment?: IThreadComment): FTheadCommentBuilder {
        return new FTheadCommentBuilder(comment);
    }

    /**
     * Set the content of the comment
     * @param {IDocumentBody | RichTextValue} content The content of the comment
     * @returns {FTheadCommentBuilder} The comment builder
     * @example
     * ```ts
     * const comment = univerAPI.newTheadComment()
     *  .setContent(univerAPI.newRichText().insertText('hello zhangsan'));
     * ```
     */
    setContent(content: IDocumentBody | RichTextValue): FTheadCommentBuilder {
        if (content instanceof RichTextValue) {
            this._comment.text = content.getData().body!;
        } else {
            this._comment.text = content;
        }
        return this;
    }

    /**
     * Set the person id of the comment
     * @param {string} userId The person id of the comment
     * @returns {FTheadCommentBuilder} The comment builder
     * @example
     * ```ts
     * const comment = univerAPI.newTheadComment()
     *  .setPersonId('123');
     * ```
     */
    setPersonId(userId: string): FTheadCommentBuilder {
        this._comment.personId = userId;
        return this;
    }

    /**
     * Set the date time of the comment
     * @param {Date} date The date time of the comment
     * @returns {FTheadCommentBuilder} The comment builder
     * @example
     * ```ts
     * const comment = univerAPI.newTheadComment()
     *  .setDateTime(new Date());
     * ```
     */
    setDateTime(date: Date): FTheadCommentBuilder {
        this._comment.dT = getDT(date);
        return this;
    }

    /**
     * Set the id of the comment
     * @param {string} id The id of the comment
     * @returns {FTheadCommentBuilder} The comment builder
     * @example
     * ```ts
     * const comment = univerAPI.newTheadComment()
     *  .setId('123');
     * ```
     */
    setId(id: string): FTheadCommentBuilder {
        this._comment.id = id;
        return this;
    }

    /**
     * Set the thread id of the comment
     * @param {string} threadId The thread id of the comment
     * @returns {FTheadCommentBuilder} The comment builder
     * @example
     * ```ts
     * const comment = univerAPI.newTheadComment()
     *  .setThreadId('123');
     * ```
     */
    setThreadId(threadId: string): FTheadCommentBuilder {
        this._comment.threadId = threadId;
        return this;
    }

    /**
     * Build the comment
     * @returns {IThreadComment} The comment
     * @example
     * ```ts
     * const comment = univerAPI.newTheadComment()
     *  .setContent(univerAPI.newRichText().insertText('hello zhangsan'))
     *  .build();
     * ```
     */
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
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const isRoot = comment.getIsRoot();
     * ```
     */
    getIsRoot(): boolean {
        return !this._parent;
    }

    /**
     * Get the comment data
     * @returns The comment data
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const commentData = comment.getCommentData();
     * ```
     */
    getCommentData(): IBaseComment {
        const { children, ...comment } = this._thread;
        return comment;
    }

    /**
     * Get the replies of the comment
     * @returns the replies of the comment
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const replies = comment.getReplies();
     * ```
     */
    getReplies(): FThreadComment[] | undefined {
        const range = this._getRef();
        const comments = this._threadCommentModel.getCommentWithChildren(this._thread.unitId, this._thread.subUnitId, range.startRow, range.startColumn);

        return comments?.children?.map((child) => this._injector.createInstance(FThreadComment, child));
    }

    /**
     * Get the range of the comment
     * @returns The range of the comment
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const range = comment.getRange();
     * ```
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

    /**
     * Get the rich text of the comment
     * @returns {RichTextValue} The rich text of the comment
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const richText = comment.getRichText();
     * ```
     */
    getRichText(): RichTextValue {
        const body = this._thread.text;
        return RichTextValue.create({ body, documentStyle: {}, id: 'd' });
    }

    /**
     * Delete the comment and it's replies
     * @returns {Promise<boolean>} success or not
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const success = await comment.deleteAsync();
     * ```
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
     * @param content
     * @deprecated use `updateAsync` as instead
     */
    async update(content: IDocumentBody): Promise<boolean> {
        return this.updateAsync(content);
    }

    /**
     * Update the comment content
     * @param content The new content of the comment
     * @returns success or not
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     * const success = await comment.updateAsync(univerAPI.newRichText().insertText('hello zhangsan'));
     * ```
     */
    async updateAsync(content: IDocumentBody | RichTextValue): Promise<boolean> {
        const body = content instanceof RichTextValue ? content.getData().body : content;
        const dt = getDT();
        const res = await this._commandService.executeCommand(
            UpdateCommentCommand.id,
            {
                unitId: this._thread.unitId,
                subUnitId: this._thread.subUnitId,
                payload: {
                    commentId: this._thread.id,
                    text: body,
                    updated: true,
                    updateT: dt,
                },
            } as IUpdateCommentCommandParams
        );

        return res;
    }

    /**
     * @param resolved
     * @deprecated use `resolveAsync` as instead
     */
    resolve(resolved?: boolean): Promise<boolean> {
        return this.resolveAsync(resolved);
    }

     /**
      * Resolve the comment
      * @param resolved Whether the comment is resolved
      * @returns success or not
      * @example
      * ```ts
      * const comment = univerAPI.getActiveWorkbook()
      *  .getSheetById(sheetId)
      *  .getCommentById(commentId);
      * const success = await comment.resolveAsync(true);
      * ```
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
     * @example
     * ```ts
     * const comment = univerAPI.getActiveWorkbook()
     *  .getSheetById(sheetId)
     *  .getCommentById(commentId);
     *
     * const reply = univerAPI.newTheadComment()
     *  .setContent(univerAPI.newRichText().insertText('hello zhangsan'));
     *
     * const success = await comment.replyAsync(reply);
     * ```
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
