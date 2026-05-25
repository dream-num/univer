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

import type { IFunctionInfo } from '@univerjs/engine-formula';
import { FUNCTION_NAMES_CUBE, FunctionType } from '@univerjs/engine-formula';

export const FUNCTION_LIST_CUBE: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEKPIMEMBER,
        functionType: FunctionType.Cube,
        description: 'sheets-formula.functionList.CUBEKPIMEMBER.description',
        abstract: 'sheets-formula.functionList.CUBEKPIMEMBER.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.number1.name',
                detail: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.number2.name',
                detail: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEMEMBER,
        functionType: FunctionType.Cube,
        description: 'sheets-formula.functionList.CUBEMEMBER.description',
        abstract: 'sheets-formula.functionList.CUBEMEMBER.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.number1.name',
                detail: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.number2.name',
                detail: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEMEMBERPROPERTY,
        functionType: FunctionType.Cube,
        description: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.description',
        abstract: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.number1.name',
                detail: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.number2.name',
                detail: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBERANKEDMEMBER,
        functionType: FunctionType.Cube,
        description: 'sheets-formula.functionList.CUBERANKEDMEMBER.description',
        abstract: 'sheets-formula.functionList.CUBERANKEDMEMBER.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.number1.name',
                detail: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.number2.name',
                detail: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBESET,
        functionType: FunctionType.Cube,
        description: 'sheets-formula.functionList.CUBESET.description',
        abstract: 'sheets-formula.functionList.CUBESET.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.CUBESET.functionParameter.number1.name',
                detail: 'sheets-formula.functionList.CUBESET.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBESET.functionParameter.number2.name',
                detail: 'sheets-formula.functionList.CUBESET.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBESETCOUNT,
        functionType: FunctionType.Cube,
        description: 'sheets-formula.functionList.CUBESETCOUNT.description',
        abstract: 'sheets-formula.functionList.CUBESETCOUNT.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.CUBESETCOUNT.functionParameter.number1.name',
                detail: 'sheets-formula.functionList.CUBESETCOUNT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBESETCOUNT.functionParameter.number2.name',
                detail: 'sheets-formula.functionList.CUBESETCOUNT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEVALUE,
        functionType: FunctionType.Cube,
        description: 'sheets-formula.functionList.CUBEVALUE.description',
        abstract: 'sheets-formula.functionList.CUBEVALUE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.CUBEVALUE.functionParameter.number1.name',
                detail: 'sheets-formula.functionList.CUBEVALUE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEVALUE.functionParameter.number2.name',
                detail: 'sheets-formula.functionList.CUBEVALUE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
