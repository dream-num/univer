/**
 * Copyright 2023-present DreamNum Inc.
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
                name: 'formula.functionList.BYCOL.functionParameter.number1.name',
                detail: 'formula.functionList.BYCOL.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BYCOL.functionParameter.number2.name',
                detail: 'formula.functionList.BYCOL.functionParameter.number2.detail',
                example: 'A1:A20',
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
                name: 'formula.functionList.BYROW.functionParameter.number1.name',
                detail: 'formula.functionList.BYROW.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BYROW.functionParameter.number2.name',
                detail: 'formula.functionList.BYROW.functionParameter.number2.detail',
                example: 'A1:A20',
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
            {
                name: 'formula.functionList.FALSE.functionParameter.number1.name',
                detail: 'formula.functionList.FALSE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FALSE.functionParameter.number2.name',
                detail: 'formula.functionList.FALSE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
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
                name: 'formula.functionList.IFNA.functionParameter.number1.name',
                detail: 'formula.functionList.IFNA.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IFNA.functionParameter.number2.name',
                detail: 'formula.functionList.IFNA.functionParameter.number2.detail',
                example: 'A1:A20',
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
                name: 'formula.functionList.IFS.functionParameter.number1.name',
                detail: 'formula.functionList.IFS.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IFS.functionParameter.number2.name',
                detail: 'formula.functionList.IFS.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
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
                name: 'formula.functionList.LET.functionParameter.number1.name',
                detail: 'formula.functionList.LET.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LET.functionParameter.number2.name',
                detail: 'formula.functionList.LET.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
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
                name: 'formula.functionList.MAP.functionParameter.number1.name',
                detail: 'formula.functionList.MAP.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MAP.functionParameter.number2.name',
                detail: 'formula.functionList.MAP.functionParameter.number2.detail',
                example: 'A1:A20',
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
                name: 'formula.functionList.NOT.functionParameter.number1.name',
                detail: 'formula.functionList.NOT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NOT.functionParameter.number2.name',
                detail: 'formula.functionList.NOT.functionParameter.number2.detail',
                example: 'A1:A20',
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
                name: 'formula.functionList.REDUCE.functionParameter.number1.name',
                detail: 'formula.functionList.REDUCE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.REDUCE.functionParameter.number2.name',
                detail: 'formula.functionList.REDUCE.functionParameter.number2.detail',
                example: 'A1:A20',
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
                name: 'formula.functionList.SCAN.functionParameter.number1.name',
                detail: 'formula.functionList.SCAN.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SCAN.functionParameter.number2.name',
                detail: 'formula.functionList.SCAN.functionParameter.number2.detail',
                example: 'A1:A20',
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
                name: 'formula.functionList.SWITCH.functionParameter.number1.name',
                detail: 'formula.functionList.SWITCH.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SWITCH.functionParameter.number2.name',
                detail: 'formula.functionList.SWITCH.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.TRUE,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.TRUE.description',
        abstract: 'formula.functionList.TRUE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TRUE.functionParameter.number1.name',
                detail: 'formula.functionList.TRUE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TRUE.functionParameter.number2.name',
                detail: 'formula.functionList.TRUE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOGICAL.XOR,
        functionType: FunctionType.Logical,
        description: 'formula.functionList.XOR.description',
        abstract: 'formula.functionList.XOR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.XOR.functionParameter.number1.name',
                detail: 'formula.functionList.XOR.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XOR.functionParameter.number2.name',
                detail: 'formula.functionList.XOR.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
