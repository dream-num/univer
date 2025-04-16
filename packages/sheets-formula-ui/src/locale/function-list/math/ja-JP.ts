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
        description: '数値の絶対値を返します。 絶対値とは、数値から符号 (+、-) を除いた数の大きさのことです。',
        abstract: '数値の絶対値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/abs-%E9%96%A2%E6%95%B0-3420200f-5628-4e8c-99da-c99d7c87713c',
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
                url: 'https://support.microsoft.com/ja-jp/office/acos-%E9%96%A2%E6%95%B0-cb73173f-d089-4582-afa1-76e5524b5d5b',
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
                url: 'https://support.microsoft.com/ja-jp/office/acosh-%E9%96%A2%E6%95%B0-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
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
                url: 'https://support.microsoft.com/ja-jp/office/acot-%E9%96%A2%E6%95%B0-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
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
                url: 'https://support.microsoft.com/ja-jp/office/acoth-%E9%96%A2%E6%95%B0-cc49480f-f684-4171-9fc5-73e4e852300f',
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
                url: 'https://support.microsoft.com/ja-jp/office/aggregate-%E9%96%A2%E6%95%B0-43b9278e-6aa7-4f17-92b6-e19993fa26df',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ARABIC: {
        description: 'ローマ数字をアラビア数字に変換します。',
        abstract: 'ローマ数字をアラビア数字に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/arabic-%E9%96%A2%E6%95%B0-9a8da418-c17b-4ef9-a657-9370a30a674f',
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
                url: 'https://support.microsoft.com/ja-jp/office/asin-%E9%96%A2%E6%95%B0-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
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
                url: 'https://support.microsoft.com/ja-jp/office/asinh-%E9%96%A2%E6%95%B0-4e00475a-067a-43cf-926a-765b0249717c',
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
                url: 'https://support.microsoft.com/ja-jp/office/atan-%E9%96%A2%E6%95%B0-50746fa8-630a-406b-81d0-4a2aed395543',
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
                url: 'https://support.microsoft.com/ja-jp/office/atan2-%E9%96%A2%E6%95%B0-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'x 座標', detail: '点の x 座標を指定します。' },
            yNum: { name: 'y 座標', detail: '点の y 座標を指定します。' },
        },
    },
    ATANH: {
        description: '数値の双曲線逆正接 (ハイパーボリック タンジェントの逆関数) を返します。',
        abstract: '数値の双曲線逆正接 (ハイパーボリック タンジェントの逆関数) を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/atanh-%E9%96%A2%E6%95%B0-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '-1 より大きく 1 より小さい実数を指定します。' },
        },
    },
    BASE: {
        description: '指定された基数 (底) のテキスト表現に、数値を変換します。',
        abstract: '指定された基数 (底) のテキスト表現に、数値を変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/base-%E9%96%A2%E6%95%B0-2ef61411-aee9-4f29-a811-1c42456c6342',
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
                url: 'https://support.microsoft.com/ja-jp/office/ceiling-%E9%96%A2%E6%95%B0-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
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
                url: 'https://support.microsoft.com/ja-jp/office/ceiling-math-%E9%96%A2%E6%95%B0-80f95d2f-b499-4eee-9f16-f795a8e306c8',
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
                url: 'https://support.microsoft.com/ja-jp/office/ceiling-precise-%E9%96%A2%E6%95%B0-f366a774-527a-4c92-ba49-af0a196e66cb',
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
                url: 'https://support.microsoft.com/ja-jp/office/combin-%E9%96%A2%E6%95%B0-12a3f276-0a21-423a-8de6-06990aaf638a',
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
                url: 'https://support.microsoft.com/ja-jp/office/combina-%E9%96%A2%E6%95%B0-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
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
                url: 'https://support.microsoft.com/ja-jp/office/cos-%E9%96%A2%E6%95%B0-0fb808a5-95d6-4553-8148-22aebdce5f05',
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
                url: 'https://support.microsoft.com/ja-jp/office/cosh-%E9%96%A2%E6%95%B0-e460d426-c471-43e8-9540-a57ff3b70555',
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
                url: 'https://support.microsoft.com/ja-jp/office/cot-%E9%96%A2%E6%95%B0-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
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
                url: 'https://support.microsoft.com/ja-jp/office/coth-%E9%96%A2%E6%95%B0-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
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
                url: 'https://support.microsoft.com/ja-jp/office/csc-%E9%96%A2%E6%95%B0-07379361-219a-4398-8675-07ddc4f135c1',
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
                url: 'https://support.microsoft.com/ja-jp/office/csch-%E9%96%A2%E6%95%B0-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
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
                url: 'https://support.microsoft.com/ja-jp/office/decimal-%E9%96%A2%E6%95%B0-ee554665-6176-46ef-82de-0a283658da2e',
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
                url: 'https://support.microsoft.com/ja-jp/office/degrees-%E9%96%A2%E6%95%B0-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
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
                url: 'https://support.microsoft.com/ja-jp/office/even-%E9%96%A2%E6%95%B0-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
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
                url: 'https://support.microsoft.com/ja-jp/office/exp-%E9%96%A2%E6%95%B0-c578f034-2c45-4c37-bc8c-329660a63abe',
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
                url: 'https://support.microsoft.com/ja-jp/office/fact-%E9%96%A2%E6%95%B0-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
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
                url: 'https://support.microsoft.com/ja-jp/office/factdouble-%E9%96%A2%E6%95%B0-e67697ac-d214-48eb-b7b7-cce2589ecac8',
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
                url: 'https://support.microsoft.com/ja-jp/office/floor-%E9%96%A2%E6%95%B0-14bb497c-24f2-4e04-b327-b0b4de5a8886',
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
                url: 'https://support.microsoft.com/ja-jp/office/floor-math-%E9%96%A2%E6%95%B0-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
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
                url: 'https://support.microsoft.com/ja-jp/office/floor-precise-%E9%96%A2%E6%95%B0-f769b468-1452-4617-8dc3-02f842a0702e',
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
                url: 'https://support.microsoft.com/ja-jp/office/gcd-%E9%96%A2%E6%95%B0-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
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
                url: 'https://support.microsoft.com/ja-jp/office/int-%E9%96%A2%E6%95%B0-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
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
                url: 'https://support.microsoft.com/ja-jp/office/iso-ceiling-%E9%96%A2%E6%95%B0-e587bb73-6cc2-4113-b664-ff5b09859a83',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LCM: {
        description: '最小公倍数を返します。',
        abstract: '最小公倍数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/lcm-%E9%96%A2%E6%95%B0-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '計算に使用する最初の値または範囲。' },
            number2: { name: '数値2', detail: '計算に使用する追加の値または範囲。' },
        },
    },
    LET: {
        description: '計算結果に名前を割り当てることにより、中間計算、値、定義名などを数式内に格納できます。',
        abstract: '計算結果に名前を割り当てることにより、中間計算、値、定義名などを数式内に格納できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/let-%E9%96%A2%E6%95%B0-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LN: {
        description: '数値の自然対数を返します。',
        abstract: '数値の自然対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ln-%E9%96%A2%E6%95%B0-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
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
                url: 'https://support.microsoft.com/ja-jp/office/log-%E9%96%A2%E6%95%B0-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
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
                url: 'https://support.microsoft.com/ja-jp/office/log10-%E9%96%A2%E6%95%B0-c75b881b-49dd-44fb-b6f4-37e3486a0211',
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
                url: 'https://support.microsoft.com/ja-jp/office/mdeterm-%E9%96%A2%E6%95%B0-e7bfa857-3834-422b-b871-0ffd03717020',
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
                url: 'https://support.microsoft.com/ja-jp/office/minverse-%E9%96%A2%E6%95%B0-11f55086-adde-4c9f-8eb9-59da2d72efc6',
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
                url: 'https://support.microsoft.com/ja-jp/office/mmult-%E9%96%A2%E6%95%B0-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
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
                url: 'https://support.microsoft.com/ja-jp/office/mod-%E9%96%A2%E6%95%B0-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
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
                url: 'https://support.microsoft.com/ja-jp/office/mround-%E9%96%A2%E6%95%B0-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
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
                url: 'https://support.microsoft.com/ja-jp/office/multinomial-%E9%96%A2%E6%95%B0-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
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
                url: 'https://support.microsoft.com/ja-jp/office/munit-%E9%96%A2%E6%95%B0-c9fe916a-dc26-4105-997d-ba22799853a3',
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
                url: 'https://support.microsoft.com/ja-jp/office/odd-%E9%96%A2%E6%95%B0-deae64eb-e08a-4c88-8b40-6d0b42575c98',
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
                url: 'https://support.microsoft.com/ja-jp/office/pi-%E9%96%A2%E6%95%B0-264199d0-a3ba-46b8-975a-c4a04608989b',
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
                url: 'https://support.microsoft.com/ja-jp/office/power-%E9%96%A2%E6%95%B0-d3f2908b-56f4-4c3f-895a-07fb519c362a',
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
                url: 'https://support.microsoft.com/ja-jp/office/product-%E9%96%A2%E6%95%B0-8e6b5b24-90ee-4650-aeec-80982a0512ce',
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
                url: 'https://support.microsoft.com/ja-jp/office/quotient-%E9%96%A2%E6%95%B0-9f7bf099-2a18-4282-8fa4-65290cc99dee',
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
                url: 'https://support.microsoft.com/ja-jp/office/radians-%E9%96%A2%E6%95%B0-ac409508-3d48-45f5-ac02-1497c92de5bf',
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
                url: 'https://support.microsoft.com/ja-jp/office/rand-%E9%96%A2%E6%95%B0-4cbfa695-8869-4788-8d90-021ea9f5be73',
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
                url: 'https://support.microsoft.com/ja-jp/office/randarray-%E9%96%A2%E6%95%B0-21261e55-3bec-4885-86a6-8b0a47fd4d33',
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
                url: 'https://support.microsoft.com/ja-jp/office/randbetween-%E9%96%A2%E6%95%B0-4cc7f0d1-87dc-4eb7-987f-a469ab381685',
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
                url: 'https://support.microsoft.com/ja-jp/office/roman-%E9%96%A2%E6%95%B0-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
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
                url: 'https://support.microsoft.com/ja-jp/office/round-%E9%96%A2%E6%95%B0-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
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
                url: 'https://support.microsoft.com/ja-jp/office/rounddown-%E9%96%A2%E6%95%B0-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
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
                url: 'https://support.microsoft.com/ja-jp/office/roundup-%E9%96%A2%E6%95%B0-f8bc9b23-e795-47db-8703-db171d0c42a7',
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
                url: 'https://support.microsoft.com/ja-jp/office/sec-%E9%96%A2%E6%95%B0-ff224717-9c87-4170-9b58-d069ced6d5f7',
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
                url: 'https://support.microsoft.com/ja-jp/office/sech-%E9%96%A2%E6%95%B0-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
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
                url: 'https://support.microsoft.com/ja-jp/office/seriessum-%E9%96%A2%E6%95%B0-a3ab25b5-1093-4f5b-b084-96c49087f637',
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
                url: 'https://support.microsoft.com/ja-jp/office/sequence-%E9%96%A2%E6%95%B0-57467a98-57e0-4817-9f14-2eb78519ca90',
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
                url: 'https://support.microsoft.com/ja-jp/office/sign-%E9%96%A2%E6%95%B0-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
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
                url: 'https://support.microsoft.com/ja-jp/office/sin-%E9%96%A2%E6%95%B0-cf0e3432-8b9e-483c-bc55-a76651c95602',
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
                url: 'https://support.microsoft.com/ja-jp/office/sinh-%E9%96%A2%E6%95%B0-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7',
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
                url: 'https://support.microsoft.com/ja-jp/office/sqrt-%E9%96%A2%E6%95%B0-654975c2-05c4-4831-9a24-2c65e4040fdf',
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
                url: 'https://support.microsoft.com/ja-jp/office/sqrtpi-%E9%96%A2%E6%95%B0-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
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
                url: 'https://support.microsoft.com/ja-jp/office/subtotal-%E9%96%A2%E6%95%B0-7b027003-f060-4ade-9040-e478765b9939',
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
                url: 'https://support.microsoft.com/ja-jp/office/sum-%E9%96%A2%E6%95%B0-043e1c7d-7726-4e80-8f32-07b23e057f89',
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
                url: 'https://support.microsoft.com/ja-jp/office/sumif-%E9%96%A2%E6%95%B0-169b8c99-c05c-4483-a712-1697a653039b',
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
                url: 'https://support.microsoft.com/ja-jp/office/sumifs-%E9%96%A2%E6%95%B0-c9e748f5-7ea7-455d-9406-611cebce642b',
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
                url: 'https://support.microsoft.com/ja-jp/office/sumproduct-%E9%96%A2%E6%95%B0-16753e75-9f68-4874-94ac-4d2145a2fd2e',
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
                url: 'https://support.microsoft.com/ja-jp/office/sumsq-%E9%96%A2%E6%95%B0-e3313c02-51cc-4963-aae6-31442d9ec307',
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
                url: 'https://support.microsoft.com/ja-jp/office/sumx2my2-%E9%96%A2%E6%95%B0-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
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
                url: 'https://support.microsoft.com/ja-jp/office/sumx2py2-%E9%96%A2%E6%95%B0-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
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
                url: 'https://support.microsoft.com/ja-jp/office/sumxmy2-%E9%96%A2%E6%95%B0-9d144ac1-4d79-43de-b524-e2ecee23b299',
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
                url: 'https://support.microsoft.com/ja-jp/office/tan-%E9%96%A2%E6%95%B0-08851a40-179f-4052-b789-d7f699447401',
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
                url: 'https://support.microsoft.com/ja-jp/office/tanh-%E9%96%A2%E6%95%B0-017222f0-a0c3-4f69-9787-b3202295dc6c',
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
                url: 'https://support.microsoft.com/ja-jp/office/trunc-%E9%96%A2%E6%95%B0-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '小数部を切り捨てる数値を指定します。' },
            numDigits: { name: '桁数', detail: '切り捨てを行った後の桁数を指定します。桁数の既定値は 0 (ゼロ) です。' },
        },
    },
};
