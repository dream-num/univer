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

export default {
    BETADIST: {
        description: 'β分布の累積分布関数の値を返します。',
        abstract: 'β分布の累積分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/betadist-%E9%96%A2%E6%95%B0-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BETAINV: {
        description: '指定されたβ分布の累積分布関数の逆関数の値を返します。',
        abstract: '指定されたβ分布の累積分布関数の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/betainv-%E9%96%A2%E6%95%B0-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BINOMDIST: {
        description: '二項分布の確率関数の値を返します。',
        abstract: '二項分布の確率関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/binomdist-%E9%96%A2%E6%95%B0-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHIDIST: {
        description: 'カイ 2 乗分布の片側確率の値を返します。',
        abstract: 'カイ 2 乗分布の片側確率の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chidist-%E9%96%A2%E6%95%B0-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHIINV: {
        description: 'カイ 2 乗分布の片側確率の逆関数の値を返します。',
        abstract: 'カイ 2 乗分布の片側確率の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chiinv-%E9%96%A2%E6%95%B0-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHITEST: {
        description: 'カイ 2 乗 (χ2) 検定を行います。',
        abstract: 'カイ 2 乗 (χ2) 検定を行います。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chitest-%E9%96%A2%E6%95%B0-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONFIDENCE: {
        description: '母集団に対する信頼区間を返します。',
        abstract: '母集団に対する信頼区間を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/confidence-%E9%96%A2%E6%95%B0-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COVAR: {
        description: '共分散を返します。共分散とは、2 組の対応するデータ間での標準偏差の積の平均値です。',
        abstract: '共分散を返します。共分散とは、2 組の対応するデータ間での標準偏差の積の平均値です。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/covar-%E9%96%A2%E6%95%B0-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CRITBINOM: {
        description: '累積二項分布の値が基準値以上になるような最小の値を返します。',
        abstract: '累積二項分布の値が基準値以上になるような最小の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/critbinom-%E9%96%A2%E6%95%B0-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXPONDIST: {
        description: '指数分布関数を返します。',
        abstract: '指数分布関数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/expondist-%E9%96%A2%E6%95%B0-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FDIST: {
        description: 'F 分布の確率関数の値を返します。',
        abstract: 'F 分布の確率関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/fdist-%E9%96%A2%E6%95%B0-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FINV: {
        description: 'F 分布の確率関数の逆関数値を返します。',
        abstract: 'F 分布の確率関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/finv-%E9%96%A2%E6%95%B0-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FTEST: {
        description: 'F 検定の結果を返します。',
        abstract: 'F 検定の結果を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ftest-%E9%96%A2%E6%95%B0-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMADIST: {
        description: 'ガンマ分布関数の値を返します。',
        abstract: 'ガンマ分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gammadist-%E9%96%A2%E6%95%B0-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMAINV: {
        description: 'ガンマ分布の累積分布関数の逆関数値を返します。',
        abstract: 'ガンマ分布の累積分布関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gammainv-%E9%96%A2%E6%95%B0-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HYPGEOMDIST: {
        description: '超幾何分布関数の値を返します。',
        abstract: '超幾何分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hypgeomdist-%E9%96%A2%E6%95%B0-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGINV: {
        description: '対数正規型の累積分布関数の逆関数の値を返します。',
        abstract: '対数正規型の累積分布関数の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/loginv-%E9%96%A2%E6%95%B0-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGNORMDIST: {
        description: '対数正規分布の累積分布関数の値を返します。',
        abstract: '対数正規分布の累積分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/lognormdist-%E9%96%A2%E6%95%B0-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MODE: {
        description: '最も頻繁に出現する値 (最頻値) を返します。',
        abstract: '最も頻繁に出現する値 (最頻値) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/mode-%E9%96%A2%E6%95%B0-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NEGBINOMDIST: {
        description: '負の二項分布の確率関数値を返します。',
        abstract: '負の二項分布の確率関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/negbinomdist-%E9%96%A2%E6%95%B0-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMDIST: {
        description: '正規分布の累積分布関数の値を返します。',
        abstract: '正規分布の累積分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/normdist-%E9%96%A2%E6%95%B0-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMINV: {
        description: '正規分布の累積分布関数の逆関数値を返します。',
        abstract: '正規分布の累積分布関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/norminv-%E9%96%A2%E6%95%B0-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMSDIST: {
        description: '標準正規分布の累積分布関数の値を返します。',
        abstract: '標準正規分布の累積分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/normsdist-%E9%96%A2%E6%95%B0-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMSINV: {
        description: '標準正規分布の累積分布関数の逆関数値を返します。',
        abstract: '標準正規分布の累積分布関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/normsinv-%E9%96%A2%E6%95%B0-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTILE: {
        description: '特定の範囲に含まれるデータの第 k 百分位数に当たる値を返します。',
        abstract: '特定の範囲に含まれるデータの第 k 百分位数に当たる値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/percentile-%E9%96%A2%E6%95%B0-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTRANK: {
        description: '配列内での値の順位を百分率で表した値を返します。',
        abstract: '配列内での値の順位を百分率で表した値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/percentrank-%E9%96%A2%E6%95%B0-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    POISSON: {
        description: 'ポアソン確率の値を返します。',
        abstract: 'ポアソン確率の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/poisson-%E9%96%A2%E6%95%B0-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    QUARTILE: {
        description: '配列に含まれるデータから四分位数を抽出します。',
        abstract: '配列に含まれるデータから四分位数を抽出します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/quartile-%E9%96%A2%E6%95%B0-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RANK: {
        description: '数値のリストの中で、指定した数値の序列を返します。',
        abstract: '数値のリストの中で、指定した数値の序列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rank-%E9%96%A2%E6%95%B0-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    STDEV: {
        description: '標本に基づいて標準偏差の推定値を計算します。 標準偏差とは、統計的な対象となる値がその平均からどれだけ広い範囲に分布しているかを計測したものです。',
        abstract: '引数を正規母集団の標本と見なし、標本に基づいて母集団の標準偏差の推定値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/stdev-%E9%96%A2%E6%95%B0-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '母集団の標本に対応する最初の数値引数を指定します。' },
            number2: { name: 'number2', detail: '母集団のサンプルに対応する引数 2 から 255 の数値。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    STDEVP: {
        description: '引数を母集団全体であると見なして、母集団の標準偏差を計算します。',
        abstract: '引数を母集団全体と見なし、母集団の標準偏差を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/stdevp-%E9%96%A2%E6%95%B0-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '母集団に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: '母集団に対応する引数 2 ~ 255 を数える。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    TDIST: {
        description: 'スチューデントの t 分布の値を返します。',
        abstract: 'スチューデントの t 分布の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tdist-%E9%96%A2%E6%95%B0-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TINV: {
        description: 'スチューデントの t 分布の逆関数値を返します。',
        abstract: 'スチューデントの t 分布の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tinv-%E9%96%A2%E6%95%B0-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TTEST: {
        description: 'スチューデントの t 分布に従う確率を返します。',
        abstract: 'スチューデントの t 分布に従う確率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ttest-%E9%96%A2%E6%95%B0-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VAR: {
        description: '標本に基づいて母集団の分散の推定値 (不偏分散) を返します。',
        abstract: '標本に基づいて母集団の分散の推定値 (不偏分散) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/var-%E9%96%A2%E6%95%B0-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '母集団の標本に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: '母集団のサンプルに対応する引数 2 から 255 の数値。' },
        },
    },
    VARP: {
        description: '引数を母集団全体と見なし、母集団の分散 (標本分散) を返します。',
        abstract: '引数を母集団全体と見なし、母集団の分散 (標本分散) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/varp-%E9%96%A2%E6%95%B0-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '母集団に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: '母集団に対応する引数 2 ~ 255 を数える。' },
        },
    },
    WEIBULL: {
        description: 'ワイブル分布の値を返します。',
        abstract: 'ワイブル分布の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/weibull-%E9%96%A2%E6%95%B0-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ZTEST: {
        description: 'z 検定の片側 P 値を返します。',
        abstract: 'z 検定の片側 P 値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ztest-%E9%96%A2%E6%95%B0-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
