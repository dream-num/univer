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
     * Alias Function name
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

// TODO@Dushusir: register custom function
// TODO@Dushusir: register custom locale file
export interface IFunctionDescription {
    [functionName: string]: IFunctionInfo;
}

export const FUNCTION_LIST: IFunctionInfo[] = [
    {
        functionName: 'SUMIF',
        aliasFunctionName: 'formula.functionList.SUMIF.aliasFunctionName',
        functionType: 0,
        description: 'formula.functionList.SUMIF.description',
        abstract: 'formula.functionList.SUMIF.abstract',
        parameterRange: [2, 3],
        functionParameter: [
            {
                name: 'formula.functionList.SUMIF.functionParameter.range.name',
                detail: 'formula.functionList.SUMIF.functionParameter.range.detail',
                example: 'A1:A10',
                require: 1,
                repeat: 0,
                type: 'range',
            },
            {
                name: 'formula.functionList.SUMIF.functionParameter.criterion.name',
                detail: 'formula.functionList.SUMIF.functionParameter.criterion.detail',
                example: '">20"',
                require: 1,
                repeat: 0,
                type: 'rangeall',
            },
            {
                name: 'formula.functionList.SUMIF.functionParameter.sum_range.name',
                detail: 'formula.functionList.SUMIF.functionParameter.sum_range.detail',
                example: 'B1:B10',
                require: 0,
                repeat: 0,
                type: 'range',
            },
        ],
    },
    {
        functionName: 'TAN',
        aliasFunctionName: 'formula.functionList.TAN.aliasFunctionName',
        functionType: 0,
        description: 'formula.functionList.TAN.description',
        abstract: 'formula.functionList.TAN.abstract',
        parameterRange: [1, 1],
        functionParameter: [
            {
                name: 'formula.functionList.TAN.functionParameter.angle.name',
                detail: 'formula.functionList.TAN.functionParameter.angle.detail',
                example: '45*PI()/180',
                require: 1,
                repeat: 0,
                type: 'rangenumber',
            },
        ],
    },
    {
        functionName: 'TANH',
        functionType: 0,
        description: 'formula.functionList.TANH.description',
        abstract: 'formula.functionList.TANH.abstract',
        parameterRange: [1, 1],
        functionParameter: [
            {
                name: 'formula.functionList.TANH.functionParameter.value.name',
                detail: 'formula.functionList.TANH.functionParameter.value.detail',
                example: 'A2',
                require: 1,
                repeat: 0,
                type: 'rangenumber',
            },
        ],
    },
];
