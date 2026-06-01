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
import type {
    IAddSheetDataValidationCommandParams,
    IRemoveSheetAllDataValidationCommandParams,
    IRemoveSheetDataValidationCommandParams,
    IUpdateSheetDataValidationOptionsCommandParams,
    IUpdateSheetDataValidationRangeCommandParams,
    IUpdateSheetDataValidationSettingCommandParams,
} from '@univerjs/sheets-data-validation';
import type {
    IBeforeSheetDataValidationAddEventParams,
    IBeforeSheetDataValidationCriteriaUpdateEventParams,
    IBeforeSheetDataValidationDeleteAllEventParams,
    IBeforeSheetDataValidationDeleteEventParams,
    IBeforeSheetDataValidationOptionsUpdateEventParams,
    IBeforeSheetDataValidationRangeUpdateEventParams,
    ISheetDataValidationChangedEventParams,
    ISheetDataValidatorStatusChangedEventParams,
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
export interface IFUniverSheetsDataValidationMixin {
    /**
     * Creates a new instance of FDataValidationBuilder
     * @returns {FDataValidationBuilder} A new instance of the FDataValidationBuilder class
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     *
     * // Create a new data validation rule that requires a number between 1 and 10 fot the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberBetween(1, 10)
     *   .setOptions({
     *     allowBlank: true,
     *     showErrorMessage: true,
     *     error: 'Please enter a number between 1 and 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
     * ```
     */
    newDataValidation(): FDataValidationBuilder;
}

export class FUniverSheetsDataValidationMixin extends FUniver implements IFUniverSheetsDataValidationMixin {
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
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetDataValidationChanged,
                () => {
                    if (!injector.has(SheetDataValidationModel)) return { dispose: () => {} } as IDisposable;
                    const sheetDataValidationModel = injector.get(SheetDataValidationModel);

                    return sheetDataValidationModel.ruleChange$.subscribe((ruleChange) => {
                        const { unitId, subUnitId, rule, oldRule, type } = ruleChange;
                        const target = this.getSheetCommandTarget({ unitId, subUnitId });
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const fRule = new FDataValidation(rule, worksheet.getSheet(), this._injector);

                        const eventParams: ISheetDataValidationChangedEventParams = {
                            origin: ruleChange,
                            worksheet,
                            workbook,
                            changeType: type,
                            oldRule,
                            rule: fRule,
                        };
                        this.fireEvent(this.Event.SheetDataValidationChanged, eventParams);
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetDataValidatorStatusChanged,
                () => {
                    if (!injector.has(SheetDataValidationModel)) return { dispose: () => {} } as IDisposable;
                    const sheetDataValidationModel = injector.get(SheetDataValidationModel);

                    return sheetDataValidationModel.validStatusChange$.subscribe((statusChange) => {
                        const { unitId, subUnitId, ruleId, status, row, col } = statusChange;
                        const target = this.getSheetCommandTarget({ unitId, subUnitId });
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const rule = worksheet.getDataValidation(ruleId);
                        if (!rule) return;

                        const eventParams: ISheetDataValidatorStatusChangedEventParams = {
                            workbook,
                            worksheet,
                            row,
                            column: col,
                            rule,
                            status,
                        };
                        this.fireEvent(this.Event.SheetDataValidatorStatusChanged, eventParams);
                    });
                }
            )
        );

        // Register handlers for before command events
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetDataValidationAdd,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === AddSheetDataValidationCommand.id) {
                        const params = commandInfo.params as IAddSheetDataValidationCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { rule } = params;

                        const eventParams: IBeforeSheetDataValidationAddEventParams = {
                            worksheet,
                            workbook,
                            rule,
                        };
                        this.fireEvent(this.Event.BeforeSheetDataValidationAdd, eventParams);

                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetDataValidationCriteriaUpdate,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === UpdateSheetDataValidationSettingCommand.id) {
                        const params = commandInfo.params as IUpdateSheetDataValidationSettingCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { ruleId, setting: newCriteria } = params;
                        const rule = worksheet.getDataValidation(ruleId);
                        if (!rule) return;

                        const eventParams: IBeforeSheetDataValidationCriteriaUpdateEventParams = {
                            worksheet,
                            workbook,
                            rule,
                            ruleId,
                            newCriteria,
                        };
                        this.fireEvent(this.Event.BeforeSheetDataValidationCriteriaUpdate, eventParams);

                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetDataValidationRangeUpdate,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === UpdateSheetDataValidationRangeCommand.id) {
                        const params = commandInfo.params as IUpdateSheetDataValidationRangeCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { ruleId, ranges: newRanges } = params;
                        const rule = worksheet.getDataValidation(ruleId);
                        if (!rule) return;

                        const eventParams: IBeforeSheetDataValidationRangeUpdateEventParams = {
                            worksheet,
                            workbook,
                            rule,
                            ruleId,
                            newRanges,
                        };
                        this.fireEvent(this.Event.BeforeSheetDataValidationRangeUpdate, eventParams);

                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetDataValidationOptionsUpdate,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === UpdateSheetDataValidationOptionsCommand.id) {
                        const params = commandInfo.params as IUpdateSheetDataValidationOptionsCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { ruleId, options: newOptions } = params;
                        const rule = worksheet.getDataValidation(ruleId);
                        if (!rule) return;

                        const eventParams: IBeforeSheetDataValidationOptionsUpdateEventParams = {
                            worksheet,
                            workbook,
                            rule,
                            ruleId,
                            newOptions,
                        };
                        this.fireEvent(this.Event.BeforeSheetDataValidationOptionsUpdate, eventParams);

                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetDataValidationDelete,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === RemoveSheetDataValidationCommand.id) {
                        const params = commandInfo.params as IRemoveSheetDataValidationCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { ruleId } = params;
                        const rule = worksheet.getDataValidation(ruleId);
                        if (!rule) return;

                        const eventParams: IBeforeSheetDataValidationDeleteEventParams = {
                            worksheet,
                            workbook,
                            rule,
                            ruleId,
                        };
                        this.fireEvent(this.Event.BeforeSheetDataValidationDelete, eventParams);

                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetDataValidationDeleteAll,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === RemoveSheetAllDataValidationCommand.id) {
                        const params = commandInfo.params as IRemoveSheetAllDataValidationCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const rules = worksheet.getDataValidations();

                        const eventParams: IBeforeSheetDataValidationDeleteAllEventParams = {
                            worksheet,
                            workbook,
                            rules,
                        };
                        this.fireEvent(this.Event.BeforeSheetDataValidationDeleteAll, eventParams);

                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );
    }
}

FUniver.extend(FUniverSheetsDataValidationMixin);
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
    interface FUniver extends IFUniverSheetsDataValidationMixin {}
}
