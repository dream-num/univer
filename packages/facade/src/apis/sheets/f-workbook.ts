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

import type { IDisposable, IExecutionOptions, IRange, Nullable, ObjectMatrix } from '@univerjs/core';
import type { IRuleChange, IValidStatusChange } from '@univerjs/data-validation';
import type { IUpdateCommandParams } from '@univerjs/docs-ui';
import type { IAddSheetDataValidationCommandParams, IDataValidationResCache, IRemoveSheetAllDataValidationCommandParams, IRemoveSheetDataValidationCommandParams, IUpdateSheetDataValidationOptionsCommandParams, IUpdateSheetDataValidationRangeCommandParams, IUpdateSheetDataValidationSettingCommandParams } from '@univerjs/sheets-data-validation';
import type { ICanvasFloatDom } from '@univerjs/sheets-drawing-ui';
import type { ISheetHyperLinkInfo } from '@univerjs/sheets-hyper-link-ui';
import type { CommentUpdate, IAddCommentCommandParams, IDeleteCommentCommandParams } from '@univerjs/thread-comment';
import type { IDialogPartMethodOptions, ISidebarMethodOptions } from '@univerjs/ui';
import type { IFComponentKey } from './utils';
import { toDisposable } from '@univerjs/core';
import { FWorkbook } from '@univerjs/sheets/facade';
import { AddSheetDataValidationCommand, RemoveSheetAllDataValidationCommand, RemoveSheetDataValidationCommand, SheetDataValidationModel, SheetsDataValidationValidatorService, UpdateSheetDataValidationOptionsCommand, UpdateSheetDataValidationRangeCommand, UpdateSheetDataValidationSettingCommand } from '@univerjs/sheets-data-validation';
import { SheetsHyperLinkResolverService } from '@univerjs/sheets-hyper-link-ui';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import { IDialogService, ISidebarService } from '@univerjs/ui';

import { filter } from 'rxjs';

export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey {}

interface IFWorkbookLegacy {
    _dataValidationModel: SheetDataValidationModel;
    _threadCommentModel: ThreadCommentModel;

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

    /**
     * get data validation validator status for current workbook
     * @returns matrix of validator status
     */
    getValidatorStatus(this: FWorkbook): Promise<Record<string, ObjectMatrix<Nullable<IDataValidationResCache>>>>;
    // region DataValidationHooks
    /**
     * The onDataValidationChange event is fired when the data validation rule of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onDataValidationChange(
        this: FWorkbook & FWorkbookLegacy,
        callback: (ruleChange: IRuleChange) => void
    ): IDisposable;

    /**
     * The onDataValidationStatusChange event is fired when the data validation status of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onDataValidationStatusChange(
        this: FWorkbook & FWorkbookLegacy,
        callback: (statusChange: IValidStatusChange) => void
    ): IDisposable;

    /**
     * The onBeforeAddDataValidation event is fired before the data validation rule is added.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeAddDataValidation(
        this: FWorkbook,
        callback: (params: IAddSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeUpdateDataValidationCriteria event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationCriteria(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationSettingCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeUpdateDataValidationRange event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationRange(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationRangeCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;
    /**
     * The onBeforeUpdateDataValidationOptions event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationOptions(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationOptionsCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeDeleteDataValidation event is fired before the data validation rule is deleted.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteDataValidation(
        this: FWorkbook,
        callback: (params: IRemoveSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeDeleteAllDataValidation event is fired before delete all data validation rules.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteAllDataValidation(
        this: FWorkbook,
        callback: (params: IRemoveSheetAllDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    // endregion

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

    // #region hyperlink
    /**
     * create a hyperlink for the sheet
     * @param sheetId the sheet id to link
     * @param range the range to link, or define-name id
     * @returns the hyperlink string
     */
    createSheetHyperlink(this: FWorkbook, sheetId: string, range?: string | IRange): string;
    /**
     * parse the hyperlink string to get the hyperlink info
     * @param hyperlink the hyperlink string
     * @returns the hyperlink info
     */
    parseSheetHyperlink(this: FWorkbook, hyperlink: string): ISheetHyperLinkInfo;

