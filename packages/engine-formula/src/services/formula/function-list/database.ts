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
import { FUNCTION_NAMES_DATABASE } from '../../../functions/database/function-names';

export const FUNCTION_LIST_DATABASE: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_DATABASE.DAVERAGE,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DAVERAGE.description',
        abstract: 'engine-formula.functionList.DAVERAGE.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DAVERAGE.functionParameter.database.name',
                detail: 'engine-formula.functionList.DAVERAGE.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DAVERAGE.functionParameter.field.name',
                detail: 'engine-formula.functionList.DAVERAGE.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DAVERAGE.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DAVERAGE.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DCOUNT,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DCOUNT.description',
        abstract: 'engine-formula.functionList.DCOUNT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DCOUNT.functionParameter.database.name',
                detail: 'engine-formula.functionList.DCOUNT.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DCOUNT.functionParameter.field.name',
                detail: 'engine-formula.functionList.DCOUNT.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DCOUNT.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DCOUNT.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DCOUNTA,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DCOUNTA.description',
        abstract: 'engine-formula.functionList.DCOUNTA.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DCOUNTA.functionParameter.database.name',
                detail: 'engine-formula.functionList.DCOUNTA.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DCOUNTA.functionParameter.field.name',
                detail: 'engine-formula.functionList.DCOUNTA.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DCOUNTA.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DCOUNTA.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DGET,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DGET.description',
        abstract: 'engine-formula.functionList.DGET.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DGET.functionParameter.database.name',
                detail: 'engine-formula.functionList.DGET.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DGET.functionParameter.field.name',
                detail: 'engine-formula.functionList.DGET.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DGET.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DGET.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DMAX,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DMAX.description',
        abstract: 'engine-formula.functionList.DMAX.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DMAX.functionParameter.database.name',
                detail: 'engine-formula.functionList.DMAX.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DMAX.functionParameter.field.name',
                detail: 'engine-formula.functionList.DMAX.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DMAX.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DMAX.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DMIN,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DMIN.description',
        abstract: 'engine-formula.functionList.DMIN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DMIN.functionParameter.database.name',
                detail: 'engine-formula.functionList.DMIN.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DMIN.functionParameter.field.name',
                detail: 'engine-formula.functionList.DMIN.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DMIN.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DMIN.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DPRODUCT,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DPRODUCT.description',
        abstract: 'engine-formula.functionList.DPRODUCT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DPRODUCT.functionParameter.database.name',
                detail: 'engine-formula.functionList.DPRODUCT.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DPRODUCT.functionParameter.field.name',
                detail: 'engine-formula.functionList.DPRODUCT.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DPRODUCT.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DPRODUCT.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSTDEV,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DSTDEV.description',
        abstract: 'engine-formula.functionList.DSTDEV.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DSTDEV.functionParameter.database.name',
                detail: 'engine-formula.functionList.DSTDEV.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DSTDEV.functionParameter.field.name',
                detail: 'engine-formula.functionList.DSTDEV.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DSTDEV.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DSTDEV.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSTDEVP,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DSTDEVP.description',
        abstract: 'engine-formula.functionList.DSTDEVP.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DSTDEVP.functionParameter.database.name',
                detail: 'engine-formula.functionList.DSTDEVP.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DSTDEVP.functionParameter.field.name',
                detail: 'engine-formula.functionList.DSTDEVP.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DSTDEVP.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DSTDEVP.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DSUM,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DSUM.description',
        abstract: 'engine-formula.functionList.DSUM.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DSUM.functionParameter.database.name',
                detail: 'engine-formula.functionList.DSUM.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DSUM.functionParameter.field.name',
                detail: 'engine-formula.functionList.DSUM.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DSUM.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DSUM.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DVAR,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DVAR.description',
        abstract: 'engine-formula.functionList.DVAR.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DVAR.functionParameter.database.name',
                detail: 'engine-formula.functionList.DVAR.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DVAR.functionParameter.field.name',
                detail: 'engine-formula.functionList.DVAR.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DVAR.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DVAR.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATABASE.DVARP,
        functionType: FunctionType.Database,
        description: 'engine-formula.functionList.DVARP.description',
        abstract: 'engine-formula.functionList.DVARP.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DVARP.functionParameter.database.name',
                detail: 'engine-formula.functionList.DVARP.functionParameter.database.detail',
                example: 'A4:E10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DVARP.functionParameter.field.name',
                detail: 'engine-formula.functionList.DVARP.functionParameter.field.detail',
                example: 'D4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DVARP.functionParameter.criteria.name',
                detail: 'engine-formula.functionList.DVARP.functionParameter.criteria.detail',
                example: 'A1:B2',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
