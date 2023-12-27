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

import { FUNCTION_NAMES_ARRAY, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_ARRAY: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_ARRAY.MAKEARRAY,
        aliasFunctionName: 'formula.functionList.MAKEARRAY.aliasFunctionName',
        functionType: FunctionType.Array,
        description: 'formula.functionList.MAKEARRAY.description',
        abstract: 'formula.functionList.MAKEARRAY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MAKEARRAY.functionParameter.number1.name',
                detail: 'formula.functionList.MAKEARRAY.functionParameter.number1.detail',
                example: '8',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MAKEARRAY.functionParameter.number2.name',
                detail: 'formula.functionList.MAKEARRAY.functionParameter.number2.detail',
                example: '7',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MAKEARRAY.functionParameter.value3.name',
                detail: 'formula.functionList.MAKEARRAY.functionParameter.value3.detail',
                example: 'LAMBDA(r,c, r*c)',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
