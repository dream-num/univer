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

import * as UniverCore from '@univerjs/core';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { FRange } from '@univerjs/sheets/facade';
import * as ThreadComment from '@univerjs/thread-comment';
import { FTheadCommentBuilder, FThreadComment } from './f-thread-comment';

export type ISheetCellCommentCreateOptions = Pick<
    ThreadComment.ICreateThreadCommentOptions,
    'attachments' | 'dateTime' | 'id' | 'personId' | 'threadId'
>;

interface IRangeCommentDependencies {
    commandService: UniverCore.ICommandService;
    model: SheetsThreadCommentModel;
    userManagerService: UniverCore.UserManagerService;
}

function firstNonEmpty(...values: Array<string | undefined>): string {
    for (const value of values) {
        if (value) {
            return value;
        }
    }
    return UniverCore.generateRandomId();
}

/**
 * @ignore
 */
export interface IFRangeSheetsThreadCommentMixin {
    /**
     * Get the comment of the start cell in the current range.
     * @returns {FThreadComment | null} The comment of the start cell in the current range. If the cell does not have a comment, return `null`.
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const range = fWorksheet.getActiveRange();
     * const comment = range.getComment();
     * ```
     */
    getComment(): UniverCore.Nullable<FThreadComment>;

    /**
     * Get the comments in the current range.
     * @returns {FThreadComment[]} The comments in the current range.
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const range = fWorksheet.getActiveRange();
     * const comments = range.getComments();
     * comments.forEach((comment) => {
     *   console.log(comment.getRichText());
     * });
     * ```
     */
    getComments(): FThreadComment[];

    /**
     * Add a comment to the start cell in the current range.
     * @param content The content of the comment.
     * @param options Optional stable IDs, author, attachments, and creation time.
     * @returns Whether the comment is added successfully.
     * @throws {TypeError} If the content is empty.
     * @example
     * ```ts
     * await univerAPI.getActiveWorkbook()
     *   .getActiveSheet()
     *   .getRange('A1')
     *   .addCommentAsync('Verify this value.', { id: 'review-a1' });
     *
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText);
     * console.log(commentBuilder.content.toPlainText());
     *
     * // Add the comment to the cell A1
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const cell = fWorksheet.getRange('A1');
     * const result = await cell.addCommentAsync(commentBuilder);
     * console.log(result);
     * ```
     */
    addCommentAsync(
        content: ThreadComment.ThreadCommentContent | FTheadCommentBuilder,
        options?: ISheetCellCommentCreateOptions
    ): Promise<boolean>;

    /**
     * Clear the comment of the start cell in the current range.
     * @returns Whether the comment is cleared successfully.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook().getActiveSheet().getRange('A1');
     * const success = await range.clearCommentAsync();
     * console.log(success);
     * ```
     */
    clearCommentAsync(): Promise<boolean>;

    /**
     * Clear all of the comments in the current range.
     * @returns Whether the comments are cleared successfully.
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const range = fWorksheet.getActiveRange();
     * const success = await range.clearCommentsAsync();
     * ```
     */
    clearCommentsAsync(): Promise<boolean>;
}

/**
 * @ignore
 */
export class FRangeSheetsThreadCommentMixin extends FRange implements IFRangeSheetsThreadCommentMixin {
    declare private _dependencies: IRangeCommentDependencies;

    override _initialize(injector: UniverCore.Injector): void {
        this._dependencies = {
            commandService: injector.get(UniverCore.ICommandService),
            model: injector.get(SheetsThreadCommentModel),
            userManagerService: injector.get(UniverCore.UserManagerService),
        };
    }

    private _getCommentDataInRange(): ThreadComment.IThreadComment[] {
        const model = this._dependencies.model;
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();
        const comments: ThreadComment.IThreadComment[] = [];
        UniverCore.Range.foreach(this._range, (row, col) => {
            const commentId = model.getByLocation(unitId, sheetId, row, col);
            const comment = commentId ? model.getComment(unitId, sheetId, commentId) : null;
            if (comment) {
                comments.push(comment);
            }
        });
        return comments;
    }

    private _getStartCellCommentData(): ThreadComment.IThreadComment | null {
        const model = this._dependencies.model;
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();
        const commentId = model.getByLocation(unitId, sheetId, this._range.startRow, this._range.startColumn);
        return commentId ? model.getComment(unitId, sheetId, commentId) ?? null : null;
    }

    override getComment(): UniverCore.Nullable<FThreadComment> {
        const comment = this._getStartCellCommentData();
        return comment ? this._injector.createInstance(FThreadComment, comment) : null;
    }

    override getComments(): FThreadComment[] {
        return this._getCommentDataInRange().map((comment) => this._injector.createInstance(FThreadComment, comment));
    }

    override addCommentAsync(
        content: ThreadComment.ThreadCommentContent | FTheadCommentBuilder,
        options: ISheetCellCommentCreateOptions = {}
    ): Promise<boolean> {
        const { commandService, userManagerService } = this._dependencies;
        const currentComment = this._getStartCellCommentData();
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();
        const refStr = `${UniverCore.Tools.chatAtABC(this._range.startColumn)}${this._range.startRow + 1}`;
        const currentUser = userManagerService.getCurrentUser();
        let commentData: ThreadComment.IThreadComment | null = null;
        let text: UniverCore.IDocumentBody;
        if (content instanceof FTheadCommentBuilder) {
            commentData = content.build();
            text = commentData.text;
        } else {
            text = ThreadComment.normalizeThreadCommentContent(content);
        }

        return commandService.executeCommand(ThreadComment.AddCommentCommand.id, {
            unitId,
            subUnitId: sheetId,
            comment: {
                text,
                dT: options.dateTime ? ThreadComment.getDT(options.dateTime) : commentData?.dT || ThreadComment.getDT(),
                attachments: options.attachments ?? commentData?.attachments ?? [],
                id: firstNonEmpty(options.id, commentData?.id),
                ref: refStr,
                personId: firstNonEmpty(options.personId, commentData?.personId, currentUser.userID),
                parentId: currentComment?.id,
                unitId,
                subUnitId: sheetId,
                threadId: firstNonEmpty(currentComment?.threadId, options.threadId, commentData?.threadId),
            },
        });
    }

    override clearCommentAsync(): Promise<boolean> {
        const { commandService } = this._dependencies;
        const currentComment = this._getStartCellCommentData();
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();

        if (currentComment) {
            return commandService.executeCommand(ThreadComment.DeleteCommentTreeCommand.id, {
                unitId,
                subUnitId: sheetId,
                threadId: currentComment.threadId,
                commentId: currentComment.id,
            });
        }

        return Promise.resolve(true);
    }

    override async clearCommentsAsync(): Promise<boolean> {
        const { commandService } = this._dependencies;
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const results = await Promise.all(this._getCommentDataInRange().map((comment) => commandService.executeCommand(
            ThreadComment.DeleteCommentTreeCommand.id,
            { unitId, subUnitId, threadId: comment.threadId, commentId: comment.id }
        )));
        return results.every(Boolean);
    }
}

FRange.extend(FRangeSheetsThreadCommentMixin);
declare module '@univerjs/sheets/facade' {
    interface FRange extends IFRangeSheetsThreadCommentMixin { }
}
