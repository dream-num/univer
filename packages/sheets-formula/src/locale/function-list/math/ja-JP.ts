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
        description: '数値の絶対値を返します。 絶対値とは、数値から符号 (+、-) を除いた数の大きさのことです。',
        abstract: '数値の絶対値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '絶対値が必要な実数。' },
        },
    },
    ACOS: {
        description: '数値のアークコサイン (逆余弦) を返します。 アークコサインとは、そのコサインが数値となる角度のことです。 戻り値の角度は、0 (ゼロ) ～ pi の範囲内のラジアンで示されます。',
        abstract: '数値のアークコサインを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '求める角度のコサインの値を、-1 ～ 1 の範囲で指定します。' },
        },
    },
    ACOSH: {
        description: '数値の逆双曲線コサインを返します。 数値は 1 以上である必要があります。 逆双曲線コサインは、双曲線コサインが 数値の値なので、ACOSH(COSH(number)) は数値と等 しくなります。',
        abstract: '数値の双曲線逆余弦 (ハイパーボリック コサインの逆関数) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '1 以上の実数を指定します。' },
        },
    },
    ACOT: {
        description: 'コタンジェント、または逆コタンジェント、数値の主値を返します。',
        abstract: '数値の逆余接を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: {
                name: '数値',
                detail: '数値は、求める角度のコタンジェントです。 これは実数である必要があります。',
            },
        },
    },
    ACOTH: {
        description: '数値の双曲線逆余接を返します。',
        abstract: '数値の双曲線逆余接を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '数値の絶対値は 1 より大きい値である必要があります。' },
        },
    },
    AGGREGATE: {
        description: 'リストまたはデータベースの集計値を返します。',
        abstract: 'リストまたはデータベースの集計値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: '集計方法', detail: '使用する関数を指定する 1 ～ 19 の番号です。' },
            options: { name: 'オプション', detail: '関数の検証範囲内の無視する値を指定する数値です。' },
            ref1: { name: '範囲 1', detail: '集計値を求めるために複数の数値引数を受け取る関数の、最初の数値引数です。' },
            ref2: { name: '範囲 2', detail: '集計値を求めるための数値引数 2 ～ 252 を指定します。' },
        },
    },
    ARABIC: {
        description: 'ローマ数字をアラビア数字に変換します。',
        abstract: 'ローマ数字をアラビア数字に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '半角の二重引用符で囲んだ文字列、空の文字列 ("")、または文字列を含むセルへの参照を指定します。' },
        },
    },
    ASIN: {
        description: '数値のアークサインを返します。',
        abstract: '数値のアークサインを返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '求める角度のサインの値を -1 ～ 1 の範囲で指定します。' },
        },
    },
    ASINH: {
        description: '数値の双曲線逆正弦 (ハイパーボリック サインの逆関数) を返します。',
        abstract: '数値の双曲線逆正弦 (ハイパーボリック サインの逆関数) を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '実数を指定します。' },
        },
    },
    ATAN: {
        description: '数値のアークタンジェントを返します。',
        abstract: '数値のアークタンジェントを返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '求める角度のタンジェントの値を指定します。' },
        },
    },
    ATAN2: {
        description: '指定された x-y 座標のアークタンジェントを返します。',
        abstract: '指定された x-y 座標のアークタンジェントを返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x 座標', detail: '点の x 座標を指定します。' },
            yNum: { name: 'y 座標', detail: '点の y 座標を指定します。' },
        },
    },
    ATANH: {
        description: '数値の逆双曲線正接を返します。 数値は 、-1 から 1 (-1 と 1 を除く) の間である必要があります。 逆双曲線正接は、双曲線正接が 数値 である値であるため、ATANH(TANH(number)) は 数値 と等しくなります。',
        abstract: '数値の逆双曲線正接を返します。 数値は 、-1 から 1 (-1 と 1 を除く) の間である必要があります。 逆双曲線正接は、双曲線正接が 数値 である値であるため、ATANH(TANH(number)) は 数値 と等しくなります。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '必ず指定します。 -1 より大きく 1 より小さい実数を指定します。' },
        },
    },
    BASE: {
        description: '指定された基数 (底) のテキスト表現に、数値を変換します。',
        abstract: '指定された基数 (底) のテキスト表現に、数値を変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '変換する数値を指定します。 0 以上、2^53 未満の整数である必要があります。' },
            radix: { name: '基数', detail: ' 数値を変換する基数 (底) の数値を指定します。 2 以上、36 以下の整数である必要があります。' },
            minLength: { name: '最小の長さです', detail: '返される文字列の最小長を指定します。 0 以上の整数である必要があります。' },
        },
    },
    CEILING: {
        description: '指定された基準値の倍数のうち、最も近い値に数値を切り上げます。',
        abstract: '指定された基準値の倍数のうち、最も近い値に数値を切り上げます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
            significance: { name: '基準値', detail: '倍数の基準となる数値を指定します。' },
        },
    },
    CEILING_MATH: {
        description: '指定された基準値の倍数のうち、最も近い値に数値を切り上げます。',
        abstract: '指定された基準値の倍数のうち、最も近い値に数値を切り上げます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
            significance: { name: '基準値', detail: '倍数の基準となる数値を指定します。' },
            mode: { name: 'モード', detail: '負の数値の場合、数値を 0 に丸めるか、ゼロから遠ざけるかを制御します。' },
        },
    },
    CEILING_PRECISE: {
        description: '指定された基準値の倍数のうち、最も近い値に数値を切り上げます。 数値は正負に関係なく切り上げられます。',
        abstract: '指定された基準値の倍数のうち、最も近い値に数値を切り上げます。 数値は正負に関係なく切り上げられます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
            significance: { name: '基準値', detail: '倍数の基準となる数値を指定します。' },
        },
    },
    COMBIN: {
        description: '指定された個数を選択するときの組み合わせの数を返します。',
        abstract: '指定された個数を選択するときの組み合わせの数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: '総数', detail: '抜き取る対象の全体の数を指定します。' },
            numberChosen: { name: '抜き取り数', detail: '抜き取る組み合わせ 1 組に含まれる項目の数を指定します。' },
        },
    },
    COMBINA: {
        description: '指定された個数を選択するときの組み合わせ (反復あり) の数を返します',
        abstract: '指定された個数を選択するときの組み合わせ (反復あり) の数を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: '総数', detail: '抜き取る対象の全体の数を指定します。' },
            numberChosen: { name: '抜き取り数', detail: '抜き取る組み合わせ 1 組に含まれる項目の数を指定します。' },
        },
    },
    COS: {
        description: '指定された角度のコサインを返します。',
        abstract: '指定された角度のコサインを返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: 'コサインを求める角度をラジアンで指定します。' },
        },
    },
    COSH: {
        description: '数値の双曲線余弦 (ハイパーボリック コサイン) を返します。',
        abstract: '数値の双曲線余弦 (ハイパーボリック コサイン) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '双曲線余弦を求める実数を指定します。' },
        },
    },
    COT: {
        description: '角度の双曲線余接を返します。',
        abstract: '角度の双曲線余接を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '余接を求める角度を、ラジアンを単位として指定します。' },
        },
    },
    COTH: {
        description: '数値の双曲線余接を返します。',
        abstract: '数値の双曲線余接を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '双曲線余接を求める実数を指定します。' },
        },
    },
    CSC: {
        description: '角度の余割を返します。',
        abstract: '角度の余割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '余割を求める角度を、ラジアンを単位として指定します。' },
        },
    },
    CSCH: {
        description: '角度の双曲線余割を返します。',
        abstract: '角度の双曲線余割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '双曲線余割を求める角度を、ラジアンを単位として指定します。' },
        },
    },
    DECIMAL: {
        description: '指定された底の数値のテキスト表現を 10 進数に変換します。',
        abstract: '指定された底の数値のテキスト表現を 10 進数に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '文字列の長さは 255 文字以下にする必要があります。' },
            radix: { name: '基数', detail: ' 数値を変換する基数 (底) の数値を指定します。 2 以上、36 以下の整数である必要があります。' },
        },
    },
    DEGREES: {
        description: 'ラジアンを度に変換します。',
        abstract: 'ラジアンを度に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: '角度', detail: '度に変換するラジアン単位の角度を指定します。' },
        },
    },
    EVEN: {
        description: '指定された数値を最も近い偶数に切り上げた値を返します。',
        abstract: '指定された数値を最も近い偶数に切り上げた値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
        },
    },
    EXP: {
        description: 'e を底とする数値のべき乗を返します。',
        abstract: 'e を底とする数値のべき乗を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: 'e を底とするべき乗の指数を指定します。' },
        },
    },
    FACT: {
        description: '数値の階乗を返します。',
        abstract: '数値の階乗を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '階乗を求める正の数値を指定します。 数値が整数でない場合は、小数点以下が切り捨てられます。' },
        },
    },
    FACTDOUBLE: {
        description: '数値の二重階乗を返します。',
        abstract: '数値の二重階乗を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '二重階乗を求める正の数値を指定します。 数値が整数でない場合は、小数点以下が切り捨てられます。' },
        },
    },
    FLOOR: {
        description: '数値を指定された桁数で切り捨てます。',
        abstract: '数値を指定された桁数で切り捨てます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
            significance: { name: '基準値', detail: '倍数の基準となる数値を指定します。' },
        },
    },
    FLOOR_MATH: {
        description: '指定された基準値の倍数のうち、最も近い値に数値を切り捨てます。',
        abstract: '指定された基準値の倍数のうち、最も近い値に数値を切り捨てます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
            significance: { name: '基準値', detail: '倍数の基準となる数値を指定します。' },
            mode: { name: 'モード', detail: '負の数値の場合、数値を 0 に丸めるか、ゼロから遠ざけるかを制御します。' },
        },
    },
    FLOOR_PRECISE: {
        description: '指定された基準値の倍数のうち、最も近い値に数値を切り捨てます。 数値は正負に関係なく切り捨てられます。',
        abstract: '指定された基準値の倍数のうち、最も近い値に数値を切り捨てます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
            significance: { name: '基準値', detail: '倍数の基準となる数値を指定します。' },
        },
    },
    GCD: {
        description: '最大公約数を返します。',
        abstract: '最大公約数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '計算に使用する最初の値または範囲。' },
            number2: { name: '数値2', detail: '計算に使用する追加の値または範囲。' },
        },
    },
    INT: {
        description: '指定された数値を最も近い整数に切り捨てます。',
        abstract: '指定された数値を最も近い整数に切り捨てます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '切り捨てて整数にする実数を指定します。' },
        },
    },
    ISO_CEILING: {
        description: '最も近い整数に切り上げた値、または、指定された基準値の倍数のうち最も近い値を返します。',
        abstract: '最も近い整数に切り上げた値、または、指定された基準値の倍数のうち最も近い値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
            significance: { name: '基準値', detail: '倍数の基準となる数値を指定します。' },
        },
    },
    LCM: {
        description: '最小公倍数を返します。',
        abstract: '最小公倍数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '計算に使用する最初の値または範囲。' },
            number2: { name: '数値2', detail: '計算に使用する追加の値または範囲。' },
        },
    },
    LN: {
        description: '数値の自然対数を返します。',
        abstract: '数値の自然対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '自然対数を求める正の実数を指定します。' },
        },
    },
    LOG: {
        description: '指定された数を底とする数値の対数を返します。',
        abstract: '指定された数を底とする数値の対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '対数を求める正の実数を指定します。' },
            base: { name: '底', detail: '対数の底を指定します。 底を省略すると、10 を指定したと見なされます。' },
        },
    },
    LOG10: {
        description: '10 を底とする数値の対数 (常用対数) を返します。',
        abstract: '10 を底とする数値の対数 (常用対数) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '10 を底とする対数 (常用対数) を求める正の実数を指定します。' },
        },
    },
    MDETERM: {
        description: '配列の行列式を返します。',
        abstract: '配列の行列式を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '行数と列数が等しい数値配列 (正方行列) を指定します。' },
        },
    },
    MINVERSE: {
        description: '行列の逆行列を返します。',
        abstract: '行列の逆行列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '行数と列数が等しい数値配列 (正方行列) を指定します。' },
        },
    },
    MMULT: {
        description: '2 つの配列の行列積を返します。',
        abstract: '2 つの配列の行列積を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: '行列積を求める 2 つの配列を指定します。' },
            array2: { name: '配列2', detail: '行列積を求める 2 つの配列を指定します。' },
        },
    },
    MOD: {
        description: '数値を除数で割ったときの剰余を返します。 戻り値は除数と同じ符号になります。',
        abstract: '数値を除算したときの剰余を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '除算の分子となる数値を指定します。' },
            divisor: { name: '除数', detail: '除算の分母となる数値を指定します。' },
        },
    },
    MROUND: {
        description: '指定された値の倍数になるように、数値を切り上げまたは切り捨てます。',
        abstract: '指定された値の倍数になるように、数値を切り上げまたは切り捨てます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
            multiple: { name: '複数', detail: '数値を丸める倍数。' },
        },
    },
    MULTINOMIAL: {
        description: '指定された複数の数値の多項係数を返します。',
        abstract: '指定された複数の数値の多項係数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '計算に使用する最初の値または範囲。' },
            number2: { name: '数値2', detail: '計算に使用する追加の値または範囲。' },
        },
    },
    MUNIT: {
        description: '指定された次元の単位行列を返します。',
        abstract: '指定された次元の単位行列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'ディメンション', detail: 'ディメンションは、返す必要がある単位行列の次元を指定する整数です。 配列を返します。 ディメンションを 0 より大きい値にする必要があります。' },
        },
    },
    ODD: {
        description: '指定された数値を最も近い奇数に切り上げた値を返します。',
        abstract: '指定された数値を最も近い奇数に切り上げた値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '丸めの対象となる数値を指定します。' },
        },
    },
    PI: {
        description: '円周率πを返します。',
        abstract: '円周率πを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: '数値のべき乗を返します。',
        abstract: '数値のべき乗を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: 'べき乗の底を指定します。数値には任意の実数を指定することができます。' },
            power: { name: '指数', detail: '数値を底とするべき乗の指数を指定します。' },
        },
    },
    PRODUCT: {
        description: 'は、引数として指定されたすべての数値を乗算し、製品を返します。',
        abstract: '引数リストの積を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '積を計算する最初の数値または範囲を指定します。' },
            number2: { name: '数値 2', detail: '積を計算する 2 番目以降の数値または範囲を指定します (引数は 1 ～ 255 個まで指定できます)。' },
        },
    },
    QUOTIENT: {
        description: '除算の商の整数部を返します。',
        abstract: '除算の商の整数部を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: '分子', detail: '被除数 (割られる数) を指定します。' },
            denominator: { name: '分母', detail: '除数 (割る数) を指定します。' },
        },
    },
    RADIANS: {
        description: '度をラジアンに変換します。',
        abstract: '度をラジアンに変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: '角度', detail: 'ラジアンに変換する角度を指定します。' },
        },
    },
    RAND: {
        description: '0 以上 1 未満の乱数を返します。',
        abstract: '0 以上 1 未満の乱数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: '0 から 1 までのランダムな数値の配列を返します。ただし、入力する行と列の数、最小値と最大値、および整数または 10 進数の値を返すかどうかを指定できます。',
        abstract: '0 から 1 までのランダムな数値の配列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: '行の数', detail: '返される行の数' },
            columns: { name: '列の数', detail: '返される列の数' },
            min: { name: '最小値', detail: '返される最小値' },
            max: { name: '最大値', detail: '返される最大値' },
            wholeNumber: { name: '整数', detail: '整数または 10 進数の値のどちらを返すのかを指定' },
        },
    },
    RANDBETWEEN: {
        description: '指定された範囲内の整数の乱数を返します。',
        abstract: '指定された範囲内の整数の乱数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: '最小値', detail: ' 乱数の最小値を整数で指定します。' },
            top: { name: '最大値', detail: '乱数の最大値を整数で指定します。' },
        },
    },
    ROMAN: {
        description: 'アラビア数字を、ローマ数字を表す文字列に変換します。',
        abstract: 'アラビア数字を、ローマ数字を表す文字列に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '変換するアラビア数字を指定します。' },
            form: { name: '書式', detail: 'ローマ数字の書式を数値で指定します。 ローマ数字の書式には正式な形式から簡略化した形式まであり、書式の値が大きくなるほど、簡略化した形式で表示されます。' },
        },
    },
    ROUND: {
        description: '数値を四捨五入して指定された桁数にします。',
        abstract: '数値を四捨五入して指定された桁数にします。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '四捨五入の対象となる数値を指定します。' },
            numDigits: { name: '桁数', detail: '数値を四捨五入した結果の桁数を指定します。' },
        },
    },
    ROUNDBANK: {
        description: '銀行家の丸めで数値を丸めます',
        abstract: '銀行家の丸めで数値を丸めます',
        links: [
            {
                title: '指導',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '銀行型丸めで丸める数値。' },
            numDigits: { name: '桁数', detail: '銀行型丸めで丸める桁数。' },
        },
    },
    ROUNDDOWN: {
        description: '数値を指定された桁数で切り捨てます。',
        abstract: '数値を指定された桁数で切り捨てます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '四捨五入の対象となる数値を指定します。' },
            numDigits: { name: '桁数', detail: '数値を四捨五入した結果の桁数を指定します。' },
        },
    },
    ROUNDUP: {
        description: '数値を指定された桁数に切り上げます。',
        abstract: '数値を指定された桁数に切り上げます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '四捨五入の対象となる数値を指定します。' },
            numDigits: { name: '桁数', detail: '数値を四捨五入した結果の桁数を指定します。' },
        },
    },
    SEC: {
        description: '角度の正割を返します。',
        abstract: '角度の正割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '数値は、セカントが必要なラジアンの角度です。' },
        },
    },
    SECH: {
        description: '角度の双曲線正割を返します。',
        abstract: '角度の双曲線正割を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '数値は、双曲線のセカントが必要なラジアンの角度です。' },
        },
    },
    SERIESSUM: {
        description: '数式で定義されるべき級数を返します。',
        abstract: '数式で定義されるべき級数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'べき級数に代入する値を指定します。' },
            n: { name: 'n', detail: 'x のべき乗の初期値を指定します。' },
            m: { name: 'm', detail: '級数の各項に対する n の増分を指定します。' },
            coefficients: { name: '係数', detail: 'x の (n+m) 乗の乗数を指定します。' },
        },
    },
    SEQUENCE: {
        description: '1、2、3、4 など、配列内の連続した数値の一覧を生成します。',
        abstract: '1、2、3、4 など、配列内の連続した数値の一覧を生成します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: '行の数', detail: '返す行の数。' },
            columns: { name: '列の数', detail: '返す列の数。' },
            start: { name: '最初の数値', detail: '数列の最初の数値。' },
            step: { name: '値の増', detail: '配列内の後続の各値の増分量。' },
        },
    },
    SIGN: {
        description: '数値の正負を調べます。',
        abstract: '数値の正負を調べます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '実数を指定します。' },
        },
    },
    SIN: {
        description: '指定された角度のサインを返します。',
        abstract: '指定された角度のサインを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: 'サインを求める角度をラジアンで指定します。' },
        },
    },
    SINH: {
        description: '数値の双曲線正弦 (ハイパーボリック サイン) を返します。',
        abstract: '数値の双曲線正弦 (ハイパーボリック サイン) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '実数を指定します。' },
        },
    },
    SQRT: {
        description: '正の平方根を返します。',
        abstract: '正の平方根を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '平方根を求める数値を指定します。' },
        },
    },
    SQRTPI: {
        description: '(数値 * π) の平方根を返します。',
        abstract: '(数値 * π) の平方根を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: 'π倍する数値を指定します。' },
        },
    },
    SUBTOTAL: {
        description: 'リストまたはデータベースの集計値を返します。',
        abstract: 'リストまたはデータベースの集計値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: '集計方法', detail: '番号 1 ~ 11 または 101 ~ 111 を集計に使用する関数として指定します。 1 ~ 11 には手動で非表示にした行が含まれるのに対して、101 ~ 111 ではそれらを除外します。つまり、フィルター処理されたセルは常に除外されます。' },
            ref1: { name: '範囲 1', detail: '集計する最初の名前付き範囲または参照を指定します。' },
            ref2: { name: '範囲 2', detail: '集計する名前付き範囲または参照を 2 ～ 254 個まで指定します。' },
        },
    },
    SUM: {
        description: '引数を合計します。',
        abstract: '引数を合計します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: {
                name: '数値 1',
                detail: '加算する最初の数。 ここには 4 のような数値、B6 のようなセル参照、B2:B8 のようなセル範囲を指定できます。',
            },
            number2: {
                name: '数値 2',
                detail: 'これは、加算する 2 番目の数値です。 この方法で最大 255 個の数値を指定することができます。',
            },
        },
    },
    SUMIF: {
        description: '指定された検索条件に一致するセルの値を合計します。',
        abstract: '指定された検索条件に一致するセルの値を合計します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: '範囲', detail: '条件によって評価するセルの範囲。' },
            criteria: { name: '条件', detail: ' 数値、式、セル参照、テキスト、または追加するセルを定義する関数の形式の条件。 ワイルドカード文字を含めることができます。疑問符 (?) は任意の 1 文字に一致し、アスタリスク (*) は任意の文字シーケンスに一致します。 ワイルドカード文字ではなく、通常の文字として疑問符やアスタリスクを検索する場合は、その文字の前に、"~*" のように半角のチルダ (~) を付けます。' },
            sumRange: { name: '合計範囲', detail: 'range 引数で指定されたセル以外のセルを追加する場合は、追加する実際のセル。 sum_range引数を省略すると、範囲引数で指定されたセル (条件が適用されるセルと同じセル) が追加されます。' },
        },
    },
    SUMIFS: {
        description: '複数の検索条件に一致するすべての引数を合計します。',
        abstract: '複数の検索条件に一致するすべての引数を合計します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: '合計範囲', detail: '合計するセルの範囲を指定します。' },
            criteriaRange1: { name: '条件範囲 1', detail: '条件 1 に基づいて検証する範囲を指定します。条件範囲 1 と条件 1 が検索時にペアとなり、特定の条件に基づいて条件範囲が検索されます。 条件範囲で項目が見つかったら、合計対象範囲内のその項目に対応する値が合計されます。' },
            criteria1: { name: '条件 1', detail: '条件範囲 1 内のどのセルを合計するかを定義する条件を指定します。 たとえば条件は、32、">32"、B4、"リンゴ"、または "32" のように入力できます。' },
            criteriaRange2: { name: '条件範囲 2', detail: '追加の範囲。 最大 127 の範囲のペアを入力できます。' },
            criteria2: { name: '条件 2', detail: '追加対応する条件です。 最大 127 条件のペアを入力できます。' },
        },
    },
    SUMPRODUCT: {
        description: '指定された配列で対応する要素の積を合計します。',
        abstract: '指定された配列で対応する要素の積を合計します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: '配列', detail: '計算の対象となる要素を含む最初の配列引数を指定します。' },
            array2: { name: '配列', detail: '計算の対象となる要素を含む、2 から 255 個までの配列引数を指定します。' },
        },
    },
    SUMSQ: {
        description: '引数の 2 乗の和 (平方和) を返します。',
        abstract: '引数の 2 乗の和 (平方和) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '最初の数値を二乗して合計するには、コンマ区切りの引数の代わりに単一の配列または配列への参照を使用することもできます。' },
            number2: { name: '数値2', detail: '二乗を合計する 2 番目の数値。この方法では、最大 255 個の番号を指定できます。' },
        },
    },
    SUMX2MY2: {
        description: '2 つの配列で対応する配列要素の平方差を合計します。',
        abstract: '2 つの配列で対応する配列要素の平方差を合計します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: '配列1', detail: '対象となる一方の数値配列またはセル範囲を指定します。' },
            arrayY: { name: '配列2', detail: '対象となるもう一方の数値配列またはセル範囲を指定します。' },
        },
    },
    SUMX2PY2: {
        description: '2 つの配列で対応する配列要素の平方和を合計します。',
        abstract: '2 つの配列で対応する配列要素の平方和を合計します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: '配列1', detail: '対象となる一方の数値配列またはセル範囲を指定します。' },
            arrayY: { name: '配列2', detail: '対象となるもう一方の数値配列またはセル範囲を指定します。' },
        },
    },
    SUMXMY2: {
        description: '2 つの配列で対応する配列要素の差を 2 乗して合計します。',
        abstract: '2 つの配列で対応する配列要素の差を 2 乗して合計します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: '配列1', detail: '対象となる一方の数値配列またはセル範囲を指定します。' },
            arrayY: { name: '配列2', detail: '対象となるもう一方の数値配列またはセル範囲を指定します。' },
        },
    },
    TAN: {
        description: '指定された角度のタンジェントを返します。',
        abstract: '指定された角度のタンジェントを返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: 'タンジェントを求める角度をラジアンを単位として指定します。' },
        },
    },
    TANH: {
        description: '数値の双曲線正接 (ハイパーボリック タンジェント) を返します。',
        abstract: '数値の双曲線正接 (ハイパーボリック タンジェント) を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '実数を指定します。' },
        },
    },
    TRUNC: {
        description: '数値の小数部を切り捨てて、整数または指定された桁数にします。',
        abstract: '数値の小数部を切り捨てて、整数または指定された桁数にします。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '小数部を切り捨てる数値を指定します。' },
            numDigits: { name: '桁数', detail: '切り捨てを行った後の桁数を指定します。桁数の既定値は 0 (ゼロ) です。' },
        },
    },
};

export default locale;
