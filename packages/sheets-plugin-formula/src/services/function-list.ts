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
    name?: string;

    /**
     * Detailed description of function, with internationalization
     */
    detail?: string;

    /**
     * Function example
     */
    example?: string;

    /**
     * Is it optional
     *
     * true: required
     * false: optional
     */
    require?: BooleanNumber;

    /**
     * Whether it is repeatable, in the case of repeatability, the maximum parameter of m is generally set to 255, such as [1,255]
     *
     * true: repeatable
     * false: not repeatable
     */
    repeat?: BooleanNumber;

    /**
     * Parameter types
     *
     * include ['range', 'rangeall', 'rangenumber', 'rangestring', 'rangedatetime', 'rangedate', 'string']
     * Detected before each calculation
     */
    type?: string;
}

export interface IFunctionInfo {
    /**
     * Function name
     */
    n: string;

    /**
     * Function type
     */
    t?: FunctionType;

    /**
     * Detailed description
     */
    d?: string;

    /**
     * Concise description
     */
    a?: string;

    /**
     * [Minimum number of parameters, maximum number of parameters]
     * Detected before each calculation of the function
     */
    m?: [min: number, max: number];

    /**
     * Function params
     */
    p?: IFunctionParam[];
}

export const FUNCTION_LIST: IFunctionInfo[] = [
    {
        n: 'SUMIF',
        t: 0,
        d: 'formula.functionList.SUMIF.d',
        a: 'formula.functionList.SUMIF.a',
        m: [2, 3],
        p: [
            {
                name: 'formula.functionList.SUMIF.p.range.name',
                detail: 'formula.functionList.SUMIF.p.range.detail',
                example: 'A1:A10',
                require: 1,
                repeat: 0,
                type: 'range',
            },
            {
                name: 'formula.functionList.SUMIF.p.criterion.name',
                detail: 'formula.functionList.SUMIF.p.criterion.detail',
                example: '">20"',
                require: 1,
                repeat: 0,
                type: 'rangeall',
            },
            {
                name: 'formula.functionList.SUMIF.p.sum_range.name',
                detail: 'formula.functionList.SUMIF.p.sum_range.detail',
                example: 'B1:B10',
                require: 0,
                repeat: 0,
                type: 'range',
            },
        ],
    },
    {
        n: 'TAN',
        t: 0,
        d: 'formula.functionList.TAN.d',
        a: 'formula.functionList.TAN.a',
        m: [1, 1],
        p: [
            {
                name: 'formula.functionList.TAN.p.angle.name',
                detail: 'formula.functionList.TAN.p.angle.detail',
                example: '45*PI()/180',
                require: 1,
                repeat: 0,
                type: 'rangenumber',
            },
        ],
    },
    {
        n: 'TANH',
        t: 0,
        d: 'formula.functionList.TANH.d',
        a: 'formula.functionList.TANH.a',
        m: [1, 1],
        p: [
            {
                name: 'formula.functionList.TANH.p.value.name',
                detail: 'formula.functionList.TANH.p.value.detail',
                example: 'A2',
                require: 1,
                repeat: 0,
                type: 'rangenumber',
            },
        ],
    },
];
