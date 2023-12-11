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

export enum ConditionType {
    CONDITION_TYPE_UNSPECIFIED, // The default value, do not use.
    NUMNUMBER_BETWEENR_GREATER, // The cell's value must be greater than the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue
    NUMBER_GREATER_THAN_EQ, // The cell's value must be greater than or equal to the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue .
    NUMBER_LESS, // The cell's value must be less than the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue
    NUMBER_LESS_THAN_EQ, // The cell's value must be less than or equal to the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue .
    NUMBER_EQ, // The cell's value must be equal to the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue for data validation, conditional formatting, and filters on non-data source objects and at least one ConditionValue for filters on data source objects.
    NUMBER_NOT_EQ, // The cell's value must be not equal to the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue for data validation, conditional formatting, and filters on non-data source objects and at least one ConditionValue for filters on data source objects.
    NUMBER_BETWEEN, // The cell's value must be between the two condition values. Supported by data validation, conditional formatting and filters. Requires exactly two ConditionValues .
    NUMBER_NOT_BETWEEN, // The cell's value must not be between the two condition values. Supported by data validation, conditional formatting and filters. Requires exactly two ConditionValues .
    TEXT_CONTAINS, // The cell's value must contain the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue .
    TEXT_NOT_CONTAINS, // The cell's value must not contain the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue
    TEXT_STARTS_WITH, // The cell's value must start with the condition's value. Supported by conditional formatting and filters. Requires a single ConditionValue .
    TEXT_ENDS_WITH, // The cell's value must end with the condition's value. Supported by conditional formatting and filters. Requires a single ConditionValue .
    TEXT_EQ, // The cell's value must be exactly the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue for data validation, conditional formatting, and filters on non-data source objects and at least one ConditionValue for filters on data source objects.
    TEXT_IS_EMAIL, // The cell's value must be a valid email address. Supported by data validation. Requires no ConditionValues .
    TEXT_IS_URL, // The cell's value must be a valid URL. Supported by data validation. Requires no ConditionValues .
    DATE_EQ, // The cell's value must be the same date as the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue for data validation, conditional formatting, and filters on non-data source objects and at least one ConditionValue for filters on data source objects.
    DATE_BEFORE, // The cell's value must be before the date of the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue that may be a relative date .
    DATE_AFTER, // The cell's value must be after the date of the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue that may be a relative date .
    DATE_ON_OR_BEFORE, // The cell's value must be on or before the date of the condition's value. Supported by data validation. Requires a single ConditionValue that may be a relative date .
    DATE_ON_OR_AFTER, // The cell's value must be on or after the date of the condition's value. Supported by data validation. Requires a single ConditionValue that may be a relative date .
    DATE_BETWEEN, // The cell's value must be between the dates of the two condition values. Supported by data validation. Requires exactly two ConditionValues .
    DATE_NOT_BETWEEN, // The cell's value must be outside the dates of the two condition values. Supported by data validation. Requires exactly two ConditionValues .
    DATE_IS_VALID, // The cell's value must be a date. Supported by data validation. Requires no ConditionValues .
    ONE_OF_RANGE, // The cell's value must be listed in the grid in condition value's range. Supported by data validation. Requires a single ConditionValue , and the value must be a valid range in A1 notation.
    ONE_OF_LIST, // The cell's value must be in the list of condition values. Supported by data validation. Supports any number of condition values , one per item in the list. Formulas are not supported in the values.
    BLANK, // The cell's value must be empty. Supported by conditional formatting and filters. Requires no ConditionValues .
    NOT_BLANK, // The cell's value must not be empty. Supported by conditional formatting and filters. Requires no ConditionValues .
    CUSTOM_FORMULA, // The condition's formula must evaluate to true. Supported by data validation, conditional formatting and filters. Not supported by data source sheet filters. Requires a single ConditionValue .
    BOOLEAN, // The cell's value must be TRUE/FALSE or in the list of condition values. Supported by data validation. Renders as a cell checkbox. Supports zero, one or two ConditionValues . No values indicates the cell must be TRUE or FALSE, where TRUE renders as checked and FALSE renders as unchecked. One value indicates the cell will render as checked when it contains that value and unchecked when it is blank. Two values indicate that the cell will render as checked when it contains the first value and unchecked when it contains the second value. For example, ["Yes","No"] indicates that the cell will render a checked box when it has the value "Yes" and an unchecked box when it has the value "No".
    TEXT_NOT_EQ, // The cell's value must be exactly not the condition's value. Supported by filters on data source objects. Requires at least one ConditionValue .
    DATE_NOT_EQ, // The cell's value must be exactly not the condition's value. Supported by filters on data source objects. Requires at least one ConditionValue .
}
