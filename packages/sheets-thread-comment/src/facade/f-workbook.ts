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

import type { IDisposable, IExecutionOptions } from '@univerjs/core';
import type { CommentUpdate, IAddCommentCommandParams, IDeleteCommentCommandParams } from '@univerjs/thread-comment';
import { toDisposable } from '@univerjs/core';
import { FWorkbook } from '@univerjs/sheets/facade';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import { filter } from 'rxjs';
import { FThreadComment } from './f-thread-comment';

// eslint-disable-next-line ts/no-explicit-any
type IUpdateCommandParams = any;

export interface IFWorkbookThreadCommentMixin {
    /**
     * Get all comments in the current sheet
     * @returns all comments in the current sheet
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const comments = workbook.getComments();
     * ```
     */
    getComments(): FThreadComment[];

    /**
     * Clear all comments in the current sheet
     * @returns Whether the comments are cleared successfully.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const success = await workbook.clearComments();
     * ```
     */
    clearComments(): Promise<boolean>;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.event.CommentUpdated, () => {})` as instead
     */
    onThreadCommentChange(callback: (commentUpdate: CommentUpdate) => void | false): IDisposable;

     /**
      * @deprecated use `univerAPI.addEvent(univerAPI.event.BeforeCommentAdd, () => {})` as instead
      */
    onBeforeAddThreadComment(
        this: FWorkbook,
        callback: (params: IAddCommentCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.event.BeforeCommentUpdate, () => {})` as instead
     */
    onBeforeUpdateThreadComment(
        this: FWorkbook,
        callback: (params: IUpdateCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.event.BeforeCommentDelete, () => {})` as instead
     */
    onBeforeDeleteThreadComment(
        this: FWorkbook,
        callback: (params: IDeleteCommentCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;
}

export class FWorkbookThreadCommentMixin extends FWorkbook implements IFWorkbookThreadCommentMixin {
    declare _threadCommentModel: ThreadCommentModel;

    override _initialize(): void {
        Object.defineProperty(this, '_threadCommentModel', {
            get() {
                return this._injector.get(ThreadCommentModel);
            },
        });
    }

    override getComments(): FThreadComment[] {
        return this._threadCommentModel.getUnit(this._workbook.getUnitId()).map((i) => this._injector.createInstance(FThreadComment, i.root));
    }

    override clearComments(): Promise<boolean> {
        const comments = this.getComments();
        const promises = comments.map((comment) => comment.deleteAsync());

        return Promise.all(promises).then(() => true);
    }

    /**
     * @param callback
     * @deprecated
     */
    override onThreadCommentChange(callback: (commentUpdate: CommentUpdate) => void | false): IDisposable {
        return toDisposable(this._threadCommentModel.commentUpdate$
            .pipe(filter((change) => change.unitId === this._workbook.getUnitId()))
            .subscribe(callback));
    }

    /**
     * @param callback
     * @deprecated
     */
    override onBeforeAddThreadComment(callback: (params: IAddCommentCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IAddCommentCommandParams;
            if (commandInfo.id === AddCommentCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeAddThreadComment');
                }
            }
        }));
    }

    /**
     * @param callback
     * @deprecated
     */
    override onBeforeUpdateThreadComment(callback: (params: IUpdateCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IUpdateCommandParams;
            if (commandInfo.id === UpdateCommentCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeUpdateThreadComment');
                }
            }
        }));
    }

    /**
     * @param callback
     * @deprecated
     */
    override onBeforeDeleteThreadComment(callback: (params: IDeleteCommentCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IDeleteCommentCommandParams;
            if (commandInfo.id === DeleteCommentCommand.id || commandInfo.id === DeleteCommentTreeCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeDeleteThreadComment');
                }
            }
        }));
    }
}

FWorkbook.extend(FWorkbookThreadCommentMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookThreadCommentMixin {}
}
