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

import type { DataValidationOperator, DataValidationType, IDataValidationRule, IDataValidationRuleOptions, Injector, IRange, Workbook, Worksheet } from '@univerjs/core';
import type { IRemoveSheetDataValidationCommandParams, IUpdateSheetDataValidationOptionsCommandParams, IUpdateSheetDataValidationRangeCommandParams, IUpdateSheetDataValidationSettingCommandParams } from '@univerjs/sheets-data-validation';
import { DataValidationErrorStyle, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { DataValidationModel, getRuleOptions } from '@univerjs/data-validation';
import { RemoveSheetDataValidationCommand, UpdateSheetDataValidationOptionsCommand, UpdateSheetDataValidationRangeCommand, UpdateSheetDataValidationSettingCommand } from '@univerjs/sheets-data-validation';
import { FRange } from '@univerjs/sheets/facade';
import { FDataValidationBuilder } from './f-data-validation-builder';

/**
 * @hideconstructor
 */
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
     * Gets whether invalid data is allowed based on the error style value
     * @returns {boolean} true if invalid data is allowed, false otherwise
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getDataValidations();
     * rules.forEach((rule) => {
     *   console.log(rule, rule.getAllowInvalid());
     * });
     * ```
     */
    getAllowInvalid(): boolean {
        return this.rule.errorStyle !== DataValidationErrorStyle.STOP;
    };

    /**
     * Gets the data validation type of the rule
     * @returns {DataValidationType | string} The data validation type
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getDataValidations();
     * rules.forEach((rule) => {
     *   console.log(rule, rule.getCriteriaType());
     * });
     * ```
     */
    getCriteriaType(): DataValidationType | string {
        return this.rule.type;
    };

    /**
     * Gets the values used for criteria evaluation
     * @returns {[string | undefined, string | undefined, string | undefined]} An array containing the operator, formula1, and formula2 values
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getDataValidations();
     * rules.forEach((rule) => {
     *   console.log(rule);
     *   const criteriaValues = rule.getCriteriaValues();
     *   const [operator, formula1, formula2] = criteriaValues;
     *   console.log(operator, formula1, formula2);
     * });
     * ```
     */
    getCriteriaValues(): [string | undefined, string | undefined, string | undefined] {
        return [this.rule.operator, this.rule.formula1, this.rule.formula2];
    }

    /**
     * Gets the help text information, which is used to provide users with guidance and support
     * @returns {string | undefined} Returns the help text information. If there is no error message, it returns an undefined value
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
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
     * console.log(fRange.getDataValidation().getHelpText()); // 'Please enter a number between 1 and 10'
     * ```
     */
    getHelpText(): string | undefined {
        return this.rule.error;
    };

    /**
     * Creates a new instance of FDataValidationBuilder using the current rule object
     * @returns {FDataValidationBuilder} A new FDataValidationBuilder instance with the same rule configuration
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
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
     *
     * const builder = fRange.getDataValidation().copy();
     * const newRule = builder
     *   .requireNumberBetween(1, 5)
     *   .setOptions({
     *     error: 'Please enter a number between 1 and 5'
     *   })
     *   .build();
     * fRange.setDataValidation(newRule);
     * ```
     */
    copy(): FDataValidationBuilder {
        return new FDataValidationBuilder(this.rule);
    }

    /**
     * Gets whether the data validation rule is applied to the worksheet
     * @returns {boolean} true if the rule is applied, false otherwise
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getDataValidations();
     * rules.forEach((rule) => {
     *   console.log(rule, rule.getApplied());
     * });
     *
     * const fRange = fWorksheet.getRange('A1:B10');
     * console.log(fRange.getDataValidation()?.getApplied());
     * ```
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
     * Gets the ranges to which the data validation rule is applied
     * @returns {FRange[]} An array of FRange objects representing the ranges to which the data validation rule is applied
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getDataValidations();
     * rules.forEach((rule) => {
     *   console.log(rule);
     *   const ranges = rule.getRanges();
     *   ranges.forEach((range) => {
     *     console.log(range.getA1Notation());
     *   });
     * });
     * ```
     */
    getRanges(): FRange[] {
        if (!this.getApplied()) {
            return [];
        }

        const workbook = this._injector!.get(IUniverInstanceService).getUnit<Workbook>(this._worksheet!.getUnitId())!;
        return this.rule.ranges.map((range: IRange) => this._injector!.createInstance(FRange, workbook, this._worksheet!, range));
    }

    /**
     * Gets the unit ID of the worksheet
     * @returns {string | undefined} The unit ID of the worksheet
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B10');
     * console.log(fRange.getDataValidation().getUnitId());
     * ```
     */
    getUnitId(): string | undefined {
        return this._worksheet?.getUnitId();
    }

    /**
     * Gets the sheet ID of the worksheet
     * @returns {string | undefined} The sheet ID of the worksheet
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B10');
     * console.log(fRange.getDataValidation().getSheetId());
     * ```
     */
    getSheetId(): string | undefined {
        return this._worksheet?.getSheetId();
    }

    /**
     * Set Criteria for the data validation rule
     * @param {DataValidationType} type - The type of data validation criteria
     * @param {[DataValidationOperator, string, string]} values - An array containing the operator, formula1, and formula2 values
     * @param {boolean} [allowBlank] - Whether to allow blank values
     * @returns {FDataValidation} The current instance for method chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number equal to 20 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberEqualTo(20)
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Change the rule criteria to require a number between 1 and 10
     * fRange.getDataValidation().setCriteria(
     *   univerAPI.Enum.DataValidationType.DECIMAL,
     *   [univerAPI.Enum.DataValidationOperator.BETWEEN, '1', '10']
     * );
     * ```
     */
    setCriteria(type: DataValidationType, values: [DataValidationOperator, string, string], allowBlank = true): FDataValidation {
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
                    allowBlank,
                },
            } as IUpdateSheetDataValidationSettingCommandParams);

            if (!res) {
                throw new Error('setCriteria failed');
            }
        }

        this.rule.operator = values[0];
        this.rule.formula1 = values[1];
        this.rule.formula2 = values[2];
        this.rule.type = type;
        this.rule.allowBlank = allowBlank;

        return this;
    }

    /**
     * Set the options for the data validation rule
     * @param {Partial<IDataValidationRuleOptions>} options - The options to set for the data validation rule
     * @returns {FDataValidation} The current instance for method chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number equal to 20 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberEqualTo(20)
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Supplement the rule with additional options
     * fRange.getDataValidation().setOptions({
     *   allowBlank: true,
     *   showErrorMessage: true,
     *   error: 'Please enter a valid value'
     * });
     * ```
     */
    setOptions(options: Partial<IDataValidationRuleOptions>): FDataValidation {
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
                throw new Error('setOptions failed');
            }
        }

        Object.assign(this.rule, options);
        return this;
    }

    /**
     * Set the ranges to the data validation rule
     * @param {FRange[]} ranges - New ranges array
     * @returns {FDataValidation} The current instance for method chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number equal to 20 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberEqualTo(20)
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Change the range to C1:D10
     * const newRuleRange = fWorksheet.getRange('C1:D10');
     * fRange.getDataValidation().setRanges([newRuleRange]);
     * ```
     */
    setRanges(ranges: FRange[]): FDataValidation {
        if (this.getApplied()) {
            const commandService = this._injector!.get(ICommandService);
            const res = commandService.syncExecuteCommand(UpdateSheetDataValidationRangeCommand.id, {
                unitId: this.getUnitId(),
                subUnitId: this.getSheetId(),
                ruleId: this.rule.uid,
                ranges: ranges.map((range) => range.getRange()),
            } as IUpdateSheetDataValidationRangeCommandParams);

            if (!res) {
                throw new Error('setRanges failed');
            }
        }

        this.rule.ranges = ranges.map((range) => range.getRange());
        return this;
    }

    /**
     * Delete the data validation rule from the worksheet
     * @returns {boolean} true if the rule is deleted successfully, false otherwise
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number equal to 20 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberEqualTo(20)
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Delete the data validation rule
     * fRange.getDataValidation().delete();
     * ```
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
