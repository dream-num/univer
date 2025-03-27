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
            x: { name: '値', detail: 'その関数を計算するために使用される、下限値と上限値の間の値。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
            A: { name: '下限', detail: '関数の下限。デフォルト値は 0 です。' },
            B: { name: '上限', detail: '関数の上限。デフォルト値は 1 です。' },
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
            probability: { name: '確率', detail: 'β分布における確率を指定します。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
            A: { name: '下限', detail: '関数の下限。デフォルト値は 0 です。' },
            B: { name: '上限', detail: '関数の上限。デフォルト値は 1 です。' },
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
            numberS: { name: '成功数', detail: '試行における成功数を指定します。' },
            trials: { name: '試行回数', detail: '独立試行の回数を指定します。' },
            probabilityS: { name: '成功率', detail: '各試行が成功する確率を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    CHIDIST: {
        description: 'カイ 2 乗分布の右側確率の値を返します。',
        abstract: 'カイ 2 乗分布の右側確率の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chidist-%E9%96%A2%E6%95%B0-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '分布の評価に使用する値を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度を表す数値を指定します。' },
        },
    },
    CHIINV: {
        description: 'カイ 2 乗分布の右側確率の逆関数の値を返します。',
        abstract: 'カイ 2 乗分布の右側確率の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chiinv-%E9%96%A2%E6%95%B0-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'カイ 2 乗分布における確率を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度を表す数値を指定します。' },
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
            actualRange: { name: '実測値範囲', detail: '期待値に対する検定の実測値が入力されているデータ範囲を指定します。' },
            expectedRange: { name: '期待値範囲', detail: '期待値が入力されているデータ範囲を指定します。実測値と期待値では、行方向の値の合計と列方向の値の合計がそれぞれ等しくなっている必要があります。' },
        },
    },
    CONFIDENCE: {
        description: '正規分布を使用して、母集団の平均に対する信頼区間を求めます。',
        abstract: '正規分布を使用して、母集団の平均に対する信頼区間を求めます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/confidence-%E9%96%A2%E6%95%B0-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '信頼度を計算するために使用する有意水準を指定します。 信頼度は 100*(1- α)% で計算されます。つまり、α が 0.05 であるとき、信頼度は 95% になります。' },
            standardDev: { name: '標準偏差', detail: 'データ範囲の母標準偏差を指定します。これは既知の値であると仮定されます。' },
            size: { name: '標本数', detail: '標本数を指定します。' },
        },
    },
    COVAR: {
        description: '母共分散 (2 組の対応するデータ間での標準偏差の積の平均値) を返します。',
        abstract: '母共分散を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/covar-%E9%96%A2%E6%95%B0-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: 'セル値の最初の範囲。' },
            array2: { name: '配列2', detail: 'セル値の 2 番目の範囲。' },
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
            trials: { name: '試行回数', detail: 'ベルヌーイ試行の回数を指定します。' },
            probabilityS: { name: '成功率', detail: '各試行が成功する確率を指定します。' },
            alpha: { name: '目標確率', detail: '基準値を指定します。' },
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
            x: { name: '値', detail: '分布の評価に使用する値を指定します。' },
            lambda: { name: 'lambda', detail: 'パラメーターの値を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    FDIST: {
        description: 'F 分布の右側確率関数の値を返します。',
        abstract: 'F 分布の右側確率関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/fdist-%E9%96%A2%E6%95%B0-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '関数に代入する値を指定します。' },
            degFreedom1: { name: '自由度の分子', detail: '自由度の分子を指定します。' },
            degFreedom2: { name: '自由度の分母', detail: '自由度の分母を指定します。' },
        },
    },
    FINV: {
        description: 'F 分布の右側確率関数の逆関数値を返します。',
        abstract: 'F 分布の右側確率関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/finv-%E9%96%A2%E6%95%B0-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'F 累積分布における確率を指定します。' },
            degFreedom1: { name: '自由度の分子', detail: '自由度の分子を指定します。' },
            degFreedom2: { name: '自由度の分母', detail: '自由度の分母を指定します。' },
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
            array1: { name: '配列1', detail: '比較対象となる一方のデータを含む配列またはセル範囲を指定します。' },
            array2: { name: '配列2', detail: '比較対象となるもう一方のデータを含む配列またはセル範囲を指定します。' },
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
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
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
            probability: { name: '確率', detail: 'ガンマ分布における確率を指定します。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
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
            sampleS: { name: '標本の成功数', detail: '標本内で成功する数を指定します。' },
            numberSample: { name: '標本数', detail: '標本数を指定します。' },
            populationS: { name: '母集団の成功数', detail: '母集団内で成功する数を指定します。' },
            numberPop: { name: '母集団の大きさ', detail: '母集団全体の数を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    LOGINV: {
        description: '対数正規分布の累積分布関数の逆関数の値を返します。',
        abstract: '対数正規分布の累積分布関数の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/loginv-%E9%96%A2%E6%95%B0-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '対数正規分布における確率を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
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
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
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
            number1: { name: '数値 1', detail: '最頻値を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '最頻値を求める追加の数値、セル参照、または範囲 (最大 255)。' },
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
            numberF: { name: '失敗数', detail: '試行が失敗する回数を指定します。' },
            numberS: { name: '成功数', detail: '分析のしきい値となる、試行が成功する回数を指定します。' },
            probabilityS: { name: '成功率', detail: '試行が成功する確率を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
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
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
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
            probability: { name: '確率', detail: '正規分布における確率を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
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
            z: { name: 'z', detail: '関数に代入する値を指定します。' },
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
            probability: { name: '確率', detail: '正規分布における確率を指定します。' },
        },
    },
    PERCENTILE: {
        description: '配列内での第 k 百分位数に当たる値を返します (0と1が含まれています)。',
        abstract: '配列内での第 k 百分位数に当たる値を返します (0と1が含まれています)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/percentile-%E9%96%A2%E6%95%B0-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '相対的な位置を決定するデータの配列またはセル範囲を指定します。' },
            k: { name: 'k', detail: '0 から 1 (0と1が含まれています)までのパーセント値。' },
        },
    },
    PERCENTRANK: {
        description: '配列内での値の順位を百分率で表した値を返します (0と1が含まれています)。',
        abstract: '配列内での値の順位を百分率で表した値を返します (0と1が含まれています)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/percentrank-%E9%96%A2%E6%95%B0-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '相対的な位置を決定するデータの配列またはセル範囲を指定します。' },
            x: { name: 'x', detail: 'ランクを調べる値を指定します。' },
            significance: { name: '有効桁数', detail: '計算結果として返される百分率の有効桁数を指定します。 有効桁数を省略すると、小数点以下第 3 位 (0.xxx) まで計算されます。' },
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
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    QUARTILE: {
        description: 'データセットの四分位数を返します (0と1が含まれています)。',
        abstract: 'データセットの四分位数を返します (0と1が含まれています)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/quartile-%E9%96%A2%E6%95%B0-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '四分位値を必要とする配列またはデータ範囲。' },
            quart: { name: '四分位値', detail: '返す四分位値。' },
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
            number: { name: '数値', detail: '範囲内での順位 (位置) を調べる数値を指定します。' },
            ref: { name: '数値範囲', detail: '数値の一覧への参照。 参照に含まれる数値以外の値は無視されます。' },
            order: { name: '順序', detail: '範囲内の数値を並べる方法を指定します。降順の場合は 0 または省略され、昇順の場合は 0 以外です。' },
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
        description: 'スチューデントの t 確率分布を返します。',
        abstract: 'スチューデントの t 確率分布を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tdist-%E9%96%A2%E6%95%B0-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '分布の数値を計算する必要があります。' },
            degFreedom: { name: '自由度', detail: '自由度の数を表す整数。' },
            tails: { name: '尾部の特性', detail: '片側分布を計算するか、両側分布を計算するかを、数値で指定します。 尾部に 1 を指定すると片側分布の値が計算されます。 尾部に 2 を指定すると両側分布の値が計算されます。' },
        },
    },
    TINV: {
        description: 'スチューデントの t 確率分布 (両側) の逆関数値を返します。',
        abstract: 'スチューデントの t 確率分布 (両側) の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tinv-%E9%96%A2%E6%95%B0-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'スチューデントの t 分布に従う確率を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度の数を表す整数。' },
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
            array1: { name: '配列1', detail: '比較対象となる一方のデータを含む配列またはセル範囲を指定します。' },
            array2: { name: '配列2', detail: '比較対象となるもう一方のデータを含む配列またはセル範囲を指定します。' },
            tails: { name: '尾部の特性', detail: '片側分布を計算するか、両側分布を計算するかを、数値で指定します。 尾部に 1 を指定すると片側分布の値が計算されます。 尾部に 2 を指定すると両側分布の値が計算されます。' },
            type: { name: '検定の種類', detail: '実行する t 検定の種類を数値で指定します。' },
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
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
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
            array: { name: '配列', detail: 'x の検定対象となるデータを含む数値配列またはセル範囲を指定します。' },
            x: { name: 'x', detail: '検定する値を指定します。' },
            sigma: { name: '標準偏差', detail: '母集団全体に基づく標準偏差を指定します。 省略すると、標本に基づく標準偏差が使用されます。' },
        },
    },
};
