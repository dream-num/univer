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
import { FUNCTION_NAMES_INFORMATION } from '../../../functions/information/function-names';

export const FUNCTION_LIST_INFORMATION: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_INFORMATION.CELL,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.CELL.description',
        abstract: 'engine-formula.functionList.CELL.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CELL.functionParameter.infoType.name',
                detail: 'engine-formula.functionList.CELL.functionParameter.infoType.detail',
                example: '"type"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CELL.functionParameter.reference.name',
                detail: 'engine-formula.functionList.CELL.functionParameter.reference.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ERROR_TYPE,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ERROR_TYPE.description',
        abstract: 'engine-formula.functionList.ERROR_TYPE.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ERROR_TYPE.functionParameter.errorVal.name',
                detail: 'engine-formula.functionList.ERROR_TYPE.functionParameter.errorVal.detail',
                example: '"#NULL!"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.INFO,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.INFO.description',
        abstract: 'engine-formula.functionList.INFO.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.INFO.functionParameter.typeText.name',
                detail: 'engine-formula.functionList.INFO.functionParameter.typeText.detail',
                example: '"system"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISBETWEEN,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISBETWEEN.description',
        abstract: 'engine-formula.functionList.ISBETWEEN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISBETWEEN.functionParameter.valueToCompare.name',
                detail: 'engine-formula.functionList.ISBETWEEN.functionParameter.valueToCompare.detail',
                example: '7.9',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.ISBETWEEN.functionParameter.lowerValue.name',
                detail: 'engine-formula.functionList.ISBETWEEN.functionParameter.lowerValue.detail',
                example: '1.2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.ISBETWEEN.functionParameter.upperValue.name',
                detail: 'engine-formula.functionList.ISBETWEEN.functionParameter.upperValue.detail',
                example: '12.45',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.ISBETWEEN.functionParameter.lowerValueIsInclusive.name',
                detail: 'engine-formula.functionList.ISBETWEEN.functionParameter.lowerValueIsInclusive.detail',
                example: 'true',
                require: 0,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.ISBETWEEN.functionParameter.upperValueIsInclusive.name',
                detail: 'engine-formula.functionList.ISBETWEEN.functionParameter.upperValueIsInclusive.detail',
                example: 'true',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISBLANK,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISBLANK.description',
        abstract: 'engine-formula.functionList.ISBLANK.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISBLANK.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISBLANK.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISDATE,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISDATE.description',
        abstract: 'engine-formula.functionList.ISDATE.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISDATE.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISDATE.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISEMAIL,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISEMAIL.description',
        abstract: 'engine-formula.functionList.ISEMAIL.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISEMAIL.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISEMAIL.functionParameter.value.detail',
                example: '"developer@univer.ai"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISERR,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISERR.description',
        abstract: 'engine-formula.functionList.ISERR.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISERR.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISERR.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISERROR,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISERROR.description',
        abstract: 'engine-formula.functionList.ISERROR.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISERROR.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISERROR.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISEVEN,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISEVEN.description',
        abstract: 'engine-formula.functionList.ISEVEN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISEVEN.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISEVEN.functionParameter.value.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISFORMULA,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISFORMULA.description',
        abstract: 'engine-formula.functionList.ISFORMULA.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISFORMULA.functionParameter.reference.name',
                detail: 'engine-formula.functionList.ISFORMULA.functionParameter.reference.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISLOGICAL,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISLOGICAL.description',
        abstract: 'engine-formula.functionList.ISLOGICAL.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISLOGICAL.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISLOGICAL.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISNA,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISNA.description',
        abstract: 'engine-formula.functionList.ISNA.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISNA.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISNA.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISNONTEXT,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISNONTEXT.description',
        abstract: 'engine-formula.functionList.ISNONTEXT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISNONTEXT.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISNONTEXT.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISNUMBER,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISNUMBER.description',
        abstract: 'engine-formula.functionList.ISNUMBER.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISNUMBER.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISNUMBER.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISODD,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISODD.description',
        abstract: 'engine-formula.functionList.ISODD.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISODD.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISODD.functionParameter.value.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISOMITTED,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISOMITTED.description',
        abstract: 'engine-formula.functionList.ISOMITTED.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISOMITTED.functionParameter.argument.name',
                detail: 'engine-formula.functionList.ISOMITTED.functionParameter.argument.detail',
                example: 'value',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISREF,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISREF.description',
        abstract: 'engine-formula.functionList.ISREF.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISREF.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISREF.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISTEXT,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISTEXT.description',
        abstract: 'engine-formula.functionList.ISTEXT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISTEXT.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISTEXT.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISURL,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.ISURL.description',
        abstract: 'engine-formula.functionList.ISURL.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ISURL.functionParameter.value.name',
                detail: 'engine-formula.functionList.ISURL.functionParameter.value.detail',
                example: '"univer.ai"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.N,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.N.description',
        abstract: 'engine-formula.functionList.N.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.N.functionParameter.value.name',
                detail: 'engine-formula.functionList.N.functionParameter.value.detail',
                example: '7',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.NA,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.NA.description',
        abstract: 'engine-formula.functionList.NA.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.SHEET,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.SHEET.description',
        abstract: 'engine-formula.functionList.SHEET.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.SHEET.functionParameter.value.name',
                detail: 'engine-formula.functionList.SHEET.functionParameter.value.detail',
                example: 'A1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.SHEETS,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.SHEETS.description',
        abstract: 'engine-formula.functionList.SHEETS.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.TYPE,
        functionType: FunctionType.Information,
        description: 'engine-formula.functionList.TYPE.description',
        abstract: 'engine-formula.functionList.TYPE.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.TYPE.functionParameter.value.name',
                detail: 'engine-formula.functionList.TYPE.functionParameter.value.detail',
                example: 'A2',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
