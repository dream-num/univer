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

import type { DataValidationOperator, DataValidationType, IDataValidationRule, IDataValidationRuleOptions, Injector, IRange, Workbook, Worksheet } from '@univerjs/core';
import type { IRemoveSheetDataValidationCommandParams, IUpdateSheetDataValidationOptionsCommandParams, IUpdateSheetDataValidationRangeCommandParams, IUpdateSheetDataValidationSettingCommandParams } from '@univerjs/sheets-data-validation';
import { DataValidationErrorStyle, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { DataValidationModel, getRuleOptions } from '@univerjs/data-validation';
import { RemoveSheetDataValidationCommand, UpdateSheetDataValidationOptionsCommand, UpdateSheetDataValidationRangeCommand, UpdateSheetDataValidationSettingCommand } from '@univerjs/sheets-data-validation';
import { FRange } from '@univerjs/sheets/facade';
import { FDataValidationBuilder } from './f-data-validation-builder';

export class FDataValidation {
    rule: IDataValidationRule;
    private _worksheet: Worksheet | undefined;
    private _injector: Injector | undefined;

    constructor(rule: IDataValidationRule, worksheet?: Worksheet, _injector?: Injector) {
        this._injector = _injector;
        this.rule = rule;
        this._worksheet = worksheet;
    }

    /**
     * Gets whether invalid data is allowed based on the error style value.
     *
     * @return true if invalid data is allowed, false otherwise.
     */
    getAllowInvalid(): boolean {
        return this.rule.errorStyle !== DataValidationErrorStyle.STOP;
    };

    /**
     * Gets the data validation type of the rule
     *
     * @returns The data validation type
     */
    getCriteriaType(): DataValidationType | string {
        return this.rule.type;
    };

    /**
     * Gets the values used for criteria evaluation
     *
     * @returns An array containing the operator, formula1, and formula2 values
     */
    getCriteriaValues(): [string | undefined, string | undefined, string | undefined] {
        return [this.rule.operator, this.rule.formula1, this.rule.formula2];
    }

    /**
     * Gets the help text information, which is used to provide users with guidance and support
     *
     * @returns Returns the help text information. If there is no error message, it returns an undefined value.
     */
    getHelpText(): string | undefined {
        return this.rule.error;
    };

    /**
     * Creates a new instance of FDataValidationBuilder using the current rule object.
     * This method is useful for copying an existing data validation rule configuration.
     *
     * @return A new FDataValidationBuilder instance with the same rule configuration.
     */
    copy(): FDataValidationBuilder {
        return new FDataValidationBuilder(this.rule);
    }

    /**
     * Gets whether the data validation rule is applied to the worksheet.
     *
     * @returns true if the rule is applied, false otherwise.
     */
    getApplied(): boolean {
        if (!this._worksheet) {
            return false;
        }

        const dataValidationModel = this._injector!.get(DataValidationModel);
        const currentRule = dataValidationModel.getRuleById(this._worksheet.getUnitId(), this._worksheet.getSheetId(), this.rule.uid);

        if (currentRule && currentRule.ranges.length) {
            return true;
        }
        return false;
    }

    /**
     * Gets the ranges to which the data validation rule is applied.
     *
     * @returns An array of IRange objects representing the ranges to which the data validation rule is applied.
     */
    getRanges(): FRange[] {
        if (!this.getApplied()) {
            return [];
        }

        const workbook = this._injector!.get(IUniverInstanceService).getUnit<Workbook>(this._worksheet!.getUnitId())!;
        return this.rule.ranges.map((range: IRange) => this._injector!.createInstance(FRange, workbook, this._worksheet!, range));
    }

    /**
     * Gets the title of the error message dialog box.
     *
     * @returns The title of the error message dialog box.
     */
    getUnitId(): string | undefined {
        return this._worksheet?.getUnitId();
    }

    /**
     * Gets the sheetId of the worksheet.
     *
     * @returns The sheetId of the worksheet.
     */
    getSheetId(): string | undefined {
        return this._worksheet?.getSheetId();
    }

    /**
     * Set Criteria for the data validation rule.
     * @param type The type of data validation criteria.
     * @param values An array containing the operator, formula1, and formula2 values.
     * @returns true if the criteria is set successfully, false otherwise.
     */
    setCriteria(type: DataValidationType, values: [DataValidationOperator, string, string]): boolean {
        if (this.getApplied()) {
            const commandService = this._injector!.get(ICommandService);
            const res = commandService.syncExecuteCommand(UpdateSheetDataValidationSettingCommand.id, {
                unitId: this.getUnitId(),
                subUnitId: this.getSheetId(),
                ruleId: this.rule.uid,
                setting: {
                    operator: values[0],
                    formula1: values[1],
                    formula2: values[2],
                    type: this.rule.type,
                },
            } as IUpdateSheetDataValidationSettingCommandParams);

            if (!res) {
                return false;
            }
        }

        this.rule.operator = values[0];
        this.rule.formula1 = values[1];
        this.rule.formula2 = values[2];
        this.rule.type = type;

        return true;
    }

    /**
     * Set the options for the data validation rule.
     * For details of options, please refer to https://univer.ai/typedoc/@univerjs/core/interfaces/IDataValidationRuleOptions
     * @param options An object containing the options to set. `IDataValidationRuleOptions`
     * @returns true if the options are set successfully, false otherwise.
     */
    setOptions(options: Partial<IDataValidationRuleOptions>): boolean {
        if (this.getApplied()) {
            const commandService = this._injector!.get(ICommandService);
            const res = commandService.syncExecuteCommand(UpdateSheetDataValidationOptionsCommand.id, {
                unitId: this.getUnitId(),
                subUnitId: this.getSheetId(),
                ruleId: this.rule.uid,
                options: {
                    ...getRuleOptions(this.rule),
                    ...options,
                },
            } as IUpdateSheetDataValidationOptionsCommandParams);

            if (!res) {
                return false;
            }
        }

        Object.assign(this.rule, options);
        return true;
    }

    /**
     * Set the ranges to the data validation rule.
     * @param ranges new ranges array.
     * @returns true if the ranges are set successfully, false otherwise.
     */
    setRanges(ranges: FRange[]): boolean {
        if (this.getApplied()) {
            const commandService = this._injector!.get(ICommandService);
            const res = commandService.syncExecuteCommand(UpdateSheetDataValidationRangeCommand.id, {
                unitId: this.getUnitId(),
                subUnitId: this.getSheetId(),
                ruleId: this.rule.uid,
                ranges: ranges.map((range) => range.getRange()),
            } as IUpdateSheetDataValidationRangeCommandParams);

            if (!res) {
                return false;
            }
        }

        this.rule.ranges = ranges.map((range) => range.getRange());
        return true;
    }

    /**
     * Delete the data validation rule from the worksheet.
     * @returns true if the rule is deleted successfully, false otherwise.
     */
    delete(): boolean {
        if (!this.getApplied()) {
            return false;
        }

        const commandService = this._injector!.get(ICommandService);
        return commandService.syncExecuteCommand(RemoveSheetDataValidationCommand.id, {
            unitId: this.getUnitId(),
            subUnitId: this.getSheetId(),
            ruleId: this.rule.uid,
        } as IRemoveSheetDataValidationCommandParams);
    }
}
