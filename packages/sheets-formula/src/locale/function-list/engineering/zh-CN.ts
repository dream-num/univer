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
    BESSELI: {
        description: '返回修正的贝赛耳函数 In(x)',
        abstract: '返回修正的贝赛耳函数 In(x)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '用来计算函数的值。' },
            n: { name: 'N', detail: '贝赛耳函数的阶数。如果n不是整数，将被截尾取整。' },
        },
    },
    BESSELJ: {
        description: '返回贝赛耳函数 Jn(x)',
        abstract: '返回贝赛耳函数 Jn(x)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '用来计算函数的值。' },
            n: { name: 'N', detail: '贝赛耳函数的阶数。如果n不是整数，将被截尾取整。' },
        },
    },
    BESSELK: {
        description: '返回修正的贝赛耳函数 Kn(x)',
        abstract: '返回修正的贝赛耳函数 Kn(x)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '用来计算函数的值。' },
            n: { name: 'N', detail: '贝赛耳函数的阶数。如果n不是整数，将被截尾取整。' },
        },
    },
    BESSELY: {
        description: '返回贝赛耳函数 Yn(x)',
        abstract: '返回贝赛耳函数 Yn(x)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '用来计算函数的值。' },
            n: { name: 'N', detail: '贝赛耳函数的阶数。如果n不是整数，将被截尾取整。' },
        },
    },
    BIN2DEC: {
        description: '将二进制数转换为十进制数',
        abstract: '将二进制数转换为十进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: '二进制数', detail: '要转换的二进制数。' },
        },
    },
    BIN2HEX: {
        description: '将二进制数转换为十六进制数',
        abstract: '将二进制数转换为十六进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: '二进制数', detail: '要转换的二进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    BIN2OCT: {
        description: '将二进制数转换为八进制数。',
        abstract: '将二进制数转换为八进制数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: '二进制数', detail: '必需。 要转换的二进制数。 Number 包含的字符不能超过 10 个（10 位）。 Number 的最高位为符号位。 其余 9 位是数量位。 负数用二进制补码记数法表示。' },
            places: { name: '字符数', detail: '选。 要使用的字符数。 如果省略 places，BIN2OCT 将使用必需的最小字符数。 Places 可用于在返回的值前置 0（零）。' },
        },
    },
    BITAND: {
        description: '返回两个数的“按位与”',
        abstract: '返回两个数的“按位与”',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '必须为十进制格式且大于等于 0。' },
            number2: { name: '数值2', detail: '必须为十进制格式且大于等于 0。' },
        },
    },
    BITLSHIFT: {
        description: '返回左移 shift_amount 位的计算值接收数',
        abstract: '返回左移 shift_amount 位的计算值接收数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '必须是大于或等于 0 的整数。' },
            shiftAmount: { name: '移位量', detail: '必须为整数。' },
        },
    },
    BITOR: {
        description: '返回两个数的“按位或”',
        abstract: '返回两个数的“按位或”',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '必须为十进制格式且大于等于 0。' },
            number2: { name: '数值2', detail: '必须为十进制格式且大于等于 0。' },
        },
    },
    BITRSHIFT: {
        description: '返回右移 shift_amount 位的计算值接收数',
        abstract: '返回右移 shift_amount 位的计算值接收数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '必须是大于或等于 0 的整数。' },
            shiftAmount: { name: '移位量', detail: '必须为整数。' },
        },
    },
    BITXOR: {
        description: '返回两个数的按位“异或”',
        abstract: '返回两个数的按位“异或”',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '必须为十进制格式且大于等于 0。' },
            number2: { name: '数值2', detail: '必须为十进制格式且大于等于 0。' },
        },
    },
    COMPLEX: {
        description: '将实系数和虚系数转换为复数',
        abstract: '将实系数和虚系数转换为复数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: '实系数', detail: '复数的实系数。' },
            iNum: { name: '虚系数', detail: '复数的虚系数。' },
            suffix: { name: '后缀', detail: '复数中虚系数的后缀。如果省略，则认为它是“i”。' },
        },
    },
    CONVERT: {
        description: '将数字从一种度量系统转换为另一种度量系统',
        abstract: '将数字从一种度量系统转换为另一种度量系统',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '需要进行转换的数值。' },
            fromUnit: { name: '转换前单位', detail: '是数值的单位。' },
            toUnit: { name: '转换后单位', detail: '是结果的单位。' },
        },
    },
    DEC2BIN: {
        description: '将十进制数转换为二进制数',
        abstract: '将十进制数转换为二进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: '十进制数', detail: '要转换的十进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    DEC2HEX: {
        description: '将十进制数转换为十六进制数',
        abstract: '将十进制数转换为十六进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: '十进制数', detail: '要转换的十进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    DEC2OCT: {
        description: '将十进制数转换为八进制数',
        abstract: '将十进制数转换为八进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: '十进制数', detail: '要转换的十进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    DELTA: {
        description: '检验两个值是否相等',
        abstract: '检验两个值是否相等',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: '数值1', detail: '第一个数值。' },
            number2: { name: '数值2', detail: '第二个数值。如果省略，则假设数值2为零。' },
        },
    },
    ERF: {
        description: '返回误差函数',
        abstract: '返回误差函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: '下限', detail: 'ERF函数的积分下限。' },
            upperLimit: { name: '上限', detail: 'ERF函数的积分上限。如果省略，ERF积分将在零到下限之间。' },
        },
    },
    ERF_PRECISE: {
        description: '返回误差函数',
        abstract: '返回误差函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: 'ERF.PRECISE函数的积分下限。' },
        },
    },
    ERFC: {
        description: '返回互补误差函数',
        abstract: '返回互补误差函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: 'ERFC函数的积分下限。' },
        },
    },
    ERFC_PRECISE: {
        description: '返回从 x 到无穷大积分的互补 ERF 函数',
        abstract: '返回从 x 到无穷大积分的互补 ERF 函数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: 'ERFC.PRECISE函数的积分下限。' },
        },
    },
    GESTEP: {
        description: '检验数字是否大于阈值',
        abstract: '检验数字是否大于阈值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要针对阈值进行测试的值。' },
            step: { name: '阈值', detail: '阈值。如果省略阈值，则 GESTEP 使用零。' },
        },
    },
    HEX2BIN: {
        description: '将十六进制数转换为二进制数',
        abstract: '将十六进制数转换为二进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: '十六进制数', detail: '要转换的十六进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    HEX2DEC: {
        description: '将十六进制数转换为十进制数',
        abstract: '将十六进制数转换为十进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: '十六进制数', detail: '要转换的十六进制数。' },
        },
    },
    HEX2OCT: {
        description: '将十六进制数转换为八进制数',
        abstract: '将十六进制数转换为八进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: '十六进制数', detail: '要转换的十六进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    IMABS: {
        description: '返回复数的绝对值（模数）',
        abstract: '返回复数的绝对值（模数）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其绝对值的复数。' },
        },
    },
    IMAGINARY: {
        description: '返回以 x+yi 或 x+yj 文本格式表示的复数的虚系数。',
        abstract: '返回以 x+yi 或 x+yj 文本格式表示的复数的虚系数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '必填。 需要计算其虚系数的复数。' },
        },
    },
    IMARGUMENT: {
        description: '返回参数 theta，即以弧度表示的角',
        abstract: '返回参数 theta，即以弧度表示的角',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '要为其参数 theta 的复数。' },
        },
    },
    IMCONJUGATE: {
        description: '返回复数的共轭复数',
        abstract: '返回复数的共轭复数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其共轭数的复数。' },
        },
    },
    IMCOS: {
        description: '返回复数的余弦',
        abstract: '返回复数的余弦',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其余弦值的复数。' },
        },
    },
    IMCOSH: {
        description: '返回复数的双曲余弦值',
        abstract: '返回复数的双曲余弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其双曲余弦值的复数。' },
        },
    },
    IMCOT: {
        description: '返回复数的余切值',
        abstract: '返回复数的余切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其余切值的复数。' },
        },
    },
    IMCOTH: {
        description: 'IMCOTH 函数返回给定复数的双曲余切值。 例如，给定复数“x+yi”会返回“coth(x+yi)”。',
        abstract: 'IMCOTH 函数返回给定复数的双曲余切值。 例如，给定复数“x+yi”会返回“coth(x+yi)”。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9366256?hl=zh-Hans',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '要计算其双曲余切值的复数。 该数值可以是由 COMPLEX 函数计算得出的结果、实数（可看作虚部等于 0 的复数），或是格式为“x+yi”的字符串（其中 x 和 y 均为数字）。' },
        },
    },
    IMCSC: {
        description: '返回复数的余割值',
        abstract: '返回复数的余割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其余割值的复数。' },
        },
    },
    IMCSCH: {
        description: '返回复数的双曲余割值',
        abstract: '返回复数的双曲余割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其双曲余割值的复数。' },
        },
    },
    IMDIV: {
        description: '返回两个复数的商',
        abstract: '返回两个复数的商',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '复数分子', detail: '复数分子或被除数。' },
            inumber2: { name: '复数分母', detail: '复数分母或除数。' },
        },
    },
    IMEXP: {
        description: '返回复数的指数',
        abstract: '返回复数的指数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其指数的复数。' },
        },
    },
    IMLN: {
        description: '返回复数的自然对数',
        abstract: '返回复数的自然对数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其自然对数的复数。' },
        },
    },
    IMLOG: {
        description: 'IMLOG 函数返回某个复数以特定数为底的对数。',
        abstract: 'IMLOG 函数返回某个复数以特定数为底的对数。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9366486?hl=zh-Hans',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '对数函数的输入值。 数值可以写成普通数字（如 1），可视为实数。 数值也可以写成引用文字，以便指定实系数和复系数。' },
            base: { name: '底数', detail: '用于计算相应对数的底数。 必须为正实数。' },
        },
    },
    IMLOG10: {
        description: '返回复数的以 10 为底的对数',
        abstract: '返回复数的以 10 为底的对数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其常用对数的复数。' },
        },
    },
    IMLOG2: {
        description: '返回复数的以 2 为底的对数',
        abstract: '返回复数的以 2 为底的对数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算以 2 为底数的对数的复数。' },
        },
    },
    IMPOWER: {
        description: '返回复数的整数幂',
        abstract: '返回复数的整数幂',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其幂值的复数。' },
            number: { name: '数值', detail: '需要对复数应用的幂次。' },
        },
    },
    IMPRODUCT: {
        description: '返回多个复数的乘积',
        abstract: '返回多个复数的乘积',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '复数1', detail: '1 到 255 个要相乘的复数。' },
            inumber2: { name: '复数2', detail: '1 到 255 个要相乘的复数。' },
        },
    },
    IMREAL: {
        description: '返回复数的实系数',
        abstract: '返回复数的实系数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其实系数的复数。' },
        },
    },
    IMSEC: {
        description: '返回复数的正割值',
        abstract: '返回复数的正割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其正割值的复数。' },
        },
    },
    IMSECH: {
        description: '返回复数的双曲正割值',
        abstract: '返回复数的双曲正割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其双曲正割值的复数。' },
        },
    },
    IMSIN: {
        description: '返回复数的正弦',
        abstract: '返回复数的正弦',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其正弦值的复数。' },
        },
    },
    IMSINH: {
        description: '返回复数的双曲正弦值',
        abstract: '返回复数的双曲正弦值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其双曲正弦值的复数。' },
        },
    },
    IMSQRT: {
        description: '返回复数的平方根',
        abstract: '返回复数的平方根',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其平方根的复数。' },
        },
    },
    IMSUB: {
        description: '返回两个复数的差',
        abstract: '返回两个复数的差',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '复数1', detail: '复数1。' },
            inumber2: { name: '复数2', detail: '复数2。' },
        },
    },
    IMSUM: {
        description: '返回多个复数的和',
        abstract: '返回多个复数的和',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '复数1', detail: '1 到 255 个要相加的复数。' },
            inumber2: { name: '复数2', detail: '1 到 255 个要相加的复数。' },
        },
    },
    IMTAN: {
        description: '返回复数的正切值',
        abstract: '返回复数的正切值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其正切值的复数。' },
        },
    },
    IMTANH: {
        description: 'IMTANH 函数返回给定复数的双曲正切值。 例如，给定复数“x+yi”会返回“tanh(x+yi)”。',
        abstract: 'IMTANH 函数返回给定复数的双曲正切值。 例如，给定复数“x+yi”会返回“tanh(x+yi)”。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9366655?hl=zh-Hans',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '要计算其双曲正切值的复数。 该数值可以是 COMPLEX 函数计算得出的结果、实数（将被视作虚部等于 0 的复数），或是格式为“x+yi”的字符串（其中 x 和 y 均为数字）。' },
        },
    },
    OCT2BIN: {
        description: '将八进制数转换为二进制数',
        abstract: '将八进制数转换为二进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: '八进制数', detail: '要转换的八进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    OCT2DEC: {
        description: '将八进制数转换为十进制数',
        abstract: '将八进制数转换为十进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: '八进制数', detail: '要转换的八进制数。' },
        },
    },
    OCT2HEX: {
        description: '将八进制数转换为十六进制数',
        abstract: '将八进制数转换为十六进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: '八进制数', detail: '要转换的八进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
};

export default locale;
