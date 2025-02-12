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
    BESSELI: {
        description: '返回修正的贝赛耳函数 In(x)',
        abstract: '返回修正的贝赛耳函数 In(x)',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/besseli-%E5%87%BD%E6%95%B0-8d33855c-9a8d-444b-98e0-852267b1c0df',
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
                url: 'https://support.microsoft.com/zh-cn/office/besselj-%E5%87%BD%E6%95%B0-839cb181-48de-408b-9d80-bd02982d94f7',
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
                url: 'https://support.microsoft.com/zh-cn/office/besselk-%E5%87%BD%E6%95%B0-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
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
                url: 'https://support.microsoft.com/zh-cn/office/bessely-%E5%87%BD%E6%95%B0-f3a356b3-da89-42c3-8974-2da54d6353a2',
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
                url: 'https://support.microsoft.com/zh-cn/office/bin2dec-%E5%87%BD%E6%95%B0-63905b57-b3a0-453d-99f4-647bb519cd6c',
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
                url: 'https://support.microsoft.com/zh-cn/office/bin2hex-%E5%87%BD%E6%95%B0-0375e507-f5e5-4077-9af8-28d84f9f41cc',
            },
        ],
        functionParameter: {
            number: { name: '二进制数', detail: '要转换的二进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    BIN2OCT: {
        description: '将二进制数转换为八进制数',
        abstract: '将二进制数转换为八进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/bin2oct-%E5%87%BD%E6%95%B0-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
            },
        ],
        functionParameter: {
            number: { name: '二进制数', detail: '要转换的二进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
    BITAND: {
        description: '返回两个数的“按位与”',
        abstract: '返回两个数的“按位与”',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/bitand-%E5%87%BD%E6%95%B0-8a2be3d7-91c3-4b48-9517-64548008563a',
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
                url: 'https://support.microsoft.com/zh-cn/office/bitlshift-%E5%87%BD%E6%95%B0-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
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
                url: 'https://support.microsoft.com/zh-cn/office/bitor-%E5%87%BD%E6%95%B0-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
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
                url: 'https://support.microsoft.com/zh-cn/office/bitrshift-%E5%87%BD%E6%95%B0-274d6996-f42c-4743-abdb-4ff95351222c',
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
                url: 'https://support.microsoft.com/zh-cn/office/bitxor-%E5%87%BD%E6%95%B0-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
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
                url: 'https://support.microsoft.com/zh-cn/office/complex-%E5%87%BD%E6%95%B0-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
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
                url: 'https://support.microsoft.com/zh-cn/office/convert-%E5%87%BD%E6%95%B0-d785bef1-808e-4aac-bdcd-666c810f9af2',
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
                url: 'https://support.microsoft.com/zh-cn/office/dec2bin-%E5%87%BD%E6%95%B0-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
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
                url: 'https://support.microsoft.com/zh-cn/office/dec2hex-%E5%87%BD%E6%95%B0-6344ee8b-b6b5-4c6a-a672-f64666704619',
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
                url: 'https://support.microsoft.com/zh-cn/office/dec2oct-%E5%87%BD%E6%95%B0-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
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
                url: 'https://support.microsoft.com/zh-cn/office/delta-%E5%87%BD%E6%95%B0-2f763672-c959-4e07-ac33-fe03220ba432',
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
                url: 'https://support.microsoft.com/zh-cn/office/erf-%E5%87%BD%E6%95%B0-c53c7e7b-5482-4b6c-883e-56df3c9af349',
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
                url: 'https://support.microsoft.com/zh-cn/office/erf-precise-%E5%87%BD%E6%95%B0-9a349593-705c-4278-9a98-e4122831a8e0',
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
                url: 'https://support.microsoft.com/zh-cn/office/erfc-%E5%87%BD%E6%95%B0-736e0318-70ba-4e8b-8d08-461fe68b71b3',
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
                url: 'https://support.microsoft.com/zh-cn/office/erfc-precise-%E5%87%BD%E6%95%B0-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
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
                url: 'https://support.microsoft.com/zh-cn/office/gestep-%E5%87%BD%E6%95%B0-f37e7d2a-41da-4129-be95-640883fca9df',
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
                url: 'https://support.microsoft.com/zh-cn/office/hex2bin-%E5%87%BD%E6%95%B0-a13aafaa-5737-4920-8424-643e581828c1',
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
                url: 'https://support.microsoft.com/zh-cn/office/hex2dec-%E5%87%BD%E6%95%B0-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
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
                url: 'https://support.microsoft.com/zh-cn/office/hex2oct-%E5%87%BD%E6%95%B0-54d52808-5d19-4bd0-8a63-1096a5d11912',
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
                url: 'https://support.microsoft.com/zh-cn/office/imabs-%E5%87%BD%E6%95%B0-b31e73c6-d90c-4062-90bc-8eb351d765a1',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其绝对值的复数。' },
        },
    },
    IMAGINARY: {
        description: '返回复数的虚系数',
        abstract: '返回复数的虚系数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/imaginary-%E5%87%BD%E6%95%B0-dd5952fd-473d-44d9-95a1-9a17b23e428a',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其虚系数的复数。' },
        },
    },
    IMARGUMENT: {
        description: '返回参数 theta，即以弧度表示的角',
        abstract: '返回参数 theta，即以弧度表示的角',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/imargument-%E5%87%BD%E6%95%B0-eed37ec1-23b3-4f59-b9f3-d340358a034a',
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
                url: 'https://support.microsoft.com/zh-cn/office/imconjugate-%E5%87%BD%E6%95%B0-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
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
                url: 'https://support.microsoft.com/zh-cn/office/imcos-%E5%87%BD%E6%95%B0-dad75277-f592-4a6b-ad6c-be93a808a53c',
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
                url: 'https://support.microsoft.com/zh-cn/office/imcosh-%E5%87%BD%E6%95%B0-053e4ddb-4122-458b-be9a-457c405e90ff',
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
                url: 'https://support.microsoft.com/zh-cn/office/imcot-%E5%87%BD%E6%95%B0-dc6a3607-d26a-4d06-8b41-8931da36442c',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其余切值的复数。' },
        },
    },
    IMCOTH: {
        description: '返回复数的双曲余切值',
        abstract: '返回复数的双曲余切值',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9366256?hl=zh-Hans&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其双曲余切值的复数。' },
        },
    },
    IMCSC: {
        description: '返回复数的余割值',
        abstract: '返回复数的余割值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/imcsc-%E5%87%BD%E6%95%B0-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
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
                url: 'https://support.microsoft.com/zh-cn/office/imcsch-%E5%87%BD%E6%95%B0-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
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
                url: 'https://support.microsoft.com/zh-cn/office/imdiv-%E5%87%BD%E6%95%B0-a505aff7-af8a-4451-8142-77ec3d74d83f',
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
                url: 'https://support.microsoft.com/zh-cn/office/imexp-%E5%87%BD%E6%95%B0-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
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
                url: 'https://support.microsoft.com/zh-cn/office/imln-%E5%87%BD%E6%95%B0-32b98bcf-8b81-437c-a636-6fb3aad509d8',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其自然对数的复数。' },
        },
    },
    IMLOG: {
        description: '返回复数的以特定数为底的对数',
        abstract: '返回复数的以特定数为底的对数',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9366486?hl=zh-Hans&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其以特定数为底的对数的复数。' },
            base: { name: '底数', detail: '用于计算相应对数的底数。' },
        },
    },
    IMLOG10: {
        description: '返回复数的以 10 为底的对数',
        abstract: '返回复数的以 10 为底的对数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/imlog10-%E5%87%BD%E6%95%B0-58200fca-e2a2-4271-8a98-ccd4360213a5',
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
                url: 'https://support.microsoft.com/zh-cn/office/imlog2-%E5%87%BD%E6%95%B0-152e13b4-bc79-486c-a243-e6a676878c51',
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
                url: 'https://support.microsoft.com/zh-cn/office/impower-%E5%87%BD%E6%95%B0-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
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
                url: 'https://support.microsoft.com/zh-cn/office/improduct-%E5%87%BD%E6%95%B0-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
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
                url: 'https://support.microsoft.com/zh-cn/office/imreal-%E5%87%BD%E6%95%B0-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
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
                url: 'https://support.microsoft.com/zh-cn/office/imsec-%E5%87%BD%E6%95%B0-6df11132-4411-4df4-a3dc-1f17372459e0',
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
                url: 'https://support.microsoft.com/zh-cn/office/imsech-%E5%87%BD%E6%95%B0-f250304f-788b-4505-954e-eb01fa50903b',
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
                url: 'https://support.microsoft.com/zh-cn/office/imsin-%E5%87%BD%E6%95%B0-1ab02a39-a721-48de-82ef-f52bf37859f6',
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
                url: 'https://support.microsoft.com/zh-cn/office/imsinh-%E5%87%BD%E6%95%B0-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
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
                url: 'https://support.microsoft.com/zh-cn/office/imsqrt-%E5%87%BD%E6%95%B0-e1753f80-ba11-4664-a10e-e17368396b70',
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
                url: 'https://support.microsoft.com/zh-cn/office/imsub-%E5%87%BD%E6%95%B0-2e404b4d-4935-4e85-9f52-cb08b9a45054',
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
                url: 'https://support.microsoft.com/zh-cn/office/imsum-%E5%87%BD%E6%95%B0-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
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
                url: 'https://support.microsoft.com/zh-cn/office/imtan-%E5%87%BD%E6%95%B0-8478f45d-610a-43cf-8544-9fc0b553a132',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其正切值的复数。' },
        },
    },
    IMTANH: {
        description: '返回复数的双曲正切值',
        abstract: '返回复数的双曲正切值',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9366655?hl=zh-Hans&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: '复数', detail: '需要计算其双曲正切值的复数。' },
        },
    },
    OCT2BIN: {
        description: '将八进制数转换为二进制数',
        abstract: '将八进制数转换为二进制数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/oct2bin-%E5%87%BD%E6%95%B0-55383471-3c56-4d27-9522-1a8ec646c589',
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
                url: 'https://support.microsoft.com/zh-cn/office/oct2dec-%E5%87%BD%E6%95%B0-87606014-cb98-44b2-8dbb-e48f8ced1554',
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
                url: 'https://support.microsoft.com/zh-cn/office/oct2hex-%E5%87%BD%E6%95%B0-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number: { name: '八进制数', detail: '要转换的八进制数。' },
            places: { name: '字符数', detail: '要使用的字符数。' },
        },
    },
};
