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

import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IPermissionService,
    IResourceLoaderService,
    IUniverInstanceService,
    mergeWorksheetSnapshotWithDefault,
    RedoCommand,
    toDisposable,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { getPrimaryForRange, InsertSheetCommand, RemoveSheetCommand, SetSelectionsOperation, SetWorksheetActiveOperation, SheetsSelectionsService, WorkbookEditablePermission } from '@univerjs/sheets';
import { AddSheetDataValidationCommand, RemoveSheetAllDataValidationCommand, RemoveSheetDataValidationCommand, SheetDataValidationModel, SheetsDataValidationValidatorService, UpdateSheetDataValidationOptionsCommand, UpdateSheetDataValidationRangeCommand, UpdateSheetDataValidationSettingCommand } from '@univerjs/sheets-data-validation';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import { filter } from 'rxjs';
import type { CommandListener, ICommandInfo, IDisposable, IExecutionOptions, IRange, IWorkbookData, Nullable, ObjectMatrix, Workbook } from '@univerjs/core';
import type { IRuleChange, IValidStatusChange } from '@univerjs/data-validation';
import type { IUpdateCommandParams } from '@univerjs/docs-ui';
import type {
    ISetSelectionsOperationParams,
    ISheetCommandSharedParams,
} from '@univerjs/sheets';
import type { IAddSheetDataValidationCommandParams, IDataValidationResCache, IRemoveSheetAllDataValidationCommandParams, IRemoveSheetDataValidationCommandParams, IUpdateSheetDataValidationOptionsCommandParams, IUpdateSheetDataValidationRangeCommandParams, IUpdateSheetDataValidationSettingCommandParams } from '@univerjs/sheets-data-validation';
import type { ICanvasFloatDom } from '@univerjs/sheets-drawing-ui';
import type { CommentUpdate, IAddCommentCommandParams, IDeleteCommentCommandParams } from '@univerjs/thread-comment';
import { FRange } from './f-range';
import { FWorksheet } from './f-worksheet';
import type { IFComponentKey } from './utils';

export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey {

}

export class FWorkbook {
    readonly id: string;

    constructor(
        private readonly _workbook: Workbook,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(IResourceLoaderService) private readonly _resourceLoaderService: IResourceLoaderService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @ILogService private readonly _logService: ILogService

    ) {
        this.id = this._workbook.getUnitId();
    }

    private get _dataValidationModel(): SheetDataValidationModel {
        return this._injector.get(SheetDataValidationModel);
    }

    private get _threadCommentModel(): ThreadCommentModel {
        return this._injector.get(ThreadCommentModel);
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this._workbook.getName();
    }

    /**
     * save workbook snapshot data, including conditional formatting, data validation, and other plugin data.
     */
    save(): IWorkbookData {
        const snapshot = this._resourceLoaderService.saveUnit<IWorkbookData>(this._workbook.getUnitId())!;
        return snapshot;
    }

    /**
     * @deprecated use 'save' instead.
     * @return {*}  {IWorkbookData}
     * @memberof FWorkbook
     */
    getSnapshot(): IWorkbookData {
        this._logService.warn(`use 'save' instead of 'getSnapshot'`);
        return this.save();
    }

    /**
     * Get the active sheet of the workbook.
     * @returns The active sheet of the workbook
     */
    getActiveSheet(): FWorksheet {
        const activeSheet = this._workbook.getActiveSheet();
        return this._injector.createInstance(FWorksheet, this, this._workbook, activeSheet);
    }

    /**
     * Gets all the worksheets in this workbook
     * @returns An array of all the worksheets in the workbook
     */
    getSheets(): FWorksheet[] {
        return this._workbook.getSheets().map((sheet) => {
            return this._injector.createInstance(FWorksheet, this, this._workbook, sheet);
        });
    }

