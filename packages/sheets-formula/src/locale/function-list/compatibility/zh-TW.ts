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
        description: '傳回累加 beta 機率密度函數。 beta 分配常用來研究不同樣本之間的變異程度百分比，例如研究大眾每日花在看電視的部分時間。',
        abstract: '傳回累加 beta 機率密度函數。 beta 分配常用來研究不同樣本之間的變異程度百分比，例如研究大眾每日花在看電視的部分時間。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '需要 X 。 為 A 與 B 之間的一個數值，用以評估該函數。' },
            alpha: { name: 'alpha', detail: '必須。 這是分配的參數。' },
            beta: { name: 'beta', detail: '必須。 這是分配的參數。' },
            A: { name: '下限', detail: '可選的。 這是 x 區間下限。' },
            B: { name: '上限', detail: '選。 這是 x 區間上限。' },
        },
    },
    BETAINV: {
        description: '傳回指定 beta 分配之累加 beta 機率密度函數的反函數值。 也就是說，若 probability = BETADIST(x,...)，則 BETAINV(probability,...) = x。 在專案規劃中可使用 beta 分配，以特定的預期完成時間及變化來模擬可能的完成時間。',
        abstract: '傳回指定 beta 分配之累加 beta 機率密度函數的反函數值。 也就是說，若 probability = BETADIST(x,...)，則 BETAINV(probability,...) = x。 在專案規劃中可使用 beta 分配，以特定的預期完成時間及變化來模擬可能的完成時間。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '必須。 這是 beta 分配的相關機率。' },
            alpha: { name: 'alpha', detail: '必須。 這是分配的參數。' },
            beta: { name: 'beta', detail: '必須。 這是分配的參數。' },
            A: { name: '下限', detail: '可選的。 這是 x 區間下限。' },
            B: { name: '上限', detail: '選。 這是 x 區間上限。' },
        },
    },
    BINOMDIST: {
        description: '傳回在特定次數的二項分配實驗中，實驗成功的機率。 若實驗的結果不是成功就是失敗，並且任何實驗都是獨立的，同時在整個實驗中，成功的機率是常數，便可使用 BINOMDIST 函數來解決固定實驗次數的問題。 例如，BINOMDIST 可以計算下三胎中有兩男的機率。',
        abstract: '傳回在特定次數的二項分配實驗中，實驗成功的機率。 若實驗的結果不是成功就是失敗，並且任何實驗都是獨立的，同時在整個實驗中，成功的機率是常數，便可使用 BINOMDIST 函數來解決固定實驗次數的問題。 例如，BINOMDIST 可以計算下三胎中有兩男的機率。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: '成功次數', detail: '必須。 為實驗的成功次數。' },
            trials: { name: '實驗次數', detail: '必須。 為獨立實驗的次數。' },
            probabilityS: { name: '成功機率', detail: '必須。 每一次實驗的成功機率。' },
            cumulative: { name: '累積', detail: '必須。 這是決定函數形式的邏輯值。 如果 cumulative 為 TRUE，則 BINOMDIST 會傳回累加分配函數，最多有 number_s 次成功的機率；如果為 FALSE，則會傳回機率質量函數，有 number_s 次成功的機率。' },
        },
    },
    CHIDIST: {
        description: '傳回卡方分配的右尾機率值。 χ2 分配與 χ2 檢定相關聯。 使用 χ2 檢定可以比較觀察值與預期值。 例如，遺傳學實驗可能會假設植物的下一代會顯出一組特定的顏色。 藉由比較觀查結果與預期結果，您可以判定原先的假設是否有效。',
        abstract: '傳回卡方分配的右尾機率值。 χ2 分配與 χ2 檢定相關聯。 使用 χ2 檢定可以比較觀察值與預期值。 例如，遺傳學實驗可能會假設植物的下一代會顯出一組特定的顏色。 藉由比較觀查結果與預期結果，您可以判定原先的假設是否有效。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '需要 X 。 這是用來評估分配的值。' },
            degFreedom: { name: '自由度', detail: '必須。 這是自由度。' },
        },
    },
    CHIINV: {
        description: '傳回卡方分配之右尾機率的反函數值。 若 probability = CHIDIST(x,...)，則 CHIINV(probability,...) = x。 使用此函數比較觀查結果和預期結果，用以判斷原始的假設是否有效。',
        abstract: '傳回卡方分配之右尾機率的反函數值。 若 probability = CHIDIST(x,...)，則 CHIINV(probability,...) = x。 使用此函數比較觀查結果和預期結果，用以判斷原始的假設是否有效。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '必須。 這是與卡方分配相關聯的機率。' },
            degFreedom: { name: '自由度', detail: '必須。 這是自由度。' },
        },
    },
    CHITEST: {
        description: '傳回獨立性檢定的結果。 CHITEST 會根據統計量及適當的自由度傳回卡方 (χ2) 分配的值。 您可以使用 χ2 檢定來判斷實驗結果是否符合原先的假設。',
        abstract: '傳回獨立性檢定的結果。 CHITEST 會根據統計量及適當的自由度傳回卡方 (χ2) 分配的值。 您可以使用 χ2 檢定來判斷實驗結果是否符合原先的假設。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: '觀察範圍', detail: '必須。 這是觀察值範圍，用來檢定預期值。' },
            expectedRange: { name: '預期範圍', detail: '必須。 這是資料範圍，其內容為各欄總和乘各列總和後的值，再除以全部值總和的比率。' },
        },
    },
    CONFIDENCE: {
        description: '使用常態分配，傳回母體平均數的信賴區間。',
        abstract: '使用常態分配，傳回母體平均數的信賴區間。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '必須。 用以推算信賴等級的顯著水準。 信賴等級等於 100*(1 - alpha)%，換言之，0.05 的 alpha 值所指的是百分之 95 的信賴等級。' },
            standardDev: { name: '總體標準差', detail: '必須。 這是資料範圍的母體標準差，且假定為已知。' },
            size: { name: '樣本大小', detail: '必須。 這是樣本大小。' },
        },
    },
    COVAR: {
        description: '回傳協方差，即兩組資料中每個資料點對偏差乘積的平均值。',
        abstract: '回傳協方差，即兩組資料中每個資料點對偏差乘積的平均值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '必須。 第一個整數的儲存格範圍。' },
            array2: { name: '陣列2', detail: '必須。 第二個整數的儲存格範圍。' },
        },
    },
    CRITBINOM: {
        description: '傳回累加二項分配函數大於或等於臨界值的最小數值。 此函數可用於品質保證應用程式中。 例如，使用 CRITBINOM 來決定我們在無需放棄整批產品的條件下，允許生產線上生產瑕疵品的最大數目。',
        abstract: '傳回累加二項分配函數大於或等於臨界值的最小數值。 此函數可用於品質保證應用程式中。 例如，使用 CRITBINOM 來決定我們在無需放棄整批產品的條件下，允許生產線上生產瑕疵品的最大數目。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: '實驗次數', detail: '必須。 為二項分配之測試個數。' },
            probabilityS: { name: '成功機率', detail: '必須。 每一次實驗的成功機率。' },
            alpha: { name: '目標機率', detail: '必須。 這是臨界值。' },
        },
    },
    EXPONDIST: {
        description: '傳回指數分配函數。 使用 EXPONDIST 來建立兩事件間的時間模式，例如銀行自動櫃員機在提款時所花費的時間。 例如，您可以使用 EXPONDIST 來判定該程序最多花一分鐘的機率。',
        abstract: '傳回指數分配函數。 使用 EXPONDIST 來建立兩事件間的時間模式，例如銀行自動櫃員機在提款時所花費的時間。 例如，您可以使用 EXPONDIST 來判定該程序最多花一分鐘的機率。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '需要 X 。 這是函數的值。' },
            lambda: { name: 'lambda', detail: '必須。 這是參數值。' },
            cumulative: { name: '累積', detail: '必須。 這是指出要提供何種指數函數形式的邏輯值。 如果 cumulative 為 TRUE，則 EXPONDIST 會傳回累加分配函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    FDIST: {
        description: '會傳回兩組資料的 (右尾) F 機率分配 (散佈程度)。 您也可以使用此函數來判定兩組資料的散佈程度是否不同。 例如，您可以檢查男生和女生的高中入學考試成績，以判斷女生成績的變異性是否與男生不同。',
        abstract: '會傳回兩組資料的 (右尾) F 機率分配 (散佈程度)。 您也可以使用此函數來判定兩組資料的散佈程度是否不同。 例如，您可以檢查男生和女生的高中入學考試成績，以判斷女生成績的變異性是否與男生不同。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '需要 X 。 這是用於評估函數的值。' },
            degFreedom1: { name: '分子自由度', detail: '必須。 這是分子的自由度。' },
            degFreedom2: { name: '分母自由度', detail: '必須。 這是分母的自由度。' },
        },
    },
    FINV: {
        description: '傳回 (右尾) F 機率分配的反函數值。 如果 p = FDIST(x,...)，則 FINV(p,...) = x。',
        abstract: '傳回 (右尾) F 機率分配的反函數值。 如果 p = FDIST(x,...)，則 FINV(p,...) = x。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '必須。 這是與 F 累加分配相關的機率。' },
            degFreedom1: { name: '分子自由度', detail: '必須。 這是分子的自由度。' },
            degFreedom2: { name: '分母自由度', detail: '必須。 這是分母的自由度。' },
        },
    },
    FTEST: {
        description: '傳回 F 檢定的結果。 F 檢定會傳回 array1 及 array2 中變異數沒有顯著差異的雙尾機率值。 使用此函數來判斷兩個樣本是否有不同的變異數。 例如，對特定的公私立學校的測驗成績，您可以測試這些學校的測試成績是否具有不同的變異程度。',
        abstract: '傳回 F 檢定的結果。 F 檢定會傳回 array1 及 array2 中變異數沒有顯著差異的雙尾機率值。 使用此函數來判斷兩個樣本是否有不同的變異數。 例如，對特定的公私立學校的測驗成績，您可以測試這些學校的測試成績是否具有不同的變異程度。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '必須。 這是第一個陣列或資料範圍。' },
            array2: { name: '陣列2', detail: '必須。 這是第二個陣列或資料範圍。' },
        },
    },
    GAMMADIST: {
        description: '傳回伽瑪分配。 您可使用此函數來研究可能有偏態分配的變數。 伽瑪分配通常用於佇列分析。',
        abstract: '傳回伽瑪分配。 您可使用此函數來研究可能有偏態分配的變數。 伽瑪分配通常用於佇列分析。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要 X 。 這是用來評估分配的值。' },
            alpha: { name: 'alpha', detail: '必須。 這是分配的參數。' },
            beta: { name: 'beta', detail: '必須。 這是分配的參數。 若 beta = 1，則 GAMMADIST 會傳回標準的伽瑪分配。' },
            cumulative: { name: '累積', detail: '必須。 這是決定函數形式的邏輯值。 如果 cumulative 為 TRUE，GAMMADIST 會傳回累加分配函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    GAMMAINV: {
        description: '傳回伽瑪累加分配的反函數值。 如果 p = GAMMADIST(x,...)，則 GAMMAINV(p,...) = x。 您可以使用此函數來研究可能是偏態分配的變數。',
        abstract: '傳回伽瑪累加分配的反函數值。 如果 p = GAMMADIST(x,...)，則 GAMMAINV(p,...) = x。 您可以使用此函數來研究可能是偏態分配的變數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '必須。 這是與伽瑪分配關聯的機率。' },
            alpha: { name: 'alpha', detail: '必須。 這是分配的參數。' },
            beta: { name: 'beta', detail: '必須。 這是分配的參數。 若 beta = 1，則 GAMMAINV 會傳回標準的伽瑪分配。' },
        },
    },
    HYPGEOMDIST: {
        description: '傳回超幾何分配。 HYPGEOMDIST 會傳回指定之樣本成功個數、樣本大小、母體成功個數及母體大小等的機率。 HYPGEOMDIST 可用以解決有限母體的問題，例如每次觀察成功或失敗，和每一個有同樣大小的子集合發生機會均等時適用。',
        abstract: '傳回超幾何分配。 HYPGEOMDIST 會傳回指定之樣本成功個數、樣本大小、母體成功個數及母體大小等的機率。 HYPGEOMDIST 可用以解決有限母體的問題，例如每次觀察成功或失敗，和每一個有同樣大小的子集合發生機會均等時適用。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: '樣本成功次數', detail: '必須。 這是樣本中的成功個數。' },
            numberSample: { name: '樣本大小', detail: '必須。 這是樣本的大小。' },
            populationS: { name: '總體成功次數', detail: '必須。 這是母體中的成功個數。' },
            numberPop: { name: '總體大小', detail: '必須。 這是母體的大小。' },
        },
    },
    LOGINV: {
        description: '傳回 x 的對數常態累加分配函數的反函數，其中 ln(x) 以 mean 和 standard_dev 參數進行常態分配。 如果 p = LOGNORMDIST(x,...)，則 LOGINV(p,...) = x。',
        abstract: '傳回 x 的對數常態累加分配函數的反函數，其中 ln(x) 以 mean 和 standard_dev 參數進行常態分配。 如果 p = LOGNORMDIST(x,...)，則 LOGINV(p,...) = x。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '必須。 這是與對數常態分配相關的機率。' },
            mean: { name: '平均值', detail: '必須。 這是 ln(x) 的平均值。' },
            standardDev: { name: '標準差', detail: '必須。 這是 ln(x) 的標準差。' },
        },
    },
    LOGNORMDIST: {
        description: '傳回 x 的累加對數常態分配，其中 ln(x) 以 mean 和 standard_dev 參數進行常態分配。 請使用此函數來分析對數轉換的資料。',
        abstract: '傳回 x 的累加對數常態分配，其中 ln(x) 以 mean 和 standard_dev 參數進行常態分配。 請使用此函數來分析對數轉換的資料。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要 X 。 這是用於評估函數的值。' },
            mean: { name: '平均值', detail: '必須。 這是 ln(x) 的平均值。' },
            standardDev: { name: '標準差', detail: '必須。 這是 ln(x) 的標準差。' },
        },
    },
    MODE: {
        description: '假設你想知道在關鍵濕地30年期間，鳥類普查樣本中最常見的鳥類數量，或想知道非尖峰時段電話支援中心最常接到的電話數量。 要計算一組數字的模態，請使用 MODE 函數。',
        abstract: '假設你想知道在關鍵濕地30年期間，鳥類普查樣本中最常見的鳥類數量，或想知道非尖峰時段電話支援中心最常接到的電話數量。 要計算一組數字的模態，請使用 MODE 函數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '必須。 這是您要計算眾數的第一個數字引數。' },
            number2: { name: '數值 2', detail: '可選的。 這是要計算眾數的第 2 個到第 255 個數字引數。 您也可以使用單一陣列或陣列參照來取代以逗點分隔的引數。' },
        },
    },
    NEGBINOMDIST: {
        description: '傳回負二項分配。 當成功常數機率為 probability_s 時，NEGBINOMDIST 會傳回 number_s 成功之前有 number_f 次失敗的機率。 此函數類似於二項分配，不過成功次數是固定的，而試驗的次數是變動的。 如同二項分配，也會假定每次試驗都是獨立的。',
        abstract: '傳回負二項分配。 當成功常數機率為 probability_s 時，NEGBINOMDIST 會傳回 number_s 成功之前有 number_f 次失敗的機率。 此函數類似於二項分配，不過成功次數是固定的，而試驗的次數是變動的。 如同二項分配，也會假定每次試驗都是獨立的。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: '失敗次數', detail: '必須。 這是失敗的次數。' },
            numberS: { name: '成功次數', detail: '必須。 這是成功的閥值數目。' },
            probabilityS: { name: '成功機率', detail: '必須。 這是成功的機率。' },
        },
    },
    NORMDIST: {
        description: 'NORMDIST 函數回傳指定平均值與標準差的常態分布。 此函數在統計學中有廣泛的應用，包括假設檢定。',
        abstract: 'NORMDIST 函數回傳指定平均值與標準差的常態分布。 此函數在統計學中有廣泛的應用，包括假設檢定。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要 X 。 你想要分配的價值' },
            mean: { name: '平均值', detail: '必須。 分布的算術平均值' },
            standardDev: { name: '標準差', detail: '必須。 分布的標準差' },
            cumulative: { name: '累積', detail: '必須。 這是決定函數形式的邏輯值。 若累積值為真，NORMDIST 會回傳累積分布函數;若累積為假，則回傳機率質量函數。' },
        },
    },
    NORMINV: {
        description: '傳回指定之平均值和標準差的常態累加分配之反函數值。',
        abstract: '傳回指定之平均值和標準差的常態累加分配之反函數值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '必須。 這是對應到常態分配的機率。' },
            mean: { name: '平均值', detail: '必須。 這是分配的算術平均值。' },
            standardDev: { name: '標準差', detail: '必須。 這是分配的標準差。' },
        },
    },
    NORMSDIST: {
        description: '傳回標準常態累加分配函數。 此分配的平均值為 0 (零)，標準差為 1。 使用此函數可代替標準常態曲線區域的表格。',
        abstract: '傳回標準常態累加分配函數。 此分配的平均值為 0 (零)，標準差為 1。 使用此函數可代替標準常態曲線區域的表格。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Z 必須。 這是您要找出分配的數值。' },
        },
    },
    NORMSINV: {
        description: '傳回標準常態累加分配的反函數值。 此分配的平均值為 0，標準差為 1。',
        abstract: '傳回標準常態累加分配的反函數值。 此分配的平均值為 0，標準差為 1。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '必須。 這是對應到常態分配的機率。' },
        },
    },
    PERCENTILE: {
        description: '傳回範圍中第 K 個百分位數的值。 您可以使用這個函數來建立可接受的臨界值。 例如，只接受分數在百分之九十以上的候選者。',
        abstract: '傳回範圍中第 K 個百分位數的值。 您可以使用這個函數來建立可接受的臨界值。 例如，只接受分數在百分之九十以上的候選者。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '必須。 用以定義相對位置的陣列或資料範圍。' },
            k: { name: 'k', detail: '必須 。 在 0 到 1 範圍內 (包括 0 與 1) 的百分位數。' },
        },
    },
    PERCENTRANK: {
        description: 'PERCENTRANK 函數回傳資料集中某個值的排名，作為該數值在整個資料集中的百分比——本質上，就是該值在整個資料集中中的相對地位。 例如，你可以使用 PERCENTRANK 來判斷個人在所有測驗分數欄位中的排名。',
        abstract: 'PERCENTRANK 函數回傳資料集中某個值的排名，作為該數值在整個資料集中的百分比——本質上，就是該值在整個資料集中中的相對地位。 例如，你可以使用 PERCENTRANK 來判斷個人在所有測驗分數欄位中的排名。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '必須。 資料範圍 (或預先定義的陣列) 數值，百分比排名就在其中決定。' },
            x: { name: 'x', detail: '需要 X 。 你想知道陣列中排名的值。' },
            significance: { name: '有效位數', detail: '可選的。 用以識別傳回百分比值的最高有效位數之數值。 如果省略，PERCENTRANK 會使用三位小數 (0.xxx)。' },
        },
    },
    POISSON: {
        description: '傳回波式分配。 波氏分配的一般應用，在於預測特定時間內事件發生的次數，例如，一分鐘內經過收費站的汽車數。',
        abstract: '傳回波式分配。 波氏分配的一般應用，在於預測特定時間內事件發生的次數，例如，一分鐘內經過收費站的汽車數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要 X 。 這是事件的數目。' },
            mean: { name: '平均值', detail: '必須。 這是期望值。' },
            cumulative: { name: '累積', detail: '必須。 這是邏輯值，用來決定機率分配所傳回的形式。 如果 cumulative 為 TRUE，POISSON 則會隨機事件發生次數在 0 到 x 次 (含) 之間的累加波氏機率；如果為 FALSE，則會傳回事件的數目正好是 x 的波氏機率密度函數。' },
        },
    },
    QUARTILE: {
        description: '傳回資料集的四分位數。 四分位數通常用於銷售和市場調查資料中，將母體分成不同的群組。 例如，您可以使用 QUARTILE 來找出母體中前 25% 的收入。',
        abstract: '傳回資料集的四分位數。 四分位數通常用於銷售和市場調查資料中，將母體分成不同的群組。 例如，您可以使用 QUARTILE 來找出母體中前 25% 的收入。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '必須。 這是要找出四分位數之數值的陣列或儲存格範圍。' },
            quart: { name: '四分位值', detail: '必須。 指出要傳回的數值。' },
        },
    },
    RANK: {
        description: '傳回數字在一數列中的排名。 數字的排名是它相對於列表中其他值的大小。 (如果你要排序這個清單，該數字的排名就是它的位置。)',
        abstract: '傳回數字在一數列中的排名。 數字的排名是它相對於列表中其他值的大小。 (如果你要排序這個清單，該數字的排名就是它的位置。)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '必須。 這是要找出其排名的數字。' },
            ref: { name: '數字清單', detail: '必須。 指的是一串數字。 會忽略 ref 中的非數值。' },
            order: { name: '排列方式', detail: '可選的。 這是指定排列數值方式的數字。 如果 order 為 0 (零) 或被省略，則 Microsoft Excel 把 ref 當成以遞減順序排序的數列來為 number 排名。 如果 order 不是 0，則 Microsoft Excel 會將 ref 當成以遞增順序排序的數列來來為 number 排名。' },
        },
    },
    STDEV: {
        description: '根據樣本來估算標準差。 標準差是用來衡量值與平均值 (平均數) 之間的離散程度。',
        abstract: '根據樣本來估算標準差。 標準差是用來衡量值與平均值 (平均數) 之間的離散程度。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '必須。 這是對應至母體樣本的第一個數字引數。' },
            number2: { name: '數值 2', detail: '可選的。 這是對應至母體樣本的第 2 個到第 255 個數字引數。 您也可以使用單一陣列或陣列參照來取代以逗點分隔的引數。' },
        },
    },
    STDEVP: {
        description: '根據指定為引數的整個母體來計算標準差。 標準差是用來衡量值與平均值 (平均數) 之間的離散程度。',
        abstract: '根據指定為引數的整個母體來計算標準差。 標準差是用來衡量值與平均值 (平均數) 之間的離散程度。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '必須。 這是對應至母體的第一個數字引數。' },
            number2: { name: '數值 2', detail: '可選的。 這是對應至母體的第 2 個到第 255 個數字引數。 您也可以使用單一陣列或陣列參照來取代以逗點分隔的引數。' },
        },
    },
    TDIST: {
        description: '傳回 Student T 分配的「百分比點」(機率)，其中數值 (x) 為 T 的計算結果值，該值是以「百分比點」來計算。 T 分配用於小樣本資料集的假設檢定。 使用此函數可取代 T 分配的臨界值表格。',
        abstract: '傳回 Student T 分配的「百分比點」(機率)，其中數值 (x) 為 T 的計算結果值，該值是以「百分比點」來計算。 T 分配用於小樣本資料集的假設檢定。 使用此函數可取代 T 分配的臨界值表格。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要 X 。 這是要評估分配的數值。' },
            degFreedom: { name: '自由度', detail: '必須。 這是指出自由度的整數值。' },
            tails: { name: '尾部特性', detail: '必須。 這是指定要傳回之分配尾數。 如果 Tails = 1，TDIST 會傳回單尾分配。 如果 Tails = 2，TDIST 會傳回雙尾分配。' },
        },
    },
    TINV: {
        description: '傳回 Student t 分配的雙尾反函數。',
        abstract: '傳回 Student t 分配的雙尾反函數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '必須。 這是與雙尾 Student t 分配相關的機率。' },
            degFreedom: { name: '自由度', detail: '必須。 這是用來說明分配特性的自由度。' },
        },
    },
    TTEST: {
        description: '傳回與 Student 氏 T 檢定相關的機率。 使用 TTEST 可以判斷兩個樣本是否可能來自平均值相同的兩個相同基礎母體。',
        abstract: '傳回與 Student 氏 T 檢定相關的機率。 使用 TTEST 可以判斷兩個樣本是否可能來自平均值相同的兩個相同基礎母體。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '必須。 這是第一個資料集。' },
            array2: { name: '陣列2', detail: '必須。 這是第二個資料集。' },
            tails: { name: '尾部特性', detail: '必須。 指定分配的尾數。 如果 tails = 1，TTEST 會使用單尾分配。 如果 tails = 2，TTEST 會使用雙尾分配。' },
            type: { name: '檢定類型', detail: '必須。 這是要執行的 t 檢定種類。' },
        },
    },
    VAR: {
        description: '根據樣本來估計變異數。',
        abstract: '根據樣本來估計變異數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '必須。 這是對應至母體樣本的第一個數字引數。' },
            number2: { name: '數值 2', detail: '可選的。 這是對應至母體樣本的第 2 個到第 255 個數字引數。' },
        },
    },
    VARP: {
        description: '根據整個母體來計算變異數。',
        abstract: '根據整個母體來計算變異數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '必須。 這是對應至母體的第一個數字引數。' },
            number2: { name: '數值 2', detail: '可選的。 這是對應至母體的第 2 個到第 254 個數字引數。' },
        },
    },
    WEIBULL: {
        description: '傳回 Weibull 分配。 您可以使用此分配進行信賴度分析，例如，用以計算設備損壞的平均時間。',
        abstract: '傳回 Weibull 分配。 您可以使用此分配進行信賴度分析，例如，用以計算設備損壞的平均時間。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要 X 。 這是用於評估函數的值。' },
            alpha: { name: 'alpha', detail: '必須。 這是分配的參數。' },
            beta: { name: 'beta', detail: '必須。 這是分配的參數。' },
            cumulative: { name: '累積', detail: '必須。 決定此函數的形式。' },
        },
    },
    ZTEST: {
        description: '傳回 Z 檢定的單尾機率值。 對於特定的假設母體平均值 μ0，ZTEST 會傳回樣本平均值可能大於資料集 (陣列) 之觀察平均值 (也就是觀察的樣本平均值) 的機率。',
        abstract: '傳回 Z 檢定的單尾機率值。 對於特定的假設母體平均值 μ0，ZTEST 會傳回樣本平均值可能大於資料集 (陣列) 之觀察平均值 (也就是觀察的樣本平均值) 的機率。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '必須。 這是用來檢定 x 的陣列或資料範圍。' },
            x: { name: 'x', detail: '需要 X 。 這是要檢定的值。' },
            sigma: { name: '標準差', detail: '可選的。 這是母體 (已知) 的標準差。 如果省略，會使用樣本標準差。' },
        },
    },
};

export default locale;
