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

import { FUNCTION_NAMES_WEB, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_WEB: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_WEB.ENCODEURL,
        functionType: FunctionType.Web,
        description: 'formula.functionList.ENCODEURL.description',
        abstract: 'formula.functionList.ENCODEURL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ENCODEURL.functionParameter.text.name',
                detail: 'formula.functionList.ENCODEURL.functionParameter.text.detail',
                example: '"https://univer.ai/"',
                require: 1,
                repeat: 0,
            },
        ],
    },

    {
        functionName: FUNCTION_NAMES_WEB.FILTERXML,
        functionType: FunctionType.Web,
        description: 'formula.functionList.FILTERXML.description',
        abstract: 'formula.functionList.FILTERXML.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FILTERXML.functionParameter.number1.name',
                detail: 'formula.functionList.FILTERXML.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FILTERXML.functionParameter.number2.name',
                detail: 'formula.functionList.FILTERXML.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_WEB.WEBSERVICE,
        functionType: FunctionType.Web,
        description: 'formula.functionList.WEBSERVICE.description',
        abstract: 'formula.functionList.WEBSERVICE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.WEBSERVICE.functionParameter.number1.name',
                detail: 'formula.functionList.WEBSERVICE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WEBSERVICE.functionParameter.number2.name',
                detail: 'formula.functionList.WEBSERVICE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