    /**
     * Create a new worksheet and returns a handle to it.
     * @param name Name of the new sheet
     * @param rows How may rows would the new sheet have
     * @param column How many columns would the new sheet have
     * @returns The new created sheet
     */
    create(name: string, rows: number, column: number): FWorksheet {
        const newSheet = mergeWorksheetSnapshotWithDefault({});
        newSheet.rowCount = rows;
        newSheet.columnCount = column;
        newSheet.name = name;
        newSheet.id = name.toLowerCase().replace(/ /g, '-');

        this._commandService.syncExecuteCommand(InsertSheetCommand.id, {
            unitId: this.id,
            index: this._workbook.getSheets().length,
            sheet: newSheet,
        });
        this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: this.id,
            subUnitId: this._workbook.getSheets()[this._workbook.getSheets().length - 1].getSheetId(),
        });
        const worksheet = this._workbook.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
    }

    /**
     * Get a worksheet by sheet id.
     * @param sheetId The id of the sheet to get.
     * @return The worksheet with given sheet id
     */
    getSheetBySheetId(sheetId: string): FWorksheet | null {
        const worksheet = this._workbook.getSheetBySheetId(sheetId);
        if (!worksheet) {
            return null;
        }

        return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
    }

    /**
     * Get a worksheet by sheet name.
     * @param name 	The name of the sheet to get.
     * @returns The worksheet with given sheet name
     */
    getSheetByName(name: string): FWorksheet | null {
        const worksheet = this._workbook.getSheetBySheetName(name);
        if (!worksheet) {
            return null;
        }

        return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
    }

    /**
     * Sets the given worksheet to be the active worksheet in the workbook.
     * @param sheet The worksheet to set as the active worksheet.
     * @returns The active worksheet
     */
    setActiveSheet(sheet: FWorksheet): FWorksheet {
        this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: this.id,
            subUnitId: sheet.getSheetId(),
        });

        return sheet;
    }

    /**
     * Inserts a new worksheet into the workbook.
     * Using a default sheet name. The new sheet becomes the active sheet
     * @returns The new sheet
     */
    insertSheet(): FWorksheet {
        this._commandService.syncExecuteCommand(InsertSheetCommand.id);

        const unitId = this.id;
        const subUnitId = this._workbook.getSheets()[this._workbook.getSheets().length - 1].getSheetId();

        this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId,
            subUnitId,
        });
        const worksheet = this._workbook.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
    }

    /**
     * Deletes the specified worksheet.
     * @param sheet The worksheet to delete.
     */
    deleteSheet(sheet: FWorksheet): void {
        const unitId = this.id;
        const subUnitId = sheet.getSheetId();
        this._commandService.executeCommand(RemoveSheetCommand.id, {
            unitId,
            subUnitId,
        });
    }

    // #region editing

    undo(): Promise<boolean> {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.executeCommand(UndoCommand.id);
    }

    redo(): Promise<boolean> {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.executeCommand(RedoCommand.id);
    }

    // #endregion

    // #region callbacks

    /**
     * Register a callback that will be triggered before invoking a command targeting the Univer sheet.
     * @param callback the callback.
     * @returns A function to dispose the listening.
     */
    onBeforeCommandExecute(callback: CommandListener): IDisposable {
        return this._commandService.beforeCommandExecuted((command) => {
            if ((command as ICommandInfo<ISheetCommandSharedParams>).params?.unitId !== this.id) {
                return;
            }

            callback(command);
        });
    }

    /**
     * Register a callback that will be triggered when a command is invoked targeting the Univer sheet.
     * @param callback the callback.
     * @returns A function to dispose the listening.
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command) => {
            if ((command as ICommandInfo<ISheetCommandSharedParams>).params?.unitId !== this.id) {
                return;
            }

            callback(command);
        });
    }

    onSelectionChange(callback: (selections: IRange[]) => void): IDisposable {
        return toDisposable(
            this._selectionManagerService.selectionMoveEnd$.subscribe((selections) => {
                if (this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId() !== this.id) {
                    return;
                }

                if (!selections?.length) {
                    callback([]);
                } else {
                    // TODO@wzhudev: filtered out ranges changes not other currently sheet
                    callback(selections!.map((s) => s.range));
                }
            })
        );
    }

    /**
     * Used to modify the editing permissions of the workbook. When the value is false, editing is not allowed.
     * @param {boolean} value  editable value want to set
     */
    setEditable(value: boolean): void {
        const instance = new WorkbookEditablePermission(this._workbook.getUnitId());
        const editPermissionPoint = this._permissionService.getPermissionPoint(instance.id);
        if (!editPermissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }
        this._permissionService.updatePermissionPoint(instance.id, value);
    }

    // #region callbacks

    /**
     * get data validation validator status for current workbook
     * @returns matrix of validator status
     */
    getValidatorStatus(): Promise<Record<string, ObjectMatrix<Nullable<IDataValidationResCache>>>> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorWorkbook(
            this._workbook.getUnitId()
        );
    }

    /**
     * Sets the active selection region for this sheet.
     * @param range The range to set as the active selection.
     */
    setActiveRange(range: FRange): void {
        // In theory, FRange should belong to a specific context, rather than getting the currently active sheet
        const sheet = this.getActiveSheet();
        const sheetId = range.getRange().sheetId || sheet.getSheetId();

        const worksheet = sheetId ? this._workbook.getSheetBySheetId(sheetId) : this._workbook.getActiveSheet(true);
        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        // if the range is not in the current sheet, set the active sheet to the range's sheet
        if (worksheet.getSheetId() !== sheet.getSheetId()) {
            this.setActiveSheet(this._injector.createInstance(FWorksheet, this, this._workbook, worksheet));
        }

        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId: this.getId(),
            subUnitId: sheetId,

            selections: [range].map((r) => ({ range: r.getRange(), primary: getPrimaryForRange(r.getRange(), worksheet), style: null })),
        };

        this._commandService.syncExecuteCommand(SetSelectionsOperation.id, setSelectionOperationParams);
    }

    /**
     * Returns the selected range in the active sheet, or null if there is no active range.
     * @returns the active range
     */
    getActiveRange(): FRange | null {
        const activeSheet = this._workbook.getActiveSheet();
        const selections = this._selectionManagerService.getCurrentSelections();
        const active = selections.find((selection) => !!selection.primary);
        if (!active) {
            return null;
        }

        return this._injector.createInstance(FRange, this._workbook, activeSheet, active.range);
    }

    // region DataValidationHooks
    /**
     * The onDataValidationChange event is fired when the data validation rule of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onDataValidationChange(callback: (ruleChange: IRuleChange) => void): IDisposable {
        return toDisposable(this._dataValidationModel.ruleChange$.pipe(filter((change) => change.unitId === this._workbook.getUnitId())).subscribe(callback));
    }

    /**
     * The onDataValidationStatusChange event is fired when the data validation status of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onDataValidationStatusChange(callback: (statusChange: IValidStatusChange) => void): IDisposable {
        return toDisposable(this._dataValidationModel.validStatusChange$.pipe(filter((change) => change.unitId === this._workbook.getUnitId())).subscribe(callback));
    }

    /**
     * The onBeforeAddDataValidation event is fired before the data validation rule is added.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeAddDataValidation(callback: (params: IAddSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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

    /**
     * The onBeforeUpdateDataValidationCriteria event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationCriteria(callback: (params: IUpdateSheetDataValidationSettingCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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

    /**
     * The onBeforeUpdateDataValidationRange event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationRange(callback: (params: IUpdateSheetDataValidationRangeCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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

    /**
     * The onBeforeUpdateDataValidationOptions event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationOptions(callback: (params: IUpdateSheetDataValidationOptionsCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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

    /**
     * The onBeforeDeleteDataValidation event is fired before the data validation rule is deleted.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteDataValidation(callback: (params: IRemoveSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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

    /**
     * The onBeforeDeleteAllDataValidation event is fired before delete all data validation rules.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteAllDataValidation(callback: (params: IRemoveSheetAllDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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

    // endregion

    // region ThreadCommentHooks
    /**
     * The onThreadCommentChange event is fired when the thread comment of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onThreadCommentChange(callback: (commentUpdate: CommentUpdate) => void | false): IDisposable {
        return toDisposable(this._threadCommentModel.commentUpdate$.pipe(filter((change) => change.unitId === this._workbook.getUnitId())).subscribe(callback));
    }

    /**
     * The onThreadCommentChange event is fired when the thread comment of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeAddThreadComment(callback: (params: IAddCommentCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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
     * The onBeforeUpdateThreadComment event is fired before the thread comment is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateThreadComment(callback: (params: IUpdateCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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
     * The onBeforeDeleteThreadComment event is fired before the thread comment is deleted.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteThreadComment(callback: (params: IDeleteCommentCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
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

    // endregion
}
