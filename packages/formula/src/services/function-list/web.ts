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
import { FUNCTION_NAMES_WEB, FunctionType } from '@univerjs/engine-formula';

export const FUNCTION_LIST_WEB: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_WEB.ENCODEURL,
        functionType: FunctionType.Web,
        description: 'sheets-formula.functionList.ENCODEURL.description',
        abstract: 'sheets-formula.functionList.ENCODEURL.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.ENCODEURL.functionParameter.text.name',
                detail: 'sheets-formula.functionList.ENCODEURL.functionParameter.text.detail',
                example: '"https://univer.ai/"',
                require: 1,
                repeat: 0,
            },
        ],
    },

    {
        functionName: FUNCTION_NAMES_WEB.FILTERXML,
        functionType: FunctionType.Web,
        description: 'sheets-formula.functionList.FILTERXML.description',
        abstract: 'sheets-formula.functionList.FILTERXML.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.FILTERXML.functionParameter.xml.name',
                detail: 'sheets-formula.functionList.FILTERXML.functionParameter.xml.detail',
                example: '"<root><item>value</item></root>"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.FILTERXML.functionParameter.xpath.name',
                detail: 'sheets-formula.functionList.FILTERXML.functionParameter.xpath.detail',
                example: '"//item"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_WEB.WEBSERVICE,
        functionType: FunctionType.Web,
        description: 'sheets-formula.functionList.WEBSERVICE.description',
        abstract: 'sheets-formula.functionList.WEBSERVICE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.WEBSERVICE.functionParameter.url.name',
                detail: 'sheets-formula.functionList.WEBSERVICE.functionParameter.url.detail',
                example: '"https://example.com/api"',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
