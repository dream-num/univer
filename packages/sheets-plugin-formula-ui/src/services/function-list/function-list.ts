import { FUNCTION_NAMES, FunctionType, IFunctionInfo } from '@univerjs/base-formula-engine';

import { FUNCTION_LIST_MATH } from './math';

export const FUNCTION_LIST: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES.AVERAGE,
        aliasFunctionName: 'formula.functionList.AVERAGE.aliasFunctionName',
        functionType: FunctionType.Statistical,
        description: 'formula.functionList.AVERAGE.description',
        abstract: 'formula.functionList.AVERAGE.abstract',
        parameterRange: [1, 255],
        functionParameter: [
            {
                name: 'formula.functionList.AVERAGE.functionParameter.number1.name',
                detail: 'formula.functionList.AVERAGE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.AVERAGE.functionParameter.number2.name',
                detail: 'formula.functionList.AVERAGE.functionParameter.number2.detail',
                example: 'B2:B10',
                require: 0,
                repeat: 1,
            },
        ],
    },
    ...FUNCTION_LIST_MATH,
];
