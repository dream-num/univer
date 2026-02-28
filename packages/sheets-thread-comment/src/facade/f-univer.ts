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
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { IAddCommentCommandParams, IDeleteCommentCommandParams, IResolveCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import type { IBeforeSheetCommentAddEvent, IBeforeSheetCommentDeleteEvent, IBeforeSheetCommentUpdateEvent, ISheetCommentAddEvent, ISheetCommentDeleteEvent, ISheetCommentResolveEvent, ISheetCommentUpdateEvent } from './f-event';
import { CanceledError, ICommandService, RichTextValue } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
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
    private _getTargetSheet(params: { unitId?: string; subUnitId?: string } = {}): {
        workbook: FWorkbook;
        worksheet: FWorksheet;
    } | null {
        const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
        if (!workbook) return null;
        const worksheet = params.subUnitId ? workbook.getSheetBySheetId(params.subUnitId) : workbook.getActiveSheet();
        if (!worksheet) return null;

        return {
            workbook,
            worksheet,
        };
    }

    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        // After command events
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.CommentAdded,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== AddCommentCommand.id) return;

                    const target = this._getTargetSheet(commandInfo.params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { comment } = commandInfo.params as IAddCommentCommandParams;
                    const threadComment = worksheet.getCommentById(comment.id);

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
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.CommentUpdated,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== UpdateCommentCommand.id) return;

                    const target = this._getTargetSheet(commandInfo.params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { payload } = commandInfo.params as IUpdateCommentCommandParams;
                    const threadComment = worksheet.getCommentById(payload.commentId);

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
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.CommentDeleted,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== DeleteCommentCommand.id && commandInfo.id !== DeleteCommentTreeCommand.id) return;

                    const target = this._getTargetSheet(commandInfo.params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { commentId } = commandInfo.params as IDeleteCommentCommandParams;

                    this.fireEvent(this.Event.CommentDeleted, {
                        workbook,
                        worksheet,
                        commentId,
                    });
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.CommentResolved,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== ResolveCommentCommand.id) return;

                    const target = this._getTargetSheet(commandInfo.params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { commentId, resolved } = commandInfo.params as IResolveCommentCommandParams;
                    const threadComment = worksheet.getCommentById(commentId);

                    if (threadComment) {
                        this.fireEvent(this.Event.CommentResolved, {
                            workbook,
                            worksheet,
                            row: threadComment.getRange()?.getRow() ?? 0,
                            col: threadComment.getRange()?.getColumn() ?? 0,
                            comment: threadComment,
                            resolved,
                        });
                    }
                })
            )
        );

        // Before command events
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeCommentAdd,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== AddCommentCommand.id) return;

                    const target = this._getTargetSheet(commandInfo.params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { comment } = commandInfo.params as IAddCommentCommandParams;
                    const { range } = deserializeRangeWithSheet(comment.ref);

                    const eventParams: IBeforeSheetCommentAddEvent = {
                        workbook,
                        worksheet,
                        row: range.startRow,
                        col: range.startColumn,
                        comment: FTheadCommentItem.create(comment),
                    };

                    this.fireEvent(this.Event.BeforeCommentAdd, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeCommentUpdate,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== UpdateCommentCommand.id) return;

                    const target = this._getTargetSheet(commandInfo.params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { payload } = commandInfo.params as IUpdateCommentCommandParams;
                    const threadComment = worksheet.getCommentById(payload.commentId);

                    if (threadComment) {
                        const eventParams: IBeforeSheetCommentUpdateEvent = {
                            workbook,
                            worksheet,
                            row: threadComment.getRange()?.getRow() ?? 0,
                            col: threadComment.getRange()?.getColumn() ?? 0,
                            comment: threadComment,
                            newContent: RichTextValue.createByBody(payload.text),
                        };
                        this.fireEvent(this.Event.BeforeCommentUpdate, eventParams);
                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeCommentDelete,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== DeleteCommentCommand.id && commandInfo.id !== DeleteCommentTreeCommand.id) return;

                    const target = this._getTargetSheet(commandInfo.params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { commentId } = commandInfo.params as IDeleteCommentCommandParams;
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
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeCommentResolve,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== ResolveCommentCommand.id) return;

                    const target = this._getTargetSheet(commandInfo.params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { commentId, resolved } = commandInfo.params as IResolveCommentCommandParams;
                    const threadComment = worksheet.getCommentById(commentId);

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
            )
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
