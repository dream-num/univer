import { IFunctionInfo } from '@univerjs/base-formula-engine';

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
