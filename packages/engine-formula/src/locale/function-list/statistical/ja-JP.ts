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
    AVEDEV: {
        description: 'データ全体の平均値に対するそれぞれのデータの絶対偏差の平均を返します。',
        abstract: 'データ全体の平均値に対するそれぞれのデータの絶対偏差の平均を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/avedev-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '平均を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            number2: { name: '数値 2', detail: '平均を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'AVERAGE.WEIGHTED 関数は、値とそれぞれに対応するウェイトを使用して、一連の値の加重平均を求めます。',
        abstract: 'AVERAGE.WEIGHTED 関数は、値とそれぞれに対応するウェイトを使用して、一連の値の加重平均を求めます。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9084098?hl=ja',
            },
        ],
        functionParameter: {
            values: { name: '値', detail: '平均化する値を指定します。 セルの範囲を参照することも、値を指定することもできます。' },
            weights: { name: 'ウェイト', detail: '適用するウェイトの対応するリストを指定します。 セルの範囲を参照することも、ウェイトを指定することもできます。 ウェイトには負の値を指定できませんが、ゼロは指定できます。 少なくとも 1 つのウェイトには正の値を指定してください。 セルの範囲を指定する場合、値の範囲と同じ数の行と列がセルの範囲に含まれている必要があります。' },
            additionalValues: { name: '追加の値', detail: '平均化する追加の値を指定します。 追加の値は省略可能です。' },
            additionalWeights: { name: '追加のウェイト', detail: '適用する追加のウェイトを指定します。 追加のウェイトは省略可能です。ただし、 追加の値 を指定する場合には、各値の後に 追加のウェイト をそれぞれ 1 つ指定するようにしてください。' },
        },
    },
    AVERAGEA: {
        description: '数値、文字列、および論理値を含む引数の平均値を返します。',
        abstract: '数値、文字列、および論理値を含む引数の平均値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/averagea-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/averageif-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/averageifs-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/beta-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/beta-inv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/binom-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/binom-dist-range-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/binom-inv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/chisq-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/chisq-dist-rt-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/chisq-inv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/chisq-inv-rt-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/chisq-test-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/confidence-norm-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/confidence-t-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/correl-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/count-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: '値 1', detail: '平均を求める 1 つ目の数値、セル参照、またはセル範囲を指定します。' },
            value2: { name: '値 2', detail: '平均を求める追加の数値、セル参照、または範囲 (最大 255)。' },
        },
    },
    COUNTBLANK: {
        description: '指定された範囲に含まれる空白セルの個数を返します。',
        abstract: '指定された範囲に含まれる空白セルの個数を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/countblank-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/use-the-countif-function-in-microsoft-excel',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/countifs-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/covariance-p-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/covariance-s-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/devsq-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/expon-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/f-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/f-dist-rt-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/f-inv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/f-inv-rt-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/f-test-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/fisher-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/fisherinv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/forecast-and-forecast-linear-functions',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: '目標日', detail: '値を予測する対象のデータ ポイントです。' },
            values: { name: '値', detail: '予測に使用する履歴値です。' },
            timeline: { name: 'タイムライン', detail: '一定の間隔を持つ数値の日付または時刻の独立した範囲または配列です。' },
            seasonality: { name: '季節性', detail: '省略可能。自動検出は 1、季節性なしは 0 を指定します。' },
            dataCompletion: { name: 'データ補完', detail: '省略可能。欠損点を補間する場合は 1、0 として扱う場合は 0 を指定します。' },
            aggregation: { name: '集計', detail: '省略可能。重複するタイムスタンプの集計方法を 1 から 7 で指定します。' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: '特定の目標日の予測値について信頼区間を返します。',
        abstract: '特定の目標日の予測値について信頼区間を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: '目標日', detail: '値を予測する対象のデータ ポイントです。' },
            values: { name: '値', detail: '予測に使用する履歴値です。' },
            timeline: { name: 'タイムライン', detail: '一定の間隔を持つ数値の日付または時刻の独立した範囲または配列です。' },
            confidenceLevel: { name: '信頼水準', detail: '省略可能。0 から 1 の数値です。既定値は 0.95 です。' },
            seasonality: { name: '季節性', detail: '省略可能。自動検出は 1、季節性なしは 0 を指定します。' },
            dataCompletion: { name: 'データ補完', detail: '省略可能。欠損点を補間する場合は 1、0 として扱う場合は 0 を指定します。' },
            aggregation: { name: '集計', detail: '省略可能。重複するタイムスタンプの集計方法を 1 から 7 で指定します。' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: '指定された時系列に見られる反復パターンの長さを返します。',
        abstract: '指定された時系列に見られる反復パターンの長さを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: '値', detail: '予測に使用する履歴値です。' },
            timeline: { name: 'タイムライン', detail: '一定の間隔を持つ数値の日付または時刻の独立した範囲または配列です。' },
            dataCompletion: { name: 'データ補完', detail: '省略可能。欠損点を補間する場合は 1、0 として扱う場合は 0 を指定します。' },
            aggregation: { name: '集計', detail: '省略可能。重複するタイムスタンプの集計方法を 1 から 7 で指定します。' },
        },
    },
    FORECAST_ETS_STAT: {
        description: '時系列予測の結果として統計値を返します。',
        abstract: '時系列予測の結果として統計値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: '値', detail: '予測に使用する履歴値です。' },
            timeline: { name: 'タイムライン', detail: '一定の間隔を持つ数値の日付または時刻の独立した範囲または配列です。' },
            statisticType: { name: '統計の種類', detail: '返す予測統計を 1 から 8 で指定します。' },
            seasonality: { name: '季節性', detail: '省略可能。自動検出は 1、季節性なしは 0 を指定します。' },
            dataCompletion: { name: 'データ補完', detail: '省略可能。欠損点を補間する場合は 1、0 として扱う場合は 0 を指定します。' },
            aggregation: { name: '集計', detail: '省略可能。重複するタイムスタンプの集計方法を 1 から 7 で指定します。' },
        },
    },
    FORECAST_LINEAR: {
        description: '既存の値に基づいて、将来価値を返します。',
        abstract: '既存の値に基づいて、将来価値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/forecast-and-forecast-linear-functions',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/frequency-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gamma-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gamma-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gamma-inv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gammaln-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gammaln-precise-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gauss-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/geomean-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/growth-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/harmean-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/hypgeom-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/intercept-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/kurt-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/large-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/linest-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/logest-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/lognorm-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/lognorm-inv-function',
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
                url: 'https://support.google.com/docs/answer/12487850?hl=ja',
            },
        ],
        functionParameter: {
            range: { name: '範囲', detail: 'MARGINOFERROR(A1:C3, 0.99)' },
            confidence: { name: '信頼レベル', detail: '0 ～ 1 の信頼レベル。' },
        },
    },
    MAX: {
        description: '引数リストに含まれる最大の数値を返します。',
        abstract: '引数リストに含まれる最大の数値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: {
                name: '数値 1',
                detail: '最大の値を見つけるため、最初の数値引数を指定します。',
            },
            number2: {
                name: '数値 2',
                detail: '最大の値を見つけるため、2 ～ 255 個までの数値引数を指定します。',
            },
        },
    },
    MAXA: {
        description: '数値、文字列、および論理値を含む引数リストから最大の数値を返します。',
        abstract: '数値、文字列、および論理値を含む引数リストから最大の数値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/maxa-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/maxifs-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/median-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/min-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/mina-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/minifs-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/mode-mult-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/mode-sngl-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/negbinom-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/norm-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/norm-inv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/norm-s-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/norm-s-inv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/pearson-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/percentile-exc-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/percentile-inc-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/percentrank-exc-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/percentrank-inc-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/permut-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/permutationa-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/phi-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/poisson-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/prob-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/quartile-exc-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/quartile-inc-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/rank-avg-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/rank-eq-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '既知の y', detail: '既知の従属変数の値が入力されているセル範囲または配列を指定します。' },
            knownXs: { name: '既知の x', detail: '既知の独立変数の値が入力されているセル範囲または配列を指定します。' },
        },
    },
    SKEW: {
        description: '分布の歪度を返します。',
        abstract: '分布の歪度を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/skew-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/skew-p-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/slope-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/small-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/standardize-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/stdev-p-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/stdev-s-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/stdeva-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/stdevpa-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/steyx-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/t-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/t-dist-2t-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/t-dist-rt-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/t-inv-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/t-inv-2t-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/t-test-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/trend-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/trimmean-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/var-p-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/var-s-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/vara-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/varpa-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/weibull-dist-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: 'x の検定対象となるデータを含む数値配列またはセル範囲を指定します。' },
            x: { name: 'x', detail: '検定する値を指定します。' },
            sigma: { name: '標準偏差', detail: '母集団全体に基づく標準偏差を指定します。 省略すると、標本に基づく標準偏差が使用されます。' },
        },
    },
};

export default locale;
