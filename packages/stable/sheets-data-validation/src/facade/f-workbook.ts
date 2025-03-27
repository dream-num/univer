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

import type { DataValidationStatus, IDisposable, IExecutionOptions, Nullable, ObjectMatrix } from '@univerjs/core';
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
import { toDisposable } from '@univerjs/core';

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

/**
 * @ignore
 */
export interface IFWorkbookDataValidationMixin {
    /**
     * Get data validation validator status for current workbook.
     * @returns A promise that resolves to a matrix of validator status.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const status = await fWorkbook.getValidatorStatus();
     * console.log(status);
     * ```
     */
    getValidatorStatus(): Promise<Record<string, ObjectMatrix<Nullable<DataValidationStatus>>>>;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.SheetDataValidationChanged, (event) => { ... })` instead
     */
    onDataValidationChange(
        callback: (ruleChange: IRuleChange) => void
    ): IDisposable;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.SheetDataValidatorStatusChanged, (event) => { ... })` instead
     */
    onDataValidationStatusChange(
        callback: (statusChange: IValidStatusChange) => void
    ): IDisposable;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationAdd, (event) => { ... })` instead
     */
    onBeforeAddDataValidation(
        this: FWorkbook,
        callback: (params: IAddSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationCriteriaUpdate, (event) => { ... })` instead
     */
    onBeforeUpdateDataValidationCriteria(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationSettingCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationRangeUpdate, (event) => { ... })` instead
     */
    onBeforeUpdateDataValidationRange(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationRangeCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationOptionsUpdate, (event) => { ... })` instead
     */
    onBeforeUpdateDataValidationOptions(
        this: FWorkbook,
        callback: (params: IUpdateSheetDataValidationOptionsCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationDelete, (event) => { ... })` instead
     */
    onBeforeDeleteDataValidation(
        this: FWorkbook,
        callback: (params: IRemoveSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationDeleteAll, (event) => { ... })` instead
     */
    onBeforeDeleteAllDataValidation(
        this: FWorkbook,
        callback: (params: IRemoveSheetAllDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false
    ): IDisposable;
}

/**
 * @ignore
 */
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
    override onDataValidationChange(
        callback: (ruleChange: IRuleChange) => void
    ): IDisposable {
        return toDisposable(this._dataValidationModel.ruleChange$

            .pipe(filter((change) => change.unitId === this._workbook.getUnitId()))
            .subscribe(callback));
    }

    override onDataValidationStatusChange(
        callback: (statusChange: IValidStatusChange) => void
    ): IDisposable {
        return toDisposable(this._dataValidationModel.validStatusChange$
            .pipe(filter((change) => change.unitId === this._workbook.getUnitId()))
            .subscribe(callback));
    }

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
