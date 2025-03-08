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
        description: '傳回 beta 累積分佈函數',
        abstract: '傳回 beta 累積分佈函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/betadist-%E5%87%BD%E6%95%B0-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用來計算其函數的值，介於下限值和上限值之間。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
            A: { name: '下限', detail: '函數的下限，預設值為 0。' },
            B: { name: '上限', detail: '函數的上限，預設值為 1。' },
        },
    },
    BETAINV: {
        description: '傳回指定 beta 分佈的累積分佈函數的反函數',
        abstract: '傳回指定 beta 分佈的累積分佈函數的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/betainv-%E5%87%BD%E6%95%B0-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
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
    BINOMDIST: {
        description: '傳回一元二項式分佈的機率',
        abstract: '傳回一元二項式分佈的機率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/binomdist-%E5%87%BD%E6%95%B0-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            numberS: { name: '成功次數', detail: '為實驗的成功次數。' },
            trials: { name: '實驗次數', detail: '為獨立實驗的次數。' },
            probabilityS: { name: '成功機率', detail: '每一次實驗的成功機率。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 BINOMDIST 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
        },
    },
    CHIDIST: {
        description: '傳回 χ2 分佈的右尾機率',
        abstract: '傳回 χ2 分佈的右尾機率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/chidist-%E5%87%BD%E6%95%B0-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用來評估分佈的值。' },
            degFreedom: { name: '自由度', detail: '自由度。' },
        },
    },
    CHIINV: {
        description: '傳回 χ2 分佈的右尾機率的反函數值。',
        abstract: '傳回 χ2 分佈的右尾機率的反函數值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/chiinv-%E5%87%BD%E6%95%B0-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '與 χ2 分佈相關聯的機率。' },
            degFreedom: { name: '自由度', detail: '自由度。' },
        },
    },
    CHITEST: {
        description: '返回獨立性檢驗值',
        abstract: '返回獨立性檢驗值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/chitest-%E5%87%BD%E6%95%B0-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            actualRange: { name: '觀察範圍', detail: '觀察值範圍，用來檢定預期值。' },
            expectedRange: { name: '預期範圍', detail: '資料範圍，其內容為各欄總和乘各列總和後的值，再除以全部值總和的比率。' },
        },
    },
    CONFIDENCE: {
        description: '使用常態分佈傳回總體平均值的置信區間。',
        abstract: '使用常態分佈傳回總體平均值的置信區間。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/confidence-%E5%87%BD%E6%95%B0-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '用於計算置信水準的顯著水準。置信水準等於 100*(1 - alpha)%，換句話說，alpha 0.05 表示信賴水準為 95%。' },
            standardDev: { name: '總體標準差', detail: '假設資料範圍的總體標準差已知。' },
            size: { name: '樣本大小', detail: '樣本大小。' },
        },
    },
    COVAR: {
        description: '傳回總體協方差，即兩個資料集中每對資料點的偏差乘積的平均值。',
        abstract: '傳回總體協方差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/covar-%E5%87%BD%E6%95%B0-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '第一個儲存格值範圍。' },
            array2: { name: '陣列2', detail: '第二個儲存格值範圍。' },
        },
    },
    CRITBINOM: {
        description: '傳回使累積二項式分佈小於或等於臨界值的最小值',
        abstract: '傳回使累積二項式分佈小於或等於臨界值的最小值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/critbinom-%E5%87%BD%E6%95%B0-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            trials: { name: '實驗次數', detail: '伯努利實驗的次數。' },
            probabilityS: { name: '成功機率', detail: '每一次實驗的成功機率。' },
            alpha: { name: '目標機率', detail: '臨界值。' },
        },
    },
    EXPONDIST: {
        description: '返回指數分佈',
        abstract: '返回指數分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/expondist-%E5%87%BD%E6%95%B0-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用來評估分佈的值。' },
            lambda: { name: 'lambda', detail: '參數值。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，EXPONDIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    FDIST: {
        description: '傳回 F 機率分佈（右尾）',
        abstract: '傳回 F 機率分佈（右尾）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/fdist-%E5%87%BD%E6%95%B0-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            x: { name: '值', detail: '用於評估函數的值。' },
            degFreedom1: { name: '分子自由度', detail: '分子的自由度。' },
            degFreedom2: { name: '分母自由度', detail: '分母的自由度。' },
        },
    },
    FINV: {
        description: '傳回 F 機率分佈（右尾）的反函數',
        abstract: '傳回 F 機率分佈（右尾）的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/finv-%E5%87%BD%E6%95%B0-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: 'F 累積分佈相關的機率' },
            degFreedom1: { name: '分子自由度', detail: '分子的自由度。' },
            degFreedom2: { name: '分母自由度', detail: '分母的自由度。' },
        },
    },
    FTEST: {
        description: '傳回 F 檢驗的結果',
        abstract: '傳回 F 檢驗的結果',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ftest-%E5%87%BD%E6%95%B0-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '第一個陣列或資料範圍。' },
            array2: { name: '陣列2', detail: '第二個陣列或資料範圍。' },
        },
    },
    GAMMADIST: {
        description: '傳回 γ 分佈',
        abstract: '傳回 γ 分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/gammadist-%E5%87%BD%E6%95%B0-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 GAMMADIST 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
        },
    },
    GAMMAINV: {
        description: '傳回 γ 累積分佈函數的反函數',
        abstract: '傳回 γ 累積分佈函數的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/gammainv-%E5%87%BD%E6%95%B0-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '與伽瑪分佈的相關機率。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
        },
    },
    HYPGEOMDIST: {
        description: '返回超幾何分佈',
        abstract: '返回超幾何分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/hypgeomdist-%E5%87%BD%E6%95%B0-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            sampleS: { name: '樣本成功次數', detail: '樣本中成功的次數。' },
            numberSample: { name: '樣本大小', detail: '樣本大小。' },
            populationS: { name: '總體成功次數', detail: '總體中成功的次數。' },
            numberPop: { name: '總體大小', detail: '總體大小。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 HYPGEOMDIST 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
        },
    },
    LOGINV: {
        description: '傳回對數常態累積分佈的反函數',
        abstract: '傳回對數常態累積分佈的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/loginv-%E5%87%BD%E6%95%B0-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '對應到對數常態分佈的機率。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
        },
    },
    LOGNORMDIST: {
        description: '傳回對數常態累積分佈',
        abstract: '傳回對數常態累積分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/lognormdist-%E5%87%BD%E6%95%B0-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，LOGNORMDIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    MODE: {
        description: '傳回在資料集內出現次數最多的值',
        abstract: '傳回在資料集內出現次數最多的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mode-%E5%87%BD%E6%95%B0-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要計算眾數的第一個數字、儲存格參考或儲存格區域。 ' },
            number2: { name: '數值 2', detail: '要計算眾數的其他數字、儲存格參考或儲存格區域，最多可包含 255 個。 ' },
        },
    },
    NEGBINOMDIST: {
        description: '傳回負二項式分佈',
        abstract: '返回負二項式分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/negbinomdist-%E5%87%BD%E6%95%B0-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            numberF: { name: '失敗次數', detail: '失敗的次數。' },
            numberS: { name: '成功次數', detail: '成功的閥值數目。' },
            probabilityS: { name: '成功機率', detail: '成功的機率。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，NEGBINOMDIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    NORMDIST: {
        description: '傳回常態累積分佈',
        abstract: '返回常態累積分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/normdist-%E5%87%BD%E6%95%B0-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，NORMDIST 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    NORMINV: {
        description: '傳回常態累積分佈的反函數',
        abstract: '傳回常態累積分佈的反函數',
        links: [{
            title: '教導',
            url: 'https://support.microsoft.com/zh-tw/office/norminv-%E5%87%BD%E6%95%B0-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
        }],
        functionParameter: {
            probability: { name: '機率', detail: '對應到常態分佈的機率。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            standardDev: { name: '標準差', detail: '分佈的標準差。' },
        },
    },
    NORMSDIST: {
        description: '傳回標準常態累積分佈',
        abstract: '傳回標準常態累積分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/normsdist-%E5%87%BD%E6%95%B0-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '要找出分佈的數值。' },
        },
    },
    NORMSINV: {
        description: '傳回標準常態累積分佈函數的反函數',
        abstract: '傳回標準常態累積分佈函數的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/normsinv-%E5%87%BD%E6%95%B0-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '對應到常態分佈的機率。' },
        },
    },
    PERCENTILE: {
        description: '傳回資料集中第 k 個百分點的值 (包括 0 與 1)',
        abstract: '傳回資料集中第 k 個百分點的值 (包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/percentile-%E5%87%BD%E6%95%B0-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '用以定義相對位置的陣列或資料範圍。' },
            k: { name: 'k', detail: '在 0 到 1 範圍內 (包括 0 與 1) 的百分位數。' },
        },
    },
    PERCENTRANK: {
        description: '傳回資料集中值的百分比排位 (包括 0 與 1)',
        abstract: '傳回資料集中值的百分比排位 (包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/percentrank-%E5%87%BD%E6%95%B0-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '用以定義相對位置的陣列或資料範圍。' },
            x: { name: 'x', detail: '想要知道排名的數值。' },
            significance: { name: '有效位數', detail: '用以識別傳回百分比值的最高有效位數之數值。 如果省略，PERCENTRANK 會使用三位小數 (0.xxx)。' },
        },
    },
    POISSON: {
        description: '返回泊松分佈',
        abstract: '返回泊松分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/poisson-%E5%87%BD%E6%95%B0-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            mean: { name: '平均值', detail: '分佈的算術平均值。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。 如果為 TRUE，POISSON 會傳回累積分佈函數；如果為 FALSE，則會傳回機率密度函數。' },
        },
    },
    QUARTILE: {
        description: '傳回資料集的四分位數 (包括 0 與 1)',
        abstract: '傳回資料集的四分位數 (包括 0 與 1)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/quartile-%E5%87%BD%E6%95%B0-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要求得四分位數值的陣列或資料範圍。' },
            quart: { name: '四分位值', detail: '要傳回的四分位數值。' },
        },
    },
    RANK: {
        description: '傳回一列數字的數字排位',
        abstract: '傳回一列數字的數字排位',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/rank-%E5%87%BD%E6%95%B0-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要找出其排名的數字。' },
            ref: { name: '數位清單', detail: '數位清單的參照。會忽略 ref 中的非數值。' },
            order: { name: '排列方式', detail: '指定排列數值方式的數字。0 或省略為遞減順序排序，非 0 為遞增順序排序。' },
        },
    },
    STDEV: {
        description: '根據樣本估計標準差。 標準差可以測量值在平均值（中位數）附近分佈的範圍大小。 ',
        abstract: '基於樣本估算標準差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/stdev-%E5%87%BD%E6%95%B0-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '對應於總體樣本的第一個數值參數。 ' },
            number2: { name: '數值 2', detail: '對應於總體樣本的 2 到 255 個數值參數。 也可以用單一數組或對某個數組的引用來代替用逗號分隔的參數。 ' },
        },
    },
    STDEVP: {
        description: '根據作為參數給定的整個總體計算標準偏差。 ',
        abstract: '基於整個樣本總體計算標準差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/stdevp-%E5%87%BD%E6%95%B0-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '對應於總體的第一個數值參數。 ' },
            number2: { name: '數值 2', detail: '對應於總體的 2 到 255 個數值參數。 也可以用單一數組或對某個數組的引用來代替用逗號分隔的參數。 ' },
        },
    },
    TDIST: {
        description: '傳回學生的 t 機率分佈',
        abstract: '返回學生 t-分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tdist-%E5%87%BD%E6%95%B0-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '需要計算分佈的數值。' },
            degFreedom: { name: '自由度', detail: '一個表示自由度數的整數。' },
            tails: { name: '尾部特性', detail: '指定要傳回之分佈尾數。 如果 Tails = 1，TDIST 會傳回單尾分佈。 如果 Tails = 2，TDIST 會傳回雙尾分佈。' },
        },
    },
    TINV: {
        description: '傳回學生的 t 機率分佈的反函數 (雙尾)',
        abstract: '傳回學生的 t 機率分佈的反函數 (雙尾)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tinv-%E5%87%BD%E6%95%B0-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            probability: { name: '機率', detail: '與學生的 t 分佈相關的機率。' },
            dedegFreedom: { name: '自由度', detail: '一個表示自由度數的整數。' },
        },
    },
    TTEST: {
        description: '傳回與學生 t-檢定相關的機率',
        abstract: '返回與學生 t-檢定相關的機率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ttest-%E5%87%BD%E6%95%B0-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '第一個陣列或資料範圍。' },
            array2: { name: '陣列2', detail: '第二個陣列或資料範圍。' },
            tails: { name: '尾部特性', detail: '指定分佈的尾數。 如果 tails = 1，TTEST 會使用單尾分佈。 如果 tails = 2，TTEST 會使用雙尾分佈。' },
            type: { name: '檢定類型', detail: '要執行的 t 檢定類型。' },
        },
    },
    VAR: {
        description: '計算基於給定樣本的變異數。 ',
        abstract: '基於樣本估算變異數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/var-%E5%87%BD%E6%95%B0-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '對應於總體樣本的第一個數值參數。 ' },
            number2: { name: '數值 2', detail: '應於總體樣本的 2 到 255 個數值參數。 ' },
        },
    },
    VARP: {
        description: '計算基於樣本總體的變異數。 ',
        abstract: '計算以樣本總體為基礎的變異數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/varp-%E5%87%BD%E6%95%B0-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '對應於總體的第一個數值參數。 ' },
            number2: { name: '數值 2', detail: '對應於總體的 2 到 255 個數值參數。 ' },
        },
    },
    WEIBULL: {
        description: '傳回 Weibull 分佈',
        abstract: '傳回 Weibull 分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/weibull-%E5%87%BD%E6%95%B0-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '要找出分佈的數值。' },
            alpha: { name: 'alpha', detail: '分佈的第一個參數。' },
            beta: { name: 'beta', detail: '分佈的第二個參數。' },
            cumulative: { name: '累積', detail: '決定函數形式的邏輯值。如果為 TRUE，則 WEIBULL 傳回累積分佈函數；如果為 FALSE，則傳回機率密度函數。' },
        },
    },
    ZTEST: {
        description: '傳回 z 檢定的單尾機率值',
        abstract: '傳回 z 檢定的單尾機率值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ztest-%E5%87%BD%E6%95%B0-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '用來檢定 x 的陣列或資料範圍。' },
            x: { name: 'x', detail: '要檢定的值。' },
            sigma: { name: '標準差', detail: '總體（已知）標準差。如果省略，則使用樣本標準差。' },
        },
    },
};
