/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { FUNCTION_NAMES_LOGICAL, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_LOGICAL: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_LOGICAL.AND,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.AND.description',
        abstract: 'formula.functionList.AND.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.AND.functionParameter.logical1.name',
                detail: 'formula.functionList.AND.functionParameter.logical1.detail',
                example: 'A1=1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.AND.functionParameter.logical2.name',
                detail: 'formula.functionList.AND.functionParameter.logical2.detail',
                example: 'A2=2',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.BYCOL,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.BYCOL.description',
        abstract: 'formula.functionList.BYCOL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BYCOL.functionParameter.array.name',
                detail: 'formula.functionList.BYCOL.functionParameter.array.detail',
                example: 'A1:C2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BYCOL.functionParameter.lambda.name',
                detail: 'formula.functionList.BYCOL.functionParameter.lambda.detail',
                example: 'LAMBDA(array, MAX(array))',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.BYROW,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.BYROW.description',
        abstract: 'formula.functionList.BYROW.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BYROW.functionParameter.array.name',
                detail: 'formula.functionList.BYROW.functionParameter.array.detail',
                example: 'A1:C2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BYROW.functionParameter.lambda.name',
                detail: 'formula.functionList.BYROW.functionParameter.lambda.detail',
                example: 'LAMBDA(array, MAX(array))',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.FALSE,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.FALSE.description',
        abstract: 'formula.functionList.FALSE.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.IF,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.IF.description',
        abstract: 'formula.functionList.IF.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IF.functionParameter.logicalTest.name',
                detail: 'formula.functionList.IF.functionParameter.logicalTest.detail',
                example: 'A2 = "foo"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IF.functionParameter.valueIfTrue.name',
                detail: 'formula.functionList.IF.functionParameter.valueIfTrue.detail',
                example: '"A2 is foo"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IF.functionParameter.valueIfFalse.name',
                detail: 'formula.functionList.IF.functionParameter.valueIfFalse.detail',
                example: '"A2 is not foo"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.IFERROR,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.IFERROR.description',
        abstract: 'formula.functionList.IFERROR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IFERROR.functionParameter.value.name',
                detail: 'formula.functionList.IFERROR.functionParameter.value.detail',
                example: 'A2/B2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IFERROR.functionParameter.valueIfError.name',
                detail: 'formula.functionList.IFERROR.functionParameter.valueIfError.detail',
                example: 'Error in calculation',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.IFNA,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.IFNA.description',
        abstract: 'formula.functionList.IFNA.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IFNA.functionParameter.value.name',
                detail: 'formula.functionList.IFNA.functionParameter.value.detail',
                example: 'VLOOKUP(C3,C6:D11,2,FALSE)',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IFNA.functionParameter.valueIfNa.name',
                detail: 'formula.functionList.IFNA.functionParameter.valueIfNa.detail',
                example: '"Not Found"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.IFS,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.IFS.description',
        abstract: 'formula.functionList.IFS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IFS.functionParameter.logicalTest1.name',
                detail: 'formula.functionList.IFS.functionParameter.logicalTest1.detail',
                example: 'A2 = "foo"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IFS.functionParameter.valueIfTrue1.name',
                detail: 'formula.functionList.IFS.functionParameter.valueIfTrue1.detail',
                example: '"A2 is foo"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IFS.functionParameter.logicalTest2.name',
                detail: 'formula.functionList.IFS.functionParameter.logicalTest2.detail',
                example: 'F2=1',
                require: 0,
                repeat: 1,
            },
            {
                name: 'formula.functionList.IFS.functionParameter.valueIfTrue2.name',
                detail: 'formula.functionList.IFS.functionParameter.valueIfTrue2.detail',
                example: 'D2',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.LAMBDA,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.LAMBDA.description',
        abstract: 'formula.functionList.LAMBDA.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LAMBDA.functionParameter.parameter.name',
                detail: 'formula.functionList.LAMBDA.functionParameter.parameter.detail',
                example: '[x, y, …,]',
                require: 0,
                repeat: 1,
            },
            {
                name: 'formula.functionList.LAMBDA.functionParameter.calculation.name',
                detail: 'formula.functionList.LAMBDA.functionParameter.calculation.detail',
                example: 'x+y',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.LET,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.LET.description',
        abstract: 'formula.functionList.LET.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LET.functionParameter.name1.name',
                detail: 'formula.functionList.LET.functionParameter.name1.detail',
                example: 'x',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LET.functionParameter.nameValue1.name',
                detail: 'formula.functionList.LET.functionParameter.nameValue1.detail',
                example: '5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LET.functionParameter.calculationOrName2.name',
                detail: 'formula.functionList.LET.functionParameter.calculationOrName2.detail',
                example: 'y',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LET.functionParameter.nameValue2.name',
                detail: 'formula.functionList.LET.functionParameter.nameValue2.detail',
                example: '6',
                require: 0,
                repeat: 1,
            },
            {
                name: 'formula.functionList.LET.functionParameter.calculationOrName3.name',
                detail: 'formula.functionList.LET.functionParameter.calculationOrName3.detail',
                example: 'SUM(x,y)',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.MAKEARRAY,
        aliasFunctionName: 'formula.functionList.MAKEARRAY.aliasFunctionName',
        functionType: FunctionType.Logical,
        description: 'formula.functionList.MAKEARRAY.description',
        abstract: 'formula.functionList.MAKEARRAY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MAKEARRAY.functionParameter.number1.name',
                detail: 'formula.functionList.MAKEARRAY.functionParameter.number1.detail',
                example: '8',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MAKEARRAY.functionParameter.number2.name',
                detail: 'formula.functionList.MAKEARRAY.functionParameter.number2.detail',
                example: '7',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MAKEARRAY.functionParameter.value3.name',
                detail: 'formula.functionList.MAKEARRAY.functionParameter.value3.detail',
                example: 'LAMBDA(r,c, r*c)',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.MAP,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.MAP.description',
        abstract: 'formula.functionList.MAP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MAP.functionParameter.array1.name',
                detail: 'formula.functionList.MAP.functionParameter.array1.detail',
                example: 'D2:D11',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MAP.functionParameter.array2.name',
                detail: 'formula.functionList.MAP.functionParameter.array2.detail',
                example: 'E2:E11',
                require: 0,
                repeat: 1,
            },
            {
                name: 'formula.functionList.MAP.functionParameter.lambda.name',
                detail: 'formula.functionList.MAP.functionParameter.lambda.detail',
                example: 'LAMBDA(s,c,AND(s="Large",c="Red"))',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.NOT,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.NOT.description',
        abstract: 'formula.functionList.NOT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NOT.functionParameter.logical.name',
                detail: 'formula.functionList.NOT.functionParameter.logical.detail',
                example: 'A2>100',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.OR,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.OR.description',
        abstract: 'formula.functionList.OR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.OR.functionParameter.logical1.name',
                detail: 'formula.functionList.OR.functionParameter.logical1.detail',
                example: 'A1=1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.OR.functionParameter.logical2.name',
                detail: 'formula.functionList.OR.functionParameter.logical2.detail',
                example: 'A2=2',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.REDUCE,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.REDUCE.description',
        abstract: 'formula.functionList.REDUCE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.REDUCE.functionParameter.initialValue.name',
                detail: 'formula.functionList.REDUCE.functionParameter.initialValue.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.REDUCE.functionParameter.array.name',
                detail: 'formula.functionList.REDUCE.functionParameter.array.detail',
                example: 'A1:C2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.REDUCE.functionParameter.lambda.name',
                detail: 'formula.functionList.REDUCE.functionParameter.lambda.detail',
                example: 'LAMBDA(a,b,a+b^2)',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.SCAN,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.SCAN.description',
        abstract: 'formula.functionList.SCAN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SCAN.functionParameter.initialValue.name',
                detail: 'formula.functionList.SCAN.functionParameter.initialValue.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SCAN.functionParameter.array.name',
                detail: 'formula.functionList.SCAN.functionParameter.array.detail',
                example: 'A1:C2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SCAN.functionParameter.lambda.name',
                detail: 'formula.functionList.SCAN.functionParameter.lambda.detail',
                example: 'LAMBDA(a,b,a+b^2)',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.SWITCH,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.SWITCH.description',
        abstract: 'formula.functionList.SWITCH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SWITCH.functionParameter.expression.name',
                detail: 'formula.functionList.SWITCH.functionParameter.expression.detail',
                example: 'WEEKDAY(A2)',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SWITCH.functionParameter.value1.name',
                detail: 'formula.functionList.SWITCH.functionParameter.value1.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SWITCH.functionParameter.result1.name',
                detail: 'formula.functionList.SWITCH.functionParameter.result1.detail',
                example: '"Sunday"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SWITCH.functionParameter.defaultOrValue2.name',
                detail: 'formula.functionList.SWITCH.functionParameter.defaultOrValue2.detail',
                example: '2',
                require: 0,
                repeat: 1,
            },
            {
                name: 'formula.functionList.SWITCH.functionParameter.result2.name',
                detail: 'formula.functionList.SWITCH.functionParameter.result2.detail',
                example: '"Monday"',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.TRUE,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.TRUE.description',
        abstract: 'formula.functionList.TRUE.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.XOR,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.XOR.description',
        abstract: 'formula.functionList.XOR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.XOR.functionParameter.logical1.name',
                detail: 'formula.functionList.XOR.functionParameter.logical1.detail',
                example: '3>0',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XOR.functionParameter.logical2.name',
                detail: 'formula.functionList.XOR.functionParameter.logical2.detail',
                example: '2<9',
                require: 0,
                repeat: 1,
            },
        ],
    },
];
