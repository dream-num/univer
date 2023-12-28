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

import type { BaseValueObject, IFunctionInfo } from '@univerjs/engine-formula';
import { BaseFunction, FunctionType } from '@univerjs/engine-formula';

/**
 * function name
 */
export enum FUNCTION_NAMES_USER {
    CUSTOMSUM = 'CUSTOMSUM',
}

/**
 * i18n
 */
export const functionEnUS = {
    formula: {
        functionList: {
            CUSTOMSUM: {
                description: `You can add individual values, cell references or ranges or a mix of all three.`,
                abstract: `Adds its arguments`,
                links: [
                    {
                        title: 'Instruction',
                        url: 'https://support.microsoft.com/en-us/office/sum-function-043e1c7d-7726-4e80-8f32-07b23e057f89',
                    },
                ],
                functionParameter: {
                    number1: {
                        name: 'number1',
                        detail: 'The first number you want to add. The number can be like 4, a cell reference like B6, or a cell range like B2:B8.',
                    },
                    number2: {
                        name: 'number2',
                        detail: 'This is the second number you want to add. You can specify up to 255 numbers in this way.',
                    },
                },
            },
        },
    },
};

export const functionZhCN = {
    formula: {
        functionList: {
            CUSTOMSUM: {
                description: '将单个值、单元格引用或是区域相加，或者将三者的组合相加。',
                abstract: '求参数的和',
                links: [
                    {
                        title: '教学',
                        url: 'https://support.microsoft.com/zh-cn/office/sum-%E5%87%BD%E6%95%B0-043e1c7d-7726-4e80-8f32-07b23e057f89',
                    },
                ],
                functionParameter: {
                    number1: {
                        name: '数值1',
                        detail: '要相加的第一个数字。 该数字可以是 4 之类的数字，B6 之类的单元格引用或 B2:B8 之类的单元格范围。',
                    },
                    number2: {
                        name: '数值2',
                        detail: '这是要相加的第二个数字。 可以按照这种方式最多指定 255 个数字。',
                    },
                },
            },
        },
    },
};

/**
 * description
 */
export const FUNCTION_LIST_USER: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_USER.CUSTOMSUM,
        aliasFunctionName: 'formula.functionList.CUSTOMSUM.aliasFunctionName',
        functionType: FunctionType.User,
        description: 'formula.functionList.CUSTOMSUM.description',
        abstract: 'formula.functionList.CUSTOMSUM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CUSTOMSUM.functionParameter.number1.name',
                detail: 'formula.functionList.CUSTOMSUM.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CUSTOMSUM.functionParameter.number2.name',
                detail: 'formula.functionList.CUSTOMSUM.functionParameter.number2.detail',
                example: 'B2:B10',
                require: 0,
                repeat: 1,
            },
        ],
    },
];

/**
 * Function algorithm
 */
export class Customsum extends BaseFunction {
    override calculate(...variants: BaseValueObject[]) {
        return variants[0].plus(variants[1]);
    }
}

export const functionUser = [[Customsum, FUNCTION_NAMES_USER.CUSTOMSUM]];
