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
import { FUNCTION_NAMES_ARRAY, FunctionType } from '@univerjs/engine-formula';

export const FUNCTION_LIST_ARRAY: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_ARRAY.ARRAY_CONSTRAIN,
        functionType: FunctionType.Array,
        description: 'formula.functionList.ARRAY_CONSTRAIN.description',
        abstract: 'formula.functionList.ARRAY_CONSTRAIN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ARRAY_CONSTRAIN.functionParameter.inputRange.name',
                detail: 'formula.functionList.ARRAY_CONSTRAIN.functionParameter.inputRange.detail',
                example: 'A1:C3',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ARRAY_CONSTRAIN.functionParameter.numRows.name',
                detail: 'formula.functionList.ARRAY_CONSTRAIN.functionParameter.numRows.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ARRAY_CONSTRAIN.functionParameter.numCols.name',
                detail: 'formula.functionList.ARRAY_CONSTRAIN.functionParameter.numCols.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ARRAY.FLATTEN,
        functionType: FunctionType.Array,
        description: 'formula.functionList.FLATTEN.description',
        abstract: 'formula.functionList.FLATTEN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FLATTEN.functionParameter.range1.name',
                detail: 'formula.functionList.FLATTEN.functionParameter.range1.detail',
                example: 'A1:C3',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FLATTEN.functionParameter.range2.name',
                detail: 'formula.functionList.FLATTEN.functionParameter.range2.detail',
                example: 'D1:F3',
                require: 0,
                repeat: 1,
            },
        ],
    },
];
