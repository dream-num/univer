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
        description: '修正ベッセル関数 In(x) を返します。',
        abstract: '修正ベッセル関数 In(x) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/besseli-%E9%96%A2%E6%95%B0-8d33855c-9a8d-444b-98e0-852267b1c0df',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '関数に代入する値を指定します。' },
            n: { name: 'N', detail: 'ベッセル関数の次数を指定します。n に整数以外の値を指定すると、小数点以下が切り捨てられます。' },
        },
    },
    BESSELJ: {
        description: 'ベッセル関数 Jn(x) を返します。',
        abstract: 'ベッセル関数 Jn(x) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/besselj-%E9%96%A2%E6%95%B0-839cb181-48de-408b-9d80-bd02982d94f7',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '関数に代入する値を指定します。' },
            n: { name: 'N', detail: 'ベッセル関数の次数を指定します。n に整数以外の値を指定すると、小数点以下が切り捨てられます。' },
        },
    },
    BESSELK: {
        description: '修正ベッセル関数 Kn(x) を返します。',
        abstract: '修正ベッセル関数 Kn(x) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/besselk-%E9%96%A2%E6%95%B0-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '関数に代入する値を指定します。' },
            n: { name: 'N', detail: 'ベッセル関数の次数を指定します。n に整数以外の値を指定すると、小数点以下が切り捨てられます。' },
        },
    },
    BESSELY: {
        description: 'ベッセル関数 Yn(x) を返します。',
        abstract: 'ベッセル関数 Yn(x) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bessely-%E9%96%A2%E6%95%B0-f3a356b3-da89-42c3-8974-2da54d6353a2',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '関数に代入する値を指定します。' },
            n: { name: 'N', detail: 'ベッセル関数の次数を指定します。n に整数以外の値を指定すると、小数点以下が切り捨てられます。' },
        },
    },
    BIN2DEC: {
        description: '2 進数を 10 進数に変換します。',
        abstract: '2 進数を 10 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bin2dec-%E9%96%A2%E6%95%B0-63905b57-b3a0-453d-99f4-647bb519cd6c',
            },
        ],
        functionParameter: {
            number: { name: '2 進数', detail: '変換する 2 進数を指定します。' },
        },
    },
    BIN2HEX: {
        description: '2 進数を 16 進数に変換します。',
        abstract: '2 進数を 16 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bin2hex-%E9%96%A2%E6%95%B0-0375e507-f5e5-4077-9af8-28d84f9f41cc',
            },
        ],
        functionParameter: {
            number: { name: '2 進数', detail: '変換する 2 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
    BIN2OCT: {
        description: '2 進数を 8 進数に変換します。',
        abstract: '2 進数を 8 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bin2oct-%E9%96%A2%E6%95%B0-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
            },
        ],
        functionParameter: {
            number: { name: '2 進数', detail: '変換する 2 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
    BITAND: {
        description: '2 つの数値の \'ビット単位の And\' を返します。',
        abstract: '2 つの数値の \'ビット単位の And\' を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bitand-%E9%96%A2%E6%95%B0-8a2be3d7-91c3-4b48-9517-64548008563a',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '小数点の表示形式になっている必要があります。 0 以上の数値を指定します。' },
            number2: { name: '数値2', detail: '小数点の表示形式になっている必要があります。 0 以上の数値を指定します。' },
        },
    },
    BITLSHIFT: {
        description: 'shift_amount ビットだけ左へシフトした数値を返します。',
        abstract: 'shift_amount ビットだけ左へシフトした数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bitlshift-%E9%96%A2%E6%95%B0-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '数値は、0 以上の整数である必要があります。' },
            shiftAmount: { name: 'シフト量', detail: 'は整数である必要があります。' },
        },
    },
    BITOR: {
        description: '2 つの数値のビット単位の OR を返します。',
        abstract: '2 つの数値のビット単位の OR を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bitor-%E9%96%A2%E6%95%B0-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '小数点の表示形式になっている必要があります。 0 以上の数値を指定します。' },
            number2: { name: '数値2', detail: '小数点の表示形式になっている必要があります。 0 以上の数値を指定します。' },
        },
    },
    BITRSHIFT: {
        description: 'shift_amount ビットだけ右へシフトした数値を返します。',
        abstract: 'shift_amount ビットだけ右へシフトした数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bitrshift-%E9%96%A2%E6%95%B0-274d6996-f42c-4743-abdb-4ff95351222c',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '数値は、0 以上の整数である必要があります。' },
            shiftAmount: { name: 'シフト量', detail: 'は整数である必要があります。' },
        },
    },
    BITXOR: {
        description: '2 つの数値のビット単位の \'Exclusive Or\' を返します。',
        abstract: '2 つの数値のビット単位の \'Exclusive Or\' を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bitxor-%E9%96%A2%E6%95%B0-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '小数点の表示形式になっている必要があります。 0 以上の数値を指定します。' },
            number2: { name: '数値2', detail: '小数点の表示形式になっている必要があります。 0 以上の数値を指定します。' },
        },
    },
    COMPLEX: {
        description: '実数係数および虚数係数を \'x+yi\' または \'x+yj\' の形式の複素数に変換します。',
        abstract: '実数係数および虚数係数を \'x+yi\' または \'x+yj\' の形式の複素数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/complex-%E9%96%A2%E6%95%B0-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
            },
        ],
        functionParameter: {
            realNum: { name: '実数', detail: '複素数の実数係数を指定します。' },
            iNum: { name: '虚数', detail: '複素数の虚数係数を指定します。' },
            suffix: { name: '虚数単位', detail: '複素数の虚数部分の単位を指定します。省略すると、"i" を指定したと見なされます。' },
        },
    },
    CONVERT: {
        description: '数値の単位を変換します。',
        abstract: '数値の単位を変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/convert-%E9%96%A2%E6%95%B0-d785bef1-808e-4aac-bdcd-666c810f9af2',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '変換する値を指定します。' },
            fromUnit: { name: '変換前単位', detail: '数値の単位を指定します。' },
            toUnit: { name: '変換後単位', detail: '結果の単位を指定します。' },
        },
    },
    DEC2BIN: {
        description: '10 進数を 2 進数に変換します。',
        abstract: '10 進数を 2 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dec2bin-%E9%96%A2%E6%95%B0-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
            },
        ],
        functionParameter: {
            number: { name: '10 進数', detail: '変換する 10 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
    DEC2HEX: {
        description: '10 進数を 16 進数に変換します。',
        abstract: '10 進数を 16 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dec2hex-%E9%96%A2%E6%95%B0-6344ee8b-b6b5-4c6a-a672-f64666704619',
            },
        ],
        functionParameter: {
            number: { name: '10 進数', detail: '変換する 10 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
    DEC2OCT: {
        description: '10 進数を 8 進数に変換します。',
        abstract: '10 進数を 8 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dec2oct-%E9%96%A2%E6%95%B0-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
            },
        ],
        functionParameter: {
            number: { name: '10 進数', detail: '変換する 10 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
    DELTA: {
        description: '2 つの値が等しいかどうかを調べます。',
        abstract: '2 つの値が等しいかどうかを調べます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/delta-%E9%96%A2%E6%95%B0-2f763672-c959-4e07-ac33-fe03220ba432',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '一方の数値を指定します。' },
            number2: { name: '数値2', detail: 'もう一方の数値を指定します。数値 2 を省略すると、0 を指定したと見なされます。' },
        },
    },
    ERF: {
        description: '誤差関数の積分値を返します。',
        abstract: '誤差関数の積分値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/erf-%E9%96%A2%E6%95%B0-c53c7e7b-5482-4b6c-883e-56df3c9af349',
            },
        ],
        functionParameter: {
            lowerLimit: { name: '下限', detail: '誤差関数を積分するときの下限値を指定します。' },
            upperLimit: { name: '上限', detail: '誤差関数を積分するときの上限値を指定します。上限を省略すると、0 ～下限の範囲で積分が行われます。' },
        },
    },
    ERF_PRECISE: {
        description: '誤差関数の積分値を返します。',
        abstract: '誤差関数の積分値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/erf-precise-%E9%96%A2%E6%95%B0-9a349593-705c-4278-9a98-e4122831a8e0',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: '誤差関数を積分するときの下限値を指定します。' },
        },
    },
    ERFC: {
        description: '相補誤差関数の積分値を返します。',
        abstract: '相補誤差関数の積分値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/erfc-%E9%96%A2%E6%95%B0-736e0318-70ba-4e8b-8d08-461fe68b71b3',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: '相補誤差関数を積分するときの下限値を指定します。' },
        },
    },
    ERFC_PRECISE: {
        description: 'x ～無限大の範囲で、相補誤差関数の積分値を返します。',
        abstract: 'x ～無限大の範囲で、相補誤差関数の積分値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/erfc-precise-%E9%96%A2%E6%95%B0-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: '相補誤差関数を積分するときの下限値を指定します。' },
        },
    },
    GESTEP: {
        description: '数値がしきい値以上であるかどうかを調べます。',
        abstract: '数値がしきい値以上であるかどうかを調べます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gestep-%E9%96%A2%E6%95%B0-f37e7d2a-41da-4129-be95-640883fca9df',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: 'しきい値に対して判定する値を指定します。' },
            step: { name: 'しきい値', detail: 'しきい値にする値を指定します。しきい値を省略すると、0 が使用されます。' },
        },
    },
    HEX2BIN: {
        description: '16 進数を 2 進数に変換します。',
        abstract: '16 進数を 2 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hex2bin-%E9%96%A2%E6%95%B0-a13aafaa-5737-4920-8424-643e581828c1',
            },
        ],
        functionParameter: {
            number: { name: '16 進数', detail: '変換する 16 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
    HEX2DEC: {
        description: '16 進数を 10 進数に変換します。',
        abstract: '16 進数を 10 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hex2dec-%E9%96%A2%E6%95%B0-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
            },
        ],
        functionParameter: {
            number: { name: '16 進数', detail: '変換する 16 進数を指定します。' },
        },
    },
    HEX2OCT: {
        description: '16 進数を 8 進数に変換します。',
        abstract: '16 進数を 8 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hex2oct-%E9%96%A2%E6%95%B0-54d52808-5d19-4bd0-8a63-1096a5d11912',
            },
        ],
        functionParameter: {
            number: { name: '16 進数', detail: '変換する 16 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
    IMABS: {
        description: '指定した複素数の絶対値を返します。',
        abstract: '指定した複素数の絶対値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imabs-%E9%96%A2%E6%95%B0-b31e73c6-d90c-4062-90bc-8eb351d765a1',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '絶対値を求める複素数を指定します。' },
        },
    },
    IMAGINARY: {
        description: '指定した複素数の虚数係数を返します。',
        abstract: '指定した複素数の虚数係数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imaginary-%E9%96%A2%E6%95%B0-dd5952fd-473d-44d9-95a1-9a17b23e428a',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '虚数係数を求める複素数を指定します。' },
        },
    },
    IMARGUMENT: {
        description: '引数シータ (ラジアンで表した角度) を返します。',
        abstract: '引数シータ (ラジアンで表した角度) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imargument-%E9%96%A2%E6%95%B0-eed37ec1-23b3-4f59-b9f3-d340358a034a',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '引数を theta する複素数。' },
        },
    },
    IMCONJUGATE: {
        description: '複素数の複素共役を返します。',
        abstract: '複素数の複素共役を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imconjugate-%E9%96%A2%E6%95%B0-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '共役を求める複素数を指定します。' },
        },
    },
    IMCOS: {
        description: '複素数のコサインを返します。',
        abstract: '複素数のコサインを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imcos-%E9%96%A2%E6%95%B0-dad75277-f592-4a6b-ad6c-be93a808a53c',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: 'コサインを求める複素数を指定します。' },
        },
    },
    IMCOSH: {
        description: '複素数の双曲線余弦を返します。',
        abstract: '複素数の双曲線余弦を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imcosh-%E9%96%A2%E6%95%B0-053e4ddb-4122-458b-be9a-457c405e90ff',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '双曲線余弦を求めたい複素数。' },
        },
    },
    IMCOT: {
        description: '複素数の余接を返します。',
        abstract: '複素数の余接を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imcot-%E9%96%A2%E6%95%B0-dc6a3607-d26a-4d06-8b41-8931da36442c',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '余接を求める複素数を指定します。' },
        },
    },
    IMCOTH: {
        description: '複素数の双曲線余接を返します。',
        abstract: '複素数の双曲線余接を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9366256?hl=ja&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '双曲線余接を求める複素数を指定します。' },
        },
    },
    IMCSC: {
        description: '複素数の余割を返します。',
        abstract: '複素数の余割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imcsc-%E9%96%A2%E6%95%B0-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '余割を求める複素数を指定します。' },
        },
    },
    IMCSCH: {
        description: '複素数の双曲線余割を返します。',
        abstract: '複素数の双曲線余割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imcsch-%E9%96%A2%E6%95%B0-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '双曲線余割を求める複素数を指定します。' },
        },
    },
    IMDIV: {
        description: '2 つの複素数の商を返します。',
        abstract: '2 つの複素数の商を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imdiv-%E9%96%A2%E6%95%B0-a505aff7-af8a-4451-8142-77ec3d74d83f',
            },
        ],
        functionParameter: {
            inumber1: { name: '複素数分子', detail: '割り算の分子または被除数となる複素数を指定します。' },
            inumber2: { name: '複素数分母', detail: '割り算の分母または除数となる複素数を指定します。' },
        },
    },
    IMEXP: {
        description: '複素数のべき乗を返します。',
        abstract: '複素数のべき乗を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imexp-%E9%96%A2%E6%95%B0-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: 'べき乗を求める複素数を指定します。' },
        },
    },
    IMLN: {
        description: '複素数の自然対数を返します。',
        abstract: '複素数の自然対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imln-%E9%96%A2%E6%95%B0-32b98bcf-8b81-437c-a636-6fb3aad509d8',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '自然対数を求める複素数を指定します。' },
        },
    },
    IMLOG: {
        description: '指定された値を底とする複素数の対数を返します。',
        abstract: '指定された値を底とする複素数の対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9366486?hl=ja&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '特定の底に対する対数を計算する必要がある複素数。' },
            base: { name: '底', detail: '対数を求めるときに使用する底です。' },
        },
    },
    IMLOG10: {
        description: '複素数の 10 を底とする対数を返します。',
        abstract: '複素数の 10 を底とする対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imlog10-%E9%96%A2%E6%95%B0-58200fca-e2a2-4271-8a98-ccd4360213a5',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '常用対数を求める複素数を指定します。' },
        },
    },
    IMLOG2: {
        description: '複素数の 2 を底とする対数を返します。',
        abstract: '複素数の 2 を底とする対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imlog2-%E9%96%A2%E6%95%B0-152e13b4-bc79-486c-a243-e6a676878c51',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '2 を底とする対数を求める複素数を指定します。' },
        },
    },
    IMPOWER: {
        description: '複素数の整数乗を返します。',
        abstract: '複素数の整数乗を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/impower-%E9%96%A2%E6%95%B0-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: 'べき乗を求める複素数を指定します。' },
            number: { name: '数値', detail: '複素数を底とするべき乗の指数です。' },
        },
    },
    IMPRODUCT: {
        description: '複素数の積を返します',
        abstract: '複素数の積を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/improduct-%E9%96%A2%E6%95%B0-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
            },
        ],
        functionParameter: {
            inumber1: { name: '複素数1', detail: '積を求める複素数を 1 ～ 255 個まで指定します。' },
            inumber2: { name: '複素数2', detail: '積を求める複素数を 1 ～ 255 個まで指定します。' },
        },
    },
    IMREAL: {
        description: '複素数の実数係数を返します。',
        abstract: '複素数の実数係数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imreal-%E9%96%A2%E6%95%B0-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '実数係数を求める複素数を指定します。' },
        },
    },
    IMSEC: {
        description: '複素数の正割を返します。',
        abstract: '複素数の正割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imsec-%E9%96%A2%E6%95%B0-6df11132-4411-4df4-a3dc-1f17372459e0',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '正割を求める複素数。' },
        },
    },
    IMSECH: {
        description: '複素数の双曲線正割を返します。',
        abstract: '複素数の双曲線正割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imsech-%E9%96%A2%E6%95%B0-f250304f-788b-4505-954e-eb01fa50903b',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '双曲線正割を求める複素数。' },
        },
    },
    IMSIN: {
        description: '複素数のサインを返します。',
        abstract: '複素数のサインを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imsin-%E9%96%A2%E6%95%B0-1ab02a39-a721-48de-82ef-f52bf37859f6',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: 'サインを求める複素数を指定します。' },
        },
    },
    IMSINH: {
        description: '複素数の双曲線正弦を返します。',
        abstract: '複素数の双曲線正弦を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imsinh-%E9%96%A2%E6%95%B0-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '双曲線正弦を求める複素数を指定します。' },
        },
    },
    IMSQRT: {
        description: '複素数の平方根を返します。',
        abstract: '複素数の平方根を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imsqrt-%E9%96%A2%E6%95%B0-e1753f80-ba11-4664-a10e-e17368396b70',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '平方根を求める複素数を指定します。' },
        },
    },
    IMSUB: {
        description: '2 つの複素数の差を返します。',
        abstract: '2 つの複素数の差を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imsub-%E9%96%A2%E6%95%B0-2e404b4d-4935-4e85-9f52-cb08b9a45054',
            },
        ],
        functionParameter: {
            inumber1: { name: '複素数1', detail: '複素数1。' },
            inumber2: { name: '複素数2', detail: '複素数2。' },
        },
    },
    IMSUM: {
        description: '複素数の和を返します。',
        abstract: '複素数の和を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imsum-%E9%96%A2%E6%95%B0-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
            },
        ],
        functionParameter: {
            inumber1: { name: '複素数1', detail: '和を求める複素数を 1 ～ 255 個まで指定します。' },
            inumber2: { name: '複素数2', detail: '和を求める複素数を 1 ～ 255 個まで指定します。' },
        },
    },
    IMTAN: {
        description: '複素数の正接を返します。',
        abstract: '複素数の正接を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/imtan-%E9%96%A2%E6%95%B0-8478f45d-610a-43cf-8544-9fc0b553a132',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '正接を求める接線を指定します。' },
        },
    },
    IMTANH: {
        description: '複素数の双曲線正接を返します。',
        abstract: '複素数の双曲線正接を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9366655?hl=ja&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '双曲線正接を求める接線を指定します。' },
        },
    },
    OCT2BIN: {
        description: '8 進数を 2 進数に変換します。',
        abstract: '8 進数を 2 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/oct2bin-%E9%96%A2%E6%95%B0-55383471-3c56-4d27-9522-1a8ec646c589',
            },
        ],
        functionParameter: {
            number: { name: '8 進数', detail: '変換する 8 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
    OCT2DEC: {
        description: '8 進数を 10 進数に変換します。',
        abstract: '8 進数を 10 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/oct2dec-%E9%96%A2%E6%95%B0-87606014-cb98-44b2-8dbb-e48f8ced1554',
            },
        ],
        functionParameter: {
            number: { name: '8 進数', detail: '変換する 8 進数を指定します。' },
        },
    },
    OCT2HEX: {
        description: '8 進数を 16 進数に変換します。',
        abstract: '8 進数を 16 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/oct2hex-%E9%96%A2%E6%95%B0-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number: { name: '8 進数', detail: '変換する 8 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
};
