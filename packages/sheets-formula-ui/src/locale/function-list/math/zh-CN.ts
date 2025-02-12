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

export default {
    ABS: {
        description: '返回数字的绝对值。一个数字的绝对值是该数字不带其符号的形式。',
        abstract: '返回数字的绝对值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/abs-%E5%87%BD%E6%95%B0-3420200f-5628-4e8c-99da-c99d7c87713c',
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
                url: 'https://support.microsoft.com/zh-cn/office/acos-%E5%87%BD%E6%95%B0-cb73173f-d089-4582-afa1-76e5524b5d5b',
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
                url: 'https://support.microsoft.com/zh-cn/office/acosh-%E5%87%BD%E6%95%B0-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
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
                url: 'https://support.microsoft.com/zh-cn/office/acot-%E5%87%BD%E6%95%B0-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
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
                url: 'https://support.microsoft.com/zh-cn/office/acoth-%E5%87%BD%E6%95%B0-cc49480f-f684-4171-9fc5-73e4e852300f',
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
                url: 'https://support.microsoft.com/zh-cn/office/aggregate-%E5%87%BD%E6%95%B0-43b9278e-6aa7-4f17-92b6-e19993fa26df',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ARABIC: {
        description: '将罗马数字转换为阿拉伯数字',
        abstract: '将罗马数字转换为阿拉伯数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/arabic-%E5%87%BD%E6%95%B0-9a8da418-c17b-4ef9-a657-9370a30a674f',
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
                url: 'https://support.microsoft.com/zh-cn/office/asin-%E5%87%BD%E6%95%B0-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
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
                url: 'https://support.microsoft.com/zh-cn/office/asinh-%E5%87%BD%E6%95%B0-4e00475a-067a-43cf-926a-765b0249717c',
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
                url: 'https://support.microsoft.com/zh-cn/office/atan-%E5%87%BD%E6%95%B0-50746fa8-630a-406b-81d0-4a2aed395543',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '所求角度的正切值。' },
        },
    },
    ATAN2: {
        description: '返回 X 和 Y 坐标的反正切值。',
        abstract: '返回 X 和 Y 坐标的反正切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/atan2-%E5%87%BD%E6%95%B0-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'x 坐标', detail: '点的 x 坐标。' },
            yNum: { name: 'y 坐标', detail: '点的 y 坐标。' },
        },
    },
    ATANH: {
        description: '返回数字的反双曲正切值。',
        abstract: '返回数字的反双曲正切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/atanh-%E5%87%BD%E6%95%B0-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '-1 到 1 之间的任意实数。' },
        },
    },
    BASE: {
        description: '将一个数转换为具有给定基数的文本表示',
        abstract: '将一个数转换为具有给定基数的文本表示',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/base-%E5%87%BD%E6%95%B0-2ef61411-aee9-4f29-a811-1c42456c6342',
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
                url: 'https://support.microsoft.com/zh-cn/office/ceiling-%E5%87%BD%E6%95%B0-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
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
                url: 'https://support.microsoft.com/zh-cn/office/ceiling-math-%E5%87%BD%E6%95%B0-80f95d2f-b499-4eee-9f16-f795a8e306c8',
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
                url: 'https://support.microsoft.com/zh-cn/office/ceiling-precise-%E5%87%BD%E6%95%B0-f366a774-527a-4c92-ba49-af0a196e66cb',
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
                url: 'https://support.microsoft.com/zh-cn/office/combin-%E5%87%BD%E6%95%B0-12a3f276-0a21-423a-8de6-06990aaf638a',
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
                url: 'https://support.microsoft.com/zh-cn/office/combina-%E5%87%BD%E6%95%B0-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
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
                url: 'https://support.microsoft.com/zh-cn/office/cos-%E5%87%BD%E6%95%B0-0fb808a5-95d6-4553-8148-22aebdce5f05',
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
                url: 'https://support.microsoft.com/zh-cn/office/cosh-%E5%87%BD%E6%95%B0-e460d426-c471-43e8-9540-a57ff3b70555',
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
                url: 'https://support.microsoft.com/zh-cn/office/cot-%E5%87%BD%E6%95%B0-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
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
                url: 'https://support.microsoft.com/zh-cn/office/coth-%E5%87%BD%E6%95%B0-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
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
                url: 'https://support.microsoft.com/zh-cn/office/csc-%E5%87%BD%E6%95%B0-07379361-219a-4398-8675-07ddc4f135c1',
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
                url: 'https://support.microsoft.com/zh-cn/office/csch-%E5%87%BD%E6%95%B0-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
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
                url: 'https://support.microsoft.com/zh-cn/office/decimal-%E5%87%BD%E6%95%B0-ee554665-6176-46ef-82de-0a283658da2e',
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
                url: 'https://support.microsoft.com/zh-cn/office/degrees-%E5%87%BD%E6%95%B0-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
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
                url: 'https://support.microsoft.com/zh-cn/office/even-%E5%87%BD%E6%95%B0-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
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
                url: 'https://support.microsoft.com/zh-cn/office/exp-%E5%87%BD%E6%95%B0-c578f034-2c45-4c37-bc8c-329660a63abe',
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
                url: 'https://support.microsoft.com/zh-cn/office/fact-%E5%87%BD%E6%95%B0-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
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
                url: 'https://support.microsoft.com/zh-cn/office/factdouble-%E5%87%BD%E6%95%B0-e67697ac-d214-48eb-b7b7-cce2589ecac8',
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
                url: 'https://support.microsoft.com/zh-cn/office/floor-%E5%87%BD%E6%95%B0-14bb497c-24f2-4e04-b327-b0b4de5a8886',
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
                url: 'https://support.microsoft.com/zh-cn/office/floor-math-%E5%87%BD%E6%95%B0-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
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
                url: 'https://support.microsoft.com/zh-cn/office/floor-precise-%E5%87%BD%E6%95%B0-f769b468-1452-4617-8dc3-02f842a0702e',
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
                url: 'https://support.microsoft.com/zh-cn/office/gcd-%E5%87%BD%E6%95%B0-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
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
                url: 'https://support.microsoft.com/zh-cn/office/int-%E5%87%BD%E6%95%B0-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
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
                url: 'https://support.microsoft.com/zh-cn/office/iso-ceiling-%E5%87%BD%E6%95%B0-e587bb73-6cc2-4113-b664-ff5b09859a83',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LCM: {
        description: '返回最小公倍数',
        abstract: '返回最小公倍数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lcm-%E5%87%BD%E6%95%B0-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '用于计算的第一项数值或范围。' },
            number2: { name: '数值2', detail: '用于计算的其他数值或范围。' },
        },
    },
    LET: {
        description: '将名称分配给计算结果，以允许将中间计算、值或定义名称存储在公式内',
        abstract: '将名称分配给计算结果，以允许将中间计算、值或定义名称存储在公式内',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/let-%E5%87%BD%E6%95%B0-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LN: {
        description: '返回数字的自然对数',
        abstract: '返回数字的自然对数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ln-%E5%87%BD%E6%95%B0-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
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
                url: 'https://support.microsoft.com/zh-cn/office/log-%E5%87%BD%E6%95%B0-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
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
                url: 'https://support.microsoft.com/zh-cn/office/log10-%E5%87%BD%E6%95%B0-c75b881b-49dd-44fb-b6f4-37e3486a0211',
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
                url: 'https://support.microsoft.com/zh-cn/office/mdeterm-%E5%87%BD%E6%95%B0-e7bfa857-3834-422b-b871-0ffd03717020',
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
                url: 'https://support.microsoft.com/zh-cn/office/minverse-%E5%87%BD%E6%95%B0-11f55086-adde-4c9f-8eb9-59da2d72efc6',
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
                url: 'https://support.microsoft.com/zh-cn/office/mmult-%E5%87%BD%E6%95%B0-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
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
                url: 'https://support.microsoft.com/zh-cn/office/mod-%E5%87%BD%E6%95%B0-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
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
                url: 'https://support.microsoft.com/zh-cn/office/mround-%E5%87%BD%E6%95%B0-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
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
                url: 'https://support.microsoft.com/zh-cn/office/multinomial-%E5%87%BD%E6%95%B0-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
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
                url: 'https://support.microsoft.com/zh-cn/office/munit-%E5%87%BD%E6%95%B0-c9fe916a-dc26-4105-997d-ba22799853a3',
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
                url: 'https://support.microsoft.com/zh-cn/office/odd-%E5%87%BD%E6%95%B0-deae64eb-e08a-4c88-8b40-6d0b42575c98',
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
                url: 'https://support.microsoft.com/zh-cn/office/pi-%E5%87%BD%E6%95%B0-264199d0-a3ba-46b8-975a-c4a04608989b',
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
                url: 'https://support.microsoft.com/zh-cn/office/power-%E5%87%BD%E6%95%B0-d3f2908b-56f4-4c3f-895a-07fb519c362a',
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
                url: 'https://support.microsoft.com/zh-cn/office/product-%E5%87%BD%E6%95%B0-8e6b5b24-90ee-4650-aeec-80982a0512ce',
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
                url: 'https://support.microsoft.com/zh-cn/office/quotient-%E5%87%BD%E6%95%B0-9f7bf099-2a18-4282-8fa4-65290cc99dee',
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
                url: 'https://support.microsoft.com/zh-cn/office/radians-%E5%87%BD%E6%95%B0-ac409508-3d48-45f5-ac02-1497c92de5bf',
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
                url: 'https://support.microsoft.com/zh-cn/office/rand-%E5%87%BD%E6%95%B0-4cbfa695-8869-4788-8d90-021ea9f5be73',
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
                url: 'https://support.microsoft.com/zh-cn/office/randarray-%E5%87%BD%E6%95%B0-21261e55-3bec-4885-86a6-8b0a47fd4d33',
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
                url: 'https://support.microsoft.com/zh-cn/office/randbetween-%E5%87%BD%E6%95%B0-4cc7f0d1-87dc-4eb7-987f-a469ab381685',
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
                url: 'https://support.microsoft.com/zh-cn/office/roman-%E5%87%BD%E6%95%B0-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
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
                url: 'https://support.microsoft.com/zh-cn/office/round-%E5%87%BD%E6%95%B0-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
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
                url: 'https://support.microsoft.com/zh-cn/office/rounddown-%E5%87%BD%E6%95%B0-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
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
                url: 'https://support.microsoft.com/zh-cn/office/roundup-%E5%87%BD%E6%95%B0-f8bc9b23-e795-47db-8703-db171d0c42a7',
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
                url: 'https://support.microsoft.com/zh-cn/office/sec-%E5%87%BD%E6%95%B0-ff224717-9c87-4170-9b58-d069ced6d5f7',
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
                url: 'https://support.microsoft.com/zh-cn/office/sech-%E5%87%BD%E6%95%B0-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
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
                url: 'https://support.microsoft.com/zh-cn/office/seriessum-%E5%87%BD%E6%95%B0-a3ab25b5-1093-4f5b-b084-96c49087f637',
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
                url: 'https://support.microsoft.com/zh-cn/office/sequence-%E5%87%BD%E6%95%B0-57467a98-57e0-4817-9f14-2eb78519ca90',
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
                url: 'https://support.microsoft.com/zh-cn/office/sign-%E5%87%BD%E6%95%B0-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
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
                url: 'https://support.microsoft.com/zh-cn/office/sin-%E5%87%BD%E6%95%B0-cf0e3432-8b9e-483c-bc55-a76651c95602',
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
                url: 'https://support.microsoft.com/zh-cn/office/sinh-%E5%87%BD%E6%95%B0-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7',
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
                url: 'https://support.microsoft.com/zh-cn/office/sqrt-%E5%87%BD%E6%95%B0-654975c2-05c4-4831-9a24-2c65e4040fdf',
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
                url: 'https://support.microsoft.com/zh-cn/office/sqrtpi-%E5%87%BD%E6%95%B0-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
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
                url: 'https://support.microsoft.com/zh-cn/office/subtotal-%E5%87%BD%E6%95%B0-7b027003-f060-4ade-9040-e478765b9939',
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
                url: 'https://support.microsoft.com/zh-cn/office/sum-%E5%87%BD%E6%95%B0-043e1c7d-7726-4e80-8f32-07b23e057f89',
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
                url: 'https://support.microsoft.com/zh-cn/office/sumif-%E5%87%BD%E6%95%B0-169b8c99-c05c-4483-a712-1697a653039b',
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
                url: 'https://support.microsoft.com/zh-cn/office/sumifs-%E5%87%BD%E6%95%B0-c9e748f5-7ea7-455d-9406-611cebce642b',
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
                url: 'https://support.microsoft.com/zh-cn/office/sumproduct-%E5%87%BD%E6%95%B0-16753e75-9f68-4874-94ac-4d2145a2fd2e',
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
                url: 'https://support.microsoft.com/zh-cn/office/sumsq-%E5%87%BD%E6%95%B0-e3313c02-51cc-4963-aae6-31442d9ec307',
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
                url: 'https://support.microsoft.com/zh-cn/office/sumx2my2-%E5%87%BD%E6%95%B0-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
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
                url: 'https://support.microsoft.com/zh-cn/office/sumx2py2-%E5%87%BD%E6%95%B0-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
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
                url: 'https://support.microsoft.com/zh-cn/office/sumxmy2-%E5%87%BD%E6%95%B0-9d144ac1-4d79-43de-b524-e2ecee23b299',
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
                url: 'https://support.microsoft.com/zh-cn/office/tan-%E5%87%BD%E6%95%B0-08851a40-179f-4052-b789-d7f699447401',
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
                url: 'https://support.microsoft.com/zh-cn/office/tanh-%E5%87%BD%E6%95%B0-017222f0-a0c3-4f69-9787-b3202295dc6c',
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
                url: 'https://support.microsoft.com/zh-cn/office/trunc-%E5%87%BD%E6%95%B0-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '需要截尾取整的数字。' },
            numDigits: { name: '位数', detail: '用于指定取整精度的数字。num_digits 的默认值为 0（零）。' },
        },
    },
};
