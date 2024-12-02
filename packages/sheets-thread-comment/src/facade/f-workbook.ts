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

// FIXME@weird94: this plugin should not rely on docs-ui
// eslint-disable-next-line ts/no-explicit-any
type IUpdateCommandParams = any;

export interface IFWorkbookThreadCommentMixin {
    /**
     * The onThreadCommentChange event is fired when the thread comment of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onThreadCommentChange(callback: (commentUpdate: CommentUpdate) => void | false): IDisposable;

    /**
     * The onThreadCommentChange event is fired when the thread comment of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeAddThreadComment(
        this: FWorkbook,
        callback: (params: IAddCommentCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeUpdateThreadComment event is fired before the thread comment is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateThreadComment(
        this: FWorkbook,
        callback: (params: IUpdateCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeDeleteThreadComment event is fired before the thread comment is deleted.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
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

    override onThreadCommentChange(callback: (commentUpdate: CommentUpdate) => void | false): IDisposable {
        return toDisposable(this._threadCommentModel.commentUpdate$
            .pipe(filter((change) => change.unitId === this._workbook.getUnitId()))
            .subscribe(callback));
    }

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
