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

import type { IDataValidationRule, IDataValidationRuleOptions } from '@univerjs/core';
import type { FRange } from '@univerjs/sheets/facade';
import { DataValidationErrorStyle, DataValidationOperator, DataValidationType, generateRandomId } from '@univerjs/core';
import { serializeRangeToRefString } from '@univerjs/engine-formula';
import { FDataValidation } from './f-data-validation';

/**
 * Builder for data validation rules. use {@link FUniver} `univerAPI.newDataValidation()` to create a new builder.
 * @example
 * ```typescript
 * // Set the data validation for cell A1 to require a value from B1:B10
 * const fWorkbook = univerAPI.getActiveWorkbook();
 * const fWorksheet = fWorkbook.getActiveSheet();
 * const fRange = fWorksheet.getRange('B1:B2');
 * fRange.setValues([
 *   ['Yes'],
 *   ['No']
 * ]);
 *
 * const rule = univerAPI.newDataValidation()
 *   .requireValueInRange(fRange)
 *   .setOptions({
 *     allowBlank: false,
 *     showErrorMessage: true,
 *     error: 'Please enter a value from the list'
 *   })
 *   .build();
 * const cell = fWorksheet.getRange('A1');
 * cell.setDataValidation(rule);
 * ```
 * @hideconstructor
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
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number between 1 and 10 for the range A1:B10
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
    build(): FDataValidation {
        return new FDataValidation(this._rule);
    }

    /**
     * Creates a duplicate of the current DataValidationBuilder object
     * @returns {FDataValidationBuilder} A new instance of the DataValidationBuilder class
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number between 1 and 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const builder = univerAPI.newDataValidation()
     *   .requireNumberBetween(1, 10)
     *   .setOptions({
     *     allowBlank: true,
     *     showErrorMessage: true,
     *     error: 'Please enter a number between 1 and 10'
     *   });
     * fRange.setDataValidation(builder.build());
     *
     * // Copy the builder applied to the new range F1:G10
     * const newRange = fWorksheet.getRange('F1:G10');
     * const copyBuilder = builder.copy();
     * newRange.setDataValidation(copyBuilder.build());
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
     * const builder = univerAPI.newDataValidation().requireNumberBetween(1, 10);
     * console.log(builder.getAllowInvalid());
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
     * console.log(builder.getCriteriaType()); // custom
     *
     * builder.requireNumberBetween(1, 10);
     * console.log(builder.getCriteriaType()); // decimal
     *
     * builder.requireValueInList(['Yes', 'No']);
     * console.log(builder.getCriteriaType()); // list
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
     * const builder = univerAPI.newDataValidation().requireNumberBetween(1, 10);
     * const [operator, formula1, formula2] = builder.getCriteriaValues();
     * console.log(operator, formula1, formula2); // between 1 10
     *
     * builder.requireValueInList(['Yes', 'No']);
     * console.log(builder.getCriteriaValues()); // undefined Yes,No undefined
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
     * const builder = univerAPI.newDataValidation().setOptions({
     *   showErrorMessage: true,
     *   error: 'Please enter a valid value'
     * });
     * console.log(builder.getHelpText()); // 'Please enter a valid value'
     * ```
     */
    getHelpText(): string | undefined {
        return this._rule.error;
    }

    /**
     * Sets the data validation rule to require that the input is a boolean value; this value is rendered as a checkbox.
     * @param {string} [checkedValue] - The value assigned to a checked box.
     * @param {string} [uncheckedValue] - The value assigned to an unchecked box.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set the data validation for cell A1:A10 to require a checkbox with default 1 and 0 values
     * const fRange = fWorksheet.getRange('A1:A10');
     * const rule = univerAPI.newDataValidation()
     *   .requireCheckbox()
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Set the data validation for cell B1:B10 to require a checkbox with 'Yes' and 'No' values
     * const fRange2 = fWorksheet.getRange('B1:B10');
     * const rule2 = univerAPI.newDataValidation()
     *   .requireCheckbox('Yes', 'No')
     *   .build();
     * fRange2.setDataValidation(rule2);
     * ```
     */
    requireCheckbox(checkedValue?: string, uncheckedValue?: string): FDataValidationBuilder {
        this._rule.type = DataValidationType.CHECKBOX;
        this._rule.formula1 = checkedValue;
        this._rule.formula2 = uncheckedValue;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be after a specific date.
     * @param {Date} date - The latest unacceptable date.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some date values in the range A1:B2
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   ['2024-01-01', '2024-12-31'],
     *   ['2025-01-01', '2025-12-31']
     * ]);
     *
     * // Create a data validation rule that requires a date after 2025-01-01
     * const rule = univerAPI.newDataValidation()
     *   .requireDateAfter(new Date('2025-01-01'))
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Get the validation status of the range
     * const status = await fRange.getValidatorStatus();
     * console.log(status); // [['invalid', 'invalid', 'invalid', 'valid']]
     * ```
     */
    requireDateAfter(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.operator = DataValidationOperator.GREATER_THAN;

        return this;
    }

    /**
     * Set the data validation type to DATE and configure the validation rules to be before a specific date.
     * @param {Date} date - The earliest unacceptable date.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some date values in the range A1:B2
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   ['2024-01-01', '2024-12-31'],
     *   ['2025-01-01', '2025-12-31']
     * ]);
     *
     * // Create a data validation rule that requires a date before 2025-01-01
     * const rule = univerAPI.newDataValidation()
     *   .requireDateBefore(new Date('2025-01-01'))
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Get the validation status of the range
     * const status = await fRange.getValidatorStatus();
     * console.log(status); // [['valid', 'valid', 'invalid', 'invalid']]
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
     * Set the data validation type to DATE and configure the validation rules to be within a specific date range.
     * @param {Date} start - The earliest acceptable date.
     * @param {Date} end - The latest acceptable date.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some date values in the range A1:B2
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   ['2024-01-01', '2024-12-31'],
     *   ['2025-01-01', '2025-12-31']
     * ]);
     *
     * // Create a data validation rule that requires a date between 2024-06-01 and 2025-06-01
     * const rule = univerAPI.newDataValidation()
     *   .requireDateBetween(new Date('2024-06-01'), new Date('2025-06-01'))
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Get the validation status of the range
     * const status = await fRange.getValidatorStatus();
     * console.log(status); // [['invalid', 'valid', 'valid', 'invalid']]
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
     * Set the data validation type to DATE and configure the validation rules to be equal to a specific date.
     * @param {Date} date - The sole acceptable date.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some date values in the range A1:B2
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   ['2024-01-01', '2024-12-31'],
     *   ['2025-01-01', '2025-12-31']
     * ]);
     *
     * // Create a data validation rule that requires a date equal to 2025-01-01
     * const rule = univerAPI.newDataValidation()
     *   .requireDateEqualTo(new Date('2025-01-01'))
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Get the validation status of the cell A2
     * const status = await fWorksheet.getRange('A2').getValidatorStatus();
     * console.log(status?.[0]?.[0]); // 'valid'
     *
     * // Get the validation status of the cell B2
     * const status2 = await fWorksheet.getRange('B2').getValidatorStatus();
     * console.log(status2?.[0]?.[0]); // 'invalid'
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
     * Set the data validation type to DATE and configure the validation rules to be not within a specific date range.
     * @param {Date} start - The earliest unacceptable date.
     * @param {Date} end - The latest unacceptable date.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some date values in the range A1:B2
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   ['2024-01-01', '2024-12-31'],
     *   ['2025-01-01', '2025-12-31']
     * ]);
     *
     * // Create a data validation rule that requires a date not between 2024-06-01 and 2025-06-01
     * const rule = univerAPI.newDataValidation()
     *   .requireDateNotBetween(new Date('2024-06-01'), new Date('2025-06-01'))
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Get the validation status of the range
     * const status = await fRange.getValidatorStatus();
     * console.log(status); // [['valid', 'invalid', 'invalid', 'valid']]
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
     * Set the data validation type to DATE and configure the validation rules to be on or after a specific date.
     * @param {Date} date - The earliest acceptable date.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some date values in the range A1:B2
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   ['2024-01-01', '2024-12-31'],
     *   ['2025-01-01', '2025-12-31']
     * ]);
     *
     * // Create a data validation rule that requires a date on or after 2025-01-01
     * const rule = univerAPI.newDataValidation()
     *   .requireDateOnOrAfter(new Date('2025-01-01'))
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Get the validation status of the range
     * const status = await fRange.getValidatorStatus();
     * console.log(status); // [['invalid', 'invalid', 'valid', 'valid']]
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
     * Set the data validation type to DATE and configure the validation rules to be on or before a specific date.
     * @param {Date} date - The latest acceptable date.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some date values in the range A1:B2
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   ['2024-01-01', '2024-12-31'],
     *   ['2025-01-01', '2025-12-31']
     * ]);
     *
     * // Create a data validation rule that requires a date on or before 2025-01-01
     * const rule = univerAPI.newDataValidation()
     *   .requireDateOnOrBefore(new Date('2025-01-01'))
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Get the validation status of the range
     * const status = await fRange.getValidatorStatus();
     * console.log(status); // [['valid', 'valid', 'valid', 'invalid']]
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
     * Sets the data validation rule to require that the given formula evaluates to `true`.
     * @param {string} formula - The formula string that needs to be satisfied, formula result should be TRUE or FALSE, and references range will relative offset.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some values in the range A1:B2 and C1:D2
     * const cell = fWorksheet.getRange('A1:B2');
     * cell.setValues([
     *   [4, 3],
     *   [2, 1]
     * ]);
     * const fRange = fWorksheet.getRange('C1:D2');
     * fRange.setValues([
     *   [1, 2],
     *   [3, 4]
     * ]);
     *
     * // Create a data validation rule that requires the formula '=A1>2' to be satisfied
     * const rule = univerAPI.newDataValidation()
     *   .requireFormulaSatisfied('=A1>2')
     *   .setOptions({
     *     showErrorMessage: true,
     *     error: 'Please enter a value equal to A1'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Get the validation status of the range
     * const status = await fRange.getValidatorStatus();
     * console.log(status); // [['valid', 'valid', 'invalid', 'invalid']]
     * ```
     */
    requireFormulaSatisfied(formula: string): FDataValidationBuilder {
        this._rule.type = DataValidationType.CUSTOM;
        this._rule.formula1 = formula;
        this._rule.formula2 = undefined;
        return this;
    }

    /**
     * Sets the data validation rule to require a number that falls between, or is either of, two specified numbers.
     * @param {number} start - The lowest acceptable value.
     * @param {number} end - The highest acceptable value.
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number between 1 and 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberBetween(1, 10)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a number between 1 and 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets the data validation rule to require a number equal to the given value.
     * @param {number} num - The sole acceptable value.
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number equal to 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberEqualTo(10)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a number equal to 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets the data validation rule to require a number greater than the given value.
     * @param {number} num - The highest unacceptable value.
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number greater than 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberGreaterThan(10)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a number greater than 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets the data validation rule to require a number greater than or equal to the given value.
     * @param {number} num - The lowest acceptable value.
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number greater than 10 or equal to 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberGreaterThanOrEqualTo(10)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a number greater than 10 or equal to 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets the data validation rule to require a number less than the given value.
     * @param {number} num - The lowest unacceptable value.
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number less than 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberLessThan(10)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a number less than 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets the data validation rule to require a number less than or equal to the given value.
     * @param {number} num - The highest acceptable value.
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number less than 10 or equal to 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberLessThanOrEqualTo(10)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a number less than 10 or equal to 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets the data validation rule to require a number that does not fall between, and is neither of, two specified numbers.
     * @param {number} start - The lowest unacceptable value.
     * @param {number} end - The highest unacceptable value.
     * @param {boolean} [isInteger] - Optional parameter, indicating whether the number to be verified is an integer.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number not between 1 and 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberNotBetween(1, 10)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a number not between 1 and 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets the data validation rule to require a number not equal to the given value.
     * @param {number} num - The sole unacceptable value.
     * @param {boolean} [isInteger] - Indicates whether the required number is an integer.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires a number not equal to 10 for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireNumberNotEqualTo(10)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a number not equal to 10'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets a data validation rule that requires the user to enter a value from a list of specific values.
     * The list can be displayed in a dropdown, and the user can choose multiple values according to the settings.
     * @param {string[]} values - An array of acceptable values.
     * @param {boolean} [multiple] - Optional parameter indicating whether the user can select multiple values.
     * @param {boolean} [showDropdown] - Optional parameter indicating whether to display the list in a dropdown.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires the user to enter a value from the list ['Yes', 'No'] for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireValueInList(['Yes', 'No'])
     *   .setOptions({
     *     allowBlank: true,
     *     showErrorMessage: true,
     *     error: 'Please enter a value from the list'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
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
     * Sets a data validation rule that requires the user to enter a value within a specific range.
     * The range is defined by an FRange object, which contains the unit ID, sheet name, and cell range.
     * @param {FRange} range - An FRange object representing the range of values that the user can enter.
     * @param {boolean} [multiple] - Optional parameter indicating whether the user can select multiple values.
     * @param {boolean} [showDropdown] - Optional parameter indicating whether to display the list in a dropdown.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set the values in the range B1:B2
     * const fRange = fWorksheet.getRange('B1:B2');
     * fRange.setValues([
     *   ['Yes'],
     *   ['No']
     * ]);
     *
     * // Create a new data validation rule that requires the user to enter a value from the range B1:B2 for the range A1:A10
     * const rule = univerAPI.newDataValidation()
     *   .requireValueInRange(fRange)
     *   .setOptions({
     *     allowBlank: false,
     *     showErrorMessage: true,
     *     error: 'Please enter a value from the list'
     *   })
     *   .build();
     * const cell = fWorksheet.getRange('A1');
     * cell.setDataValidation(rule);
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
     * Sets whether to allow invalid data and configures the error style.
     * If invalid data is not allowed, the error style will be set to STOP, indicating that data entry must stop upon encountering an error.
     * If invalid data is allowed, the error style will be set to WARNING, indicating that a warning will be displayed when invalid data is entered, but data entry can continue.
     * @param {boolean} allowInvalidData - Whether to allow invalid data.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set the data validation for cell A1:B2 to allow invalid data, so A1:B2 will display a warning when invalid data is entered
     * const fRange = fWorksheet.getRange('A1:B2');
     * const rule = univerAPI.newDataValidation()
     *   .requireValueInList(['Yes', 'No'])
     *   .setAllowInvalid(true)
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Set the data validation for cell C1:D2 to not allow invalid data, so C1:D2 will stop data entry when invalid data is entered
     * const fRange2 = fWorksheet.getRange('C1:D2');
     * const rule2 = univerAPI.newDataValidation()
     *   .requireValueInList(['Yes', 'No'])
     *   .setAllowInvalid(false)
     *   .build();
     * fRange2.setDataValidation(rule2);
     * ```
     */
    setAllowInvalid(allowInvalidData: boolean): FDataValidationBuilder {
        this._rule.errorStyle = !allowInvalidData ? DataValidationErrorStyle.STOP : DataValidationErrorStyle.WARNING;
        return this;
    }

    /**
     * Sets whether to allow blank values.
     * @param {boolean} allowBlank - Whether to allow blank values.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * // Assume current sheet is empty data
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set the data validation for cell A1:B2 to allow blank values
     * const fRange = fWorksheet.getRange('A1:B2');
     * const rule = univerAPI.newDataValidation()
     *   .requireValueInList(['Yes', 'No'])
     *   .setAllowBlank(true)
     *   .build();
     * fRange.setDataValidation(rule);
     *
     * // Set the data validation for cell C1:D2 to not allow blank values
     * const fRange2 = fWorksheet.getRange('C1:D2');
     * const rule2 = univerAPI.newDataValidation()
     *   .requireValueInList(['Yes', 'No'])
     *   .setAllowBlank(false)
     *   .build();
     * fRange2.setDataValidation(rule2);
     * ```
     */
    setAllowBlank(allowBlank: boolean): FDataValidationBuilder {
        this._rule.allowBlank = allowBlank;
        return this;
    }

    /**
     * Sets the options for the data validation rule.
     * @param {Partial<IDataValidationRuleOptions>} options - The options to set for the data validation rule.
     * @returns {FDataValidationBuilder} The current instance for method chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a new data validation rule that requires the user to enter a value from the list ['Yes', 'No'] for the range A1:B10
     * const fRange = fWorksheet.getRange('A1:B10');
     * const rule = univerAPI.newDataValidation()
     *   .requireValueInList(['Yes', 'No'])
     *   .setOptions({
     *     allowBlank: true,
     *     showErrorMessage: true,
     *     error: 'Please enter a value from the list'
     *   })
     *   .build();
     * fRange.setDataValidation(rule);
     * ```
     */
    setOptions(options: Partial<IDataValidationRuleOptions>): this {
        Object.assign(this._rule, options);
        return this;
    }
}
