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

import type enUS from './en-US';

const locale: typeof enUS = {
    ABS: {
        description: '返回数字的绝对值。一个数字的绝对值是该数字不带其符号的形式。',
        abstract: '返回数字的绝对值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '需要计算其绝对值的实数。' },
        },
    },
    ACOS: {
        description:
            '返回数字的反余弦值。 反余弦值是指余弦值为 number 的角度。 返回的角度以弧度表示，弧度值在 0（零）到 pi 之间。',
        abstract: '返回数字的反余弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '所求角度的余弦值，必须介于 -1 到 1 之间。' },
        },
    },
    ACOSH: {
        description:
            '返回数字的反双曲余弦值。 该数字必须大于或等于 1。 反双曲余弦值是指双曲余弦值为 number 的值，因此 ACOSH(COSH(number)) 等于 number。',
        abstract: '返回数字的反双曲余弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '大于或等于 1 的任意实数。' },
        },
    },
    ACOT: {
        description: '返回数字的反余切值的主值。',
        abstract: '返回一个数的反余切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '数字是需要的角度的正切值。 这必须是实数。' },
        },
    },
    ACOTH: {
        description: '返回数字的反双曲余切值。',
        abstract: '返回一个数的双曲反余切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '数字的绝对值必须大于 1。' },
        },
    },
    AGGREGATE: {
        description: '返回列表或数据库中的聚合',
        abstract: '返回列表或数据库中的聚合',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: '函数编号', detail: '一个介于 1 到 19 之间的数字，指定要使用的函数。' },
            options: { name: '选项', detail: '一个数值，决定在函数的计算区域内要忽略哪些值。' },
            ref1: { name: '引用1', detail: '函数的第一个数值参数，这些函数具有要计算聚合值的多个数值参数。' },
            ref2: { name: '引用2', detail: '要计算聚合值的 2 至 252 个数值参数。' },
        },
    },
    ARABIC: {
        description: '将罗马数字转换为阿拉伯数字',
        abstract: '将罗马数字转换为阿拉伯数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '用引号括起来的字符串、 ("") 的空字符串或对包含文本的单元格的引用。' },
        },
    },
    ASIN: {
        description: '返回数字的反正弦值。',
        abstract: '返回数字的反正弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: ' 所求角度的正弦值，必须介于 -1 到 1 之间。' },
        },
    },
    ASINH: {
        description: '返回数字的反双曲正弦值。',
        abstract: '返回数字的反双曲正弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '任意实数。' },
        },
    },
    ATAN: {
        description: '返回数字的反正切值。',
        abstract: '返回数字的反正切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '所求角度的正切值。' },
        },
    },
    ATAN2: {
        description: '返回给定的 X 轴及 Y 轴坐标值的反正切值。 反正切值是指从 X 轴到通过原点 (0, 0) 和坐标点 (x_num, y_num) 的直线之间的夹角。 该角度以弧度表示，弧度值在 -pi 到 pi 之间（不包括 -pi）。',
        abstract: '返回给定的 X 轴及 Y 轴坐标值的反正切值。 反正切值是指从 X 轴到通过原点 (0, 0) 和坐标点 (x_num, y_num) 的直线之间的夹角。 该角度以弧度表示，弧度值在 -pi 到 pi 之间（不包括 -pi）。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x 坐标', detail: '必填。 点的 x 坐标。' },
            yNum: { name: 'y 坐标', detail: '必填。 点的 y 坐标。' },
        },
    },
    ATANH: {
        description: '返回数字的反双曲正切值。 Number 必须介于 -1 到 1 之间（不包括 -1 和 1）。 反双曲正切值是指双曲正切值为 number 的值，因此 ATANH(TANH(number)) 等于 number 。',
        abstract: '返回数字的反双曲正切值。 Number 必须介于 -1 到 1 之间（不包括 -1 和 1）。 反双曲正切值是指双曲正切值为 number 的值，因此 ATANH(TANH(number)) 等于 number 。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '必需。 -1 到 1 之间的任意实数。' },
        },
    },
    BASE: {
        description: '将一个数转换为具有给定基数的文本表示',
        abstract: '将一个数转换为具有给定基数的文本表示',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要转换的数字。必须是大于或等于 0 且小于 2^53 的整数。' },
            radix: { name: '基数', detail: '要将数字转换为的基数。必须是大于或等于 2 且小于或等于 36 的整数。' },
            minLength: { name: '最小长度', detail: '返回的字符串的最小长度。必须是大于或等于 0 的整数。' },
        },
    },
    CEILING: {
        description: '将数字舍入为最接近的整数或最接近的指定基数的倍数',
        abstract: '将数字舍入为最接近的整数或最接近的指定基数的倍数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
            significance: { name: '倍数', detail: '要舍入到的倍数。' },
        },
    },
    CEILING_MATH: {
        description: '将数字向上舍入为最接近的整数或最接近的指定基数的倍数',
        abstract: '将数字向上舍入为最接近的整数或最接近的指定基数的倍数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
            significance: { name: '倍数', detail: '要舍入到的倍数。' },
            mode: { name: '众数', detail: '对于负数，控制数值是舍入为零还是从零舍入。' },
        },
    },
    CEILING_PRECISE: {
        description: '将数字舍入为最接近的整数或最接近的指定基数的倍数。 无论该数字的符号如何，该数字都向上舍入。',
        abstract: '将数字舍入为最接近的整数或最接近的指定基数的倍数。 无论该数字的符号如何，该数字都向上舍入。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
            significance: { name: '倍数', detail: '要舍入到的倍数。' },
        },
    },
    COMBIN: {
        description: '返回给定数目对象的组合数',
        abstract: '返回给定数目对象的组合数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: '总数', detail: '项目的数量。' },
            numberChosen: { name: '样品数量', detail: '每一组合中项目的数量。' },
        },
    },
    COMBINA: {
        description: '返回给定数目对象具有重复项的组合数',
        abstract: '返回给定数目对象具有重复项的组合数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: '总数', detail: '项目的数量。' },
            numberChosen: { name: '样品数量', detail: '每一组合中项目的数量。' },
        },
    },
    COS: {
        description: '返回数字的余弦值。',
        abstract: '返回数字的余弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '想要求余弦的角度，以弧度表示。' },
        },
    },
    COSH: {
        description: '返回数字的双曲余弦值',
        abstract: '返回数字的双曲余弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '想要求双曲余弦的任意实数。' },
        },
    },
    COT: {
        description: '返回以弧度表示的角度的余切值。',
        abstract: '指定角度的余切值（以弧度表示）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '需要余切值的角度（以弧度为单位）。' },
        },
    },
    COTH: {
        description: '返回数字的双曲余切值',
        abstract: '返回数字的双曲余切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '想要求双曲余切的任意实数。' },
        },
    },
    CSC: {
        description: '返回角度的余割值，以弧度表示。',
        abstract: '返回角度的余割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '想要求余割的角度，以弧度表示。' },
        },
    },
    CSCH: {
        description: '返回角度的双曲余割值',
        abstract: '返回角度的双曲余割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '想要求双曲余割值的角度，以弧度表示。' },
        },
    },
    DECIMAL: {
        description: '将给定基数内的数的文本表示转换为十进制数',
        abstract: '将给定基数内的数的文本表示转换为十进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: '字符串', detail: '字符串长度必须小于或等于 255 个字符。' },
            radix: { name: '基数', detail: '要将数字转换为的基数。 必须是大于或等于 2 且小于或等于 36 的整数。' },
        },
    },
    DEGREES: {
        description: '将弧度转换为度',
        abstract: '将弧度转换为度',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: '角度', detail: '要转换的角度，以弧度表示。' },
        },
    },
    EVEN: {
        description: '将数字向上舍入到最接近的偶数',
        abstract: '将数字向上舍入到最接近的偶数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
        },
    },
    EXP: {
        description: '返回e的 n 次方',
        abstract: '返回e的 n 次方',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '底数 e 的指数。' },
        },
    },
    FACT: {
        description: '返回数字的阶乘',
        abstract: '返回数字的阶乘',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要计算其阶乘的非负数。 如果 number 不是整数，将被截尾取整。' },
        },
    },
    FACTDOUBLE: {
        description: '返回数字的双倍阶乘',
        abstract: '返回数字的双倍阶乘',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要计算其双倍阶乘的非负数。 如果 number 不是整数，将被截尾取整。' },
        },
    },
    FLOOR: {
        description: '向绝对值减小的方向舍入数字',
        abstract: '向绝对值减小的方向舍入数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
            significance: { name: '倍数', detail: '要舍入到的倍数。' },
        },
    },
    FLOOR_MATH: {
        description: '将数字向下舍入为最接近的整数或最接近的指定基数的倍数',
        abstract: '将数字向下舍入为最接近的整数或最接近的指定基数的倍数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
            significance: { name: '倍数', detail: '要舍入到的倍数。' },
            mode: { name: '众数', detail: '对于负数，控制数值是舍入为零还是从零舍入。' },
        },
    },
    FLOOR_PRECISE: {
        description: '将数字向下舍入为最接近的整数或最接近的指定基数的倍数。 无论该数字的符号如何，该数字都向下舍入。',
        abstract: '将数字向下舍入为最接近的整数或最接近的指定基数的倍数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
            significance: { name: '倍数', detail: '要舍入到的倍数。' },
        },
    },
    GCD: {
        description: '返回最大公约数',
        abstract: '返回最大公约数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '用于计算的第一项数值或范围。' },
            number2: { name: '数值2', detail: '用于计算的其他数值或范围。' },
        },
    },
    INT: {
        description: '将数字向下舍入到最接近的整数',
        abstract: '将数字向下舍入到最接近的整数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '需要进行向下舍入取整的实数。' },
        },
    },
    ISO_CEILING: {
        description: '返回一个数字，该数字向上舍入为最接近的整数或最接近的有效位的倍数',
        abstract: '返回一个数字，该数字向上舍入为最接近的整数或最接近的有效位的倍数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
            significance: { name: '倍数', detail: '要舍入到的倍数。' },
        },
    },
    LCM: {
        description: '返回最小公倍数',
        abstract: '返回最小公倍数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '用于计算的第一项数值或范围。' },
            number2: { name: '数值2', detail: '用于计算的其他数值或范围。' },
        },
    },
    LN: {
        description: '返回数字的自然对数',
        abstract: '返回数字的自然对数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '想要计算其自然对数的正实数。' },
        },
    },
    LOG: {
        description: '返回数字的以指定底为底的对数',
        abstract: '返回数字的以指定底为底的对数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '想要计算其对数的正实数。' },
            base: { name: '底数', detail: '对数的底数。 如果省略 base，则假定其值为 10。' },
        },
    },
    LOG10: {
        description: '返回数字的以 10 为底的对数',
        abstract: '返回数字的以 10 为底的对数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '想要计算其以 10 为底的对数的正实数。' },
        },
    },
    MDETERM: {
        description: '返回数组的矩阵行列式的值',
        abstract: '返回数组的矩阵行列式的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '行数和列数相等的数值数组。' },
        },
    },
    MINVERSE: {
        description: '返回数组的逆矩阵',
        abstract: '返回数组的逆矩阵',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '行数和列数相等的数值数组。' },
        },
    },
    MMULT: {
        description: '返回两个数组的矩阵乘积',
        abstract: '返回两个数组的矩阵乘积',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: '数组1', detail: '要进行矩阵乘法运算的两个数组。' },
            array2: { name: '数组2', detail: '要进行矩阵乘法运算的两个数组。' },
        },
    },
    MOD: {
        description: '返回两数相除的余数。 结果的符号与除数相同。',
        abstract: '返回除法的余数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要计算余数的被除数' },
            divisor: { name: '除数', detail: '除数' },
        },
    },
    MROUND: {
        description: '返回一个舍入到所需倍数的数字',
        abstract: '返回一个舍入到所需倍数的数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要四舍五入的数字。' },
            multiple: { name: '倍数', detail: '要舍入到的倍数。' },
        },
    },
    MULTINOMIAL: {
        description: '返回一组数字的多项式',
        abstract: '返回一组数字的多项式',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '用于计算的第一项数值或范围。' },
            number2: { name: '数值2', detail: '用于计算的其他数值或范围。' },
        },
    },
    MUNIT: {
        description: '返回单位矩阵或指定维度',
        abstract: '返回单位矩阵或指定维度',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: '维度', detail: '是一个整数，用于指定要返回的单位矩阵的维度。 它返回一个数组。 维度必须大于零。' },
        },
    },
    ODD: {
        description: '将数字向上舍入为最接近的奇数',
        abstract: '将数字向上舍入为最接近的奇数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要舍入的值。' },
        },
    },
    PI: {
        description: '返回 pi 的值',
        abstract: '返回 pi 的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: '返回数字乘幂的结果。',
        abstract: '返回数的乘幂',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '基数。可为任意实数。' },
            power: { name: '指数', detail: '基数乘幂运算的指数。' },
        },
    },
    PRODUCT: {
        description: '将作为参数提供的所有数字相乘，并返回乘积。',
        abstract: '将其参数相乘',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值 1', detail: '要相乘的第一个数字或范围。' },
            number2: { name: '数值 2', detail: '要相乘的其他数字或单元格区域，最多可以使用 255 个参数。' },
        },
    },
    QUOTIENT: {
        description: '返回除法的整数部分',
        abstract: '返回除法的整数部分',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: '分子', detail: '被除数。' },
            denominator: { name: '分母', detail: '除数。' },
        },
    },
    RADIANS: {
        description: '将度转换为弧度',
        abstract: '将度转换为弧度',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: '角度', detail: '要转换的以度数表示的角度。' },
        },
    },
    RAND: {
        description: '返回 0 和 1 之间的一个随机数',
        abstract: '返回 0 和 1 之间的一个随机数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'RANDARRAY 函数返回 0 和 1 之间的随机数字数组。但是，你可以指定要填充的行数和列数、最小值和最大值，以及是否返回整个数字或小数值。',
        abstract: 'RANDARRAY 函数返回 0 和 1 之间的随机数字数组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: '行数', detail: '要返回的行数' },
            columns: { name: '列数', detail: '要返回的列数' },
            min: { name: '最小值', detail: '想返回的最小数值' },
            max: { name: '最大值', detail: '想返回的最大数值' },
            wholeNumber: { name: '整数', detail: '返回整数或十进制值' },
        },
    },
    RANDBETWEEN: {
        description: '返回位于两个指定数之间的一个随机数',
        abstract: '返回位于两个指定数之间的一个随机数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: '最小值', detail: '将返回的最小整数。' },
            top: { name: '最大值', detail: '将返回的最大整数。' },
        },
    },
    ROMAN: {
        description: '将阿拉伯数字转换为文本式罗马数字',
        abstract: '将阿拉伯数字转换为文本式罗马数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '需要转换的阿拉伯数字。' },
            form: { name: '形式', detail: '指定所需罗马数字类型的数字。 罗马数字样式的范围从经典到简化，随着形式值的增加，会变得更加简洁。' },
        },
    },
    ROUND: {
        description: '将数字按指定位数舍入',
        abstract: '将数字按指定位数舍入',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要四舍五入的数字。' },
            numDigits: { name: '位数', detail: '要进行四舍五入运算的位数。' },
        },
    },
    ROUNDBANK: {
        description: '通过“四舍六入五成双”舍入数字',
        abstract: '通过“四舍六入五成双”舍入数字',
        links: [
            {
                title: '教学',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要“四舍六入五成双”的数字。' },
            numDigits: { name: '位数', detail: '要进行“四舍六入五成双”运算的位数。' },
        },
    },
    ROUNDDOWN: {
        description: '向绝对值减小的方向舍入数字',
        abstract: '向绝对值减小的方向舍入数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要四舍五入的数字。' },
            numDigits: { name: '位数', detail: '要进行四舍五入运算的位数。' },
        },
    },
    ROUNDUP: {
        description: '向绝对值增大的方向舍入数字',
        abstract: '向绝对值增大的方向舍入数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要四舍五入的数字。' },
            numDigits: { name: '位数', detail: '要进行四舍五入运算的位数。' },
        },
    },
    SEC: {
        description: '返回角度的正割值',
        abstract: '返回角度的正割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '数值是需要其正割值的角度（以弧度为单位）。' },
        },
    },
    SECH: {
        description: '返回角度的双曲正割值',
        abstract: '返回角度的双曲正割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '数值是需要其双曲正割值的角度（以弧度为单位）。' },
        },
    },
    SERIESSUM: {
        description: '返回基于公式的幂级数的和',
        abstract: '返回基于公式的幂级数的和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '幂级数的输入值。' },
            n: { name: 'n', detail: 'x 的首项乘幂。' },
            m: { name: 'm', detail: '级数中每一项的乘幂 n 的步长增加值。' },
            coefficients: { name: '系数', detail: '与 x 的每个连续乘幂相乘的一组系数。' },
        },
    },
    SEQUENCE: {
        description: 'SEQUENCE 函数可在数组中生成一系列连续数字，例如，1、2、3、4。',
        abstract: 'SEQUENCE 函数可在数组中生成一系列连续数字，例如，1、2、3、4。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: '行数', detail: '要返回的行数。' },
            columns: { name: '列数', detail: '要返回的列数。' },
            start: { name: '起始数字', detail: '序列中第一个数字。' },
            step: { name: '递增值', detail: '数组中每个连续值递增的值。' },
        },
    },
    SIGN: {
        description: '返回数字的符号',
        abstract: '返回数字的符号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '任意实数。' },
        },
    },
    SIN: {
        description: '返回给定角度的正弦值',
        abstract: '返回给定角度的正弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '需要求正弦的角度，以弧度表示。' },
        },
    },
    SINH: {
        description: '返回数字的双曲正弦值',
        abstract: '返回数字的双曲正弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '任意实数。' },
        },
    },
    SQRT: {
        description: '返回正平方根',
        abstract: '返回正平方根',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要计算其平方根的数字。' },
        },
    },
    SQRTPI: {
        description: '返回某数与 pi 的乘积的平方根',
        abstract: '返回某数与 pi 的乘积的平方根',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '与 pi 相乘的数。' },
        },
    },
    SUBTOTAL: {
        description: '返回列表或数据库中的分类汇总。',
        abstract: '返回列表或数据库中的分类汇总',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: '函数编号', detail: '数字 1-11 或 101-111，用于指定要为分类汇总使用的函数。 如果使用 1-11，将包括手动隐藏的行，如果使用 101-111，则排除手动隐藏的行；始终排除已筛选掉的单元格。' },
            ref1: { name: '引用1', detail: '要对其进行分类汇总计算的第一个命名区域或引用。' },
            ref2: { name: '引用2', detail: '要对其进行分类汇总计算的第 2 个至第 254 个命名区域或引用。' },
        },
    },
    SUM: {
        description: '将单个值、单元格引用或是区域相加，或者将三者的组合相加。',
        abstract: '求参数的和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: {
                name: '数值 1',
                detail: '要相加的第一个数字。 该数字可以是 4 之类的数字，B6 之类的单元格引用或 B2:B8 之类的单元格范围。',
            },
            number2: {
                name: '数值 2',
                detail: '这是要相加的第二个数字。 可以按照这种方式最多指定 255 个数字。',
            },
        },
    },
    SUMIF: {
        description: '对范围中符合指定条件的值求和。',
        abstract: '按给定条件对指定单元格求和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: {
                name: '范围',
                detail: '要根据条件进行检测的范围。',
            },
            criteria: {
                name: '条件',
                detail: '以数字、表达式、单元格引用、文本或函数的形式来定义将添加哪些单元格。可包括的通配符字符 - 问号（？）以匹配任意单个字符，星号（*）以匹配任意字符序列。 如果要查找实际的问号或星号，请在该字符前键入波形符（~）。',
            },
            sumRange: {
                name: '求和范围',
                detail: '要添加的实际单元格，如果要添加在范围参数指定以外的其他单元格。 如果省略sum_range参数，Excel就会添加范围参数中指定的单元格（与应用标准的单元格相同）。',
            },
        },
    },
    SUMIFS: {
        description: '用于计算其满足多个条件的全部参数的总量。',
        abstract: '用于计算其满足多个条件的全部参数的总量。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: '求和范围', detail: '要求和的单元格区域。' },
            criteriaRange1: { name: '条件范围 1', detail: '使用条件 1 测试的区域。条件范围 1 和条件 1 设置用于搜索某个区域是否符合特定条件的搜索对。 一旦在该区域中找到了项，将计算求和范围中的相应值的和。' },
            criteria1: { name: '条件 1', detail: '定义将计算条件范围 1 中的哪些单元格的和的条件。 例如，可以将条件输入为 32、">32"、B4、"苹果" 或 "32"。' },
            criteriaRange2: { name: '条件范围 2', detail: '附加的区域，最多可以输入 127 个区域。' },
            criteria2: { name: '条件 2', detail: '附加的关联条件，最多可以输入 127 个条件。' },
        },
    },
    SUMPRODUCT: {
        description: '返回对应的数组元素的乘积和',
        abstract: '返回对应的数组元素的乘积和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: '数组', detail: '其相应元素需要进行相乘并求和的第一个数组参数。' },
            array2: { name: '数组', detail: '2 到 255 个数组参数，其相应元素需要进行相乘并求和。' },
        },
    },
    SUMSQ: {
        description: '返回参数的平方和',
        abstract: '返回参数的平方和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '要对其求平方和第1个数字，也可以用单一数组或对某个数组的引用来代替用逗号分隔的参数。' },
            number2: { name: '数值2', detail: '要对其求平方和的第2个数字。可以按照这种方式最多指定255个数字。' },
        },
    },
    SUMX2MY2: {
        description: '返回两数组中对应值平方差之和',
        abstract: '返回两数组中对应值平方差之和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: '数组1', detail: '第一个数组或数值区域。' },
            arrayY: { name: '数组2', detail: '第二个数组或数值区域。' },
        },
    },
    SUMX2PY2: {
        description: '返回两数组中对应值的平方和之和',
        abstract: '返回两数组中对应值的平方和之和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: '数组1', detail: '第一个数组或数值区域。' },
            arrayY: { name: '数组2', detail: '第二个数组或数值区域。' },
        },
    },
    SUMXMY2: {
        description: '返回两个数组中对应值差的平方和',
        abstract: '返回两个数组中对应值差的平方和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: '数组1', detail: '第一个数组或数值区域。' },
            arrayY: { name: '数组2', detail: '第二个数组或数值区域。' },
        },
    },
    TAN: {
        description: '返回数字的正切值。',
        abstract: '返回数字的正切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要求正切的角度，以弧度表示。' },
        },
    },
    TANH: {
        description: '返回数字的双曲正切值。',
        abstract: '返回数字的双曲正切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '任意实数。' },
        },
    },
    TRUNC: {
        description: '将数字截尾取整',
        abstract: '将数字截尾取整',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '需要截尾取整的数字。' },
            numDigits: { name: '位数', detail: '用于指定取整精度的数字。num_digits 的默认值为 0（零）。' },
        },
    },
};

export default locale;
