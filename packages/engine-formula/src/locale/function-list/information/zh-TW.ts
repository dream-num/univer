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
    CELL: {
        description: '傳回有關儲存格格式、位置或內容的資訊',
        abstract: '傳回有關儲存格格式、位置或內容的資訊',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: '資訊類型', detail: '指定所要傳回何種儲存格資訊類型的文字值。' },
            reference: { name: '參考', detail: '要取得其相關資訊的儲存格。' },
        },
    },
    ERROR_TYPE: {
        description: '傳回對應於錯誤類型的數字',
        abstract: '傳回對應於錯誤類型的數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: '錯誤值', detail: '要尋找之識別數字的錯誤值。' },
        },
    },
    INFO: {
        description: '傳回有關目前操作環境的資訊',
        abstract: '傳回目前操作環境的資訊',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: '類型文字', detail: '指定要傳回資訊類型的文字。' },
        },
    },
    ISBETWEEN: {
        description: '檢查提供的數字是否介於另外兩個值之間 (無論是否包含這兩個值)。',
        abstract: '檢查提供的數字是否介於另外兩個值之間 (無論是否包含這兩個值)。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/10538337?hl=zh-Hant',
            },
        ],
        functionParameter: {
            valueToCompare: { name: '比較值', detail: '要比較的值，以查看該值是否介於「lower_value」和「upper_value」之間。' },
            lowerValue: { name: '最小值', detail: '範圍的下限值，「value_to_compare」可能落在這個範圍內。' },
            upperValue: { name: '最大值', detail: '範圍的上限值，「value_to_compare」可能落在這個範圍內。' },
            lowerValueIsInclusive: { name: '包括最小值', detail: '用於指定「lower_value」這個值是否包含在範圍中 (預設是 TRUE)' },
            upperValueIsInclusive: { name: '包括最大值', detail: '用於指定「upper_value」這個值是否包含在範圍中 (預設是 TRUE)' },
        },
    },
    ISBLANK: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISDATE: {
        description: 'ISDATE 函式會針對特定值是否可轉換為日期傳回結果。',
        abstract: 'ISDATE 函式會針對特定值是否可轉換為日期傳回結果。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/9061381?hl=zh-Hant',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要驗證是否為日期的值。' },
        },
    },
    ISEMAIL: {
        description: '如要檢查值是否為有效的電子郵件地址，請使用 ISEMAIL 函式。這項檢查會確認值是否符合一般接受的電子郵件地址格式，但不會驗證該地址是否存在。',
        abstract: '如要檢查值是否為有效的電子郵件地址，請使用 ISEMAIL 函式。這項檢查會確認值是否符合一般接受的電子郵件地址格式，但不會驗證該地址是否存在。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3256503?hl=zh-Hant',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: 'ISEMAIL("johndoe@yourname.com")' },
        },
    },
    ISERR: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISERROR: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISEVEN: {
        description: '若數字為偶數，則傳回 TRUE',
        abstract: '若數字為偶數，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要測試的值。如果值不是整數，將被截尾取整。' },
        },
    },
    ISFORMULA: {
        description: '檢查是否有參照包含公式的儲存格，並傳回 TRUE 或 FALSE。',
        abstract: '檢查是否有參照包含公式的儲存格，並傳回 TRUE 或 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: '參照', detail: '必須。 參考是指你想測試的儲存格。 參考可以是儲存格參考、公式，或是指向儲存格的名稱。' },
        },
    },
    ISLOGICAL: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISNA: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISNONTEXT: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISNUMBER: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISODD: {
        description: '若數字為奇數，則傳回 TRUE',
        abstract: '若數字為奇數，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要測試的值。如果值不是整數，將被截尾取整。' },
        },
    },
    ISOMITTED: {
        description: '檢查 LAMBDA 中的值是否缺失，並傳回 TRUE 或 FALSE',
        abstract: '檢查 LAMBDA 中的值是否缺失，並傳回 TRUE 或 FALSE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: '引數', detail: '要檢查是否省略的值，例如 LAMBDA 參數。' },
        },
    },
    ISREF: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISTEXT: {
        description: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        abstract: '這些函數統稱為 IS 函數，每個函數都會檢查指定的值，並根據結果傳回 TRUE 或 FALSE。 例如，如果數值引數為空白儲存格的參照， ISBLANK 函數就會傳回邏輯值 TRUE；否則便傳回 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必須。 這是要檢定的值。 Value 引數可以是空的 (空白儲存格)、錯誤、邏輯值、文字、數字，或參照值，或是上述任何項目的名稱。' },
        },
    },
    ISURL: {
        description: '檢查特定值是否為有效的網址。',
        abstract: '檢查特定值是否為有效的網址。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3256501?hl=zh-Hant',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要驗證是否為網址的值。' },
        },
    },
    N: {
        description: '返回轉換為數字的值',
        abstract: '返回轉換為數字的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要轉換的值。' },
        },
    },
    NA: {
        description: '傳回錯誤值 #N/A',
        abstract: '傳回錯誤值 #N/A',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: '傳回引用工作表的工作表編號',
        abstract: '傳回引用工作表的工作表編號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要輸入工作表編號的工作表名稱或參照。 如果省略，SHEET 會傳回包含該函數的工作表編號。' },
        },
    },
    SHEETS: {
        description: '傳回工作簿中的工作表數',
        abstract: '傳回工作簿中的工作表數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: '傳回表示值的資料型別的數字',
        abstract: '傳回表示值的資料型別的數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '這可以是任何值，如數字、文字、邏輯值等。' },
        },
    },
};

export default locale;
