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

import { FUNCTION_NAMES_INFORMATION, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_INFORMATION: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_INFORMATION.CELL,
        functionType: FunctionType.Information,
        description: 'formula.functionList.CELL.description',
        abstract: 'formula.functionList.CELL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CELL.functionParameter.infoType.name',
                detail: 'formula.functionList.CELL.functionParameter.infoType.detail',
                example: '"type"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CELL.functionParameter.reference.name',
                detail: 'formula.functionList.CELL.functionParameter.reference.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ERROR_TYPE,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ERROR_TYPE.description',
        abstract: 'formula.functionList.ERROR_TYPE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ERROR_TYPE.functionParameter.errorVal.name',
                detail: 'formula.functionList.ERROR_TYPE.functionParameter.errorVal.detail',
                example: '"#NULL!"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.INFO,
        functionType: FunctionType.Information,
        description: 'formula.functionList.INFO.description',
        abstract: 'formula.functionList.INFO.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.INFO.functionParameter.number1.name',
                detail: 'formula.functionList.INFO.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.INFO.functionParameter.number2.name',
                detail: 'formula.functionList.INFO.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISBETWEEN,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISBETWEEN.description',
        abstract: 'formula.functionList.ISBETWEEN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISBETWEEN.functionParameter.valueToCompare.name',
                detail: 'formula.functionList.ISBETWEEN.functionParameter.valueToCompare.detail',
                example: '7.9',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ISBETWEEN.functionParameter.lowerValue.name',
                detail: 'formula.functionList.ISBETWEEN.functionParameter.lowerValue.detail',
                example: '1.2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ISBETWEEN.functionParameter.upperValue.name',
                detail: 'formula.functionList.ISBETWEEN.functionParameter.upperValue.detail',
                example: '12.45',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ISBETWEEN.functionParameter.lowerValueIsInclusive.name',
                detail: 'formula.functionList.ISBETWEEN.functionParameter.lowerValueIsInclusive.detail',
                example: 'true',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ISBETWEEN.functionParameter.upperValueIsInclusive.name',
                detail: 'formula.functionList.ISBETWEEN.functionParameter.upperValueIsInclusive.detail',
                example: 'true',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISBLANK,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISBLANK.description',
        abstract: 'formula.functionList.ISBLANK.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISBLANK.functionParameter.value.name',
                detail: 'formula.functionList.ISBLANK.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISDATE,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISDATE.description',
        abstract: 'formula.functionList.ISDATE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISDATE.functionParameter.value.name',
                detail: 'formula.functionList.ISDATE.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISEMAIL,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISEMAIL.description',
        abstract: 'formula.functionList.ISEMAIL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISEMAIL.functionParameter.value.name',
                detail: 'formula.functionList.ISEMAIL.functionParameter.value.detail',
                example: '"developer@univer.ai"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISERR,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISERR.description',
        abstract: 'formula.functionList.ISERR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISERR.functionParameter.value.name',
                detail: 'formula.functionList.ISERR.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISERROR,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISERROR.description',
        abstract: 'formula.functionList.ISERROR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISERROR.functionParameter.value.name',
                detail: 'formula.functionList.ISERROR.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISEVEN,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISEVEN.description',
        abstract: 'formula.functionList.ISEVEN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISEVEN.functionParameter.value.name',
                detail: 'formula.functionList.ISEVEN.functionParameter.value.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISFORMULA,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISFORMULA.description',
        abstract: 'formula.functionList.ISFORMULA.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISFORMULA.functionParameter.reference.name',
                detail: 'formula.functionList.ISFORMULA.functionParameter.reference.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISLOGICAL,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISLOGICAL.description',
        abstract: 'formula.functionList.ISLOGICAL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISLOGICAL.functionParameter.value.name',
                detail: 'formula.functionList.ISLOGICAL.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISNA,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISNA.description',
        abstract: 'formula.functionList.ISNA.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISNA.functionParameter.value.name',
                detail: 'formula.functionList.ISNA.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISNONTEXT,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISNONTEXT.description',
        abstract: 'formula.functionList.ISNONTEXT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISNONTEXT.functionParameter.value.name',
                detail: 'formula.functionList.ISNONTEXT.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISNUMBER,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISNUMBER.description',
        abstract: 'formula.functionList.ISNUMBER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISNUMBER.functionParameter.value.name',
                detail: 'formula.functionList.ISNUMBER.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISODD,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISODD.description',
        abstract: 'formula.functionList.ISODD.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISODD.functionParameter.value.name',
                detail: 'formula.functionList.ISODD.functionParameter.value.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISOMITTED,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISOMITTED.description',
        abstract: 'formula.functionList.ISOMITTED.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISOMITTED.functionParameter.number1.name',
                detail: 'formula.functionList.ISOMITTED.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ISOMITTED.functionParameter.number2.name',
                detail: 'formula.functionList.ISOMITTED.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISREF,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISREF.description',
        abstract: 'formula.functionList.ISREF.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISREF.functionParameter.value.name',
                detail: 'formula.functionList.ISREF.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISTEXT,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISTEXT.description',
        abstract: 'formula.functionList.ISTEXT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISTEXT.functionParameter.value.name',
                detail: 'formula.functionList.ISTEXT.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.ISURL,
        functionType: FunctionType.Information,
        description: 'formula.functionList.ISURL.description',
        abstract: 'formula.functionList.ISURL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISURL.functionParameter.value.name',
                detail: 'formula.functionList.ISURL.functionParameter.value.detail',
                example: '"univer.ai"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.N,
        functionType: FunctionType.Information,
        description: 'formula.functionList.N.description',
        abstract: 'formula.functionList.N.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.N.functionParameter.value.name',
                detail: 'formula.functionList.N.functionParameter.value.detail',
                example: '7',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.NA,
        functionType: FunctionType.Information,
        description: 'formula.functionList.NA.description',
        abstract: 'formula.functionList.NA.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.SHEET,
        functionType: FunctionType.Information,
        description: 'formula.functionList.SHEET.description',
        abstract: 'formula.functionList.SHEET.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SHEET.functionParameter.value.name',
                detail: 'formula.functionList.SHEET.functionParameter.value.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.SHEETS,
        functionType: FunctionType.Information,
        description: 'formula.functionList.SHEETS.description',
        abstract: 'formula.functionList.SHEETS.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_INFORMATION.TYPE,
        functionType: FunctionType.Information,
        description: 'formula.functionList.TYPE.description',
        abstract: 'formula.functionList.TYPE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TYPE.functionParameter.value.name',
                detail: 'formula.functionList.TYPE.functionParameter.value.detail',
                example: 'A2',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
