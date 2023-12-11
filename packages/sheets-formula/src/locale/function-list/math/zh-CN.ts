/**
 * Copyright 2023 DreamNum Inc.
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

export default {
    SUM: {
        description: '将单个值、单元格引用或是区域相加，或者将三者的组合相加。',
        abstract: '求参数的和',
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
    SUMIF: {
        description: '对范围中符合指定条件的值求和。',
        abstract: '按给定条件对指定单元格求和',
        functionParameter: {
            range: {
                name: '范围',
                detail: '要根据条件进行检测的范围。',
            },
            criteria: {
                name: '条件',
                detail: '以数字、表达式、单元格引用、文本或函数的形式来定义将添加哪些单元格。可包括的通配符字符 - 问号（？）以匹配任意单个字符，星号（*）以匹配任意字符序列。 如果要查找实际的问号或星号，请在该字符前键入波形符（~）。',
            },
            sum_range: {
                name: '求和范围',
                detail: '要添加的实际单元格，如果要添加在范围参数指定以外的其他单元格。 如果省略sum_range参数，Excel就会添加范围参数中指定的单元格（与应用标准的单元格相同）。',
            },
        },
    },
};
