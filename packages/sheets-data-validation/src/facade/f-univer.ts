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

import type { Injector } from '@univerjs/core';
import type {
    IAddSheetDataValidationCommandParams,
    IRemoveSheetAllDataValidationCommandParams,
    IRemoveSheetDataValidationCommandParams,
    IUpdateSheetDataValidationOptionsCommandParams,
    IUpdateSheetDataValidationRangeCommandParams,
    IUpdateSheetDataValidationSettingCommandParams,
} from '@univerjs/sheets-data-validation';
import type { IBeforeSheetDataValidationAddEvent,
    IBeforeSheetDataValidationCriteriaUpdateEvent,
    IBeforeSheetDataValidationDeleteAllEvent,
    IBeforeSheetDataValidationDeleteEvent,
    IBeforeSheetDataValidationOptionsUpdateEvent,
    IBeforeSheetDataValidationRangeUpdateEvent,

} from './f-event';
import { CanceledError, ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    AddSheetDataValidationCommand,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    SheetDataValidationModel,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '@univerjs/sheets-data-validation';
import { FDataValidation } from './f-data-validation';
import { FDataValidationBuilder } from './f-data-validation-builder';

/**
 * @ignore
 */
export interface IFUnvierDataValidationMixin {
    /**
     * Creates a new instance of FDataValidationBuilder
     * @returns {FDataValidationBuilder} A new instance of the FDataValidationBuilder class
     * @example
     * ```ts
     * const rule = FUnvier.newDataValidation();
     * cell.setDataValidation(rule.requireValueInRange(range));
     * ```
     */
    newDataValidation(): FDataValidationBuilder;
}

export class FUnvierDataValidationMixin extends FUniver implements IFUnvierDataValidationMixin {
    /**
     * @deprecated use `univerAPI.newDataValidation()` as instead.
     * @returns {FDataValidationBuilder} A new instance of the FDataValidationBuilder class
     */
    static override newDataValidation(): FDataValidationBuilder {
        return new FDataValidationBuilder();
    }

    override newDataValidation(): FDataValidationBuilder {
        return new FDataValidationBuilder();
    }

    /**
     * @ignore
     */
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        if (!injector.has(SheetDataValidationModel)) return;
        const sheetDataValidationModel = injector.get(SheetDataValidationModel);
        const commadnService = injector.get(ICommandService);

        this.registerEventHandler(
            this.Event.SheetDataValidationChanged,
            () => sheetDataValidationModel.ruleChange$.subscribe((ruleChange) => {
                const { unitId, subUnitId, rule, oldRule, type } = ruleChange;
                const target = this.getSheetTarget(unitId, subUnitId);
                if (!target) {
                    return;
                }
                const { workbook, worksheet } = target;

                const fRule = new FDataValidation(rule, worksheet.getSheet(), this._injector);
                this.fireEvent(this.Event.SheetDataValidationChanged, {
                    origin: ruleChange,
                    worksheet,
                    workbook,
                    changeType: type,
                    oldRule,
                    rule: fRule,
                });
            })
        );

        this.registerEventHandler(
            this.Event.SheetDataValidatorStatusChanged,
            () => sheetDataValidationModel.validStatusChange$.subscribe((statusChange) => {
                const { unitId, subUnitId, ruleId, status, row, col } = statusChange;
                const target = this.getSheetTarget(unitId, subUnitId);
                if (!target) {
                    return;
                }
                const { workbook, worksheet } = target;
                const rule = worksheet.getDataValidation(ruleId);
                if (!rule) {
                    return;
                }
                this.fireEvent(this.Event.SheetDataValidatorStatusChanged, {
                    workbook,
                    worksheet,
                    row,
                    column: col,
                    rule,
                    status,
                });
            })
        );

        // Register handlers for before command events
        this.registerEventHandler(
            this.Event.BeforeSheetDataValidationAdd,
            () => commadnService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === AddSheetDataValidationCommand.id) {
                    const params = commandInfo.params as IAddSheetDataValidationCommandParams;
                    const target = this.getSheetTarget(params.unitId, params.subUnitId);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const eventParams: IBeforeSheetDataValidationAddEvent = {
                        worksheet,
                        workbook,
                        rule: params.rule,
                    };
                    this.fireEvent(this.Event.BeforeSheetDataValidationAdd, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetDataValidationCriteriaUpdate,
            () => commadnService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === UpdateSheetDataValidationSettingCommand.id) {
                    const params = commandInfo.params as IUpdateSheetDataValidationSettingCommandParams;
                    const target = this.getSheetTarget(params.unitId, params.subUnitId);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const rule = worksheet.getDataValidation(params.ruleId);
                    if (!rule) {
                        return;
                    }
                    const eventParams: IBeforeSheetDataValidationCriteriaUpdateEvent = {
                        worksheet,
                        workbook,
                        rule,
                        ruleId: params.ruleId,
                        newCriteria: params.setting,
                    };

                    this.fireEvent(this.Event.BeforeSheetDataValidationCriteriaUpdate, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetDataValidationRangeUpdate,
            () => commadnService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === UpdateSheetDataValidationRangeCommand.id) {
                    const params = commandInfo.params as IUpdateSheetDataValidationRangeCommandParams;
                    const target = this.getSheetTarget(params.unitId, params.subUnitId);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const rule = worksheet.getDataValidation(params.ruleId);
                    if (!rule) {
                        return;
                    }
                    const eventParams: IBeforeSheetDataValidationRangeUpdateEvent = {
                        worksheet,
                        workbook,
                        rule,
                        ruleId: params.ruleId,
                        newRanges: params.ranges,
                    };
                    this.fireEvent(this.Event.BeforeSheetDataValidationRangeUpdate, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetDataValidationOptionsUpdate,
            () => commadnService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === UpdateSheetDataValidationOptionsCommand.id) {
                    const params = commandInfo.params as IUpdateSheetDataValidationOptionsCommandParams;
                    const target = this.getSheetTarget(params.unitId, params.subUnitId);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const rule = worksheet.getDataValidation(params.ruleId);
                    if (!rule) {
                        return;
                    }
                    const eventParams: IBeforeSheetDataValidationOptionsUpdateEvent = {
                        worksheet,
                        workbook,
                        rule,
                        ruleId: params.ruleId,
                        newOptions: params.options,
                    };
                    this.fireEvent(this.Event.BeforeSheetDataValidationOptionsUpdate, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetDataValidationDelete,
            () => commadnService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === RemoveSheetDataValidationCommand.id) {
                    const params = commandInfo.params as IRemoveSheetDataValidationCommandParams;
                    const target = this.getSheetTarget(params.unitId, params.subUnitId);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const rule = worksheet.getDataValidation(params.ruleId);
                    if (!rule) {
                        return;
                    }
                    const eventParams: IBeforeSheetDataValidationDeleteEvent = {
                        worksheet,
                        workbook,
                        rule,
                        ruleId: params.ruleId,
                    };
                    this.fireEvent(this.Event.BeforeSheetDataValidationDelete, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetDataValidationDeleteAll,
            () => commadnService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === RemoveSheetAllDataValidationCommand.id) {
                    const params = commandInfo.params as IRemoveSheetAllDataValidationCommandParams;
                    const target = this.getSheetTarget(params.unitId, params.subUnitId);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const eventParams: IBeforeSheetDataValidationDeleteAllEvent = {
                        worksheet,
                        workbook,
                        rules: worksheet.getDataValidations(),
                    };
                    this.fireEvent(this.Event.BeforeSheetDataValidationDeleteAll, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );
    }
}

FUniver.extend(FUnvierDataValidationMixin);
declare module '@univerjs/core/facade' {
    /**
     * @ignore
     */
    // eslint-disable-next-line ts/no-namespace
    namespace FUniver {
        /**
         * @deprecated use `univerAPI.newDataValidation()` as instead.
         * @returns {FDataValidationBuilder} A new instance of the FDataValidationBuilder class
         */
        function newDataValidation(): FDataValidationBuilder;
    }

    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUnvierDataValidationMixin {}
}
