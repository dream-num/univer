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
    BETADIST: {
        description: '累積β確率密度関数の値を返します。 β分布は、複数の標本を対象に割合の変化を分析する場合などに使用します (たとえば、複数の人が 1 日のうちにテレビを見ている時間の割合を算出するときは、この関数を使用します)。',
        abstract: '累積β確率密度関数の値を返します。 β分布は、複数の標本を対象に割合の変化を分析する場合などに使用します (たとえば、複数の人が 1 日のうちにテレビを見ている時間の割合を算出するときは、この関数を使用します)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '必須。 区間 A ～ B の範囲内で、関数を評価する時点を指定します。' },
            alpha: { name: 'alpha', detail: '必須。 確率分布のパラメーターを指定します。' },
            beta: { name: 'beta', detail: '必須。 確率分布のパラメーターを指定します。' },
            A: { name: '下限', detail: '。 x の区間の下限を指定します。' },
            B: { name: '上限', detail: '省略可能。 x の区間の上限を指定します。' },
        },
    },
    BETAINV: {
        description: '指定されたβ分布の累積β確率密度関数の逆関数の値を返します。 つまり、確率 = BETADIST(x,...) の場合は、BETAINV(確率,...) = x となります。 β分布は、プロジェクト計画などで、期待される完了時間と公差を指定して予想完了時間をモデル化する場合に使用できます。',
        abstract: '指定されたβ分布の累積β確率密度関数の逆関数の値を返します。 つまり、確率 = BETADIST(x,...) の場合は、BETAINV(確率,...) = x となります。 β分布は、プロジェクト計画などで、期待される完了時間と公差を指定して予想完了時間をモデル化する場合に使用できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '必須。 β分布における確率を指定します。' },
            alpha: { name: 'alpha', detail: '必須。 確率分布のパラメーターを指定します。' },
            beta: { name: 'beta', detail: '必須。 確率分布のパラメーターを指定します。' },
            A: { name: '下限', detail: '。 x の区間の下限を指定します。' },
            B: { name: '上限', detail: '省略可能。 x の区間の上限を指定します。' },
        },
    },
    BINOMDIST: {
        description: '単一項の二項分布確率を返します。 BINOMDIST 関数は、テストや試行の回数が固定されている問題で、どの試行の結果も成功または失敗のみで表される場合、各試行が独立している場合、および試行全体をとおして成功の確率が一定である場合に使用します。 たとえば、二男一女が生まれてくる確率などを BINOMDIST で計算できます。',
        abstract: '単一項の二項分布確率を返します。 BINOMDIST 関数は、テストや試行の回数が固定されている問題で、どの試行の結果も成功または失敗のみで表される場合、各試行が独立している場合、および試行全体をとおして成功の確率が一定である場合に使用します。 たとえば、二男一女が生まれてくる確率などを BINOMDIST で計算できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: '成功数', detail: '必須。 試行における成功数を指定します。' },
            trials: { name: '試行回数', detail: '必須。 独立試行の回数を指定します。' },
            probabilityS: { name: '成功率', detail: '必須。 各試行が成功する確率を指定します。' },
            cumulative: { name: '累積', detail: '必須。 計算に使用する関数の形式を論理値で指定します。 関数形式に TRUE を指定した場合、BINOM.DIST 関数の戻り値は累積分布関数となり、0 ～成功数回の範囲で成功が得られる確率が計算されます。FALSE の場合は、確率質量関数となり、成功数回の成功が得られる確率が計算されます。' },
        },
    },
    CHIDIST: {
        description: 'カイ 2 乗分布の右側確率の値を返します。 χ2 分布は χ2 検定と関連しています。 χ2 検定は、実測値と期待値を比較するときに使用します。 たとえば、ある植物の遺伝子実験で、次の世代の花には一定の色の組み合わせが発生するという仮説を立てたとします。 ここで、予測された色と観察の結果を比較することにより、仮説の妥当性を検定することができます。',
        abstract: 'カイ 2 乗分布の右側確率の値を返します。 χ2 分布は χ2 検定と関連しています。 χ2 検定は、実測値と期待値を比較するときに使用します。 たとえば、ある植物の遺伝子実験で、次の世代の花には一定の色の組み合わせが発生するという仮説を立てたとします。 ここで、予測された色と観察の結果を比較することにより、仮説の妥当性を検定することができます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '必須。 分布の評価に使用する値を指定します。' },
            degFreedom: { name: '自由度', detail: '必須。 自由度を表す数値を指定します。' },
        },
    },
    CHIINV: {
        description: 'カイ 2 乗分布の右側確率の逆関数の値を返します。 つまり、確率 = CHIDIST(x,...) の場合は、CHIINV(確率,...) = x となります。 この関数は、実測値と期待値を比較して、仮説の妥当性を検定するために使います。',
        abstract: 'カイ 2 乗分布の右側確率の逆関数の値を返します。 つまり、確率 = CHIDIST(x,...) の場合は、CHIINV(確率,...) = x となります。 この関数は、実測値と期待値を比較して、仮説の妥当性を検定するために使います。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '必須。 カイ 2 乗分布における確率を指定します。' },
            degFreedom: { name: '自由度', detail: '必須。 自由度を表す数値を指定します。' },
        },
    },
    CHITEST: {
        description: 'カイ 2 乗 (χ2) 検定を行います。 CHITEST は、統計と適切な自由度に対するカイ 2 乗 (χ2) 分布の値を返します。 χ2 検定を使用して、仮説による結果が実験によって検証されるかどうかを判断できます。',
        abstract: 'カイ 2 乗 (χ2) 検定を行います。 CHITEST は、統計と適切な自由度に対するカイ 2 乗 (χ2) 分布の値を返します。 χ2 検定を使用して、仮説による結果が実験によって検証されるかどうかを判断できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: '実測値範囲', detail: '必須。 期待値に対する検定の実測値が入力されているデータ範囲を指定します。' },
            expectedRange: { name: '期待値範囲', detail: '必須。 期待値が入力されているデータ範囲を指定します。実測値と期待値では、行方向の値の合計と列方向の値の合計がそれぞれ等しくなっている必要があります。' },
        },
    },
    CONFIDENCE: {
        description: '正規分布を使用して、母集団の平均に対する信頼区間を求めます。',
        abstract: '正規分布を使用して、母集団の平均に対する信頼区間を求めます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '必須。 信頼度を計算するために使用する有意水準を指定します。 信頼度は 100*(1- α)% で計算されます。つまり、α が 0.05 であるとき、信頼度は 95% になります。' },
            standardDev: { name: '標準偏差', detail: '必須。 データ範囲の母標準偏差を指定します。これは既知の値であると仮定されます。' },
            size: { name: '標本数', detail: '必須。 標本数を指定します。' },
        },
    },
    COVAR: {
        description: '共分散 (2 つのデータ セット内の各データ ポイント ペアの偏差積の平均) を返します。',
        abstract: '共分散 (2 つのデータ セット内の各データ ポイント ペアの偏差積の平均) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: '必須。 整数のデータが入力されている一方のセル範囲を指定します。' },
            array2: { name: '配列2', detail: '必須。 整数のデータが入力されているもう一方のセル範囲を指定します。' },
        },
    },
    CRITBINOM: {
        description: '累積二項分布が基準値以上になる最小値を返します。 この関数は、品質保証アプリケーションに使用します。 たとえば、CRITBINOM 関数を使用して、ロット全体は不合格にせずに作業工程から除外できる欠陥部品の最大数を決定できます。',
        abstract: '累積二項分布が基準値以上になる最小値を返します。 この関数は、品質保証アプリケーションに使用します。 たとえば、CRITBINOM 関数を使用して、ロット全体は不合格にせずに作業工程から除外できる欠陥部品の最大数を決定できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: '試行回数', detail: '必須。 ベルヌーイ試行の回数を指定します。' },
            probabilityS: { name: '成功率', detail: '必須。 各試行が成功する確率を指定します。' },
            alpha: { name: '目標確率', detail: '必須。 基準値を指定します。' },
        },
    },
    EXPONDIST: {
        description: '指数分布を返します。 EXPONDIST 関数を使用すると、銀行の ATM 機から現金が出てくるまでの時間など、イベント間隔をモデル化できます。 たとえば、EXPONDIST 関数を使用して、この処理が 1 分以内に終了する確率を算出できます。',
        abstract: '指数分布を返します。 EXPONDIST 関数を使用すると、銀行の ATM 機から現金が出てくるまでの時間など、イベント間隔をモデル化できます。 たとえば、EXPONDIST 関数を使用して、この処理が 1 分以内に終了する確率を算出できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '必須。 関数に代入する値を指定します。' },
            lambda: { name: 'lambda', detail: '必須。 パラメーターの値を指定します。' },
            cumulative: { name: '累積', detail: '必須。 使用する指数関数の形式を示す論理値を指定します。 累積が TRUE の場合は、EXPONDIST によって累積分布関数が返されます。FALSE の場合は、確率密度関数が返されます。' },
        },
    },
    FDIST: {
        description: '2 組のデータの (右側) F 分布の確率関数の値 (ばらつき) を返します。 この関数を使用すると、2 組のデータを比較してばらつきに差異があるかどうかを判断できます。 たとえば、高校入試で男子と女子の点数を調べ、男子と女子で点数のばらつきが異なるかどうかを判断できます。',
        abstract: '2 組のデータの (右側) F 分布の確率関数の値 (ばらつき) を返します。 この関数を使用すると、2 組のデータを比較してばらつきに差異があるかどうかを判断できます。 たとえば、高校入試で男子と女子の点数を調べ、男子と女子で点数のばらつきが異なるかどうかを判断できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: '値', detail: '必須。 関数に代入する値を指定します。' },
            degFreedom1: { name: '自由度の分子', detail: '必須。 自由度の分子を指定します。' },
            degFreedom2: { name: '自由度の分母', detail: '必須。 自由度の分母を指定します。' },
        },
    },
    FINV: {
        description: '(右側) F 分布の確率関数の逆関数値を返します。 確率 = FDIST(x,...) であるとき、FINV(確率,...) = x という関係が成り立ちます。',
        abstract: '(右側) F 分布の確率関数の逆関数値を返します。 確率 = FDIST(x,...) であるとき、FINV(確率,...) = x という関係が成り立ちます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '必須。 F 累積分布における確率を指定します。' },
            degFreedom1: { name: '自由度の分子', detail: '必須。 自由度の分子を指定します。' },
            degFreedom2: { name: '自由度の分母', detail: '必須。 自由度の分母を指定します。' },
        },
    },
    FTEST: {
        description: 'F 検定の結果を返します。 F 検定は、配列 1 と配列 2 とのデータのばらつきに有意な差が認められない両側確率を返します。 この関数を使用すると、2 組のサンプルを比較してばらつきに差異があるかどうかを判断できます。 たとえば、公立高校と私立高校の生徒のテストの点数を調べ、これらの高校の間でテストの点数のばらつきに差異があるかどうかを判断できます。',
        abstract: 'F 検定の結果を返します。 F 検定は、配列 1 と配列 2 とのデータのばらつきに有意な差が認められない両側確率を返します。 この関数を使用すると、2 組のサンプルを比較してばらつきに差異があるかどうかを判断できます。 たとえば、公立高校と私立高校の生徒のテストの点数を調べ、これらの高校の間でテストの点数のばらつきに差異があるかどうかを判断できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: '必須。 比較対象となる一方のデータを含む配列またはセル範囲を指定します。' },
            array2: { name: '配列2', detail: '必須。 比較対象となるもう一方のデータを含む配列またはセル範囲を指定します。' },
        },
    },
    GAMMADIST: {
        description: 'ガンマ分布関数の値を返します。 この関数を使うと、正規分布に従わないと見られる変数の分析を行うことができます。 ガンマ分布は待ち行列分析などでよく使用されます。',
        abstract: 'ガンマ分布関数の値を返します。 この関数を使うと、正規分布に従わないと見られる変数の分析を行うことができます。 ガンマ分布は待ち行列分析などでよく使用されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必須。 分布の評価に使用する値を指定します。' },
            alpha: { name: 'alpha', detail: '必須。 分布に対するパラメーターを指定します。' },
            beta: { name: 'beta', detail: '必須。 分布に対するパラメーターを指定します。 β = 1 の場合、標準ガンマ分布の値が返されます。' },
            cumulative: { name: '累積', detail: '必須。 計算に使用する関数の形式を論理値で指定します。 累積が TRUE の場合は、GAMMADIST によって累積分布関数が返されます。FALSE の場合は、確率密度関数が返されます。' },
        },
    },
    GAMMAINV: {
        description: 'ガンマ分布の累積分布関数の逆関数の値を返します。 p = GAMMADIST(x,...) の場合、GAMMAINV(p,...) = x になります。 この関数は、正規分布に従わないと見られる変数を分析する場合に使います。',
        abstract: 'ガンマ分布の累積分布関数の逆関数の値を返します。 p = GAMMADIST(x,...) の場合、GAMMAINV(p,...) = x になります。 この関数は、正規分布に従わないと見られる変数を分析する場合に使います。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '必須。 ガンマ分布における確率を指定します。' },
            alpha: { name: 'alpha', detail: '必須。 分布に対するパラメーターを指定します。' },
            beta: { name: 'beta', detail: '必須。 分布に対するパラメーターを指定します。 β =1 の場合、標準ガンマ分布の値が返されます。' },
        },
    },
    HYPGEOMDIST: {
        description: '超幾何分布を返します。 HYPGEOMDIST は、指定された標本の成功数、指定された標本数、母集団の成功数、母集団の大きさの確率を返します。 有限母集団に関する問題に対しては HYPGEOMDIST を使用します。ここでは、各観測は成功または失敗のいずれかです。また、指定された大きさの各サブセットは等尤度で選択されます。',
        abstract: '超幾何分布を返します。 HYPGEOMDIST は、指定された標本の成功数、指定された標本数、母集団の成功数、母集団の大きさの確率を返します。 有限母集団に関する問題に対しては HYPGEOMDIST を使用します。ここでは、各観測は成功または失敗のいずれかです。また、指定された大きさの各サブセットは等尤度で選択されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: '標本の成功数', detail: '必須。 標本内で成功する数を指定します。' },
            numberSample: { name: '標本数', detail: '必須。 標本数を指定します。' },
            populationS: { name: '母集団の成功数', detail: '必須。 母集団内で成功する数を指定します。' },
            numberPop: { name: '母集団の大きさ', detail: '必須。 母集団全体の数を指定します。' },
        },
    },
    LOGINV: {
        description: 'x の対数正規型の累積分布関数の逆関数を返します。ln(x) は、引数平均と標準偏差による正規型分布です。 p = LOGNORMDIST(x,...) の場合は、LOGINV(p,...) = x です。',
        abstract: 'x の対数正規型の累積分布関数の逆関数を返します。ln(x) は、引数平均と標準偏差による正規型分布です。 p = LOGNORMDIST(x,...) の場合は、LOGINV(p,...) = x です。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '必須。 対数正規型分布に伴う確率を指定します。' },
            mean: { name: '平均', detail: '必須。 ln(x) の平均値を指定します。' },
            standardDev: { name: '標準偏差', detail: '必須。 ln(x) の標準偏差を指定します。' },
        },
    },
    LOGNORMDIST: {
        description: 'x の対数正規分布の分布関数の値を返します。ln(x) は、引数平均と標準偏差による正規型分布です。 この関数は、対数的に変換されたデータを分析する場合に使用します。',
        abstract: 'x の対数正規分布の分布関数の値を返します。ln(x) は、引数平均と標準偏差による正規型分布です。 この関数は、対数的に変換されたデータを分析する場合に使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必須。 関数に代入する値を指定します。' },
            mean: { name: '平均', detail: '必須。 ln(x) の平均値を指定します。' },
            standardDev: { name: '標準偏差', detail: '必須。 ln(x) の標準偏差を指定します。' },
        },
    },
    MODE: {
        description: 'たとえば、30 年間に重要な湿原で鳥の数のサンプルで観察された最も一般的な鳥種の数を調べるか、ピーク時以外に電話サポート センターで最も頻繁に発生する電話の数を調べる必要があるとします。 数値のグループのモードを計算するには、 MODE 関数を使用します。',
        abstract: 'たとえば、30 年間に重要な湿原で鳥の数のサンプルで観察された最も一般的な鳥種の数を調べるか、ピーク時以外に電話サポート センターで最も頻繁に発生する電話の数を調べる必要があるとします。 数値のグループのモードを計算するには、 MODE 関数を使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '必須。 モードの計算の対象となる最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: 'オプション。 モードの計算の対象となる 2 ～ 255 個の数値引数を指定できます。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    NEGBINOMDIST: {
        description: '負の二項分布の確率関数値を返します。 NEGBINOMDIST 関数を利用すると、試行の成功率が一定のとき、成功数で指定した回数の試行が成功する前に、失敗数で指定した回数の試行が失敗する確率を計算できます。 この関数は二項分布を計算する関数に似ていますが、試行の成功数が定数で試行回数が変数である点が異なります。 さらに、二項分布の場合と同様に、対象となる試行は独立試行であると見なされます。',
        abstract: '負の二項分布の確率関数値を返します。 NEGBINOMDIST 関数を利用すると、試行の成功率が一定のとき、成功数で指定した回数の試行が成功する前に、失敗数で指定した回数の試行が失敗する確率を計算できます。 この関数は二項分布を計算する関数に似ていますが、試行の成功数が定数で試行回数が変数である点が異なります。 さらに、二項分布の場合と同様に、対象となる試行は独立試行であると見なされます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: '失敗数', detail: '必須。 試行が失敗する回数を指定します。' },
            numberS: { name: '成功数', detail: '必須。 分析のしきい値となる、試行が成功する回数を指定します。' },
            probabilityS: { name: '成功率', detail: '必須。 試行が成功する確率を指定します。' },
        },
    },
    NORMDIST: {
        description: 'NORMDIST 関数は、指定された平均と標準偏差の正規分布を返します。 この関数には、仮説検定を含む、統計の幅広いアプリケーションがあります。',
        abstract: 'NORMDIST 関数は、指定された平均と標準偏差の正規分布を返します。 この関数には、仮説検定を含む、統計の幅広いアプリケーションがあります。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必須。 分布が必要な値' },
            mean: { name: '平均', detail: '必須。 分布の算術平均' },
            standardDev: { name: '標準偏差', detail: '必須。 分布の標準偏差' },
            cumulative: { name: '累積', detail: '必須。 計算に使用する関数の形式を論理値で指定します。 累積が TRUE の場合、NORMDIST は累積分布関数を返します。累積が FALSE の場合、確率質量関数が返されます。' },
        },
    },
    NORMINV: {
        description: '指定した平均と標準偏差に対する正規分布の累積分布関数の逆関数の値を返します。',
        abstract: '指定した平均と標準偏差に対する正規分布の累積分布関数の逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '必須。 正規分布における確率を指定します。' },
            mean: { name: '平均', detail: '必須。 対象となる分布の算術平均 (相加平均) を指定します。' },
            standardDev: { name: '標準偏差', detail: '必須。 対象となる分布の標準偏差を指定します。' },
        },
    },
    NORMSDIST: {
        description: '標準正規分布の累積分布関数の値を返します。 この分布は、平均が 0 (ゼロ) で標準偏差が 1 である正規分布に対応します。 標準正規分布表の代わりにこの関数を使用することができます。',
        abstract: '標準正規分布の累積分布関数の値を返します。 この分布は、平均が 0 (ゼロ) で標準偏差が 1 である正規分布に対応します。 標準正規分布表の代わりにこの関数を使用することができます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '必須。 関数に代入する値を指定します。' },
        },
    },
    NORMSINV: {
        description: '標準正規分布の累積分布関数の逆関数の値を返します。 この分布は、平均が 0 で標準偏差が 1 である正規分布に対応します。',
        abstract: '標準正規分布の累積分布関数の逆関数の値を返します。 この分布は、平均が 0 で標準偏差が 1 である正規分布に対応します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '必須。 正規分布における確率を指定します。' },
        },
    },
    PERCENTILE: {
        description: '配列のデータの中で、百分率で率に位置する値を返します。 この関数を使用して、合否のしきい値を指定することができます。 たとえば、成績が上位 10% の志願者を合格にすることなどを決定できます。',
        abstract: '配列のデータの中で、百分率で率に位置する値を返します。 この関数を使用して、合否のしきい値を指定することができます。 たとえば、成績が上位 10% の志願者を合格にすることなどを決定できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '必須。 相対的な位置を決定するデータの配列またはセル範囲を指定します。' },
            k: { name: 'k', detail: '必須。 0 ～ 1 の範囲で、目的の百分位の値を指定します。' },
        },
    },
    PERCENTRANK: {
        description: 'PERCENTRANK 関数は、データセット内の値のランクをデータセットのパーセンテージとして返します。基本的には、データセット全体内の値の相対的な順位です。 たとえば、PERCENTRANK を使用して、同じテストのすべてのスコアのフィールド間で個人のテスト スコアの順位を判断できます。',
        abstract: 'PERCENTRANK 関数は、データセット内の値のランクをデータセットのパーセンテージとして返します。基本的には、データセット全体内の値の相対的な順位です。 たとえば、PERCENTRANK を使用して、同じテストのすべてのスコアのフィールド間で個人のテスト スコアの順位を判断できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '必須。 パーセントランクが決定される数値のデータ (または事前に定義された配列) の範囲。' },
            x: { name: 'x', detail: '必須。 配列内のランクを知りたい値。' },
            significance: { name: '有効桁数', detail: 'オプション。 計算結果として返される百分率の有効桁数を指定します。 有効桁数を省略すると、小数点以下第 3 位 (0.xxx) まで計算されます。' },
        },
    },
    POISSON: {
        description: 'ポアソン確率の値を返します。 通常、ポアソン分布は一定の時間内に起きる事象の数を予測するために利用されます。たとえば、ポアソン分布を使って、高速道路の料金所を 1 分間に通過する自動車の台数を予測することができます。',
        abstract: 'ポアソン確率の値を返します。 通常、ポアソン分布は一定の時間内に起きる事象の数を予測するために利用されます。たとえば、ポアソン分布を使って、高速道路の料金所を 1 分間に通過する自動車の台数を予測することができます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必須。 生じる事象の数を指定します。' },
            mean: { name: '平均', detail: '必須。 一定の時間内に起きる事象の平均値を指定します。' },
            cumulative: { name: '累積', detail: '必須。 計算結果として返される確率関数値の形式を、論理値で指定します。 関数形式に TRUE を指定した場合、ランダムに発生するイベントの数が 0 以上 x 以下である累積ポアソン確率を返します。FALSE の場合は、発生するイベントの数が確実に x となる、ポワソン確率質量関数を返します。' },
        },
    },
    QUARTILE: {
        description: '配列に含まれるデータから四分位数を抽出します。 四分位数は、市場調査などのデータで、母集団を複数のグループに分割するために利用されます。 たとえば、母集団の中から所得金額が全体の上位 25% を占めるグループを選び出すことができます。',
        abstract: '配列に含まれるデータから四分位数を抽出します。 四分位数は、市場調査などのデータで、母集団を複数のグループに分割するために利用されます。 たとえば、母集団の中から所得金額が全体の上位 25% を占めるグループを選び出すことができます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '必須。 対象となる数値データを含む配列またはセル範囲を指定します。' },
            quart: { name: '四分位値', detail: '必須。 戻り値として返される四分位数の内容を、0 ～ 4 までの数値で指定します。' },
        },
    },
    RANK: {
        description: '数値のリスト内の数値のランクを返します。 数値のランクは、リスト内の他の値に対する相対的なサイズです。 (リストを並べ替える場合、数値のランクはその位置になります)。',
        abstract: '数値のリスト内の数値のランクを返します。 数値のランクは、リスト内の他の値に対する相対的なサイズです。 (リストを並べ替える場合、数値のランクはその位置になります)。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '必須。 範囲内での順位 (位置) を調べる数値を指定します。' },
            ref: { name: '数値範囲', detail: '必須。 数値の一覧への参照。 参照に含まれる数値以外の値は無視されます。' },
            order: { name: '順序', detail: 'オプション。 範囲内の数値を並べる方法を指定します。 順序に 0 を指定するか、順序を省略すると、範囲内の数値が ...3、2、1 のように降順に並べ替えられます。 順序に 0 以外の数値を指定すると、範囲内の数値が 1、2、3、... のように昇順で並べ替えられます。' },
        },
    },
    STDEV: {
        description: '標本に基づいて標準偏差の推定値を計算します。 標準偏差とは、統計的な対象となる値がその平均からどれだけ広い範囲に分布しているかを計測したものです。',
        abstract: '標本に基づいて標準偏差の推定値を計算します。 標準偏差とは、統計的な対象となる値がその平均からどれだけ広い範囲に分布しているかを計測したものです。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '必須。 母集団の標本に対応する最初の数値引数を指定します。' },
            number2: { name: 'number2', detail: 'オプション。 母集団のサンプルに対応する引数 2 から 255 の数値。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    STDEVP: {
        description: '引数を母集団全体であると見なして、母集団の標準偏差を計算します。 標準偏差とは、統計的な対象となる値がその平均からどれだけ広い範囲に分布しているかを計測したものです。',
        abstract: '引数を母集団全体であると見なして、母集団の標準偏差を計算します。 標準偏差とは、統計的な対象となる値がその平均からどれだけ広い範囲に分布しているかを計測したものです。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '必須。 母集団に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: 'オプション。 母集団に対応する引数 2 ~ 255 を数える。 また、半角のカンマ (,) で区切られた引数の代わりに、単一配列や、配列への参照を指定することもできます。' },
        },
    },
    TDIST: {
        description: 'スチューデントの t 分布のパーセンテージ (確率) を返します。数値 (x) は t の計算値で、この t に対してパーセンテージが計算されます。 t 分布は、比較的少数の標本から成るデータを対象に仮説検定を行うときに使われます。 この関数は、t 分布表の代わりに使用することができます。',
        abstract: 'スチューデントの t 分布のパーセンテージ (確率) を返します。数値 (x) は t の計算値で、この t に対してパーセンテージが計算されます。 t 分布は、比較的少数の標本から成るデータを対象に仮説検定を行うときに使われます。 この関数は、t 分布表の代わりに使用することができます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必須。 t 分布を計算する数値を指定します。' },
            degFreedom: { name: '自由度', detail: '必須。 分布の自由度を整数で指定します。' },
            tails: { name: '尾部の特性', detail: '必須。 片側分布を計算するか、両側分布を計算するかを、数値で指定します。 尾部に 1 を指定すると片側分布の値が計算されます。 尾部に 2 を指定すると両側分布の値が計算されます。' },
        },
    },
    TINV: {
        description: 'スチューデントの t 分布の両側逆関数の値を返します。',
        abstract: 'スチューデントの t 分布の両側逆関数の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '確率', detail: '必須。 スチューデントの両側 t 分布に従う確率を指定します。' },
            degFreedom: { name: '自由度', detail: '必須。 分布の自由度を指定します。' },
        },
    },
    TTEST: {
        description: 'スチューデントの t 検定における確率を返します。 TTEST 関数を利用して、2 つの標本が平均値の等しい 2 つの母集団から抽出されたと見なせるかどうかを調べます。',
        abstract: 'スチューデントの t 検定における確率を返します。 TTEST 関数を利用して、2 つの標本が平均値の等しい 2 つの母集団から抽出されたと見なせるかどうかを調べます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: '必須。 対象となる一方のデータ。' },
            array2: { name: '配列2', detail: '必須。 対象となるもう一方のデータ。' },
            tails: { name: '尾部の特性', detail: '必須。 片側分布を計算するか、両側分布を計算するかを、数値で指定します。 尾部に 1 を指定すると、片側分布の値が使用されます。 尾部に 2 を指定すると、両側分布の値が使用されます。' },
            type: { name: '検定の種類', detail: '必須。 実行する t 検定の種類を数値で指定します。' },
        },
    },
    VAR: {
        description: '標本に基づいて母集団の分散の推定値 (不偏分散) を返します。',
        abstract: '標本に基づいて母集団の分散の推定値 (不偏分散) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '必須。 母集団の標本に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: 'オプション。 母集団のサンプルに対応する引数 2 から 255 の数値。' },
        },
    },
    VARP: {
        description: '母集団全体に基づいて分散を計算します。',
        abstract: '母集団全体に基づいて分散を計算します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: '数値 1', detail: '必須。 母集団に対応する最初の数値引数を指定します。' },
            number2: { name: '数値 2', detail: 'オプション。 母集団に対応する引数 2 ~ 255 を数える。' },
        },
    },
    WEIBULL: {
        description: 'ワイブル分布の値を返します。 この分布は、機械が故障するまでの平均時間のような信頼性の分析に使用されます。',
        abstract: 'ワイブル分布の値を返します。 この分布は、機械が故障するまでの平均時間のような信頼性の分析に使用されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '必須。 関数に代入する値を指定します。' },
            alpha: { name: 'alpha', detail: '必須。 分布に対するパラメーターを指定します。' },
            beta: { name: 'beta', detail: '必須。 分布に対するパラメーターを指定します。' },
            cumulative: { name: '累積', detail: '必須。 関数の形式を指定します。' },
        },
    },
    ZTEST: {
        description: 'z 検定の片側 P 値を返します。 ZTEST 関数は、指定した仮説の母集団平均 μ0 について、配列で指定されたデータの観測値平均 (観測された標本平均) よりも標本平均が大きくなる確率を返します。',
        abstract: 'z 検定の片側 P 値を返します。 ZTEST 関数は、指定した仮説の母集団平均 μ0 について、配列で指定されたデータの観測値平均 (観測された標本平均) よりも標本平均が大きくなる確率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '必須。 x の検定対象となるデータを含む数値配列またはセル範囲を指定します。' },
            x: { name: 'x', detail: '必須。 検定する値を指定します。' },
            sigma: { name: '標準偏差', detail: 'オプション。 母集団全体に基づく標準偏差を指定します。 省略すると、標本に基づく標準偏差が使用されます。' },
        },
    },
};

export default locale;
