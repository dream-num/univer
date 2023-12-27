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

import { FUNCTION_NAMES_DATABASE, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_DATABASE: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_DATABASE.DAVERAGE,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DAVERAGE.description',
        abstract: 'formula.functionList.DAVERAGE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DAVERAGE.functionParameter.number1.name',
                detail: 'formula.functionList.DAVERAGE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DAVERAGE.functionParameter.number2.name',
                detail: 'formula.functionList.DAVERAGE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DCOUNT,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DCOUNT.description',
        abstract: 'formula.functionList.DCOUNT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DCOUNT.functionParameter.number1.name',
                detail: 'formula.functionList.DCOUNT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DCOUNT.functionParameter.number2.name',
                detail: 'formula.functionList.DCOUNT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DCOUNTA,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DCOUNTA.description',
        abstract: 'formula.functionList.DCOUNTA.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DCOUNTA.functionParameter.number1.name',
                detail: 'formula.functionList.DCOUNTA.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DCOUNTA.functionParameter.number2.name',
                detail: 'formula.functionList.DCOUNTA.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DGET,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DGET.description',
        abstract: 'formula.functionList.DGET.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DGET.functionParameter.number1.name',
                detail: 'formula.functionList.DGET.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DGET.functionParameter.number2.name',
                detail: 'formula.functionList.DGET.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DMAX,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DMAX.description',
        abstract: 'formula.functionList.DMAX.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DMAX.functionParameter.number1.name',
                detail: 'formula.functionList.DMAX.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DMAX.functionParameter.number2.name',
                detail: 'formula.functionList.DMAX.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DMIN,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DMIN.description',
        abstract: 'formula.functionList.DMIN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DMIN.functionParameter.number1.name',
                detail: 'formula.functionList.DMIN.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DMIN.functionParameter.number2.name',
                detail: 'formula.functionList.DMIN.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DPRODUCT,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DPRODUCT.description',
        abstract: 'formula.functionList.DPRODUCT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DPRODUCT.functionParameter.number1.name',
                detail: 'formula.functionList.DPRODUCT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DPRODUCT.functionParameter.number2.name',
                detail: 'formula.functionList.DPRODUCT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSTDEV,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DSTDEV.description',
        abstract: 'formula.functionList.DSTDEV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DSTDEV.functionParameter.number1.name',
                detail: 'formula.functionList.DSTDEV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DSTDEV.functionParameter.number2.name',
                detail: 'formula.functionList.DSTDEV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSTDEVP,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DSTDEVP.description',
        abstract: 'formula.functionList.DSTDEVP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DSTDEVP.functionParameter.number1.name',
                detail: 'formula.functionList.DSTDEVP.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DSTDEVP.functionParameter.number2.name',
                detail: 'formula.functionList.DSTDEVP.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSUM,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DSUM.description',
        abstract: 'formula.functionList.DSUM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DSUM.functionParameter.number1.name',
                detail: 'formula.functionList.DSUM.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DSUM.functionParameter.number2.name',
                detail: 'formula.functionList.DSUM.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DVAR,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DVAR.description',
        abstract: 'formula.functionList.DVAR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DVAR.functionParameter.number1.name',
                detail: 'formula.functionList.DVAR.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DVAR.functionParameter.number2.name',
                detail: 'formula.functionList.DVAR.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DVARP,
        functionType: FunctionType.Database,
        description: 'formula.functionList.DVARP.description',
        abstract: 'formula.functionList.DVARP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DVARP.functionParameter.number1.name',
                detail: 'formula.functionList.DVARP.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DVARP.functionParameter.number2.name',
                detail: 'formula.functionList.DVARP.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
