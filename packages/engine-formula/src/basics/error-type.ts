/**
 * Possible errors returned by our interpreter.
 * 18.17.3 Error values
 */
export enum ErrorType {
    /** Division by zero. */
    DIV_BY_ZERO = '#DIV/0!',

    /** Function error. */
    NAME = '#NAME!',
    VALUE = '#VALUE!',
    NUM = '#NUM!',
    NA = '#NA!',

    /** Cyclic dependency. */
    CYCLE = '#CYCLE!',

    /** Wrong reference. */
    REF = '#REF!',

    /** Array spill error. */
    SPILL = '#SPILL!',

    /** Calculation error. */
    CALC = '#CALC!',

    /** Generic error */
    ERROR = '#ERROR!',

    /** connected to remote */
    CONNECT = '#GETTING_DATA',

    /** In the case of SUM(B1 C1), */
    NULL = '#NULL!',
}

export const ERROR_TYPE_SET = new Set([
    ErrorType.DIV_BY_ZERO as string,
    ErrorType.NAME,
    ErrorType.VALUE,
    ErrorType.NUM,
    ErrorType.NA,
    ErrorType.CYCLE,
    ErrorType.REF,
    ErrorType.SPILL,
    ErrorType.CALC,
    ErrorType.ERROR,
    ErrorType.CONNECT,
    ErrorType.NULL,
]);
