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
        description: '傳回資料點與它們的平均值的絕對偏差平均值。 ',
        abstract: '返回資料點與它們的平均值的絕對偏差平均值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算平均值的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算平均值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    AVERAGE: {
        description: '傳回參數的平均值（算術平均值）。 ',
        abstract: '傳回其參數的平均值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: {
                name: '數值 1',
                detail: '要計算平均值的第一個數字、儲存格參考或儲存格區域。 ',
            },
            number2: {
                name: '數值 2',
                detail: '要計算平均值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ',
            },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'AVERAGE.WEIGHTED 函數會根據一組數值及其對應的權重，計算這些數值的加權平均值。',
        abstract: 'AVERAGE.WEIGHTED 函數會根據一組數值及其對應的權重，計算這些數值的加權平均值。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/9084098?hl=zh-Hant',
            },
        ],
        functionParameter: {
            values: { name: '值', detail: '要計算平均值的數值。 可以是參照儲存格的範圍，也可以是數值本身。' },
            weights: { name: '權重', detail: '要套用的權重對應清單。 可以是參照儲存格的範圍，也可以是權重本身。 雖然權重不得為負數，但可以為零。 至少要有一個權重為正數。 如果使用特定儲存格範圍，這段範圍的欄數和列數必須與數值範圍的欄數和列數相同。' },
            additionalValues: { name: '其他值', detail: '要計算平均值的其他值。 其他值為選填。' },
            additionalWeights: { name: '其他權重', detail: '要套用的其他權重。 其他權重為選填，但每個 [其他值] 的後面都必須加上一個 [其他權重] 。' },
        },
    },
    AVERAGEA: {
        description: '傳回其參數的平均值，包括數字、文字和邏輯值。 ',
        abstract: '傳回其參數的平均值，包括數字、文字和邏輯值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: {
                name: '值 1',
                detail: '要計算平均值的第一個數字、儲存格參考或儲存格區域。 ',
            },
            value2: {
                name: '值 2',
                detail: '要計算平均值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ',
            },
        },
    },
    AVERAGEIF: {
        description: '返回區域中滿足給定條件的所有儲存格的平均值（算術平均值）。 ',
        abstract: '返回區域中滿足給定條件的所有儲存格的平均值（算術平均值）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: '範圍', detail: '要計算平均值的一個或多個儲存格，其中包含數字或包含數字的名稱、陣列或參考。 ' },
            criteria: { name: '條件', detail: '形式為數字、表達式、儲存格引用或文字的條件，用來定義將計算平均值的儲存格。 例如，條件可以表示為 32、"32"、">32"、"蘋果" 或 B4。 ' },
            averageRange: { name: '平均範圍', detail: '計算平均值的實際儲存格組。 如果省略，則使用 range。 ' },
        },
    },
    AVERAGEIFS: {
        description: '傳回滿足多個條件的所有儲存格的平均值（算術平均值）。 ',
        abstract: '返回所有滿足多個條件的儲存格的平均值（算術平均值）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: '平均值範圍', detail: '要計算平均值的一個或多個儲存格，其中包含數字或包含數字的名稱、陣列或引用。 ' },
            criteriaRange1: { name: '條件範圍 1', detail: '是一組用於條件計算的儲存格。 ' },
            criteria1: { name: '條件 1', detail: '用來定義將計算平均值的儲存格。 例如，條件可以表示為 32、"32"、">32"、"蘋果" 或 B4' },
            criteriaRange2: { name: '條件範圍 2', detail: '附加區域。 最多可輸入 127 個區域。 ' },
            criteria2: { name: '條件 2', detail: '附加關聯條件。 最多可以輸入 127 個條件。 ' },
        },
    },
    BETA_DIST: {
        description: '傳回 beta 累積分佈函數',
        abstract: '傳回 beta 累積分佈函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用來計算其函數的值，介於下限值和上限值之間。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 BETA.DIST 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
            A: { name: '下限', detail: '函數的下限，預設值為 0。' },
            B: { name: '上限', detail: '函數的上限，預設值為 1。' },
        },
    },
    BETA_INV: {
        description: '傳回指定 beta 分佈的累積分佈函數的反函數',
        abstract: '傳回指定 beta 分佈的累積分佈函數的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/beta-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: 'beta 分佈的相關機率。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
            A: { name: '下限', detail: '函數的下限，預設值為 0。' },
            B: { name: '上限', detail: '函數的上限，預設值為 1。' },
        },
    },
    BINOM_DIST: {
        description: '傳回一元二項式分佈的機率',
        abstract: '傳回一元二項式分佈的機率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: '成功次數', detail: '為實驗的成功次數。' },
            trials: { name: '實驗次數', detail: '為獨立實驗的次數。' },
            probabilityS: { name: '成功機率', detail: '每一次實驗的成功機率。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 BINOM.DIST 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
        },
    },
    BINOM_DIST_RANGE: {
        description: '使用二項式分佈傳回試驗結果的機率',
        abstract: '使用二項式分佈返回試驗結果的機率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: '實驗次數', detail: '為獨立實驗的次數。' },
            probabilityS: { name: '成功機率', detail: '每一次實驗的成功機率。' },
            numberS: { name: '成功次數', detail: '為實驗的成功次數。' },
            numberS2: { name: '最大成功次數', detail: '如果提供，會傳回成功試驗次數落在 成功次數 和 最大成功次數 之間的機率。' },
        },
    },
    BINOM_INV: {
        description: '傳回使累積二項式分佈小於或等於臨界值的最小值',
        abstract: '傳回使累積二項式分佈小於或等於臨界值的最小值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: '實驗次數', detail: '伯努利實驗的次數。' },
            probabilityS: { name: '成功機率', detail: '每一次實驗的成功機率。' },
            alpha: { name: '目標機率', detail: '臨界值。' },
        },
    },
    CHISQ_DIST: {
        description: '傳回 χ2 分佈的左尾機率。',
        abstract: '傳回 χ2 分佈的左尾機率。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用來評估分佈的值。' },
            degFreedom: { name: '自由度', detail: '自由度。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，CHISQ.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    CHISQ_DIST_RT: {
        description: '傳回 χ2 分佈的右尾機率。',
        abstract: '傳回 χ2 分佈的右尾機率。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用來評估分佈的值。' },
            degFreedom: { name: '自由度', detail: '自由度。' },
        },
    },
    CHISQ_INV: {
        description: '傳回 χ2 分佈的左尾機率的反函數值。',
        abstract: '傳回 χ2 分佈的左尾機率的反函數值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '與 χ2 分佈相關聯的機率。' },
            degFreedom: { name: '自由度', detail: '自由度。' },
        },
    },
    CHISQ_INV_RT: {
        description: '傳回 χ2 分佈的右尾機率的反函數值。',
        abstract: '傳回 χ2 分佈的右尾機率的反函數值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '與 χ2 分佈相關聯的機率。' },
            degFreedom: { name: '自由度', detail: '自由度。' },
        },
    },
    CHISQ_TEST: {
        description: '返回獨立性檢驗值',
        abstract: '返回獨立性檢驗值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: '觀察範圍', detail: '觀察值範圍，用來檢定預期值。' },
            expectedRange: { name: '預期範圍', detail: '資料範圍，其內容為各欄總和乘各列總和後的值，再除以全部值總和的比率。' },
        },
    },
    CONFIDENCE_NORM: {
        description: '使用常態分佈傳回總體平均值的置信區間。',
        abstract: '使用常態分佈傳回總體平均值的置信區間。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '用於計算置信水準的顯著水準。置信水準等於 100*(1 - alpha)%，換句話說，alpha 0.05 表示信賴水準為 95%。' },
            standardDev: { name: '總體標準差', detail: '假設資料範圍的總體標準差已知。' },
            size: { name: '樣本大小', detail: '樣本大小。' },
        },
    },
    CONFIDENCE_T: {
        description: '傳回總體平均值的置信區間（使用學生 t-分佈）',
        abstract: '傳回總體平均值的置信區間（使用學生 t-分佈）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '用於計算置信水準的顯著水準。置信水準等於 100*(1 - alpha)%，換句話說，alpha 0.05 表示信賴水準為 95%。' },
            standardDev: { name: '總體標準差', detail: '假設資料範圍的總體標準差已知。' },
            size: { name: '樣本大小', detail: '樣本大小。' },
        },
    },
    CORREL: {
        description: '傳回兩個資料集之間的相關係數',
        abstract: '傳回兩個資料集之間的相關係數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '第一個儲存格值範圍。' },
            array2: { name: '陣列2', detail: '第二個儲存格值範圍。' },
        },
    },
    COUNT: {
        description: '計算包含數字的儲存格數以及參數列表中數字的個數。 ',
        abstract: '計算參數清單中數字的個數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: {
                name: '值 1',
                detail: '要計算其中數字的數量的第一項、儲存格引用或區域。 ',
            },
            value2: {
                name: '值 2',
                detail: '要計算其中數字的個數的其他項目、儲存格參考或區域，最多可包含 255 個。 ',
            },
        },
    },
    COUNTA: {
        description: `計算包含任何類型的資訊（包括錯誤值和空白文字 ("")）的儲存格
 如果不需要對邏輯值、文字或錯誤值進行計數（換句話說，只希望對包含數字的儲存格進行計數），請使用 COUNT 函數。 `,
        abstract: '計算參數清單中值的個數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: {
                name: '值 1',
                detail: '要計算平均值的第一個數字、儲存格參考或儲存格區域。 ',
            },
            value2: {
                name: '值 2',
                detail: '要計算平均值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ',
            },
        },
    },
    COUNTBLANK: {
        description: '計算區域內空白儲存格的數量。 ',
        abstract: '計算區域內空白儲存格的數量',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: '範圍', detail: '需要計算其中空白儲存格數的區域。 ' },
        },
    },
    COUNTIF: {
        description: '計算區域內符合給定條件的儲存格的數量。 ',
        abstract: '計算區域內符合給定條件的儲存格的數量',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: '範圍', detail: '要進行計數的儲存格組。 區域可以包括數字、陣列、命名區域或包含數字的引用。 空白和文字值將被忽略。 ' },
            criteria: { name: '條件', detail: '用來決定要統計哪些儲存格的數量的數字、表達式、儲存格參考或文字字串。 \n例如，可以使用 32 之類數字，「>32」之類比較，B4 之類儲存格，或「蘋果」之類單字。 \nCOUNTIF 只使用一個條件。 如果要使用多個條件，請使用 COUNTIFS。 ' },
        },
    },
    COUNTIFS: {
        description: '計算區域內符合多個條件的儲存格的數量。 ',
        abstract: '計算區域內符合多個條件的儲存格的數量',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: '條件範圍 1', detail: '在其中計算關聯條件的第一個區域。 ' },
            criteria1: { name: '條件 1', detail: '條件的形式為數字、表達式、儲存格引用或文本，它定義了要計數的儲存格範圍。 例如，條件可以表示為 32、">32"、B4、"apples"或 "32"。 ' },
            criteriaRange2: { name: '條件範圍 2', detail: '附加區域。 最多可輸入 127 個區域。 ' },
            criteria2: { name: '條件 2', detail: '附加關聯條件。 最多可以輸入 127 個條件。 ' },
        },
    },
    COVARIANCE_P: {
        description: '傳回總體協方差，即兩個資料集中每對資料點的偏差乘積的平均值。',
        abstract: '傳回總體協方差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '第一個儲存格值範圍。' },
            array2: { name: '陣列2', detail: '第二個儲存格值範圍。' },
        },
    },
    COVARIANCE_S: {
        description: '傳回樣本協方差，即兩個資料集中每對資料點的偏差乘積的平均值。',
        abstract: '傳回樣本協方差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '第一個儲存格值範圍。' },
            array2: { name: '陣列2', detail: '第二個儲存格值範圍。' },
        },
    },
    DEVSQ: {
        description: '傳回偏差的平方和',
        abstract: '傳回偏差的平方和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '要計算平方差之總和的第 1 個引數。' },
            number2: { name: '數值2', detail: '要計算平方差之總和的第 2 到 255 個引數。' },
        },
    },
    EXPON_DIST: {
        description: '傳回指數分佈',
        abstract: '傳回指數分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用來評估分佈的值。' },
            lambda: { name: 'lambda', detail: '參數值。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，EXPON.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    F_DIST: {
        description: '傳回 F 機率分佈',
        abstract: '傳回 F 機率分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用於評估函數的值。' },
            degFreedom1: { name: '分子自由度', detail: '分子的自由度。' },
            degFreedom2: { name: '分母自由度', detail: '分母的自由度。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，F.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    F_DIST_RT: {
        description: '傳回 F 機率分佈（右尾）',
        abstract: '傳回 F 機率分佈（右尾）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用於評估函數的值。' },
            degFreedom1: { name: '分子自由度', detail: '分子的自由度。' },
            degFreedom2: { name: '分母自由度', detail: '分母的自由度。' },
        },
    },
    F_INV: {
        description: '傳回 F 機率分佈的反函數',
        abstract: '傳回 F 機率分佈的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: 'F 累積分佈相關的機率' },
            degFreedom1: { name: '分子自由度', detail: '分子的自由度。' },
            degFreedom2: { name: '分母自由度', detail: '分母的自由度。' },
        },
    },
    F_INV_RT: {
        description: '傳回 F 機率分佈（右尾）的反函數',
        abstract: '傳回 F 機率分佈（右尾）的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: 'F 累積分佈相關的機率' },
            degFreedom1: { name: '分子自由度', detail: '分子的自由度。' },
            degFreedom2: { name: '分母自由度', detail: '分母的自由度。' },
        },
    },
    F_TEST: {
        description: '傳回 F 檢驗的結果',
        abstract: '傳回 F 檢驗的結果',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '第一個陣列或資料範圍。' },
            array2: { name: '陣列2', detail: '第二個陣列或資料範圍。' },
        },
    },
    FISHER: {
        description: '傳回 Fisher 變換值',
        abstract: '傳回 Fisher 變換值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: '數值', detail: '要轉換的數值。' },
        },
    },
    FISHERINV: {
        description: '傳回 Fisher 變換的反函數',
        abstract: '傳回 Fisher 變換的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: '數值', detail: '要執行反轉換的數值。' },
        },
    },
    FORECAST: {
        description: '返回線性趨勢值',
        abstract: '返回線性趨勢值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要預測值的資料點。' },
            knownYs: { name: '陣列_y', detail: '代表因變數資料的陣列或矩陣的範圍。' },
            knownXs: { name: '陣列_x', detail: '代表自變數資料的陣列或矩陣的範圍。' },
        },
    },
    FORECAST_ETS: {
        description: '透過使用指數平滑 (ETS) 演算法的 AAA 版本，傳回基於現有（歷史）值的未來值',
        abstract: '透過使用指數平滑 (ETS) 演算法的 AAA 版本，傳回基於現有（歷史）值的未來值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: '目標日期', detail: '要預測其值的資料點。' },
            values: { name: '值', detail: '用於預測的歷史值。' },
            timeline: { name: '時間軸', detail: '由固定間距的數值日期或時間組成的獨立範圍或陣列。' },
            seasonality: { name: '季節性', detail: '選用。1 表示自動偵測，0 表示無季節性。' },
            dataCompletion: { name: '資料補全', detail: '選用。1 表示插補遺漏點，0 表示將遺漏點視為零。' },
            aggregation: { name: '彙總', detail: '選用。以 1 到 7 指定重複時間戳記的彙總方式。' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: '傳回指定目標日期預測值的置信區間',
        abstract: '傳回指定目標日期預測值的置信區間',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: '目標日期', detail: '要預測其值的資料點。' },
            values: { name: '值', detail: '用於預測的歷史值。' },
            timeline: { name: '時間軸', detail: '由固定間距的數值日期或時間組成的獨立範圍或陣列。' },
            confidenceLevel: { name: '信賴水準', detail: '選用。0 到 1 之間的數字，預設值為 0.95。' },
            seasonality: { name: '季節性', detail: '選用。1 表示自動偵測，0 表示無季節性。' },
            dataCompletion: { name: '資料補全', detail: '選用。1 表示插補遺漏點，0 表示將遺漏點視為零。' },
            aggregation: { name: '彙總', detail: '選用。以 1 到 7 指定重複時間戳記的彙總方式。' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: '傳回 Excel 針對指定時間系列偵測到的重複模式的長度',
        abstract: '傳回 Excel 針對指定時間系列偵測到的重複模式的長度',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: '值', detail: '用於預測的歷史值。' },
            timeline: { name: '時間軸', detail: '由固定間距的數值日期或時間組成的獨立範圍或陣列。' },
            dataCompletion: { name: '資料補全', detail: '選用。1 表示插補遺漏點，0 表示將遺漏點視為零。' },
            aggregation: { name: '彙總', detail: '選用。以 1 到 7 指定重複時間戳記的彙總方式。' },
        },
    },
    FORECAST_ETS_STAT: {
        description: '傳回作為時間序列預測的結果的統計值。 ',
        abstract: '傳回作為時間序列預測的結果的統計值。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: '值', detail: '用於預測的歷史值。' },
            timeline: { name: '時間軸', detail: '由固定間距的數值日期或時間組成的獨立範圍或陣列。' },
            statisticType: { name: '統計類型', detail: '以 1 到 8 指定要傳回的預測統計值。' },
            seasonality: { name: '季節性', detail: '選用。1 表示自動偵測，0 表示無季節性。' },
            dataCompletion: { name: '資料補全', detail: '選用。1 表示插補遺漏點，0 表示將遺漏點視為零。' },
            aggregation: { name: '彙總', detail: '選用。以 1 到 7 指定重複時間戳記的彙總方式。' },
        },
    },
    FORECAST_LINEAR: {
        description: '傳回基於現有值的未來值',
        abstract: '傳回基於現有值的未來值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要預測值的資料點。' },
            knownYs: { name: '陣列_y', detail: '代表因變數資料的陣列或矩陣的範圍。' },
            knownXs: { name: '陣列_x', detail: '代表自變數資料的陣列或矩陣的範圍。' },
        },
    },
    FREQUENCY: {
        description: '以垂直數組的形式傳回頻率分佈',
        abstract: '以垂直數組的形式傳回頻率分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: '資料陣列', detail: '所要計算頻率的一組數值的陣列或參照。 如果 data_array 沒有值，FREQUENCY 會傳回零陣列。' },
            binsArray: { name: '區間陣列', detail: '區間的陣列或參照，用以將 data_array 中的值分組。 如果 bins_array 沒有值，FREQUENCY 會傳回 data_array 中的元素個數。' },
        },
    },
    GAMMA: {
        description: '傳回 γ 函數值',
        abstract: '傳回 γ 函數值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '伽瑪函數的輸入值。' },
        },
    },
    GAMMA_DIST: {
        description: '傳回 γ 分佈',
        abstract: '傳回 γ 分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 GAMMA.DIST 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
        },
    },
    GAMMA_INV: {
        description: '傳回 γ 累積分佈函數的反函數',
        abstract: '傳回 γ 累積分佈函數的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '與伽瑪分佈的相關機率。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
        },
    },
    GAMMALN: {
        description: '傳回 γ 函數的自然對數，Γ(x)',
        abstract: '傳回 γ 函數的自然對數，Γ(x)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要計算 GAMMALN 的值。' },
        },
    },
    GAMMALN_PRECISE: {
        description: '傳回 γ 函數的自然對數，Γ(x)',
        abstract: '傳回 γ 函數的自然對數，Γ(x)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要計算 GAMMALN.PRECISE 的值。' },
        },
    },
    GAUSS: {
        description: '傳回小於標準常態累積分佈 0.5 的值',
        abstract: '傳回小於標準常態累積分佈 0.5 的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '要找出分佈的數值。' },
        },
    },
    GEOMEAN: {
        description: '返回幾何平均值',
        abstract: '返回幾何平均',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算幾何平均值的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算幾何平均值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    GROWTH: {
        description: '返回指數趨勢值',
        abstract: '返回指數趨勢值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '已知資料_y', detail: '在 y = b*m^x 關係中一組已知的 y 值。' },
            knownXs: { name: '已知資料_x', detail: '在 y = b*m^x 關係中一組已知的 x 值。' },
            newXs: { name: '新資料_x', detail: '要 GROWTH 傳回對應 y 值的新 x 值。' },
            constb: { name: 'b', detail: '指定是否強迫常數 b 等於 1 的邏輯值。' },
        },
    },
    HARMEAN: {
        description: '返回調和平均值',
        abstract: '返回調和平均',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算調和平均值的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算調和平均值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    HYPGEOM_DIST: {
        description: '返回超幾何分佈',
        abstract: '返回超幾何分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: '樣本成功次數', detail: '樣本中成功的次數。' },
            numberSample: { name: '樣本大小', detail: '樣本大小。' },
            populationS: { name: '總體成功次數', detail: '總體中成功的次數。' },
            numberPop: { name: '總體大小', detail: '總體大小。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 HYPGEOM.DIST 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
        },
    },
    INTERCEPT: {
        description: '傳回線性迴歸線的截距',
        abstract: '返回線性迴歸線的截距',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '陣列_y', detail: '代表因變數資料的陣列或矩陣的範圍。' },
            knownXs: { name: '陣列_x', detail: '代表自變數資料的陣列或矩陣的範圍。' },
        },
    },
    KURT: {
        description: '傳回資料集的峰值',
        abstract: '返回資料集的峰值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算峰值的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算峰值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    LARGE: {
        description: '返回資料集中第 k 個最大值',
        abstract: '返回資料集中第 k 個最大值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要判斷第 k 個最大值的陣列或資料範圍。' },
            k: { name: 'k', detail: '要傳回之資料陣列或儲存格範圍中的位置 (由最大起算)。' },
        },
    },
    LINEST: {
        description: '傳回線性趨勢的參數',
        abstract: '返回線性趨勢的參數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '已知資料_y', detail: '在 y = m*x+b 關係中一組已知的 y 值。' },
            knownXs: { name: '已知資料_x', detail: '在 y = m*x+b 關係中一組已知的 x 值。' },
            constb: { name: 'b', detail: '指定是否強迫常數 b 等於 0 的邏輯值。' },
            stats: { name: '統計', detail: '指定是否要傳回額外迴歸統計值的邏輯值。' },
        },
    },
    LOGEST: {
        description: '傳回指數趨勢的參數',
        abstract: '傳回指數趨勢的參數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '已知資料_y', detail: '在 y = b*m^x 關係中一組已知的 y 值。' },
            knownXs: { name: '已知資料_x', detail: '在 y = b*m^x 關係中一組已知的 x 值。' },
            constb: { name: 'b', detail: '指定是否強迫常數 b 等於 1 的邏輯值。' },
            stats: { name: '統計', detail: '指定是否要傳回額外迴歸統計值的邏輯值。' },
        },
    },
    LOGNORM_DIST: {
        description: '傳回對數常態累積分佈',
        abstract: '傳回對數常態累積分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，LOGNORM.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    LOGNORM_INV: {
        description: '傳回對數常態累積分佈的反函數',
        abstract: '傳回對數常態累積分佈的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '對應到對數常態分佈的機率。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
        },
    },
    MARGINOFERROR: {
        description: '這個函式會計算特定值範圍和信賴水準的誤差範圍。',
        abstract: '這個函式會計算特定值範圍和信賴水準的誤差範圍。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/12487850?hl=zh-Hant',
            },
        ],
        functionParameter: {
            range: { name: '範圍', detail: 'MARGINOFERROR(A1:C3, 0.99)' },
            confidence: { name: '信賴水準', detail: '想要的信賴水準介於 (0, 1) 之間。' },
        },
    },
    MAX: {
        description: '傳回一組值中的最大值。 ',
        abstract: '傳回參數清單中的最大值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: {
                name: '數值 1',
                detail: '要計算最大值的第一個數字、儲存格參考或儲存格區域。 ',
            },
            number2: {
                name: '數值 2',
                detail: '若要計算最大值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ',
            },
        },
    },
    MAXA: {
        description: '傳回參數清單中的最大值，包括數字、文字和邏輯值。 ',
        abstract: '傳回參數清單中的最大值，包括數字、文字和邏輯值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '要從中找出最大值的第一個數值參數。 ' },
            value2: { name: '值 2', detail: '要從中找出最大值的 2 到 255 個數值參數。 ' },
        },
    },
    MAXIFS: {
        description: '傳回一組給定條件或標準指定的儲存格之間的最大值',
        abstract: '傳回一組給定條件或標準指定的儲存格之間的最大值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: '最大值範圍', detail: '確定最大值的實際儲存格區域。 ' },
            criteriaRange1: { name: '條件範圍 1', detail: '是一組用於條件計算的儲存格。 ' },
            criteria1: { name: '條件 1', detail: '用來決定哪些儲存格是最大值的條件，格式為數字、表達式或文字。 一組相同的條件適用於 MINIFS、SUMIFS 和 AVERAGEIFS 函數。 ' },
            criteriaRange2: { name: '條件範圍 2', detail: '附加區域。 最多可輸入 127 個區域。 ' },
            criteria2: { name: '條件 2', detail: '附加關聯條件。 最多可以輸入 127 個條件。 ' },
        },
    },
    MEDIAN: {
        description: '傳回給定數值集合的中位數',
        abstract: '傳回給定數值集合的中位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算中位數的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算中位數的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    MIN: {
        description: '傳回一組值中的最小值。 ',
        abstract: '傳回參數清單中的最小值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: {
                name: '數值 1',
                detail: '要計算最小值的第一個數字、儲存格參考或儲存格區域。 ',
            },
            number2: {
                name: '數值 2',
                detail: '要計算最小值的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ',
            },
        },
    },
    MINA: {
        description: '傳回參數清單中的最小值，包括數字、文字和邏輯值。 ',
        abstract: '傳回參數清單中的最小值，包括數字、文字和邏輯值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '要計算最小值的第一個數字、儲存格參考或儲存格區域。 ' },
            value2: { name: '值 2', detail: '其他要計算最小值的數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    MINIFS: {
        description: '傳回一組給定條件或標準指定的儲存格之間的最小值。 ',
        abstract: '傳回一組給定條件或標準指定的儲存格之間的最小值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: '最小值範圍', detail: '確定最小值的實際儲存格區域。 ' },
            criteriaRange1: { name: '條件範圍 1', detail: '是一組用於條件計算的儲存格。 ' },
            criteria1: { name: '條件 1', detail: '用來決定哪些儲存格是最小值的條件，格式為數字、表達式或文字。 一組相同的條件適用於 MAXIFS、SUMIFS 和 AVERAGEIFS 函數。 ' },
            criteriaRange2: { name: '條件範圍 2', detail: '附加區域。 最多可輸入 127 個區域。 ' },
            criteria2: { name: '條件 2', detail: '附加關聯條件。 最多可以輸入 127 個條件。 ' },
        },
    },
    MODE_MULT: {
        description: '傳回一組資料或資料區域中出現頻率最高或重複出現的數值的垂直陣列',
        abstract: '傳回一組資料或資料區域中出現頻率最高或重複出現的數值的垂直陣列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算眾數的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算眾數的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    MODE_SNGL: {
        description: '傳回在資料集內出現次數最多的值',
        abstract: '傳回在資料集內出現次數最多的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算眾數的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算眾數的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    NEGBINOM_DIST: {
        description: '傳回負二項式分佈',
        abstract: '返回負二項式分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: '失敗次數', detail: '失敗的次數。' },
            numberS: { name: '成功次數', detail: '成功的閥值數目。' },
            probabilityS: { name: '成功機率', detail: '成功的機率。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，NEGBINOM.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    NORM_DIST: {
        description: '傳回常態累積分佈',
        abstract: '返回常態累積分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，NORM.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    NORM_INV: {
        description: '傳回常態累積分佈的反函數',
        abstract: '傳回常態累積分佈的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '對應到常態分佈的機率。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
        },
    },
    NORM_S_DIST: {
        description: '傳回標準常態累積分佈',
        abstract: '傳回標準常態累積分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '要找出分佈的數值。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，NORM.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    NORM_S_INV: {
        description: '傳回標準常態累積分佈函數的反函數',
        abstract: '傳回標準常態累積分佈函數的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '對應到常態分佈的機率。' },
        },
    },
    PEARSON: {
        description: '傳回 Pearson 乘積矩相關係數',
        abstract: '傳回 Pearson 乘積矩相關係數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '代表因變數資料的陣列或矩陣的範圍。' },
            array2: { name: '陣列2', detail: '代表自變數資料的陣列或矩陣的範圍。' },
        },
    },
    PERCENTILE_EXC: {
        description: '傳回資料集中第 k 個百分點的值 (不包括 0 與 1)',
        abstract: '傳回資料集中第 k 個百分點的值 (不包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '用以定義相對位置的陣列或資料範圍。' },
            k: { name: 'k', detail: '在 0 到 1 範圍內 (不包括 0 與 1) 的百分位數。' },
        },
    },
    PERCENTILE_INC: {
        description: '傳回資料集中第 k 個百分點的值 (包括 0 與 1)',
        abstract: '傳回資料集中第 k 個百分點的值 (包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '用以定義相對位置的陣列或資料範圍。' },
            k: { name: 'k', detail: '在 0 到 1 範圍內 (包括 0 與 1) 的百分位數。' },
        },
    },
    PERCENTRANK_EXC: {
        description: '傳回資料集中值的百分比排位 (不包括 0 與 1)',
        abstract: '傳回資料集中值的百分比排位 (不包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '用以定義相對位置的陣列或資料範圍。' },
            x: { name: 'x', detail: '想要知道排名的數值。' },
            significance: { name: '有效位數', detail: '用以識別傳回百分比值的最高有效位數之數值。 如果省略，PERCENTRANK.EXC 會使用三位小數 (0.xxx)。' },
        },
    },
    PERCENTRANK_INC: {
        description: '傳回資料集中值的百分比排位 (包括 0 與 1)',
        abstract: '傳回資料集中值的百分比排位 (包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '用以定義相對位置的陣列或資料範圍。' },
            x: { name: 'x', detail: '想要知道排名的數值。' },
            significance: { name: '有效位數', detail: '用以識別傳回百分比值的最高有效位數之數值。 如果省略，PERCENTRANK.INC 會使用三位小數 (0.xxx)。' },
        },
    },
    PERMUT: {
        description: '傳回給定數目物件的排列數',
        abstract: '傳回給定數目物件的排列數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: '總數', detail: '項目數。' },
            numberChosen: { name: '樣品數量', detail: '每個排列中的項目數。' },
        },
    },
    PERMUTATIONA: {
        description: '傳回可從總計物件中選取的給定數目物件（含重複）的排列數',
        abstract: '傳回可從總計物件中選取的給定數目物件（含重複）的排列數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: '總數', detail: '項目數。' },
            numberChosen: { name: '樣品數量', detail: '每個排列中的項目數。' },
        },
    },
    PHI: {
        description: '傳回標準常態分佈的密度函數值',
        abstract: '傳回標準常態分佈的密度函數值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'X 是要求標準常態分佈密度的數位。' },
        },
    },
    POISSON_DIST: {
        description: '返回泊松分佈',
        abstract: '返回泊松分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，POISSON.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    PROB: {
        description: '傳回區域中的數值落在指定區間內的機率',
        abstract: '傳回區域中的數值落在指定區間內的機率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: '數值', detail: '具有各自對應機率值的數值區域。' },
            probRange: { name: '機率', detail: '與數值相關聯的一組機率值。' },
            lowerLimit: { name: '下界', detail: '要計算其機率的數值下界。' },
            upperLimit: { name: '上界', detail: '要計算其機率的數值上界。' },
        },
    },
    QUARTILE_EXC: {
        description: '傳回資料集的四分位數 (不包括 0 與 1)',
        abstract: '傳回資料集的四分位數 (不包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要求得四分位數值的陣列或資料範圍。' },
            quart: { name: '四分位值', detail: '要傳回的四分位數值。' },
        },
    },
    QUARTILE_INC: {
        description: '傳回資料集的四分位數 (包括 0 與 1)',
        abstract: '傳回資料集的四分位數 (包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要求得四分位數值的陣列或資料範圍。' },
            quart: { name: '四分位值', detail: '要傳回的四分位數值。' },
        },
    },
    RANK_AVG: {
        description: '傳回一列數字的數字排位',
        abstract: '傳回一列數字的數字排位',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要找出其排名的數字。' },
            ref: { name: '數位清單', detail: '數位清單的參照。會忽略 ref 中的非數值。' },
            order: { name: '排列方式', detail: '指定排列數值方式的數字。0 或省略為遞減順序排序，非 0 為遞增順序排序。' },
        },
    },
    RANK_EQ: {
        description: '傳回一列數字的數字排位',
        abstract: '傳回一列數字的數字排位',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要找出其排名的數字。' },
            ref: { name: '數位清單', detail: '數位清單的參照。會忽略 ref 中的非數值。' },
            order: { name: '排列方式', detail: '指定排列數值方式的數字。0 或省略為遞減順序排序，非 0 為遞增順序排序。' },
        },
    },
    RSQ: {
        description: '傳回 Pearson 乘積矩相關係數的平方',
        abstract: '傳回 Pearson 積矩相關係數的平方',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '陣列_y', detail: '代表因變數資料的陣列或矩陣的範圍。' },
            knownXs: { name: '陣列_x', detail: '代表自變數資料的陣列或矩陣的範圍。' },
        },
    },
    SKEW: {
        description: '傳回分佈的偏斜度',
        abstract: '傳回分佈的偏斜度',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算偏斜度的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算偏斜度的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    SKEW_P: {
        description: '傳回基於樣本總體的分佈的偏斜度',
        abstract: '傳回基於樣本總體的分佈的偏斜度',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算偏斜度的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算偏斜度的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    SLOPE: {
        description: '傳回線性迴歸線的斜率',
        abstract: '傳回線性迴歸線的斜率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '陣列_y', detail: '代表因變數資料的陣列或矩陣的範圍。' },
            knownXs: { name: '陣列_x', detail: '代表自變數資料的陣列或矩陣的範圍。' },
        },
    },
    SMALL: {
        description: '傳回資料集中的第 k 個最小值',
        abstract: '傳回資料集中的第 k 個最小值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要判斷第 k 個最小值的陣列或資料範圍。' },
            k: { name: 'k', detail: '要傳回之資料陣列或儲存格範圍中的位置 (由最小起算)。' },
        },
    },
    STANDARDIZE: {
        description: '返回常態化數值',
        abstract: '返回常態化數值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出常態化的數值。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
        },
    },
    STDEV_P: {
        description: '計算基於以參數形式給出的整個樣本總體的標準偏差（忽略邏輯值和文本）。 ',
        abstract: '基於整個樣本總體計算標準差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '對應於總體的第一個數值參數。 ' },
            number2: { name: '數值 2', detail: '對應於總體的 2 到 254 個數值參數。 也可以用單一數組或對某個數組的引用來代替用逗號分隔的參數。 ' },
        },
    },
    STDEV_S: {
        description: '基於樣本估算標準差（忽略樣本中的邏輯值和文字）。 ',
        abstract: '基於樣本估算標準差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '對應於總體樣本的第一個數值參數。 也可以用單一數組或對某個數組的引用來代替用逗號分隔的參數。 ' },
            number2: { name: '數值 2', detail: '對應於總體樣本的 2 到 254 個數值參數。 也可以用單一數組或對某個數組的引用來代替用逗號分隔的參數。 ' },
        },
    },
    STDEVA: {
        description: '基於樣本（包括數字、文字和邏輯值）估算標準差。 ',
        abstract: '基於樣本（包括數字、文字和邏輯值）估算標準差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '對應於總體樣本的第一個值參數。 也可以用單一數組或對某個數組的引用來代替用逗號分隔的參數。 ' },
            value2: { name: '值 2', detail: '對應於總體樣本的 2 到 254 個值參數。 也可以用單一數組或對某個數組的引用來代替用逗號分隔的參數。 ' },
        },
    },
    STDEVPA: {
        description: '根據作為參數（包括文字和邏輯值）給定的整個總體計算標準偏差。 ',
        abstract: '基於樣本總體（包括數字、文本和邏輯值）計算標準偏差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '對應於總體的第一個值參數。 ' },
            value2: { name: '值 2', detail: '對應於總體的 2 到 254 個值參數。 也可以用單一數組或對某個數組的引用來代替用逗號分隔的參數。 ' },
        },
    },
    STEYX: {
        description: '傳回透過線性迴歸法預測每個 x 的 y 值時所產生的標準誤差',
        abstract: '返回透過線性迴歸法預測每個 x 的 y 值時所產生的標準誤差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '陣列_y', detail: '代表因變數資料的陣列或矩陣的範圍。' },
            knownXs: { name: '陣列_x', detail: '代表自變數資料的陣列或矩陣的範圍。' },
        },
    },
    T_DIST: {
        description: '傳回學生的 t 機率分佈',
        abstract: '傳回學生的 t 機率分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要計算分佈的數值。' },
            degFreedom: { name: '自由度', detail: '一個表示自由度數的整數。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，T.DIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    T_DIST_2T: {
        description: '傳回學生的 t 機率分佈 (雙尾)',
        abstract: '傳回學生的 t 機率分佈 (雙尾)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要計算分佈的數值。' },
            degFreedom: { name: '自由度', detail: '一個表示自由度數的整數。' },
        },
    },
    T_DIST_RT: {
        description: '傳回學生的 t 機率分佈 (右尾)',
        abstract: '傳回學生的 t 機率分佈 (右尾)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要計算分佈的數值。' },
            degFreedom: { name: '自由度', detail: '一個表示自由度數的整數。' },
        },
    },
    T_INV: {
        description: '傳回學生的 t 機率分佈的反函數',
        abstract: '傳回學生的 t 機率分佈的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '與學生的 t 分佈相關的機率。' },
            degFreedom: { name: '自由度', detail: '一個表示自由度數的整數。' },
        },
    },
    T_INV_2T: {
        description: '傳回學生的 t 機率分佈的反函數 (雙尾)',
        abstract: '傳回學生的 t 機率分佈的反函數 (雙尾)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '與學生的 t 分佈相關的機率。' },
            degFreedom: { name: '自由度', detail: '一個表示自由度數的整數。' },
        },
    },
    T_TEST: {
        description: '傳回與學生 t-檢定相關的機率',
        abstract: '返回與學生 t-檢定相關的機率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '第一個陣列或資料範圍。' },
            array2: { name: '陣列2', detail: '第二個陣列或資料範圍。' },
            tails: { name: '尾部特性', detail: '指定分佈的尾數。 如果 tails = 1，T.TEST 會使用單尾分佈。 如果 tails = 2，T.TEST 會使用雙尾分佈。' },
            type: { name: '檢定類型', detail: '要執行的 t 檢定類型。' },
        },
    },
    TREND: {
        description: '返回線性趨勢值',
        abstract: '返回線性趨勢值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: '已知資料_y', detail: '在 y = m*x+b 關係中一組已知的 y 值。' },
            knownXs: { name: '已知資料_x', detail: '在 y = m*x+b 關係中一組已知的 x 值。' },
            newXs: { name: '新資料_x', detail: '要 TREND 傳回對應 y 值的新 x 值。' },
            constb: { name: 'b', detail: '指定是否強迫常數 b 等於 0 的邏輯值。' },
        },
    },
    TRIMMEAN: {
        description: '傳回資料集的內部平均值',
        abstract: '傳回資料集的內部平均值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要求得內部平均值的陣列或資料範圍。' },
            percent: { name: '排除比例', detail: '從計算中排除資料點的百分比值。' },
        },
    },
    VAR_P: {
        description: '計算基於整個樣本總體的變異數（忽略樣本總體中的邏輯值和文字）。 ',
        abstract: '計算以樣本總體為基礎的變異數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '對應於總體的第一個數值參數。 ' },
            number2: { name: '數值 2', detail: '對應於總體的 2 到 254 個數值參數。 ' },
        },
    },
    VAR_S: {
        description: '估算以樣本為基礎的變異數（忽略樣本中的邏輯值和文字）。 ',
        abstract: '基於樣本估算變異數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '對應於總體樣本的第一個數值參數。 ' },
            number2: { name: '數值 2', detail: '對應於總體樣本的 2 到 254 個數值參數。 ' },
        },
    },
    VARA: {
        description: '基於樣本（包括數字、文字和邏輯值）估算變異數',
        abstract: '以樣本為基礎（包括數字、文字和邏輯值）估算變異數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '對應於總體樣本的第一個值參數。 ' },
            value2: { name: '值 2', detail: '對應於總體樣本的 2 到 254 個值參數' },
        },
    },
    VARPA: {
        description: '基於樣本總體（包括數字、文本和邏輯值）計算標準差',
        abstract: '基於樣本總體（包括數字、文本和邏輯值）計算標準偏差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: '值 1', detail: '對應於總體的第一個值參數。 ' },
            value2: { name: '值 2', detail: '對應於總體的 2 到 254 個值參數' },
        },
    },
    WEIBULL_DIST: {
        description: '傳回 Weibull 分佈',
        abstract: '傳回 Weibull 分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 WEIBULL.DIST 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
        },
    },
    Z_TEST: {
        description: '傳回 z 檢定的單尾機率值',
        abstract: '傳回 z 檢定的單尾機率值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '用來檢定 x 的陣列或資料範圍。' },
            x: { name: 'x', detail: '要檢定的值。' },
            sigma: { name: '標準差', detail: '總體（已知）標準差。如果省略，則使用樣本標準差。' },
        },
    },
};

export default locale;
