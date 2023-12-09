import type { IFunctionInfo } from '@univerjs/engine-formula';
import { FUNCTION_NAMES_MATH, FunctionType } from '@univerjs/engine-formula';

export const FUNCTION_LIST_MATH: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_MATH.SUM,
        aliasFunctionName: 'formula.functionList.SUM.aliasFunctionName',
        functionType: FunctionType.Math,
        description: 'formula.functionList.SUM.description',
        abstract: 'formula.functionList.SUM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SUM.functionParameter.number1.name',
                detail: 'formula.functionList.SUM.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SUM.functionParameter.number2.name',
                detail: 'formula.functionList.SUM.functionParameter.number2.detail',
                example: 'B2:B10',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_MATH.SUMIF,
        aliasFunctionName: 'formula.functionList.SUMIF.aliasFunctionName',
        functionType: FunctionType.Math,
        description: 'formula.functionList.SUMIF.description',
        abstract: 'formula.functionList.SUMIF.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SUMIF.functionParameter.range.name',
                detail: 'formula.functionList.SUMIF.functionParameter.range.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SUMIF.functionParameter.criteria.name',
                detail: 'formula.functionList.SUMIF.functionParameter.criteria.detail',
                example: '>5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SUMIF.functionParameter.sum_range.name',
                detail: 'formula.functionList.SUMIF.functionParameter.sum_range.detail',
                example: 'B1:B20',
                require: 0,
                repeat: 0,
            },
        ],
    },
];
