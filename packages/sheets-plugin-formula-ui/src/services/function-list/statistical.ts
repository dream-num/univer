import { FUNCTION_NAMES, FunctionType, IFunctionInfo } from '@univerjs/base-formula-engine';

export const FUNCTION_LIST_STATISTICAL: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES.AVERAGE,
        aliasFunctionName: 'formula.functionList.AVERAGE.aliasFunctionName',
        functionType: FunctionType.Statistical,
        description: 'formula.functionList.AVERAGE.description',
        abstract: 'formula.functionList.AVERAGE.abstract',
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
    {
        functionName: FUNCTION_NAMES.MAX,
        aliasFunctionName: 'formula.functionList.MAX.aliasFunctionName',
        functionType: FunctionType.Statistical,
        description: 'formula.functionList.MAX.description',
        abstract: 'formula.functionList.MAX.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MAX.functionParameter.number1.name',
                detail: 'formula.functionList.MAX.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MAX.functionParameter.number2.name',
                detail: 'formula.functionList.MAX.functionParameter.number2.detail',
                example: 'B2:B10',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES.COUNT,
        aliasFunctionName: 'formula.functionList.COUNT.aliasFunctionName',
        functionType: FunctionType.Statistical,
        description: 'formula.functionList.COUNT.description',
        abstract: 'formula.functionList.COUNT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.COUNT.functionParameter.value1.name',
                detail: 'formula.functionList.COUNT.functionParameter.value1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.COUNT.functionParameter.value2.name',
                detail: 'formula.functionList.COUNT.functionParameter.value2.detail',
                example: 'B2:B10',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES.MIN,
        aliasFunctionName: 'formula.functionList.MIN.aliasFunctionName',
        functionType: FunctionType.Statistical,
        description: 'formula.functionList.MIN.description',
        abstract: 'formula.functionList.MIN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MIN.functionParameter.number1.name',
                detail: 'formula.functionList.MIN.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MIN.functionParameter.number2.name',
                detail: 'formula.functionList.MIN.functionParameter.number2.detail',
                example: 'B2:B10',
                require: 0,
                repeat: 1,
            },
        ],
    },
];
