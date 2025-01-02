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

import type { IRuleChange } from '@univerjs/data-validation';
import type {
    IAddSheetDataValidationCommandParams,
    IRemoveSheetAllDataValidationCommandParams,
    IRemoveSheetDataValidationCommandParams,
    IUpdateSheetDataValidationOptionsCommandParams,
    IUpdateSheetDataValidationRangeCommandParams,
    IUpdateSheetDataValidationSettingCommandParams,
    IValidStatusChange,
} from '@univerjs/sheets-data-validation';
import { type DataValidationStatus, type IDisposable, type IExecutionOptions, type Nullable, type ObjectMatrix, toDisposable } from '@univerjs/core';

import {
    AddSheetDataValidationCommand,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    SheetDataValidationModel,
    SheetsDataValidationValidatorService,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '@univerjs/sheets-data-validation';
import { FWorkbook } from '@univerjs/sheets/facade';
import { filter } from 'rxjs';

export interface IFWorkbookDataValidationMixin {
    /**
     * get data validation validator status for current workbook
     * @returns A promise that resolves to a matrix of validator status.
     * @example
     * ```
     * univerAPI.getActiveWorkbook().getValidatorStatus().then((status) => { console.log(status) })
     * ```
     */
    getValidatorStatus(this: FWorkbook): Promise<Record<string, ObjectMatrix<Nullable<DataValidationStatus>>>>;

    /**
     * The onDataValidationChange event is fired when the data validation rule of this sheet is changed.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onDataValidationChange(
        callback: (ruleChange: IRuleChange) => void
    ): IDisposable;

    /**
     * The onDataValidationStatusChange event is fired when the data validation status of this sheet is changed.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onDataValidationStatusChange(
        callback: (statusChange: IValidStatusChange) => void
    ): IDisposable;

    /**
     * The onBeforeAddDataValidation event is fired before the data validation rule is added.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeAddDataValidation(
        this: FWorkbook,
        callback: (params: IAddSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeUpdateDataValidationCriteria event is fired before the data validation rule is updated.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationCriteria(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationSettingCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeUpdateDataValidationRange event is fired before the data validation rule is updated.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationRange(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationRangeCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;
    /**
     * The onBeforeUpdateDataValidationOptions event is fired before the data validation rule is updated.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationOptions(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationOptionsCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeDeleteDataValidation event is fired before the data validation rule is deleted.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteDataValidation(
        this: FWorkbook,
        callback: (params: IRemoveSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * The onBeforeDeleteAllDataValidation event is fired before delete all data validation rules.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteAllDataValidation(
        this: FWorkbook,
        callback: (params: IRemoveSheetAllDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;
}

export class FWorkbookDataValidationMixin extends FWorkbook implements IFWorkbookDataValidationMixin {
    declare _dataValidationModel: SheetDataValidationModel;

    override _initialize(): void {
        Object.defineProperty(this, '_dataValidationModel', {
            get() {
                return this._injector.get(SheetDataValidationModel);
            },
        });
    }

    override getValidatorStatus(): Promise<Record<string, ObjectMatrix<Nullable<DataValidationStatus>>>> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorWorkbook(this._workbook.getUnitId());
    }

    // region DataValidationHooks
    /**
     * The onDataValidationChange event is fired when the data validation rule of this sheet is changed.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onDataValidationChange(
        callback: (ruleChange: IRuleChange) => void
    ): IDisposable {
        return toDisposable(this._dataValidationModel.ruleChange$

            .pipe(filter((change) => change.unitId === this._workbook.getUnitId()))
            .subscribe(callback));
    }

    /**
     * The onDataValidationStatusChange event is fired when the data validation status of this sheet is changed.
     * @param callback - Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onDataValidationStatusChange(
        callback: (statusChange: IValidStatusChange) => void
    ): IDisposable {
        return toDisposable(this._dataValidationModel.validStatusChange$
            .pipe(filter((change) => change.unitId === this._workbook.getUnitId()))
            .subscribe(callback));
    }

    /**
     * The onBeforeAddDataValidation event is fired before the data validation rule is added.
     * @param callback - Callback function that will be called when the event is fired
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
}

FWorkbook.extend(FWorkbookDataValidationMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookDataValidationMixin { }
}
