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
import { FUNCTION_NAMES_DATABASE, FunctionType } from '@univerjs/engine-formula';

export const FUNCTION_LIST_DATABASE: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_DATABASE.DAVERAGE,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DAVERAGE.description',
        abstract: 'sheets-formula.functionList.DAVERAGE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DAVERAGE.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DAVERAGE.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DAVERAGE.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DAVERAGE.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DAVERAGE.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DAVERAGE.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DCOUNT,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DCOUNT.description',
        abstract: 'sheets-formula.functionList.DCOUNT.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DCOUNT.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DCOUNT.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DCOUNT.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DCOUNT.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DCOUNT.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DCOUNT.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DCOUNTA,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DCOUNTA.description',
        abstract: 'sheets-formula.functionList.DCOUNTA.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DCOUNTA.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DCOUNTA.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DCOUNTA.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DCOUNTA.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DCOUNTA.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DCOUNTA.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DGET,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DGET.description',
        abstract: 'sheets-formula.functionList.DGET.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DGET.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DGET.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DGET.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DGET.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DGET.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DGET.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DMAX,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DMAX.description',
        abstract: 'sheets-formula.functionList.DMAX.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DMAX.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DMAX.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DMAX.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DMAX.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DMAX.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DMAX.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DMIN,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DMIN.description',
        abstract: 'sheets-formula.functionList.DMIN.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DMIN.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DMIN.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DMIN.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DMIN.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DMIN.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DMIN.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DPRODUCT,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DPRODUCT.description',
        abstract: 'sheets-formula.functionList.DPRODUCT.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DPRODUCT.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DPRODUCT.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DPRODUCT.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DPRODUCT.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DPRODUCT.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DPRODUCT.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSTDEV,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DSTDEV.description',
        abstract: 'sheets-formula.functionList.DSTDEV.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DSTDEV.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DSTDEV.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DSTDEV.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DSTDEV.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DSTDEV.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DSTDEV.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSTDEVP,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DSTDEVP.description',
        abstract: 'sheets-formula.functionList.DSTDEVP.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DSTDEVP.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DSTDEVP.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DSTDEVP.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DSTDEVP.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DSTDEVP.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DSTDEVP.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSUM,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DSUM.description',
        abstract: 'sheets-formula.functionList.DSUM.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DSUM.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DSUM.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DSUM.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DSUM.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DSUM.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DSUM.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DVAR,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DVAR.description',
        abstract: 'sheets-formula.functionList.DVAR.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DVAR.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DVAR.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DVAR.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DVAR.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DVAR.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DVAR.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DVARP,
        functionType: FunctionType.Database,
        description: 'sheets-formula.functionList.DVARP.description',
        abstract: 'sheets-formula.functionList.DVARP.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DVARP.functionParameter.database.name',
                detail: 'sheets-formula.functionList.DVARP.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DVARP.functionParameter.field.name',
                detail: 'sheets-formula.functionList.DVARP.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DVARP.functionParameter.criteria.name',
                detail: 'sheets-formula.functionList.DVARP.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
