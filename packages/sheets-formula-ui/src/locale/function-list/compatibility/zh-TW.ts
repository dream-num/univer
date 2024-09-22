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
        description: '傳回 beta 累積分佈函數',
        abstract: '傳回 beta 累積分佈函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/betadist-%E5%87%BD%E6%95%B0-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHIDIST: {
        description: '傳回 χ2 分佈的單尾機率',
        abstract: '傳回 χ2 分佈的單尾機率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/chidist-%E5%87%BD%E6%95%B0-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHIINV: {
        description: '傳回 χ2 分佈的單尾機率的反函數',
        abstract: '傳回 χ2 分佈的單尾機率的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/chiinv-%E5%87%BD%E6%95%B0-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONFIDENCE: {
        description: '傳回總體平均值的置信區間',
        abstract: '傳回總體平均值的置信區間',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/confidence-%E5%87%BD%E6%95%B0-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COVAR: {
        description: '傳回協方差（成對偏差乘積的平均值）',
        abstract: '傳回協方差（成對偏差乘積的平均值）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/covar-%E5%87%BD%E6%95%B0-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FDIST: {
        description: '返回 F 機率分佈',
        abstract: '返回 F 機率分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/fdist-%E5%87%BD%E6%95%B0-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FINV: {
        description: '傳回 F 機率分佈的反函數',
        abstract: '傳回 F 機率分佈的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/finv-%E5%87%BD%E6%95%B0-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GAMMADIST: {
        description: '返回 γ 分佈',
        abstract: '返回 γ 分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/gammadist-%E5%87%BD%E6%95%B0-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGINV: {
        description: '傳回對數累積分佈函數的反函數',
        abstract: '傳回對數累積分佈函數的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/loginv-%E5%87%BD%E6%95%B0-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOGNORMDIST: {
        description: '傳回對數累積分佈函數',
        abstract: '傳回對數累積分佈函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/lognormdist-%E5%87%BD%E6%95%B0-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NORMINV: {
        description: '傳回常態累積分佈的反函數',
        abstract: '傳回常態累積分佈的反函數',
        links: [{
            title: '教導',
            url: 'https://support.microsoft.com/zh-tw/office/norminv-%E5%87%BD%E6%95%B0-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
        },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTILE: {
        description: '傳回區域中數值的第 k 個百分點的值',
        abstract: '傳回區域中數值的第 k 個百分點的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/percentile-%E5%87%BD%E6%95%B0-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PERCENTRANK: {
        description: '傳回資料集中值的百分比排位',
        abstract: '傳回資料集中值的百分比排位',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/percentrank-%E5%87%BD%E6%95%B0-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    QUARTILE: {
        description: '傳回一組資料的四分位點',
        abstract: '傳回一組資料的四分位點',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/quartile-%E5%87%BD%E6%95%B0-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number: { name: '數值', detail: '這是要找出其排名的數字。' },
            ref: { name: '數位清單', detail: '數位清單的參照。會忽略 ref 中的非數值。' },
            order: { name: '排列方式', detail: '這是指定排列數值方式的數字。0 或省略為遞減順序排序，非 0 為遞增順序排序。' },
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
        description: '返回學生 t-分佈',
        abstract: '返回學生 t-分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tdist-%E5%87%BD%E6%95%B0-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TINV: {
        description: '傳回學生 t-分佈的反函數',
        abstract: '傳回學生 t-分佈的反函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tinv-%E5%87%BD%E6%95%B0-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
        description: '返回 Weibull 分佈',
        abstract: '返回 Weibull 分佈',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/weibull-%E5%87%BD%E6%95%B0-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
