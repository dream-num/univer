import { BooleanNumber } from '@univerjs/core';

export enum FunctionType {
    Math,
    Statistical,
    Lookup,
    DataMining,
    Database,
    Date,
    Filter,
    Financial,
    Engineering,
    Logical,
    Operator,
    Text,
    Parser,
    Array,
    Other,
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

    /**
     * Parameter types
     *
     * include ['range', 'rangeall', 'rangenumber', 'rangestring', 'rangedatetime', 'rangedate', 'string']
     * Detected before each calculation
     */
    type: string;
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
     * [Minimum number of parameters, maximum number of parameters]
     * Detected before each calculation of the function
     */
    parameterRange: [min: number, max: number];

    /**
     * Function params
     */
    functionParameter: IFunctionParam[];
}

export enum FUNCTION_NAMES {
    AVERAGE = 'AVERAGE',
    CONCATENATE = 'CONCATENATE',
    COUNT = 'COUNT',
    INDIRECT = 'INDIRECT',
    MAX = 'MAX',
    MIN = 'MIN',
    OFFSET = 'OFFSET',
    POWER = 'POWER',
    SUM = 'SUM',
    COMPARE = 'COMPARE',
    DIVIDED = 'DIVIDED',
    MINUS = 'MINUS',
    MULTIPLY = 'MULTIPLY',
    PLUS = 'PLUS',
    UNION = 'UNION',
}
