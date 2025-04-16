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

import { FUNCTION_NAMES_CUBE, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_CUBE: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEKPIMEMBER,
        functionType: FunctionType.Cube,
        description: 'formula.functionList.CUBEKPIMEMBER.description',
        abstract: 'formula.functionList.CUBEKPIMEMBER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CUBEKPIMEMBER.functionParameter.number1.name',
                detail: 'formula.functionList.CUBEKPIMEMBER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CUBEKPIMEMBER.functionParameter.number2.name',
                detail: 'formula.functionList.CUBEKPIMEMBER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEMEMBER,
        functionType: FunctionType.Cube,
        description: 'formula.functionList.CUBEMEMBER.description',
        abstract: 'formula.functionList.CUBEMEMBER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CUBEMEMBER.functionParameter.number1.name',
                detail: 'formula.functionList.CUBEMEMBER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CUBEMEMBER.functionParameter.number2.name',
                detail: 'formula.functionList.CUBEMEMBER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEMEMBERPROPERTY,
        functionType: FunctionType.Cube,
        description: 'formula.functionList.CUBEMEMBERPROPERTY.description',
        abstract: 'formula.functionList.CUBEMEMBERPROPERTY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CUBEMEMBERPROPERTY.functionParameter.number1.name',
                detail: 'formula.functionList.CUBEMEMBERPROPERTY.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CUBEMEMBERPROPERTY.functionParameter.number2.name',
                detail: 'formula.functionList.CUBEMEMBERPROPERTY.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBERANKEDMEMBER,
        functionType: FunctionType.Cube,
        description: 'formula.functionList.CUBERANKEDMEMBER.description',
        abstract: 'formula.functionList.CUBERANKEDMEMBER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CUBERANKEDMEMBER.functionParameter.number1.name',
                detail: 'formula.functionList.CUBERANKEDMEMBER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CUBERANKEDMEMBER.functionParameter.number2.name',
                detail: 'formula.functionList.CUBERANKEDMEMBER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBESET,
        functionType: FunctionType.Cube,
        description: 'formula.functionList.CUBESET.description',
        abstract: 'formula.functionList.CUBESET.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CUBESET.functionParameter.number1.name',
                detail: 'formula.functionList.CUBESET.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CUBESET.functionParameter.number2.name',
                detail: 'formula.functionList.CUBESET.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBESETCOUNT,
        functionType: FunctionType.Cube,
        description: 'formula.functionList.CUBESETCOUNT.description',
        abstract: 'formula.functionList.CUBESETCOUNT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CUBESETCOUNT.functionParameter.number1.name',
                detail: 'formula.functionList.CUBESETCOUNT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CUBESETCOUNT.functionParameter.number2.name',
                detail: 'formula.functionList.CUBESETCOUNT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEVALUE,
        functionType: FunctionType.Cube,
        description: 'formula.functionList.CUBEVALUE.description',
        abstract: 'formula.functionList.CUBEVALUE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CUBEVALUE.functionParameter.number1.name',
                detail: 'formula.functionList.CUBEVALUE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CUBEVALUE.functionParameter.number2.name',
                detail: 'formula.functionList.CUBEVALUE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
