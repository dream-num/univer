/**
 * An enumeration representing the boolean criteria that can be used in conditional format or filter.
 */
export enum BooleanCriteria {
    // The criteria is met when a cell is empty.
    CELL_EMPTY = 'CELL_EMPTY',

    // The criteria is met when a cell is not empty.
    CELL_NOT_EMPTY = 'CELL_NOT_EMPTY',

    // The criteria is met when a date is after the given value.
    DATE_AFTER = 'DATE_AFTER',

    // The criteria is met when a date is before the given value.
    DATE_BEFORE = 'DATE_BEFORE',

    // The criteria is met when a date is equal to the given value.
    DATE_EQUAL_TO = 'DATE_EQUAL_TO',

    // The criteria is met when a date is not equal to the given value.
    DATE_NOT_EQUAL_TO = 'DATE_NOT_EQUAL_TO',

    // The criteria is met when a date is after the relative date value.
    DATE_AFTER_RELATIVE = 'DATE_AFTER_RELATIVE',

    // The criteria is met when a date is before the relative date value.
    DATE_BEFORE_RELATIVE = 'DATE_BEFORE_RELATIVE',

    // The criteria is met when a date is equal to the relative date value.
    DATE_EQUAL_TO_RELATIVE = 'DATE_EQUAL_TO_RELATIVE',

    // The criteria is met when a number that is between the given values.
    NUMBER_BETWEEN = 'NUMBER_BETWEEN',

    // The criteria is met when a number that is equal to the given value.
    NUMBER_EQUAL_TO = 'NUMBER_EQUAL_TO',

    // The criteria is met when a number that is greater than the given value.
    NUMBER_GREATER_THAN = 'NUMBER_GREATER_THAN',

    // The criteria is met when a number that is greater than or equal to the given value.
    NUMBER_GREATER_THAN_OR_EQUAL_TO = 'NUMBER_GREATER_THAN_OR_EQUAL_TO',

    // The criteria is met when a number that is less than the given value.
    NUMBER_LESS_THAN = 'NUMBER_LESS_THAN',

    // The criteria is met when a number that is less than or equal to the given value.
    NUMBER_LESS_THAN_OR_EQUAL_TO = 'NUMBER_LESS_THAN_OR_EQUAL_TO',

    // The criteria is met when a number that is not between the given values.
    NUMBER_NOT_BETWEEN = 'NUMBER_NOT_BETWEEN',

    // The criteria is met when a number that is not equal to the given value.
    NUMBER_NOT_EQUAL_TO = 'NUMBER_NOT_EQUAL_TO',

    // The criteria is met when the input contains the given value.
    TEXT_CONTAINS = 'TEXT_CONTAINS',

    // The criteria is met when the input does not contain the given value.
    TEXT_DOES_NOT_CONTAIN = 'TEXT_DOES_NOT_CONTAIN',

    // The criteria is met when the input is equal to the given value.
    TEXT_EQUAL_TO = 'TEXT_EQUAL_TO',

    // The criteria is met when the input is not equal to the given value.
    TEXT_NOT_EQUAL_TO = 'TEXT_NOT_EQUAL_TO',

    // The criteria is met when the input begins with the given value.
    TEXT_STARTS_WITH = 'TEXT_STARTS_WITH',

    // The criteria is met when the input ends with the given value.
    TEXT_ENDS_WITH = 'TEXT_ENDS_WITH',

    // The criteria is met when the input makes the given formula evaluate to true.
    CUSTOM_FORMULA = 'CUSTOM_FORMULA',
}