    /**
     * navigate to the sheet hyperlink
     * @param hyperlink the hyperlink string
     */
    navigateToSheetHyperlink(this: FWorkbook, hyperlink: string): void;
    // #endregion
}

class FWorkbookLegacy extends FWorkbook implements IFWorkbookLegacy {
    declare _dataValidationModel: SheetDataValidationModel;
    declare _threadCommentModel: ThreadCommentModel;

    override _initialize(): void {
        Object.defineProperty(this, '_dataValidationModel', {
            get() {
                return this._injector.get(SheetDataValidationModel);
            },
        });

        Object.defineProperty(this, '_threadCommentModel', {
            get() {
                return this._injector.get(ThreadCommentModel);
            },
        });
    }

    // #endregion

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

    /**
     * get data validation validator status for current workbook
     * @returns matrix of validator status
     */
    override getValidatorStatus(): Promise<Record<string, ObjectMatrix<Nullable<IDataValidationResCache>>>> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorWorkbook(this._workbook.getUnitId());
    }

    // region DataValidationHooks
    /**
     * The onDataValidationChange event is fired when the data validation rule of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onDataValidationChange(
        callback: (ruleChange: IRuleChange) => void
    ): IDisposable {
        return toDisposable(this._dataValidationModel.ruleChange$
            // eslint-disable-next-line ts/no-explicit-any
            .pipe(filter((change) => change.unitId === (this as any)._workbook.getUnitId()))
            .subscribe(callback));
    }

    /**
     * The onDataValidationStatusChange event is fired when the data validation status of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onDataValidationStatusChange(
        callback: (statusChange: IValidStatusChange) => void
    ): IDisposable {
        return toDisposable(this._dataValidationModel.validStatusChange$
            // eslint-disable-next-line ts/no-explicit-any
            .pipe(filter((change) => change.unitId === (this as any)._workbook.getUnitId()))
            .subscribe(callback));
    }

    /**
     * The onBeforeAddDataValidation event is fired before the data validation rule is added.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onBeforeAddDataValidation(
        callback: (params: IAddSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IAddSheetDataValidationCommandParams;
            if (commandInfo.id === AddSheetDataValidationCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeAddDataValidation');
                }
            }
        }));
    }

    override onBeforeUpdateDataValidationCriteria(
        callback: (params: IUpdateSheetDataValidationSettingCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IUpdateSheetDataValidationSettingCommandParams;
            if (commandInfo.id === UpdateSheetDataValidationSettingCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }

                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeUpdateDataValidationCriteria');
                }
            }
        }));
    }

    override onBeforeUpdateDataValidationRange(callback: (params: IUpdateSheetDataValidationRangeCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IUpdateSheetDataValidationRangeCommandParams;
            if (commandInfo.id === UpdateSheetDataValidationRangeCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }

                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeUpdateDataValidationRange');
                }
            }
        }));
    }

    override onBeforeUpdateDataValidationOptions(callback: (params: IUpdateSheetDataValidationOptionsCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IUpdateSheetDataValidationOptionsCommandParams;
            if (commandInfo.id === UpdateSheetDataValidationOptionsCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }

                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeUpdateDataValidationOptions');
                }
            }
        }));
    }

    override onBeforeDeleteDataValidation(callback: (params: IRemoveSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IRemoveSheetDataValidationCommandParams;
            if (commandInfo.id === RemoveSheetDataValidationCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeDeleteDataValidation');
                }
            }
        }));
    }

    override onBeforeDeleteAllDataValidation(callback: (params: IRemoveSheetAllDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IRemoveSheetAllDataValidationCommandParams;
            if (commandInfo.id === RemoveSheetAllDataValidationCommand.id) {
                if (params.unitId !== this._workbook.getUnitId()) {
                    return;
                }
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeDeleteAllDataValidation');
                }
            }
        }));
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
