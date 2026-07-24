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

import type { IFunctionInfo } from '../../../basics/function';
import { FunctionType } from '../../../basics/function';
import { FUNCTION_NAMES_CUBE } from '../../../functions/cube/function-names';

export const FUNCTION_LIST_CUBE: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEKPIMEMBER,
        functionType: FunctionType.Cube,
        description: 'engine-formula.functionList.CUBEKPIMEMBER.description',
        abstract: 'engine-formula.functionList.CUBEKPIMEMBER.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CUBEKPIMEMBER.functionParameter.connection.name',
                detail: 'engine-formula.functionList.CUBEKPIMEMBER.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBEKPIMEMBER.functionParameter.kpiName.name',
                detail: 'engine-formula.functionList.CUBEKPIMEMBER.functionParameter.kpiName.detail',
                example: '"Revenue"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBEKPIMEMBER.functionParameter.kpiProperty.name',
                detail: 'engine-formula.functionList.CUBEKPIMEMBER.functionParameter.kpiProperty.detail',
                example: '"KPIValue"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBEKPIMEMBER.functionParameter.caption.name',
                detail: 'engine-formula.functionList.CUBEKPIMEMBER.functionParameter.caption.detail',
                example: '"Revenue KPI"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEMEMBER,
        functionType: FunctionType.Cube,
        description: 'engine-formula.functionList.CUBEMEMBER.description',
        abstract: 'engine-formula.functionList.CUBEMEMBER.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CUBEMEMBER.functionParameter.connection.name',
                detail: 'engine-formula.functionList.CUBEMEMBER.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBEMEMBER.functionParameter.memberExpression.name',
                detail: 'engine-formula.functionList.CUBEMEMBER.functionParameter.memberExpression.detail',
                example: '"[Product].[All Products]"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBEMEMBER.functionParameter.caption.name',
                detail: 'engine-formula.functionList.CUBEMEMBER.functionParameter.caption.detail',
                example: '"All Products"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEMEMBERPROPERTY,
        functionType: FunctionType.Cube,
        description: 'engine-formula.functionList.CUBEMEMBERPROPERTY.description',
        abstract: 'engine-formula.functionList.CUBEMEMBERPROPERTY.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.connection.name',
                detail: 'engine-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.memberExpression.name',
                detail: 'engine-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.memberExpression.detail',
                example: '"[Product].[All Products]"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.property.name',
                detail: 'engine-formula.functionList.CUBEMEMBERPROPERTY.functionParameter.property.detail',
                example: '"Caption"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBERANKEDMEMBER,
        functionType: FunctionType.Cube,
        description: 'engine-formula.functionList.CUBERANKEDMEMBER.description',
        abstract: 'engine-formula.functionList.CUBERANKEDMEMBER.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CUBERANKEDMEMBER.functionParameter.connection.name',
                detail: 'engine-formula.functionList.CUBERANKEDMEMBER.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBERANKEDMEMBER.functionParameter.setExpression.name',
                detail: 'engine-formula.functionList.CUBERANKEDMEMBER.functionParameter.setExpression.detail',
                example: '"[Product].[All Products].Children"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBERANKEDMEMBER.functionParameter.rank.name',
                detail: 'engine-formula.functionList.CUBERANKEDMEMBER.functionParameter.rank.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBERANKEDMEMBER.functionParameter.caption.name',
                detail: 'engine-formula.functionList.CUBERANKEDMEMBER.functionParameter.caption.detail',
                example: '"Top Product"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBESET,
        functionType: FunctionType.Cube,
        description: 'engine-formula.functionList.CUBESET.description',
        abstract: 'engine-formula.functionList.CUBESET.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CUBESET.functionParameter.connection.name',
                detail: 'engine-formula.functionList.CUBESET.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBESET.functionParameter.setExpression.name',
                detail: 'engine-formula.functionList.CUBESET.functionParameter.setExpression.detail',
                example: '"[Product].[All Products].Children"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBESET.functionParameter.caption.name',
                detail: 'engine-formula.functionList.CUBESET.functionParameter.caption.detail',
                example: '"Products"',
                require: 0,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBESET.functionParameter.sortOrder.name',
                detail: 'engine-formula.functionList.CUBESET.functionParameter.sortOrder.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBESET.functionParameter.sortBy.name',
                detail: 'engine-formula.functionList.CUBESET.functionParameter.sortBy.detail',
                example: '"[Measures].[Sales]"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBESETCOUNT,
        functionType: FunctionType.Cube,
        description: 'engine-formula.functionList.CUBESETCOUNT.description',
        abstract: 'engine-formula.functionList.CUBESETCOUNT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CUBESETCOUNT.functionParameter.set.name',
                detail: 'engine-formula.functionList.CUBESETCOUNT.functionParameter.set.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_CUBE.CUBEVALUE,
        functionType: FunctionType.Cube,
        description: 'engine-formula.functionList.CUBEVALUE.description',
        abstract: 'engine-formula.functionList.CUBEVALUE.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CUBEVALUE.functionParameter.connection.name',
                detail: 'engine-formula.functionList.CUBEVALUE.functionParameter.connection.detail',
                example: '"Sales"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CUBEVALUE.functionParameter.memberExpression.name',
                detail: 'engine-formula.functionList.CUBEVALUE.functionParameter.memberExpression.detail',
                example: '"[Measures].[Sales]"',
                require: 0,
                repeat: 1,
            },
        ],
    },
];
