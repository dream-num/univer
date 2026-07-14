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
    DAVERAGE: {
        description: '計算出清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的平均數值。',
        abstract: '計算出清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的平均數值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '是指組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '表示函式中使用的欄位。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '是包含你指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DCOUNT: {
        description: '計算清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件之含有數值的儲存格。',
        abstract: '計算清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件之含有數值的儲存格。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但引數之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DCOUNTA: {
        description: '計算清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的非空白儲存格。',
        abstract: '計算清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的非空白儲存格。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '可選的。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DGET: {
        description: '擷取清單或資料庫中欄內符合指定條件的單一值。',
        abstract: '擷取清單或資料庫中欄內符合指定條件的單一值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DMAX: {
        description: '傳回清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的最大值。',
        abstract: '傳回清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的最大值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DMIN: {
        description: '傳回清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的最小值。',
        abstract: '傳回清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的最小值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DPRODUCT: {
        description: '將清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的值相乘。',
        abstract: '將清單或資料庫的記錄欄位 (欄) 中，符合您所指定條件的值相乘。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DSTDEV: {
        description: '使用清單或資料庫的記錄欄位 (欄) 中符合指定條件的數字，根據範例估算母體的標準差。',
        abstract: '使用清單或資料庫的記錄欄位 (欄) 中符合指定條件的數字，根據範例估算母體的標準差。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DSTDEVP: {
        description: '使用清單或資料庫的記錄欄位 (欄) 中符合指定條件的數字，根據整個母體來計算母體的標準差。',
        abstract: '使用清單或資料庫的記錄欄位 (欄) 中符合指定條件的數字，根據整個母體來計算母體的標準差。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DSUM: {
        description: '在清單或資料庫中，DSUM 提供欄位 (欄位) 符合你指定條件的紀錄數字總和。',
        abstract: '在清單或資料庫中，DSUM 提供欄位 (欄位) 符合你指定條件的紀錄數字總和。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是一個相關資料的清單，其中相關資訊的列是 記錄 ，資料的欄位是 欄位 。 清單的第一列包含該列的標籤。' },
            field: { name: '欄位', detail: '必須。 這會指定函數中使用哪一欄。 例如，請指定雙引號包圍的欄位標籤，例如「年齡」或「讓出」。 或者，你也可以指定一個不加引號的 (，) 代表該欄在列表中的位置：例如，第一欄用 1 ，第二列用 2 ，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是包含你指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DVAR: {
        description: '使用清單或資料庫的記錄欄位 (欄) 中符合指定條件的數字，根據範例估算母體的變異數。',
        abstract: '使用清單或資料庫的記錄欄位 (欄) 中符合指定條件的數字，根據範例估算母體的變異數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
    DVARP: {
        description: '使用清單或資料庫的記錄欄位 (欄) 中符合指定條件的數字，根據整個母體計算母體的變異數。',
        abstract: '使用清單或資料庫的記錄欄位 (欄) 中符合指定條件的數字，根據整個母體計算母體的變異數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '必須。 這是組成清單或資料庫的儲存格範圍。 資料庫是相關資料的清單，其中相關資訊列為記錄，資料欄則為欄位。 清單的第一列會包含每一個資料欄的標籤。' },
            field: { name: '欄位', detail: '必須。 指出函數中所使用的資料欄。 輸入以雙引號括住的欄標籤，如 "樹齡" 或 "收益"，或是代表欄在清單中所在位置的號碼 (無雙引號)，如 1 代表第一欄，2 代表第二欄，依此類推。' },
            criteria: { name: '條件', detail: '必須。 這是含有您指定條件的儲存格範圍。 您可以使用任何的範圍做為準則引數，但範圍之中至少需含有一個欄標籤，而欄標籤之下至少需有一個儲存格，以指定該欄的準則。' },
        },
    },
};

export default locale;
