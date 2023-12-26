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

import { FUNCTION_NAMES_LOOKUP, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_LOOKUP: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_LOOKUP.ADDRESS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.ADDRESS.description',
        abstract: 'formula.functionList.ADDRESS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ADDRESS.functionParameter.row_num.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.row_num.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ADDRESS.functionParameter.column_num.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.column_num.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ADDRESS.functionParameter.abs_num.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.abs_num.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ADDRESS.functionParameter.a1.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.a1.detail',
                example: 'TRUE',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ADDRESS.functionParameter.sheet_text.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.sheet_text.detail',
                example: 'Sheet2',
                require: 0,
                repeat: 0,
            },
        ],
    },
];
