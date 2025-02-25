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
    AVEDEV: {
        description: 'データ全体の平均値に対するそれぞれのデータの絶対偏差の平均を返します。',
        abstract: 'データ全体の平均値に対するそれぞれのデータの絶対偏差の平均を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/avedev-%E9%96%A2%E6%95%B0-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '平均を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '平均を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    AVERAGE: {
        description: '引数の平均値を返します。',
        abstract: '引数の平均値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/average-%E9%96%A2%E6%95%B0-047bac88-d466-426c-a32b-8f33eb960cf6',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '平均を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '平均を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: '指定した値と対応するウェイトに基づいて、一連の値の加重平均値を求めます。',
        abstract: '指定した値と対応するウェイトに基づいて、一連の値の加重平均値を求めます。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9084098?hl=ja&ref_topic=3105600&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            values: { name: '値', detail: '平均化する値を指定します。' },
            weights: { name: 'ウェイト', detail: '適用するウェイトの対応するリストを指定します。' },
            additionalValues: { name: '追加の値', detail: '平均化する追加の値を指定します。' },
            additionalWeights: { name: '追加のウェイト', detail: '適用する追加のウェイトを指定します。' },
        },
    },
    AVERAGEA: {
        description: '数値、文字列、および論理値を含む引数の平均値を返します。',
        abstract: '数値、文字列、および論理値を含む引数の平均値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/averagea-%E9%96%A2%E6%95%B0-f5f84098-d453-4f4c-bbba-3d2c66356091',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '平均を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            value2: { name: '値 2', detail: '平均を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    AVERAGEIF: {
        description: '範囲内の検索条件に一致するすべてのセルの平均値 (算術平均) を返します。',
        abstract: '範囲内の検索条件に一致するすべてのセルの平均値 (算術平均) を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/averageif-%E9%96%A2%E6%95%B0-faec8e2e-0dec-4308-af69-f5576d8ac642',
            },
        ],
        functionParameter: {
            range: { name: '範囲', detail: '平均する 1 つまたは複数のセル (数値、または数値を含む名前、配列、セル参照) を指定します。' },
            criteria: { name: '検索条件', detail: '平均の対象となるセルを定義する条件を数値、式、セル参照、または文字列で指定します。 たとえば、検索条件は 32、"32"、">32"、"Windows"、または B4 のようになります。' },
            averageRange: { name: '平均範囲', detail: '平均する実際のセルを指定します。 何も指定しないと、範囲が使用されます。' },
        },
    },
    AVERAGEIFS: {
        description: '複数の検索条件に一致するすべてのセルの平均値 (算術平均) を返します。',
        abstract: '複数の検索条件に一致するすべてのセルの平均値 (算術平均) を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/averageifs-%E9%96%A2%E6%95%B0-48910c45-1fc0-4389-a028-f7c5c3001690',
            },
        ],
        functionParameter: {
            averageRange: { name: '平均範囲', detail: '平均する 1 つまたは複数のセル (数値、または数値を含む名前、配列、セル参照) を指定します。' },
            criteriaRange1: { name: '条件範囲 1', detail: '条件で評価するセルのセットです。' },
            criteria1: { name: '条件 1', detail: '平均を計算するセルを定義するために使用されます。 たとえば、条件は 32、"32"、">32"、"apple"、または B4 のように表現できます。' },
            criteriaRange2: { name: '条件範囲 2', detail: '追加の範囲。 最大 127 の範囲のペアを入力できます。' },
            criteria2: { name: '条件 2', detail: '追加対応する条件です。 最大 127 条件のペアを入力できます。' },
        },
    },
    BETA_DIST: {
        description: 'β分布の累積分布関数の値を返します。',
        abstract: 'β分布の累積分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/beta-dist-%E9%96%A2%E6%95%B0-11188c9c-780a-42c7-ba43-9ecb5a878d31',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: 'その関数を計算するために使用される、下限値と上限値の間の値。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
            A: { name: '下限', detail: '関数の下限。デフォルト値は 0 です。' },
            B: { name: '上限', detail: '関数の上限。デフォルト値は 1 です。' },
        },
    },
    BETA_INV: {
        description: '指定されたβ分布の累積分布関数の逆関数の値を返します。',
        abstract: '指定されたβ分布の累積分布関数の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/beta-inv-%E9%96%A2%E6%95%B0-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
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
    BINOM_DIST: {
        description: '二項分布の確率関数の値を返します。',
        abstract: '二項分布の確率関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/binom-dist-%E9%96%A2%E6%95%B0-c5ae37b6-f39c-4be2-94c2-509a1480770c',
            },
        ],
        functionParameter: {
            numberS: { name: '成功数', detail: '試行における成功数を指定します。' },
            trials: { name: '試行回数', detail: '独立試行の回数を指定します。' },
            probabilityS: { name: '成功率', detail: '各試行が成功する確率を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    BINOM_DIST_RANGE: {
        description: '二項分布を使用した試行結果の確率を返します。',
        abstract: '二項分布を使用した試行結果の確率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/binom-dist-range-%E9%96%A2%E6%95%B0-17331329-74c7-4053-bb4c-6653a7421595',
            },
        ],
        functionParameter: {
            trials: { name: '試行回数', detail: '独立試行の回数を指定します。' },
            probabilityS: { name: '成功率', detail: '各試行が成功する確率を指定します。' },
            numberS: { name: '成功数', detail: '試行における成功数を指定します。' },
            numberS2: { name: '最大成功数', detail: '指定した場合、成功した試行回数が 成功数 と 最大成功数 の間に入る確率を返します。' },
        },
    },
    BINOM_INV: {
        description: '累積二項分布の値が基準値以上になるような最小の値を返します。',
        abstract: '累積二項分布の値が基準値以上になるような最小の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/binom-inv-%E9%96%A2%E6%95%B0-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
            },
        ],
        functionParameter: {
            trials: { name: '試行回数', detail: 'ベルヌーイ試行の回数を指定します。' },
            probabilityS: { name: '成功率', detail: '各試行が成功する確率を指定します。' },
            alpha: { name: '目標確率', detail: '基準値を指定します。' },
        },
    },
    CHISQ_DIST: {
        description: 'カイ 2 乗分布の左側確率の値を返します。',
        abstract: 'カイ 2 乗分布の左側確率の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chisq-dist-%E9%96%A2%E6%95%B0-8486b05e-5c05-4942-a9ea-f6b341518732',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '分布の評価に使用する値を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度を表す数値を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'カイ 2 乗分布の右側確率の値を返します。',
        abstract: 'カイ 2 乗分布の右側確率の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chisq-dist-rt-%E9%96%A2%E6%95%B0-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '分布の評価に使用する値を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度を表す数値を指定します。' },
        },
    },
    CHISQ_INV: {
        description: 'カイ 2 乗分布の左側確率の逆関数の値を返します。',
        abstract: 'カイ 2 乗分布の左側確率の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chisq-inv-%E9%96%A2%E6%95%B0-400db556-62b3-472d-80b3-254723e7092f',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'カイ 2 乗分布における確率を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度を表す数値を指定します。' },
        },
    },
    CHISQ_INV_RT: {
        description: 'カイ 2 乗分布の右側確率の逆関数の値を返します。',
        abstract: 'カイ 2 乗分布の右側確率の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chisq-inv-rt-%E9%96%A2%E6%95%B0-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'カイ 2 乗分布における確率を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度を表す数値を指定します。' },
        },
    },
    CHISQ_TEST: {
        description: 'カイ 2 乗 (χ2) 検定を行います。',
        abstract: 'カイ 2 乗 (χ2) 検定を行います。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chisq-test-%E9%96%A2%E6%95%B0-2e8a7861-b14a-4985-aa93-fb88de3f260f',
            },
        ],
        functionParameter: {
            actualRange: { name: '実測値範囲', detail: '期待値に対する検定の実測値が入力されているデータ範囲を指定します。' },
            expectedRange: { name: '期待値範囲', detail: '期待値が入力されているデータ範囲を指定します。実測値と期待値では、行方向の値の合計と列方向の値の合計がそれぞれ等しくなっている必要があります。' },
        },
    },
    CONFIDENCE_NORM: {
        description: '正規分布を使用して、母集団の平均に対する信頼区間を求めます。',
        abstract: '正規分布を使用して、母集団の平均に対する信頼区間を求めます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/confidence-norm-%E9%96%A2%E6%95%B0-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '信頼度を計算するために使用する有意水準を指定します。 信頼度は 100*(1- α)% で計算されます。つまり、α が 0.05 であるとき、信頼度は 95% になります。' },
            standardDev: { name: '標準偏差', detail: 'データ範囲の母標準偏差を指定します。これは既知の値であると仮定されます。' },
            size: { name: '標本数', detail: '標本数を指定します。' },
        },
    },
    CONFIDENCE_T: {
        description: 'スチューデントの t 分布を使用して、母集団に対する信頼区間を返します。',
        abstract: 'スチューデントの t 分布を使用して、母集団に対する信頼区間を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/confidence-t-%E9%96%A2%E6%95%B0-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '信頼度を計算するために使用する有意水準を指定します。 信頼度は 100*(1- α)% で計算されます。つまり、α が 0.05 であるとき、信頼度は 95% になります。' },
            standardDev: { name: '標準偏差', detail: 'データ範囲の母標準偏差を指定します。これは既知の値であると仮定されます。' },
            size: { name: '標本数', detail: '標本数を指定します。' },
        },
    },
    CORREL: {
        description: '2 つの配列データの相関係数を返します。',
        abstract: '2 つの配列データの相関係数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/correl-%E9%96%A2%E6%95%B0-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: 'セル値の最初の範囲。' },
            array2: { name: '配列2', detail: 'セル値の 2 番目の範囲。' },
        },
    },
    COUNT: {
        description: '引数リストの各項目に含まれる数値の個数を返します。',
        abstract: '引数リストの各項目に含まれる数値の個数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/count-%E9%96%A2%E6%95%B0-a59cd7fc-b623-4d93-87a4-d23bf411294c',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '数値の個数を調べる 1 つ目の項目、セル参照、またはセル範囲。' },
            value2: { name: '値 2', detail: '数値をカウントする追加の項目、セル参照、または範囲は最大 255 件です。' },
        },
    },
    COUNTA: {
        description: '引数リストの各項目に含まれるデータの個数を返します。',
        abstract: '引数リストの各項目に含まれるデータの個数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/counta-%E9%96%A2%E6%95%B0-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '計算対象として含める値を表す 1 つ目の引数。' },
            number2: { name: '数値 2', detail: 'カウントする値を表す追加の引数 (最大 255 個の引数)。' },
        },
    },
    COUNTBLANK: {
        description: '指定された範囲に含まれる空白セルの個数を返します。',
        abstract: '指定された範囲に含まれる空白セルの個数を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/countblank-%E9%96%A2%E6%95%B0-6a92d772-675c-4bee-b346-24af6bd3ac22',
            },
        ],
        functionParameter: {
            range: { name: '範囲', detail: '空白セルの個数を求めるセル範囲を指定します。' },
        },
    },
    COUNTIF: {
        description: '指定された範囲に含まれるセルのうち、検索条件に一致するセルの個数を返します。',
        abstract: '指定された範囲に含まれるセルのうち、検索条件に一致するセルの個数を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/countif-%E9%96%A2%E6%95%B0-e0de10c6-f885-4e71-abb4-1f464816df34',
            },
        ],
        functionParameter: {
            range: { name: '範囲', detail: '数えるセルのグループ。 範囲には、数値、配列、名前付き範囲、(数値を含む) 参照が入ります。 空の値とテキスト値は無視されます。' },
            criteria: { name: '検索条件', detail: '個数の計算対象となるセルを決定する条件を、数値、式、セル参照、または文字列で指定します。\nたとえば、数値として 32、比較演算子として ">32"、セル参照として B4、文字列として "リンゴ" などを指定できます。\nCOUNTIF で指定できるのは、単一の検索条件のみです。 複数の検索条件を指定する場合は、COUNTIFS を使います。' },
        },
    },
    COUNTIFS: {
        description: '指定された範囲に含まれるセルのうち、複数の検索条件に一致するセルの個数を返します。',
        abstract: '指定された範囲に含まれるセルのうち、複数の検索条件に一致するセルの個数を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/countifs-%E9%96%A2%E6%95%B0-dda3dc6e-f74e-4aee-88bc-aa8c2a866842',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: '条件範囲 1', detail: '対応する条件による評価の対象となる最初の範囲を指定します。' },
            criteria1: { name: '検索条件 1', detail: '計算の対象となるセルを定義する条件を数値、式、セル参照、または文字列で指定します。 たとえば、条件は 32、">32"、B4、"Windows"、または "32" のようになります。' },
            criteriaRange2: { name: '条件範囲 2', detail: '追加の範囲。 最大 127 の範囲のペアを入力できます。' },
            criteria2: { name: '条件 2', detail: '追加対応する条件です。 最大 127 条件のペアを入力できます。' },
        },
    },
    COVARIANCE_P: {
        description: '母共分散 (2 組の対応するデータ間での標準偏差の積の平均値) を返します。',
        abstract: '母共分散を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/covariance-p-%E9%96%A2%E6%95%B0-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: 'セル値の最初の範囲。' },
            array2: { name: '配列2', detail: 'セル値の 2 番目の範囲。' },
        },
    },
    COVARIANCE_S: {
        description: '標本の共分散 (2 組の対応するデータ間での標準偏差の積の平均値) を返します。',
        abstract: '標本の共分散を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/covariance-s-%E9%96%A2%E6%95%B0-0a539b74-7371-42aa-a18f-1f5320314977',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: 'セル値の最初の範囲。' },
            array2: { name: '配列2', detail: 'セル値の 2 番目の範囲。' },
        },
    },
    DEVSQ: {
        description: '標本の平均値に対する各データの偏差の平方和を返します。',
        abstract: '標本の平均値に対する各データの偏差の平方和を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/devsq-%E9%96%A2%E6%95%B0-8b739616-8376-4df5-8bd0-cfe0a6caf444',
            },
        ],
        functionParameter: {
            number1: { name: '数値1', detail: '偏差二乗の合計を計算するために使用される 1 番目のパラメーター。' },
            number2: { name: '数値2', detail: 'パラメータ 2 ～ 255 は、二乗偏差の合計を計算するために使用されます。' },
        },
    },
    EXPON_DIST: {
        description: '指数分布関数を返します。',
        abstract: '指数分布関数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/expon-dist-%E9%96%A2%E6%95%B0-4c12ae24-e563-4155-bf3e-8b78b6ae140e',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '分布の評価に使用する値を指定します。' },
            lambda: { name: 'lambda', detail: 'パラメーターの値を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    F_DIST: {
        description: 'F 分布の確率関数の値を返します。',
        abstract: 'F 分布の確率関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/f-dist-%E9%96%A2%E6%95%B0-a887efdc-7c8e-46cb-a74a-f884cd29b25d',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '関数に代入する値を指定します。' },
            degFreedom1: { name: '自由度の分子', detail: '自由度の分子を指定します。' },
            degFreedom2: { name: '自由度の分母', detail: '自由度の分母を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    F_DIST_RT: {
        description: 'F 分布の右側確率関数の値を返します。',
        abstract: 'F 分布の右側確率関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/f-dist-rt-%E9%96%A2%E6%95%B0-d74cbb00-6017-4ac9-b7d7-6049badc0520',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '関数に代入する値を指定します。' },
            degFreedom1: { name: '自由度の分子', detail: '自由度の分子を指定します。' },
            degFreedom2: { name: '自由度の分母', detail: '自由度の分母を指定します。' },
        },
    },
    F_INV: {
        description: 'F 分布の確率関数の逆関数値を返します。',
        abstract: 'F 分布の確率関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/f-inv-%E9%96%A2%E6%95%B0-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'F 累積分布における確率を指定します。' },
            degFreedom1: { name: '自由度の分子', detail: '自由度の分子を指定します。' },
            degFreedom2: { name: '自由度の分母', detail: '自由度の分母を指定します。' },
        },
    },
    F_INV_RT: {
        description: 'F 分布の右側確率関数の逆関数値を返します。',
        abstract: 'F 分布の右側確率関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/f-inv-rt-%E9%96%A2%E6%95%B0-d371aa8f-b0b1-40ef-9cc2-496f0693ac00',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'F 累積分布における確率を指定します。' },
            degFreedom1: { name: '自由度の分子', detail: '自由度の分子を指定します。' },
            degFreedom2: { name: '自由度の分母', detail: '自由度の分母を指定します。' },
        },
    },
    F_TEST: {
        description: 'F 検定の結果を返します。',
        abstract: 'F 検定の結果を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/f-test-%E9%96%A2%E6%95%B0-100a59e7-4108-46f8-8443-78ffacb6c0a7',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: '比較対象となる一方のデータを含む配列またはセル範囲を指定します。' },
            array2: { name: '配列2', detail: '比較対象となるもう一方のデータを含む配列またはセル範囲を指定します。' },
        },
    },
    FISHER: {
        description: 'フィッシャー変換の値を返します。',
        abstract: 'フィッシャー変換の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/fisher-%E9%96%A2%E6%95%B0-d656523c-5076-4f95-b87b-7741bf236c69',
            },
        ],
        functionParameter: {
            x: { name: '数値', detail: '変換の対象となる数値を指定します。' },
        },
    },
    FISHERINV: {
        description: 'フィッシャー変換の逆関数値を返します。',
        abstract: 'フィッシャー変換の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/fisherinv-%E9%96%A2%E6%95%B0-62504b39-415a-4284-a285-19c8e82f86bb',
            },
        ],
        functionParameter: {
            y: { name: '数値', detail: '逆変換の対象となる値を指定します。' },
        },
    },
    FORECAST: {
        description: '既知の値を使用し、将来の値を予測します。',
        abstract: '既知の値を使用し、将来の値を予測します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/forecast-%E5%92%8C-forecast-linear-%E5%87%BD%E6%95%B0-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '予測する従属変数の値に対する独立変数の値を、数値で示します。' },
            knownYs: { name: '既知の y', detail: '既知の従属変数の値が入力されているセル範囲または配列を指定します。' },
            knownXs: { name: '既知の x', detail: '既知の独立変数の値が入力されているセル範囲または配列を指定します。' },
        },
    },
    FORECAST_ETS: {
        description: '指数平滑化 (ETS) アルゴリズムの AAA バージョンを使って、既存の (履歴) 値に基づき将来価値を返します。',
        abstract: '指数平滑化 (ETS) アルゴリズムの AAA バージョンを使って、既存の (履歴) 値に基づき将来価値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/forecasting-%E9%96%A2%E6%95%B0-%E3%83%AA%E3%83%95%E3%82%A1%E3%83%AC%E3%83%B3%E3%82%B9-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: '特定の目標日の予測値について信頼区間を返します。',
        abstract: '特定の目標日の予測値について信頼区間を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/forecasting-%E9%96%A2%E6%95%B0-%E3%83%AA%E3%83%95%E3%82%A1%E3%83%AC%E3%83%B3%E3%82%B9-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.CONFINT',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: '指定された時系列に見られる反復パターンの長さを返します。',
        abstract: '指定された時系列に見られる反復パターンの長さを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/forecasting-%E9%96%A2%E6%95%B0-%E3%83%AA%E3%83%95%E3%82%A1%E3%83%AC%E3%83%B3%E3%82%B9-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.SEASONALITY',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_STAT: {
        description: '時系列予測の結果として統計値を返します。',
        abstract: '時系列予測の結果として統計値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/forecasting-%E9%96%A2%E6%95%B0-%E3%83%AA%E3%83%95%E3%82%A1%E3%83%AC%E3%83%B3%E3%82%B9-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.STAT',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_LINEAR: {
        description: '既存の値に基づいて、将来価値を返します。',
        abstract: '既存の値に基づいて、将来価値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/forecast-%E5%92%8C-forecast-linear-%E5%87%BD%E6%95%B0-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '予測する従属変数の値に対する独立変数の値を、数値で示します。' },
            knownYs: { name: '既知の y', detail: '既知の従属変数の値が入力されているセル範囲または配列を指定します。' },
            knownXs: { name: '既知の x', detail: '既知の独立変数の値が入力されているセル範囲または配列を指定します。' },
        },
    },
    FREQUENCY: {
        description: '頻度分布を縦方向の数値の配列として返します。',
        abstract: '頻度分布を縦方向の数値の配列として返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/frequency-%E9%96%A2%E6%95%B0-44e3be2b-eca0-42cd-a3f7-fd9ea898fdb9',
            },
        ],
        functionParameter: {
            dataArray: { name: 'データ配列', detail: '頻度分布の計算対象となる値セットの配列、またはこのセットへの参照を指定します。 データ配列に値が含まれていない場合は、0 の配列が返されます。' },
            binsArray: { name: '区間配列', detail: '区間配列の値をグループ化する間隔の配列、またはこの間隔への参照を指定します。 区間配列に値が含まれていない場合は、データ配列に指定した要素の数が返されます。' },
        },
    },
    GAMMA: {
        description: 'ガンマ関数値を返します。',
        abstract: 'ガンマ関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gamma-%E9%96%A2%E6%95%B0-ce1702b1-cf55-471d-8307-f83be0fc5297',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: 'ガンマ関数の入力値。' },
        },
    },
    GAMMA_DIST: {
        description: 'ガンマ分布関数の値を返します。',
        abstract: 'ガンマ分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gamma-dist-%E9%96%A2%E6%95%B0-9b6f1538-d11c-4d5f-8966-21f6a2201def',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    GAMMA_INV: {
        description: 'ガンマ分布の累積分布関数の逆関数値を返します。',
        abstract: 'ガンマ分布の累積分布関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gamma-inv-%E9%96%A2%E6%95%B0-74991443-c2b0-4be5-aaab-1aa4d71fbb18',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'ガンマ分布における確率を指定します。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
        },
    },
    GAMMALN: {
        description: 'ガンマ関数Γ(x) の値の自然対数を返します。',
        abstract: 'ガンマ関数Γ(x) の値の自然対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gammaln-%E9%96%A2%E6%95%B0-b838c48b-c65f-484f-9e1d-141c55470eb9',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'GAMMALN 関数に代入する値を指定します。' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'ガンマ関数Γ(x) の値の自然対数を返します。',
        abstract: 'ガンマ関数Γ(x) の値の自然対数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gammaln-precise-%E9%96%A2%E6%95%B0-5cdfe601-4e1e-4189-9d74-241ef1caa599',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'GAMMALN.PRECISE 関数に代入する値を指定します。' },
        },
    },
    GAUSS: {
        description: '標準正規分布の累積分布関数より 0.5 小さい値を返します。',
        abstract: '標準正規分布の累積分布関数より 0.5 小さい値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/gauss-%E9%96%A2%E6%95%B0-069f1b4e-7dee-4d6a-a71f-4b69044a6b33',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '関数に代入する値を指定します。' },
        },
    },
    GEOMEAN: {
        description: '相乗平均を返します。',
        abstract: '相乗平均を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/geomean-%E9%96%A2%E6%95%B0-db1ac48d-25a5-40a0-ab83-0b38980e40d5',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '相乗平均を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '相乗平均を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    GROWTH: {
        description: '指数曲線から予測される値を返します。',
        abstract: '指数曲線から予測される値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/growth-%E9%96%A2%E6%95%B0-541a91dc-3d5e-437d-b156-21324e68b80d',
            },
        ],
        functionParameter: {
            knownYs: { name: '既知の y', detail: '既にわかっている y の値の系列であり、y = b*m^x という関係が成り立ちます。' },
            knownXs: { name: '既知の x', detail: '既にわかっている x の値の系列であり、y = b*m^x という関係が成り立ちます。' },
            newXs: { name: '新しい x', detail: 'GROWTH 関数を利用して、対応する y の値を計算する新しい x の値を指定します。' },
            constb: { name: 'b', detail: '定数 b を 1 にするかどうかを論理値で指定します。' },
        },
    },
    HARMEAN: {
        description: '調和平均を返します。',
        abstract: '調和平均を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/harmean-%E9%96%A2%E6%95%B0-5efd9184-fab5-42f9-b1d3-57883a1d3bc6',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '調和平均を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '調和平均を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    HYPGEOM_DIST: {
        description: '超幾何分布関数の値を返します。',
        abstract: '超幾何分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hypgeom-dist-%E9%96%A2%E6%95%B0-6dbd547f-1d12-4b1f-8ae5-b0d9e3d22fbf',
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
    INTERCEPT: {
        description: '回帰直線の切片を返します。',
        abstract: '回帰直線の切片を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/intercept-%E9%96%A2%E6%95%B0-2a9b74e2-9d47-4772-b663-3bca70bf63ef',
            },
        ],
        functionParameter: {
            knownYs: { name: '既知の y', detail: '既知の従属変数の値が入力されているセル範囲または配列を指定します。' },
            knownXs: { name: '既知の x', detail: '既知の独立変数の値が入力されているセル範囲または配列を指定します。' },
        },
    },
    KURT: {
        description: '指定されたデータの尖度を返します。',
        abstract: '指定されたデータの尖度を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/kurt-%E9%96%A2%E6%95%B0-bc3a265c-5da4-4dcb-b7fd-c237789095ab',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '尖度を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '尖度を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    LARGE: {
        description: '指定されたデータの中で k 番目に大きなデータを返します。',
        abstract: '指定されたデータの中で k 番目に大きなデータを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/large-%E9%96%A2%E6%95%B0-3af0af19-1190-42bb-bb8b-01672ec00a64',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '抽出の対象となるデータが入力されているセル範囲または配列を指定します。' },
            k: { name: 'k', detail: '抽出する値の、大きい方から数えた順位を数値で指定します。' },
        },
    },
    LINEST: {
        description: '回帰直線の係数の値を配列で返します。',
        abstract: '回帰直線の係数の値を配列で返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/linest-%E9%96%A2%E6%95%B0-84d7d0d9-6e50-4101-977a-fa7abf772b6d',
            },
        ],
        functionParameter: {
            knownYs: { name: '既知の y', detail: '既にわかっている y の値の系列であり、y = m*x+b という関係が成り立ちます。' },
            knownXs: { name: '既知の x', detail: '既にわかっている x の値の系列であり、y = m*x+b という関係が成り立ちます。' },
            constb: { name: 'b', detail: '定数 b を 0 にするかどうかを論理値で指定します。' },
            stats: { name: '補正', detail: '回帰直線の補正項を追加情報として返すかどうかを論理値で指定します。' },
        },
    },
    LOGEST: {
        description: '回帰指数曲線の係数の値を配列で返します。',
        abstract: '回帰指数曲線の係数の値を配列で返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/logest-%E9%96%A2%E6%95%B0-f27462d8-3657-4030-866b-a272c1d18b4b',
            },
        ],
        functionParameter: {
            knownYs: { name: '既知の y', detail: '既にわかっている y の値の系列であり、y = b*m^x という関係が成り立ちます。' },
            knownXs: { name: '既知の x', detail: '既にわかっている x の値の系列であり、y = b*m^x という関係が成り立ちます。' },
            constb: { name: 'b', detail: '定数 b を 1 にするかどうかを論理値で指定します。' },
            stats: { name: '補正', detail: '回帰直線の補正項を追加情報として返すかどうかを論理値で指定します。' },
        },
    },
    LOGNORM_DIST: {
        description: '対数正規分布の累積分布関数の値を返します。',
        abstract: '対数正規分布の累積分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/lognorm-dist-%E9%96%A2%E6%95%B0-eb60d00b-48a9-4217-be2b-6074aee6b070',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    LOGNORM_INV: {
        description: '対数正規分布の累積分布関数の逆関数値を返します。',
        abstract: '対数正規分布の累積分布関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/lognorm-inv-%E9%96%A2%E6%95%B0-fe79751a-f1f2-4af8-a0a1-e151b2d4f600',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '対数正規分布における確率を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
        },
    },
    MARGINOFERROR: {
        description: 'この関数は、値の範囲と信頼レベルから誤差の範囲を計算します。',
        abstract: 'この関数は、値の範囲と信頼レベルから誤差の範囲を計算します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/12487850?hl=ja&sjid=11250989209896695200-AP',
            },
        ],
        functionParameter: {
            range: { name: '範囲', detail: '許容誤差の計算に使用される値の範囲。' },
            confidence: { name: '信頼レベル', detail: '0 ～ 1 の信頼レベル。' },
        },
    },
    MAX: {
        description: '引数リストに含まれる最大の数値を返します。',
        abstract: '引数リストに含まれる最大の数値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/max-%E9%96%A2%E6%95%B0-e0012414-9ac8-4b34-9a47-73e662c08098',
            },
        ],
        functionParameter: {
            value1: { name: '数値 1', detail: '最大の値を見つけるため、最初の数値引数を指定します。' },
            value2: { name: '数値 2', detail: '最大の値を見つけるため、2 ～ 255 個までの数値引数を指定します。' },
        },
    },
    MAXA: {
        description: '数値、文字列、および論理値を含む引数リストから最大の数値を返します。',
        abstract: '数値、文字列、および論理値を含む引数リストから最大の数値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/maxa-%E9%96%A2%E6%95%B0-814bda1e-3840-4bff-9365-2f59ac2ee62d',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '最大の値を見つけるため、最初の数値引数を指定します。' },
            value2: { name: '値 2', detail: '最大の値を見つけるため、2 ～ 255 個までの数値引数を指定します。' },
        },
    },
    MAXIFS: {
        description: '条件セットで指定されたセルの中の最大値を返します。',
        abstract: '条件セットで指定されたセルの中の最大値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/maxifs-%E9%96%A2%E6%95%B0-dfd611e6-da2c-488a-919b-9b6376b28883',
            },
        ],
        functionParameter: {
            maxRange: { name: '最大値範囲', detail: '最大値を求めるセルの実際の範囲です。' },
            criteriaRange1: { name: '条件範囲 1', detail: '条件で評価するセルのセットです。' },
            criteria1: { name: '条件 1', detail: '最大として評価されるセルを定義する、数値、式、またはテキストの形式での条件です。 同じ条件セットを、MINIFS、SUMIFS、および AVERAGEIFS 関数に対して使用できます。' },
            criteriaRange2: { name: '条件範囲 2', detail: '追加の範囲。 最大 127 の範囲のペアを入力できます。' },
            criteria2: { name: '条件 2', detail: '追加対応する条件です。 最大 127 条件のペアを入力できます。' },
        },
    },
    MEDIAN: {
        description: '引数リストに含まれる数値のメジアン (中央値) を返します。',
        abstract: '引数リストに含まれる数値のメジアン (中央値) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/median-%E9%96%A2%E6%95%B0-d0916313-4753-414c-8537-ce85bdd967d2',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '中央値を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '中央値を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    MIN: {
        description: '引数リストに含まれる最小の数値を返します。',
        abstract: '引数リストに含まれる最小の数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/min-%E9%96%A2%E6%95%B0-61635d12-920f-4ce2-a70f-96f202dcc152',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '最小値を計算する最初の数値、セル参照、またはセル範囲。' },
            number2: { name: '数値 2', detail: '最小値を計算するために、最大 255 個の追加の数値、セル参照、またはセル範囲を含めることができます。' },
        },
    },
    MINA: {
        description: '数値、文字列、および論理値を含む引数リストから最小の数値を返します。',
        abstract: '数値、文字列、および論理値を含む引数リストから最小の数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/mina-%E9%96%A2%E6%95%B0-245a6f46-7ca5-4dc7-ab49-805341bc31d3',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '最小値を計算する最初の数値、セル参照、またはセル範囲。' },
            value2: { name: '値 2', detail: '最小値を計算するために、最大 255 個の追加の数値、セル参照、またはセル範囲を含めることができます。' },
        },
    },
    MINIFS: {
        description: '条件セットで指定されたセルの中の最小値を返します。',
        abstract: '条件セットで指定されたセルの中の最小値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/minifs-%E9%96%A2%E6%95%B0-6ca1ddaa-079b-4e74-80cc-72eef32e6599',
            },
        ],
        functionParameter: {
            minRange: { name: '最少範囲', detail: '最小値を求めるセルの実際の範囲です。' },
            criteriaRange1: { name: '条件範囲 1', detail: '条件で評価するセルのセットです。' },
            criteria1: { name: '条件 1', detail: '最小として評価されるセルを定義する、数値、式、またはテキストの形式での条件です。 同じ条件セットを、MAXIFS、SUMIFS、および AVERAGEIFS 関数に対して使用できます。' },
            criteriaRange2: { name: '条件範囲 2', detail: '追加の範囲。 最大 127 の範囲のペアを入力できます。' },
            criteria2: { name: '条件 2', detail: '追加対応する条件です。 最大 127 条件のペアを入力できます。' },
        },
    },
    MODE_MULT: {
        description: '配列またはセル範囲として指定されたデータの中で、最も頻繁に出現する値 (最頻値) を縦方向の配列として返します。',
        abstract: '配列またはセル範囲として指定されたデータの中で、最も頻繁に出現する値 (最頻値) を縦方向の配列として返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/mode-mult-%E9%96%A2%E6%95%B0-50fd9464-b2ba-4191-b57a-39446689ae8c',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '最頻値を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '最頻値を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    MODE_SNGL: {
        description: '最も頻繁に出現する値 (最頻値) を返します。',
        abstract: '最も頻繁に出現する値 (最頻値) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/mode-sngl-%E9%96%A2%E6%95%B0-f1267c16-66c6-4386-959f-8fba5f8bb7f8',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '最頻値を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '最頻値を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    NEGBINOM_DIST: {
        description: '負の二項分布の確率関数値を返します。',
        abstract: '負の二項分布の確率関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/negbinom-dist-%E9%96%A2%E6%95%B0-c8239f89-c2d0-45bd-b6af-172e570f8599',
            },
        ],
        functionParameter: {
            numberF: { name: '失敗数', detail: '試行が失敗する回数を指定します。' },
            numberS: { name: '成功数', detail: '分析のしきい値となる、試行が成功する回数を指定します。' },
            probabilityS: { name: '成功率', detail: '試行が成功する確率を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    NORM_DIST: {
        description: '正規分布の累積分布関数の値を返します。',
        abstract: '正規分布の累積分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/norm-dist-%E9%96%A2%E6%95%B0-edb1cc14-a21c-4e53-839d-8082074c9f8d',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    NORM_INV: {
        description: '正規分布の累積分布関数の逆関数値を返します。',
        abstract: '正規分布の累積分布関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/norm-inv-%E9%96%A2%E6%95%B0-54b30935-fee7-493c-bedb-2278a9db7e13',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '正規分布における確率を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
        },
    },
    NORM_S_DIST: {
        description: '標準正規分布の累積分布関数の値を返します。',
        abstract: '標準正規分布の累積分布関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/norm-s-dist-%E9%96%A2%E6%95%B0-1e787282-3832-4520-a9ae-bd2a8d99ba88',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '関数に代入する値を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    NORM_S_INV: {
        description: '標準正規分布の累積分布関数の逆関数値を返します。',
        abstract: '標準正規分布の累積分布関数の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/norm-s-inv-%E9%96%A2%E6%95%B0-d6d556b4-ab7f-49cd-b526-5a20918452b1',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '正規分布における確率を指定します。' },
        },
    },
    PEARSON: {
        description: 'ピアソンの積率相関係数 r の値を返します。',
        abstract: 'ピアソンの積率相関係数 r の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/pearson-%E9%96%A2%E6%95%B0-0c3e30fc-e5af-49c4-808a-3ef66e034c18',
            },
        ],
        functionParameter: {
            array1: { name: '配列 1', detail: '複数の従属変数の値が入力されているセル範囲または配列を指定します。' },
            array2: { name: '配列 2', detail: '複数の独立変数の値が入力されているセル範囲または配列を指定します。' },
        },
    },
    PERCENTILE_EXC: {
        description: '配列内での第 k 百分位数に当たる値を返します (0と1は含まれません)。',
        abstract: '配列内での第 k 百分位数に当たる値を返します (0と1は含まれません)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/percentile-exc-%E9%96%A2%E6%95%B0-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '相対的な位置を決定するデータの配列またはセル範囲を指定します。' },
            k: { name: 'k', detail: '0 から 1 (0と1は含まれません)までのパーセント値。' },
        },
    },
    PERCENTILE_INC: {
        description: '配列内での第 k 百分位数に当たる値を返します (0と1が含まれています)。',
        abstract: '配列内での第 k 百分位数に当たる値を返します (0と1が含まれています)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/percentile-inc-%E9%96%A2%E6%95%B0-680f9539-45eb-410b-9a5e-c1355e5fe2ed',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '相対的な位置を決定するデータの配列またはセル範囲を指定します。' },
            k: { name: 'k', detail: '0 から 1 (0と1が含まれています)までのパーセント値。' },
        },
    },
    PERCENTRANK_EXC: {
        description: '配列内での値の順位を百分率で表した値を返します (0と1は含まれません)。',
        abstract: '配列内での値の順位を百分率で表した値を返します (0と1は含まれません)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/percentrank-exc-%E9%96%A2%E6%95%B0-d8afee96-b7e2-4a2f-8c01-8fcdedaa6314',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '相対的な位置を決定するデータの配列またはセル範囲を指定します。' },
            x: { name: 'x', detail: 'ランクを調べる値を指定します。' },
            significance: { name: '有効桁数', detail: '計算結果として返される百分率の有効桁数を指定します。 有効桁数を省略すると、小数点以下第 3 位 (0.xxx) まで計算されます。' },
        },
    },
    PERCENTRANK_INC: {
        description: '配列内での値の順位を百分率で表した値を返します (0と1が含まれています)。',
        abstract: '配列内での値の順位を百分率で表した値を返します (0と1が含まれています)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/percentrank-inc-%E9%96%A2%E6%95%B0-149592c9-00c0-49ba-86c1-c1f45b80463a',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '相対的な位置を決定するデータの配列またはセル範囲を指定します。' },
            x: { name: 'x', detail: 'ランクを調べる値を指定します。' },
            significance: { name: '有効桁数', detail: '計算結果として返される百分率の有効桁数を指定します。 有効桁数を省略すると、小数点以下第 3 位 (0.xxx) まで計算されます。' },
        },
    },
    PERMUT: {
        description: '与えられた標本数から指定した個数を選択する場合の順列を返します。',
        abstract: '与えられた標本数から指定した個数を選択する場合の順列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/permut-%E9%96%A2%E6%95%B0-3bd1cb9a-2880-41ab-a197-f246a7a602d3',
            },
        ],
        functionParameter: {
            number: { name: '総数', detail: '抜き取る対象の全体の数を指定します。' },
            numberChosen: { name: '抜き取り数', detail: '抜き取る順列わせ 1 組に含まれる項目の数を指定します。' },
        },
    },
    PERMUTATIONA: {
        description: '指定した数の対象から、指定された数だけ (重複あり) 抜き取る場合の順列の数を返します。',
        abstract: '指定した数の対象から、指定された数だけ (重複あり) 抜き取る場合の順列の数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/permutationa-%E9%96%A2%E6%95%B0-6c7d7fdc-d657-44e6-aa19-2857b25cae4e',
            },
        ],
        functionParameter: {
            number: { name: '総数', detail: '抜き取る対象の全体の数を指定します。' },
            numberChosen: { name: '抜き取り数', detail: '抜き取る順列わせ 1 組に含まれる項目の数を指定します。' },
        },
    },
    PHI: {
        description: '標準正規分布の密度関数の値を返します。',
        abstract: '標準正規分布の密度関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/phi-%E9%96%A2%E6%95%B0-23e49bc6-a8e8-402d-98d3-9ded87f6295c',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '標準正規分布の密度を求める数値を指定します。' },
        },
    },
    POISSON_DIST: {
        description: 'ポアソン確率の値を返します。',
        abstract: 'ポアソン確率の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/poisson-dist-%E9%96%A2%E6%95%B0-8fe148ff-39a2-46cb-abf3-7772695d9636',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    PROB: {
        description: '指定した範囲に含まれる値が上限と下限との間に収まる確率を返します。',
        abstract: '指定した範囲に含まれる値が上限と下限との間に収まる確率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/prob-%E9%96%A2%E6%95%B0-9ac30561-c81c-4259-8253-34f0a238fc49',
            },
        ],
        functionParameter: {
            xRange: { name: '数値', detail: 'それぞれの確率値を含む数値範囲。' },
            probRange: { name: '確率', detail: '数値に関連付けられた確率値のセット。' },
            lowerLimit: { name: '下限', detail: '確率が計算される数値の下限。' },
            upperLimit: { name: '上限', detail: '確率が計算される数値の上限。' },
        },
    },
    QUARTILE_EXC: {
        description: 'データセットの四分位数を返します (0と1は含まれません)。',
        abstract: 'データセットの四分位数を返します (0と1は含まれません)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/quartile-exc-%E9%96%A2%E6%95%B0-5a355b7a-840b-4a01-b0f1-f538c2864cad',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '四分位値を必要とする配列またはデータ範囲。' },
            quart: { name: '四分位値', detail: '返す四分位値。' },
        },
    },
    QUARTILE_INC: {
        description: 'データセットの四分位数を返します (0と1が含まれています)。',
        abstract: 'データセットの四分位数を返します (0と1が含まれています)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/quartile-inc-%E9%96%A2%E6%95%B0-1bbacc80-5075-42f1-aed6-47d735c4819d',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '四分位値を必要とする配列またはデータ範囲。' },
            quart: { name: '四分位値', detail: '返す四分位値。' },
        },
    },
    RANK_AVG: {
        description: '数値のリストの中で、指定した数値の序列を返します。',
        abstract: '数値のリストの中で、指定した数値の序列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rank-avg-%E9%96%A2%E6%95%B0-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '範囲内での順位 (位置) を調べる数値を指定します。' },
            ref: { name: '数値範囲', detail: '数値の一覧への参照。 参照に含まれる数値以外の値は無視されます。' },
            order: { name: '順序', detail: '範囲内の数値を並べる方法を指定します。降順の場合は 0 または省略され、昇順の場合は 0 以外です。' },
        },
    },
    RANK_EQ: {
        description: '数値のリストの中で、指定した数値の序列を返します。',
        abstract: '数値のリストの中で、指定した数値の序列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rank-eq-%E9%96%A2%E6%95%B0-284858ce-8ef6-450e-b662-26245be04a40',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '範囲内での順位 (位置) を調べる数値を指定します。' },
            ref: { name: '数値範囲', detail: '数値の一覧への参照。 参照に含まれる数値以外の値は無視されます。' },
            order: { name: '順序', detail: '範囲内の数値を並べる方法を指定します。降順の場合は 0 または省略され、昇順の場合は 0 以外です。' },
        },
    },
    RSQ: {
        description: 'ピアソンの積率相関係数の 2 乗値を返します。',
        abstract: 'ピアソンの積率相関係数の 2 乗値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rsq-%E9%96%A2%E6%95%B0-d7161715-250d-4a01-b80d-a8364f2be08f',
            },
        ],
        functionParameter: {
            array1: { name: '配列 1', detail: '複数の従属変数の値が入力されているセル範囲または配列を指定します。' },
            array2: { name: '配列 2', detail: '複数の独立変数の値が入力されているセル範囲または配列を指定します。' },
        },
    },
    SKEW: {
        description: '分布の歪度を返します。',
        abstract: '分布の歪度を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/skew-%E9%96%A2%E6%95%B0-bdf49d86-b1ef-4804-a046-28eaea69c9fa',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '歪度を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '歪度を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    SKEW_P: {
        description: 'サンプル母集団に基づいて分布の歪度を返します。',
        abstract: 'サンプル母集団に基づいて分布の歪度を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/skew-p-%E9%96%A2%E6%95%B0-76530a5c-99b9-48a1-8392-26632d542fcb',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '歪度を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '歪度を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    SLOPE: {
        description: '回帰直線の傾きを返します。',
        abstract: '回帰直線の傾きを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/slope-%E9%96%A2%E6%95%B0-11fb8f97-3117-4813-98aa-61d7e01276b9',
            },
        ],
        functionParameter: {
            knownYs: { name: '既知の y', detail: '既知の従属変数の値が入力されているセル範囲または配列を指定します。' },
            knownXs: { name: '既知の x', detail: '既知の独立変数の値が入力されているセル範囲または配列を指定します。' },
        },
    },
    SMALL: {
        description: '指定されたデータの中で、k 番目に小さなデータを返します。',
        abstract: '指定されたデータの中で、k 番目に小さなデータを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/small-%E9%96%A2%E6%95%B0-17da8222-7c82-42b2-961b-14c45384df07',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '抽出の対象となるデータが入力されているセル範囲または配列を指定します。' },
            k: { name: 'k', detail: '抽出する値の小さい方から数えた順位を数値で指定します。' },
        },
    },
    STANDARDIZE: {
        description: '正規化された値を返します。',
        abstract: '正規化された値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/standardize-%E9%96%A2%E6%95%B0-81d66554-2d54-40ec-ba83-6437108ee775',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            mean: { name: '平均', detail: '対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '対象となる分布の標準偏差を指定します。' },
        },
    },
    STDEV_P: {
        description: '引数を母集団全体であると見なして、母集団の標準偏差を返します (論理値と文字列は除く)。',
        abstract: '引数を母集団全体と見なし、母集団の標準偏差を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/stdev-p-%E9%96%A2%E6%95%B0-6e917c05-31a0-496f-ade7-4f4e7462f285',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '母集団に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: '母集団に対応する引数 2 から 254 までの数値。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    STDEV_S: {
        description: '引数を標本と見なし、標本に基づいて母集団の標準偏差の推定値を返します (標本の論理値と文字列は無視)。',
        abstract: '引数を正規母集団の標本と見なし、標本に基づいて母集団の標準偏差の推定値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/stdev-s-%E9%96%A2%E6%95%B0-7d69cf97-0c1f-4acf-be27-f3e83904cc23',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '母集団の標本に対応する最初の数値引数を指定します。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
            number2: { name: '数値 2', detail: '母集団のサンプルに対応する引数 2 ~ 254 を数値化します。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    STDEVA: {
        description: '数値、文字列、および論理値を含む引数を正規母集団の標本と見なし、母集団の標準偏差の推定値を返します。',
        abstract: '数値、文字列、および論理値を含む引数を正規母集団の標本と見なし、母集団の標準偏差の推定値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/stdeva-%E9%96%A2%E6%95%B0-5ff38888-7ea5-48de-9a6d-11ed73b29e9d',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '母集団の標本に対応する最初の値引数を指定します。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
            value2: { name: '値 2', detail: '母集団のサンプルに対応する引数 2 ~ 254 を値化します。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    STDEVPA: {
        description: '文字列や論理値を含む引数を母集団全体と見なして、母集団の標準偏差を計算します。',
        abstract: '数値、文字列、および論理値を含む引数を母集団全体と見なし、母集団の標準偏差を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/stdevpa-%E9%96%A2%E6%95%B0-5578d4d6-455a-4308-9991-d405afe2c28c',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '母集団に対応する最初の値引数を指定します。' },
            value2: { name: '値 2', detail: '母集団に対応する引数 2 から 254 までの値。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    STEYX: {
        description: '回帰直線上の予測値の標準誤差を返します。',
        abstract: '回帰直線上の予測値の標準誤差を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/steyx-%E9%96%A2%E6%95%B0-6ce74b2c-449d-4a6e-b9ac-f9cef5ba48ab',
            },
        ],
        functionParameter: {
            knownYs: { name: '既知の y', detail: '既知の従属変数の値が入力されているセル範囲または配列を指定します。' },
            knownXs: { name: '既知の x', detail: '既知の独立変数の値が入力されているセル範囲または配列を指定します。' },
        },
    },
    T_DIST: {
        description: 'スチューデントの t 確率分布を返します。',
        abstract: 'スチューデントの t 確率分布を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/t-dist-%E9%96%A2%E6%95%B0-4329459f-ae91-48c2-bba8-1ead1c6c21b2',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '分布の数値を計算する必要があります。' },
            degFreedom: { name: '自由度', detail: '自由度の数を表す整数。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    T_DIST_2T: {
        description: 'スチューデントの t 確率分布 (両側) を返します。',
        abstract: 'スチューデントの t 確率分布 (両側) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/t-dist-2t-%E9%96%A2%E6%95%B0-198e9340-e360-4230-bd21-f52f22ff5c28',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '分布の数値を計算する必要があります。' },
            degFreedom: { name: '自由度', detail: '自由度の数を表す整数。' },
        },
    },
    T_DIST_RT: {
        description: 'スチューデントの t 確率分布 (右側) を返します。',
        abstract: 'スチューデントの t 確率分布 (右側) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/t-dist-rt-%E9%96%A2%E6%95%B0-20a30020-86f9-4b35-af1f-7ef6ae683eda',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '分布の数値を計算する必要があります。' },
            degFreedom: { name: '自由度', detail: '自由度の数を表す整数。' },
        },
    },
    T_INV: {
        description: 'スチューデントの t 確率分布の逆関数値を返します。',
        abstract: 'スチューデントの t 確率分布の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/t-inv-%E9%96%A2%E6%95%B0-2908272b-4e61-4942-9df9-a25fec9b0e2e',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'スチューデントの t 分布に従う確率を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度の数を表す整数。' },
        },
    },
    T_INV_2T: {
        description: 'スチューデントの t 確率分布 (両側) の逆関数値を返します。',
        abstract: 'スチューデントの t 確率分布 (両側) の逆関数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/t-inv-2t-%E9%96%A2%E6%95%B0-ce72ea19-ec6c-4be7-bed2-b9baf2264f17',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: 'スチューデントの t 分布に従う確率を指定します。' },
            degFreedom: { name: '自由度', detail: '自由度の数を表す整数。' },
        },
    },
    T_TEST: {
        description: 'スチューデントの t 分布に従う確率を返します。',
        abstract: 'スチューデントの t 分布に従う確率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/t-test-%E9%96%A2%E6%95%B0-d4e08ec3-c545-485f-962e-276f7cbed055',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: '比較対象となる一方のデータを含む配列またはセル範囲を指定します。' },
            array2: { name: '配列2', detail: '比較対象となるもう一方のデータを含む配列またはセル範囲を指定します。' },
            tails: { name: '尾部の特性', detail: '片側分布を計算するか、両側分布を計算するかを、数値で指定します。 尾部に 1 を指定すると片側分布の値が計算されます。 尾部に 2 を指定すると両側分布の値が計算されます。' },
            type: { name: '検定の種類', detail: '実行する t 検定の種類を数値で指定します。' },
        },
    },
    TREND: {
        description: '回帰直線による予測値を配列で返します。',
        abstract: '回帰直線による予測値を配列で返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/trend-%E9%96%A2%E6%95%B0-e2f135f0-8827-4096-9873-9a7cf7b51ef1',
            },
        ],
        functionParameter: {
            knownYs: { name: '既知の y', detail: '既にわかっている y の値の系列であり、y = m*x+b という関係が成り立ちます。' },
            knownXs: { name: '既知の x', detail: '既にわかっている x の値の系列であり、y = m*x+b という関係が成り立ちます。' },
            newXs: { name: '新しい x', detail: 'TREND 関数を利用して、対応する y の値を計算する新しい x の値を指定します。' },
            constb: { name: 'b', detail: '定数 b を 0 にするかどうかを論理値で指定します。' },
        },
    },
    TRIMMEAN: {
        description: 'データの中間項の平均を返します。',
        abstract: 'データの中間項の平均を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/trimmean-%E9%96%A2%E6%95%B0-d90c9878-a119-4746-88fa-63d988f511d3',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '対象となる値の配列または範囲。' },
            percent: { name: '割合', detail: '計算から排除する端数のデータ ポイント数。' },
        },
    },
    VAR_P: {
        description: '引数を母集団全体と見なし、母集団の分散 (標本分散) を返します (母集団内の論理値と文字列は無視します)。',
        abstract: '引数を母集団全体と見なし、母集団の分散 (標本分散) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/var-p-%E9%96%A2%E6%95%B0-73d1285c-108c-4843-ba5d-a51f90656f3a',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '母集団に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: '母集団に対応する数値引数 2 ~ 254。' },
        },
    },
    VAR_S: {
        description: '引数を正規母集団の標本と見なし、標本に基づいて母集団の分散の推定値 (不偏分散) を返します (標本内の論理値と文字列は無視します)。',
        abstract: '標本に基づいて母集団の分散の推定値 (不偏分散) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/var-s-%E9%96%A2%E6%95%B0-913633de-136b-449d-813e-65a00b2b990b',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '母集団の標本に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: '母集団のサンプルに対応する引数 2 ~ 254 を数値化します。' },
        },
    },
    VARA: {
        description: '数値、文字列、および論理値を含む引数を正規母集団の標本と見なし、標本に基づいて母集団の分散の推定値 (不偏分散) を返します。',
        abstract: '数値、文字列、および論理値を含む引数を正規母集団の標本と見なし、標本に基づいて母集団の分散の推定値 (不偏分散) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/vara-%E9%96%A2%E6%95%B0-3de77469-fa3a-47b4-85fd-81758a1e1d07',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '母集団の標本に対応する最初の値引数を指定します。' },
            value2: { name: '値 2', detail: '母集団のサンプルに対応する引数 2 ~ 254 を値化します。' },
        },
    },
    VARPA: {
        description: '数値、文字列、および論理値を含む引数を母集団全体と見なし、母集団の分散 (標本分散) を返します。',
        abstract: '数値、文字列、および論理値を含む引数を母集団全体と見なし、母集団の分散 (標本分散) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/varpa-%E9%96%A2%E6%95%B0-59a62635-4e89-4fad-88ac-ce4dc0513b96',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '母集団に対応する最初の値引数を指定します。' },
            value2: { name: '値 2', detail: '母集団に対応する値引数 2 ~ 254。' },
        },
    },
    WEIBULL_DIST: {
        description: 'ワイブル分布の値を返します。',
        abstract: 'ワイブル分布の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/weibull-dist-%E9%96%A2%E6%95%B0-4e783c39-9325-49be-bbc9-a83ef82b45db',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '関数に代入する値を指定します。' },
            alpha: { name: 'alpha', detail: '分布の最初のパラメータ。' },
            beta: { name: 'beta', detail: '分布の 2 番目のパラメーター。' },
            cumulative: { name: '累積', detail: '計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定すると累積分布関数の値が計算され、FALSE を指定すると確率密度関数の値が計算されます。' },
        },
    },
    Z_TEST: {
        description: 'z 検定の片側 P 値を返します。',
        abstract: 'z 検定の片側 P 値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/z-test-%E9%96%A2%E6%95%B0-d633d5a3-2031-4614-a016-92180ad82bee',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: 'x の検定対象となるデータを含む数値配列またはセル範囲を指定します。' },
            x: { name: 'x', detail: '検定する値を指定します。' },
            sigma: { name: '標準偏差', detail: '母集団全体に基づく標準偏差を指定します。 省略すると、標本に基づく標準偏差が使用されます。' },
        },
    },
};
