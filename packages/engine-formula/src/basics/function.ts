import type { BooleanNumber } from '@univerjs/core';

/**
 * Function type, refer to https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb
 */
export enum FunctionType {
    /**
     * Financial Functions
     */

    Financial,
    /**
     * Date and Time Functions
     */
    Date,

    /**
     * Math and Trigonometry Functions
     */
    Math,

    /**
     * Statistical Functions
     */
    Statistical,

    /**
     * Lookup and Reference Functions
     */
    Lookup,

    /**
     * Database Functions
     */
    Database,

    /**
     * Text Functions
     */
    Text,

    /**
     * Logical Functions
     */
    Logical,

    /**
     * Information Functions
     */
    Information,

    /**
     * Engineering Functions
     */
    Engineering,

    /**
     * Cube Functions
     */
    Cube,

    /**
     * Compatibility Functions
     */
    Compatibility,

    /**
     * Web Functions
     */
    Web,

    /**
     * Array Functions
     */
    Array,

    /**
     * Univer-specific functions
     */
    Univer,
}

export interface IFunctionParam {
    /**
     * Function name, with internationalization
     */
    name: string;

    /**
     * Detailed description of function, with internationalization
     */
    detail: string;

    /**
     * Function example
     */
    example: string;

    /**
     * Is it optional
     *
     * true: required
     * false: optional
     */
    require: BooleanNumber;

    /**
     * Whether it is repeatable, in the case of repeatability, the maximum parameter of m is generally set to 255, such as [1,255]
     *
     * true: repeatable
     * false: not repeatable
     */
    repeat: BooleanNumber;
}

export interface IFunctionInfo {
    /**
     * Function name
     */
    functionName: string;

    /**
     * Alias function name
     */
    aliasFunctionName?: string;

    /**
     * Function type
     */
    functionType: FunctionType;

    /**
     * Detailed description
     */
    description: string;

    /**
     * Concise abstract
     */
    abstract: string;

    /**
     * Function params
     */
    functionParameter: IFunctionParam[];
}
