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

import type { IDocumentBody, IRange, Workbook } from '@univerjs/core';
import type { IAddCommentCommandParams, IBaseComment, IDeleteCommentCommandParams, IResolveCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import { generateRandomId, ICommandService, Inject, Injector, IUniverInstanceService, RichTextBuilder, RichTextValue, Tools, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { FRange } from '@univerjs/sheets/facade';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, getDT, ResolveCommentCommand, UpdateCommentCommand } from '@univerjs/thread-comment';

/**
 * An readonly class that represents a comment.
 * @ignore
 */
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
     * const commentBuilder = univerAPI.newTheadComment();
     * console.log(commentBuilder);
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
     * const commentBuilder = univerAPI.newTheadComment();
     * console.log(commentBuilder.personId);
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
     * const commentBuilder = univerAPI.newTheadComment();
     * console.log(commentBuilder.dateTime);
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
     * const commentBuilder = univerAPI.newTheadComment();
     * console.log(commentBuilder.content);
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
     * const commentBuilder = univerAPI.newTheadComment();
     * console.log(commentBuilder.id);
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
     * const commentBuilder = univerAPI.newTheadComment();
     * console.log(commentBuilder.threadId);
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
     * const commentBuilder = univerAPI.newTheadComment();
     * const newCommentBuilder = commentBuilder.copy();
     * console.log(newCommentBuilder);
     * ```
     */
    copy(): FTheadCommentBuilder {
        return FTheadCommentBuilder.create(Tools.deepClone(this._comment));
    }
}

/**
 * A builder for thread comment. use {@link FUniver} `univerAPI.newTheadComment()` to create a new builder.
 */
export class FTheadCommentBuilder extends FTheadCommentItem {
    static override create(comment?: IThreadComment): FTheadCommentBuilder {
        return new FTheadCommentBuilder(comment);
    }

    /**
     * Set the content of the comment
     * @param {IDocumentBody | RichTextValue} content The content of the comment
     * @returns {FTheadCommentBuilder} The comment builder for chaining
     * @example
     * ```ts
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText);
     * console.log(commentBuilder.content);
     *
     * // Add the comment to the cell A1
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const cell = fWorksheet.getRange('A1');
     * const result = await cell.addCommentAsync(commentBuilder);
     * console.log(result);
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
     * @returns {FTheadCommentBuilder} The comment builder for chaining
     * @example
     * ```ts
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setPersonId('mock-user-id');
     * console.log(commentBuilder.personId);
     *
     * // Add the comment to the cell A1
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const cell = fWorksheet.getRange('A1');
     * const result = await cell.addCommentAsync(commentBuilder);
     * console.log(result);
     * ```
     */
    setPersonId(userId: string): FTheadCommentBuilder {
        this._comment.personId = userId;
        return this;
    }

    /**
     * Set the date time of the comment
     * @param {Date} date The date time of the comment
     * @returns {FTheadCommentBuilder} The comment builder for chaining
     * @example
     * ```ts
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setDateTime(new Date('2025-02-21 14:22:22'));
     * console.log(commentBuilder.dateTime);
     *
     * // Add the comment to the cell A1
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const cell = fWorksheet.getRange('A1');
     * const result = await cell.addCommentAsync(commentBuilder);
     * console.log(result);
     * ```
     */
    setDateTime(date: Date): FTheadCommentBuilder {
        this._comment.dT = getDT(date);
        return this;
    }

    /**
     * Set the id of the comment
     * @param {string} id The id of the comment
     * @returns {FTheadCommentBuilder} The comment builder for chaining
     * @example
     * ```ts
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setId('mock-comment-id');
     * console.log(commentBuilder.id);
     *
     * // Add the comment to the cell A1
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const cell = fWorksheet.getRange('A1');
     * const result = await cell.addCommentAsync(commentBuilder);
     * console.log(result);
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
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setThreadId('mock-thread-id');
     * console.log(commentBuilder.threadId);
     *
     * // Add the comment to the cell A1
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const cell = fWorksheet.getRange('A1');
     * const result = await cell.addCommentAsync(commentBuilder);
     * console.log(result);
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
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const comment = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setPersonId('mock-user-id')
     *   .setDateTime(new Date('2025-02-21 14:22:22'))
     *   .setId('mock-comment-id')
     *   .setThreadId('mock-thread-id')
     *   .build();
     * console.log(comment);
     * ```
     */
    build(): IThreadComment {
        return this._comment;
    }
}

/**
 * A class that represents a thread comment already in the sheet.
 */
