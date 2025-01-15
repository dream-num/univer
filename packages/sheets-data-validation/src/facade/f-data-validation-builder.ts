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

import type { IDataValidationRule, IDataValidationRuleOptions } from '@univerjs/core';
import type { FRange } from '@univerjs/sheets/facade';
import { DataValidationErrorStyle, DataValidationOperator, DataValidationType, generateRandomId } from '@univerjs/core';
import { serializeRangeToRefString } from '@univerjs/engine-formula';
import { FDataValidation } from './f-data-validation';

/**
 * Builder for data validation rules.
 * @example
 * ```typescript
 * // Set the data validation for cell A1 to require a value from B1:B10
 * const range = FRange.create('Sheet1', 'B1:B10');
 * const rule = FUniver.newDataValidation().requireValueInRange(range).build();
 * cell.setDataValidation(rule);
 * ```
 */
export class FDataValidationBuilder {
    private _rule: IDataValidationRule;

    constructor(rule?: IDataValidationRule) {
        this._rule = rule ?? {
            uid: generateRandomId(),
            ranges: undefined,
            type: DataValidationType.CUSTOM,
        };
    }

    /**
     * Builds an FDataValidation instance based on the _rule property of the current class
     * @returns {FDataValidation} A new instance of the FDataValidation class
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const validation = builder.requireNumberBetween(1, 10).build();
     * ```
     */
    build(): FDataValidation {
        return new FDataValidation(this._rule);
    }

    /**
     * Creates a duplicate of the current DataValidationBuilder object
     * @returns {FDataValidationBuilder} A new instance of the DataValidationBuilder class
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const copy = builder.requireNumberBetween(1, 10).copy();
     * ```
     */
    copy(): FDataValidationBuilder {
        return new FDataValidationBuilder({
            ...this._rule,
            uid: generateRandomId(),
        });
    }

    /**
     * Determines whether invalid data is allowed
     * @returns {boolean} True if invalid data is allowed, False otherwise
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const allowsInvalid = builder.getAllowInvalid();
     * ```
     */
    getAllowInvalid(): boolean {
        return this._rule.errorStyle !== DataValidationErrorStyle.STOP;
    }

    /**
     * Gets the data validation type of the rule
     * @returns {DataValidationType | string} The data validation type
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const type = builder.getCriteriaType();
     * ```
     */
    getCriteriaType(): DataValidationType | string {
        return this._rule.type;
    }

    /**
     * Gets the values used for criteria evaluation
     * @returns {[string | undefined, string | undefined, string | undefined]} An array containing the operator, formula1, and formula2 values
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const [operator, formula1, formula2] = builder.getCriteriaValues();
     * ```
     */
    getCriteriaValues(): [string | undefined, string | undefined, string | undefined] {
        return [this._rule.operator, this._rule.formula1, this._rule.formula2];
    }

    /**
     * Gets the help text information, which is used to provide users with guidance and support
     * @returns {string | undefined} Returns the help text information. If there is no error message, it returns an undefined value
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const helpText = builder.getHelpText();
     * ```
     */
    getHelpText(): string | undefined {
        return this._rule.error;
    }

