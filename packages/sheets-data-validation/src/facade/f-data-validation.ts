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
     * Gets whether invalid data is allowed based on the error style value
     * @returns {boolean} true if invalid data is allowed, false otherwise
     * @example
     * ```typescript
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const allowsInvalid = dataValidation.getAllowInvalid();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const type = dataValidation.getCriteriaType();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const [operator, formula1, formula2] = dataValidation.getCriteriaValues();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const helpText = dataValidation.getHelpText();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const builder = dataValidation.copy();
     * const newRule = builder.setAllowInvalid(true).build();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const isApplied = dataValidation.getApplied();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const ranges = dataValidation.getRanges();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const unitId = dataValidation.getUnitId();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const sheetId = dataValidation.getSheetId();
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * dataValidation.setCriteria(
     *   DataValidationType.DECIMAL,
     *   [DataValidationOperator.BETWEEN, '1', '10'],
     *   true
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * dataValidation.setOptions({
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const range = FRange.create('Sheet1', 'A1:B10');
     * dataValidation.setRanges([range]);
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
     * const dataValidation = univerAPI
     *  .getActiveWorkbook()
     *  .getActiveWorksheet()
     *  .getActiveRange()
     *  .getDataValidation();
     * const isDeleted = dataValidation.delete();
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
