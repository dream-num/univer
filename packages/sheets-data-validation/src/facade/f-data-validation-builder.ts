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
 *
 *     Set the data validation for cell A1 to require a value from B1:B10.
 *     var rule = FUniver.newDataValidation().requireValueInRange(range).build();
 *     cell.setDataValidation(rule);
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
     */
    build(): FDataValidation {
        return new FDataValidation(this._rule);
    }

    /**
     * Creates a duplicate of the current DataValidationBuilder object
     * @returns {FDataValidationBuilder} A new instance of the DataValidationBuilder class
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
     */
    getAllowInvalid(): boolean {
        return this._rule.errorStyle !== DataValidationErrorStyle.STOP;
    }

    /**
     * Gets the data validation type of the rule
     * @returns {DataValidationType} The data validation type
     */
    getCriteriaType(): DataValidationType | string {
        return this._rule.type;
    }

    /**
     * Gets the values used for criteria evaluation
     * @returns {[string, string, string]} An array containing the operator, formula1, and formula2 values
     */
    getCriteriaValues(): [string | undefined, string | undefined, string | undefined] {
        return [this._rule.operator, this._rule.formula1, this._rule.formula2];
    }

    /**
     * Gets the help text information, which is used to provide users with guidance and support
     * @returns {string | undefined} Returns the help text information. If there is no error message, it returns an undefined value.
     */
    getHelpText(): string | undefined {
        return this._rule.error;
    }

    /**
     * Sets the data validation type to CHECKBOX and sets the checked and unchecked values
     * @param checkedValue The value when the checkbox is checked (Optional)
     * @param uncheckedValue The value when the checkbox is unchecked (Optional)
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
     */
    requireCheckbox(checkedValue?: string, uncheckedValue?: string): FDataValidationBuilder {
        this._rule.type = DataValidationType.CHECKBOX;
        this._rule.formula1 = checkedValue;
        this._rule.formula2 = uncheckedValue;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be after a specific date
     * @param date The date to compare against. The formatted date string will be set as formula1
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
     */
    requireDateAfter(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.operator = DataValidationOperator.GREATER_THAN;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be before a specific date
     * @param date The date to compare against. The formatted date string will be set as formula1
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
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
     * @param start The starting date of the range. The formatted date string will be set as formula1
     * @param end The ending date of the range. The formatted date string will be set as formula2
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
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
     * @param date The date to compare against. The formatted date string will be set as formula1
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
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
     * @param start The starting date of the date range
     * @param end The ending date of the date range
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
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
     * @param date The date to compare against. The formatted date string will be set as formula1
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
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
     * @param date The date to compare against. The formatted date string will be set as formula1
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
     */
    requireDateOnOrBefore(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN_OR_EQUAL;

        return this;
    }

    /**
     * Requires that a custom formula be satisfied.
     * Sets the data validation type to CUSTOM and configures the validation rule based on the provided formula string.
     * @param formula The formula string that needs to be satisfied.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
     */
    requireFormulaSatisfied(formula: string): FDataValidationBuilder {
        this._rule.type = DataValidationType.CUSTOM;
        this._rule.formula1 = formula;
        this._rule.formula2 = undefined;
        return this;
    }

    /**
     * Requires the user to enter a number within a specific range, which can be integer or decimal.
     * Sets the data validation type based on the isInteger parameter and configures the validation rules for the specified number range.
     * @param start The starting value of the number range.
     * @param end The ending value of the number range.
     * @param isInteger Indicates whether the required number is an integer. Default is undefined, meaning it can be an integer or decimal.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
     */
    requireNumberBetween(start: number, end: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${start}`;
        this._rule.formula2 = `${end}`;
        this._rule.operator = DataValidationOperator.BETWEEN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;

        return this;
    }

    /**
     * Requires the user to enter a number that is equal to a specific value, which can be an integer or a decimal.
     * Sets the data validation type based on the isInteger parameter and configures the validation rules for the specified number.
     * @param num The number to which the entered number should be equal.
     * @param isInteger Indicates whether the required number is an integer. Default is undefined, meaning it can be an integer or a decimal.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
     */
    requireNumberEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Requires the user to enter a number that is greater than a specific value, which can be an integer or a decimal.
     * Sets the data validation type based on the isInteger parameter and configures the validation rules for the specified number.
     * @param num The number to which the entered number should be greater.
     * @param isInteger Indicates whether the required number is an integer. Default is undefined, meaning it can be an integer or a decimal.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
     */
    requireNumberGreaterThan(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.GREATER_THAN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Requires the user to enter a number that is greater than or equal to a specific value, which can be an integer or a decimal.
     * Sets the data validation type based on the isInteger parameter and configures the validation rules for the specified number.
     * @param num The number to which the entered number should be greater than or equal.
     * @param isInteger Indicates whether the required number is an integer. Default is undefined, meaning it can be an integer or a decimal.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
     */
    requireNumberGreaterThanOrEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.GREATER_THAN_OR_EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Requires the user to enter a number that is less than a specific value, which can be an integer or a decimal.
     * Sets the data validation type based on the isInteger parameter and configures the validation rules for the specified number.
     * @param num The number to which the entered number should be less.
     * @param isInteger Indicates whether the required number is an integer. Default is undefined, meaning it can be an integer or a decimal.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
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
     * @param num The number to which the entered number should be less than or equal
     * @param isInteger Indicates whether the required number is an integer
     * @returns The current instance of the DataValidationBuilder class, allowing for method chaining
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
     * @param start The starting point of the specified range
     * @param end The end point of the specified range
     * @param isInteger Optional parameter, indicating whether the number to be verified is an integer. Default value is false
     * @returns An instance of the FDataValidationBuilder class, allowing for method chaining
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
     * @param num The number to which the entered number should not be equal
     * @param isInteger Indicates whether the required number is an integer. Default is undefined, meaning it can be an integer or a decimal
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining
     */
    requireNumberNotEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.NOT_EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    /**
     * Sets a data validation rule that requires the user to enter a value from a list of specific values.
     * The list can be displayed in a dropdown, and the user can choose multiple values according to the settings.
     * @param values An array containing the specific values that the user can enter.
     * @param multiple Optional parameter indicating whether the user can select multiple values. Default is false, meaning only one value can be selected.
     * @param showDropdown Optional parameter indicating whether to display the list in a dropdown. Default is true, meaning the list will be displayed as a dropdown.
     * @returns An instance of the FDataValidationBuilder class, allowing for method chaining.
     */
    requireValueInList(values: string[], multiple?: boolean, showDropdown?: boolean): FDataValidationBuilder {
        this._rule.type = multiple ? DataValidationType.LIST_MULTIPLE : DataValidationType.LIST;
        this._rule.formula1 = values.join(',');
        this._rule.formula2 = undefined;
        this._rule.showDropDown = showDropdown ?? true;

        return this;
    }

    /**
     * Sets a data validation rule that requires the user to enter a value within a specific range.
     * The range is defined by an FRange object, which contains the unit ID, sheet name, and cell range.
     * @param range An FRange object representing the range of values that the user can enter.
     * @param multiple Optional parameter indicating whether the user can select multiple values. Default is false, meaning only one value can be selected.
     * @param showDropdown Optional parameter indicating whether to display the list in a dropdown. Default is true, meaning the list will be displayed as a dropdown.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
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
     * Sets whether to allow invalid data and configures the error style for data validation.
     * If invalid data is not allowed, the error style will be set to STOP, indicating that data entry must stop upon encountering an error.
     * If invalid data is allowed, the error style will be set to WARNING, indicating that a warning will be displayed when invalid data is entered, but data entry can continue.
     * @param allowInvalidData A boolean value indicating whether to allow invalid data.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
     */
    setAllowInvalid(allowInvalidData: boolean): FDataValidationBuilder {
        this._rule.errorStyle = !allowInvalidData ? DataValidationErrorStyle.STOP : DataValidationErrorStyle.WARNING;
        return this;
    }

    /**
     * Sets the help text and enables the display of error messages for data validation.
     * This method allows you to set a custom help text that will be displayed when the user enters invalid data.
     * @param helpText The text to display as help information.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
     */
    setHelpText(helpText: string): FDataValidationBuilder {
        this._rule.error = helpText;
        this._rule.showErrorMessage = true;
        return this;
    }

    /**
     * Sets the criteria values for data validation.
     * This method is used to configure the validation rules based on specific criteria values.
     * @param type The type of data validation.
     * @param values An array containing the criteria values.
     * The array should have three elements: [operator, formula1, formula2].
     * operator is a DataValidationOperator enum value, formula1 is the first formula, and formula2 is the second formula.
     * @returns The current instance of the FDataValidationBuilder class, allowing for method chaining.
     */
    withCriteriaValues(type: DataValidationType | string, values: [DataValidationOperator, string, string]): this {
        this._rule.type = type;
        this._rule.operator = values[0];
        this._rule.formula1 = values[1];
        this._rule.formula2 = values[2];
        return this;
    }

    setAllowBlank(allowBlank: boolean): FDataValidationBuilder {
        this._rule.allowBlank = allowBlank;
        return this;
    }

    /**
     * Sets the options for the data validation rule.
     * For details of options, please refer to https://univer.ai/typedoc/@univerjs/core/interfaces/IDataValidationRuleOptions
     * @param options The options to set for the data validation rule.
     * @returns The current instance of the FDataValidationBuilder class to allow for method chaining.
     */
    setOptions(options: Partial<IDataValidationRuleOptions>): this {
        Object.assign(this._rule, options);
        return this;
    }
}