export class FThreadComment {
    /**
     * @ignore
     */
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
     * @returns {boolean} Whether the comment is a root comment
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const comments = fWorksheet.getComments();
     * comments.forEach((comment) => {
     *   console.log(comment.getIsRoot());
     * });
     * ```
     */
    getIsRoot(): boolean {
        return !this._parent;
    }

    /**
     * Get the comment data
     * @returns {IBaseComment} The comment data
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const comments = fWorksheet.getComments();
     * comments.forEach((comment) => {
     *   console.log(comment.getCommentData());
     * });
     * ```
     */
    getCommentData(): IBaseComment {
        const { children, ...comment } = this._thread;
        return comment;
    }

    /**
     * Get the replies of the comment
     * @returns {FThreadComment[]} the replies of the comment
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const comments = fWorksheet.getComments();
     * comments.forEach((comment) => {
     *   if (comment.getIsRoot()) {
     *     const replies = comment.getReplies();
     *     replies.forEach((reply) => {
     *       console.log(reply.getCommentData());
     *     });
     *   }
     * });
     * ```
     */
    getReplies(): FThreadComment[] | undefined {
        const range = this._getRef();
        const comments = this._threadCommentModel.getCommentWithChildren(this._thread.unitId, this._thread.subUnitId, range.startRow, range.startColumn);

        return comments?.children?.map((child) => this._injector.createInstance(FThreadComment, child));
    }

    /**
     * Get the range of the comment
     * @returns {FRange | null} The range of the comment
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const comments = fWorksheet.getComments();
     * comments.forEach((comment) => {
     *   console.log(comment.getRange().getA1Notation());
     * });
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

    // eslint-disable-next-line
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
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const comments = fWorksheet.getComments();
     * comments.forEach((comment) => {
     *   console.log(comment.getRichText());
     * });
     * ```
     */
    getRichText(): RichTextValue {
        const body = this._thread.text;
        return RichTextValue.create({ body, documentStyle: {}, id: 'd' });
    }

    /**
     * Delete the comment and it's replies
     * @returns {Promise<boolean>} Whether the comment is deleted successfully
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const comments = fWorksheet.getComments();
     *
     * // Delete the first comment
     * const result = await comments[0]?.deleteAsync();
     * console.log(result);
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

    // eslint-disable-next-line
    /**
     * @deprecated use `deleteAsync` as instead.
     */
    delete(): Promise<boolean> {
        return this.deleteAsync();
    }

    // eslint-disable-next-line
    /**
     * @deprecated use `updateAsync` as instead
     */
    async update(content: IDocumentBody): Promise<boolean> {
        return this.updateAsync(content);
    }

    /**
     * Update the comment content
     * @param {IDocumentBody | RichTextValue} content The new content of the comment
     * @returns {Promise<boolean>} Whether the comment is updated successfully
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setId('mock-comment-id');
     * const cell = fWorksheet.getRange('A1');
     * await cell.addCommentAsync(commentBuilder);
     *
     * // Update the comment after 3 seconds
     * setTimeout(async () => {
     *   const comment = fWorksheet.getCommentById('mock-comment-id');
     *   const newRichText = univerAPI.newRichText().insertText('Hello Univer AI');
     *   const result = await comment.updateAsync(newRichText);
     *   console.log(result);
     * }, 3000);
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

    // eslint-disable-next-line
    /**
     * @deprecated use `resolveAsync` as instead
     */
    resolve(resolved?: boolean): Promise<boolean> {
        return this.resolveAsync(resolved);
    }

    /**
     * Resolve the comment
     * @param {boolean} resolved Whether the comment is resolved
     * @returns {Promise<boolean>} Set the comment to resolved or not operation result
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setId('mock-comment-id');
     * const cell = fWorksheet.getRange('A1');
     * await cell.addCommentAsync(commentBuilder);
     *
     * // Resolve the comment after 3 seconds
     * setTimeout(async () => {
     *   const comment = fWorksheet.getCommentById('mock-comment-id');
     *   const result = await comment.resolveAsync(true);
     *   console.log(result);
     * }, 3000);
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
     * @param {FTheadCommentBuilder} comment The comment to reply to
     * @returns {Promise<boolean>} Whether the comment is replied successfully
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setId('mock-comment-id');
     * const cell = fWorksheet.getRange('A1');
     * await cell.addCommentAsync(commentBuilder);
     *
     * // Reply to the comment
     * const replyText = univerAPI.newRichText().insertText('Hello Univer AI');
     * const reply = univerAPI.newTheadComment().setContent(replyText);
     * const comment = fWorksheet.getCommentById('mock-comment-id');
     * const result = await comment.replyAsync(reply);
     * console.log(result);
     * ```
     */
    replyAsync(comment: FTheadCommentBuilder): Promise<boolean> {
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
                    ref: this._parent?.ref || (this._thread as IThreadComment).ref,
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
