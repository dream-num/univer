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

import type { IDisposable, Injector } from '@univerjs/core';
import type { IAddCommentCommandParams, IDeleteCommentCommandParams, IResolveCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import type { IBeforeSheetCommentAddEvent, IBeforeSheetCommentDeleteEvent, IBeforeSheetCommentUpdateEvent, ISheetCommentAddEvent, ISheetCommentDeleteEvent, ISheetCommentResolveEvent, ISheetCommentUpdateEvent } from './f-event';
import { CanceledError, ICommandService, RichTextValue } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ResolveCommentCommand, UpdateCommentCommand } from '@univerjs/thread-comment';
import { FTheadCommentBuilder, FTheadCommentItem } from './f-thread-comment';

/**
 * @ignore
 */
export interface IFUniverCommentMixin {
    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CommentAdded, (params) => {})` as instead
     */
    onCommentAdded(callback: (event: ISheetCommentAddEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CommentUpdated, (params) => {})` as instead
     */
    onCommentUpdated(callback: (event: ISheetCommentUpdateEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CommentDeleted, (params) => {})` as instead
     */
    onCommentDeleted(callback: (event: ISheetCommentDeleteEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CommentResolved, (params) => {})` as instead
     */
    onCommentResolved(callback: (event: ISheetCommentResolveEvent) => void): IDisposable;

    /**
     * Create a new thread comment
     * @returns {FTheadCommentBuilder} The thead comment builder
     * @example
     * ```ts
     * // Create a new comment
     * const richText = univerAPI.newRichText().insertText('hello univer');
     * const commentBuilder = univerAPI.newTheadComment()
     *   .setContent(richText)
     *   .setPersonId('mock-user-id')
     *   .setDateTime(new Date('2025-02-21 14:22:22'))
     *   .setId('mock-comment-id')
     *   .setThreadId('mock-thread-id');
     *
     * // Add the comment to the cell A1
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const cell = fWorksheet.getRange('A1');
     * const result = await cell.addCommentAsync(commentBuilder);
     * console.log(result);
     * ```
     */
    newTheadComment(): FTheadCommentBuilder;
}

/**
 * @ignore
 */
