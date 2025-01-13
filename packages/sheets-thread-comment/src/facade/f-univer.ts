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

import type { ICommandInfo, IDisposable, Injector } from '@univerjs/core';
import type { IAddCommentCommandParams, IDeleteCommentCommandParams, IResolveCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import type { IBeforeSheetCommentAddEvent, IBeforeSheetCommentDeleteEvent, IBeforeSheetCommentUpdateEvent, ISheetCommentAddEvent, ISheetCommentDeleteEvent, ISheetCommentResolveEvent, ISheetCommentUpdateEvent } from './f-event';
import { CanceledError, FUniver, ICommandService, RichTextValue } from '@univerjs/core';
import { AddCommentCommand, DeleteCommentCommand, ResolveCommentCommand, UpdateCommentCommand } from '@univerjs/thread-comment';
import { FTheadCommentBuilder, FTheadCommentItem } from './f-thread-comment';

export interface IFUniverCommentMixin {
    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.event.CommentAdded, () => {})` as instead
     */
    onCommentAdded(callback: (event: ISheetCommentAddEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.event.CommentUpdated, () => {})` as instead
     */
    onCommentUpdated(callback: (event: ISheetCommentUpdateEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.event.CommentDeleted, () => {})` as instead
     */
    onCommentDeleted(callback: (event: ISheetCommentDeleteEvent) => void): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.event.CommentResolved, () => {})` as instead
     */
    onCommentResolved(callback: (event: ISheetCommentResolveEvent) => void): IDisposable;

    /**
     * create a new thread comment
     * @returns {FTheadCommentBuilder} thead comment builder
     * @example
     * ```ts
     * const comment = univerAPI.newTheadComment().setContent(univerAPI.newRichText().insertText('hello zhangsan'));
     * ```
     */
    newTheadComment(): FTheadCommentBuilder;
}

export class FUniverCommentMixin extends FUniver implements IFUniverCommentMixin {
    // eslint-disable-next-line complexity
    private _handleCommentCommand(commandInfo: ICommandInfo): void {
        const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
        if (!params) return;
        const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        switch (commandInfo.id) {
            case AddCommentCommand.id: {
                if (!this._eventListend(this.Event.CommentAdded)) return;
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
                break;
            }
            case UpdateCommentCommand.id: {
                if (!this._eventListend(this.Event.CommentUpdated)) return;
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
                break;
            }
            case DeleteCommentCommand.id: {
                if (!this._eventListend(this.Event.CommentDeleted)) return;
                const deleteParams = commandInfo.params as IDeleteCommentCommandParams;
                const { commentId } = deleteParams;
                this.fireEvent(this.Event.CommentDeleted, {
                    workbook,
                    worksheet,
                    commentId,
                });
                break;
            }
            case ResolveCommentCommand.id: {
                if (!this._eventListend(this.Event.CommentResolved)) return;
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
                break;
            }
        }
    }

    // eslint-disable-next-line complexity, max-lines-per-function
    private _handleBeforeCommentCommand(commandInfo: ICommandInfo): void {
        const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
        if (!params) return;
        const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        switch (commandInfo.id) {
            case AddCommentCommand.id: {
                if (!this._eventListend(this.Event.BeforeCommentAdd)) return;
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
                };
                break;
            }
            case UpdateCommentCommand.id: {
                if (!this._eventListend(this.Event.BeforeCommentUpdate)) return;
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
                    };
                }
                break;
            }
            case DeleteCommentCommand.id: {
                if (!this._eventListend(this.Event.BeforeCommentDeleted)) return;
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
                    this.fireEvent(this.Event.BeforeCommentDeleted, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    };
                }
                break;
            }
            case ResolveCommentCommand.id: {
                if (!this._eventListend(this.Event.BeforeCommentResolve)) return;
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
                break;
            }
        }
    }

    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);
        this.disposeWithMe(
            commandService.onCommandExecuted((commandInfo) => {
                this._handleCommentCommand(commandInfo);
            })
        );

        this.disposeWithMe(
            commandService.beforeCommandExecuted((commandInfo) => {
                this._handleBeforeCommentCommand(commandInfo);
            })
        );
    }

    override newTheadComment(comment?: IThreadComment): FTheadCommentBuilder {
        return new FTheadCommentBuilder(comment);
    }
}

FUniver.extend(FUniverCommentMixin);

declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverCommentMixin {}
}
