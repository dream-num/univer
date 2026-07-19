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
        description: '修正ベッセル関数 In(x) を返します。',
        abstract: '修正ベッセル関数 In(x) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/besseli-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/besselj-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/besselk-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bessely-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bin2dec-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bin2hex-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: '2 進数', detail: '必ず指定します。 変換する 2 進数を指定します。 数値に指定できる文字数は 10 文字 (10 ビット) までです。 数値の最上位のビットは符号を表します。 残りの 9 ビットは数値の大きさを表します。 負の数は 2 の補数を使って表します。' },
            places: { name: '桁数', detail: 'オプション。 使用する文字数を指定します。 桁数を省略すると、必要最小限の桁数で結果が返されます。 桁数は、戻り値が桁数に満たないときに 0 (ゼロ) を前に付加して桁を埋める場合に役立ちます。' },
        },
    },
    BITAND: {
        description: '2 つの数値の \'ビット単位の And\' を返します。',
        abstract: '2 つの数値の \'ビット単位の And\' を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bitand-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bitlshift-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bitor-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bitrshift-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/bitxor-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/complex-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/convert-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/dec2bin-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/dec2hex-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/dec2oct-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/delta-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/erf-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/erf-precise-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/erfc-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/erfc-precise-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gestep-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/hex2bin-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/hex2dec-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/hex2oct-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '絶対値を求める複素数を指定します。' },
        },
    },
    IMAGINARY: {
        description: '文字列 "x+yi" または "x+yj" の形式で指定された複素数の虚数係数を返します。',
        abstract: '文字列 "x+yi" または "x+yj" の形式で指定された複素数の虚数係数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '必須。 虚数係数を求める複素数を指定します。' },
        },
    },
    IMARGUMENT: {
        description: '引数シータ (ラジアンで表した角度) を返します。',
        abstract: '引数シータ (ラジアンで表した角度) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imargument-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imconjugate-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imcos-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imcosh-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '余接を求める複素数を指定します。' },
        },
    },
    IMCOTH: {
        description: 'IMCOTH 関数は、指定された複素数の双曲線余接を返します。 たとえば、「x+yi」形式で複素数を指定すると「coth(x+yi)」が返されます。',
        abstract: 'IMCOTH 関数は、指定された複素数の双曲線余接を返します。 たとえば、「x+yi」形式で複素数を指定すると「coth(x+yi)」が返されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9366256?hl=ja',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '双曲線コタンジェントを求める複素数です。 COMPLEX 関数の結果の 0 の虚数部を持つ複素数として解釈される実数、または「x+yi」形式の文字列（x と y は数値）を指定できます。' },
        },
    },
    IMCSC: {
        description: '複素数の余割を返します。',
        abstract: '複素数の余割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imcsc-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imcsch-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '複素数分子', detail: '割り算の分子または被除数となる複素数を指定します。' },
            inumber2: { name: '複素数分母', detail: '割り算の分母または除数となる複素数を指定します。' },
        },
    },
    IMEXP: {
        description: '文字列 "x+yi" または "x+yj" の形式で指定された複素数のべき乗を返します。',
        abstract: '文字列 "x+yi" または "x+yj" の形式で指定された複素数のべき乗を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '必須。 べき乗を求める複素数を指定します。' },
        },
    },
    IMLN: {
        description: '複素数の自然対数を返します。',
        abstract: '複素数の自然対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '自然対数を求める複素数を指定します。' },
        },
    },
    IMLOG: {
        description: 'IMLOG 関数は、指定された値を底とする複素数の対数を返します。',
        abstract: 'IMLOG 関数は、指定された値を底とする複素数の対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9366486?hl=ja',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '対数関数の入力値です。 数値は、実数として解釈されるように、通常の数値（1 など）を記述できます。 数値は、文字を引用符で囲んで記述して、実数係数と複素係数の両方を指定できます。' },
            base: { name: '底', detail: '対数を求めるときに使用する底です。 正の実数を指定してください。' },
        },
    },
    IMLOG10: {
        description: '複素数の 10 を底とする対数を返します。',
        abstract: '複素数の 10 を底とする対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imlog10-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imlog2-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/impower-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/improduct-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imreal-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imsec-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imsech-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imsin-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imsinh-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imsqrt-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imsub-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imsum-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '正接を求める接線を指定します。' },
        },
    },
    IMTANH: {
        description: 'IMTANH 関数は、指定された複素数の双曲線正接を返します。 たとえば、複素数「x+yi」を指定すると「tanh(x+yi)」が返されます。',
        abstract: 'IMTANH 関数は、指定された複素数の双曲線正接を返します。 たとえば、複素数「x+yi」を指定すると「tanh(x+yi)」が返されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9366655?hl=ja',
            },
        ],
        functionParameter: {
            inumber: { name: '複素数', detail: '双曲線正接を求める複素数です。 COMPLEX 関数の結果、0 の虚数部を持つ複素数として解釈される実数、「x+yi」形式の文字列（x と y は数値）を指定できます。' },
        },
    },
    OCT2BIN: {
        description: '8 進数を 2 進数に変換します。',
        abstract: '8 進数を 2 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/oct2bin-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/oct2dec-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: '8 進数', detail: '変換する 8 進数を指定します。' },
            places: { name: '桁数', detail: '使用する文字数を指定します。' },
        },
    },
};

export default locale;