export class FUniverCommentMixin extends FUniver implements IFUniverCommentMixin {
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);
        // After command events
        this.registerEventHandler(
            this.Event.CommentAdded,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== AddCommentCommand.id) return;
                const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
                if (!params) return;
                const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
                if (!worksheet) return;

                const addParams = commandInfo.params as IAddCommentCommandParams;
                const { comment } = addParams;
                const threadComment = worksheet.getRange(comment.ref).getComment();
                if (threadComment) {
                    this.fireEvent(this.Event.CommentAdded, {
                        workbook,
                        worksheet,
                        row: threadComment.getRange()?.getRow() ?? 0,
                        col: threadComment.getRange()?.getColumn() ?? 0,
                        comment: threadComment,
                    });
                }
            })
        );

        this.registerEventHandler(
            this.Event.CommentUpdated,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== UpdateCommentCommand.id) return;
                const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
                if (!params) return;
                const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
                if (!worksheet) return;

                const updateParams = commandInfo.params as IUpdateCommentCommandParams;
                const { commentId } = updateParams.payload;
                const threadComment = worksheet.getCommentById(commentId);
                if (threadComment) {
                    this.fireEvent(this.Event.CommentUpdated, {
                        workbook,
                        worksheet,
                        row: threadComment.getRange()?.getRow() ?? 0,
                        col: threadComment.getRange()?.getColumn() ?? 0,
                        comment: threadComment,
                    });
                }
            })
        );

        this.registerEventHandler(
            this.Event.CommentDeleted,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== DeleteCommentCommand.id && commandInfo.id !== DeleteCommentTreeCommand.id) return;
                const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
                if (!params) return;
                const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
                if (!worksheet) return;

                const deleteParams = commandInfo.params as IDeleteCommentCommandParams;
                const { commentId } = deleteParams;
                this.fireEvent(this.Event.CommentDeleted, {
                    workbook,
                    worksheet,
                    commentId,
                });
            })
        );

        this.registerEventHandler(
            this.Event.CommentResolved,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== ResolveCommentCommand.id) return;
                const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
                if (!params) return;
                const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
                if (!worksheet) return;

                const resolveParams = commandInfo.params as IResolveCommentCommandParams;
                const { commentId, resolved } = resolveParams;
                const threadComment = worksheet.getComments().find((c) => c.getCommentData().id === commentId);
                if (threadComment) {
                    this.fireEvent(this.Event.CommentResolved, {
                        workbook,
                        worksheet,
                        row: threadComment.getRange()!.getRow() ?? 0,
                        col: threadComment.getRange()!.getColumn() ?? 0,
                        comment: threadComment,
                        resolved,
                    });
                }
            })
        );

        // Before command events
        this.registerEventHandler(
            this.Event.BeforeCommentAdd,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== AddCommentCommand.id) return;
                const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
                if (!params) return;
                const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
                if (!worksheet) return;

                const addParams = commandInfo.params as IAddCommentCommandParams;
                const { comment } = addParams;
                const activeRange = worksheet.getActiveRange();
                if (!activeRange) return;
                const eventParams: IBeforeSheetCommentAddEvent = {
                    workbook,
                    worksheet,
                    row: activeRange.getRow() ?? 0,
                    col: activeRange.getColumn() ?? 0,
                    comment: FTheadCommentItem.create(comment),
                };

                this.fireEvent(this.Event.BeforeCommentAdd, eventParams);
                if (eventParams.cancel) {
                    throw new CanceledError();
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeCommentUpdate,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== UpdateCommentCommand.id) return;
                const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
                if (!params) return;
                const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
                if (!worksheet) return;

                const updateParams = commandInfo.params as IUpdateCommentCommandParams;
                const { commentId, text } = updateParams.payload;
                const threadComment = worksheet.getCommentById(commentId);
                if (threadComment) {
                    const eventParams: IBeforeSheetCommentUpdateEvent = {
                        workbook,
                        worksheet,
                        row: threadComment.getRange()?.getRow() ?? 0,
                        col: threadComment.getRange()?.getColumn() ?? 0,
                        comment: threadComment,
                        newContent: RichTextValue.createByBody(text),
                    };
                    this.fireEvent(this.Event.BeforeCommentUpdate, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeCommentDelete,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== DeleteCommentCommand.id && commandInfo.id !== DeleteCommentTreeCommand.id) return;
                const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
                if (!params) return;
                const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
                if (!worksheet) return;

                const deleteParams = commandInfo.params as IDeleteCommentCommandParams;
                const { commentId } = deleteParams;
                const threadComment = worksheet.getCommentById(commentId);
                if (threadComment) {
                    const eventParams: IBeforeSheetCommentDeleteEvent = {
                        workbook,
                        worksheet,
                        row: threadComment.getRange()?.getRow() ?? 0,
                        col: threadComment.getRange()?.getColumn() ?? 0,
                        comment: threadComment,
                    };
                    this.fireEvent(this.Event.BeforeCommentDelete, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeCommentResolve,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== ResolveCommentCommand.id) return;
                const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
                if (!params) return;
                const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
                if (!worksheet) return;

                const resolveParams = commandInfo.params as IResolveCommentCommandParams;
                const { commentId, resolved } = resolveParams;
                const threadComment = worksheet.getComments().find((c) => c.getCommentData().id === commentId);
                if (threadComment) {
                    const eventParams: ISheetCommentResolveEvent = {
                        workbook,
                        worksheet,
                        row: threadComment.getRange()!.getRow() ?? 0,
                        col: threadComment.getRange()!.getColumn() ?? 0,
                        comment: threadComment,
                        resolved,
                    };
                    this.fireEvent(this.Event.BeforeCommentResolve, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );
    }

    /**
     * @ignore
     */
    override newTheadComment(comment?: IThreadComment): FTheadCommentBuilder {
        return new FTheadCommentBuilder(comment);
    }
}

FUniver.extend(FUniverCommentMixin);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverCommentMixin {}
}
