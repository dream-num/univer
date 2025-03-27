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

import type { IDisposable } from '@univerjs/core';
import type { IAddCommentCommandParams } from '@univerjs/thread-comment';
import { ICommandService } from '@univerjs/core';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { FWorksheet } from '@univerjs/sheets/facade';
import { AddCommentCommand } from '@univerjs/thread-comment';
import { FThreadComment } from './f-thread-comment';

/**
 * @ignore
 */
export interface IFWorksheetCommentMixin {
    /**
     * Get all comments in the current sheet
     * @returns {FThreadComment[]} All comments in the current sheet
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const comments = fWorksheet.getComments();
     * comments.forEach((comment) => {
     *   const isRoot = comment.getIsRoot();
     *
     *   if (isRoot) {
     *     console.log('root comment:', comment.getCommentData());
     *
     *     const replies = comment.getReplies();
     *     replies.forEach((reply) => {
     *       console.log('reply comment:', reply.getCommentData());
     *     });
     *   }
     * });
     * ```
     */
    getComments(): FThreadComment[];

    /**
     * Clear all comments in the current sheet
     * @returns {Promise<boolean>} Whether the comments are cleared successfully.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const result = await fWorksheet.clearComments();
     * console.log(result);
     * ```
     */
    clearComments(): Promise<boolean>;

    /**
     * get comment by comment id
     * @param {string} commentId comment id
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
     * const comment = fWorksheet.getCommentById('mock-comment-id');
     * console.log(comment, comment?.getCommentData());
     * ```
     */
    getCommentById(commentId: string): FThreadComment | undefined;
}

/**
 * @ignore
 */
export class FWorksheetCommentMixin extends FWorksheet implements IFWorksheetCommentMixin {
    override getComments(): FThreadComment[] {
        const sheetsTheadCommentModel = this._injector.get(SheetsThreadCommentModel);
        const comments = sheetsTheadCommentModel.getSubUnitAll(this._workbook.getUnitId(), this._worksheet.getSheetId());
        return comments.map((comment) => this._injector.createInstance(FThreadComment, comment));
    }

    override clearComments(): Promise<boolean> {
        const comments = this.getComments();
        const promises = comments.map((comment) => comment.deleteAsync());

        return Promise.all(promises).then(() => true);
    }

    /**
     * Subscribe to comment events.
     * @param callback Callback function, param contains comment info and target cell.
     */
    onCommented(callback: (params: IAddCommentCommandParams) => void): IDisposable {
        const commandService = this._injector.get(ICommandService);
        return commandService.onCommandExecuted((command) => {
            if (command.id === AddCommentCommand.id) {
                const params = command.params as IAddCommentCommandParams;
                callback(params);
            }
        });
    }

    override getCommentById(commentId: string): FThreadComment | undefined {
        const sheetsTheadCommentModel = this._injector.get(SheetsThreadCommentModel);
        const comment = sheetsTheadCommentModel.getComment(this._workbook.getUnitId(), this._worksheet.getSheetId(), commentId);
        if (comment) {
            return this._injector.createInstance(FThreadComment, comment);
        }
    }
}

FWorksheet.extend(FWorksheetCommentMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetCommentMixin {}
}
