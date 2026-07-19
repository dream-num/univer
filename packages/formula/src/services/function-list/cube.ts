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
                name: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.connection.name',
                detail: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.kpiName.name',
                detail: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.kpiName.detail',
                example: '"Revenue"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.kpiProperty.name',
                detail: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.kpiProperty.detail',
                example: '"KPIValue"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.caption.name',
                detail: 'sheets-formula.functionList.CUBEKPIMEMBER.functionParameter.caption.detail',
                example: '"Revenue KPI"',
                require: 0,
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
                name: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.connection.name',
                detail: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.memberExpression.name',
                detail: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.memberExpression.detail',
                example: '"[Product].[All Products]"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.caption.name',
                detail: 'sheets-formula.functionList.CUBEMEMBER.functionParameter.caption.detail',
                example: '"All Products"',
                require: 0,
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
                name: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.connection.name',
                detail: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.memberExpression.name',
                detail: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.memberExpression.detail',
                example: '"[Product].[All Products]"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.property.name',
                detail: 'sheets-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.property.detail',
                example: '"Caption"',
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
                name: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.connection.name',
                detail: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.setExpression.name',
                detail: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.setExpression.detail',
                example: '"[Product].[All Products].Children"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.rank.name',
                detail: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.rank.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.caption.name',
                detail: 'sheets-formula.functionList.CUBERANKEDMEMBER.functionParameter.caption.detail',
                example: '"Top Product"',
                require: 0,
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
                name: 'sheets-formula.functionList.CUBESET.functionParameter.connection.name',
                detail: 'sheets-formula.functionList.CUBESET.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBESET.functionParameter.setExpression.name',
                detail: 'sheets-formula.functionList.CUBESET.functionParameter.setExpression.detail',
                example: '"[Product].[All Products].Children"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBESET.functionParameter.caption.name',
                detail: 'sheets-formula.functionList.CUBESET.functionParameter.caption.detail',
                example: '"Products"',
                require: 0,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBESET.functionParameter.sortOrder.name',
                detail: 'sheets-formula.functionList.CUBESET.functionParameter.sortOrder.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBESET.functionParameter.sortBy.name',
                detail: 'sheets-formula.functionList.CUBESET.functionParameter.sortBy.detail',
                example: '"[Measures].[Sales]"',
                require: 0,
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
                name: 'sheets-formula.functionList.CUBESETCOUNT.functionParameter.set.name',
                detail: 'sheets-formula.functionList.CUBESETCOUNT.functionParameter.set.detail',
                example: 'A1',
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
                name: 'sheets-formula.functionList.CUBEVALUE.functionParameter.connection.name',
                detail: 'sheets-formula.functionList.CUBEVALUE.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.CUBEVALUE.functionParameter.memberExpression.name',
                detail: 'sheets-formula.functionList.CUBEVALUE.functionParameter.memberExpression.detail',
                example: '"[Measures].[Sales]"',
                require: 0,
                repeat: 1,
            },
        ],
    },
];
