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

import type { IDisposable, IExecutionOptions, IRange } from '@univerjs/core';
import type { IUpdateCommandParams } from '@univerjs/docs-ui';
import type { ICanvasFloatDom } from '@univerjs/sheets-drawing-ui';
import type { ISheetHyperLinkInfo } from '@univerjs/sheets-hyper-link-ui';
import type { CommentUpdate, IAddCommentCommandParams, IDeleteCommentCommandParams } from '@univerjs/thread-comment';
import type { IDialogPartMethodOptions, ISidebarMethodOptions } from '@univerjs/ui';
import type { IFComponentKey } from './utils';
import { toDisposable } from '@univerjs/core';
import { FWorkbook } from '@univerjs/sheets/facade';
import { SheetsHyperLinkResolverService } from '@univerjs/sheets-hyper-link-ui';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import { IDialogService, ISidebarService } from '@univerjs/ui';

import { filter } from 'rxjs';

export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey {}

interface IFWorkbookLegacy {

    /**
     * open a sidebar
     * @param params the sidebar options
     * @returns the disposable object
     */
    openSiderbar(this: FWorkbook, params: ISidebarMethodOptions): IDisposable;

    /**
     * open a dialog
     * @param dialog the dialog options
     * @returns the disposable object
     */
    openDialog(this: FWorkbook, dialog: IDialogPartMethodOptions): IDisposable;

    // region ThreadCommentHooks
    /**
     * The onThreadCommentChange event is fired when the thread comment of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onThreadCommentChange(this: FWorkbook & FWorkbookLegacy, callback: (commentUpdate: CommentUpdate) => void | false): IDisposable;

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

    // endregion

}

class FWorkbookLegacy extends FWorkbook implements IFWorkbookLegacy {
    declare _threadCommentModel: ThreadCommentModel;

    override _initialize(): void {
        Object.defineProperty(this, '_threadCommentModel', {
            get() {
                return this._injector.get(ThreadCommentModel);
            },
        });
    }

    // #endregion

    // TODO: why is this on `FWorkbook`?

    override openSiderbar(params: ISidebarMethodOptions): IDisposable {
        const sideBarService = this._injector.get(ISidebarService);
        return sideBarService.open(params);
    }

    override openDialog(dialog: IDialogPartMethodOptions): IDisposable {
        const dialogService = this._injector.get(IDialogService);
        const disposable = dialogService.open({
            ...dialog,
            onClose: () => {
                disposable.dispose();
            },
        });
        return disposable;
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

    override createSheetHyperlink(sheetId: string, range?: string | IRange): string {
        const resolverService = this._injector.get(SheetsHyperLinkResolverService);
        return resolverService.buildHyperLink(this.getId(), sheetId, range);
    }

    /**
     * parse the hyperlink string to get the hyperlink info
     * @param hyperlink the hyperlink string
     * @returns the hyperlink info
     */
    override parseSheetHyperlink(hyperlink: string): ISheetHyperLinkInfo {
        const resolverService = this._injector.get(SheetsHyperLinkResolverService);
        return resolverService.parseHyperLink(hyperlink);
    }

    override navigateToSheetHyperlink(hyperlink: string): void {
        const resolverService = this._injector.get(SheetsHyperLinkResolverService);
        const info = resolverService.parseHyperLink(hyperlink);
        info.handler();
    }
}

FWorkbook.extend(FWorkbookLegacy);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookLegacy {}
}