    /**
     * Sets the data validation type to CHECKBOX and sets the checked and unchecked values
     * @param {string} [checkedValue] - The value when the checkbox is checked
     * @param {string} [uncheckedValue] - The value when the checkbox is unchecked
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireCheckbox('Yes', 'No').build();
     * ```
     */
    requireCheckbox(checkedValue?: string, uncheckedValue?: string): FDataValidationBuilder {
        this._rule.type = DataValidationType.CHECKBOX;
        this._rule.formula1 = checkedValue;
        this._rule.formula2 = uncheckedValue;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be after a specific date
     * @param {Date} date - The date to compare against
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireDateAfter(new Date('2024-01-01')).build();
     * ```
     */
    requireDateAfter(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.operator = DataValidationOperator.GREATER_THAN;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be before a specific date
     * @param {Date} date - The date to compare against
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireDateBefore(new Date('2024-12-31')).build();
     * ```
     */
    requireDateBefore(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be within a specific date range
     * @param {Date} start - The starting date of the range
     * @param {Date} end - The ending date of the range
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder
     *   .requireDateBetween(new Date('2024-01-01'), new Date('2024-12-31'))
     *   .build();
     * ```
     */
    requireDateBetween(start: Date, end: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = start.toLocaleDateString();
        this._rule.formula2 = end.toLocaleDateString();
        this._rule.operator = DataValidationOperator.BETWEEN;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be equal to a specific date
     * @param {Date} date - The date to compare against
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireDateEqualTo(new Date('2024-01-01')).build();
     * ```
     */
    requireDateEqualTo(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.EQUAL;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be not within a specific date range
     * @param {Date} start - The starting date of the date range
     * @param {Date} end - The ending date of the date range
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder
     *   .requireDateNotBetween(new Date('2024-01-01'), new Date('2024-12-31'))
     *   .build();
     * ```
     */
    requireDateNotBetween(start: Date, end: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = start.toLocaleDateString();
        this._rule.formula2 = end.toLocaleDateString();
        this._rule.operator = DataValidationOperator.NOT_BETWEEN;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be on or after a specific date
     * @param {Date} date - The date to compare against
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireDateOnOrAfter(new Date('2024-01-01')).build();
     * ```
     */
    requireDateOnOrAfter(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.GREATER_THAN_OR_EQUAL;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be on or before a specific date
     * @param {Date} date - The date to compare against
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireDateOnOrBefore(new Date('2024-12-31')).build();
     * ```
     */
    requireDateOnOrBefore(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN_OR_EQUAL;

        return this;
    }

    /**
     * Requires that a custom formula be satisfied
     * @param {string} formula - The formula string that needs to be satisfied
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireFormulaSatisfied('=A1>0').build();
     * ```
     */
    requireFormulaSatisfied(formula: string): FDataValidationBuilder {
        this._rule.type = DataValidationType.CUSTOM;
        this._rule.formula1 = formula;
        this._rule.formula2 = undefined;
        return this;
    }

    /**
     * Requires the user to enter a number within a specific range, which can be integer or decimal
     * @param {number} start - The starting value of the number range
     * @param {number} end - The ending value of the number range
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireNumberBetween(1, 10).build();
     * ```
     */
    requireNumberBetween(start: number, end: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${start}`;
        this._rule.formula2 = `${end}`;
        this._rule.operator = DataValidationOperator.BETWEEN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;

        return this;
    }

    /**
     * Requires the user to enter a number that is equal to a specific value, which can be an integer or a decimal
     * @param {number} num - The number to which the entered number should be equal
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireNumberEqualTo(10).build();
     * ```
     */
    requireNumberEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Requires the user to enter a number that is greater than a specific value, which can be an integer or a decimal
     * @param {number} num - The number to which the entered number should be greater
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireNumberGreaterThan(10).build();
     * ```
     */
    requireNumberGreaterThan(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.GREATER_THAN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Requires the user to enter a number that is greater than or equal to a specific value, which can be an integer or a decimal
     * @param {number} num - The number to which the entered number should be greater than or equal
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireNumberGreaterThanOrEqualTo(10).build();
     * ```
     */
    requireNumberGreaterThanOrEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.GREATER_THAN_OR_EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Requires the user to enter a number that is less than a specific value, which can be an integer or a decimal
     * @param {number} num - The number to which the entered number should be less
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireNumberLessThan(10).build();
     * ```
     */
    requireNumberLessThan(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Sets the data validation rule to require a number less than or equal to a specified value
     * The specified value can be an integer or a decimal
     * @param {number} num - The number to which the entered number should be less than or equal
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireNumberLessThanOrEqualTo(10).build();
     * ```
     */
    requireNumberLessThanOrEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN_OR_EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Sets a data validation rule that requires the user to enter a number outside a specified range
     * The specified range includes all integers and decimals
     * @param {number} start - The starting point of the specified range
     * @param {number} end - The end point of the specified range
     * @param {boolean} [isInteger] - Optional parameter, indicating whether the number to be verified is an integer
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireNumberNotBetween(1, 10).build();
     * ```
     */
    requireNumberNotBetween(start: number, end: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${start}`;
        this._rule.formula2 = `${end}`;
        this._rule.operator = DataValidationOperator.NOT_BETWEEN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;

        return this;
    }

    /**
     * Creates a data validation rule that requires the user to enter a number that is not equal to a specific value
     * The specific value can be an integer or a decimal
     * @param {number} num - The number to which the entered number should not be equal
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireNumberNotEqualTo(10).build();
     * ```
     */
    requireNumberNotEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.NOT_EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Sets a data validation rule that requires the user to enter a value from a list of specific values
     * The list can be displayed in a dropdown, and the user can choose multiple values according to the settings
     * @param {string[]} values - An array containing the specific values that the user can enter
     * @param {boolean} [multiple] - Optional parameter indicating whether the user can select multiple values
     * @param {boolean} [showDropdown] - Optional parameter indicating whether to display the list in a dropdown
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.requireValueInList(['Yes', 'No']).build();
     * ```
     */
    requireValueInList(values: string[], multiple?: boolean, showDropdown?: boolean): FDataValidationBuilder {
        this._rule.type = multiple ? DataValidationType.LIST_MULTIPLE : DataValidationType.LIST;
        this._rule.formula1 = values.join(',');
        this._rule.formula2 = undefined;
        this._rule.showDropDown = showDropdown ?? true;

        return this;
    }

    /**
     * Sets a data validation rule that requires the user to enter a value within a specific range
     * The range is defined by an FRange object, which contains the unit ID, sheet name, and cell range
     * @param {FRange} range - An FRange object representing the range of values that the user can enter
     * @param {boolean} [multiple] - Optional parameter indicating whether the user can select multiple values
     * @param {boolean} [showDropdown] - Optional parameter indicating whether to display the list in a dropdown
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const range = FRange.create('Sheet1', 'B1:B10');
     * const rule = builder.requireValueInRange(range).build();
     * ```
     */
    requireValueInRange(range: FRange, multiple?: boolean, showDropdown?: boolean): FDataValidationBuilder {
        this._rule.type = multiple ? DataValidationType.LIST_MULTIPLE : DataValidationType.LIST;
        this._rule.formula1 = `=${serializeRangeToRefString({
            unitId: range.getUnitId(),
            sheetName: range.getSheetName(),
            range: range.getRange(),
        })}`;
        this._rule.formula2 = undefined;
        this._rule.showDropDown = showDropdown ?? true;

        return this;
    }

    /**
     * Sets whether to allow invalid data and configures the error style
     * If invalid data is not allowed, the error style will be set to STOP, indicating that data entry must stop upon encountering an error
     * If invalid data is allowed, the error style will be set to WARNING, indicating that a warning will be displayed when invalid data is entered, but data entry can continue
     * @param {boolean} allowInvalidData - Whether to allow invalid data
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.setAllowInvalid(true).build();
     * ```
     */
    setAllowInvalid(allowInvalidData: boolean): FDataValidationBuilder {
        this._rule.errorStyle = !allowInvalidData ? DataValidationErrorStyle.STOP : DataValidationErrorStyle.WARNING;
        return this;
    }

    /**
     * Sets whether to allow blank values
     * @param {boolean} allowBlank - Whether to allow blank values
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.setAllowBlank(true).build();
     * ```
     */
    setAllowBlank(allowBlank: boolean): FDataValidationBuilder {
        this._rule.allowBlank = allowBlank;
        return this;
    }

    /**
     * Sets the options for the data validation rule
     * @param {Partial<IDataValidationRuleOptions>} options - The options to set for the data validation rule
     * @returns {FDataValidationBuilder} The current instance for method chaining
     * @example
     * ```typescript
     * const builder = univerAPI.newDataValidation();
     * const rule = builder.setOptions({
     *   allowBlank: true,
     *   showErrorMessage: true,
     *   error: 'Please enter a valid value'
     * }).build();
     * ```
     */
    setOptions(options: Partial<IDataValidationRuleOptions>): this {
        Object.assign(this._rule, options);
        return this;
    }
}
